from django.contrib import admin
from apps.experts.models import Expert

@admin.register(Expert)
class ExpertAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'niche', 'subscription_status', 'is_active', 'created_at')
    list_filter = ('subscription_status', 'is_active', 'created_at')
    search_fields = ('name', 'email', 'niche', 'bio')
    readonly_fields = ('id', 'created_at', 'updated_at')
