from django.urls import path

from .views import AboutPageViewSet

about_page = AboutPageViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update'})

urlpatterns = [
    path('about/', about_page, name='about-page'),
]
