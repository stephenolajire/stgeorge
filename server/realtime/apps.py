from django.apps import AppConfig


class RealtimeConfig(AppConfig):
    """Live updates: pushes "content changed" messages to open pages over a websocket."""

    name = 'realtime'

    def ready(self):
        from .signals import connect_signals

        connect_signals()
