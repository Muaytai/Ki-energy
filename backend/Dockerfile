# ==============================================================================
# MindAvatar Backend - Production Ready Dockerfile with CPU-only PyTorch & RAG
# ==============================================================================
FROM python:3.12-slim-bookworm

# Environment configuration
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HF_HOME=/root/.cache/huggingface

# Install system dependencies (build tools, PostgreSQL client libs, FFmpeg for audio processing)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    ffmpeg \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip and wheel
RUN pip install --upgrade pip setuptools wheel

# 1. Install lightweight PyTorch CPU-ONLY explicitly from PyTorch official wheel mirror.
# This prevents pulling ~4GB+ of unnecessary CUDA/NVIDIA driver binaries!
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# 2. Copy and install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

# 3. Pre-cache sentence-transformers model during build phase
# Model: paraphrase-multilingual-MiniLM-L12-v2 (384 dims, fast, multilingual)
RUN python -c "from sentence_transformers import SentenceTransformer; print('Pre-caching model...'); SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2'); print('Model pre-cached successfully!')"

# Copy backend source code
COPY . /app/

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh 2>/dev/null || true

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
