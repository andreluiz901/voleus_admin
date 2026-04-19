# Volei Manager

App para organizar jogos de vôlei em grupo (agenda, presenças, times).

## Rodar

```bash
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000). Admin: `/admin/login`.

```bash
npm run build
npm start
```

## Ambiente

Defina as variáveis abaixo:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `TOKEN_SECRET`

Sessão admin: cookie httpOnly (`admin-token`); rotas sob `/admin` redirecionam para `/admin/login` sem sessão (Next.js: [`src/proxy.ts`](src/proxy.ts)).

Exemplo local:

```bash
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
ADMIN_PASSWORD="troque-esta-senha"
TOKEN_SECRET="troque-este-secret"
```

Para Neon, use a connection string do projeto e mantenha `sslmode=require`.

## Prisma (Postgres)

Primeira subida em ambiente novo:

```bash
npx prisma migrate deploy
```

Seed (somente dev/homolog, opcional):

```bash
npx prisma db seed
```
