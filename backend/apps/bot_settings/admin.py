from django.contrib import admin
from apps.bot_settings.models import BotSettings

@admin.register(BotSettings)
class BotSettingsAdmin(admin.ModelAdmin):
    list_display = ('expert', 'voice_name', 'is_voice_enabled', 'temperature', 'similarity_threshold', 'is_active', 'updated_at')
    list_filter = ('voice_name', 'is_voice_enabled', 'is_active')
    search_fields = ('expert__name', 'expert__email', 'system_prompt', 'telegram_bot_username')
    readonly_fields = ('id', 'created_at', 'updated_at')
