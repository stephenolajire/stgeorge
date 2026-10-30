import io
import shutil
import tempfile
from datetime import date

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APITestCase

from .models import Project

MEDIA_ROOT = tempfile.mkdtemp()
LIST = reverse('projects-list')


def png(size=(8, 6)):
    b = io.BytesIO()
    Image.new('RGB', size, 'green').save(b, 'PNG')
    return SimpleUploadedFile('p.png', b.getvalue(), content_type='image/png')


def project(title, status='ongoing', target=None, **extra):
    return Project.objects.create(title=title, short_description='s', status=status, target_date=target, **extra)


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class ProjectApiTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.staff = get_user_model().objects.create_user('a@example.com', password='p', is_staff=True)

    def titles(self, **params):
        return [r['title'] for r in self.client.get(LIST, params).data['results']]

    def test_public_list_filters_and_ordering(self):
        project('Hall', target=date(2026, 6, 30), category='building')
        project('Water', 'completed', date(2024, 3, 15), category='water')
        project('Centre', 'upcoming', date(2026, 1, 15))
        project('Someday')
        self.assertEqual(self.titles(), ['Hall', 'Centre', 'Water', 'Someday'])  # latest date first, no date last
        self.assertEqual(self.titles(ordering='oldest'), ['Water', 'Centre', 'Hall', 'Someday'])
        self.assertEqual(self.titles(status='completed'), ['Water'])
        self.assertEqual(self.titles(category='water'), ['Water'])
        self.assertEqual(self.titles(search='cent'), ['Centre'])
        summary = self.client.get(reverse('projects-summary')).data
        self.assertEqual(summary, {'all': 4, 'ongoing': 2, 'completed': 1, 'upcoming': 1})

    def test_only_staff_can_change(self):
        self.assertEqual(self.client.post(LIST, {'title': 'X'}).status_code, 401)

    def test_create_completed_is_full_progress_and_delete_removes_image(self):
        self.client.force_authenticate(self.staff)
        r = self.client.post(LIST, {
            'title': 'Borehole', 'category': 'water', 'status': 'completed', 'short_description': '<b>Clean</b> water',
            'progress': '30', 'target_amount': '6500000', 'target_date': '2024-03-15', 'image': png(),
        }, format='multipart')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual((r.data['progress'], r.data['short_description'], r.data['status_label']), (100, 'Clean water', 'Completed'))
        p = Project.objects.get()
        name = p.image.name
        self.assertEqual(self.client.delete(reverse('projects-detail', args=[p.id])).status_code, 204)
        self.assertFalse(Project._meta.get_field('image').storage.exists(name))

    def test_validation(self):
        self.client.force_authenticate(self.staff)
        r = self.client.post(LIST, {'title': ' ', 'short_description': 'x', 'progress': 120, 'status': 'nope'}, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertTrue({'title', 'progress', 'status'} <= set(r.data))

    def test_page(self):
        self.assertEqual(self.client.get(reverse('projects-page')).data['hero_title'], 'Building a Stronger Parish')
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.patch(reverse('projects-page'), {'hero_title': ' Ours '}, format='json').data['hero_title'], 'Ours')
