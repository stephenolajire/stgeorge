from rest_framework import serializers

from core.serializers import ImageFieldsMixin
from core.text import to_plain_text

from .models import Sacrament, SacramentFeature, SacramentsPage


def clean_text(attrs, fields, required=()):
    for field in fields:
        if field in attrs:
            attrs[field] = to_plain_text(attrs[field])
            if field in required and not attrs[field]:
                raise serializers.ValidationError({field: 'This field may not be blank.'})
    return attrs


class SacramentSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Sacrament
        fields = ['id', 'title', 'icon', 'short_description', 'content', 'image', 'remove_image', 'is_published', 'order']
        read_only_fields = ['order']

    def validate(self, attrs):
        return clean_text(attrs, ('title', 'short_description', 'content'), required=('title', 'short_description', 'content'))


class SacramentFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SacramentFeature
        fields = ['id', 'title', 'text', 'icon', 'order']
        read_only_fields = ['order']

    def validate(self, attrs):
        return clean_text(attrs, ('title', 'text'), required=('title', 'text'))


PAGE_TEXT_FIELDS = (
    'hero_title',
    'hero_subtitle',
    'intro_title',
    'intro_text',
    'quote_text',
    'quote_source',
    'list_title',
    'list_subtitle',
    'cta_title',
    'cta_text',
)


class SacramentsPageSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    image_fields = ('hero_image',)
    remove_hero_image = serializers.BooleanField(write_only=True, required=False, default=False)
    # The feature cards come with the page; edit them at /api/sacraments/features/.
    features = SacramentFeatureSerializer(source='get_features', many=True, read_only=True)

    class Meta:
        model = SacramentsPage
        fields = [*PAGE_TEXT_FIELDS, 'hero_image', 'remove_hero_image', 'features', 'updated_at']
        read_only_fields = ['updated_at']

    def validate(self, attrs):
        return clean_text(attrs, PAGE_TEXT_FIELDS, required=('hero_title',))
