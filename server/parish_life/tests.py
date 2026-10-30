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

from .models import Activity, Highlight, ParishLifePage

MEDIA_ROOT = tempfile.mkdtemp()
PAGE = reverse('parish-life-page')
HIGHLIGHTS = reverse('parish-life-highlights-list')
ACTIVITIES = reverse('parish-life-activities-list')


def make_image(name='img.png'):
    buffer = io.BytesIO()
    Image.new('RGB', (20, 10), 'orange').save(buffer, 'PNG')
    return SimpleUploadedFile(name, buffer.getvalue(), content_type='image/png')


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class ParishLifeApiTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.staff = get_user_model().objects.create_user('admin@example.com', password='pass', is_staff=True)
        # Migration 0004 seeds the default highlights; start each test from none.
        Highlight.objects.all().delete()

    def test_migration_seeds_default_highlights(self):
        # (setUp cleared them; check the migration's list is what the page showed before.)
        from importlib import import_module

        seeded = import_module('parish_life.migrations.0004_move_sections_to_page').DEFAULT_HIGHLIGHTS
        self.assertEqual([title for title, _, _ in seeded][:2], ['Worship', 'Parish Groups'])

    def test_page_defaults_and_nested_cards(self):
        Highlight.objects.create(title='Worship', text='Mass', icon='church')
        Activity.objects.create(title='Rosary', short_description='Weekly', content='C')
        Activity.objects.create(title='Draft', short_description='x', content='C', is_published=False)

        data = self.client.get(PAGE).data
        self.assertEqual(data['hero_title'], 'Parish Life')
        self.assertEqual([h['title'] for h in data['highlights']], ['Worship'])
        self.assertEqual([a['title'] for a in data['activities']], ['Rosary'])

        self.client.force_authenticate(self.staff)
        self.assertEqual(len(self.client.get(PAGE).data['activities']), 2)

    def test_page_update_text_and_images(self):
        self.assertEqual(self.client.patch(PAGE, {'hero_title': 'X'}).status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(self.staff)
        response = self.client.patch(
            PAGE, {'hero_title': ' Life ', 'intro_text': '<p>A</p><p>B</p>', 'intro_image': make_image()}, format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['hero_title'], 'Life')
        self.assertEqual(response.data['intro_text'], 'A\n\nB')
        name = ParishLifePage.load().intro_image.name
        response = self.client.patch(PAGE, {'remove_intro_image': 'true'}, format='multipart')
        self.assertIsNone(response.data['intro_image'])
        self.assertFalse(ParishLifePage._meta.get_field('intro_image').storage.exists(name))
        self.assertEqual(self.client.patch(PAGE, {'hero_title': '  '}, format='json').status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.client.put(PAGE, {}, format='json').status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_highlight_crud_and_reorder(self):
        self.client.force_authenticate(self.staff)
        a = self.client.post(HIGHLIGHTS, {'title': 'Worship', 'text': 'Mass', 'icon': 'church'}, format='json').data
        b = self.client.post(HIGHLIGHTS, {'title': 'Music', 'text': 'Choir', 'icon': 'music'}, format='json').data
        self.assertEqual(self.client.post(HIGHLIGHTS, {'title': 'X', 'text': 'Y', 'icon': 'rocket'}, format='json').status_code, 400)
        self.client.post(reverse('parish-life-highlights-reorder'), {'ids': [b['id'], a['id']]}, format='json')
        self.assertEqual([h['title'] for h in self.client.get(HIGHLIGHTS).data], ['Music', 'Worship'])
        self.client.patch(reverse('parish-life-highlights-detail', args=[a['id']]), {'text': 'Holy Mass'}, format='json')
        self.assertEqual(Highlight.objects.get(pk=a['id']).text, 'Holy Mass')
        self.assertEqual(self.client.delete(reverse('parish-life-highlights-detail', args=[b['id']])).status_code, 204)

    def test_activity_crud_with_image_and_visibility(self):
        self.client.force_authenticate(self.staff)
        storage = Activity._meta.get_field('image').storage
        response = self.client.post(
            ACTIVITIES,
            {'title': 'Bible Sharing', 'short_description': 'Weekly', 'content': 'Body', 'image': make_image(), 'is_published': 'false'},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        pk = response.data['id']
        name = Activity.objects.get(pk=pk).image.name
        self.assertEqual(self.client.post(ACTIVITIES, {'title': 'X', 'short_description': 'Y', 'content': ''}, format='json').status_code, 400)

        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(ACTIVITIES).data, [])
        self.client.force_authenticate(self.staff)

        self.assertEqual(self.client.delete(reverse('parish-life-activities-detail', args=[pk])).status_code, 204)
        self.assertFalse(storage.exists(name), 'image is deleted with the card')
