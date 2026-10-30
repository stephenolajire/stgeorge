from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html

from .models import Sacrament, SacramentFeature, SacramentsPage


def image_preview(image, height=180):
    if not image:
        return 'No image'
    return format_html('<img src="{}" style="max-height:{}px;border-radius:6px" alt="">', image.url, height)


@admin.register(Sacrament)
class SacramentAdmin(admin.ModelAdmin):
    list_display = ('thumb', 'title', 'icon', 'is_published', 'order')
    list_display_links = ('thumb', 'title')
    list_editable = ('is_published', 'order')
    list_filter = ('is_published',)
    search_fields = ('title', 'short_description', 'content')
    readonly_fields = ('preview',)
    fields = ('title', 'icon', 'short_description', 'content', 'image', 'preview', 'is_published', 'order')

    @admin.display(description='')
    def thumb(self, obj):
        if not obj.image:
            return ''
        return format_html('<img src="{}" style="width:56px;height:42px;border-radius:4px;object-fit:cover" alt="">', obj.image.url)

    @admin.display(description='Current image')
    def preview(self, obj):
        return image_preview(obj.image)


@admin.register(SacramentsPage)
class SacramentsPageAdmin(admin.ModelAdmin):
    """A single record: the admin opens its edit form directly."""

    readonly_fields = ['hero_image_preview', 'updated_at']
    fieldsets = (
        ('Banner', {'fields': ('hero_title', 'hero_subtitle', 'hero_image', 'hero_image_preview')}),
        ('About the sacraments', {'fields': ('intro_title', 'intro_text', 'quote_text', 'quote_source')}),
        ('Sacraments heading', {'fields': ('list_title', 'list_subtitle')}),
        ('Bottom banner', {'fields': ('cta_title', 'cta_text')}),
        (None, {'fields': ('updated_at',)}),
    )

    def changelist_view(self, request, extra_context=None):
        return redirect(reverse('admin:sacraments_sacramentspage_change', args=[SacramentsPage.load().pk]))

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description='Current banner image')
    def hero_image_preview(self, obj):
        return image_preview(obj.hero_image)


@admin.register(SacramentFeature)
class SacramentFeatureAdmin(admin.ModelAdmin):
    list_display = ('title', 'text', 'icon', 'order')
    list_editable = ('order',)
