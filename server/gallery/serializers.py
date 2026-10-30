import os

from rest_framework import serializers

from core.serializers import ImageFieldsMixin
from core.text import to_plain_text

from .models import Category, GalleryPage, Photo, normalize_tags


class PhotoSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    category_label = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Photo
        fields = ['id', 'image', 'title', 'category', 'category_label', 'description', 'date_taken', 'tags', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, attrs):
        for field in ('title', 'description'):
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
        if 'title' in attrs and not attrs['title']:
            raise serializers.ValidationError({'title': 'This field may not be blank.'})
        if 'tags' in attrs:
            attrs['tags'] = normalize_tags(to_plain_text(attrs['tags']))
        return attrs


def title_from_filename(name):
    """'IMG_2041 sunday-mass.jpg' -> 'IMG 2041 sunday mass'."""
    stem = os.path.splitext(os.path.basename(name))[0]
    return ' '.join(stem.replace('_', ' ').replace('-', ' ').split())[:150] or 'Photo'


class UploadSerializer(serializers.Serializer):
    files = serializers.ListField(child=serializers.ImageField(), allow_empty=False, max_length=20)
    category = serializers.ChoiceField(choices=Category.choices, default=Category.OTHERS)
    date_taken = serializers.DateField(required=False)


class IdsSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False, max_length=500)


class MoveSerializer(IdsSerializer):
    category = serializers.ChoiceField(choices=Category.choices)


class GalleryPageSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    image_fields = ('hero_image',)
    remove_hero_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = GalleryPage
        fields = ['hero_title', 'hero_subtitle', 'hero_image', 'remove_hero_image', 'cta_title', 'cta_text', 'updated_at']
        read_only_fields = ['updated_at']

    def validate(self, attrs):
        for field in ('hero_title', 'hero_subtitle', 'cta_title', 'cta_text'):
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
        if 'hero_title' in attrs and not attrs['hero_title']:
            raise serializers.ValidationError({'hero_title': 'This field may not be blank.'})
        return attrs
