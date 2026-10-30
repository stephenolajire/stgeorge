from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle

from contact.models import ContactMessage, Status
from gallery.models import Photo
from news_events.models import Event, NewsPost
from parish_groups.models import ParishGroup

from .analytics import overview, record_visit

RANGES = {'7d': 7, '30d': 30, '90d': 90}


class VisitThrottle(SimpleRateThrottle):
    """Page views reported per visitor (by IP), so the counter cannot be flooded."""

    scope = 'visit'

    def get_cache_key(self, request, view):
        return self.cache_format % {'scope': self.scope, 'ident': self.get_ident(request)}


class VisitSerializer(serializers.Serializer):
    path = serializers.RegexField(r'^/[^\s]*$', max_length=200)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([VisitThrottle])
def visit(request):
    """POST /api/analytics/visit/ {path}: the public website reports a page view. Staff visits are not counted."""
    serializer = VisitSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    if not request.user.is_staff:
        record_visit(request, serializer.validated_data['path'])
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def visitor_overview(request):
    """GET /api/analytics/overview/?range=7d|30d|90d: daily visitors and totals for the dashboard chart."""
    return Response(overview(RANGES.get(request.query_params.get('range'), 30)))


def _request_url(request, field):
    return request.build_absolute_uri(field.url) if field else None


@api_view(['GET'])
@permission_classes([IsAdminUser])
def summary(request):
    """GET /api/dashboard/: counts and the latest items for the admin dashboard, in one request."""
    now = timezone.now()
    local = timezone.localtime(now)
    month_start = local.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    next_month = (month_start + timedelta(days=32)).replace(day=1)
    start_of_today = local.replace(hour=0, minute=0, second=0, microsecond=0)

    upcoming = Event.objects.filter(is_published=True, starts_at__gte=start_of_today).order_by('starts_at', 'id')
    messages = ContactMessage.objects.aggregate(
        total=Count('id', filter=~Q(status=Status.ARCHIVED)), unread=Count('id', filter=Q(status=Status.UNREAD))
    )

    return Response({
        'stats': {
            'news': {'total': NewsPost.objects.count(), 'this_month': NewsPost.objects.filter(published_on__gte=month_start.date()).count()},
            'events': {'upcoming': upcoming.count(), 'this_month': upcoming.filter(starts_at__lt=next_month).count()},
            'photos': {'total': Photo.objects.count(), 'this_month': Photo.objects.filter(created_at__gte=month_start).count()},
            'groups': {'active': ParishGroup.objects.filter(is_active=True).count()},
            'messages': messages,
        },
        'recent_messages': [
            {'id': m.id, 'name': m.name, 'subject': m.get_subject_display(), 'created_at': m.created_at, 'is_read': m.status != Status.UNREAD}
            for m in ContactMessage.objects.exclude(status=Status.ARCHIVED).order_by('-created_at')[:3]
        ],
        'upcoming_events': [
            {'id': e.id, 'title': e.title, 'starts_at': timezone.localtime(e.starts_at), 'location': e.location, 'category': e.category}
            for e in upcoming[:3]
        ],
        'recent_news': [
            {'id': n.id, 'title': n.title, 'published_on': n.published_on, 'is_published': n.is_published, 'image': _request_url(request, n.image)}
            for n in NewsPost.objects.order_by('-published_on', '-id')[:3]
        ],
        'gallery': [
            {'id': p.id, 'title': p.title, 'image': _request_url(request, p.image)}
            for p in Photo.objects.order_by('-created_at', '-id')[:6]
        ],
    })
