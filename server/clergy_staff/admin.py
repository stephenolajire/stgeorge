from django.contrib import admin
from django.utils.html import format_html

from .models import Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('photo_thumb', 'full_name', 'role', 'category', 'phone', 'email', 'is_active', 'order')
    list_display_links = ('photo_thumb', 'full_name')
    list_editable = ('is_active', 'order')
    list_filter = ('category', 'role', 'is_active')
    search_fields = ('full_name', 'short_bio', 'email', 'phone')
    readonly_fields = ('category', 'photo_preview', 'created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('full_name', 'role', 'category', 'short_bio', 'description')}),
        ('Contact', {'fields': ('phone', 'email')}),
        ('Photo', {'fields': ('photo', 'photo_preview')}),
        ('Display', {'fields': ('is_active', 'order', 'created_at', 'updated_at')}),
    )

    @admin.display(description='')
    def photo_thumb(self, obj):
        if not obj.photo:
            return ''
        return format_html('<img src="{}" style="width:36px;height:36px;border-radius:50%;object-fit:cover" alt="">', obj.photo.url)

    @admin.display(description='Current photo')
    def photo_preview(self, obj):
        if not obj.photo:
            return 'No photo'
        return format_html('<img src="{}" style="max-height:160px;border-radius:6px" alt="">', obj.photo.url)
