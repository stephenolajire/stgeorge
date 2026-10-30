import csv
from datetime import timedelta

from django.db import transaction
from django.db.models import Count, Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from core.permissions import IsAdminOrReadOnly
from core.signals import bulk_changed
from core.views import ReorderMixin

from .emails import notify_new_message, send_reply
from .models import FAQ, ContactMessage, ContactPage, ContactReply, Status, Subject
from .serializers import (
    STATUS_CHANGES,
    ContactPageSerializer,
    FAQSerializer,
    IdsSerializer,
    MessageSerializer,
    PublicMessageSerializer,
    SendReplySerializer,
)


class MessagePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


DATE_RANGES = {'today': 0, '7days': 7, '30days': 30, 'year': 365}


class ContactMessageViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin,
                            mixins.UpdateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    """
    Contact form messages.

    POST   /api/contact/messages/                  public: send a message (limited per visitor)
    GET    /api/contact/messages/                  staff: list, 10 per page
           ?status=unread|read|replied|archived (default: everything except archived)
           ?search=<text>  ?date=today|7days|30days|year
    GET    /api/contact/messages/<id>/             staff
    PATCH  /api/contact/messages/<id>/             staff: {status: unread|read|archived}
    DELETE /api/contact/messages/<id>/             staff
    POST   /api/contact/messages/<id>/reply/       staff: {subject, body} -> emailed to the sender
    GET    /api/contact/messages/summary/          staff: counts per tab
    POST   /api/contact/messages/mark-all-read/    staff
    POST   /api/contact/messages/bulk-delete/      staff: {ids}
    GET    /api/contact/messages/export/           staff: CSV of the current filter
    GET    /api/contact/messages/subjects/         public: subject choices for the form
    """

    queryset = ContactMessage.objects.prefetch_related('replies__sent_by')
    serializer_class = MessageSerializer
    pagination_class = MessagePagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'phone', 'message']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    lookup_value_regex = r'\d+'
    throttle_scope = 'contact'

    def get_permissions(self):
        if self.action in ('create', 'subjects'):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_throttles(self):
        return [ScopedRateThrottle()] if self.action == 'create' else []

    def get_serializer_class(self):
        return PublicMessageSerializer if self.action == 'create' else MessageSerializer

    def filter_messages(self, queryset):
        params = self.request.query_params
        wanted = params.get('status')
        queryset = queryset.filter(status=wanted) if wanted in Status.values else queryset.exclude(status=Status.ARCHIVED)
        if (days := DATE_RANGES.get(params.get('date'))) is not None:
            start = timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=days)
            queryset = queryset.filter(created_at__gte=start)
        return queryset

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ('list', 'export'):
            queryset = self.filter_messages(queryset)
        return queryset

    # Public form ---------------------------------------------------------------------------

    def create(self, request, *args, **kwargs):
        serializer = PublicMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.pop('website', ''):
            # A spam bot filled in the hidden field: pretend it worked and keep nothing.
            return Response({'detail': 'Message sent.'}, status=status.HTTP_201_CREATED)
        message = serializer.save()
        transaction.on_commit(lambda: notify_new_message(message))
        return Response({'detail': 'Message sent.'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def subjects(self, request):
        return Response([{'value': s.value, 'label': s.label} for s in Subject])

    # Admin -----------------------------------------------------------------------------------

    def partial_update(self, request, *args, **kwargs):
        new_status = request.data.get('status')
        if new_status not in STATUS_CHANGES or set(request.data) - {'status'}:
            return Response({'status': ['Only the status can be changed: unread, read or archived.']}, status=400)
        message = self.get_object()
        message.status = new_status
        message.save(update_fields=['status'])
        return Response(self.get_serializer(message).data)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        message = self.get_object()
        serializer = SendReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subject, body = serializer.validated_data['subject'], serializer.validated_data['body']
        try:
            send_reply(message, subject, body)
        except Exception as error:  # noqa: BLE001 - shown to the admin
            return Response(
                {'detail': f'The reply could not be sent, so nothing was saved. ({error})'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        ContactReply.objects.create(message=message, subject=subject, body=body, sent_by=request.user)
        message.status = Status.REPLIED
        message.replied_at = timezone.now()
        message.save(update_fields=['status', 'replied_at'])
        # Reload so the response includes the reply just saved (replies were loaded before it existed).
        return Response(self.get_serializer(self.get_queryset().get(pk=message.pk)).data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        counts = ContactMessage.objects.aggregate(
            all=Count('id', filter=~Q(status=Status.ARCHIVED)),
            unread=Count('id', filter=Q(status=Status.UNREAD)),
            read=Count('id', filter=Q(status=Status.READ)),
            replied=Count('id', filter=Q(status=Status.REPLIED)),
            archived=Count('id', filter=Q(status=Status.ARCHIVED)),
        )
        return Response(counts)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        updated = ContactMessage.objects.filter(status=Status.UNREAD).update(status=Status.READ)
        transaction.on_commit(lambda: bulk_changed.send(sender=ContactMessage))
        return Response({'updated': updated})

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        serializer = IdsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deleted, _ = ContactMessage.objects.filter(id__in=serializer.validated_data['ids']).delete()
        return Response({'deleted': deleted})

    @action(detail=False, methods=['get'])
    def export(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="contact-messages-{timezone.localdate()}.csv"'
        response.write('﻿')  # lets Excel read the UTF-8 correctly
        writer = csv.writer(response)
        writer.writerow(['Date', 'Name', 'Email', 'Phone', 'Subject', 'Status', 'Message'])
        for m in queryset:
            writer.writerow([
                timezone.localtime(m.created_at).strftime('%Y-%m-%d %H:%M'), m.name, m.email, m.phone,
                m.get_subject_display(), m.get_status_display(), m.message,
            ])
        return response


class ContactPageViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    The public Contact page: text, contact details, images and FAQs. Single record.

    GET   /api/contact/page/
    PATCH /api/contact/page/   staff; multipart for images (remove_hero_image / remove_banner_image)
    """

    serializer_class = ContactPageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        obj = ContactPage.load()
        self.check_object_permissions(self.request, obj)
        return obj


class FAQViewSet(ReorderMixin, viewsets.ModelViewSet):
    """FAQ cards. /api/contact/faqs/ (+ /reorder/). Staff only for changes."""

    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
