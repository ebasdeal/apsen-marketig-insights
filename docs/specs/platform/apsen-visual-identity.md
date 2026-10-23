---
status: DONE
fase: 5
area: platform
feature: apsen-visual-identity
azure-devops-work-item:
---

# Identidade visual Apsen

## 1. Overview

Aplicar no `marketing-insights-web` o visual do protótipo **Apsen Demand Intelligence**, seguindo à risca `docs/design/DESIGN_SPEC.md`: tokens `apsen-*`, shell com sidebar e topbar, UI kit novo e as três telas redesenhadas. O domínio não muda. Continuam os mesmos casos de uso, hooks, stores, rotas e comportamentos das fases 1–4 ([app-shell-and-theme](app-shell-and-theme.md), [dashboard-summary](../dashboard/dashboard-summary.md), [campaign-list](../campaigns/campaign-list.md), [campaign-details](../campaigns/campaign-details.md)). Esta spec substitui só a seção de UX delas.

## 2. Critérios de aceite

Cada critério corresponde a um grupo do checklist de fidelidade (`DESIGN_SPEC.md` §5). Todos foram conferidos no navegador em 1440x900 e 390x844, com `getComputedStyle` comparado entre o protótipo e o app.

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | Base: o `body` computa Inter, 14px, `line-height: normal`, `#141414` sobre `#FAFAFA` e `overflow: hidden`. O `@theme` do `globals.css` define os tokens `apsen-*`, a transição padrão `ease` de 140ms e o `svg` como `inline-block`. A fonte Inter carrega só os pesos 400/500/600/700 e o body não usa `antialiased`.                                                                                                                                                                                                                               |
| CA-02 | `src/app` e `src/presentation` não têm `brand-*`, `slate-N`, `emerald-`, `amber-`, `red-N` nem hex solto. As cores vêm só dos tokens.                                                                                                                                                                                                                                                                                                                                                                                                                |
| CA-03 | Shell: sidebar de 252px com bloco do logo de 64px e logo de 34px, "Dashboard" ativo como pílula azul, grupo "Campanhas" recolhível (seta gira em .18s), item ativo com borda de 3px, fundo `apsen-blue-bg` e recuo de 44px, e footer de 10px/1.8. A topbar tem 64px, com burger, trilha "Marketing Insights › página", alternador de tema e avatar de 30px. O `main` tem padding 22/24 e é o único que rola.                                                                                                                                         |
| CA-04 | O burger recolhe a sidebar no desktop: o aside vai para -252px e a topbar e o main ocupam a largura toda. Abaixo de 800px a sidebar começa fechada e abre por cima do conteúdo, com o overlay `apsen-overlay` [derivado]. A página não rola na horizontal em 390px.                                                                                                                                                                                                                                                                                  |
| CA-05 | UI kit: `PageHeader`, `Card` e `Section`, `KpiCard`, `Button`/`ButtonLink` (as variantes ghost e outline com borda visível), `ChipGroup`, `FormSelect`, `SearchInput`, `Pagination`, `ResultSummary`, `StatusBadge`, `ChannelPill`, `BarRow`, `ProgressBar`, `ScreenDesc` e `StateViews`, todos com as medidas do §3.                                                                                                                                                                                                                                |
| CA-06 | Estados de carregamento, erro e vazio sem spinner nem animação. O erro usa o layout centralizado de 60vh com h3 de 16px/600 e "Tentar novamente" (outline). O vazio tem ícone de 36px e padding de 48px/24px.                                                                                                                                                                                                                                                                                                                                        |
| CA-07 | Dashboard: o `PageHeader` traz o filtro de período e o botão "Atualizar". Abaixo, 8 KPIs em 4 colunas (gap de 14px, 20px até os painéis) e os painéis "Investimento por canal" e "Top campanhas por ROAS" lado a lado, com o link "Ver todas →".                                                                                                                                                                                                                                                                                                     |
| CA-08 | Lista (`#screen-planos`): a ordem é header → `ScreenDesc` → barra de filtros (busca + 3 selects) → contador "**n** campanhas · {período}" e "Limpar filtros" → `CampaignTable` (Código, Campanha/Período, Canal, Status, Investimento, ROAS, Ações) → `Pagination`. O `th` "Código" é azul e os demais muted; o Status é texto colorido "● {status}" 12px/600 (verde, laranja, muted), sem pílula; o código é `TextLink` variante `code` (mono 12px/600 azul) e a ação é `IconLink` com `EyeIcon`; o vazio é uma linha `colspan=7` com padding 30px. |
| CA-13 | Selects da lista: `FormSelect` (`.form-select`: radius 6, borda `apsen-border`, padding 8/11, 13.5px, `field-focus`) com nome acessível "Canal" (180px, "Todos os canais" + canais), "Status" (170px, "Todos os status" + "● Ativa/Pausada/Encerrada") e "Período" (170px, presets). Os valores alimentam a mesma store e o mesmo `ListCampaigns` da fase 3; "Todos" vira `null`.                                                                                                                                                                    |
| CA-14 | Busca: `SearchInput` "Buscar campanha" (placeholder "Buscar campanha pelo nome...", lupa à esquerda, `min-w-[220px]`) filtra no cliente por nome, sem caixa nem acento (`filterCampaignsByName`), sem nova consulta à API. Busca não vazia conta como filtro ativo para "Limpar filtros", que zera busca, filtros e página.                                                                                                                                                                                                                          |
| CA-15 | Paginação: 8 campanhas por página, "Mostrando a–b de n" (`aria-live`), botões redondos de 28px, página atual azul com `aria-current="page"`, "‹"/"›" desabilitados com opacity .35 nas pontas e reticências entre páginas distantes. Mudar busca ou filtro volta para a página 1; página fora do intervalo é ajustada (`clampPage`).                                                                                                                                                                                                                 |
| CA-09 | Detalhe: a ordem é crumb interno → "← Voltar" (ghost sm) → título com `StatusBadge` lg → seção 💰 Orçamento → 4 KPIs → seção 📊 Métricas da campanha (`dl`). A tela "Não encontrada" usa 🔍 e "← Voltar para Campanhas".                                                                                                                                                                                                                                                                                                                             |
| CA-10 | As páginas globais seguem o kit: `not-found` usa `ErrorState` 🔍 "Página não encontrada" com o link "← Voltar ao Dashboard", `error` usa `ErrorState` "Algo deu errado" com "Tentar novamente" (`reset`) e `loading` usa `LoadingState`.                                                                                                                                                                                                                                                                                                             |
| CA-11 | Tema escuro [derivado]: com `html.dark`, superfícies, textos, bordas e sombras trocam pela redefinição dos tokens (o único `dark:` é o que inverte o logo da sidebar), e nenhum texto fica ilegível. As cores de canal não mudam.                                                                                                                                                                                                                                                                                                                    |
| CA-12 | O console fica sem erros e sem avisos de hidratação em `/`, `/campaigns` e `/campaigns/cmp-001`.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## 3. UX / Fluxo de tela

