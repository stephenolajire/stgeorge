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

from .models import ParishGroup

MEDIA_ROOT = tempfile.mkdtemp()
LIST = reverse('parish-groups-list')


def make_image():
    buffer = io.BytesIO()
    Image.new('RGB', (8, 6), 'blue').save(buffer, 'PNG')
    return SimpleUploadedFile('g.png', buffer.getvalue(), content_type='image/png')


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class ParishGroupApiTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def test_public_sees_active_groups_in_order(self):
        ParishGroup.objects.create(name='Choir', description='Music')
        ParishGroup.objects.create(name='Hidden', description='x', is_active=False)
        ParishGroup.objects.create(name='CWO', description='Women')
        self.assertEqual([g['name'] for g in self.client.get(LIST).data], ['Choir', 'CWO'])
        self.assertEqual(self.client.post(LIST, {}).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_crud_with_image(self):
        self.client.force_authenticate(get_user_model().objects.create_user('a@example.com', password='p', is_staff=True))
        response = self.client.post(LIST, {'name': 'Altar Servers', 'description': 'Serving', 'image': make_image()}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        pk = response.data['id']
        name = ParishGroup.objects.get(pk=pk).image.name
        response = self.client.patch(reverse('parish-groups-detail', args=[pk]), {'remove_image': 'true'}, format='multipart')
        self.assertIsNone(response.data['image'])
        self.assertFalse(ParishGroup._meta.get_field('image').storage.exists(name))
        self.assertEqual(self.client.delete(reverse('parish-groups-detail', args=[pk])).status_code, status.HTTP_204_NO_CONTENT)

    def test_reorder(self):
        self.client.force_authenticate(get_user_model().objects.create_user('b@example.com', password='p', is_staff=True))
        a = ParishGroup.objects.create(name='A', description='x')
        b = ParishGroup.objects.create(name='B', description='x')
        response = self.client.post(reverse('parish-groups-reorder'), {'ids': [b.id, a.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual([g['name'] for g in self.client.get(LIST).data], ['B', 'A'])
