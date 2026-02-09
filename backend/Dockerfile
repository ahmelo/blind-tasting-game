FROM python:3.11-bookworm

# Dependências do sistema para WeasyPrint
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Diretório de trabalho
WORKDIR /backend

# Instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia a aplicação
COPY app ./app
COPY scripts ./scripts

# Copia a configuração do Alembic
COPY alembic.ini .
COPY alembic ./alembic

# Copia entrypoint que irá executar as migrações antes de iniciar o app
COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Porta padrão do Render
EXPOSE 10000

# Start
ENTRYPOINT ["/entrypoint.sh"]
# CMD pode ser sobrescrito via Render (start command), mas deixamos padrão
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
