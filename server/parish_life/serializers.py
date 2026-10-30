from rest_framework import serializers

from core.text import to_plain_text

from .models import Section


class SectionSerializer(serializers.ModelSerializer):
    # Multipart forms cannot send "null" for a file, so removal is an explicit flag.
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Section
        fields = [
            'id',
            'title',
            'short_description',
            'content',
            'image',
            'remove_image',
            'is_published',
            'order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['order', 'created_at', 'updated_at']

    def validate(self, attrs):
        for field in ('title', 'short_description', 'content'):
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
                if not attrs[field]:
                    raise serializers.ValidationError({field: 'This field may not be blank.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('remove_image', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        remove = validated_data.pop('remove_image', False)
        old_image = instance.image.name if instance.image else None
        if remove and 'image' not in validated_data:
            instance.image = None

        instance = super().update(instance, validated_data)

        # Delete a replaced or removed image from storage.
        if old_image and instance.image.name != old_image:
            instance._meta.get_field('image').storage.delete(old_image)
        return instance


class ReorderSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False, max_length=500)