As rotas e os títulos não mudam desde as fases 1–4. Referências em `docs/design/DESIGN_SPEC.md`:

- **Tokens e base** (§1): `@theme` com `--color-apsen-*`, `--spacing-sidebar`/`--spacing-topbar`, `--radius-apsen*`, `--shadow-apsen*` e transição padrão de 140ms `ease`. O `html.dark` redefine os mesmos tokens. As utilities do `globals.css` são:

  | Utility       | Uso                                                                                 |
  | ------------- | ----------------------------------------------------------------------------------- |
  | `focus-ring`  | Foco visível em elementos interativos                                               |
  | `surface`     | Card padrão (radius 16, borda, sombra-sm, padding 20/22, mb 16)                     |
  | `field-focus` | Foco de campos (borda azul e `shadow-apsen-focus`)                                  |
  | `page-title`  | Título de página 18px/700/1.2 (`PageHeader`, `CampaignHeader`)                      |
  | `page-sub`    | Subtítulo 12.5px muted a 3px do título                                              |
  | `kpi-grid`    | Grade de KPIs em 4 colunas, gap 14, mb 20, 2 colunas até 800px e 1 coluna até 560px |
  | `state-block` | Bloco centralizado dos estados de carregamento e vazio (padding 48/24, muted)       |

- **Shell** (§2): `AppShell` monta `NavProvider`, `Sidebar` (`NavLinks`, `NavModuleGroup`, `NavBadge`, `NavIcons`), `Topbar` (burger, trilha `crumbFor`, `ThemeToggle` com `buttonClasses('ghost','sm')`, avatar) e `ShellMain`.
- **UI kit** (§3): os componentes de `@presentation/components/ui` listados no CA-05, mais `TextLink`, `IconButton`/`IconLink`/`ActionGroup`, `Badge`, `icons` e `channelColors`.
- **Telas** (§4): dashboard (§4.1), lista (§4.2) e detalhe (§4.3), conforme os critérios CA-07 a CA-09.
- Os estados de cada tela continuam os das fases 2–4 (carregando, erro com "Tentar novamente", vazio e dados), agora com o visual do §3.12.

