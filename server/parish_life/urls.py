from rest_framework.routers import SimpleRouter

from .views import SectionViewSet

router = SimpleRouter()
router.register('parish-life', SectionViewSet, basename='parish-life')

urlpatterns = router.urls
