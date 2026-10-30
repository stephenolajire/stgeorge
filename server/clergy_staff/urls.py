from rest_framework.routers import SimpleRouter

from .views import MemberViewSet

router = SimpleRouter(trailing_slash=True)
router.register('clergy-staff', MemberViewSet, basename='clergy-staff')

urlpatterns = router.urls
