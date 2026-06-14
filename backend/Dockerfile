# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero (mejor caché)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar TODO el contenido de backend a /app/backend/
# Esto mantiene la estructura que tu código espera (backend.api.routes)
COPY . ./backend/

# Verificar estructura (debug)
RUN echo "=== Contenido de /app ===" && ls -la && \
    echo "=== Contenido de /app/backend ===" && ls -la ./backend/ && \
    echo "=== Verificando main.py ===" && ls -la ./backend/main.py

# Establecer PYTHONPATH para que encuentre el módulo backend
ENV PYTHONPATH=/app

# Puerto de FastAPI
EXPOSE 8000

# Ejecutar backend (ahora backend.main:app existe)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]