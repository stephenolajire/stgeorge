"""
Django email backend that sends through the ZeptoMail API (https://www.zoho.com/zeptomail/).

Configured in settings.MAILERS, e.g.
    'BACKEND': 'core.mail_backends.ZeptoMailBackend',
    'OPTIONS': {'api_key': '...', 'api_url': 'https://api.zeptomail.com/v1.1/email'},

Any Django email (send_mail, EmailMultiAlternatives, …) then goes through ZeptoMail.
"""

import json
import logging
import urllib.error
import urllib.request
from email.utils import getaddresses, parseaddr

from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)

DEFAULT_API_URL = 'https://api.zeptomail.com/v1.1/email'


class ZeptoMailError(Exception):
    """ZeptoMail refused the email or could not be reached."""


def _address(value):
    name, address = parseaddr(value)
    return {'address': address, **({'name': name} if name else {})}


def _recipients(values):
    return [{'email_address': _address(f'{name} <{addr}>' if name else addr)} for name, addr in getaddresses(values)]


class ZeptoMailBackend(BaseEmailBackend):
    def __init__(self, api_key='', api_url=DEFAULT_API_URL, timeout=15, fail_silently=False, **kwargs):
        super().__init__(**kwargs)
        # ZeptoMail shows the token as "Zoho-enczapikey <key>"; accept it with or without the prefix.
        self.auth = api_key if api_key.startswith('Zoho-enczapikey') else f'Zoho-enczapikey {api_key}'
        self.api_url = api_url
        self.timeout = timeout
        self.fail_silently = fail_silently

    def build_payload(self, message):
        payload = {
            'from': _address(message.from_email),
            'to': _recipients(message.to),
            'subject': message.subject,
        }
        if message.cc:
            payload['cc'] = _recipients(message.cc)
        if message.bcc:
            payload['bcc'] = _recipients(message.bcc)
        if message.reply_to:
            payload['reply_to'] = [_address(a) for a in message.reply_to]

        html = next((content for content, mimetype in getattr(message, 'alternatives', []) if mimetype == 'text/html'), None)
        if html:
            payload['htmlbody'] = html
        if message.body:
            payload['textbody'] = message.body
        return payload

    def send_messages(self, email_messages):
        sent = 0
        for message in email_messages:
            try:
                self._post(self.build_payload(message))
                sent += 1
            except ZeptoMailError:
                if not self.fail_silently:
                    raise
                logger.exception('ZeptoMail could not send %r', message.subject)
        return sent

    def _post(self, payload):
        request = urllib.request.Request(
            self.api_url,
            data=json.dumps(payload).encode(),
            headers={'Authorization': self.auth, 'Content-Type': 'application/json', 'Accept': 'application/json'},
            method='POST',
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                if response.status >= 300:
                    raise ZeptoMailError(f'ZeptoMail returned HTTP {response.status}')
        except urllib.error.HTTPError as error:
            detail = error.read().decode(errors='replace')[:500]
            raise ZeptoMailError(f'ZeptoMail returned HTTP {error.code}: {detail}') from error
        except (urllib.error.URLError, TimeoutError) as error:
            raise ZeptoMailError(f'Could not reach ZeptoMail: {error}') from error
