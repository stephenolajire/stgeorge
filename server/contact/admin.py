from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse

from .models import FAQ, ContactMessage, ContactPage, ContactReply


class ReplyInline(admin.TabularInline):
    model = ContactReply
    extra = 0
    readonly_fields = ('subject', 'body', 'sent_by', 'sent_at')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False  # replies are sent from the website admin so they are emailed


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'status', 'created_at')
    list_filter = ('status', 'subject', 'created_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('name', 'email', 'phone', 'subject', 'message', 'created_at', 'replied_at')
    inlines = [ReplyInline]


@admin.register(ContactPage)
class ContactPageAdmin(admin.ModelAdmin):
    readonly_fields = ['updated_at']
    fieldsets = (
        ('Banner', {'fields': ('hero_title', 'hero_subtitle', 'hero_image')}),
        ('Contact details (also used in the footer and emails)', {'fields': ('address', 'phone', 'phone_hours', 'email', 'email_note', 'office_days', 'office_hours')}),
        ('Form and map', {'fields': ('form_title', 'form_subtitle', 'map_title', 'map_subtitle', 'map_query', 'directions')}),
        ('Questions and side banner', {'fields': ('faq_title', 'faq_subtitle', 'banner_title', 'banner_quote', 'banner_quote_source', 'banner_image')}),
        (None, {'fields': ('updated_at',)}),
    )

    def changelist_view(self, request, extra_context=None):
        return redirect(reverse('admin:contact_contactpage_change', args=[ContactPage.load().pk]))

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'order')
    list_editable = ('order',)
