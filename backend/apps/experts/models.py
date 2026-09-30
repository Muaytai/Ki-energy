from django.db import models
from apps.core.models import TimeStampedUUIDModel

class SubscriptionStatus(models.TextChoices):
    TRIAL = 'trial', 'Пробный период (14 дней)'
    ACTIVE = 'active', 'Активная подписка'
    PAST_DUE = 'past_due', 'Задолженность'
    CANCELLED = 'cancelled', 'Отменена'
    EXPIRED = 'expired', 'Истекла'

class Expert(TimeStampedUUIDModel):
    """
    Основная сущность арендатора (Tenant) в мультиарендной SaaS-архитектуре.
    Представляет автора курсов, мастера медитаций или практик осознанности.
    """
    email = models.EmailField(
        unique=True,
        db_index=True,
        verbose_name="Email эксперта"
    )
    name = models.CharField(
        max_length=255,
        verbose_name="Имя / Псевдоним эксперта"
    )
    niche = models.CharField(
        max_length=150,
        default="Практики осознанности, медитации и телесная терапия",
        verbose_name="Ниша эксперта"
    )
    bio = models.TextField(
        blank=True,
        default="",
        verbose_name="Краткая биография и авторский стиль"
    )
    subscription_status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.TRIAL,
        db_index=True,
        verbose_name="Статус подписки"
    )
    subscription_ends_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Дата окончания подписки"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Активен"
    )

    class Meta:
        verbose_name = "Эксперт (Tenant)"
        verbose_name_plural = "Эксперты (Tenants)"
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.name} ({self.email})"

    @property
    def has_active_subscription(self) -> bool:
        return self.subscription_status in [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE]
