from django.urls import path
from rest_framework.routers import SimpleRouter

from .api import GalleryPageViewSet, PhotoViewSet

router = SimpleRouter()
router.register('gallery', PhotoViewSet, basename='gallery')

page = GalleryPageViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update'})

urlpatterns = [path('gallery/page/', page, name='gallery-page'), *router.urls]
