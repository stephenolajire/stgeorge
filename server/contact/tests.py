import json
from unittest import mock

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from core.mail_backends import ZeptoMailBackend, ZeptoMailError

from .models import FAQ, ContactMessage, ContactPage, Status

LIST = reverse('contact-messages-list')
FORM = {'name': 'Adebayo Olamide', 'email': 'olamide@example.com', 'phone': '0803', 'subject': 'mass_times', 'message': 'When is Mass?'}


def message(**extra):
    return ContactMessage.objects.create(**{**FORM, **extra})


@override_settings(CONTACT_NOTIFY_EMAIL='office@example.com', DEFAULT_FROM_EMAIL='Parish <noreply@example.com>')
class PublicFormTests(APITestCase):
    def setUp(self):
        cache.clear()  # reset the per-visitor limit

    def test_send_message_and_notify_the_office(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(LIST, FORM, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        saved = ContactMessage.objects.get()
        self.assertEqual((saved.status, saved.subject), ('unread', 'mass_times'))
        self.assertNotIn('id', response.data)  # the public learns nothing about stored messages

        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.to, ['office@example.com'])
        self.assertEqual(email.reply_to, ['olamide@example.com'])
        self.assertIn('Adebayo Olamide', email.subject)
        html = email.alternatives[0][0]
        self.assertIn('When is Mass?', html)
        self.assertIn('St. George Catholic Church', html)  # from the base template

    def test_validation(self):
        response = self.client.post(LIST, {**FORM, 'email': 'nope', 'subject': 'x', 'message': '  '}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertTrue({'email', 'subject'} <= set(response.data))

    def test_spam_bot_honeypot_is_silently_dropped(self):
        response = self.client.post(LIST, {**FORM, 'website': 'http://spam.example'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_limit_per_visitor(self):
        codes = [self.client.post(LIST, FORM, format='json').status_code for _ in range(6)]
        self.assertEqual(codes[-1], status.HTTP_429_TOO_MANY_REQUESTS)

    def test_public_cannot_read_messages(self):
        message()
        self.assertEqual(self.client.get(LIST).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(reverse('contact-messages-subjects')).status_code, 200)

    def test_notification_failure_does_not_lose_the_message(self):
        with mock.patch('contact.emails.send_templated_email', side_effect=ZeptoMailError('down')):
            with self.captureOnCommitCallbacks(execute=True):
                response = self.client.post(LIST, FORM, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)


class AdminMessageTests(APITestCase):
    def setUp(self):
        self.staff = get_user_model().objects.create_user('admin@example.com', password='p', is_staff=True, first_name='Stephen')
        self.client.force_authenticate(self.staff)

    def test_tabs_counts_search(self):
        message(name='A')
        message(name='B', status='replied')
        message(name='C', status='archived')
        message(name='Dele', status='read', message='baptism please')
        self.assertEqual(self.client.get(LIST).data['count'], 3)  # inbox excludes archived
        self.assertEqual(self.client.get(LIST, {'status': 'archived'}).data['results'][0]['name'], 'C')
        self.assertEqual(self.client.get(LIST, {'search': 'baptism'}).data['results'][0]['name'], 'Dele')
        self.assertEqual(
            self.client.get(reverse('contact-messages-summary')).data,
            {'all': 3, 'unread': 1, 'read': 1, 'replied': 1, 'archived': 1},
        )

    def test_status_changes_only(self):
        m = message()
        url = reverse('contact-messages-detail', args=[m.id])
        self.assertEqual(self.client.patch(url, {'status': 'read'}, format='json').data['status'], 'read')
        self.assertEqual(self.client.patch(url, {'status': 'replied'}, format='json').status_code, 400)
        self.assertEqual(self.client.patch(url, {'status': 'read', 'name': 'X'}, format='json').status_code, 400)

    def test_reply_is_emailed_and_recorded(self):
        m = message()
        response = self.client.post(
            reverse('contact-messages-reply', args=[m.id]),
            {'subject': 'Re: Mass Times', 'body': 'Sunday Mass is at 7am.\n\nGod bless.'},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['status'], 'replied')
        self.assertEqual(response.data['replies'][0]['sent_by_name'], 'Stephen')
        email = mail.outbox[-1]
        self.assertEqual(email.to, ['Adebayo Olamide <olamide@example.com>'])
        self.assertIn('Sunday Mass is at 7am.', email.body)  # plain-text version
        self.assertIn('When is Mass?', email.alternatives[0][0])  # original quoted in the HTML

    def test_failed_reply_saves_nothing(self):
        m = message()
        with mock.patch('contact.api.send_reply', side_effect=ZeptoMailError('HTTP 401')):
            response = self.client.post(reverse('contact-messages-reply', args=[m.id]), {'subject': 'Re', 'body': 'Hi'}, format='json')
        self.assertEqual(response.status_code, 502)
        m.refresh_from_db()
        self.assertEqual((m.status, m.replies.count()), ('unread', 0))

    def test_mark_all_read_bulk_delete_and_export(self):
        a, b = message(), message(name='Funke, "Jo"')
        self.assertEqual(self.client.post(reverse('contact-messages-mark-all-read')).data, {'updated': 2})
        response = self.client.get(reverse('contact-messages-export'))
        self.assertEqual(response['Content-Type'], 'text/csv; charset=utf-8')
        body = response.content.decode('utf-8-sig')
        self.assertIn('"Funke, ""Jo"""', body)
        self.assertEqual(self.client.post(reverse('contact-messages-bulk-delete'), {'ids': [a.id, b.id]}, format='json').data, {'deleted': 2})


class ContactPageTests(APITestCase):
    def test_page_and_faqs(self):
        data = self.client.get(reverse('contact-page')).data
        self.assertEqual(data['hero_title'], 'Contact Us')
        self.assertEqual(data['faqs'], [])
        staff = get_user_model().objects.create_user('s@example.com', password='p', is_staff=True)
        self.client.force_authenticate(staff)
        self.client.post(reverse('contact-faqs-list'), {'question': 'Where?', 'answer': 'Ofatedo.'}, format='json')
        response = self.client.patch(reverse('contact-page'), {'phone': ' +234 1 ', 'map_query': 'Ofatedo'}, format='json')
        self.assertEqual(response.data['phone'], '+234 1')
        self.assertEqual(response.data['faqs'][0]['question'], 'Where?')
        self.assertEqual(ContactPage.objects.count(), 1)
        self.assertEqual(FAQ.objects.count(), 1)


class ZeptoMailBackendTests(TestCase):
    def make_email(self):
        email = EmailMultiAlternatives(
            subject='Hello', body='Plain text', from_email='Parish <noreply@example.com>',
            to=['Ada Obi <ada@example.com>'], bcc=['log@example.com'], reply_to=['office@example.com'],
        )
        email.attach_alternative('<p>HTML</p>', 'text/html')
        return email

    def test_payload_and_request(self):
        backend = ZeptoMailBackend(api_key='secret-key', api_url='https://api.zeptomail.eu/v1.1/email')
        response = mock.MagicMock(status=201)
        response.__enter__.return_value = response
        with mock.patch('urllib.request.urlopen', return_value=response) as urlopen:
            self.assertEqual(backend.send_messages([self.make_email()]), 1)
        request = urlopen.call_args.args[0]
        self.assertEqual(request.full_url, 'https://api.zeptomail.eu/v1.1/email')
        self.assertEqual(request.get_header('Authorization'), 'Zoho-enczapikey secret-key')
        self.assertEqual(
            json.loads(request.data),
            {
                'from': {'address': 'noreply@example.com', 'name': 'Parish'},
                'to': [{'email_address': {'address': 'ada@example.com', 'name': 'Ada Obi'}}],
                'bcc': [{'email_address': {'address': 'log@example.com'}}],
                'reply_to': [{'address': 'office@example.com'}],
                'subject': 'Hello',
                'htmlbody': '<p>HTML</p>',
                'textbody': 'Plain text',
            },
        )

    def test_token_with_prefix_and_errors(self):
        backend = ZeptoMailBackend(api_key='Zoho-enczapikey abc')
        self.assertEqual(backend.auth, 'Zoho-enczapikey abc')
        import urllib.error

        error = urllib.error.HTTPError('u', 401, 'Unauthorized', {}, mock.MagicMock(read=lambda: b'{"error":"bad key"}'))
        with mock.patch('urllib.request.urlopen', side_effect=error):
            with self.assertRaisesMessage(ZeptoMailError, 'HTTP 401'):
                backend.send_messages([self.make_email()])
        quiet = ZeptoMailBackend(api_key='x', fail_silently=True)
        with mock.patch('urllib.request.urlopen', side_effect=error):
            self.assertEqual(quiet.send_messages([self.make_email()]), 0)
