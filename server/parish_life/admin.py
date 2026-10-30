from django.contrib import admin
from django.utils.html import format_html

from .models import Section


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('thumb', 'title', 'is_published', 'order', 'updated_at')
    list_display_links = ('thumb', 'title')
    list_editable = ('is_published', 'order')
    list_filter = ('is_published',)
    search_fields = ('title', 'short_description', 'content')
    readonly_fields = ('image_preview', 'created_at', 'updated_at')
    fields = (
        'title',
        'short_description',
        'content',
        'image',
        'image_preview',
        'is_published',
        'order',
        'created_at',
        'updated_at',
    )

    @admin.display(description='')
    def thumb(self, obj):
        if not obj.image:
            return ''
        return format_html('<img src="{}" style="width:64px;height:42px;border-radius:4px;object-fit:cover" alt="">', obj.image.url)

    @admin.display(description='Current image')
    def image_preview(self, obj):
        if not obj.image:
            return 'No image'
        return format_html('<img src="{}" style="max-height:180px;border-radius:6px" alt="">', obj.image.url)
