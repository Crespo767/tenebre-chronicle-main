# Tenebre Chronicle

Wiki de campanha para Tenebre, uma cronica de Symbaroum. O site publica sessoes, personagens, NPCs, arquivo e notas do mestre, com um painel privado para editar o conteudo.

## Stack

- React 19
- TanStack Start e TanStack Router
- Tailwind CSS 4
- Supabase para dados, sessoes administrativas e imagens
- Vercel para deploy serverless

## Requisitos

- Node.js 22.12 ou superior
- Projeto Supabase com as migrations de `supabase/migrations`

## Configuracao

Copie `.env.example` para `.env.local` e preencha:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_CHARACTER_IMAGES_BUCKET=character-images
```

As variaveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` sao usadas apenas no servidor.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Estrutura

- `src/routes`: paginas publicas e painel administrativo
- `src/lib/api/campaign.functions.ts`: funcoes server-side de leitura, login, salvamento e upload
- `src/data`: conteudo local usado como fallback
- `supabase/migrations`: schema, RLS, seed inicial e ajustes de storage
- `api/index.mjs`: adaptador serverless para Vercel

## Painel

O painel fica em `/painel-tenebre`. O primeiro acesso permite criar administrador enquanto houver menos de dois usuarios cadastrados. Depois disso, o painel exige login.
