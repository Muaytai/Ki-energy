import logging
from celery import shared_task
from django.db import transaction

from apps.knowledge.models import KnowledgeBase, KnowledgeChunk
from apps.knowledge.services.chunking_service import DocumentChunker
from apps.knowledge.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)

@shared_task(bind=True, name="process_knowledge_document", max_retries=3, default_retry_delay=10)
def process_knowledge_document(self, knowledge_base_id: str):
    """
    Фоновая Celery-таска для асинхронного парсинга документа эксперта,
    нарезки на чанки и вычисления 384-мерных эмбеддингов через sentence-transformers.
    """
    logger.info(f"[Celery] Начало фоновой обработки документа: {knowledge_base_id}")

    try:
        doc = KnowledgeBase.objects.select_related('expert').get(id=knowledge_base_id)
    except KnowledgeBase.DoesNotExist:
        logger.error(f"[Celery] Документ {knowledge_base_id} не найден в базе.")
        return {"status": "error", "message": "Document not found"}

    try:
        chunker = DocumentChunker(chunk_size=750, chunk_overlap=120)

        # 1. Извлечение текста (из загруженного файла или из поля raw_text)
        extracted_text = ""
        if doc.file:
            try:
                extracted_text = chunker.extract_text(doc.file, doc.file.name)
            except Exception as file_err:
                logger.warning(f"[Celery] Ошибка чтения файла {doc.file.name}: {file_err}")

        if not extracted_text.strip():
            extracted_text = doc.raw_text or ""

        if not extracted_text.strip():
            doc.is_processed = False
            doc.processing_error = "Файл пуст или не удалось извлечь текстовые данные."
            doc.save(update_fields=['is_processed', 'processing_error'])
            return {"status": "empty", "message": doc.processing_error}

        # 2. Нарезка на семантические чанки
        extra_meta = {
            "document_id": str(doc.id),
            "document_title": doc.title,
            "source_type": doc.source_type,
            "expert_name": doc.expert.name,
        }
        chunks_data = chunker.split_into_chunks(extracted_text, extra_metadata=extra_meta)
        logger.info(f"[Celery] Документ '{doc.title}' разбит на {len(chunks_data)} чанков.")

        if not chunks_data:
            doc.is_processed = True
            doc.total_chunks = 0
            doc.save(update_fields=['is_processed', 'total_chunks'])
            return {"status": "success", "chunks_count": 0}

        # 3. Локальная векторизация на CPU через sentence-transformers (Zero-Cost)
        texts_to_embed = [c["content"] for c in chunks_data]
        embeddings = embedding_service.embed_batch(texts_to_embed)

        # 4. Атомарное сохранение чанков с 384-мерными векторами в PostgreSQL (pgvector)
        chunk_instances = []
        for i, chunk_info in enumerate(chunks_data):
            chunk_instances.append(
                KnowledgeChunk(
                    knowledge_base=doc,
                    expert=doc.expert,  # Гарантия мультиарендной изоляции
                    chunk_index=chunk_info["chunk_index"],
                    content=chunk_info["content"],
                    embedding=embeddings[i],
                    metadata=chunk_info.get("metadata", {})
                )
            )

        with transaction.atomic():
            # Удаляем старые чанки при повторной индексации
            KnowledgeChunk.objects.filter(knowledge_base=doc).delete()
            # Пакетная вставка
            KnowledgeChunk.objects.bulk_create(chunk_instances, batch_size=100)

            # Обновление статуса документа
            doc.is_processed = True
            doc.processing_error = ""
            doc.total_chunks = len(chunk_instances)
            doc.save(update_fields=['is_processed', 'processing_error', 'total_chunks'])

        logger.info(f"[Celery] Документ '{doc.title}' успешно проиндексирован ({len(chunk_instances)} чанков).")
        return {
            "status": "success",
            "document_id": str(doc.id),
            "chunks_count": len(chunk_instances),
            "dimensions": 384
        }

    except Exception as exc:
        logger.exception(f"[Celery] Ошибка при обработке документа {knowledge_base_id}: {exc}")
        doc.is_processed = False
        doc.processing_error = str(exc)
        doc.save(update_fields=['is_processed', 'processing_error'])
        # Retry with exponential backoff
        raise self.retry(exc=exc)
