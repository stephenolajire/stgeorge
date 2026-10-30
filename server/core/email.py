"""Sending emails built from the templates in templates/emails/ (they extend emails/base.html)."""

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_templated_email(*, to, subject, template, context=None, reply_to=None):
    """
    Render templates/emails/<template>.html (and .txt if present, else a plain version of the HTML)
    and send it. Raises if the email cannot be sent.
    """
    from contact.models import ContactPage  # the parish's contact details go in every email footer

    context = {
        'subject': subject,
        'church_name': settings.CHURCH_NAME,
        'site_url': settings.FRONTEND_URL,
        'contact': ContactPage.load(),
        **(context or {}),
    }
    html = render_to_string(f'emails/{template}.html', context)
    try:
        text = render_to_string(f'emails/{template}.txt', context)
    except Exception:
        text = '\n'.join(line.strip() for line in strip_tags(html).splitlines() if line.strip())

    email = EmailMultiAlternatives(
        subject=subject,
        body=text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to] if isinstance(to, str) else list(to),
        reply_to=[reply_to] if reply_to else None,
    )
    email.attach_alternative(html, 'text/html')
    email.send()
