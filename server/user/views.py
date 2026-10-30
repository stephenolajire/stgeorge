from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .cookies import REFRESH_COOKIE, clear_auth_cookies, set_auth_cookies
from .serializers import EmailTokenObtainPairSerializer, UserSerializer


class TokenEndpoint(APIView):
    """Base for the auth endpoints, which read cookies themselves instead of authenticating."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def get_authenticate_header(self, request):
        # Without an auth class DRF would turn 401 into 403; the frontend needs 401 to know the session ended.
        return 'Bearer realm="api"'


class LoginView(TokenEndpoint):
    """POST {email, password} -> {user}, with the tokens set as httpOnly cookies."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        serializer = EmailTokenObtainPairSerializer(data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0]) from e

        data = serializer.validated_data
        response = Response({'user': data['user']})
        set_auth_cookies(response, data['access'], data['refresh'])
        return response


class RefreshView(TokenEndpoint):
    """POST -> new access token (and a new refresh token) from the refresh cookie."""

    def post(self, request):
        refresh = request.COOKIES.get(REFRESH_COOKIE)
        if not refresh:
            return Response({'detail': 'Not signed in.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TokenRefreshSerializer(data={'refresh': refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0]) from e

        data = serializer.validated_data
        response = Response(status=status.HTTP_204_NO_CONTENT)
        set_auth_cookies(response, data['access'], data.get('refresh'))
        return response


class LogoutView(TokenEndpoint):
    """POST -> blacklists the refresh token and deletes the cookies. Works even if the session has expired."""

    def post(self, request):
        refresh = request.COOKIES.get(REFRESH_COOKIE)
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except TokenError:
                pass  # Already expired or blacklisted: nothing to revoke.

        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_auth_cookies(response)
        return response


class MeView(RetrieveAPIView):
    """GET -> the signed-in user."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
