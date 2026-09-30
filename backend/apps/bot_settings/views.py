import base64
from rest_framework import viewsets, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action

from apps.bot_settings.models import BotSettings, EdgeTTSVoice
from apps.bot_settings.serializers import BotSettingsSerializer
from apps.knowledge.services.rag_service import RAGService
from apps.bot_settings.services.openrouter_service import openrouter_client
from apps.bot_settings.services.tts_service import tts_service

class ChatRequestSerializer(serializers.Serializer):
    expert_id = serializers.UUIDField(required=True)
    message = serializers.CharField(max_length=2000, required=True)
    chat_history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )
    request_voice = serializers.BooleanField(default=True)

class BotSettingsViewSet(viewsets.ModelViewSet):
    """
    API для настройки параметров ИИ-аватара: системный промпт, голос Edge-TTS,
    параметры векторизации и Telegram-токен эксперта.
    """
    queryset = BotSettings.objects.select_related('expert').all()
    serializer_class = BotSettingsSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        expert_id = self.request.query_params.get('expert_id')
        if expert_id:
            queryset = queryset.filter(expert_id=expert_id)
        return queryset

    @action(detail=False, methods=['get'])
    def available_voices(self, request):
        """
        Возвращает список доступных бесплатных голосов Edge-TTS с описанием и тембром.
        """
        voices = [
            {
                "id": choice[0],
                "name": choice[1],
                "recommended_for": "Медитации, дыхательные упражнения, расслабление" if "Dmitry" in choice[0] or "Svetlana" in choice[0] else "English mindfulness",
                "cost": "0.00 $ (Free Edge-TTS)"
            }
            for choice in EdgeTTSVoice.choices
        ]
        return Response(voices)

    @action(detail=False, methods=['post'])
    def chat(self, request):
        """
        ПОЛНЫЙ ZERO-COST AI ПАЙПЛАЙН:
        1. Извлечение настроек эксперта (BotSettings).
        2. Векторный RAG поиск по базе знаний через pgvector (<=>).
        3. Запрос к бесплатной модели OpenRouter (:free).
        4. Синтез голосового ответа через edge-tts (нейросетевой голос).
        """
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        expert_id = str(data['expert_id'])
        user_message = data['message']
        chat_history = data.get('chat_history', [])
        request_voice = data.get('request_voice', True)

        # 1. Получаем настройки бота эксперта
        try:
            settings_obj = BotSettings.objects.select_related('expert').get(expert_id=expert_id)
        except BotSettings.DoesNotExist:
            return Response(
                {"error": f"Настройки бота для эксперта {expert_id} не найдены."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Локальный RAG-поиск в pgvector по косинусному расстоянию
        context_chunks = RAGService.retrieve_relevant_context(
            expert_id=expert_id,
            query=user_message,
            top_k=settings_obj.max_context_chunks,
            similarity_threshold=settings_obj.similarity_threshold
        )

        # 3. Генерация ответа в OpenRouter (Free tier: Llama 3.3 70B / Gemini Flash)
        llm_result = openrouter_client.generate_response_sync(
            system_prompt=settings_obj.system_prompt,
            user_message=user_message,
            context_chunks=context_chunks,
            chat_history=chat_history,
            temperature=settings_obj.temperature
        )

        answer_text = llm_result["text"]

        # 4. Синтез речи через Edge-TTS (если включена озвучка)
        audio_base64 = None
        has_voice = False
        if request_voice and settings_obj.is_voice_enabled:
            audio_bytes = tts_service.generate_speech_bytes_sync(
                text=answer_text,
                voice=settings_obj.voice_name,
                rate=settings_obj.voice_rate
            )
            if audio_bytes:
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                has_voice = True

        return Response({
            "expert_id": expert_id,
            "expert_name": settings_obj.expert.name,
            "answer_text": answer_text,
            "model_used": llm_result.get("model", "meta-llama/llama-3.3-70b-instruct:free"),
            "voice_name": settings_obj.voice_name,
            "has_voice": has_voice,
            "audio_base64": audio_base64,
            "context_chunks_used": len(context_chunks),
            "citations": [
                {
                    "title": c.get("document_title"),
                    "similarity": c.get("similarity"),
                    "snippet": c.get("content", "")[:120] + "..."
                }
                for c in context_chunks
            ]
        })
