# Deploy (Produção / Render)

Passos recomendados para deploy automático das migrations no Render:

1. Confirme que as migrations do Alembic estão commitadas em `backend/alembic/versions/`.
2. Garanta que a variável de ambiente `DATABASE_URL` esteja configurada no serviço do Render (Dashboard > Environment).
3. O repositório contém um arquivo `.render.yaml` que define um `releaseCommand`:

```
alembic upgrade head
```

Isso fará com que o Render execute as migrations antes de fazer o deploy da nova versão.

Fallback / proteção extra:
- O `Dockerfile` já copia o script `backend/docker/entrypoint.sh` que irá também tentar executar `alembic upgrade head` ao iniciar cada container. Isso serve como backup caso o `releaseCommand` não seja executado por algum motivo.

Testes locais rápidos (recomendado antes do push):

```bash
# build
docker build -t bt-backend:local backend

# subir Postgres temporário e aplicar migrations (script de exemplo já usado nos testes locais):
docker network create bt-test-net || true
docker run -d --name bt-db --network bt-test-net -e POSTGRES_PASSWORD=pass -e POSTGRES_USER=bt -e POSTGRES_DB=bt postgres:15
for i in $(seq 1 60); do docker exec bt-db pg_isready -U bt -d bt && break || sleep 1; done
docker run --rm --network bt-test-net -e DATABASE_URL="postgresql+psycopg2://bt:pass@bt-db:5432/bt" bt-backend:local alembic upgrade head
docker rm -f bt-db || true
docker network rm bt-test-net || true
```

Observações:
- Recomendo manter o `releaseCommand` configurado e o `entrypoint` como fallback. O Alembic ignora migrations já aplicadas, então executar `alembic upgrade head` múltiplas vezes é seguro.
- Se preferir que apenas uma instância execute as migrations (evitar contendas), mantenha apenas o `releaseCommand` e remova a execução no `entrypoint`.
