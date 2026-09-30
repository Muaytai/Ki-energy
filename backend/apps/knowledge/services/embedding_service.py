import os
import logging
from typing import List

logger = logging.getLogger(__name__)

class LocalEmbeddingService:
    """
    ZERO-COST сервис локальной векторизации текстов на базе sentence-transformers.
    Модель: paraphrase-multilingual-MiniLM-L12-v2
    Выходная размерность: 384 измерения.
    Работает 100% локально на CPU без внешних платных API (OpenAI text-embedding-3 и т.д.).
    """

    _instance = None
    _model = None

    MODEL_NAME = os.getenv("EMBEDDING_MODEL", "paraphrase-multilingual-MiniLM-L12-v2")
    DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSIONS", "384"))

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LocalEmbeddingService, cls).__new__(cls)
        return cls._instance

    def _load_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Загрузка локальной модели векторизации: {self.MODEL_NAME} на CPU...")
                # Принудительно используем CPU для легковесности и стабильности
                self._model = SentenceTransformer(self.MODEL_NAME, device='cpu')
                logger.info(f"Модель {self.MODEL_NAME} успешно загружена в память.")
            except ImportError:
                logger.warning(
                    "Пакет sentence-transformers не установлен. "
                    "В контейнере backend используется предзагруженный PyTorch CPU."
                )
                self._model = None
            except Exception as e:
                logger.error(f"Ошибка загрузки модели {self.MODEL_NAME}: {e}")
                self._model = None

    def embed_text(self, text: str) -> List[float]:
        """
        Вычисляет 384-мерный вектор для одного текста.
        Возвращает нормализованный список float.
        """
        vectors = self.embed_batch([text])
        return vectors[0] if vectors else [0.0] * self.DIMENSIONS

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Пакетное вычисление эмбеддингов для списка чанков текста.
        """
        if not texts:
            return []

        self._load_model()

        if self._model is not None:
            # normalize_embeddings=True гарантирует, что скалярное произведение = косинусному сходству
            embeddings = self._model.encode(
                texts,
                batch_size=32,
                show_progress_bar=False,
                normalize_embeddings=True,
                convert_to_numpy=True
            )
            return [vec.tolist() for vec in embeddings]
        else:
            # Детерминированный fallback (384 измерения) для локального окружения без установленного PyTorch
            import hashlib
            import math
            fallback_vectors = []
            for t in texts:
                seed = int(hashlib.sha256(t.encode('utf-8')).hexdigest()[:8], 16)
                vec = []
                for i in range(self.DIMENSIONS):
                    val = math.sin(seed + i * 0.1)
                    vec.append(val)
                # Нормализация вектора (L2 norm)
                norm = math.sqrt(sum(v * v for v in vec)) or 1.0
                fallback_vectors.append([round(v / norm, 6) for v in vec])
            return fallback_vectors

# Синглтон для использования в Celery и REST API
embedding_service = LocalEmbeddingService()
