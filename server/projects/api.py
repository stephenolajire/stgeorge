from django.db.models import Count, F, Q
from rest_framework import filters, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from core.permissions import IsAdminOrReadOnly
from core.views import DeleteImagesMixin

from .models import Project, ProjectCategory, ProjectsPage, ProjectStatus
from .serializers import ProjectSerializer, ProjectsPageSerializer

ORDERINGS = {
    'latest': [F('target_date').desc(nulls_last=True), '-id'],
    'oldest': [F('target_date').asc(nulls_last=True), 'id'],
    'title': ['title', 'id'],
    'progress': ['-progress', 'id'],
}


class ProjectPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 50


class ProjectViewSet(DeleteImagesMixin, viewsets.ModelViewSet):
    """
    Parish projects. Everyone can read; staff can change.

    GET    /api/projects/   ?status=ongoing|completed|upcoming  ?category=  ?search=
                            ?ordering=latest|oldest|title|progress  (8 per page, ?page_size= up to 50)
    POST   /api/projects/   multipart with the image (≤5 MB); PATCH /api/projects/<id>/ (remove_image=true clears it)
    GET    /api/projects/summary/      counts per status
    GET    /api/projects/categories/   [{value, label}]
    """

    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = ProjectPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'short_description', 'content']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    lookup_value_regex = r'\d+'

    def get_queryset(self):
        params = self.request.query_params
        queryset = Project.objects.all()
        if params.get('status') in ProjectStatus.values:
            queryset = queryset.filter(status=params['status'])
        if params.get('category') in ProjectCategory.values:
            queryset = queryset.filter(category=params['category'])
        return queryset.order_by(*ORDERINGS.get(params.get('ordering'), ORDERINGS['latest']))

    @action(detail=False, methods=['get'])
    def summary(self, request):
        counts = {s: Count('id', filter=Q(status=s)) for s in ProjectStatus.values}
        return Response(Project.objects.aggregate(all=Count('id'), **counts))

    @action(detail=False, methods=['get'], url_path='categories', url_name='categories')
    def categories_list(self, request):
        return Response([{'value': c.value, 'label': c.label} for c in ProjectCategory])


class ProjectsPageViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """Banner of the public Projects page. GET/PATCH /api/projects/page/ (single record)."""

    serializer_class = ProjectsPageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        obj = ProjectsPage.load()
        self.check_object_permissions(self.request, obj)
        return obj
