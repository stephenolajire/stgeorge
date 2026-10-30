from django.db import transaction
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .signals import bulk_changed


class ReorderSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False, max_length=500)


class ReorderMixin:
    """Adds POST <list-url>/reorder/ {ids: [...]} to a viewset of OrderedModel rows (staff only)."""

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def reorder(self, request):
        """Put the given rows in the given order, reusing the positions they already hold."""
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ids = serializer.validated_data['ids']
        model = self.get_serializer_class().Meta.model

        with transaction.atomic():
            rows = {row.id: row for row in model.objects.select_for_update().filter(id__in=ids)}
            if len(set(ids)) != len(ids) or len(rows) != len(ids):
                return Response({'ids': ['Unknown or duplicate ids.']}, status=status.HTTP_400_BAD_REQUEST)
            positions = sorted(row.order for row in rows.values())
            for row_id, position in zip(ids, positions):
                rows[row_id].order = position
            model.objects.bulk_update(rows.values(), ['order'])
            transaction.on_commit(lambda: bulk_changed.send(sender=model))
        return Response(status=status.HTTP_204_NO_CONTENT)


class DeleteImagesMixin:
    """Deletes a row's image files from storage when the row is deleted."""

    image_fields = ('image',)

    def perform_destroy(self, instance):
        files = [(getattr(instance, f).storage, getattr(instance, f).name) for f in self.image_fields if getattr(instance, f)]
        instance.delete()
        for storage, name in files:
            storage.delete(name)
