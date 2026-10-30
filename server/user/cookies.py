"""Helpers for the httpOnly cookies that carry the JWT tokens.

The tokens never reach JavaScript: the browser stores them and sends them back
automatically, so code injected into a page cannot steal them.
"""

from django.conf import settings

ACCESS_COOKIE = 'access_token'
REFRESH_COOKIE = 'refresh_token'

# The refresh token is only sent to the auth endpoints that need it.
ACCESS_PATH = '/api/'
REFRESH_PATH = '/api/auth/'


def _cookie_options(path, max_age):
    return {
        'max_age': int(max_age.total_seconds()),
        'path': path,
        'domain': settings.AUTH_COOKIE_DOMAIN,
        'secure': settings.AUTH_COOKIE_SECURE,
        'httponly': True,
        'samesite': settings.AUTH_COOKIE_SAMESITE,
    }


def set_auth_cookies(response, access, refresh=None):
    response.set_cookie(
        ACCESS_COOKIE, access, **_cookie_options(ACCESS_PATH, settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'])
    )
    if refresh:
        response.set_cookie(
            REFRESH_COOKIE, refresh, **_cookie_options(REFRESH_PATH, settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'])
        )


def clear_auth_cookies(response):
    response.delete_cookie(ACCESS_COOKIE, path=ACCESS_PATH, domain=settings.AUTH_COOKIE_DOMAIN)
    response.delete_cookie(REFRESH_COOKIE, path=REFRESH_PATH, domain=settings.AUTH_COOKIE_DOMAIN)
