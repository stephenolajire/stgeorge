from rest_framework import serializers

from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    role_label = serializers.CharField(source='get_role_display', read_only=True)
    # Multipart forms cannot send "null" for a file, so removal is an explicit flag.
    remove_photo = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Member
        fields = [
            'id',
            'full_name',
            'role',
            'role_label',
            'category',
            'short_bio',
            'description',
            'phone',
            'email',
            'photo',
            'remove_photo',
            'is_active',
            'order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['category', 'order', 'created_at', 'updated_at']

    def validate(self, attrs):
        for field in ('full_name', 'short_bio', 'description', 'phone'):
            if field in attrs:
                attrs[field] = attrs[field].strip()
        return attrs

    def create(self, validated_data):
        validated_data.pop('remove_photo', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        remove = validated_data.pop('remove_photo', False)
        old_photo = instance.photo.name if instance.photo else None
        if remove and 'photo' not in validated_data:
            instance.photo = None

        instance = super().update(instance, validated_data)

        # Delete a replaced or removed photo from storage.
        if old_photo and instance.photo.name != old_photo:
            instance._meta.get_field('photo').storage.delete(old_photo)
        return instance


class ReorderSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False, max_length=500)
