from rest_framework import serializers
from apps.experts.models import Expert
from apps.bot_settings.models import BotSettings

class BotSettingsNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotSettings
        fields = [
            'id',
            'telegram_bot_username',
            'voice_name',
            'is_voice_enabled',
            'temperature',
            'similarity_threshold',
            'max_context_chunks',
            'is_active',
        ]

class ExpertSerializer(serializers.ModelSerializer):
    has_active_subscription = serializers.BooleanField(read_only=True)
    chunks_count = serializers.SerializerMethodField()

    class Meta:
        model = Expert
        fields = [
            'id',
            'email',
            'name',
            'niche',
            'bio',
            'subscription_status',
            'subscription_ends_at',
            'is_active',
            'has_active_subscription',
            'chunks_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'has_active_subscription', 'chunks_count']

    def get_chunks_count(self, obj) -> int:
        return obj.knowledge_chunks.count()


class ExpertDetailSerializer(ExpertSerializer):
    bot_settings = BotSettingsNestedSerializer(read_only=True)

    class Meta(ExpertSerializer.Meta):
        fields = ExpertSerializer.Meta.fields + ['bot_settings']
