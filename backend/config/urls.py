from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter

from apps.experts.views import ExpertViewSet
from apps.bot_settings.views import BotSettingsViewSet
from apps.knowledge.views import KnowledgeBaseViewSet, KnowledgeChunkViewSet

router = DefaultRouter()
router.register(r'experts', ExpertViewSet, basename='expert')
router.register(r'bot-settings', BotSettingsViewSet, basename='bot-settings')
router.register(r'knowledge', KnowledgeBaseViewSet, basename='knowledge')
router.register(r'knowledge-chunks', KnowledgeChunkViewSet, basename='knowledge-chunk')

def health_check(request):
    return JsonResponse({
        "status": "healthy",
        "service": "mindavatar-backend",
        "version": "1.0.0",
        "stage": "Stage 2: Database & Multi-tenancy (DRF) Active",
        "zero_cost_ai": {
            "llm": "OpenRouter (Free Tier)",
            "embeddings": "sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2, 384 dims CPU)",
            "tts": "edge-tts (Microsoft Neural Voices)"
        },
        "endpoints": [
            "/api/experts/",
            "/api/bot-settings/",
            "/api/bot-settings/available_voices/",
            "/api/knowledge/",
            "/api/knowledge-chunks/",
            "/api/knowledge-chunks/search/"
        ]
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/', include(router.urls)),
]
