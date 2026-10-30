from rest_framework import filters, mixins, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from core.permissions import IsAdminOrReadOnly
from core.views import DeleteImagesMixin, ReorderMixin

from .models import Sacrament, SacramentFeature, SacramentsPage
from .serializers import SacramentFeatureSerializer, SacramentSerializer, SacramentsPageSerializer


class SacramentViewSet(ReorderMixin, DeleteImagesMixin, viewsets.ModelViewSet):
    """
    Sacraments, in display order.

    GET    /api/sacraments/            all sacraments (the public only gets published ones)
           ?search=<text>  ?status=published|draft (staff)
    POST   /api/sacraments/            create (staff only; send the image as multipart form data)
    PATCH  /api/sacraments/<id>/       update (staff only; remove_image=true clears the image)
    DELETE /api/sacraments/<id>/       delete (staff only)
    POST   /api/sacraments/reorder/    {ids: [...]} in the new order (staff only)
    """

    serializer_class = SacramentSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'short_description']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    # Numeric ids only, so /api/sacraments/page/ and /features/ are not taken for ids.
    lookup_value_regex = r'\d+'

    def get_queryset(self):
        queryset = Sacrament.objects.all()
        if not self.request.user.is_staff:
            return queryset.filter(is_published=True)
        status = self.request.query_params.get('status')
        if status == 'published':
            queryset = queryset.filter(is_published=True)
        elif status == 'draft':
            queryset = queryset.filter(is_published=False)
        return queryset


class SacramentsPageViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    The rest of the public Sacraments page: a single record, like the About page.

    GET   /api/sacraments/page/   text, hero image and feature cards
    PATCH /api/sacraments/page/   update (staff only; multipart for the image, remove_hero_image=true clears it)
    """

    serializer_class = SacramentsPageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        obj = SacramentsPage.load()
        self.check_object_permissions(self.request, obj)
        return obj


class SacramentFeatureViewSet(ReorderMixin, viewsets.ModelViewSet):
    """Feature cards under the sacraments. /api/sacraments/features/ (+ /reorder/). Staff only for changes."""

    queryset = SacramentFeature.objects.all()
    serializer_class = SacramentFeatureSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
