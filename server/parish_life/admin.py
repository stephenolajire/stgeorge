from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html

from .models import Activity, Highlight, ParishLifePage


def image_preview(image, height=160):
    if not image:
        return 'No image'
    return format_html('<img src="{}" style="max-height:{}px;border-radius:6px" alt="">', image.url, height)


@admin.register(ParishLifePage)
class ParishLifePageAdmin(admin.ModelAdmin):
    """A single record: the admin opens its edit form directly."""

    readonly_fields = ['hero_image_preview', 'intro_image_preview', 'updated_at']
    fieldsets = (
        ('Banner', {'fields': ('hero_title', 'hero_subtitle', 'hero_image', 'hero_image_preview')}),
        ('Introduction', {'fields': ('intro_title', 'intro_text', 'intro_image', 'intro_image_preview')}),
        (None, {'fields': ('updated_at',)}),
    )

    def changelist_view(self, request, extra_context=None):
        return redirect(reverse('admin:parish_life_parishlifepage_change', args=[ParishLifePage.load().pk]))

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description='Current banner image')
    def hero_image_preview(self, obj):
        return image_preview(obj.hero_image)

    @admin.display(description='Current introduction image')
    def intro_image_preview(self, obj):
        return image_preview(obj.intro_image)


@admin.register(Highlight)
class HighlightAdmin(admin.ModelAdmin):
    list_display = ('title', 'text', 'icon', 'order')
    list_editable = ('order',)


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('thumb', 'title', 'is_published', 'order')
    list_display_links = ('thumb', 'title')
    list_editable = ('is_published', 'order')
    readonly_fields = ('preview',)
    fields = ('title', 'short_description', 'content', 'image', 'preview', 'is_published', 'order')

    @admin.display(description='')
    def thumb(self, obj):
        if not obj.image:
            return ''
        return format_html('<img src="{}" style="width:64px;height:40px;border-radius:4px;object-fit:cover" alt="">', obj.image.url)

    @admin.display(description='Current image')
    def preview(self, obj):
        return image_preview(obj.image)
