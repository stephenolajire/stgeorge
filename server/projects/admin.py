from django.contrib import admin

from .models import Project, ProjectsPage


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'progress', 'target_amount', 'target_date']
    list_filter = ['status', 'category']
    search_fields = ['title', 'short_description']


@admin.register(ProjectsPage)
class ProjectsPageAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not ProjectsPage.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
