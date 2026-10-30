from django.urls import path
from rest_framework.routers import SimpleRouter

from .api import ProjectsPageViewSet, ProjectViewSet

router = SimpleRouter()
router.register('projects', ProjectViewSet, basename='projects')

page = ProjectsPageViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update'})

urlpatterns = [path('projects/page/', page, name='projects-page'), *router.urls]
