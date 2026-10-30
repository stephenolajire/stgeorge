import io
import shutil
import tempfile
from datetime import date, timedelta
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from .models import GalleryPage, Photo, normalize_tags

MEDIA_ROOT = tempfile.mkdtemp()
LIST = reverse('gallery-list')


def png(name='p.png'):
    buffer = io.BytesIO()
    Image.new('RGB', (12, 8), 'teal').save(buffer, 'PNG')
    return SimpleUploadedFile(name, buffer.getvalue(), content_type='image/png')


def photo(title, category='others', days_ago=0, **extra):
    p = Photo(title=title, category=category, date_taken=date.today() - timedelta(days=days_ago), **extra)
    buffer = io.BytesIO()
    Image.new('RGB', (4, 4)).save(buffer, 'PNG')
    p.image.save('t.png', ContentFile(buffer.getvalue()), save=False)
    p.save()
    return p


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class GalleryApiTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.staff = get_user_model().objects.create_user('admin@example.com', password='pass', is_staff=True)

    def storage(self):
        return Photo._meta.get_field('image').storage

    def test_tags_are_tidied(self):
        self.assertEqual(normalize_tags(' mass,  Worship , MASS,, altar '), 'mass, Worship, altar')

    def test_public_can_read_but_not_write(self):
        photo('Sunday Mass')
        self.assertEqual(self.client.get(LIST).data['count'], 1)
        self.assertEqual(self.client.post(LIST, {}).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.post(reverse('gallery-upload'), {}).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_filters_search_sort_and_pagination(self):
        for i in range(13):
            photo(f'Mass {i}', 'mass_liturgy', days_ago=i)
        photo('Youth Week', 'youth', days_ago=200, tags='camp, retreat')

        self.assertEqual(len(self.client.get(LIST).data['results']), 12)
        self.assertEqual(len(self.client.get(LIST, {'page_size': 24}).data['results']), 14)
        self.assertEqual(self.client.get(LIST, {'category': 'youth'}).data['count'], 1)
        self.assertEqual(self.client.get(LIST, {'search': 'retreat'}).data['results'][0]['title'], 'Youth Week')
        self.assertEqual(self.client.get(LIST, {'date': '3months'}).data['count'], 13)
        self.assertEqual(self.client.get(LIST).data['results'][0]['title'], 'Mass 0')
        self.assertEqual(self.client.get(LIST, {'ordering': 'oldest'}).data['results'][0]['title'], 'Youth Week')
        self.assertEqual(self.client.get(LIST, {'ordering': 'title'}).data['results'][0]['title'], 'Mass 0')

    def test_summary_counts(self):
        photo('A', 'youth')
        photo('B', 'youth')
        photo('C', 'community')
        data = self.client.get(reverse('gallery-summary')).data
        self.assertEqual(data['counts']['all'], 3)
        self.assertEqual(data['counts']['youth'], 2)
        self.assertEqual(data['counts']['others'], 0)
        self.assertIn({'value': 'mass_liturgy', 'label': 'Mass & Liturgy'}, data['categories'])

    def test_upload_several_photos(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            reverse('gallery-upload'),
            {'files': [png('IMG_01 sunday-mass.png'), png('choir.png')], 'category': 'mass_liturgy', 'date_taken': '2026-10-29'},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual([p['title'] for p in response.data], ['IMG 01 sunday mass', 'choir'])
        self.assertTrue(all(p['category'] == 'mass_liturgy' and p['date_taken'] == '2026-10-29' for p in response.data))

    def test_upload_rejects_bad_files_and_saves_nothing(self):
        self.client.force_authenticate(self.staff)
        gif = io.BytesIO()
        Image.new('RGB', (4, 4)).save(gif, 'GIF')
        response = self.client.post(
            reverse('gallery-upload'),
            {'files': [png('ok.png'), SimpleUploadedFile('bad.gif', gif.getvalue(), content_type='image/gif')]},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('bad.gif', response.data['files'][0])
        self.assertEqual(Photo.objects.count(), 0)
        with mock.patch('core.validators.MaxFileSizeValidator.__call__', side_effect=__import__('django').core.exceptions.ValidationError('The image must be 10 MB or smaller.')):
            big = self.client.post(reverse('gallery-upload'), {'files': [png()]}, format='multipart')
        self.assertIn('10 MB', big.data['files'][0])

    def test_edit_replace_image_and_delete(self):
        self.client.force_authenticate(self.staff)
        p = photo('Old')
        old = p.image.name
        url = reverse('gallery-detail', args=[p.id])
        response = self.client.patch(url, {'title': ' Sunday Mass ', 'tags': 'a, b, a', 'image': png('new.png')}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual((response.data['title'], response.data['tags']), ('Sunday Mass', 'a, b'))
        self.assertFalse(self.storage().exists(old), 'replaced image is deleted')
        new = Photo.objects.get(pk=p.id).image.name
        self.assertEqual(self.client.delete(url).status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.storage().exists(new))

    def test_bulk_move_and_delete(self):
        self.client.force_authenticate(self.staff)
        a, b, c = photo('A'), photo('B'), photo('C')
        moved = self.client.post(reverse('gallery-bulk-move'), {'ids': [a.id, b.id], 'category': 'youth'}, format='json')
        self.assertEqual(moved.data, {'moved': 2})
        self.assertEqual(Photo.objects.filter(category='youth').count(), 2)

        files = [a.image.name, b.image.name]
        with self.captureOnCommitCallbacks(execute=True):
            deleted = self.client.post(reverse('gallery-bulk-delete'), {'ids': [a.id, b.id]}, format='json')
        self.assertEqual(deleted.data, {'deleted': 2})
        self.assertEqual(list(Photo.objects.values_list('title', flat=True)), ['C'])
        self.assertFalse(any(self.storage().exists(f) for f in files))


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class PublicGalleryApiTests(APITestCase):
    def test_categories_with_cover_and_count(self):
        photo('Old mass', 'mass_liturgy', days_ago=5)
        newest = photo('New mass', 'mass_liturgy', days_ago=0)
        photo('Youth', 'youth')
        data = self.client.get(reverse('gallery-categories')).data
        self.assertEqual([c['value'] for c in data], ['mass_liturgy', 'youth'])  # empty categories are left out
        self.assertEqual(data[0]['count'], 2)
        self.assertTrue(data[0]['cover'].endswith(newest.image.url))

    def test_albums_group_by_day_newest_first(self):
        photo('A', 'mass_liturgy', days_ago=0)
        photo('B', 'mass_liturgy', days_ago=0)
        photo('C', 'mass_liturgy', days_ago=3)
        photo('Other', 'youth', days_ago=0)
        data = self.client.get(reverse('gallery-albums'), {'category': 'mass_liturgy'}).data
        self.assertEqual([(str(a['date']), a['count']) for a in data], [(str(date.today()), 2), (str(date.today() - timedelta(days=3)), 1)])
        self.assertEqual(self.client.get(reverse('gallery-albums'), {'category': 'nope'}).status_code, 400)

    def test_photos_of_one_day_for_the_slideshow(self):
        photo('A', 'mass_liturgy', days_ago=0)
        photo('B', 'mass_liturgy', days_ago=1)
        data = self.client.get(LIST, {'category': 'mass_liturgy', 'date_taken': str(date.today()), 'page_size': 200}).data
        self.assertEqual([p['title'] for p in data['results']], ['A'])

    def test_page_content(self):
        self.assertEqual(self.client.get(reverse('gallery-page')).data['hero_title'], 'Gallery')
        self.assertEqual(self.client.patch(reverse('gallery-page'), {'cta_title': 'X'}).status_code, 401)
        self.client.force_authenticate(get_user_model().objects.create_user('s@example.com', password='p', is_staff=True))
        response = self.client.patch(reverse('gallery-page'), {'cta_title': ' Many ', 'hero_image': png()}, format='multipart')
        self.assertEqual(response.data['cta_title'], 'Many')
        self.assertIsNotNone(response.data['hero_image'])
        self.assertEqual(GalleryPage.objects.count(), 1)
