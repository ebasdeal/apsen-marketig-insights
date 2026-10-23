---
status: DONE
fase: 1
area: platform
feature: app-shell-and-theme
azure-devops-work-item:
---

# App shell, tema e composição

## 1. Overview

Fundação da aplicação: layout raiz do App Router (`<html lang="pt-BR">`, fonte Inter, script anti-flash de tema), shell visual com marca, navegação principal e alternador de tema, páginas globais de erro/404/loading, providers (TanStack Query + casos de uso + sincronização de tema) e a composição (DI) que escolhe entre repositório mock em memória e repositório HTTP a partir de variáveis de ambiente validadas com Zod.

Esta spec é retroativa: documenta o comportamento implementado e coberto por testes.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                           |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | O layout raiz renderiza `<html lang="pt-BR">` com a variável da fonte Inter, injeta `themeInitScript` no `<head>` e envolve as páginas em `AppRoot` + `AppShell`.                                                                  |
| CA-02 | O título padrão é "Marketing Insights" com template `%s · Marketing Insights`; descrição "Desempenho de campanhas de marketing: KPIs, canais e campanhas.".                                                                        |
| CA-03 | O shell exibe a marca "Marketing Insights" (link para `/`), a navegação "Navegação principal" com os links "Dashboard" (`/`) e "Campanhas" (`/campaigns`) e o botão "Alternar tema"; o conteúdo da página fica dentro de `<main>`. |
| CA-04 | O link ativo recebe `aria-current="page"`: "Dashboard" somente em `/`; "Campanhas" em `/campaigns` e em qualquer `/campaigns/...`.                                                                                                 |
| CA-05 | O botão de tema cicla `sistema → claro → escuro → sistema`, exibindo "Tema: sistema", "Tema: claro" e "Tema: escuro".                                                                                                              |
| CA-06 | A preferência de tema é persistida em `localStorage` na chave `marketing-insights:theme`, salvando somente `preference`.                                                                                                           |
| CA-07 | Antes da hidratação, `themeInitScript` aplica a classe `dark` no `<html>` conforme a preferência salva (ou o `prefers-color-scheme` quando não há preferência válida), sem lançar erro com conteúdo corrompido.                    |
| CA-08 | No cliente, `ThemeSync` reidrata a store, aplica o tema resolvido e acompanha mudanças do esquema do sistema apenas quando a preferência é `system`; remove o listener ao desmontar.                                               |
| CA-09 | Erros não tratados de rota exibem "Algo deu errado" com botão "Tentar novamente" que chama `reset`.                                                                                                                                |
| CA-10 | Rotas inexistentes exibem "404", "Página não encontrada" e o link "Voltar ao dashboard" para `/`.                                                                                                                                  |
| CA-11 | O carregamento de rota exibe um `role="status"` com "Carregando…".                                                                                                                                                                 |
| CA-12 | Sem `NEXT_PUBLIC_API_URL` (ausente ou em branco) o container usa o repositório em memória com dados mock (`dataSource: 'mock'`); com URL válida usa o repositório HTTP (`dataSource: 'http'`).                                     |
| CA-13 | `NEXT_PUBLIC_MOCK_LATENCY_MS` aceita inteiro de 0 a 10000 (padrão 600); valores inválidos ou URL inválida lançam `InvalidEnvError` citando a variável.                                                                             |
| CA-14 | O `QueryClient` padrão usa `staleTime` de 60000 ms e `retry: 1`.                                                                                                                                                                   |
| CA-15 | `useUseCases()` fora do `UseCasesProvider` lança "useUseCases deve ser usado dentro de <UseCasesProvider>".                                                                                                                        |

## 3. UX / Fluxo de tela

**Rotas (App Router):**

