#!/bin/sh
set -e

# Entrypoint que aplica as migrations Alembic antes de iniciar o servidor
# Faz retry em caso de falha (por exemplo, DB ainda não disponível)

RETRIES=12
DELAY=5
COUNT=0

echo "Entrypoint: iniciando migrações alembic (até $RETRIES tentativas)"
while true; do
  if alembic upgrade head; then
    echo "Migrations aplicadas com sucesso"
    break
  fi
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$RETRIES" ]; then
    echo "alembic falhou após $COUNT tentativas"
    exit 1
  fi
  echo "alembic falhou — nova tentativa em $DELAY segundos (tentativa $COUNT/$RETRIES)"
  sleep $DELAY
done

# Executa o comando padrão (CMD) do Docker
exec "$@"
