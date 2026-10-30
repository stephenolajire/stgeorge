from rest_framework import serializers

from core.serializers import ImageFieldsMixin
from core.text import to_plain_text

from .models import FAQ, ContactMessage, ContactPage, ContactReply, Status


class PublicMessageSerializer(serializers.ModelSerializer):
    """What the public contact form sends."""

    # Hidden "website" field: people never fill it in, spam bots usually do.
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'phone', 'subject', 'message', 'website']

    def validate(self, attrs):
        for field in ('name', 'phone', 'message'):
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
        for field in ('name', 'message'):
            if not attrs.get(field):
                raise serializers.ValidationError({field: 'This field may not be blank.'})
        return attrs


class ReplySerializer(serializers.ModelSerializer):
    sent_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ContactReply
        fields = ['id', 'subject', 'body', 'sent_by_name', 'sent_at']

    def get_sent_by_name(self, obj):
        return (obj.sent_by.get_full_name() or obj.sent_by.email) if obj.sent_by else ''


class MessageSerializer(serializers.ModelSerializer):
    """A message as the admin sees it. Only `status` can be changed (read, unread, archived)."""

    subject_label = serializers.CharField(source='get_subject_display', read_only=True)
    replies = ReplySerializer(many=True, read_only=True)

    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'subject', 'subject_label', 'message', 'status', 'created_at', 'replied_at', 'replies']
        read_only_fields = ['name', 'email', 'phone', 'subject', 'message', 'created_at', 'replied_at']


class SendReplySerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=200)
    body = serializers.CharField(max_length=10000)

    def validate(self, attrs):
        attrs = {k: to_plain_text(v) for k, v in attrs.items()}
        for field, value in attrs.items():
            if not value:
                raise serializers.ValidationError({field: 'This field may not be blank.'})
        return attrs


class IdsSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False, max_length=500)


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'order']
        read_only_fields = ['order']

    def validate(self, attrs):
        for field in ('question', 'answer'):
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
                if not attrs[field]:
                    raise serializers.ValidationError({field: 'This field may not be blank.'})
        return attrs


PAGE_TEXT_FIELDS = (
    'hero_title', 'hero_subtitle', 'address', 'phone', 'phone_hours', 'email_note', 'office_days', 'office_hours',
    'form_title', 'form_subtitle', 'map_title', 'map_subtitle', 'map_query', 'directions',
    'faq_title', 'faq_subtitle', 'banner_title', 'banner_quote', 'banner_quote_source',
    'footer_caption',
)


class ContactPageSerializer(ImageFieldsMixin, serializers.ModelSerializer):
    image_fields = ('hero_image', 'banner_image', 'footer_image')
    remove_hero_image = serializers.BooleanField(write_only=True, required=False, default=False)
    remove_banner_image = serializers.BooleanField(write_only=True, required=False, default=False)
    remove_footer_image = serializers.BooleanField(write_only=True, required=False, default=False)
    faqs = FAQSerializer(source='get_faqs', many=True, read_only=True)

    class Meta:
        model = ContactPage
        fields = [
            *PAGE_TEXT_FIELDS, 'email', 'hero_image', 'remove_hero_image', 'banner_image', 'remove_banner_image',
            'footer_image', 'remove_footer_image',
            'faqs', 'updated_at',
        ]
        read_only_fields = ['updated_at']

    def validate(self, attrs):
        for field in PAGE_TEXT_FIELDS:
            if field in attrs:
                attrs[field] = to_plain_text(attrs[field])
        if 'hero_title' in attrs and not attrs['hero_title']:
            raise serializers.ValidationError({'hero_title': 'This field may not be blank.'})
        return attrs


STATUS_CHANGES = {Status.UNREAD, Status.READ, Status.ARCHIVED}
