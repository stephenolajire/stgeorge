from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse

from .models import Event, NewsEventsPage, NewsPost


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'starts_at', 'category', 'location', 'is_published', 'is_featured')
    list_editable = ('is_published', 'is_featured')
    list_filter = ('category', 'is_published', 'is_featured')
    search_fields = ('title', 'short_description', 'content')
    date_hierarchy = 'starts_at'


@admin.register(NewsPost)
class NewsPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'published_on', 'category', 'is_published', 'is_featured')
    list_editable = ('is_published', 'is_featured')
    list_filter = ('category', 'is_published', 'is_featured')
    search_fields = ('title', 'short_description', 'content')
    date_hierarchy = 'published_on'


@admin.register(NewsEventsPage)
class NewsEventsPageAdmin(admin.ModelAdmin):
    readonly_fields = ['updated_at']

    def changelist_view(self, request, extra_context=None):
        return redirect(reverse('admin:news_events_newseventspage_change', args=[NewsEventsPage.load().pk]))

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