| Arquivo                 | Papel                                                                                                                                                                                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/layout.tsx`    | Layout raiz (Server Component). `<html lang="pt-BR" className={inter.variable} suppressHydrationWarning>`, `<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />` no `<head>`, `<body className="min-h-dvh font-sans">` com `AppRoot` → `AppShell` → `children`. |
| `src/app/error.tsx`     | `'use client'`; boundary de erro global.                                                                                                                                                                                                                                     |
| `src/app/not-found.tsx` | Página 404 global.                                                                                                                                                                                                                                                           |
| `src/app/loading.tsx`   | Fallback de carregamento de rota.                                                                                                                                                                                                                                            |

**Shell (`AppShell`):** header `sticky top-0` com fundo translúcido e `backdrop-blur`; à esquerda o link "Marketing Insights" (`/`); à direita `NavLinks` e `ThemeToggle`. Conteúdo em `<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">`. Layout responsivo com `flex-wrap` no header.

**Navegação (`NavLinks`):** `<nav aria-label="Navegação principal">` com `<ul>` de `NAV_ITEMS`; o item ativo usa classes `bg-brand-50 text-brand-700` (claro) / `dark:bg-brand-700/20 dark:text-brand-100` e `aria-current="page"`.

**Alternador de tema (`ThemeToggle`):** botão `aria-label="Alternar tema"` cujo texto é o rótulo da preferência atual ("Tema: sistema" | "Tema: claro" | "Tema: escuro"); clique chama `cycle()`.

**Estados globais:**

| Estado          | Componente      | Textos                                                                                                                                                         |
| --------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading de rota | `loading.tsx`   | `role="status"`, `aria-live="polite"`, spinner `aria-hidden` + "Carregando…"                                                                                   |
| Erro de rota    | `error.tsx`     | `role="alert"`, título "Algo deu errado", texto "Não foi possível exibir esta página. Tente novamente em instantes.", botão "Tentar novamente" (chama `reset`) |
| 404             | `not-found.tsx` | "404", "Página não encontrada", "O endereço acessado não existe ou foi removido.", link "Voltar ao dashboard" (`/`)                                            |

**UI kit de estados reutilizado pelas features** (`StateViews.tsx`): `LoadingState` (`role="status"`, rótulo padrão "Carregando…"), `ErrorState` (`role="alert"`, botão "Tentar novamente" só quando `onRetry` é informado) e `EmptyState` (título, descrição opcional e ação opcional, renderizada apenas quando `actionLabel` e `onAction` existem).

**Tema visual:** Tailwind 4 em `src/app/globals.css` com `@custom-variant dark (&:where(.dark, .dark *))`, cores `brand-50/100/500/600/700`, `--font-sans` baseada em `--font-inter`, `color-scheme` claro/escuro no `html` e utilities `focus-ring` e `surface`.

## 4. Contratos de API consumidos

Nenhum endpoint é consumido diretamente por esta feature. Ela define apenas a origem de dados das demais:

