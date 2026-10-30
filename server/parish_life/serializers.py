from rest_framework import serializers

from core.serializers import ImageFieldsMixin
from core.text import to_plain_text

from .models import Activity, Highlight, ParishLifePage


def clean_text(attrs, fields, required=()):
    for field in fields:
        if field in attrs:
            attrs[field] = to_plain_text(attrs[field])
            if field in required and not attrs[field]:
                raise serializers.ValidationError({field: 'This field may not be blank.'})
    return attrs


class HighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Highlight
        fields = ['id', 'title', 'text', 'icon', 'order']
        read_only_fields = ['order']

    def validate(self, attrs):
        return clean_text(attrs, ('title', 'text'), required=('title', 'text'))


class ActivitySerializer(ImageFieldsMixin, serializers.ModelSerializer):
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Activity
        fields = ['id', 'title', 'short_description', 'content', 'image', 'remove_image', 'is_published', 'order']
        read_only_fields = ['order']

    def validate(self, attrs):
        return clean_text(attrs, ('title', 'short_description', 'content'), required=('title', 'short_description', 'content'))


class ParishLifePageSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    image_fields = ('hero_image', 'intro_image')
    remove_hero_image = serializers.BooleanField(write_only=True, required=False, default=False)
    remove_intro_image = serializers.BooleanField(write_only=True, required=False, default=False)
    # The cards come with the page so the public page needs one request. Edit them at their own URLs.
    highlights = serializers.SerializerMethodField()
    activities = serializers.SerializerMethodField()

    class Meta:
        model = ParishLifePage
        fields = [
            'hero_title',
            'hero_subtitle',
            'hero_image',
            'remove_hero_image',
            'intro_title',
            'intro_text',
            'intro_image',
            'remove_intro_image',
            'highlights',
            'activities',
            'updated_at',
        ]
        read_only_fields = ['updated_at']

    def validate(self, attrs):
        return clean_text(attrs, ('hero_title', 'hero_subtitle', 'intro_title', 'intro_text'), required=('hero_title',))

    def get_highlights(self, obj):
        return HighlightSerializer(Highlight.objects.all(), many=True, context=self.context).data

    def get_activities(self, obj):
        activities = Activity.objects.all()
        request = self.context.get('request')
        if not (request and request.user.is_staff):
            activities = activities.filter(is_published=True)
        return ActivitySerializer(activities, many=True, context=self.context).data
