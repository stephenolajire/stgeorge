from rest_framework import viewsets

from core.permissions import IsAdminOrReadOnly
from core.views import DeleteImagesMixin, ReorderMixin

from .models import ParishGroup
from .serializers import ParishGroupSerializer


class ParishGroupViewSet(ReorderMixin, DeleteImagesMixin, viewsets.ModelViewSet):
    """
    Parish groups, in display order.

    GET    /api/parish-groups/          all groups (the public only gets active ones)
    POST   /api/parish-groups/          create (staff only)
    PATCH  /api/parish-groups/<id>/     update (staff only; remove_image=true clears the image)
    DELETE /api/parish-groups/<id>/     delete (staff only)
    POST   /api/parish-groups/reorder/  {ids: [...]} in the new order (staff only)
    """

    serializer_class = ParishGroupSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = ParishGroup.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset
