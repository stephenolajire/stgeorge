from django.urls import path
from rest_framework.routers import SimpleRouter

from .api import HomeHighlightViewSet, HomePageViewSet, QuickLinkViewSet, SubscriberViewSet

router = SimpleRouter()
router.register('home/highlights', HomeHighlightViewSet, basename='home-highlights')
router.register('home/links', QuickLinkViewSet, basename='home-links')
router.register('subscribers', SubscriberViewSet, basename='subscribers')

page = HomePageViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update'})

urlpatterns = [path('home/', page, name='home-page'), *router.urls]
