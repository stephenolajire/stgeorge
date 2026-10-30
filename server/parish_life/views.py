from rest_framework import mixins, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from core.permissions import IsAdminOrReadOnly
from core.views import DeleteImagesMixin, ReorderMixin

from .models import Activity, Highlight, ParishLifePage
from .serializers import ActivitySerializer, HighlightSerializer, ParishLifePageSerializer


class ParishLifePageViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    The Parish Life page: a single record, like the About page.

    GET   /api/parish-life/   page text and images, with its highlights and activities (public sees published only)
    PATCH /api/parish-life/   update text/images (staff only; multipart for images, remove_<image>=true clears one)
    """

    serializer_class = ParishLifePageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        obj = ParishLifePage.load()
        self.check_object_permissions(self.request, obj)
        return obj


class HighlightViewSet(ReorderMixin, viewsets.ModelViewSet):
    """Highlight cards. /api/parish-life/highlights/ (+ /reorder/). Staff only for changes."""

    queryset = Highlight.objects.all()
    serializer_class = HighlightSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']


class ActivityViewSet(ReorderMixin, DeleteImagesMixin, viewsets.ModelViewSet):
    """Activity cards. /api/parish-life/activities/ (+ /reorder/). The public only sees published ones."""

    serializer_class = ActivitySerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = Activity.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        return queryset
