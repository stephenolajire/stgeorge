import io
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APITestCase

from .models import HomePage, QuickLink, Subscriber

MEDIA_ROOT = tempfile.mkdtemp()
PAGE = reverse('home-page')
SUBSCRIBE = reverse('subscribers-subscribe')


def png():
    b = io.BytesIO()
    Image.new('RGB', (8, 6), 'blue').save(b, 'PNG')
    return SimpleUploadedFile('h.png', b.getvalue(), content_type='image/png')


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class HomeApiTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        cache.clear()  # throttle counts
        self.staff = get_user_model().objects.create_user('a@example.com', password='p', is_staff=True)

    def test_page_has_design_defaults_and_seeded_cards(self):
        data = self.client.get(PAGE).data
        self.assertEqual(data['hero_title'], 'St. George Catholic Church, Ofatedo')
        self.assertEqual([h['title'] for h in data['highlights']], ['Worship', 'Community', 'Service', 'Growth'])
        self.assertEqual([link['target'] for link in data['links']], ['mass_times', 'sacraments', 'parish_life'])

    def test_only_staff_edit_and_text_is_plain(self):
        self.assertEqual(self.client.patch(PAGE, {'hero_title': 'X'}, format='json').status_code, 401)
        self.client.force_authenticate(self.staff)
        r = self.client.patch(PAGE, {'about_text': '<p>One</p><p>Two</p>', 'hero_image': png()}, format='multipart')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['about_text'], 'One\n\nTwo')
        name = HomePage.load().hero_image.name
        self.client.patch(PAGE, {'remove_hero_image': 'true'}, format='multipart')
        self.assertFalse(HomePage._meta.get_field('hero_image').storage.exists(name))
        self.assertEqual(self.client.patch(PAGE, {'hero_title': ' '}, format='json').status_code, 400)

    def test_quick_link_crud(self):
        self.client.force_authenticate(self.staff)
        url = reverse('home-links-list')
        r = self.client.post(url, {'title': 'Gallery', 'text': 'Photos', 'link_label': 'See', 'target': 'gallery', 'image': png()}, format='multipart')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(self.client.post(url, {'title': 'a', 'text': 'b', 'link_label': 'c', 'target': 'nowhere'}).status_code, 400)
        link = QuickLink.objects.get(pk=r.data['id'])
        name = link.image.name
        self.assertEqual(self.client.delete(reverse('home-links-detail', args=[link.id])).status_code, 204)
        self.assertFalse(QuickLink._meta.get_field('image').storage.exists(name))

    def test_subscribe(self):
        self.assertEqual(self.client.post(SUBSCRIBE, {'email': ' Ada@Example.com '}).status_code, 201)
        self.assertEqual(self.client.post(SUBSCRIBE, {'email': 'ada@example.com'}).status_code, 201)  # again: no error
        self.assertEqual(self.client.post(SUBSCRIBE, {'email': 'bot@example.com', 'website': 'x'}).status_code, 201)
        self.assertEqual(self.client.post(SUBSCRIBE, {'email': 'nope'}).status_code, 400)
        self.assertEqual(list(Subscriber.objects.values_list('email', flat=True)), ['ada@example.com'])
        self.assertEqual(self.client.post(SUBSCRIBE, {'email': 'c@example.com'}).status_code, 201)
        self.assertEqual(self.client.post(SUBSCRIBE, {'email': 'd@example.com'}).status_code, 429)  # 5 per hour

    def test_subscriber_list_is_staff_only(self):
        Subscriber.objects.create(email='ada@example.com')
        url = reverse('subscribers-list')
        self.assertEqual(self.client.get(url).status_code, 401)
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.get(url, {'search': 'ada'}).data['count'], 1)
        csv = self.client.get(reverse('subscribers-export'))
        self.assertIn('ada@example.com', csv.content.decode())
