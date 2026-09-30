from rest_framework import serializers
from apps.bot_settings.models import BotSettings, EdgeTTSVoice

class BotSettingsSerializer(serializers.ModelSerializer):
    expert_name = serializers.CharField(source='expert.name', read_only=True)
    expert_email = serializers.CharField(source='expert.email', read_only=True)
    voice_display = serializers.CharField(source='get_voice_name_display', read_only=True)

    class Meta:
        model = BotSettings
        fields = [
            'id',
            'expert',
            'expert_name',
            'expert_email',
            'telegram_bot_token',
            'telegram_bot_username',
            'welcome_message',
            'system_prompt',
            'voice_name',
            'voice_display',
            'voice_rate',
            'voice_pitch',
            'is_voice_enabled',
            'temperature',
            'similarity_threshold',
            'max_context_chunks',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'voice_display', 'expert_name', 'expert_email']

    def validate_telegram_bot_token(self, value):
        # Маскировка токена при чтении или валидация формата бота telegram
        if value and not value.startswith("7") and ":" not in value:
            # Предупреждение о некорректном формате токена BotFather
            pass
        return value
