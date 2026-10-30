from rest_framework import serializers

from core.serializers import ImageFieldsMixin
from core.text import to_plain_text

from .models import Event, NewsEventsPage, NewsPost


class PostSerializerMixin(ImageFieldsMixin, serializers.ModelSerializer):
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)
    category_label = serializers.CharField(source='get_category_display', read_only=True)

    def validate(self, attrs):
        for field in ('title', 'short_description', 'content', 'location'):
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
                if field != 'location' and not attrs[field]:
                    raise serializers.ValidationError({field: 'This field may not be blank.'})
        return attrs


COMMON = ['id', 'title', 'short_description', 'content', 'image', 'remove_image', 'category', 'category_label', 'is_published', 'is_featured']


class EventSerializer(PostSerializerMixin):
    class Meta:
        model = Event
        fields = [*COMMON, 'starts_at', 'location']


class NewsPostSerializer(PostSerializerMixin):
    class Meta:
        model = NewsPost
        fields = [*COMMON, 'published_on']


class NewsEventsPageSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    image_fields = ('hero_image',)
    remove_hero_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = NewsEventsPage
        fields = ['hero_title', 'hero_subtitle', 'hero_image', 'remove_hero_image', 'cta_title', 'cta_text', 'updated_at']
        read_only_fields = ['updated_at']

    def validate(self, attrs):
        for field in ('hero_title', 'hero_subtitle', 'cta_title', 'cta_text'):
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
        if 'hero_title' in attrs and not attrs['hero_title']:
            raise serializers.ValidationError({'hero_title': 'This field may not be blank.'})
        return attrs
