from django.urls import path

from .consumers import ContentUpdatesConsumer

websocket_urlpatterns = [
    path('ws/updates/', ContentUpdatesConsumer.as_asgi()),
]
