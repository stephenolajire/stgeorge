from rest_framework.routers import SimpleRouter

from .views import ParishGroupViewSet

router = SimpleRouter()
router.register('parish-groups', ParishGroupViewSet, basename='parish-groups')

urlpatterns = router.urls
