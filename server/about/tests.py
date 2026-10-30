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

from .models import AboutPage

MEDIA_ROOT = tempfile.mkdtemp()


def make_image(name='photo.png'):
    buffer = io.BytesIO()
    Image.new('RGB', (10, 10), 'blue').save(buffer, 'PNG')
    return SimpleUploadedFile(name, buffer.getvalue(), content_type='image/png')


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class AboutPageApiTests(APITestCase):
    url = reverse('about-page')

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.staff = get_user_model().objects.create_user('admin@example.com', password='pass', is_staff=True)
        self.member = get_user_model().objects.create_user('member@example.com', password='pass')

    def test_anyone_can_read_default_content(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['hero_title'], 'About Our Parish')
        self.assertIsNone(response.data['hero_image'])

    def test_anonymous_and_non_staff_cannot_update(self):
        self.assertEqual(self.client.patch(self.url, {'hero_title': 'X'}).status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.patch(self.url, {'hero_title': 'X'}).status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_can_update_text(self):
        self.client.force_authenticate(self.staff)
        response = self.client.patch(self.url, {'hero_title': 'Welcome', 'established': '2001'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        page = AboutPage.load()
        self.assertEqual(page.hero_title, 'Welcome')
        self.assertEqual(page.established, '2001')
        self.assertEqual(AboutPage.objects.count(), 1)

    def test_established_must_be_four_digits(self):
        self.client.force_authenticate(self.staff)
        response = self.client.patch(self.url, {'established': '98'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_replace_and_remove_image(self):
        self.client.force_authenticate(self.staff)
        storage = AboutPage._meta.get_field('hero_image').storage

        response = self.client.patch(self.url, {'hero_image': make_image('one.png')}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['hero_image'].startswith('http://testserver/media/about/'))
        first = AboutPage.load().hero_image.name

        self.client.patch(self.url, {'hero_image': make_image('two.png')}, format='multipart')
        second = AboutPage.load().hero_image.name
        self.assertNotEqual(first, second)
        self.assertFalse(storage.exists(first), 'replaced file should be deleted')

        response = self.client.patch(self.url, {'remove_hero_image': 'true'}, format='multipart')
        self.assertIsNone(response.data['hero_image'])
        self.assertFalse(storage.exists(second), 'removed file should be deleted')


class PlainTextTests(APITestCase):
    url = reverse('about-page')

    def setUp(self):
        self.client.force_authenticate(
            get_user_model().objects.create_user('admin@example.com', password='pass', is_staff=True)
        )

    def test_html_is_stripped_and_paragraphs_kept(self):
        response = self.client.patch(
            self.url,
            {
                'description': '<p>First <strong>bold</strong> line.</p><p>Second &amp; last.</p>',
                'mission': 'Line one<br>Line two',
                'hero_title': '<script>alert(1)</script>Welcome',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], 'First bold line.\n\nSecond & last.')
        self.assertEqual(response.data['mission'], 'Line one\nLine two')
        self.assertNotIn('<', response.data['hero_title'])

    def test_plain_text_is_kept_as_typed(self):
        text = 'Mass at 9am.\n\nAll are welcome, young & old (ages 5 < 95).'
        response = self.client.patch(self.url, {'vision': text}, format='json')
        self.assertEqual(response.data['vision'], text)

    def test_put_is_not_allowed(self):
        self.assertEqual(self.client.put(self.url, {}, format='json').status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class AboutAdminTests(APITestCase):
    def test_admin_list_opens_the_edit_form(self):
        self.client.force_login(get_user_model().objects.create_superuser('boss@example.com', password='pass'))
        response = self.client.get(reverse('admin:about_aboutpage_changelist'))
        self.assertRedirects(response, reverse('admin:about_aboutpage_change', args=[1]))
        page = self.client.get(response['Location'])
        self.assertContains(page, 'Hero section')
        self.assertContains(page, 'No image')


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class HistoryValuesPatronTests(APITestCase):
    url = reverse('about-page')

    def setUp(self):
        self.client.force_authenticate(
            get_user_model().objects.create_user('admin@example.com', password='pass', is_staff=True)
        )

    def test_defaults_are_filled(self):
        data = self.client.get(self.url).data
        self.assertEqual(data['history_title'], 'A Journey of Faith')
        self.assertIn('Faith in Christ', data['core_values'].splitlines())
        self.assertTrue(data['patron'].startswith('St. George the Martyr'))
        self.assertIsNone(data['history_image'])

    def test_update_text_and_tidy_core_values(self):
        response = self.client.patch(
            self.url,
            {
                'core_values': '  Faith  \n\n Hope\n   \nCharity ',
                'patron': 'St. George',
                'history_title': 'Our Story',
                'history': 'Founded long ago.\n\nStill growing.',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['core_values'], 'Faith\nHope\nCharity')
        self.assertEqual(response.data['history'], 'Founded long ago.\n\nStill growing.')
        self.assertEqual(response.data['history_title'], 'Our Story')

    def test_history_image_upload_and_remove(self):
        response = self.client.patch(self.url, {'history_image': make_image('h.png')}, format='multipart')
        self.assertIn('/media/about/', response.data['history_image'])
        name = AboutPage.load().history_image.name
        response = self.client.patch(self.url, {'remove_history_image': 'true'}, format='multipart')
        self.assertIsNone(response.data['history_image'])
        self.assertFalse(AboutPage._meta.get_field('history_image').storage.exists(name))
