"""Tell every open page that some content changed, so it can reload it."""

import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction

logger = logging.getLogger(__name__)

# Every connected browser joins this group.
GROUP = 'content-updates'


def send_change(topic):
    """Send {"type": "content.changed", "topic": topic} to every connected page right now."""
    try:
        layer = get_channel_layer()
        if layer is not None:
            async_to_sync(layer.group_send)(GROUP, {'type': 'content.changed', 'topic': topic})
    except Exception:  # A broken websocket layer (e.g. Redis down) must never break saving content.
        logger.exception('Could not broadcast content change for %r', topic)


def broadcast_change(topic):
    """Announce a change once the current database transaction has committed (never for a rolled-back save)."""
    transaction.on_commit(lambda: send_change(topic))
