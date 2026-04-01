# Site Markup Incorporações

Site institucional + painel admin para incorporadora imobiliária em Maceió/AL.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server em localhost:3000 |
| `npm run build` | Build de produção (standalone) |
| `npm run lint` | ESLint |

## Architecture

```
src/
  app/
    (public)/              # Páginas públicas (home, empreendimentos, blog)
    (admin)/admin/         # Painel admin protegido por auth
      login/               # Tela de login
    api/                   # API routes (leads, newsletter)
  components/
    public/                # Componentes do site (Navbar, HeroSlider, etc.)
    admin/                 # Componentes do admin (Sidebar, Forms, Tables)
    ui/                    # shadcn/ui components
  lib/
    supabase/              # Supabase clients (client.ts, server.ts, admin.ts, middleware.ts)
  types/
    database.ts            # Types gerados do schema Supabase
  middleware.ts            # Protege /admin/* — redireciona para /admin/login se não autenticado
supabase/
  schema.sql               # Schema completo do banco (tabelas, RLS, storage)
_reference/                # Site estático original (HTML) — apenas referência para migração
```

## Key Files

- `src/middleware.ts` — Auth guard para todas as rotas /admin/*
- `src/lib/supabase/server.ts` — Client SSR (usado em Server Components)
- `src/lib/supabase/client.ts` — Client browser (usado em Client Components)
- `src/lib/supabase/admin.ts` — Service role client (usado em API routes, bypassa RLS)
- `src/types/database.ts` — Types de todas as tabelas do Supabase
- `supabase/schema.sql` — Source of truth do banco de dados

## Stack

- **Next.js 16** (App Router, standalone output)
- **Supabase** (PostgreSQL, Auth, Storage) — projeto: `qbpxwufhjeyrrzxthllo`
- **Tailwind CSS v4** (via @tailwindcss/postcss)
- **TypeScript 5**

## Environment

Required (`.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Chave pública (anon)
- `SUPABASE_SERVICE_ROLE_KEY` — Chave admin (nunca expor no client)
- `NEXT_PUBLIC_APP_URL` — URL do site (localhost ou produção)

## Code Style

- Português no conteúdo/variáveis de banco, inglês no código
- Server Components por padrão; `"use client"` apenas quando necessário (animações, forms, interatividade)
- Dados públicos: buscar via `createClient()` de `server.ts` (respeita RLS)
- Dados admin/API: usar `createAdminClient()` de `admin.ts` (bypassa RLS)
- Fontes: Inter (sans) + Playfair Display (serif)
- Cores: `cream` (#f5ebe1), `dark` (#1a1a1a), `text-muted` (#8a7d72), `accent-gold` (#b8945f)

## Database

11 tabelas no Supabase:
- `empreendimentos` + `empreendimento_imagens` + `empreendimento_plantas` + `empreendimento_diferenciais`
- `blog_posts` + `blog_categorias`
- `leads` (formulários de contato)
- `midia` (press/notícias externas)
- `newsletter`
- `configuracoes` (key-value para settings do site)
- `admin_profiles` (perfis com roles: admin/editor)

RLS ativo: público lê dados ativos/publicados, admin tem acesso total.

## Gotchas

- `NEXT_PUBLIC_*` vars devem estar como **Build Args** no Easypanel, não só Runtime — Next.js embute no bundle durante build
- Admin routes usam `export const dynamic = "force-dynamic"` no layout para evitar falha de pré-renderização sem env vars
- O middleware usa o nome legado `middleware` (Next.js 16 recomenda `proxy`) — migrar quando estável
- Supabase Storage buckets: `empreendimentos`, `blog`, `midia`, `site` — todos públicos para leitura
- Imagens grandes no `_reference/assets/` (>20MB total) — não mover para `public/`, usar Supabase Storage

## Deploy

- Docker standalone em Easypanel
- Dockerfile: multi-stage (deps → builder → runner)
- Porta: 3000
- GitHub: `markupinc/site-markup` (branch `main`)
- Auto-deploy via webhook no Easypanel
