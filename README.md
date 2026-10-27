# Apsen · Demand Intelligence

Aplicação web em Next.js que porta o protótipo **Demand Intelligence** (`docs/Negócio/di-drivers-v2_84.html`): shell fiel ao protótipo (sidebar com módulos por perfil, topbar, toasts), guarda de acesso por perfil e dados vindos de uma API HTTP (localmente, o `mock-api` com json-server). A autenticação é por SSO com redirecionamento (Entra ID em produção, provedor simulado no desenvolvimento). Tem tema claro/escuro e layout responsivo.

## Stack

Pré-requisitos: **Node.js 20+** (desenvolvido com Node 24.18) e **npm 10+** (desenvolvido com npm 11.16).

### Visão geral

| Área               | Tecnologia                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Next.js 16 (App Router, Turbopack, `typedRoutes`, Server Components nas rotas) e React 19                                          |
| Linguagem          | TypeScript 6 (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`)                            |
| Arquitetura        | Clean Architecture (`domain` → `application` → `infrastructure`/`presentation` → `main` → `app`) com DI por factory e por contexto |
| Estado de servidor | TanStack Query 5 (`staleTime` 30 s em listas e 5 min em catálogos, retry 1, chaves por módulo em `queryKeys`)                      |
| Estado de UI       | Zustand 5 (sessão em `sessionStorage`, sidebar e tema em `localStorage`); filtros e página ficam na URL                            |
| Estilo             | Tailwind CSS 4 via PostCSS (`@theme` com tokens `apsen-*`, utilities próprias e tema escuro pela classe `dark` no `<html>`)        |
| Design system      | Protótipo Apsen Demand Intelligence, documentado em [`docs/design/DESIGN_SPEC.md`](docs/design/DESIGN_SPEC.md)                     |
| Tipografia         | Inter (pesos 400/500/600/700) via `next/font/google`                                                                               |
| Validação          | Zod 4 (contrato HTTP e variáveis de ambiente)                                                                                      |
| HTTP               | `FetchHttpClient` sobre `fetch`: Bearer da sessão, timeout de 15 s, `getPage` com `X-Total-Count`, 401 expira a sessão             |
| Testes             | Vitest 5 (jsdom, cobertura v8 com mínimo de 90%), Testing Library (React, DOM, user-event, jest-dom)                               |
| Qualidade          | ESLint 9 (flat config: `eslint-config-next` + `typescript-eslint` + `eslint-plugin-boundaries`), Prettier 3                        |
| Processo           | Spec-Driven Development (`docs/specs`) com agentes, skills e hook de verificação do Claude Code (`.claude/`)                       |

### Dependências de produção

| Pacote                  | Versão  | Uso                                                          |
| ----------------------- | ------- | ------------------------------------------------------------ |
| `next`                  | 16.4.2  | Framework, roteamento App Router, build e servidor           |
| `react` / `react-dom`   | 19.3.1  | UI                                                           |
| `@tanstack/react-query` | 5.104.5 | Busca, cache e estados de carregamento/erro dos casos de uso |
| `zustand`               | 5.0.16  | Stores de sessão, sidebar e tema                             |
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
| `next.config.ts`          | `typedRoutes`, `reactStrictMode`, sem `x-powered-by`, security headers                                 |
| `tsconfig.json`           | Modo estrito e aliases `@domain`, `@application`, `@infrastructure`, `@presentation`, `@main`, `@test` |
| `postcss.config.mjs`      | Plugin do Tailwind 4                                                                                   |
| `src/app/globals.css`     | Tokens `apsen-*` (`@theme`), tema escuro, base e utilities                                             |
| `eslint.config.mjs`       | Next + TypeScript + boundaries + restrições de import em `domain`/`application`                        |
| `vitest.config.mts`       | jsdom, setup, cobertura v8 e limites de 90%                                                            |
| `vitest.setup.ts`         | jest-dom, mock de `next/navigation`, `matchMedia` e reset das stores                                   |
| `.prettierrc.json`        | Estilo de formatação                                                                                   |
| `.env.example`            | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AUTH_MODE` e porta/atraso do `mock-api`                            |
| `AGENTS.md` / `CLAUDE.md` | Regras para agentes de IA                                                                              |
| `.claude/`                | Agentes `spec-*`, skills `build-and-test`/`new-spec-feature` e hook `verify.sh`                        |

## Arquitetura

Camadas (direção verificada pelo `eslint-plugin-boundaries`):

| Camada           | Pode importar           | Conteúdo                                                                                                                                         |
| ---------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `domain`         | só `domain`             | `perfis` (níveis, `podeAcessar`, visibilidade de módulos), `navegacao` (contagens dos badges), `auth` (sessão, erros, portas), `shared` (`Page`) |
| `application`    | `domain`                | `ListPerfis`, `GetNavBadges`, `ConcluirLogin`, `ObterSessaoAtual`, `Sair`, `IniciarLogin`, `EncerrarNoProvedor`                                  |
| `infrastructure` | `domain`                | `FetchHttpClient`, `toPageQuery`, `env`, repositórios HTTP (Zod + mappers), `MockSsoProvider`/`EntraSsoProvider`                                 |
| `presentation`   | `application`, `domain` | shell (`components/layout`), UI kit (`components/ui`), `features/*`, hooks TanStack Query, stores Zustand, registro de telas, providers          |
| `main`           | todas                   | `createContainer` com uma factory por módulo em `src/main/modules/`, `AppRoot`, `securityHeaders`                                                |
| `app`            | `main`, `presentation`  | rotas finas do App Router                                                                                                                        |

### Rotas

| Rota               | Onde                                   | Observação                                                                            |
| ------------------ | -------------------------------------- | ------------------------------------------------------------------------------------- |
| `/`                | `src/app/(app)/page.tsx`               | Dashboard (provisório nesta onda)                                                     |
| `/acesso-negado`   | `src/app/(app)/acesso-negado/page.tsx` | Acesso Restrito                                                                       |
| demais telas do §0 | `src/app/(app)/[...slug]/page.tsx`     | Registradas em `navigation/screens.ts`: menu, trilha e guarda funcionam; "Em breve"   |
| `/auth/callback`   | `src/app/auth/callback/page.tsx`       | Fora do shell: troca o `code` do provedor pela sessão e volta à rota pedida (`state`) |

O grupo `(app)` aplica o `AuthGate` (sem sessão, redireciona ao provedor de identidade) e o `AppShell` (sidebar, topbar, `AccessGuard`, barra de progresso).

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

## API local e autenticação

O app sempre integra por HTTP (`NEXT_PUBLIC_API_URL`, padrão `http://localhost:3001`). Para desenvolver, suba a API simulada:

```bash
npm run api        # mock-api/server.mjs (json-server em memória, dados de mock-api/db.json)
npm run dev:full   # API + Next juntos
```

| Variável                | Efeito                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`   | Base da API (padrão `http://localhost:3001`).                                                                                                    |
| `NEXT_PUBLIC_AUTH_MODE` | `simulado` (provedor da API local) ou `entra` (Microsoft Entra ID, PBI 39032). Ausente: `simulado` fora de produção; em produção sempre `entra`. |

Fluxo: sem sessão, o `AuthGate` redireciona para `{API}/sso/authorize?redirect_uri={origin}/auth/callback&state={rota}`. No provedor simulado basta escolher a conta (ou digitar um e-mail `@apsen.com.br`, criado no primeiro acesso como Visualizador). O callback faz `POST /auth/token {code}`, guarda `{ token, usuario }` em `sessionStorage` e volta à rota. Toda chamada leva `Authorization: Bearer`; 401 limpa a sessão e reinicia o login. "Sair" chama `POST /auth/logout` e o logout do provedor. O app não tem tela nem senha de login (RN-ACS-01).

Contratos desta onda: `GET /perfis`, contagens `GET /{colecao}?_page=1&_limit=1[&status=…]` lendo `X-Total-Count`, `POST /auth/token`, `GET /auth/me`, `POST /auth/logout`. Payload fora do schema gera `InvalidResponseError`.

## Como adicionar uma feature

O projeto segue **Spec-Driven Development**: antes do código, escreva a spec em `docs/specs/{area}/{feature}.md` a partir de `docs/specs/_template.md` (fluxo, status e índice em [`docs/specs/README.md`](docs/specs/README.md)). No Claude Code, a skill `new-spec-feature` conduz o ciclo com os agentes `spec-writer` → `spec-developer` → `spec-qa` (`.claude/agents/`). O visual de toda tela segue [`docs/design/DESIGN_SPEC.md`](docs/design/DESIGN_SPEC.md).

Exemplo: "metas por canal".

0. **Spec** — `docs/specs/<area>/<feature>.md` com `status: READY`, critérios de aceite, contrato HTTP e cenários BDD.
1. **Domínio** — crie a entidade/value object e a porta em `src/domain/<area>/` (ex.: `ChannelGoal.ts`, `GoalRepository.ts`). Sem imports de React, Zod ou libs de IO. Teste todas as regras e bordas em `__tests__`.
2. **Aplicação** — crie o caso de uso em `src/application/<area>/` (ex.: `GetChannelGoals.ts`) recebendo a porta no construtor e devolvendo DTOs simples. Teste com um fake da porta.
3. **Infraestrutura** — implemente a porta (`HttpGoalRepository` com schema Zod + mapper; sem repositório em memória). Teste mapeamento, validação e erros HTTP com `test/fakeFetch.ts`.
4. **Composição** — acrescente o grupo do módulo no tipo `UseCases` (`src/presentation/providers/UseCasesContext.tsx`), crie `src/main/modules/<modulo>.ts`, registre-o no `createContainer` e acrescente os stubs em `createFakeUseCases`.
5. **Apresentação** — crie o hook em `src/presentation/hooks/` (`useQuery` chamando o caso de uso via `useUseCases()`, com a chave em `queryKeys.ts`) e a feature em `src/presentation/features/<feature>/`: uma tela `'use client'` pequena que delega para componentes em `components/`. Reaproveite o UI kit (`@presentation/components/ui`), ponha formatação/derivação em funções puras em `presentation/format` e rotas em `presentation/navigation/routes.ts`. Estado de UI que precisa sobreviver à navegação vai para uma store Zustand.
6. **Rota** — crie `src/app/(app)/<rota>/page.tsx` fino, que exporta `metadata` e só renderiza a tela; a tela já está em `navigation/screens.ts` (crumb, nível, módulo).
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
- `renderWithProviders(ui, useCases)` (`test/renderWithProviders.tsx`) monta um `QueryClient` de teste e o `UseCasesProvider`, e devolve também `user` (user-event). Use `createFakeUseCases` (stubs por módulo) e as fixtures de `test/fixtures/`; a sessão de teste começa como Admin (`loginAs`/`logout` em `test/resetStores.ts`).
- `next/navigation` é mockado globalmente; importe `routerMock` e `navigationState` de `@test/nextNavigation` para conferir navegação ou definir `pathname`/`params`.
- Prefira queries por role e nome acessível (`getByRole('link', { name: ... })`). Valores em moeda saem do `Intl` com NBSP: compare com regex (`/R\$\s?1\.000,00/`) ou com o texto normalizado.
- A cobertura é coletada de todo `src/` (exceto `.d.ts` e os próprios testes); `npm run test:coverage` falha se qualquer métrica global ficar abaixo de 90%.

## Rotas tipadas

`typedRoutes: true` em `next.config.ts`. O `next typegen` (rodado por `npm run typecheck` e pelo `next build`) gera os tipos em `.next/types`, e o `tsc` passa a recusar `href` de `next/link` e chamadas de `router.push` para rotas que não existem. Para as telas use `screenHref(id, params)` de `src/presentation/navigation/screens.ts`.

## Design e tema

- O visual segue o protótipo **Apsen Demand Intelligence**. A fonte da verdade é [`docs/design/DESIGN_SPEC.md`](docs/design/DESIGN_SPEC.md) (tokens, shell, UI kit, telas e checklist de fidelidade), e a mudança está registrada na spec [`platform/apsen-visual-identity`](docs/specs/platform/apsen-visual-identity.md).
- As cores vêm só dos tokens `--color-apsen-*` do `@theme` em `src/app/globals.css`, sem hex nos componentes. Medidas em px usam valores arbitrários (`text-[12.5px]`) para bater com o protótipo.
- O tema escuro redefine os mesmos tokens em `html.dark`, então os componentes quase não precisam de `dark:` (a exceção é o logo da sidebar, que é invertido).
- Utilities compartilhadas (`@utility`): `focus-ring`, `surface`, `field-focus`, `page-title`, `page-sub`, `kpi-grid` e `state-block`. Classe repetida em mais de um componente vira utility ou componente do UI kit.
- A fonte é Inter via `next/font`, só com os pesos 400/500/600/700, como no protótipo.

### Preferência de tema

- A preferência (`system | light | dark`) fica em `themeStore` (Zustand + `persist`, chave `marketing-insights:theme`).
- `themeInitScript` roda no `<head>` antes da hidratação e aplica a classe `dark` no `<html>`, evitando o flash de tema errado.
- `ThemeSync` reidrata a store no cliente e acompanha `prefers-color-scheme` quando a preferência é `system`.