**Desvios registrados** (decisões do DESIGN_SPEC, mantidas de propósito):

| Ponto                                       | Protótipo                | App                                                                |
| ------------------------------------------- | ------------------------ | ------------------------------------------------------------------ |
| Role bar, banner de perfil, chat da análise | Existem                  | Fora do app (§0.1)                                                 |
| Filtro de período no Dashboard              | Não existe               | Chips nas `actions` do `PageHeader` [mapeamento]                   |
| "Limpar filtros" da lista                   | Não existe em planos     | `Button ghost sm` da aprovação, só com filtro ou busca ativa       |
| Código da campanha                          | `span` mono azul         | `TextLink` `code` com o mesmo visual, para navegar ao detalhe      |
| Paginação com zero itens                    | "Mostrando 1–0 de 0"     | "Mostrando 0–0 de 0"                                               |
| Trilha da topbar em 390px                   | Sem comportamento mobile | Quebra em duas linhas, sem scroll horizontal                       |
| Barra de canal                              | Contador de 24px         | Valor em reais (`min-w-[72px]`), por isso o trilho fica mais curto |
| Tema escuro e mobile                        | Não existem              | [derivado], só por tokens e breakpoints do protótipo               |

## 4. Contratos de API consumidos

Nenhum. Os contratos das fases 2–4 não mudam.

## 5. Domínio (`src/domain`)

Nenhum. O domínio não muda.

## 6. Aplicação (`src/application`)

Nenhum. Casos de uso e DTOs continuam os mesmos.

## 7. Infraestrutura (`src/infrastructure`)

Nenhum.

## 8. Apresentação (`src/presentation`)

- Hooks, `queryKeys`, `themeStore` e o registro em `UseCases`/`createContainer` continuam iguais.
- `campaignFiltersStore` ganha só estado de apresentação: `search`, `page`, `setSearch` e `setPage`. Toda mudança de filtro ou busca volta para a página 1 e `hasActiveFilters` considera a busca. A entrada do `ListCampaigns` continua `{ channel, status, period }`.
- Derivação pura da lista: `campaignListView.ts` (`normalizeSearchText`, `filterCampaignsByName`, `buildCampaignListView`, `campaignCountNoun`, `CAMPAIGNS_PER_PAGE = 8`), `campaignFilterOptions.ts` (opções dos selects, `toSelectValue`/`fromSelectValue`) e `components/ui/pageRange.ts` (`pageCount`, `clampPage`, `pageSlice`, `pageRangeLabel`, `paginationItems`).
- Componentes visuais novos no UI kit: `Button`/`ButtonLink` + `buttonClasses`, `ChannelPill`, `BarRow`, `FormSelect`, `SearchInput`, `Pagination`, `ResultSummary`, `ScreenDesc`, `TextLink` (variantes `table`, `code`, `more`, `crumb`), `IconButton`/`IconLink`/`ActionGroup`, `Badge`, `icons` e `channelColors`. `TextLink`, `IconLink` e `ButtonLink` aceitam rotas tipadas dinâmicas (`Route<T>`).
- Shell novo em `components/layout`: `Sidebar`, `Topbar`, `ShellMain`, `NavContext`, `NavModuleGroup`, `NavBadge`, `NavIcons` e `crumbFor`.
- Features: a lista troca os cards por `CampaignFilters` (busca + selects), `CampaignResultSummary`, `CampaignTable`/`CampaignRow`/`CampaignStatusText` e `Pagination`. O detalhe ganha `CampaignCrumb` e `CampaignKpiGrid`.

