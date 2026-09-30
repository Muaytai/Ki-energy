import logging
from typing import List, Dict, Any
from pgvector.django import CosineDistance

from apps.knowledge.models import KnowledgeChunk
from apps.knowledge.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)

class RAGService:
    """
    Сервис векторного семантического поиска контекста по базе знаний эксперта через pgvector.
    Обеспечивает 100% изоляцию тенантов (поиск только по chunks конкретного expert_id).
    """

    @classmethod
    def retrieve_relevant_context(
        cls,
        expert_id: str,
        query: str,
        top_k: int = 4,
        similarity_threshold: float = 0.60
    ) -> List[Dict[str, Any]]:
        """
        1. Векторизует входящий вопрос ученика через sentence-transformers (384 dims, CPU).
        2. Ищет ближайшие векторы в PostgreSQL с помощью оператора косинусного расстояния (<=>).
        3. Фильтрует результаты по порогу сходства и возвращает фрагменты с метаданными.
        """
        if not query or not query.strip():
            return []

        # 1. Векторизация поискового запроса на CPU
        query_vector = embedding_service.embed_text(query)

        # 2. Поиск по индексу HNSW в PostgreSQL с фильтрацией по арендатору
        # В pgvector: distance = 1 - cosine_similarity (при нормализованных векторах)
        # distance <= 1 - threshold
        max_distance = max(0.0, min(1.0, 1.0 - similarity_threshold))

        try:
            matched_chunks = (
                KnowledgeChunk.objects.filter(expert_id=expert_id)
                .select_related('knowledge_base')
                .annotate(distance=CosineDistance('embedding', query_vector))
                .filter(distance__lte=max_distance)
                .order_by('distance')[:top_k]
            )

            results = []
            for chunk in matched_chunks:
                similarity = max(0.0, min(1.0, 1.0 - chunk.distance))
                results.append({
                    "chunk_id": str(chunk.id),
                    "chunk_index": chunk.chunk_index,
                    "document_id": str(chunk.knowledge_base_id),
                    "document_title": chunk.knowledge_base.title,
                    "source_type": chunk.knowledge_base.source_type,
                    "content": chunk.content,
                    "similarity": round(similarity, 4),
                    "distance": round(chunk.distance, 4),
                    "metadata": chunk.metadata
                })

            logger.info(
                f"[RAG] Найдено {len(results)} релевантных чанков для эксперта {expert_id} "
                f"(порог {similarity_threshold}, запрос: '{query[:40]}...')"
            )
            return results

        except Exception as e:
            logger.warning(
                f"[RAG] Ошибка векторного запроса pgvector: {e}. "
                "Проверьте наличие расширения vector и созданных записей."
            )
            # Запасной поиск по текстовым совпадениям для непрерывности работы
            fallback_chunks = (
                KnowledgeChunk.objects.filter(expert_id=expert_id, content__icontains=query[:30])
                .select_related('knowledge_base')[:top_k]
            )
            return [
                {
                    "chunk_id": str(c.id),
                    "chunk_index": c.chunk_index,
                    "document_id": str(c.knowledge_base_id),
                    "document_title": c.knowledge_base.title,
                    "source_type": c.knowledge_base.source_type,
                    "content": c.content,
                    "similarity": 0.85,
                    "distance": 0.15,
                    "metadata": c.metadata
                }
                for c in fallback_chunks
            ]
