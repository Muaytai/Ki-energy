from rest_framework import serializers
from apps.knowledge.models import KnowledgeBase, KnowledgeChunk, KnowledgeSourceType

class KnowledgeChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeChunk
        fields = [
            'id',
            'knowledge_base',
            'expert',
            'chunk_index',
            'content',
            'metadata',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class KnowledgeChunkSearchResponseSerializer(serializers.ModelSerializer):
    similarity_score = serializers.FloatField(read_only=True)
    distance = serializers.FloatField(read_only=True)

    class Meta:
        model = KnowledgeChunk
        fields = [
            'id',
            'chunk_index',
            'content',
            'similarity_score',
            'distance',
            'metadata',
            'created_at',
        ]


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    chunks_count = serializers.IntegerField(source='total_chunks', read_only=True)
    expert_name = serializers.CharField(source='expert.name', read_only=True)

    class Meta:
        model = KnowledgeBase
        fields = [
            'id',
            'expert',
            'expert_name',
            'title',
            'source_type',
            'file',
            'raw_text',
            'is_processed',
            'processing_error',
            'total_chunks',
            'chunks_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_processed', 'processing_error', 'total_chunks', 'created_at', 'updated_at']


class KnowledgeBaseDetailSerializer(KnowledgeBaseSerializer):
    chunks = KnowledgeChunkSerializer(many=True, read_only=True)

    class Meta(KnowledgeBaseSerializer.Meta):
        fields = KnowledgeBaseSerializer.Meta.fields + ['chunks']


class VectorSearchRequestSerializer(serializers.Serializer):
    expert_id = serializers.UUIDField(required=True)
    query = serializers.CharField(max_length=1000, required=True)
    top_k = serializers.IntegerField(default=4, min_value=1, max_value=20)
    threshold = serializers.FloatField(default=0.6, min_value=0.0, max_value=1.0)
