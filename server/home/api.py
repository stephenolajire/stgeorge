import csv

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
from core.views import DeleteImagesMixin, ReorderMixin

from .models import HomeHighlight, HomePage, QuickLink, Subscriber
from .serializers import (
    HomeHighlightSerializer,
    HomePageSerializer,
    QuickLinkSerializer,
    SubscribeSerializer,
    SubscriberSerializer,
)


class HomePageViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    The Home page: a single record with its highlight and quick-link cards.

    GET   /api/home/   page text and images, with the cards
    PATCH /api/home/   staff; multipart for images (remove_<image>=true clears one)
    """

    serializer_class = HomePageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        obj = HomePage.load()
        self.check_object_permissions(self.request, obj)
        return obj


class HomeHighlightViewSet(ReorderMixin, viewsets.ModelViewSet):
    """Cards under the banner. /api/home/highlights/ (+ /reorder/). Staff only for changes."""

    queryset = HomeHighlight.objects.all()
    serializer_class = HomeHighlightSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']


class QuickLinkViewSet(ReorderMixin, DeleteImagesMixin, viewsets.ModelViewSet):
    """Photo cards linking to other pages. /api/home/links/ (+ /reorder/). Staff only for changes."""

    queryset = QuickLink.objects.all()
    serializer_class = QuickLinkSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = None
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']


class SubscriberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SubscriberViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    """
    Newsletter sign-ups.

    POST   /api/subscribers/subscribe/   public: {email}. Signing up twice is not an error. 5/hour per visitor.
    GET    /api/subscribers/             staff; ?search=  (20 per page)
    DELETE /api/subscribers/<id>/        staff
    GET    /api/subscribers/export/      staff; CSV of everyone (respects ?search=)
    """

    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    pagination_class = SubscriberPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['email']
    throttle_scope = 'subscribe'

    def get_permissions(self):
        return [AllowAny()] if self.action == 'subscribe' else [IsAdminUser()]

    def get_throttles(self):
        return [ScopedRateThrottle()] if self.action == 'subscribe' else []

    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not serializer.validated_data.get('website'):
            # A spam bot fills in the hidden field: say it worked and keep nothing.
            Subscriber.objects.get_or_create(email=serializer.validated_data['email'])
        # The same answer either way, so the form cannot be used to check who has signed up.
        return Response({'detail': 'Subscribed.'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def export(self, request):
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="subscribers-{timezone.localdate()}.csv"'
        response.write('﻿')  # lets Excel read the UTF-8 correctly
        writer = csv.writer(response)
        writer.writerow(['Email', 'Signed up'])
        for s in self.filter_queryset(self.get_queryset()):
            writer.writerow([s.email, timezone.localtime(s.created_at).strftime('%Y-%m-%d %H:%M')])
        return response
