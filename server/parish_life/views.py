from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from core.permissions import IsAdminOrReadOnly

from .models import Section
from .serializers import ReorderSerializer, SectionSerializer


class SectionViewSet(viewsets.ModelViewSet):
    """
    Parish Life page sections, in display order.

    GET    /api/parish-life/            all sections (the public only gets published ones)
    POST   /api/parish-life/            create (staff only; send the image as multipart form data)
    GET    /api/parish-life/<id>/       one section
    PATCH  /api/parish-life/<id>/       update (staff only; remove_image=true clears the image)
    DELETE /api/parish-life/<id>/       delete (staff only)
    POST   /api/parish-life/reorder/    {ids: [...]} in the new order (staff only)
    """

    serializer_class = SectionSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = Section.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        return queryset

    def perform_destroy(self, instance):
        image = instance.image.name if instance.image else None
        instance.delete()
        if image:
            Section._meta.get_field('image').storage.delete(image)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def reorder(self, request):
        """Put the given sections in the given order, reusing the positions they already hold."""
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ids = serializer.validated_data['ids']

        with transaction.atomic():
            sections = {s.id: s for s in Section.objects.select_for_update().filter(id__in=ids)}
            if len(set(ids)) != len(ids) or len(sections) != len(ids):
                return Response({'ids': ['Unknown or duplicate section ids.']}, status=status.HTTP_400_BAD_REQUEST)
            positions = sorted(s.order for s in sections.values())
            for section_id, position in zip(ids, positions):
                sections[section_id].order = position
            Section.objects.bulk_update(sections.values(), ['order'])
        return Response(status=status.HTTP_204_NO_CONTENT)
