from django.urls import path

from . import api

urlpatterns = [
    path('dashboard/', api.summary, name='dashboard'),
    path('analytics/visit/', api.visit, name='analytics-visit'),
    path('analytics/overview/', api.visitor_overview, name='analytics-overview'),
]
