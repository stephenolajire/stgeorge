from django.urls import path
from rest_framework.routers import SimpleRouter

from .api import SacramentFeatureViewSet, SacramentsPageViewSet, SacramentViewSet

router = SimpleRouter()
router.register('sacraments/features', SacramentFeatureViewSet, basename='sacrament-features')
router.register('sacraments', SacramentViewSet, basename='sacraments')

page = SacramentsPageViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update'})

urlpatterns = [path('sacraments/page/', page, name='sacraments-page'), *router.urls]
