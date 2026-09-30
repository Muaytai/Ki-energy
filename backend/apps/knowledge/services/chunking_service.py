import io
import os
import re
from typing import List, Dict, Any

class DocumentChunker:
    """
    Сервис для извлечения текста из различных форматов файлов
    и интеллектуального разбиения на семантические чанки с перекрытием (overlap).
    Оптимизирован для транскриптов медитаций, лекций и инструкций к практикам.
    """

    def __init__(self, chunk_size: int = 700, chunk_overlap: int = 120):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def extract_text(self, file_path_or_obj: Any, file_name: str = "") -> str:
        """
        Извлекает сырой текст из файлов .txt, .pdf, .docx, .md
        """
        if not file_name and hasattr(file_path_or_obj, 'name'):
            file_name = file_path_or_obj.name

        ext = os.path.splitext(file_name)[1].lower() if file_name else ".txt"

        try:
            if ext in ['.txt', '.md', '.rtf']:
                if hasattr(file_path_or_obj, 'read'):
                    content = file_path_or_obj.read()
                    if isinstance(content, bytes):
                        return content.decode('utf-8', errors='ignore')
                    return str(content)
                elif os.path.exists(str(file_path_or_obj)):
                    with open(file_path_or_obj, 'r', encoding='utf-8', errors='ignore') as f:
                        return f.read()

            elif ext == '.pdf':
                try:
                    import pypdf
                    reader = pypdf.PdfReader(file_path_or_obj)
                    text_parts = []
                    for page_num, page in enumerate(reader.pages):
                        text = page.extract_text() or ""
                        if text.strip():
                            text_parts.append(text)
                    return "\n\n".join(text_parts)
                except Exception as e:
                    return f"[Ошибка чтения PDF: {str(e)}]"

            elif ext in ['.docx', '.doc']:
                try:
                    import docx
                    doc = docx.Document(file_path_or_obj)
                    return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
                except Exception as e:
                    return f"[Ошибка чтения DOCX: {str(e)}]"

        except Exception as e:
            return f"[Ошибка при обработке файла: {str(e)}]"

        return ""

    def clean_text(self, text: str) -> str:
        """
        Очищает текст от лишних пробельных символов и нормализует переносы строк.
        """
        text = re.sub(r'\r\n|\r', '\n', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'[ \t]{2,}', ' ', text)
        return text.strip()

    def split_into_chunks(self, text: str, extra_metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Разбивает текст на фрагменты оптимальной длины с сохранением логических границ
        (абзацы, предложения, знаки препинания).
        """
        cleaned = self.clean_text(text)
        if not cleaned:
            return []

        extra_meta = extra_metadata or {}
        
        # Если текст меньше одного чанка, возвращаем его целиком
        if len(cleaned) <= self.chunk_size:
            return [{
                "chunk_index": 0,
                "content": cleaned,
                "metadata": {
                    **extra_meta,
                    "char_count": len(cleaned),
                    "word_count": len(cleaned.split()),
                }
            }]

        chunks = []
        # Разделители по приоритету сохранения контекста
        separators = ["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " "]
        
        start_idx = 0
        chunk_idx = 0
        total_len = len(cleaned)

        while start_idx < total_len:
            end_idx = min(start_idx + self.chunk_size, total_len)

            if end_idx < total_len:
                # Ищем естественный разделитель ближе к концу окна
                best_split = -1
                for sep in separators:
                    pos = cleaned.rfind(sep, start_idx + self.chunk_overlap, end_idx)
                    if pos != -1:
                        best_split = pos + len(sep)
                        break

                if best_split != -1:
                    end_idx = best_split

            chunk_text = cleaned[start_idx:end_idx].strip()
            if chunk_text:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "content": chunk_text,
                    "metadata": {
                        **extra_meta,
                        "start_char": start_idx,
                        "end_char": end_idx,
                        "char_count": len(chunk_text),
                        "word_count": len(chunk_text.split()),
                    }
                })
                chunk_idx += 1

            # Сдвиг с учетом перекрытия
            if end_idx >= total_len:
                break
            start_idx = max(start_idx + 1, end_idx - self.chunk_overlap)

        return chunks
