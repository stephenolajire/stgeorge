from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import SAFE_METHODS
from rest_framework_simplejwt.authentication import JWTAuthentication

from .cookies import ACCESS_COOKIE

# Browsers attach cookies to requests from any site, so a request that changes
# data must also carry this header. Other websites cannot add custom headers to
# requests to the API (CORS only allows our own frontend), which blocks
# cross-site request forgery.
CSRF_HEADER = 'X-Requested-With'
CSRF_HEADER_VALUE = 'XMLHttpRequest'


class CookieJWTAuthentication(JWTAuthentication):
    """Reads the access token from the Authorization header, or else from the httpOnly cookie."""

    def authenticate(self, request):
        if self.get_header(request) is not None:
            return super().authenticate(request)

        raw_token = request.COOKIES.get(ACCESS_COOKIE)
        if not raw_token:
            return None

        validated_token = self.get_validated_token(raw_token)
        if request.method not in SAFE_METHODS and request.headers.get(CSRF_HEADER) != CSRF_HEADER_VALUE:
            raise PermissionDenied('Missing X-Requested-With header.')
        return self.get_user(validated_token), validated_token
