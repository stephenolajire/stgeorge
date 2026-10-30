import logging

from django.conf import settings

from core.email import send_templated_email

from .models import ContactMessage

logger = logging.getLogger(__name__)


def notify_new_message(message: ContactMessage):
    """Tell the parish office about a new message. Never raises: the visitor's message is already saved."""
    if not settings.CONTACT_NOTIFY_EMAIL:
        return
    try:
        send_templated_email(
            to=settings.CONTACT_NOTIFY_EMAIL,
            subject=f'New message: {message.get_subject_display()} from {message.name}',
            template='contact_notification',
            context={'message': message, 'admin_url': f'{settings.FRONTEND_URL}/admin/messages'},
            reply_to=message.email,
        )
    except Exception:
        logger.exception('Could not send the new-message notification for message %s', message.pk)


def send_reply(message: ContactMessage, subject: str, body: str):
    """Email a reply to the sender. Raises if it cannot be sent, so the admin knows."""
    send_templated_email(
        to=f'{message.name} <{message.email}>',
        subject=subject,
        template='contact_reply',
        context={'message': message, 'body': body},
        reply_to=settings.CONTACT_REPLY_TO or None,
    )
