from rest_framework import serializers

from core.serializers import ImageFieldsMixin
from core.text import to_plain_text

from .models import HomeHighlight, HomePage, QuickLink, Subscriber


def clean_text(attrs, fields, required=()):
    for field in fields:
        if field in attrs:
            attrs[field] = to_plain_text(attrs[field])
            if field in required and not attrs[field]:
                raise serializers.ValidationError({field: 'This field may not be blank.'})
    return attrs


class HomeHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeHighlight
        fields = ['id', 'title', 'text', 'icon', 'order']
        read_only_fields = ['order']

    def validate(self, attrs):
        return clean_text(attrs, ('title', 'text'), required=('title', 'text'))


class QuickLinkSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = QuickLink
        fields = ['id', 'title', 'text', 'image', 'remove_image', 'link_label', 'target', 'order']
        read_only_fields = ['order']

    def validate(self, attrs):
        return clean_text(attrs, ('title', 'text', 'link_label'), required=('title', 'text', 'link_label'))


class HomePageSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    image_fields = ('hero_image', 'about_image', 'newsletter_image')
    remove_hero_image = serializers.BooleanField(write_only=True, required=False, default=False)
    remove_about_image = serializers.BooleanField(write_only=True, required=False, default=False)
    remove_newsletter_image = serializers.BooleanField(write_only=True, required=False, default=False)
    # The cards come with the page so the public page needs one request. Edit them at their own URLs.
    highlights = serializers.SerializerMethodField()
    links = serializers.SerializerMethodField()

    class Meta:
        model = HomePage
        fields = [
            'hero_title', 'hero_tagline', 'hero_text', 'hero_quote', 'hero_image', 'remove_hero_image',
            'about_title', 'about_text', 'about_image', 'remove_about_image',
            'news_title', 'news_subtitle',
            'newsletter_title', 'newsletter_text', 'newsletter_image', 'remove_newsletter_image',
            'highlights', 'links', 'updated_at',
        ]
        read_only_fields = ['updated_at']

    def validate(self, attrs):
        text_fields = (
            'hero_title', 'hero_tagline', 'hero_text', 'hero_quote', 'about_title', 'about_text',
            'news_title', 'news_subtitle', 'newsletter_title', 'newsletter_text',
        )
        return clean_text(attrs, text_fields, required=('hero_title',))

    def get_highlights(self, obj):
        return HomeHighlightSerializer(HomeHighlight.objects.all(), many=True, context=self.context).data

    def get_links(self, obj):
        return QuickLinkSerializer(QuickLink.objects.all(), many=True, context=self.context).data


class SubscribeSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    # Hidden from people; spam bots fill it in.
    website = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        return value.strip().lower()


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['id', 'email', 'created_at']
