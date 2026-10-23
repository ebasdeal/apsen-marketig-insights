# Marketing Insights

Aplicação web em Next.js para acompanhar o desempenho de campanhas de marketing: dashboard de KPIs, lista filtrável de campanhas e detalhe com indicadores e uso de orçamento. Tem tema claro/escuro, layout responsivo e usa dados mock quando nenhuma API está configurada.

## Stack

Pré-requisitos: **Node.js 20+** (desenvolvido com Node 24.18) e **npm 10+** (desenvolvido com npm 11.16).

### Visão geral

| Área               | Tecnologia                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Next.js 16 (App Router, Turbopack, `typedRoutes`, Server Components nas rotas) e React 19                                          |
| Linguagem          | TypeScript 6 (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`)                            |
| Arquitetura        | Clean Architecture (`domain` → `application` → `infrastructure`/`presentation` → `main` → `app`) com DI por factory e por contexto |
| Estado de servidor | TanStack Query 5 (cache, `staleTime` de 60 s, retry e chaves centralizadas em `queryKeys`)                                         |
| Estado de UI       | Zustand 5 (filtros, busca e página da lista; preferência de tema persistida em `localStorage` via `persist`)                       |
| Estilo             | Tailwind CSS 4 via PostCSS (`@theme` com tokens `apsen-*`, utilities próprias e tema escuro pela classe `dark` no `<html>`)        |
| Design system      | Protótipo Apsen Demand Intelligence, documentado em [`docs/design/DESIGN_SPEC.md`](docs/design/DESIGN_SPEC.md)                     |
| Tipografia         | Inter (pesos 400/500/600/700) via `next/font/google`                                                                               |
| Validação          | Zod 4 (contrato HTTP e variáveis de ambiente)                                                                                      |
| HTTP               | Cliente fino sobre `fetch` (`FetchHttpClient`) e repositório em memória com dados mock                                             |
| Testes             | Vitest 5 (jsdom, cobertura v8 com mínimo de 90%), Testing Library (React, DOM, user-event, jest-dom)                               |
| Qualidade          | ESLint 9 (flat config: `eslint-config-next` + `typescript-eslint` + `eslint-plugin-boundaries`), Prettier 3                        |
| Processo           | Spec-Driven Development (`docs/specs`) com agentes, skills e hook de verificação do Claude Code (`.claude/`)                       |

### Dependências de produção

| Pacote                  | Versão  | Uso                                                          |
| ----------------------- | ------- | ------------------------------------------------------------ |
| `next`                  | 16.4.2  | Framework, roteamento App Router, build e servidor           |
| `react` / `react-dom`   | 19.3.1  | UI                                                           |
| `@tanstack/react-query` | 5.104.5 | Busca, cache e estados de carregamento/erro dos casos de uso |
| `zustand`               | 5.0.16  | Stores de UI (filtros da lista e tema)                       |
| `zod`                   | 4.6.7   | Validação do payload da API e do `.env`                      |

### Dependências de desenvolvimento

| Pacote                                                           | Versão                   | Uso                                                              |
| ---------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------- |
| `typescript`                                                     | 6.0.3                    | Compilador e `tsc --noEmit` no typecheck                         |
| `@types/node`, `@types/react`, `@types/react-dom`                | 22.20 / 19.3 / 19.3      | Tipos                                                            |
| `tailwindcss` + `@tailwindcss/postcss` + `postcss`               | 4.3.3 / 4.3.3 / 8.5      | Estilo (configurado em `postcss.config.mjs` e `globals.css`)     |
| `vitest` + `@vitest/coverage-v8`                                 | 5.0.5                    | Testes unitários e cobertura                                     |
| `@vitejs/plugin-react`, `vite-tsconfig-paths`                    | 6.1.2 / 6.1.1            | JSX e aliases (`@domain`, `@presentation`…) nos testes           |
| `jsdom`                                                          | 30.1.3                   | DOM para os testes                                               |
| `@testing-library/react`, `/dom`, `/user-event`, `/jest-dom`     | 16.3 / 10.4 / 14.6 / 7.0 | Render, queries acessíveis, interação e matchers                 |
| `eslint` + `eslint-config-next`                                  | 9.39.5 / 16.4.2          | Lint (regras Next, React e Core Web Vitals)                      |
| `typescript-eslint`                                              | 8.72.0                   | Regras TypeScript (`no-explicit-any`, `consistent-type-imports`) |
| `eslint-plugin-boundaries` + `eslint-import-resolver-typescript` | 7.2.1 / 4.4.5            | Direção das camadas da Clean Architecture                        |
| `eslint-config-prettier`, `prettier`                             | 10.1.8 / 3.9.10          | Formatação                                                       |
| `globals`                                                        | 17.13.0                  | Globais do Vitest no ESLint                                      |

### Arquivos de configuração

| Arquivo                   | Função                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `next.config.ts`          | `typedRoutes`, `reactStrictMode`, sem header `x-powered-by`                                            |
| `tsconfig.json`           | Modo estrito e aliases `@domain`, `@application`, `@infrastructure`, `@presentation`, `@main`, `@test` |
| `postcss.config.mjs`      | Plugin do Tailwind 4                                                                                   |
| `src/app/globals.css`     | Tokens `apsen-*` (`@theme`), tema escuro, base e utilities                                             |
| `eslint.config.mjs`       | Next + TypeScript + boundaries + restrições de import em `domain`/`application`                        |
| `vitest.config.mts`       | jsdom, setup, cobertura v8 e limites de 90%                                                            |
| `vitest.setup.ts`         | jest-dom, mock de `next/navigation`, `matchMedia` e reset das stores                                   |
| `.prettierrc.json`        | Estilo de formatação                                                                                   |
| `.env.example`            | `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_MOCK_LATENCY_MS`                                                  |
| `AGENTS.md` / `CLAUDE.md` | Regras para agentes de IA                                                                              |
| `.claude/`                | Agentes `spec-*`, skills `build-and-test`/`new-spec-feature` e hook `verify.sh`                        |

## Arquitetura

Clean Architecture com dependências sempre de fora para dentro. A regra é verificada pelo lint (`boundaries/dependencies`): um import que viole a direção abaixo quebra `npm run lint`.

```
┌──────────────────────────────────────────────────────────────────┐
│ src/app            Rotas App Router (finas: só renderizam telas) │
│   │                                                              │
│   ▼                                                              │
│ src/main           Composição / DI: container escolhe mock ou    │
│   │                HTTP, cria casos de uso, monta AppRoot        │
│   ├───────────────────────────┬──────────────────────────────┐   │
│   ▼                           ▼                              │   │
│ src/presentation         src/infrastructure                  │   │
│  features, ui kit,        HttpClient (fetch), repositório    │   │
│  layout, hooks (Query),   HTTP + Zod, repositório em         │   │
│  stores (Zustand),        memória + dados mock, env          │   │
│  tema, providers              │                              │   │
│   │                           │ implementa portas            │   │
│   ▼                           │                              │   │
│ src/application  ◄────────────┼──────────────────────────────┘   │
│  casos de uso + DTOs          │                                  │
│   │                           │                                  │
│   ▼                           ▼                                  │
│ src/domain   entidades, value objects, regras, portas, erros     │
│              (TypeScript puro: sem React, sem IO, sem libs)      │
└──────────────────────────────────────────────────────────────────┘
```

| Camada           | Pode importar                        | Conteúdo                                                                                                                                                                                    |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain`         | só `domain` (e nenhuma lib de UI/IO) | `Campaign`, `Metrics` (CTR, CPC, CPA, ROAS, taxa de conversão), `Money`, `Percentage`, `DateRange`, `CampaignFilter`, porta `CampaignRepository`, agregações do dashboard, erros de domínio |
| `application`    | `domain` (e nenhuma lib de UI/IO)    | `ListCampaigns`, `GetCampaignDetails`, `GetDashboardSummary`, DTOs de entrada/saída, presets de período                                                                                     |
| `infrastructure` | `domain`                             | `FetchHttpClient`, `HttpCampaignRepository` (DTO → entidade validado por Zod), `InMemoryCampaignRepository` (latência simulada), `mockCampaigns`, `env`                                     |
| `presentation`   | `application`, `domain`              | Features (telas e componentes), UI kit, layout, hooks de query, stores, tema, formatação, rotas, `UseCasesProvider`                                                                         |
| `main`           | todas exceto `app`                   | `createContainer` (DI por factory) e `AppRoot` (providers + container)                                                                                                                      |
| `app`            | `main`, `presentation`               | `layout.tsx`, `page.tsx`, `campaigns/page.tsx`, `campaigns/[id]/page.tsx`, `error.tsx`, `not-found.tsx`, `loading.tsx`                                                                      |

### Estrutura de pastas

```
src/
├── app/                           rotas App Router (Server Components finos)
│   ├── layout.tsx                 <html>, fonte, script anti-flash do tema, AppRoot + AppShell
│   ├── page.tsx                   /               → DashboardScreen
│   ├── campaigns/page.tsx         /campaigns      → CampaignListScreen
│   ├── campaigns/[id]/page.tsx    /campaigns/:id  → CampaignDetailsScreen
│   ├── error.tsx | not-found.tsx | loading.tsx
│   └── globals.css                Tailwind 4: tokens apsen-*, tema escuro e @utility (focus-ring, surface, page-title…)
├── domain/                        campaign/, dashboard/, shared/
├── application/                   campaigns/, dashboard/
├── infrastructure/                campaigns/, config/, http/
├── main/                          container.ts, AppRoot.tsx
└── presentation/
    ├── components/
    │   ├── ui/                    UI kit Apsen: Button, Card, Section, PageHeader, KpiCard, FormSelect, SearchInput, Pagination, StatusBadge… (index.ts)
    │   ├── layout/                AppShell, Sidebar, Topbar, ShellMain, NavLinks, NavModuleGroup, ThemeToggle, crumbFor
    │   └── filterOptions.ts
    ├── features/
    │   ├── dashboard/             DashboardScreen + components/
    │   └── campaigns/             CampaignListScreen + components/, details/ (CampaignDetailsScreen + components/)
    ├── format/                    formatters, labels, errorMessage (funções puras)
    ├── hooks/                     useDashboardSummary, useCampaigns, useCampaignDetails, queryKeys
    ├── navigation/                routes.ts (rotas tipadas reutilizáveis)
    ├── providers/                 AppProviders, UseCasesContext, queryClient
    ├── stores/                    campaignFiltersStore, themeStore
    └── theme/                     resolveTheme, ThemeSync, themeInitScript
test/                              factories, fakes de repositório e de fetch, mock de next/navigation, renderWithProviders
```

### Rotas

| Rota              | Arquivo                           | Tela                    | Renderização               |
| ----------------- | --------------------------------- | ----------------------- | -------------------------- |
| `/`               | `src/app/page.tsx`                | `DashboardScreen`       | estática; dados no cliente |
| `/campaigns`      | `src/app/campaigns/page.tsx`      | `CampaignListScreen`    | estática; dados no cliente |
| `/campaigns/[id]` | `src/app/campaigns/[id]/page.tsx` | `CampaignDetailsScreen` | dinâmica (`await params`)  |

As páginas são Server Components que só renderizam a tela (`'use client'`). A busca de dados acontece no cliente com TanStack Query, pelos casos de uso injetados via `UseCasesProvider`.

Princípios aplicados:

- **DIP**: casos de uso recebem a porta `CampaignRepository` no construtor; a presentation recebe os casos de uso por contexto (`UseCasesProvider`), nunca instancia infraestrutura.
- **SRP**: uma classe por caso de uso; mapeamentos (`mappers.ts`, `campaignMapper.ts`) separados das regras; telas pequenas que delegam para componentes de uma responsabilidade.
- **OCP/LSP**: `HttpCampaignRepository` e `InMemoryCampaignRepository` são intercambiáveis pela mesma porta.
- **Divisão por zero**: KPIs sem base retornam `null` no domínio e aparecem como `—` na UI.

## Como rodar

Pré-requisitos: Node 20+ e npm.

```bash
npm install
npm run dev        # http://localhost:3000
```

Build de produção:

```bash
npm run build
npm run start
```

## Mock x API HTTP

A escolha é feita em `src/main/container.ts` a partir das variáveis de ambiente (validadas com Zod em `src/infrastructure/config/env.ts`):

| Variável                      | Efeito                                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`         | Se definida, usa `HttpCampaignRepository` apontando para essa URL. Se vazia/ausente, usa o repositório em memória com dados mock. |
| `NEXT_PUBLIC_MOCK_LATENCY_MS` | Latência simulada do mock (0–10000 ms, padrão 600).                                                                               |

Copie `.env.example` para `.env.local` (ignorado pelo git) e ajuste. As variáveis `NEXT_PUBLIC_*` são embutidas no bundle, então reinicie o `npm run dev` ou refaça o `npm run build` depois de alterá-las.

```bash
NEXT_PUBLIC_API_URL=https://api.exemplo.com/v1 npm run dev
```

### Contrato HTTP esperado

`GET {NEXT_PUBLIC_API_URL}/campaigns?channel=&status=&from=&to=` — todos os parâmetros opcionais; `from`/`to` em ISO-8601 (filtra campanhas cujo período se sobrepõe ao intervalo).

```json
{
  "data": [
    {
      "id": "cmp-001",
      "name": "Black Friday – Search Marca",
      "channel": "google",
      "status": "ativa",
      "period": { "start": "2026-10-02T00:00:00.000Z", "end": "2026-11-15T00:00:00.000Z" },
      "budget": 48000,
      "metrics": {
        "impressions": 1250000,
        "clicks": 61200,
        "conversions": 3120,
        "spend": 39850.4,
        "revenue": 214300.9
      }
    }
  ]
}
```

`GET {NEXT_PUBLIC_API_URL}/campaigns/{id}` — retorna um objeto de campanha no mesmo formato; `404` é tratado como "campanha não encontrada".

Regras de validação: `channel` ∈ `google | meta | linkedin | email | tiktok`; `status` ∈ `ativa | pausada | encerrada`; contagens inteiras não negativas; valores monetários não negativos; `clicks ≤ impressions` e `conversions ≤ clicks`; `end ≥ start`. Payload fora do contrato gera `InvalidResponseError` e a UI mostra estado de erro com "Tentar novamente".

## Como adicionar uma feature

O projeto segue **Spec-Driven Development**: antes do código, escreva a spec em `docs/specs/{area}/{feature}.md` a partir de `docs/specs/_template.md` (fluxo, status e índice em [`docs/specs/README.md`](docs/specs/README.md)). No Claude Code, a skill `new-spec-feature` conduz o ciclo com os agentes `spec-writer` → `spec-developer` → `spec-qa` (`.claude/agents/`). O visual de toda tela segue [`docs/design/DESIGN_SPEC.md`](docs/design/DESIGN_SPEC.md).

Exemplo: "metas por canal".

0. **Spec** — `docs/specs/<area>/<feature>.md` com `status: READY`, critérios de aceite, contrato HTTP e cenários BDD.
1. **Domínio** — crie a entidade/value object e a porta em `src/domain/<area>/` (ex.: `ChannelGoal.ts`, `GoalRepository.ts`). Sem imports de React, Zod ou libs de IO. Teste todas as regras e bordas em `__tests__`.
2. **Aplicação** — crie o caso de uso em `src/application/<area>/` (ex.: `GetChannelGoals.ts`) recebendo a porta no construtor e devolvendo DTOs simples. Teste com um fake da porta (veja `test/FakeCampaignRepository.ts`).
3. **Infraestrutura** — implemente a porta (`HttpGoalRepository` com schema Zod + mapper, e uma versão em memória com dados mock). Teste mapeamento, validação e erros HTTP com `test/fakeFetch.ts`.
4. **Composição** — registre o caso de uso no tipo `UseCases` (`src/presentation/providers/UseCasesContext.tsx`) e no `createContainer` (`src/main/container.ts`).
5. **Apresentação** — crie o hook em `src/presentation/hooks/` (`useQuery` chamando o caso de uso via `useUseCases()`, com a chave em `queryKeys.ts`) e a feature em `src/presentation/features/<feature>/`: uma tela `'use client'` pequena que delega para componentes em `components/`. Reaproveite o UI kit (`@presentation/components/ui`), ponha formatação/derivação em funções puras em `presentation/format` e rotas em `presentation/navigation/routes.ts`. Estado de UI que precisa sobreviver à navegação vai para uma store Zustand.
6. **Rota** — crie `src/app/<rota>/page.tsx` fino, que exporta `metadata` e só renderiza a tela. Se a rota entrar no menu, adicione-a em `components/layout/navItems.ts`.
7. **Testes** — cubra loading, erro (com "Tentar novamente"), vazio, dados e interações com `renderWithProviders` (veja [Testes](#testes)).
8. Rode `npm run typecheck && npm run lint && npm run test:coverage && npm run build`.

## Comandos

| Comando                           | Descrição                                                                                 |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desenvolvimento Next.js                                                       |
| `npm run build`                   | Build de produção                                                                         |
| `npm run start`                   | Serve o build de produção                                                                 |
| `npm run typecheck`               | `next typegen && tsc --noEmit` (gera os tipos de rota e valida os `href` tipados)         |
| `npm run lint`                    | ESLint (inclui as regras de camadas)                                                      |
| `npm test` / `npm run test:watch` | Vitest                                                                                    |
| `npm run test:coverage`           | Vitest com cobertura v8 (mínimo global de 90% em statements, branches, functions e lines) |
| `npm run format` / `format:check` | Prettier                                                                                  |

## Testes

- Vitest com ambiente jsdom e `globals: true`; configuração em `vitest.config.mts` e setup em `vitest.setup.ts`.
- Testes ficam ao lado do código em `__tests__/`; utilitários compartilhados em `test/` (alias `@test`).
- `renderWithProviders(ui, useCases)` (`test/renderWithProviders.tsx`) monta um `QueryClient` de teste e o `UseCasesProvider`, e devolve também `user` (user-event). Use `createFakeUseCases` e as factories de `test/factories.ts` para montar os dados.
- `next/navigation` é mockado globalmente; importe `routerMock` e `navigationState` de `@test/nextNavigation` para conferir navegação ou definir `pathname`/`params`.
- Prefira queries por role e nome acessível (`getByRole('link', { name: ... })`). Valores em moeda saem do `Intl` com NBSP: compare com regex (`/R\$\s?1\.000,00/`) ou com o texto normalizado.
- A cobertura é coletada de todo `src/` (exceto `.d.ts` e os próprios testes); `npm run test:coverage` falha se qualquer métrica global ficar abaixo de 90%.

## Rotas tipadas

`typedRoutes: true` em `next.config.ts`. O `next typegen` (rodado por `npm run typecheck` e pelo `next build`) gera os tipos em `.next/types`, e o `tsc` passa a recusar `href` de `next/link` e chamadas de `router.push` para rotas que não existem. Para rotas dinâmicas reutilizáveis use os helpers de `src/presentation/navigation/routes.ts` (ex.: `campaignDetailsRoute(id)`).

## Design e tema

- O visual segue o protótipo **Apsen Demand Intelligence**. A fonte da verdade é [`docs/design/DESIGN_SPEC.md`](docs/design/DESIGN_SPEC.md) (tokens, shell, UI kit, telas e checklist de fidelidade), e a mudança está registrada na spec [`platform/apsen-visual-identity`](docs/specs/platform/apsen-visual-identity.md).
- As cores vêm só dos tokens `--color-apsen-*` do `@theme` em `src/app/globals.css`, sem hex nos componentes. Medidas em px usam valores arbitrários (`text-[12.5px]`) para bater com o protótipo.
- O tema escuro redefine os mesmos tokens em `html.dark`, então os componentes quase não precisam de `dark:` (a exceção é o logo da sidebar, que é invertido). As cores de canal (`apsen-ch-*`) não mudam.
- Utilities compartilhadas (`@utility`): `focus-ring`, `surface`, `field-focus`, `page-title`, `page-sub`, `kpi-grid` e `state-block`. Classe repetida em mais de um componente vira utility ou componente do UI kit.
- A fonte é Inter via `next/font`, só com os pesos 400/500/600/700, como no protótipo.

### Preferência de tema

- A preferência (`system | light | dark`) fica em `themeStore` (Zustand + `persist`, chave `marketing-insights:theme`).
- `themeInitScript` roda no `<head>` antes da hidratação e aplica a classe `dark` no `<html>`, evitando o flash de tema errado.
- `ThemeSync` reidrata a store no cliente e acompanha `prefers-color-scheme` quando a preferência é `system`.