## 9. Arquivos

### Novos

- `src/presentation/components/ui/{Badge,BarRow,Button,buttonClasses,ChannelPill,channelColors,FormSelect,IconButton,icons,pageRange,Pagination,ResultSummary,ScreenDesc,SearchInput,TextLink}.ts(x)`
- `src/presentation/components/layout/{Sidebar,Topbar,ShellMain,NavContext,NavModuleGroup,NavBadge,NavIcons,crumbFor}.ts(x)`
- `src/presentation/features/campaigns/components/{CampaignTable,CampaignRow,CampaignStatusText,CampaignResultSummary}.tsx`, `src/presentation/features/campaigns/{formatShortPeriod,campaignListView,campaignFilterOptions}.ts`
- `src/presentation/features/campaigns/details/components/{CampaignCrumb,CampaignKpiGrid}.tsx`
- `src/app/__tests__/globals.test.ts` e os testes de cada componente novo

### Modificados

- `src/app/globals.css`: tokens `apsen-*`, tema escuro por tokens, base (line-height, svg) e as utilities `page-title`, `page-sub`, `kpi-grid` e `state-block`.
- `src/app/layout.tsx`: Inter com os pesos 400–700, sem `antialiased`.
- `src/app/{error,not-found,loading}.tsx`: passam a usar `ErrorState`/`LoadingState` do kit.
- `src/presentation/components/ui/{Card,Section,PageHeader,KpiCard,ChipGroup,StatusBadge,ProgressBar,StateViews,index}.ts(x)`: visual do §3.
- `src/presentation/components/layout/{AppShell,NavLinks,ThemeToggle,navItems,isActiveRoute}.ts(x)`: shell do §2.
- `src/presentation/features/**`: telas e componentes do §4.

### Removidos

- `src/presentation/features/campaigns/components/CampaignCard.tsx`, substituído pela linha da `CampaignTable`.
- `src/presentation/components/ui/{DataTable,Toolbar}.tsx`: sem uso depois da tabela própria da lista e da barra de selects (`ResultSummary` passou para `ResultSummary.tsx`).
- `src/presentation/features/campaigns/components/OpenCampaignLink.tsx`: substituído por `IconLink`.
- `src/presentation/format/campaignText.ts` (`describeChannelPeriod`): sem uso depois do redesenho.
- `CHANNEL_OPTIONS` e `STATUS_OPTIONS` de `components/filterOptions.ts`: os chips de canal e status saíram (o dashboard usa só `PERIOD_OPTIONS`).

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RN-01 | O comportamento das fases 1–4 não muda: filtros, estados (carregando, erro com "Tentar novamente", vazio, dados), navegação e 404 continuam com os mesmos textos e nomes acessíveis. |
| RN-02 | Cor só por token `apsen-*`. Componente não leva hex solto e o tema escuro só redefine tokens.                                                                                        |
| RN-03 | Classe repetida em mais de um componente vira componente do UI kit ou `@utility` no `globals.css`.                                                                                   |

## 11. BDD — Cenários de teste unitário

