from datetime import date, timedelta

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Count
from django.utils.dateparse import parse_date
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from core.permissions import IsAdminOrReadOnly
from core.signals import bulk_changed
from core.views import DeleteImagesMixin

from .models import Category, GalleryPage, Photo
from .serializers import (
    GalleryPageSerializer,
    IdsSerializer,
    MoveSerializer,
    PhotoSerializer,
    UploadSerializer,
    title_from_filename,
)

ORDERING = {'newest': ['-date_taken', '-id'], 'oldest': ['date_taken', 'id'], 'title': ['title', 'id']}


class PhotoPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    # Up to 200 so the public slideshow can load a whole day's photos in one request.
    max_page_size = 200


class PhotoViewSet(DeleteImagesMixin, viewsets.ModelViewSet):
    """
    Gallery photos.

    GET    /api/gallery/                list, 12 per page (?page_size= up to 48)
           ?category=<key>  ?search=<text>  ?date=month|3months|year  ?date_taken=YYYY-MM-DD
           ?ordering=newest|oldest|title
    GET    /api/gallery/categories/     public: each category with its photo count and newest photo (cover)
    GET    /api/gallery/albums/?category=<key>   public: that category's photos grouped by day
    POST   /api/gallery/                one photo (staff; multipart with `image`)
    PATCH  /api/gallery/<id>/           update details or replace the image (staff)
    DELETE /api/gallery/<id>/           delete (staff)
    GET    /api/gallery/summary/        photo count per category, and the category list
    POST   /api/gallery/upload/         several photos at once: files[], category, date_taken (staff)
    POST   /api/gallery/bulk-delete/    {ids} (staff)
    POST   /api/gallery/bulk-move/      {ids, category} (staff)
    """

    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = PhotoPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'tags']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    lookup_value_regex = r'\d+'

    def get_queryset(self):
        queryset = Photo.objects.all()
        params = self.request.query_params
        if (category := params.get('category')) in Category.values:
            queryset = queryset.filter(category=category)

        if taken := parse_date(params.get('date_taken') or ''):
            queryset = queryset.filter(date_taken=taken)

        today = date.today()
        since = {
            'month': today.replace(day=1),
            '3months': today - timedelta(days=90),
            'year': today.replace(month=1, day=1),
        }.get(params.get('date'))
        if since:
            queryset = queryset.filter(date_taken__gte=since)

        return queryset.order_by(*ORDERING.get(params.get('ordering'), ORDERING['newest']))

    @action(detail=False, methods=['get'])
    def summary(self, request):
        counts = dict(Photo.objects.values_list('category').annotate(n=Count('id')))
        return Response(
            {
                'counts': {'all': sum(counts.values()), **{c.value: counts.get(c.value, 0) for c in Category}},
                'categories': [{'value': c.value, 'label': c.label} for c in Category],
            }
        )

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Categories that have photos, with their count and newest photo as the cover."""
        counts = dict(Photo.objects.values_list('category').annotate(n=Count('id')))
        result = []
        for category in Category:
            if not counts.get(category.value):
                continue
            cover = Photo.objects.filter(category=category.value).order_by('-date_taken', '-id').first()
            result.append(
                {
                    'value': category.value,
                    'label': category.label,
                    'count': counts[category.value],
                    'cover': request.build_absolute_uri(cover.image.url) if cover else None,
                }
            )
        return Response(result)

    @action(detail=False, methods=['get'])
    def albums(self, request):
        """One album per day in a category, newest day first: {date, count, cover}."""
        category = request.query_params.get('category')
        if category not in Category.values:
            return Response({'category': ['Choose a valid category.']}, status=status.HTTP_400_BAD_REQUEST)
        photos = Photo.objects.filter(category=category)
        days = photos.values('date_taken').annotate(count=Count('id')).order_by('-date_taken')
        albums = []
        for day in days:
            cover = photos.filter(date_taken=day['date_taken']).order_by('id').first()
            albums.append(
                {
                    'date': day['date_taken'],
                    'count': day['count'],
                    'cover': request.build_absolute_uri(cover.image.url),
                }
            )
        return Response(albums)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def upload(self, request):
        """Create one photo per file. Titles come from the file names and can be edited afterwards."""
        serializer = UploadSerializer(
            data={
                'files': request.FILES.getlist('files'),
                'category': request.data.get('category', Category.OTHERS),
                **({'date_taken': request.data['date_taken']} if request.data.get('date_taken') else {}),
            }
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        photos = []
        for file in data['files']:
            photo = Photo(image=file, title=title_from_filename(file.name), category=data['category'])
            if 'date_taken' in data:
                photo.date_taken = data['date_taken']
            try:
                photo.full_clean()  # file type and size checks
            except DjangoValidationError as e:
                messages = e.message_dict.get('image', e.messages)
                return Response({'files': [f'{file.name}: {messages[0]}']}, status=status.HTTP_400_BAD_REQUEST)
            photos.append(photo)

        # Every file passed, so save them all (nothing is written if any file was rejected).
        with transaction.atomic():
            for photo in photos:
                photo.save()
        return Response(self.get_serializer(photos, many=True).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='bulk-delete', permission_classes=[IsAdminUser])
    def bulk_delete(self, request):
        serializer = IdsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        photos = list(Photo.objects.filter(id__in=serializer.validated_data['ids']))
        files = [p.image.name for p in photos if p.image]
        with transaction.atomic():
            Photo.objects.filter(id__in=[p.id for p in photos]).delete()
            transaction.on_commit(lambda: [Photo._meta.get_field('image').storage.delete(f) for f in files])
        return Response({'deleted': len(photos)})

    @action(detail=False, methods=['post'], url_path='bulk-move', permission_classes=[IsAdminUser])
    def bulk_move(self, request):
        serializer = MoveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        moved = Photo.objects.filter(id__in=serializer.validated_data['ids']).update(
            category=serializer.validated_data['category']
        )
        # update() does not fire post_save: announce the change for live updates.
        transaction.on_commit(lambda: bulk_changed.send(sender=Photo))
        return Response({'moved': moved})


class GalleryPageViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    Text and hero image of the public Gallery page (a single record, like the About page).

    GET   /api/gallery/page/
    PATCH /api/gallery/page/   staff only; multipart for the image, remove_hero_image=true clears it
    """

    serializer_class = GalleryPageSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        obj = GalleryPage.load()
        self.check_object_permissions(self.request, obj)
        return obj
