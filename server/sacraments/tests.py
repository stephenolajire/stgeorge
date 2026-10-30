import io
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Sacrament, SacramentFeature, SacramentsPage

MEDIA_ROOT = tempfile.mkdtemp()
LIST = reverse('sacraments-list')
PAGE = reverse('sacraments-page')
FEATURES = reverse('sacrament-features-list')


def detail(pk):
    return reverse('sacraments-detail', args=[pk])


def make_image(name='img.png'):
    buffer = io.BytesIO()
    Image.new('RGB', (20, 10), 'gold').save(buffer, 'PNG')
    return SimpleUploadedFile(name, buffer.getvalue(), content_type='image/png')


def sacrament(title, **extra):
    return Sacrament.objects.create(title=title, short_description='Short', content='Body', **extra)


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class SacramentApiTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.staff = get_user_model().objects.create_user('admin@example.com', password='pass', is_staff=True)

    def test_public_sees_published_in_order_and_cannot_write(self):
        sacrament('Baptism')
        sacrament('Hidden', is_published=False)
        sacrament('Confirmation')
        self.assertEqual([s['title'] for s in self.client.get(LIST).data], ['Baptism', 'Confirmation'])
        self.assertEqual(self.client.get(LIST, {'status': 'draft'}).data[0]['title'], 'Baptism')
        self.assertEqual(self.client.post(LIST, {}).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_search_and_status_filter(self):
        self.client.force_authenticate(self.staff)
        sacrament('Baptism')
        sacrament('Matrimony', is_published=False)
        self.assertEqual(len(self.client.get(LIST).data), 2)
        self.assertEqual([s['title'] for s in self.client.get(LIST, {'status': 'draft'}).data], ['Matrimony'])
        self.assertEqual([s['title'] for s in self.client.get(LIST, {'search': 'bapt'}).data], ['Baptism'])

    def test_crud_with_image(self):
        self.client.force_authenticate(self.staff)
        storage = Sacrament._meta.get_field('image').storage
        response = self.client.post(
            LIST,
            {'title': ' Baptism ', 'short_description': 'New birth', 'content': '<p>One</p><p>Two</p>', 'image': make_image()},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['title'], 'Baptism')
        self.assertEqual(response.data['content'], 'One\n\nTwo')
        pk = response.data['id']
        first = Sacrament.objects.get(pk=pk).image.name

        self.client.patch(detail(pk), {'image': make_image('b.png')}, format='multipart')
        self.assertFalse(storage.exists(first), 'replaced image is deleted')
        second = Sacrament.objects.get(pk=pk).image.name

        response = self.client.patch(detail(pk), {'remove_image': 'true', 'is_published': 'false'}, format='multipart')
        self.assertIsNone(response.data['image'])
        self.assertFalse(response.data['is_published'])
        self.assertFalse(storage.exists(second))

        self.client.patch(detail(pk), {'image': make_image('c.png')}, format='multipart')
        third = Sacrament.objects.get(pk=pk).image.name
        self.assertEqual(self.client.delete(detail(pk)).status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(storage.exists(third), 'image is deleted with the sacrament')

    def test_required_fields(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(LIST, {'title': ' ', 'short_description': '', 'content': ''}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reorder(self):
        self.client.force_authenticate(self.staff)
        a, b, c = sacrament('A'), sacrament('B'), sacrament('C')
        response = self.client.post(reverse('sacraments-reorder'), {'ids': [c.id, a.id, b.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual([s['title'] for s in self.client.get(LIST).data], ['C', 'A', 'B'])


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class SacramentsPageApiTests(APITestCase):
    def setUp(self):
        self.staff = get_user_model().objects.create_user('admin@example.com', password='pass', is_staff=True)

    def test_page_defaults_and_seeded_features(self):
        data = self.client.get(PAGE).data
        self.assertEqual(data['hero_title'], 'The Sacraments')
        self.assertEqual(data['quote_source'], 'Catechism of the Catholic Church')
        self.assertEqual([f['title'] for f in data['features']][:2], ['Scripture Foundation', 'Celebrated by the Church'])

    def test_page_update_and_permissions(self):
        self.assertEqual(self.client.patch(PAGE, {'cta_title': 'X'}).status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(self.staff)
        response = self.client.patch(PAGE, {'cta_title': ' Come ', 'hero_image': make_image()}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['cta_title'], 'Come')
        name = SacramentsPage.load().hero_image.name
        response = self.client.patch(PAGE, {'remove_hero_image': 'true'}, format='multipart')
        self.assertIsNone(response.data['hero_image'])
        self.assertFalse(SacramentsPage._meta.get_field('hero_image').storage.exists(name))
        self.assertEqual(self.client.patch(PAGE, {'hero_title': ''}, format='json').status_code, 400)

    def test_page_and_features_urls_are_not_taken_as_ids(self):
        self.assertEqual(self.client.get(PAGE).status_code, 200)
        self.assertEqual(self.client.get(FEATURES).status_code, 200)
        self.assertEqual(self.client.get(detail(999)).status_code, 404)

    def test_features_crud_and_reorder(self):
        SacramentFeature.objects.all().delete()
        self.client.force_authenticate(self.staff)
        a = self.client.post(FEATURES, {'title': 'A', 'text': 'x', 'icon': 'book'}, format='json').data
        b = self.client.post(FEATURES, {'title': 'B', 'text': 'y', 'icon': 'heart'}, format='json').data
        self.client.post(reverse('sacrament-features-reorder'), {'ids': [b['id'], a['id']]}, format='json')
        self.assertEqual([f['title'] for f in self.client.get(PAGE).data['features']], ['B', 'A'])

    def test_sacrament_icon(self):
        self.client.force_authenticate(self.staff)
        ok = self.client.post(LIST, {'title': 'Baptism', 'icon': 'water', 'short_description': 's', 'content': 'c'}, format='json')
        self.assertEqual(ok.data['icon'], 'water')
        bad = self.client.post(LIST, {'title': 'X', 'icon': 'rocket', 'short_description': 's', 'content': 'c'}, format='json')
        self.assertEqual(bad.status_code, 400)