| Variável                      | Validação Zod (`src/infrastructure/config/env.ts`)                                      | Efeito                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`         | `preprocess(blankToUndefined, z.url().optional())`; barras finais removidas             | Definida → `HttpCampaignRepository` + `FetchHttpClient({ baseUrl })`. Ausente/em branco → `InMemoryCampaignRepository`. |
| `NEXT_PUBLIC_MOCK_LATENCY_MS` | `preprocess(blankToUndefined, z.coerce.number().int().min(0).max(10_000).default(600))` | Latência simulada do repositório em memória.                                                                            |

Exemplo de `.env.example`:

```bash
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_MOCK_LATENCY_MS=600
```

Erros: falha de validação lança `InvalidEnvError` com mensagem `Variáveis de ambiente inválidas: <caminho>: <mensagem>; ...`.

## 5. Domínio

Nenhum artefato de domínio é criado por esta feature. A composição depende da porta `CampaignRepository` (`src/domain/campaign/CampaignRepository.ts`), implementada pelos repositórios HTTP e em memória.

## 6. Aplicação

Nenhum caso de uso próprio. O container instancia `ListCampaigns`, `GetCampaignDetails` e `GetDashboardSummary` (documentados nas specs das fases 2–4) com o repositório escolhido.

## 7. Infraestrutura

- `src/infrastructure/config/env.ts` — `parseEnv(source): AppEnv` (`{ apiUrl: string | undefined; mockLatencyMs: number }`), `readProcessEnv()` (lê somente `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_MOCK_LATENCY_MS` de `process.env`), `InvalidEnvError`.
- `src/main/container.ts` — `createContainer(env, overrides?)` retorna `{ dataSource: 'http' | 'mock'; useCases }`. `ContainerOverrides` aceita `fetchFn` (usado no `FetchHttpClient`) e `now` (data de referência dos mocks; padrão `new Date()`). No modo mock usa `createMockCampaigns(now())` e `latencyMs: env.mockLatencyMs`. `createContainerFromProcessEnv()` = `createContainer(parseEnv(readProcessEnv()))`.
- `src/main/AppRoot.tsx` — `'use client'`; resolve uma única vez (via `useState`) o container injetado ou o do ambiente e um `QueryClient` de `createQueryClient`; renderiza `AppProviders`.

## 8. Apresentação

**Providers:**

- `AppProviders` — `QueryClientProvider` → `UseCasesProvider` → `<ThemeSync />` + `children`.
- `UseCasesContext.tsx` — tipo `UseCases` (`listCampaigns`, `getCampaignDetails`, `getDashboardSummary`, cada um `Pick<..., 'execute'>`), `UseCasesProvider`, `useUseCases()`.
- `queryClient.ts` — `createQueryClient()` com `staleTime: 60_000` e `retry: 1`.

**Store:** `themeStore.ts` — Zustand + `persist` (`createJSONStorage(() => localStorage)`, `partialize` só `preference`, `skipHydration: true`). Estado `{ preference: 'system' | 'light' | 'dark'; setPreference; cycle }`; `THEME_STORAGE_KEY = 'marketing-insights:theme'`; `rehydrateThemePreference()`.

**Tema:**

- `resolveTheme.ts` — `resolveTheme(preference, systemPrefersDark)`, `applyTheme(root, theme)` (alterna a classe `dark`), `DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'`.
- `ThemeSync.tsx` — reidrata a store no mount; a cada mudança de `preference` aplica o tema e registra listener `change` no `matchMedia`, removendo-o no cleanup. Renderiza `null`.
- `themeInitScript.ts` — IIFE em string que lê a chave persistida, aceita apenas `light`/`dark` (qualquer outro valor vira `system`), resolve com `matchMedia` e alterna `dark` em `document.documentElement`, tudo em `try/catch`.

**Layout:** `AppShell`, `NavLinks`, `ThemeToggle`, `navItems.ts` (`NAV_ITEMS`: Dashboard `/`, Campanhas `CAMPAIGNS_ROUTE`), `isActiveRoute.ts`.

**Hooks / query keys:** Nenhum nesta feature.

## 9. Arquivos

Produção:

- `src/app/layout.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/loading.tsx`
- `src/app/globals.css`
- `src/main/container.ts`
- `src/main/AppRoot.tsx`
- `src/infrastructure/config/env.ts`
- `src/presentation/components/layout/AppShell.tsx`
- `src/presentation/components/layout/NavLinks.tsx`
- `src/presentation/components/layout/ThemeToggle.tsx`
- `src/presentation/components/layout/navItems.ts`
- `src/presentation/components/layout/isActiveRoute.ts`
- `src/presentation/components/ui/StateViews.tsx`
- `src/presentation/providers/AppProviders.tsx`
- `src/presentation/providers/UseCasesContext.tsx`
- `src/presentation/providers/queryClient.ts`
- `src/presentation/stores/themeStore.ts`
- `src/presentation/theme/resolveTheme.ts`
- `src/presentation/theme/ThemeSync.tsx`
- `src/presentation/theme/themeInitScript.ts`
- `.env.example`

Testes:

