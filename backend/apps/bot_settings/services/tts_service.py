import os
import re
import io
import asyncio
import logging
from pathlib import Path
from typing import Optional
from django.conf import settings

logger = logging.getLogger(__name__)

class EdgeTTSService:
    """
    ZERO-COST сервис синтеза речи на базе edge-tts.
    Использует официальные нейросетевые голоса Microsoft:
    - ru-RU-DmitryNeural (мужской, спокойный глубокий баритон)
    - ru-RU-SvetlanaNeural (женский, мягкий и медитативный)
    Работает БЕЗ API ключей, БЕЗ подписок, с максимальным качеством звука.
    """

    DEFAULT_VOICE = os.getenv("DEFAULT_TTS_VOICE", "ru-RU-DmitryNeural")
    DEFAULT_RATE = "-10%"  # Слегка замедленный ритм для медитаций
    DEFAULT_PITCH = "+0Hz"

    def clean_text_for_speech(self, text: str) -> str:
        """
        Очищает текст от markdown-разметки (*, #, _, []), ссылок и технических символов,
        чтобы синтез речи звучал плавно и естественно.
        """
        # Удаляем заголовки и жирный шрифт markdown
        text = re.sub(r'#+\s*', '', text)
        text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)
        text = re.sub(r'_{1,3}(.*?)_{1,3}', r'\1', text)
        # Удаляем ссылки [text](url) -> text
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
        # Удаляем URL
        text = re.sub(r'https?://\S+', '', text)
        # Удаляем эмодзи или заменяем частые знаки препинания на паузы
        text = re.sub(r'[•\-—]', ', ', text)
        text = re.sub(r'\s{2,}', ' ', text)
        return text.strip()

    async def generate_speech_bytes_async(
        self,
        text: str,
        voice: Optional[str] = None,
        rate: Optional[str] = None,
        pitch: Optional[str] = None
    ) -> bytes:
        """
        Асинхронно генерирует MP3 аудиопоток в памяти (bytes).
        Идеально для прямой отправки в Telegram Bot через send_voice.
        """
        clean_text = self.clean_text_for_speech(text)
        if not clean_text:
            return b""

        selected_voice = voice or self.DEFAULT_VOICE
        selected_rate = rate or self.DEFAULT_RATE
        selected_pitch = pitch or self.DEFAULT_PITCH

        try:
            import edge_tts
            communicate = edge_tts.Communicate(
                text=clean_text,
                voice=selected_voice,
                rate=selected_rate,
                pitch=selected_pitch
            )

            audio_buffer = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.extend(chunk["data"])

            logger.info(
                f"[Edge-TTS] Успешно синтезировано аудио ({len(audio_buffer)} байт, "
                f"голос: {selected_voice}, rate: {selected_rate})"
            )
            return bytes(audio_buffer)

        except ImportError:
            logger.warning("[Edge-TTS] Пакет edge-tts не установлен. Возвращен пустой буфер.")
            return b""
        except Exception as e:
            logger.exception(f"[Edge-TTS] Ошибка генерации аудио: {e}")
            return b""

    async def save_speech_to_file_async(
        self,
        text: str,
        output_filename: str,
        voice: Optional[str] = None,
        rate: Optional[str] = None
    ) -> str:
        """
        Сохраняет синтезированный звук в медиа-директорию Django и возвращает относительный путь.
        """
        audio_data = await self.generate_speech_bytes_async(text, voice, rate)
        if not audio_data:
            return ""

        media_dir = getattr(settings, 'MEDIA_ROOT', Path('./media')) / 'tts_cache'
        os.makedirs(media_dir, exist_ok=True)

        full_path = media_dir / output_filename
        with open(full_path, 'wb') as f:
            f.write(audio_data)

        return f"/media/tts_cache/{output_filename}"

    def generate_speech_bytes_sync(
        self,
        text: str,
        voice: Optional[str] = None,
        rate: Optional[str] = None
    ) -> bytes:
        """
        Синхронная обертка для синхронных представлений и Celery-воркеров.
        """
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        return loop.run_until_complete(
            self.generate_speech_bytes_async(text, voice, rate)
        )

tts_service = EdgeTTSService()
