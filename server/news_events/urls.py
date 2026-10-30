from django.urls import path
from rest_framework.routers import SimpleRouter

from .api import EventViewSet, NewsEventsPageViewSet, NewsPostViewSet

router = SimpleRouter()
router.register('events', EventViewSet, basename='events')
router.register('news', NewsPostViewSet, basename='news')

page = NewsEventsPageViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update'})

urlpatterns = [path('news-events/page/', page, name='news-events-page'), *router.urls]
