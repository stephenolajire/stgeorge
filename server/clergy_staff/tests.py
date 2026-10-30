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

from .models import Member

MEDIA_ROOT = tempfile.mkdtemp()
LIST = reverse('clergy-staff-list')


def detail(pk):
    return reverse('clergy-staff-detail', args=[pk])


def make_photo(name='photo.png', size=(10, 10)):
    buffer = io.BytesIO()
    Image.new('RGB', size, 'blue').save(buffer, 'PNG')
    return SimpleUploadedFile(name, buffer.getvalue(), content_type='image/png')


def member(name, role='parish_priest', **extra):
    return Member.objects.create(full_name=name, role=role, short_bio='Bio', **extra)


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class MemberApiTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.staff = get_user_model().objects.create_user('admin@example.com', password='pass', is_staff=True)

    def test_category_follows_role_and_order_appends(self):
        a = member('A')
        b = member('B', role='religious_sister')
        self.assertEqual(a.category, 'clergy')
        self.assertEqual(b.category, 'religious')
        self.assertGreater(b.order, a.order)
        b.role = 'parish_secretary'
        b.save(update_fields=['role'])
        b.refresh_from_db()
        self.assertEqual(b.category, 'staff')

    def test_public_sees_only_active_and_cannot_write(self):
        member('Visible')
        member('Hidden', is_active=False)
        response = self.client.get(LIST, {'status': 'inactive'})
        self.assertEqual([m['full_name'] for m in response.data['results']], ['Visible'])
        self.assertEqual(self.client.post(LIST, {}).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(reverse('clergy-staff-summary')).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_filters_search_and_pagination(self):
        self.client.force_authenticate(self.staff)
        for i in range(11):
            member(f'Priest {i}')
        member('Sister Ann', role='religious_sister', is_active=False)

        page1 = self.client.get(LIST).data
        self.assertEqual(page1['count'], 12)
        self.assertEqual(len(page1['results']), 10)
        self.assertEqual(len(self.client.get(LIST, {'page': 2}).data['results']), 2)

        self.assertEqual(self.client.get(LIST, {'category': 'religious'}).data['count'], 1)
        self.assertEqual(self.client.get(LIST, {'status': 'inactive'}).data['count'], 1)
        self.assertEqual(self.client.get(LIST, {'role': 'religious_sister'}).data['count'], 1)
        self.assertEqual(self.client.get(LIST, {'search': 'ann'}).data['count'], 1)

    def test_summary_counts_and_roles(self):
        self.client.force_authenticate(self.staff)
        member('P1')
        member('S1', role='religious_sister')
        member('T1', role='parish_secretary', is_active=False)
        data = self.client.get(reverse('clergy-staff-summary')).data
        self.assertEqual(data['counts'], {'all': 3, 'clergy': 1, 'religious': 1, 'staff': 1, 'inactive': 1})
        self.assertIn({'value': 'parish_priest', 'label': 'Parish Priest', 'category': 'clergy'}, data['roles'])

    def test_create_update_with_photo_and_delete(self):
        self.client.force_authenticate(self.staff)
        storage = Member._meta.get_field('photo').storage
        response = self.client.post(
            LIST,
            {'full_name': '  Rev. Fr. New  ', 'role': 'chaplain', 'short_bio': 'Chaplain', 'photo': make_photo()},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['full_name'], 'Rev. Fr. New')
        self.assertEqual(response.data['role_label'], 'Chaplain')
        pk = response.data['id']
        first_photo = Member.objects.get(pk=pk).photo.name

        response = self.client.patch(detail(pk), {'photo': make_photo('b.png')}, format='multipart')
        self.assertFalse(storage.exists(first_photo), 'replaced photo is deleted')

        response = self.client.patch(detail(pk), {'remove_photo': 'true', 'is_active': 'false'}, format='multipart')
        self.assertIsNone(response.data['photo'])
        self.assertFalse(response.data['is_active'])

        self.assertEqual(self.client.delete(detail(pk)).status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Member.objects.filter(pk=pk).exists())

    def test_photo_must_be_jpg_or_png_and_small(self):
        self.client.force_authenticate(self.staff)
        gif = io.BytesIO()
        Image.new('RGB', (5, 5)).save(gif, 'GIF')
        bad = SimpleUploadedFile('a.gif', gif.getvalue(), content_type='image/gif')
        response = self.client.post(
            LIST, {'full_name': 'X', 'role': 'chaplain', 'short_bio': 'X', 'photo': bad}, format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('photo', response.data)

        with self.settings(), self.subTest('size'):
            from core import validators

            original = validators.MAX_PHOTO_SIZE
            validators.MAX_PHOTO_SIZE = 10
            try:
                response = self.client.post(
                    LIST, {'full_name': 'X', 'role': 'chaplain', 'short_bio': 'X', 'photo': make_photo()}, format='multipart'
                )
            finally:
                validators.MAX_PHOTO_SIZE = original
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_required_fields_and_invalid_role(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(LIST, {'role': 'pope'}, format='json')
        self.assertEqual(set(response.data), {'full_name', 'role', 'short_bio'})

    def test_reorder(self):
        self.client.force_authenticate(self.staff)
        a, b, c = member('A'), member('B'), member('C')
        response = self.client.post(reverse('clergy-staff-reorder'), {'ids': [c.id, a.id, b.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        names = [m['full_name'] for m in self.client.get(LIST).data['results']]
        self.assertEqual(names, ['C', 'A', 'B'])

        bad = self.client.post(reverse('clergy-staff-reorder'), {'ids': [a.id, 9999]}, format='json')
        self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)
