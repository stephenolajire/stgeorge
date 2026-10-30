from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import filters, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from core.permissions import IsAdminOrReadOnly
from core.views import DeleteImagesMixin

from .models import Event, EventCategory, NewsCategory, NewsEventsPage, NewsPost
from .serializers import EventSerializer, NewsEventsPageSerializer, NewsPostSerializer


class PostPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class PostViewSet(DeleteImagesMixin, viewsets.ModelViewSet):
    """Shared behaviour: the public sees published items only; staff can filter by status, category and search."""

    permission_classes = [IsAdminOrReadOnly]
    pagination_class = PostPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'short_description', 'content']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    lookup_value_regex = r'\d+'
    categories = None

    def get_queryset(self):
        queryset = self.serializer_class.Meta.model.objects.all()
        params = self.request.query_params
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        elif params.get('status') == 'published':
            queryset = queryset.filter(is_published=True)
        elif params.get('status') == 'draft':
            queryset = queryset.filter(is_published=False)
        categories = [c for c in params.get('category', '').split(',') if c in self.categories.values]
        if categories:
            queryset = queryset.filter(category__in=categories)
        if params.get('featured') == '1':
            queryset = queryset.filter(is_featured=True)
        return queryset

    @action(detail=False, methods=['get'], url_path='categories', url_name='categories')
    def categories_list(self, request):
        return Response([{'value': c.value, 'label': c.label} for c in self.categories])

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Counts for the admin tab and status filter (staff see drafts too)."""
        queryset = self.serializer_class.Meta.model.objects.all()
        if not request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        return Response(queryset.aggregate(all=Count('id'), published=Count('id', filter=Q(is_published=True)), draft=Count('id', filter=Q(is_published=False))))


class EventViewSet(PostViewSet):
    """
    Events. GET /api/events/  ?when=upcoming|past|month  ?status=published|draft  ?category=a,b  ?search=
    Upcoming events come soonest first; past events most recent first. Staff only for changes.
    """

    serializer_class = EventSerializer
    categories = EventCategory

    def get_queryset(self):
        queryset = super().get_queryset()
        now = timezone.now()
        when = self.request.query_params.get('when')
        if when == 'upcoming':
            # Events stay "upcoming" for the rest of the day they start.
            start_of_today = timezone.localtime(now).replace(hour=0, minute=0, second=0, microsecond=0)
            queryset = queryset.filter(starts_at__gte=start_of_today).order_by('starts_at', 'id')
        elif when == 'past':
            queryset = queryset.filter(starts_at__lt=now).order_by('-starts_at', '-id')
        elif when == 'month':
            local = timezone.localtime(now)
            start = local.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end = (start + timedelta(days=32)).replace(day=1)
            queryset = queryset.filter(starts_at__gte=start, starts_at__lt=end).order_by('starts_at', 'id')
        else:
            queryset = queryset.order_by('-starts_at', '-id')
        return queryset

    @action(detail=False, methods=['get'])
    def next(self, request):
        """
        The event to show on the Home page: the soonest featured upcoming event, otherwise the soonest
        upcoming one. Returns null when nothing is coming up.
        """
        start_of_today = timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)
        queryset = Event.objects.filter(is_published=True, starts_at__gte=start_of_today)
        event = queryset.order_by('-is_featured', 'starts_at', 'id').first()
        return Response(self.get_serializer(event).data if event else None)


class NewsPostViewSet(PostViewSet):
    """News posts, newest first. GET /api/news/  ?status=  ?category=a,b  ?search=. Staff only for changes."""

    serializer_class = NewsPostSerializer
    categories = NewsCategory

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            # A post dated in the future appears on its publish date.
            queryset = queryset.filter(published_on__lte=timezone.localdate())
        return queryset


class NewsEventsPageViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """Hero and bottom banner of the public page. GET/PATCH /api/news-events/page/ (single record)."""

    serializer_class = NewsEventsPageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        obj = NewsEventsPage.load()
        self.check_object_permissions(self.request, obj)
        return obj
