from rest_framework import serializers

from core.serializers import ImageFieldsMixin
from core.text import to_plain_text

from .models import Project, ProjectsPage


class ProjectSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)
    category_label = serializers.CharField(source='get_category_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'category', 'category_label', 'status', 'status_label', 'short_description', 'content',
            'image', 'remove_image', 'progress', 'target_amount', 'target_date', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        for field in ('title', 'short_description', 'content'):
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
                if field != 'content' and not attrs[field]:
                    raise serializers.ValidationError({field: 'This field may not be blank.'})
        return attrs


class ProjectsPageSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    image_fields = ('hero_image',)
    remove_hero_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = ProjectsPage
        fields = ['hero_title', 'hero_subtitle', 'hero_image', 'remove_hero_image', 'updated_at']
        read_only_fields = ['updated_at']

    def validate(self, attrs):
        for field in ('hero_title', 'hero_subtitle'):
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
        if 'hero_title' in attrs and not attrs['hero_title']:
            raise serializers.ValidationError({'hero_title': 'This field may not be blank.'})
        return attrs