- `src/app/__tests__/layout.test.tsx`
- `src/app/__tests__/error.test.tsx`
- `src/app/__tests__/not-found.test.tsx`
- `src/app/__tests__/loading.test.tsx`
- `src/main/__tests__/container.test.ts`
- `src/main/__tests__/AppRoot.test.tsx`
- `src/infrastructure/config/__tests__/env.test.ts`
- `src/presentation/components/layout/__tests__/AppShell.test.tsx`
- `src/presentation/components/layout/__tests__/NavLinks.test.tsx`
- `src/presentation/components/layout/__tests__/ThemeToggle.test.tsx`
- `src/presentation/components/layout/__tests__/isActiveRoute.test.ts`
- `src/presentation/components/ui/__tests__/StateViews.test.tsx`
- `src/presentation/providers/__tests__/providers.test.tsx`
- `src/presentation/stores/__tests__/stores.test.ts`
- `src/presentation/theme/__tests__/resolveTheme.test.ts`
- `src/presentation/theme/__tests__/ThemeSync.test.tsx`
- `src/presentation/theme/__tests__/themeInitScript.test.ts`
- `src/presentation/theme/__tests__/matchMediaStub.ts` (utilitário)

## 10. Regras de negócio

| RN    | Descrição                                                                                                                               |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | `isActiveRoute(pathname, '/')` só é verdadeiro para `pathname === '/'`.                                                                 |
| RN-02 | Para outros `href`, ativo quando `pathname === href` ou `pathname` começa com `${href}/` (ex.: `/campaignsx` não ativa `/campaigns`).   |
| RN-03 | Ciclo do tema: `system → light → dark → system`.                                                                                        |
| RN-04 | `resolveTheme('system', dark)` segue o sistema; `light`/`dark` explícitos ignoram o sistema.                                            |
| RN-05 | Somente `preference` é persistida (`partialize`); a store não reidrata sozinha (`skipHydration`), quem reidrata é `ThemeSync` no mount. |
| RN-06 | `themeInitScript` trata valor salvo diferente de `light`/`dark` como `system` e engole exceções (JSON corrompido).                      |
| RN-07 | Strings em branco nas variáveis de ambiente são tratadas como ausentes (trim).                                                          |
| RN-08 | `apiUrl` tem barras finais removidas; `mockLatencyMs` é inteiro entre 0 e 10000, padrão 600.                                            |
| RN-09 | `dataSource` é `'mock'` quando `apiUrl === undefined`, senão `'http'`.                                                                  |
| RN-10 | Os dados mock são gerados relativos à data de referência (`now`) do container.                                                          |
| RN-11 | `AppRoot` cria container e `QueryClient` uma única vez por montagem; um container injetado tem precedência sobre o do ambiente.         |
| RN-12 | Queries têm `staleTime` de 60 s e 1 retentativa por padrão.                                                                             |

## 11. BDD — Cenários de teste unitário

