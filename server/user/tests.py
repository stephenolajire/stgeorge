from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .cookies import ACCESS_COOKIE, REFRESH_COOKIE

User = get_user_model()
AJAX = {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'}


class UserModelTests(APITestCase):
    def test_email_is_the_login_field_and_is_lowercased(self):
        user = User.objects.create_user('Jane.Doe@Example.COM', password='secret-pass-123')
        self.assertEqual(user.email, 'jane.doe@example.com')

    def test_create_superuser(self):
        admin = User.objects.create_superuser('boss@example.com', password='secret-pass-123')
        self.assertTrue(admin.is_staff and admin.is_superuser)

    def test_email_required(self):
        with self.assertRaises(ValueError):
            User.objects.create_user('', password='x')


class CookieAuthTests(APITestCase):
    password = 'secret-pass-123'

    def setUp(self):
        self.user = User.objects.create_user('admin@example.com', password=self.password, is_staff=True)

    def login(self, email='admin@example.com', password=None):
        return self.client.post(reverse('login'), {'email': email, 'password': password or self.password})

    def test_login_sets_httponly_cookies_and_hides_tokens(self):
        response = self.login()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], 'admin@example.com')
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)

        access, refresh = response.cookies[ACCESS_COOKIE], response.cookies[REFRESH_COOKIE]
        self.assertTrue(access['httponly'] and refresh['httponly'])
        self.assertEqual(access['samesite'], 'Lax')
        self.assertEqual(access['path'], '/api/')
        self.assertEqual(refresh['path'], '/api/auth/')

    def test_login_email_is_case_insensitive(self):
        self.assertEqual(self.login(email='ADMIN@Example.com').status_code, status.HTTP_200_OK)

    def test_wrong_password_is_rejected(self):
        response = self.login(password='wrong')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn(ACCESS_COOKIE, response.cookies)

    def test_me_uses_the_cookie(self):
        self.assertEqual(self.client.get(reverse('me')).status_code, status.HTTP_401_UNAUTHORIZED)
        self.login()
        self.assertEqual(self.client.get(reverse('me')).data['email'], 'admin@example.com')

    def test_changes_need_the_csrf_header(self):
        self.login()
        url = reverse('about-page')
        blocked = self.client.patch(url, {'hero_title': 'Hello'}, format='json')
        self.assertEqual(blocked.status_code, status.HTTP_403_FORBIDDEN)
        allowed = self.client.patch(url, {'hero_title': 'Hello'}, format='json', **AJAX)
        self.assertEqual(allowed.status_code, status.HTTP_200_OK)

    def test_bad_access_cookie_returns_401_so_the_client_can_refresh(self):
        self.client.cookies[ACCESS_COOKIE] = 'not-a-token'
        self.assertEqual(self.client.get(reverse('me')).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_uses_the_cookie_and_rotates_it(self):
        old_refresh = self.login().cookies[REFRESH_COOKIE].value
        response = self.client.post(reverse('token-refresh'))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertNotEqual(response.cookies[REFRESH_COOKIE].value, old_refresh)

        # The old refresh token was blacklisted when it was rotated.
        self.client.cookies[REFRESH_COOKIE] = old_refresh
        self.assertEqual(self.client.post(reverse('token-refresh')).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_without_cookie(self):
        self.assertEqual(self.client.post(reverse('token-refresh')).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_clears_cookies_and_revokes_refresh(self):
        refresh = self.login().cookies[REFRESH_COOKIE].value
        response = self.client.post(reverse('logout'))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.cookies[ACCESS_COOKIE].value, '')
        self.assertEqual(response.cookies[REFRESH_COOKIE].value, '')

        self.client.cookies[REFRESH_COOKIE] = refresh
        self.assertEqual(self.client.post(reverse('token-refresh')).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authorization_header_still_works_for_api_clients(self):
        from rest_framework_simplejwt.tokens import RefreshToken

        access = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        response = self.client.patch(reverse('about-page'), {'hero_title': 'Hi'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
