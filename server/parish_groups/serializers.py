from rest_framework import serializers

from core.serializers import ImageFieldsMixin
from core.text import to_plain_text

from .models import ParishGroup


class ParishGroupSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = ParishGroup
        fields = ['id', 'name', 'description', 'image', 'remove_image', 'is_active', 'order']
        read_only_fields = ['order']

    def validate(self, attrs):
        for field in ('name', 'description'):
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
                if not attrs[field]:
                    raise serializers.ValidationError({field: 'This field may not be blank.'})
        return attrs
