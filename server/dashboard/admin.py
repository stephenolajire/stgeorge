from django.contrib import admin

from .models import PageVisit


@admin.register(PageVisit)
class PageVisitAdmin(admin.ModelAdmin):
    list_display = ['path', 'is_mobile', 'created_at']
    list_filter = ['is_mobile']
