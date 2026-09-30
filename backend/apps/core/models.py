import uuid
from django.db import models

class TimeStampedUUIDModel(models.Model):
    """
    Абстрактная базовая модель с первичным ключом UUID и временными метками.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Уникальный идентификатор записи (UUID4)"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Время создания записи"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Время последнего обновления"
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']
