import html
import re

from django.utils.html import strip_tags
from rest_framework import serializers

from .models import AboutPage

IMAGE_FIELDS = ('hero_image', 'main_image')
TEXT_FIELDS = (
    'hero_title',
    'hero_subtitle',
    'description',
    'mission',
    'vision',
    'established',
    'diocese',
    'parish_priest',
    'location',
)


def to_plain_text(value):
    """Remove any HTML so only plain text is stored. Paragraph and line breaks are kept."""
    if '<' not in value:
        return value.strip()
    value = re.sub(r'(?i)<br\s*/?>', '\n', value)
    value = re.sub(r'(?i)</p>\s*<p[^>]*>', '\n\n', value)
    return html.unescape(strip_tags(value)).strip()


class AboutPageSerializer(serializers.ModelSerializer):
    # Multipart forms cannot send "null" for a file, so removal is an explicit flag.
    remove_hero_image = serializers.BooleanField(write_only=True, required=False, default=False)
    remove_main_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = AboutPage
        fields = [
            'hero_title',
            'hero_subtitle',
            'hero_image',
            'remove_hero_image',
            'description',
            'main_image',
            'remove_main_image',
            'mission',
            'vision',
            'established',
            'diocese',
            'parish_priest',
            'location',
            'updated_at',
        ]
        read_only_fields = ['updated_at']

    def validate(self, attrs):
        for field in TEXT_FIELDS:
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
        return attrs

    def update(self, instance, validated_data):
        old_files = {}
        for field in IMAGE_FIELDS:
            remove = validated_data.pop(f'remove_{field}', False)
            current = getattr(instance, field)
            if (remove or field in validated_data) and current:
                old_files[field] = current.name
            if remove and field not in validated_data:
                setattr(instance, field, None)

        instance = super().update(instance, validated_data)

        # Delete replaced or removed files from storage once the new values are saved.
        for field, name in old_files.items():
            if getattr(instance, field).name != name:
                instance._meta.get_field(field).storage.delete(name)
        return instance
