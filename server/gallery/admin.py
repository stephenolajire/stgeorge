from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html

from .models import GalleryPage, Photo


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('thumb', 'title', 'category', 'date_taken', 'tags')
    list_display_links = ('thumb', 'title')
    list_filter = ('category', 'date_taken')
    search_fields = ('title', 'description', 'tags')
    date_hierarchy = 'date_taken'
    readonly_fields = ('preview', 'created_at', 'updated_at')
    fields = ('image', 'preview', 'title', 'category', 'description', 'date_taken', 'tags', 'created_at', 'updated_at')

    @admin.display(description='')
    def thumb(self, obj):
        return format_html('<img src="{}" style="width:64px;height:44px;border-radius:4px;object-fit:cover" alt="">', obj.image.url) if obj.image else ''

    @admin.display(description='Current image')
    def preview(self, obj):
        return format_html('<img src="{}" style="max-height:220px;border-radius:6px" alt="">', obj.image.url) if obj.image else 'No image'


@admin.register(GalleryPage)
class GalleryPageAdmin(admin.ModelAdmin):
    """A single record: the admin opens its edit form directly."""

    readonly_fields = ['hero_image_preview', 'updated_at']
    fieldsets = (
        ('Banner', {'fields': ('hero_title', 'hero_subtitle', 'hero_image', 'hero_image_preview')}),
        ('Bottom banner', {'fields': ('cta_title', 'cta_text')}),
        (None, {'fields': ('updated_at',)}),
    )

    def changelist_view(self, request, extra_context=None):
        return redirect(reverse('admin:gallery_gallerypage_change', args=[GalleryPage.load().pk]))

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description='Current banner image')
    def hero_image_preview(self, obj):
        return format_html('<img src="{}" style="max-height:180px;border-radius:6px" alt="">', obj.hero_image.url) if obj.hero_image else 'No image'
