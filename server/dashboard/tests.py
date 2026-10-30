from datetime import timedelta
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from contact.models import ContactMessage
from news_events.models import Event, NewsPost

from .models import PageVisit

VISIT = reverse('analytics-visit')
CHROME = 'Mozilla/5.0 (X11; Linux x86_64) Chrome/130.0'
PHONE = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Chrome/130.0'


class AnalyticsTests(APITestCase):
    def setUp(self):
        cache.clear()  # throttle counts
        self.staff = get_user_model().objects.create_user('a@example.com', password='p', is_staff=True)

    def post(self, path, agent=CHROME, ip='1.1.1.1'):
        return self.client.post(VISIT, {'path': path}, format='json', HTTP_USER_AGENT=agent, REMOTE_ADDR=ip)

    def test_records_visits_without_storing_ip_and_skips_bots_and_staff(self):
        self.assertEqual(self.post('/about').status_code, 204)
        self.post('/gallery')
        self.post('/', PHONE, '2.2.2.2')
        self.post('/', 'Googlebot/2.1')
        self.assertEqual(self.post('not-a-path').status_code, 400)
        self.client.force_authenticate(self.staff)
        self.post('/')
        visits = PageVisit.objects.all()
        self.assertEqual(visits.count(), 3)
        self.assertEqual(visits.values('visitor').distinct().count(), 2)
        self.assertNotIn('1.1.1.1', ''.join(visits.values_list('visitor', flat=True)))

    def test_overview_totals_sessions_and_changes(self):
        for path in ('/', '/about'):
            self.post(path)
        self.post('/', PHONE, '2.2.2.2')
        # The second view by the first visitor came 2 minutes after the first.
        first = PageVisit.objects.filter(path='/about').get()
        PageVisit.objects.filter(pk=first.pk).update(created_at=first.created_at + timedelta(minutes=2))
        # A visit last week, for the comparison.
        old = PageVisit.objects.create(path='/', visitor='x', is_mobile=False)
        PageVisit.objects.filter(pk=old.pk).update(created_at=timezone.now() - timedelta(days=8))

        url = reverse('analytics-overview')
        self.assertEqual(self.client.get(url).status_code, 401)
        self.client.force_authenticate(self.staff)
        data = self.client.get(url, {'range': '7d'}).data
        self.assertEqual(len(data['series']), 7)
        self.assertEqual(data['series'][-1]['visitors'], 2)
        self.assertEqual(data['totals']['views'], 3)
        self.assertEqual(data['totals']['visitors'], 2)
        self.assertEqual(data['totals']['mobile_percent'], 50)
        self.assertEqual(data['totals']['avg_session_seconds'], 60)  # (120 + 0) / 2
        self.assertEqual(data['changes']['visitors'], 100)  # 2 vs 1

    @mock.patch('dashboard.api.VisitThrottle.THROTTLE_RATES', {'visit': '2/minute'})
    def test_visits_are_throttled(self):
        codes = [self.post('/').status_code for _ in range(3)]
        self.assertEqual(codes, [204, 204, 429])


class DashboardTests(APITestCase):
    def test_summary(self):
        staff = get_user_model().objects.create_user('a@example.com', password='p', is_staff=True)
        Event.objects.create(title='Advent', short_description='s', content='c', starts_at=timezone.now() + timedelta(days=3))
        Event.objects.create(title='Past', short_description='s', content='c', starts_at=timezone.now() - timedelta(days=3))
        NewsPost.objects.create(title='Draft news', short_description='s', content='c', is_published=False)
        ContactMessage.objects.create(name='Ada', email='a@example.com', message='Hi')
        self.assertEqual(self.client.get(reverse('dashboard')).status_code, 401)
        self.client.force_authenticate(staff)
        data = self.client.get(reverse('dashboard')).data
        self.assertEqual(data['stats']['events']['upcoming'], 1)
        self.assertEqual(data['stats']['news'], {'total': 1, 'this_month': 1})
        self.assertEqual(data['stats']['messages'], {'total': 1, 'unread': 1})
        self.assertEqual([e['title'] for e in data['upcoming_events']], ['Advent'])
        self.assertEqual(data['recent_news'][0]['is_published'], False)
        self.assertEqual(data['recent_messages'][0]['is_read'], False)
