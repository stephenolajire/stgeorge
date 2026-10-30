from unittest import mock

from channels.layers import get_channel_layer
from channels.testing import WebsocketCommunicator
from django.db import transaction
from django.test import SimpleTestCase, TestCase, override_settings

from about.models import AboutPage
from clergy_staff.models import Member
from config.asgi import application
from parish_groups.models import ParishGroup
from parish_life.models import Highlight
from sacraments.models import Sacrament

from .broadcast import GROUP

FRONTEND = 'http://localhost:5173'


@override_settings(CORS_ALLOWED_ORIGINS=[FRONTEND])
class BroadcastOnChangeTests(TestCase):
    """Saving or deleting content announces the change, but only after the save is committed."""

    def assert_broadcasts(self, topic, action):
        with mock.patch('realtime.broadcast.send_change') as send, self.captureOnCommitCallbacks(execute=True):
            action()
        send.assert_called_with(topic)

    def test_each_area_announces_its_topic(self):
        self.assert_broadcasts('about', lambda: AboutPage.load().save())
        self.assert_broadcasts('clergy', lambda: Member.objects.create(full_name='A', role='bishop', short_bio='B'))
        self.assert_broadcasts('parish-life', lambda: Highlight.objects.create(title='T', text='X'))
        self.assert_broadcasts('sacraments', lambda: Sacrament.objects.create(title='T', short_description='S', content='C'))
        group = ParishGroup.objects.create(name='Choir', description='Music')
        self.assert_broadcasts('parish-groups', group.delete)

    def test_reordering_announces_the_change(self):
        from django.contrib.auth import get_user_model
        from django.urls import reverse
        from rest_framework.test import APIClient

        a = ParishGroup.objects.create(name='A', description='x')
        b = ParishGroup.objects.create(name='B', description='x')
        client = APIClient()
        client.force_authenticate(get_user_model().objects.create_user('s@example.com', password='p', is_staff=True))
        with mock.patch('realtime.signals.send_change') as send, self.captureOnCommitCallbacks(execute=True):
            client.post(reverse('parish-groups-reorder'), {'ids': [b.id, a.id]}, format='json')
        send.assert_called_once_with('parish-groups')

    def test_nothing_is_sent_before_commit_or_after_rollback(self):
        with mock.patch('realtime.broadcast.send_change') as send:
            with self.captureOnCommitCallbacks(execute=False) as callbacks:
                ParishGroup.objects.create(name='Choir', description='Music')
            send.assert_not_called()  # queued for commit, not sent yet
            self.assertEqual(len(callbacks), 1)

            try:
                with transaction.atomic():
                    ParishGroup.objects.create(name='Gone', description='x')
                    raise RuntimeError
            except RuntimeError:
                pass
            send.assert_not_called()

    def test_a_broken_channel_layer_does_not_break_saving(self):
        with mock.patch('realtime.broadcast.get_channel_layer', side_effect=RuntimeError('redis down')):
            with self.captureOnCommitCallbacks(execute=True):
                group = ParishGroup.objects.create(name='Choir', description='Music')
        self.assertTrue(ParishGroup.objects.filter(pk=group.pk).exists())


@override_settings(CORS_ALLOWED_ORIGINS=[FRONTEND])
class WebsocketTests(SimpleTestCase):
    async def test_page_receives_content_changes(self):
        communicator = WebsocketCommunicator(application, '/ws/updates/', headers=[(b'origin', FRONTEND.encode())])
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await get_channel_layer().group_send(GROUP, {'type': 'content.changed', 'topic': 'about'})
        self.assertEqual(await communicator.receive_json_from(), {'type': 'content.changed', 'topic': 'about'})
        await communicator.disconnect()

    async def test_other_websites_are_refused(self):
        communicator = WebsocketCommunicator(application, '/ws/updates/', headers=[(b'origin', b'https://evil.example')])
        connected, _ = await communicator.connect()
        self.assertFalse(connected)
