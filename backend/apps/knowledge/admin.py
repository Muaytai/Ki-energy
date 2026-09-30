from django.contrib import admin
from apps.knowledge.models import KnowledgeBase, KnowledgeChunk

class KnowledgeChunkInline(admin.TabularInline):
    model = KnowledgeChunk
    extra = 0
    fields = ('chunk_index', 'content_snippet', 'created_at')
    readonly_fields = ('chunk_index', 'content_snippet', 'created_at')
    can_delete = False

    def content_snippet(self, obj):
        return obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
    content_snippet.short_description = "Текст фрагмента"

@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ('title', 'expert', 'source_type', 'is_processed', 'total_chunks', 'created_at')
    list_filter = ('source_type', 'is_processed', 'created_at')
    search_fields = ('title', 'raw_text', 'expert__name', 'expert__email')
    readonly_fields = ('id', 'is_processed', 'processing_error', 'total_chunks', 'created_at', 'updated_at')
    inlines = [KnowledgeChunkInline]

@admin.register(KnowledgeChunk)
class KnowledgeChunkAdmin(admin.ModelAdmin):
    list_display = ('id', 'expert', 'knowledge_base', 'chunk_index', 'content_preview', 'created_at')
    list_filter = ('expert', 'created_at')
    search_fields = ('content', 'expert__name')
    readonly_fields = ('id', 'chunk_index', 'embedding', 'created_at', 'updated_at')

    def content_preview(self, obj):
        return obj.content[:80] + "..." if len(obj.content) > 80 else obj.content
    content_preview.short_description = "Текст чанка"
