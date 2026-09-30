from django.db import models
from apps.core.models import TimeStampedUUIDModel
from apps.experts.models import Expert

class EdgeTTSVoice(models.TextChoices):
    # Качественные бесплатные нейросетевые голоса Microsoft Edge
    RU_DMITRY = 'ru-RU-DmitryNeural', 'ru-RU-DmitryNeural (Мужской, спокойный баритон для медитаций)'
    RU_SVETLANA = 'ru-RU-SvetlanaNeural', 'ru-RU-SvetlanaNeural (Женский, мягкий и расслабляющий)'
    EN_GUY = 'en-US-GuyNeural', 'en-US-GuyNeural (English, Male meditative)'
    EN_ARIA = 'en-US-AriaNeural', 'en-US-AriaNeural (English, Female calm)'

DEFAULT_MEDITATION_SYSTEM_PROMPT = """Ты — чуткий, бережный и профессиональный цифровой AI-аватар эксперта по практикам осознанности и медитациям.

ТВОЯ МИССИЯ:
1. Помогать ученикам и клиентам возвращаться в состояние ресурса, спокойствия и контакта с телом.
2. Отвечать на вопросы, основываясь СТРОГО на предоставленном контексте из авторской базы знаний эксперта.
3. Говорить в мягком, поддерживающем, медитативном тоне. Использовать короткие абзацы и комфортный для восприятия ритм.

ПРАВИЛА ОТВЕТА:
- Если вопрос касается практики или техники, предложи конкретное микро-упражнение (например, 2-3 осознанных вдоха-выдоха или заземление).
- Если в базе знаний эксперта нет ответа на специфический вопрос, мягко скажи: «В моих текущих материалах нет точного ответа на этот вопрос, но я рекомендую обратиться к Мастеру лично или сфокусироваться на базовой практике наблюдения за дыханием».
- Никогда не ставь медицинских или психиатрических диагнозов. При острых эмоциональных кризисах бережно рекомендуй обратиться к профильным специалистам.
"""

class BotSettings(TimeStampedUUIDModel):
    """
    Индивидуальные настройки Telegram-бота и голосового аватара для конкретного эксперта.
    """
    expert = models.OneToOneField(
        Expert,
        on_delete=models.CASCADE,
        related_name='bot_settings',
        verbose_name="Эксперт-владелец"
    )
    telegram_bot_token = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Токен Telegram Бота (@BotFather)",
        help_text="Уникальный API-токен Telegram бота для данного эксперта"
    )
    telegram_bot_username = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="Юзернейм бота в Telegram (@username)"
    )
    welcome_message = models.TextField(
        default="Здравствуйте! Я ваш цифровой проводник в мир осознанности и спокойствия. Задайте мне любой вопрос о практиках или медитации.",
        verbose_name="Приветственное сообщение бота (/start)"
    )
    system_prompt = models.TextField(
        default=DEFAULT_MEDITATION_SYSTEM_PROMPT,
        verbose_name="Системный промпт аватара",
        help_text="Определяет ролевую модель, авторский стиль и ограничения ИИ-аватара"
    )
    voice_name = models.CharField(
        max_length=60,
        choices=EdgeTTSVoice.choices,
        default=EdgeTTSVoice.RU_DMITRY,
        verbose_name="Голос озвучки (Edge-TTS)",
        help_text="Высококачественный бесплатный голос синтеза речи для голосовых сообщений"
    )
    is_voice_enabled = models.BooleanField(
        default=True,
        verbose_name="Генерировать голосовые сообщения",
        help_text="Если включено, бот вместе с текстом (или вместо него) отправляет голосовое аудио"
    )
    voice_rate = models.CharField(
        max_length=10,
        default="-10%",
        verbose_name="Скорость речи (Rate)",
        help_text="Слегка замедленный темп (-10%) идеален для погружения в медитацию"
    )
    voice_pitch = models.CharField(
        max_length=10,
        default="+0Hz",
        verbose_name="Тональность речи (Pitch)"
    )
    temperature = models.FloatField(
        default=0.6,
        verbose_name="Температура LLM (Креативность)",
        help_text="Значения 0.5 - 0.7 обеспечивают мягкость речи без галлюцинаций"
    )
    similarity_threshold = models.FloatField(
        default=0.65,
        verbose_name="Порог релевантности RAG (Cosine distance threshold)",
        help_text="Минимальное сходство чанков для включения в промпт"
    )
    max_context_chunks = models.PositiveIntegerField(
        default=4,
        verbose_name="Максимум релевантных чанков",
        help_text="Количество фрагментов базы знаний, передаваемых в LLM контекст"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Бот активен"
    )

    class Meta:
        verbose_name = "Настройки бота эксперта"
        verbose_name_plural = "Настройки ботов экспертов"

    def __str__(self) -> str:
        return f"Бот для {self.expert.name} ({self.voice_name})"