| Cenário                                                       | Arquivo de teste                                                     | Asserção                                                                                                                                                                                    |
| ------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout renderiza html pt-BR, script de tema, shell e conteúdo | `src/app/__tests__/layout.test.tsx`                                  | HTML contém `<html lang="pt-BR" class="font-inter-test">`, início do `themeInitScript`, "Marketing Insights", "Navegação principal" e `<main>` com o filho.                                 |
| Layout define metadados                                       | `src/app/__tests__/layout.test.tsx`                                  | `metadata.title` = `{ default: 'Marketing Insights', template: '%s · Marketing Insights' }`.                                                                                                |
| Página de erro chama reset                                    | `src/app/__tests__/error.test.tsx`                                   | `role="alert"` com "Algo deu errado"; clique em "Tentar novamente" chama `reset` 1 vez.                                                                                                     |
| 404 oferece retorno ao dashboard                              | `src/app/__tests__/not-found.test.tsx`                               | Informa página inexistente e link de volta para o dashboard.                                                                                                                                |
| Loading anuncia carregamento                                  | `src/app/__tests__/loading.test.tsx`                                 | Exibe `role="status"` de carregamento.                                                                                                                                                      |
| Container mock sem URL                                        | `src/main/__tests__/container.test.ts`                               | `dataSource === 'mock'`; filtro por `email` só retorna e-mail; `cmp-001` = "Black Friday – Search Marca"; resumo com `campaignCount` 14.                                                    |
| Container HTTP com URL                                        | `src/main/__tests__/container.test.ts`                               | `dataSource === 'http'`; lista `['cmp-001']`; URL chamada `https://api.exemplo.com/v1/campaigns`.                                                                                           |
| Container usa fetch global e relógio real por padrão          | `src/main/__tests__/container.test.ts`                               | `dataSource` `'http'` com URL e `'mock'` sem URL, sem overrides.                                                                                                                            |
| Container a partir do process.env                             | `src/main/__tests__/container.test.ts`                               | Com `NEXT_PUBLIC_API_URL` → `'http'`; sem → `'mock'`.                                                                                                                                       |
| AppRoot usa container injetado                                | `src/main/__tests__/AppRoot.test.tsx`                                | `useUseCases()` recebe `container.useCases`.                                                                                                                                                |
| AppRoot cria container do ambiente                            | `src/main/__tests__/AppRoot.test.tsx`                                | Casos de uso `listCampaigns`, `getCampaignDetails`, `getDashboardSummary` disponíveis.                                                                                                      |
| Env padrão                                                    | `src/infrastructure/config/__tests__/env.test.ts`                    | `parseEnv({})` = `{ apiUrl: undefined, mockLatencyMs: 600 }`.                                                                                                                               |
| Env com strings vazias                                        | `src/infrastructure/config/__tests__/env.test.ts`                    | `'  '` e `''` tratados como ausentes.                                                                                                                                                       |
| Env normaliza URL e latência                                  | `src/infrastructure/config/__tests__/env.test.ts`                    | `' https://api.exemplo.com/v1/ '` → `https://api.exemplo.com/v1`; `'0'` → `0`.                                                                                                              |
| Env inválido                                                  | `src/infrastructure/config/__tests__/env.test.ts`                    | URL `nao-e-url`, latência `abc`, `-5`, `20000` lançam `InvalidEnvError` com o nome da variável.                                                                                             |
| readProcessEnv                                                | `src/infrastructure/config/__tests__/env.test.ts`                    | Retorna só as duas variáveis públicas.                                                                                                                                                      |
| AppShell completo                                             | `src/presentation/components/layout/__tests__/AppShell.test.tsx`     | Marca, navegação, alternador de tema e conteúdo renderizados.                                                                                                                               |
| NavLinks destinos                                             | `src/presentation/components/layout/__tests__/NavLinks.test.tsx`     | Nav "Navegação principal"; "Dashboard" → `/`, "Campanhas" → `/campaigns`.                                                                                                                   |
| NavLinks ativo na raiz                                        | `src/presentation/components/layout/__tests__/NavLinks.test.tsx`     | "Dashboard" com `aria-current="page"`; "Campanhas" sem.                                                                                                                                     |
| NavLinks ativo em detalhe                                     | `src/presentation/components/layout/__tests__/NavLinks.test.tsx`     | Em `/campaigns/xyz`, "Campanhas" ativo e "Dashboard" não.                                                                                                                                   |
| isActiveRoute tabela                                          | `src/presentation/components/layout/__tests__/isActiveRoute.test.ts` | `('/','/')`→true, `('/campaigns','/')`→false, `('/campaigns','/campaigns')`→true, `('/campaigns/abc','/campaigns')`→true, `('/campaignsx','/campaigns')`→false, `('/','/campaigns')`→false. |
| ThemeToggle cicla e aplica dark                               | `src/presentation/components/layout/__tests__/ThemeToggle.test.tsx`  | Textos "Tema: sistema" → "Tema: claro" → "Tema: escuro" → "Tema: sistema"; `<html>` com `dark` só no escuro.                                                                                |
| themeStore ciclo                                              | `src/presentation/stores/__tests__/stores.test.ts`                   | `system` → `light` → `dark` → `system`.                                                                                                                                                     |
| themeStore setPreference                                      | `src/presentation/stores/__tests__/stores.test.ts`                   | `setPreference('dark')` define `dark`.                                                                                                                                                      |
| themeStore persiste só preferência                            | `src/presentation/stores/__tests__/stores.test.ts`                   | Chave `marketing-insights:theme`; `state` = `{ preference: 'light' }`.                                                                                                                      |
| themeStore reidrata                                           | `src/presentation/stores/__tests__/stores.test.ts`                   | Após `rehydrateThemePreference()`, preferência salva `dark` é restaurada.                                                                                                                   |
| resolveTheme tabela                                           | `src/presentation/theme/__tests__/resolveTheme.test.ts`              | `system`+escuro→dark, `system`+claro→light, `light`+escuro→light, `dark`+claro→dark.                                                                                                        |
| applyTheme                                                    | `src/presentation/theme/__tests__/resolveTheme.test.ts`              | Adiciona e remove a classe `dark`.                                                                                                                                                          |
| ThemeSync aplica preferência                                  | `src/presentation/theme/__tests__/ThemeSync.test.tsx`                | `dark` adiciona a classe; `light` remove.                                                                                                                                                   |
| ThemeSync reage ao sistema                                    | `src/presentation/theme/__tests__/ThemeSync.test.tsx`                | Em `system`, mudança do media query alterna `dark`.                                                                                                                                         |
| ThemeSync ignora sistema com preferência explícita            | `src/presentation/theme/__tests__/ThemeSync.test.tsx`                | Com `light`, sistema escuro não adiciona `dark`.                                                                                                                                            |
| ThemeSync remove listener                                     | `src/presentation/theme/__tests__/ThemeSync.test.tsx`                | `listenerCount` 1 montado, 0 após `unmount`.                                                                                                                                                |
| ThemeSync restaura preferência                                | `src/presentation/theme/__tests__/ThemeSync.test.tsx`                | Preferência salva `dark` restaurada e classe aplicada.                                                                                                                                      |
| themeInitScript dark salvo                                    | `src/presentation/theme/__tests__/themeInitScript.test.ts`           | Aplica escuro.                                                                                                                                                                              |
| themeInitScript light salvo com sistema escuro                | `src/presentation/theme/__tests__/themeInitScript.test.ts`           | Aplica claro.                                                                                                                                                                               |
| themeInitScript sem preferência                               | `src/presentation/theme/__tests__/themeInitScript.test.ts`           | Segue o sistema.                                                                                                                                                                            |
| themeInitScript preferência inválida                          | `src/presentation/theme/__tests__/themeInitScript.test.ts`           | Segue o sistema.                                                                                                                                                                            |
| themeInitScript conteúdo corrompido                           | `src/presentation/theme/__tests__/themeInitScript.test.ts`           | Não lança erro.                                                                                                                                                                             |
| UseCasesContext expõe casos de uso                            | `src/presentation/providers/__tests__/providers.test.tsx`            | Consumidor recebe os casos de uso do provider.                                                                                                                                              |
| UseCasesContext fora do provider                              | `src/presentation/providers/__tests__/providers.test.tsx`            | Lança erro.                                                                                                                                                                                 |
| AppProviders                                                  | `src/presentation/providers/__tests__/providers.test.tsx`            | Disponibiliza query client, casos de uso e sincroniza o tema.                                                                                                                               |
| createQueryClient                                             | `src/presentation/providers/__tests__/providers.test.tsx`            | `staleTime` e `retry` padrão configurados.                                                                                                                                                  |
| StateViews                                                    | `src/presentation/components/ui/__tests__/StateViews.test.tsx`       | Loading, erro (com/sem "Tentar novamente") e vazio (com/sem ação).                                                                                                                          |

## Nota

Visual atualizado pela fase 5 (platform/apsen-visual-identity). A seção 3 (UX) descreve o visual da época; o markup e as classes atuais estão em [apsen-visual-identity](apsen-visual-identity.md) e em `docs/design/DESIGN_SPEC.md`.
