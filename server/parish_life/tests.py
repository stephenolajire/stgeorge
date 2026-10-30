import io
import shutil
import tempfile
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from core.validators import MaxFileSizeValidator

from .models import Section

MEDIA_ROOT = tempfile.mkdtemp()
LIST = reverse('parish-life-list')


def detail(pk):
    return reverse('parish-life-detail', args=[pk])


def make_image(name='img.png'):
    buffer = io.BytesIO()
    Image.new('RGB', (20, 10), 'orange').save(buffer, 'PNG')
    return SimpleUploadedFile(name, buffer.getvalue(), content_type='image/png')


def section(title, **extra):
    return Section.objects.create(title=title, short_description='Short', content='Body', **extra)


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class SectionApiTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.staff = get_user_model().objects.create_user('admin@example.com', password='pass', is_staff=True)

    def test_order_appends_and_list_is_ordered(self):
        a, b = section('A'), section('B')
        self.assertGreater(b.order, a.order)
        self.client.force_authenticate(self.staff)
        self.assertEqual([s['title'] for s in self.client.get(LIST).data], ['A', 'B'])

    def test_public_sees_only_published_and_cannot_write(self):
        section('Live')
        draft = section('Draft', is_published=False)
        self.assertEqual([s['title'] for s in self.client.get(LIST).data], ['Live'])
        self.assertEqual(self.client.get(detail(draft.pk)).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.post(LIST, {}).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_create_update_image_and_delete(self):
        self.client.force_authenticate(self.staff)
        storage = Section._meta.get_field('image').storage
        response = self.client.post(
            LIST,
            {'title': ' Overview ', 'short_description': 'Intro', 'content': '<p>One</p><p>Two</p>', 'image': make_image()},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['title'], 'Overview')
        self.assertEqual(response.data['content'], 'One\n\nTwo')
        pk = response.data['id']
        first = Section.objects.get(pk=pk).image.name

        self.client.patch(detail(pk), {'image': make_image('b.png')}, format='multipart')
        self.assertFalse(storage.exists(first), 'replaced image is deleted')
        second = Section.objects.get(pk=pk).image.name

        response = self.client.patch(detail(pk), {'remove_image': 'true', 'is_published': 'false'}, format='multipart')
        self.assertIsNone(response.data['image'])
        self.assertFalse(response.data['is_published'])
        self.assertFalse(storage.exists(second))

        self.assertEqual(self.client.delete(detail(pk)).status_code, status.HTTP_204_NO_CONTENT)

    def test_required_fields(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(LIST, {'title': '   ', 'short_description': '', 'content': ''}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue({'title', 'short_description', 'content'} & set(response.data))

    def test_image_type_and_size(self):
        self.client.force_authenticate(self.staff)
        gif = io.BytesIO()
        Image.new('RGB', (5, 5)).save(gif, 'GIF')
        data = {'title': 'T', 'short_description': 'S', 'content': 'C'}
        bad = self.client.post(LIST, {**data, 'image': SimpleUploadedFile('a.gif', gif.getvalue())}, format='multipart')
        self.assertIn('image', bad.data)

        # The 5 MB limit is enforced by the field's validator.
        validator = MaxFileSizeValidator(5)
        validator(mock.Mock(size=5 * 1024 * 1024))
        with self.assertRaisesMessage(ValidationError, '5 MB'):
            validator(mock.Mock(size=5 * 1024 * 1024 + 1))
        self.assertIn(validator, Section._meta.get_field('image').validators)

    def test_reorder(self):
        self.client.force_authenticate(self.staff)
        a, b, c = section('A'), section('B'), section('C')
        response = self.client.post(reverse('parish-life-reorder'), {'ids': [c.id, a.id, b.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual([s['title'] for s in self.client.get(LIST).data], ['C', 'A', 'B'])
        bad = self.client.post(reverse('parish-life-reorder'), {'ids': [a.id, a.id]}, format='json')
        self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)
