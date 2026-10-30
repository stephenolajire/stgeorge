from django.contrib import admin
from django.utils.html import format_html

from .models import ParishGroup


@admin.register(ParishGroup)
class ParishGroupAdmin(admin.ModelAdmin):
    list_display = ('thumb', 'name', 'is_active', 'order')
    list_display_links = ('thumb', 'name')
    list_editable = ('is_active', 'order')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    readonly_fields = ('image_preview',)
    fields = ('name', 'description', 'image', 'image_preview', 'is_active', 'order')

    @admin.display(description='')
    def thumb(self, obj):
        if not obj.image:
            return ''
        return format_html('<img src="{}" style="width:56px;height:42px;border-radius:4px;object-fit:cover" alt="">', obj.image.url)

    @admin.display(description='Current image')
    def image_preview(self, obj):
        if not obj.image:
            return 'No image'
        return format_html('<img src="{}" style="max-height:180px;border-radius:6px" alt="">', obj.image.url)
