from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html

from .models import AboutPage


@admin.register(AboutPage)
class AboutPageAdmin(admin.ModelAdmin):
    """The About page is a single record: the admin opens its edit form directly."""

    readonly_fields = ['hero_image_preview', 'main_image_preview', 'history_image_preview', 'updated_at']
    fieldsets = (
        ('Hero section', {'fields': ('hero_title', 'hero_subtitle', 'hero_image', 'hero_image_preview')}),
        ('Main content', {'fields': ('description', 'main_image', 'main_image_preview')}),
        ('Mission & vision', {'fields': ('mission', 'vision')}),
        ('Core values & patron', {'fields': ('core_values', 'patron')}),
        ('History', {'fields': ('history_title', 'history', 'history_image', 'history_image_preview')}),
        ('Parish information', {'fields': ('established', 'diocese', 'parish_priest', 'location')}),
        (None, {'fields': ('updated_at',)}),
    )

    def changelist_view(self, request, extra_context=None):
        # Skip the one-row list and go straight to the edit form.
        page = AboutPage.load()
        return redirect(reverse('admin:about_aboutpage_change', args=[page.pk]))

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description='Current hero image')
    def hero_image_preview(self, obj):
        return self._preview(obj.hero_image)

    @admin.display(description='Current main image')
    def main_image_preview(self, obj):
        return self._preview(obj.main_image)

    @admin.display(description='Current history image')
    def history_image_preview(self, obj):
        return self._preview(obj.history_image)

    @staticmethod
    def _preview(image):
        if not image:
            return 'No image'
        return format_html('<img src="{}" style="max-height: 160px; border-radius: 6px;" alt="">', image.url)
