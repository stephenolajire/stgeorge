import io
import shutil
import tempfile
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Event, NewsEventsPage, NewsPost

MEDIA_ROOT = tempfile.mkdtemp()
EVENTS = reverse('events-list')
NEWS = reverse('news-list')


def png():
    b = io.BytesIO()
    Image.new('RGB', (8, 6), 'red').save(b, 'PNG')
    return SimpleUploadedFile('e.png', b.getvalue(), content_type='image/png')


def event(title, days, **extra):
    return Event.objects.create(title=title, short_description='s', content='c', starts_at=timezone.now() + timedelta(days=days), **extra)


def news(title, days_ago=0, **extra):
    return NewsPost.objects.create(title=title, short_description='s', content='c', published_on=timezone.localdate() - timedelta(days=days_ago), **extra)


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class NewsEventsApiTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.staff = get_user_model().objects.create_user('a@example.com', password='p', is_staff=True)

    def titles(self, url, **params):
        return [r['title'] for r in self.client.get(url, params).data['results']]

    def test_public_events_upcoming_soonest_first_and_published_only(self):
        event('Christmas', 50, category='celebration')
        event('Advent', 20, category='retreat')
        event('Lent', -30)
        event('Hidden', 5, is_published=False)
        self.assertEqual(self.titles(EVENTS, when='upcoming'), ['Advent', 'Christmas'])
        self.assertEqual(self.titles(EVENTS, when='past'), ['Lent'])
        self.assertEqual(self.titles(EVENTS, category='celebration,retreat', when='upcoming'), ['Advent', 'Christmas'])
        self.assertEqual(self.client.post(EVENTS, {}).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_event_today_counts_as_upcoming_until_the_day_ends(self):
        Event.objects.create(title='This morning', short_description='s', content='c', starts_at=timezone.localtime().replace(hour=0, minute=1))
        self.assertIn('This morning', self.titles(EVENTS, when='upcoming'))

    def test_public_news_newest_first_hides_drafts_and_future_dates(self):
        news('Old', 10, category='outreach')
        news('New', 1)
        news('Draft', 0, is_published=False)
        news('Tomorrow', -1)
        self.assertEqual(self.titles(NEWS), ['New', 'Old'])
        self.assertEqual(self.titles(NEWS, category='outreach'), ['Old'])
        self.assertEqual(self.titles(NEWS, search='old'), ['Old'])

    def test_staff_sees_drafts_and_filters_by_status(self):
        self.client.force_authenticate(self.staff)
        news('Live')
        news('Draft', is_published=False)
        news('Tomorrow', -1)
        self.assertEqual(len(self.titles(NEWS)), 3)
        self.assertEqual(self.titles(NEWS, status='draft'), ['Draft'])
        self.assertEqual(self.client.get(reverse('news-summary')).data, {'all': 3, 'published': 2, 'draft': 1})

    def test_create_event_with_local_time_image_and_delete(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            EVENTS,
            {'title': 'Advent Retreat', 'short_description': 'Prayer', 'content': '<p>A</p><p>B</p>', 'starts_at': '2026-11-29T16:00',
             'location': 'Parish Hall', 'category': 'retreat', 'is_featured': 'true', 'image': png()},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['starts_at'], '2026-11-29T16:00:00+01:00')  # entered in Nigeria time
        self.assertEqual((response.data['content'], response.data['category_label']), ('A\n\nB', 'Retreat'))
        self.assertTrue(response.data['is_featured'])
        e = Event.objects.get()
        name = e.image.name
        self.assertEqual(self.client.delete(reverse('events-detail', args=[e.id])).status_code, 204)
        self.assertFalse(Event._meta.get_field('image').storage.exists(name))

    def test_required_fields_and_categories(self):
        self.client.force_authenticate(self.staff)
        bad = self.client.post(NEWS, {'title': ' ', 'short_description': '', 'content': '', 'category': 'nope'}, format='json')
        self.assertEqual(bad.status_code, 400)
        self.assertIn({'value': 'announcement', 'label': 'Announcement'}, self.client.get(reverse('news-categories')).data)
        self.assertIn({'value': 'celebration', 'label': 'Special Celebration'}, self.client.get(reverse('events-categories')).data)

    def test_page_content(self):
        self.assertEqual(self.client.get(reverse('news-events-page')).data['hero_title'], 'News & Events')
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.patch(reverse('news-events-page'), {'cta_title': ' Join '}, format='json').data['cta_title'], 'Join')
        self.assertEqual(NewsEventsPage.objects.count(), 1)
