from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from core.email import send_templated_email


class Command(BaseCommand):
    help = 'Send a test email (using the base email template) to check the ZeptoMail settings.'

    def add_arguments(self, parser):
        parser.add_argument('to', help='Address to send the test email to')

    def handle(self, *args, to, **options):
        backend = settings.MAILERS['default']['BACKEND']
        if 'ZeptoMail' not in backend:
            self.stdout.write(self.style.WARNING('ZEPTOMAIL_API_KEY is not set: the email will only be printed below, not sent.'))
        self.stdout.write(f'Sending from {settings.DEFAULT_FROM_EMAIL} to {to} ...')
        try:
            send_templated_email(to=to, subject='Test email from the parish website', template='test_email')
        except Exception as error:
            raise CommandError(f'Sending failed: {error}') from error
        self.stdout.write(self.style.SUCCESS('Sent. Check the inbox (and the spam folder).'))