| Cenário                              | Arquivo de teste                                                                                                                                                                                                      | Asserção                                                                                                                                                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01/CA-02 tokens, base e utilities | `src/app/__tests__/globals.test.ts`                                                                                                                                                                                   | Tokens `apsen-*` sem `brand-`, `line-height: normal`, `svg` inline-block, 140ms `ease`, utilities `focus-ring`/`surface`/`field-focus`/`page-title`/`page-sub`/`kpi-grid`/`state-block` e tokens redefinidos no `html.dark`. |
| CA-01 fonte e layout raiz            | `src/app/__tests__/layout.test.tsx`                                                                                                                                                                                   | `lang="pt-BR"`, variável da Inter e script de tema no `<head>`.                                                                                                                                                              |
| CA-03/CA-04 shell                    | `src/presentation/components/layout/__tests__/{AppShell,NavLinks,NavModuleGroup,NavBadge,NavContext,Topbar,ThemeToggle}.test.tsx`, `crumbFor.test.ts`, `isActiveRoute.test.ts`                                        | Item ativo (`aria-current`, borda azul), grupo recolhível, burger alterna a sidebar e o overlay, trilha por rota e alternância do tema.                                                                                      |
| CA-05 UI kit                         | `src/presentation/components/ui/__tests__/{Button,ChannelPill,ChipGroup,FormSelect,IconButton,KpiCard,layout,Pagination,ProgressBar,ResultSummary,SearchInput,StatusBadge,TextLink,BarRow}.test.tsx`, `index.test.ts` | Variantes e tamanhos, nenhuma variante de botão com `border-transparent`, `page-title`/`page-sub` no `PageHeader`, radiogroup, select, busca, paginação, pílulas por status e canal.                                         |
| CA-06 estados                        | `src/presentation/components/ui/__tests__/StateViews.test.tsx`                                                                                                                                                        | `state-block` sem `animate-spin`, erro de 60vh com "Tentar novamente" outline, vazio com ação opcional.                                                                                                                      |
| CA-07 dashboard                      | `src/presentation/features/dashboard/__tests__/DashboardScreen.test.tsx`, `components/__tests__/*.test.tsx`                                                                                                           | Carregando, erro com retry, vazio e dados. Tons dos KPIs, `BarRow` por canal, top campanhas com "Ver todas →".                                                                                                               |
| CA-08 lista                          | `src/presentation/features/campaigns/__tests__/CampaignListScreen.test.tsx`, `components/__tests__/{CampaignFilters,CampaignResultSummary,CampaignTable}.test.tsx`                                                    | Ordem dos blocos, contador, "Limpar filtros", `th` Código azul, status em texto, link de código e `IconLink`, e o vazio em colspan com e sem filtro.                                                                         |
| CA-13 selects                        | `components/ui/__tests__/FormSelect.test.tsx`, `features/campaigns/__tests__/campaignFilterOptions.test.ts`, `components/__tests__/CampaignFilters.test.tsx`                                                          | Classes do `.form-select`, opções "Todos os canais"/"Todos os status"/"● Ativa", "Todos" vira `null` e a escolha atualiza a store.                                                                                           |
| CA-14 busca                          | `components/ui/__tests__/SearchInput.test.tsx`, `features/campaigns/__tests__/{campaignListView.test.ts,CampaignListScreen.test.tsx}`, `stores/__tests__/stores.test.ts`                                              | Busca sem caixa e acento, sem nova consulta, conta como filtro ativo e volta para a página 1.                                                                                                                                |
| CA-15 paginação                      | `components/ui/__tests__/{Pagination.test.tsx,pageRange.test.ts}`, `features/campaigns/__tests__/{campaignListView.test.ts,CampaignListScreen.test.tsx}`                                                              | 8 por página, "Mostrando a–b de n", página atual com `aria-current`, pontas desabilitadas, reticências e ajuste de página fora do intervalo.                                                                                 |
| CA-09 detalhe                        | `src/presentation/features/campaigns/details/__tests__/CampaignDetailsScreen.test.tsx`, `components/__tests__/components.test.tsx`                                                                                    | Crumb, Voltar, cabeçalho com badge, orçamento excedido, `kpi-grid` com 4 KPIs, métricas em `dl` e "não encontrada" com 🔍.                                                                                                   |
| CA-10 páginas globais                | `src/app/__tests__/{not-found,error,loading}.test.tsx`                                                                                                                                                                | 404 com link para `/`, erro chamando `reset` e loading sem animação.                                                                                                                                                         |
| CA-11/CA-12 tema escuro e console    | QA visual no navegador (Chrome headless, CDP)                                                                                                                                                                         | Screenshot de `/campaigns` com `html.dark` e console limpo nas 3 rotas.                                                                                                                                                      |
