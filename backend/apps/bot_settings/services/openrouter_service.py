import os
import json
import logging
from typing import List, Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

class OpenRouterClient:
    """
    ZERO-COST клиент к OpenRouter API для работы с бесплатными LLM моделями (:free).
    По умолчанию: meta-llama/llama-3.3-70b-instruct:free
    Альтернативы: google/gemini-2.0-flash-exp:free, mistralai/mistral-small-24b-instruct-2501:free
    """

    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY", "")
        self.model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
        self.base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip('/')
        self.site_url = os.getenv("APP_URL", "https://mindavatar.internal")
        self.site_name = "MindAvatar SaaS"

    def _build_context_block(self, context_chunks: List[Dict[str, Any]]) -> str:
        """
        Форматирует найденные в pgvector чанки в структурированный контекстный блок.
        """
        if not context_chunks:
            return ""

        context_lines = [
            "\n=== АВТОРСКИЙ КОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ ЭКСПЕРТА ===",
            "Используй данные фрагменты для формирования точного и бережного ответа:\n"
        ]

        for i, chunk in enumerate(context_chunks, 1):
            title = chunk.get("document_title", "Материал эксперта")
            content = chunk.get("content", "").strip()
            context_lines.append(f"[Фрагмент #{i} | Источник: {title}]:\n{content}\n")

        context_lines.append("=== КОНЕЦ КОНТЕКСТА ===\n")
        return "\n".join(context_lines)

    def prepare_messages(
        self,
        system_prompt: str,
        user_message: str,
        context_chunks: List[Dict[str, Any]] = None,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> List[Dict[str, str]]:
        """
        Собирает итоговый массив сообщений для LLM:
        системный промпт + вставленный контекст pgvector + история сообщений + текущий вопрос.
        """
        context_str = self._build_context_block(context_chunks or [])
        full_system_prompt = f"{system_prompt}\n{context_str}".strip()

        messages = [
            {"role": "system", "content": full_system_prompt}
        ]

        # Добавление истории диалога (до 10 последних реплик)
        if chat_history:
            for item in chat_history[-10:]:
                role = item.get("role", "user")
                content = item.get("content", "")
                if role in ["user", "assistant"] and content:
                    messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_message})
        return messages

    async def generate_response_async(
        self,
        system_prompt: str,
        user_message: str,
        context_chunks: List[Dict[str, Any]] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.6,
        max_tokens: int = 800
    ) -> Dict[str, Any]:
        """
        Асинхронный вызов бесплатной LLM через OpenRouter API.
        """
        messages = self.prepare_messages(system_prompt, user_message, context_chunks, chat_history)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": self.site_url,
            "X-Title": self.site_name,
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        # Если API ключ отсутствует или заглушка, возвращаем бережный локальный ответ на основе чанков
        if not self.api_key or "placeholder" in self.api_key or "your_" in self.api_key:
            logger.info("[OpenRouter] Ключ API еще не настроен. Формирование качественного локального ответа на основе RAG-контекста.")
            return self._build_local_mindful_response(user_message, context_chunks)

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )

                if response.status_code == 200:
                    data = response.json()
                    answer = data["choices"][0]["message"]["content"]
                    return {
                        "text": answer.strip(),
                        "model": data.get("model", self.model),
                        "used_context_chunks": len(context_chunks or []),
                        "citations": [c.get("document_title") for c in (context_chunks or [])]
                    }
                else:
                    logger.warning(f"[OpenRouter API Error] {response.status_code}: {response.text}")
                    return self._build_local_mindful_response(user_message, context_chunks)

        except Exception as e:
            logger.exception(f"[OpenRouter] Исключение при запросе к LLM: {e}")
            return self._build_local_mindful_response(user_message, context_chunks)

    def generate_response_sync(
        self,
        system_prompt: str,
        user_message: str,
        context_chunks: List[Dict[str, Any]] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.6,
        max_tokens: int = 800
    ) -> Dict[str, Any]:
        """
        Синхронная версия для вызова из стандартных Django view / Celery.
        """
        import asyncio
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        return loop.run_until_complete(
            self.generate_response_async(
                system_prompt, user_message, context_chunks, chat_history, temperature, max_tokens
            )
        )

    def _build_local_mindful_response(
        self,
        user_message: str,
        context_chunks: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Бережный генератор ответа на базе извлеченного RAG-контекста,
        гарантирующий мгновенный ответ до внесения внешнего ключа OpenRouter.
        """
        chunks = context_chunks or []
        if chunks:
            best_chunk = chunks[0]["content"]
            doc_title = chunks[0].get("document_title", "База знаний")
            answer = (
                f"Здравствуйте. Сделайте глубокий, спокойный вдох и мягкий выдох.\n\n"
                f"Опираясь на материалы мастера («{doc_title}»):\n\n"
                f"«{best_chunk[:350]}...»\n\n"
                f"Побудьте с этим ощущением несколько секунд. Если вам требуется углубить практику — задайте уточняющий вопрос."
            )
        else:
            answer = (
                "Здравствуйте. Сделайте спокойный вдох и почувствуйте опору под собой.\n\n"
                "Чтобы помочь вам глубже, я рекомендую сейчас просто понаблюдать за движением дыхания: "
                "вдох — прохлада, выдох — тепло и расслабление в плечах. Наш аватар готов ответить на любые вопросы по вашим практикам."
            )

        return {
            "text": answer,
            "model": f"{self.model} (local-rag-direct)",
            "used_context_chunks": len(chunks),
            "citations": [c.get("document_title") for c in chunks]
        }

openrouter_client = OpenRouterClient()
