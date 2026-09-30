from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.experts.models import Expert
from apps.experts.serializers import ExpertSerializer, ExpertDetailSerializer
from apps.bot_settings.models import BotSettings

class ExpertViewSet(viewsets.ModelViewSet):
    """
    CRUD API для управления арендаторами (экспертами).
    При создании эксперта автоматически создается дефолтный профиль BotSettings.
    """
    queryset = Expert.objects.all().prefetch_related('bot_settings', 'knowledge_bases')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'niche']
    ordering_fields = ['created_at', 'name', 'subscription_status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'me']:
            return ExpertDetailSerializer
        return ExpertSerializer

    def perform_create(self, serializer):
        expert = serializer.save()
        # Автоматическое создание настроек бота при регистрации нового эксперта
        BotSettings.objects.get_or_create(expert=expert)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        expert = self.get_object()
        return Response({
            "expert_id": expert.id,
            "expert_name": expert.name,
            "subscription_status": expert.subscription_status,
            "total_documents": expert.knowledge_bases.count(),
            "total_vector_chunks": expert.knowledge_chunks.count(),
            "bot_active": getattr(expert.bot_settings, 'is_active', False) if hasattr(expert, 'bot_settings') else False,
            "voice_configured": getattr(expert.bot_settings, 'voice_name', 'None') if hasattr(expert, 'bot_settings') else 'None',
        })
