from django.db import models
from pgvector.django import VectorField, HnswIndex
from apps.core.models import TimeStampedUUIDModel
from apps.experts.models import Expert

class KnowledgeSourceType(models.TextChoices):
    TRANSCRIPT = 'transcript', 'Транскрипт аудио/видео лекции'
    MEDITATION_GUIDE = 'meditation_guide', 'Сценарий медитации / практики'
    BOOK_CHAPTER = 'book_chapter', 'Глава книги / статья'
    FAQ = 'faq', 'Ответы на частые вопросы (FAQ)'
    RAW_TEXT = 'raw_text', 'Произвольный текст'

class KnowledgeBase(TimeStampedUUIDModel):
    """
    Документ базы знаний конкретного эксперта (транскрипт, лекция, книга, инструкция к медитации).
    """
    expert = models.ForeignKey(
        Expert,
        on_delete=models.CASCADE,
        related_name='knowledge_bases',
        db_index=True,
        verbose_name="Эксперт-владелец"
    )
    title = models.CharField(
        max_length=255,
        verbose_name="Название материала"
    )
    source_type = models.CharField(
        max_length=40,
        choices=KnowledgeSourceType.choices,
        default=KnowledgeSourceType.TRANSCRIPT,
        verbose_name="Тип источника"
    )
    file = models.FileField(
        upload_to='knowledge_uploads/%Y/%m/',
        blank=True,
        null=True,
        verbose_name="Загруженный файл (.txt, .pdf, .docx)"
    )
    raw_text = models.TextField(
        blank=True,
        default="",
        verbose_name="Текстовое содержимое (сырой текст)"
    )
    is_processed = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Векторизован и разбит на чанки"
    )
    processing_error = models.TextField(
        blank=True,
        default="",
        verbose_name="Текст ошибки векторизации (если возникла)"
    )
    total_chunks = models.PositiveIntegerField(
        default=0,
        verbose_name="Количество чанков"
    )

    class Meta:
        verbose_name = "База знаний эксперта"
        verbose_name_plural = "Базы знаний экспертов"
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.title} — {self.expert.name} ({self.get_source_type_display()})"


class KnowledgeChunk(TimeStampedUUIDModel):
    """
    Семантический чанк текста с 384-мерным вектором эмбеддинга для pgvector.
    Векторизация выполняется локально через sentence-transformers на CPU (Zero-Cost).
    """
    knowledge_base = models.ForeignKey(
        KnowledgeBase,
        on_delete=models.CASCADE,
        related_name='chunks',
        verbose_name="Родительский документ"
    )
    expert = models.ForeignKey(
        Expert,
        on_delete=models.CASCADE,
        related_name='knowledge_chunks',
        db_index=True,
        verbose_name="Эксперт-арендатор (Изоляция тенанта)"
    )
    chunk_index = models.PositiveIntegerField(
        default=0,
        verbose_name="Порядковый номер чанка в документе"
    )
    content = models.TextField(
        verbose_name="Текст чанка (фрагмент медитации или ответа)"
    )
    # 384 измерения для paraphrase-multilingual-MiniLM-L12-v2
    embedding = VectorField(
        dimensions=384,
        verbose_name="Вектор эмбеддинга (384 dims)",
        help_text="Плотный вектор, вычисленный локально sentence-transformers на CPU"
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Дополнительные метаданные чанка (токены, таймкод аудио)"
    )

    class Meta:
        verbose_name = "Чанк знаний (Векторный сегмент)"
        verbose_name_plural = "Чанки знаний (Векторные сегменты)"
        ordering = ['chunk_index']
        indexes = [
            # Индекс HNSW для молниеносного приближенного поиска ближайших соседей (ANN)
            HnswIndex(
                name='chunk_vector_hnsw_idx',
                fields=['embedding'],
                m=16,
                ef_construction=64,
                opclasses=['vector_cosine_ops']
            )
        ]

    def __str__(self) -> str:
        snippet = self.content[:60] + "..." if len(self.content) > 60 else self.content
        return f"Чанк #{self.chunk_index} [{self.knowledge_base.title}]: {snippet}"
