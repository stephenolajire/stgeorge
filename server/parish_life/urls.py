from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import ActivityViewSet, HighlightViewSet, ParishLifePageViewSet

router = SimpleRouter()
router.register('parish-life/highlights', HighlightViewSet, basename='parish-life-highlights')
router.register('parish-life/activities', ActivityViewSet, basename='parish-life-activities')

page = ParishLifePageViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update'})

urlpatterns = [path('parish-life/', page, name='parish-life-page'), *router.urls]
