---
status: DONE
fase: 2
area: dashboard
feature: dashboard-summary
azure-devops-work-item:
---

# Dashboard — resumo de desempenho

## 1. Overview

Tela inicial (`/`) com a visão consolidada das campanhas no período selecionado: grade de 8 KPIs (investimento, receita, ROAS, CPA, impressões, cliques/CTR, CPC, conversões/taxa), investimento por canal com participação percentual e ranking das top campanhas por ROAS. O período é escolhido por presets (Todo o período, Últimos 30 dias, Últimos 90 dias, Ano atual) compartilhados com a lista de campanhas. Os dados vêm do caso de uso `GetDashboardSummary`, que agrega no domínio (`buildDashboardSummary`) as campanhas devolvidas pelo repositório.

Esta spec é retroativa: documenta o comportamento implementado e coberto por testes.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | A rota `/` renderiza `DashboardScreen` com título de página "Dashboard" (metadata) e cabeçalho h1 "Dashboard" com a descrição "Visão geral do desempenho das campanhas.".                                                        |
| CA-02 | Enquanto carrega, exibe `role="status"` com "Carregando indicadores…".                                                                                                                                                           |
| CA-03 | Em erro, exibe `role="alert"` com "Não foi possível carregar os dados. Verifique sua conexão e tente novamente." e o botão "Tentar novamente", que refaz a consulta.                                                             |
| CA-04 | Quando `campaignCount === 0`, exibe o vazio "Sem campanhas no período" / "Escolha outro período para ver os indicadores." e nenhuma seção de conteúdo.                                                                           |
| CA-05 | Com dados, exibe 8 KPIs: Investimento (dica "{ativas} de {total} campanhas ativas"), Receita, ROAS, CPA, Impressões (compacto), Cliques (dica "CTR {x}"), CPC e Conversões (dica "Taxa {x}").                                    |
| CA-06 | A seção "Investimento por canal" lista um item por canal com rótulo, investimento, ROAS, barra "Participação de {canal} no investimento", "{n} campanha(s) · CTR {x} · CPA {y}".                                                 |
| CA-07 | A seção "Top campanhas por ROAS" lista no máximo 5 campanhas (padrão) numeradas a partir de 1, com nome, canal · período, status, ROAS e "{valor} investidos", cada uma com link "Abrir campanha {nome}" para `/campaigns/{id}`. |
| CA-08 | O filtro "Período" (radiogroup) altera o preset na store compartilhada e refaz a consulta com `{ period: { start, end } }`; "Todo o período" consulta sem período (`{}`).                                                        |
| CA-09 | O botão "Atualizar" refaz a consulta; durante o refetch mostra "Atualizando…", fica desabilitado e com `aria-busy`.                                                                                                              |
| CA-10 | O link "Ver todas as campanhas" leva a `/campaigns`.                                                                                                                                                                             |
| CA-11 | KPIs sem base de cálculo (divisão por zero) aparecem como "—".                                                                                                                                                                   |

## 3. UX / Fluxo de tela

**Rota:** `src/app/page.tsx` (Server Component, `metadata = { title: 'Dashboard' }`) → `<DashboardScreen />` (`'use client'`). Renderização estática; dados no cliente via TanStack Query.

**Estrutura (`DashboardScreen`):**

1. `PageHeader` título "Dashboard", descrição "Visão geral do desempenho das campanhas.", ação `RefreshButton` ("Atualizar" / "Atualizando…").
2. `ChipGroup` rótulo "Período" com `PERIOD_OPTIONS` (radios "Período: Todo o período", "Período: Últimos 30 dias", "Período: Últimos 90 dias", "Período: Ano atual").
3. `DashboardBody` (estados abaixo).
4. Link "Ver todas as campanhas" → `CAMPAIGNS_ROUTE`.

**Estados:**

| Estado  | Condição                   | Exibição                                                                                   |
| ------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| Loading | `query.isPending`          | `LoadingState` "Carregando indicadores…"                                                   |
| Erro    | `query.isError`            | `ErrorState` com `toUserMessage(error)` e "Tentar novamente" (`refetch`)                   |
| Vazio   | `data.campaignCount === 0` | `EmptyState` "Sem campanhas no período" / "Escolha outro período para ver os indicadores." |
| Dados   | demais                     | `DashboardContent`                                                                         |

**Conteúdo (`DashboardContent`):** `DashboardKpiGrid` (grade `grid-cols-2 lg:grid-cols-4`) e, em `lg:grid-cols-2`, as seções `Section` "Investimento por canal" (`ChannelBreakdownList`) e "Top campanhas por ROAS" (`TopCampaignsList`).

**KPIs (`DashboardKpiGrid`):** cada `KpiCard` é um `article` com `aria-label="{rótulo}: {valor}"`.

| Rótulo       | Valor                               | Dica                                                |
| ------------ | ----------------------------------- | --------------------------------------------------- |
| Investimento | `formatCurrency(totals.spend)`      | "{activeCount} de {campaignCount} campanhas ativas" |
| Receita      | `formatCurrency(totals.revenue)`    | —                                                   |
| ROAS         | `formatRoas(kpis.roas)`             | —                                                   |
| CPA          | `formatCurrency(kpis.cpa)`          | —                                                   |
| Impressões   | `formatCompact(totals.impressions)` | —                                                   |
| Cliques      | `formatInteger(totals.clicks)`      | "CTR {formatPercent(kpis.ctr)}"                     |
| CPC          | `formatCurrency(kpis.cpc)`          | —                                                   |
| Conversões   | `formatInteger(totals.conversions)` | "Taxa {formatPercent(kpis.conversionRate)}"         |

**Canais (`ChannelBreakdownList`):** `Card` com `<ul aria-label="Canais">`; cada `<li aria-label="{rótulo do canal}" data-channel>` mostra "{investimento} · ROAS {roas}", `ProgressBar` com `spendShare * 100` e rodapé "{n} campanha(s) · CTR {ctr} · CPA {cpa}". Lista vazia → "Nenhum canal no período.".

**Top campanhas (`TopCampaignsList`):** `<ol aria-label="Top campanhas">`; cada item é um link `aria-label="Abrir campanha {nome}"` para `campaignDetailsRoute(id)` com posição, nome, `describeChannelPeriod` ("{canal} · dd/mm/aaaa – dd/mm/aaaa"), `StatusBadge`, ROAS e "{investimento} investidos". Lista vazia → "Nenhuma campanha no período.".

## 4. Contratos de API consumidos

Indireto: o caso de uso chama `CampaignRepository.findAll(filter)`; no modo HTTP isso resulta em `GET {NEXT_PUBLIC_API_URL}/campaigns` com `from`/`to` (ISO-8601) quando há período. Não há endpoint de agregação: a consolidação é feita no cliente.

Exemplo (preset "Últimos 30 dias"):

```
GET https://api.exemplo.com/v1/campaigns?from=2026-09-23T15%3A00%3A00.000Z&to=2026-10-22T15%3A00%3A00.000Z
```

Resposta e validação Zod (`campaignListResponseSchema`), erros (`HttpError`, `NetworkError`, `InvalidResponseError`) e regras de contrato: ver `docs/specs/campaigns/campaign-list.md` (seção 4). Qualquer erro leva ao estado de erro com "Tentar novamente".

## 5. Domínio

- `src/domain/dashboard/DashboardSummary.ts`
  - `ChannelBreakdown { channel; campaignCount; metrics: Metrics }`
  - `DashboardSummary { campaignCount; activeCount; totals: Metrics; byChannel; topByRoas: Campaign[] }`
  - `rankByRoas(campaigns, limit)` — descarta ROAS `null`, ordena por ROAS desc com desempate por nome (`localeCompare`), corta em `max(0, limit)`.
  - `breakdownByChannel(campaigns)` — agrupa por `CHANNELS`, soma `Metrics`, omite canais sem campanhas e ordena por investimento desc.
  - `buildDashboardSummary(campaigns, topLimit)` — total, ativos (`status === 'ativa'`), totais somados a partir de `Metrics.empty()`, breakdown e ranking.
- `src/domain/campaign/Metrics.ts` — `add`, `empty`, KPIs (`ctr`, `cpc`, `cpa`, `roas`, `conversionRate`) com `null` em divisão por zero.
- `src/domain/shared/Money.ts` — `ratioTo` (null se divisor zero), `divideBy`.
- `src/domain/shared/Percentage.ts` — `fromFraction` (null se denominador zero).
- `src/domain/campaign/CampaignRepository.ts` — porta `findAll(filter)`.

## 6. Aplicação

- `src/application/dashboard/GetDashboardSummary.ts`
  - Entrada: `GetDashboardSummaryInput = Pick<ListCampaignsInput, 'period'>` (`{ period?: { start: string; end: string } }`, padrão `{}`).
  - Construtor: `(repository: CampaignRepository, topLimit = DEFAULT_TOP_LIMIT)` com `DEFAULT_TOP_LIMIT = 5`.
  - Saída `DashboardSummaryOutput`: `{ campaignCount; activeCount; totals: MetricsOutput; kpis: KpisOutput; byChannel: ChannelBreakdownOutput[]; topCampaigns: CampaignListItemOutput[] }`.
  - `ChannelBreakdownOutput`: `{ channel; campaignCount; metrics: MetricsOutput; kpis: KpisOutput; spendShare: number | null }`, com `spendShare = spend do canal / spend total` (razão 0–1, `null` se total zero).
  - Reusa `toCampaignFilter` (`ListCampaigns.ts`) e os mappers `toMetricsOutput`, `toKpisOutput` (CTR e taxa em pontos percentuais, CPC/CPA em reais) e `toCampaignListItem`.
- `src/application/campaigns/periodPresets.ts` — `PERIOD_PRESETS = ['all','30d','90d','ytd']` e `resolvePeriodPreset(preset, now)`.

## 7. Infraestrutura

Nenhum artefato específico. Usa os repositórios `HttpCampaignRepository` / `InMemoryCampaignRepository` (`findAll` com filtro de período por sobreposição) documentados em `campaign-list.md`.

## 8. Apresentação

- **Hook:** `src/presentation/hooks/useDashboardSummary.ts` — `useDashboardSummary(preset)`; memoiza a entrada (`{}` para `all`, `{ period }` resolvido com `new Date()` para os demais); `queryKey = queryKeys.dashboard(input)` = `['dashboard', input]`; `queryFn = getDashboardSummary.execute(input)`.
- **Store:** `src/presentation/stores/campaignFiltersStore.ts` — o dashboard lê/escreve apenas `period` (`setPeriod`), compartilhado com a lista de campanhas (estado em memória, não persistido).
- **Opções:** `src/presentation/components/filterOptions.ts` — `PERIOD_OPTIONS` com `PERIOD_LABELS`.
- **Componentes:** `DashboardScreen` (com `RefreshButton` e `DashboardBody` internos), `DashboardContent`, `DashboardKpiGrid`, `ChannelBreakdownList`, `TopCampaignsList`; UI kit `PageHeader`, `ChipGroup`, `KpiCard`, `Section`, `Card`, `ProgressBar`, `StatusBadge`, `LoadingState`, `ErrorState`, `EmptyState`.
- **Formatação:** `formatters.ts` (`formatCurrency`, `formatPercent`, `formatRoas`, `formatCompact`, `formatInteger`), `labels.ts`, `campaignText.ts`, `errorMessage.ts`.
- **Rotas:** `CAMPAIGNS_ROUTE`, `campaignDetailsRoute(id)`.

## 9. Arquivos

Produção:

- `src/app/page.tsx`
- `src/domain/dashboard/DashboardSummary.ts`
- `src/application/dashboard/GetDashboardSummary.ts`
- `src/application/campaigns/periodPresets.ts`
- `src/application/campaigns/mappers.ts`
- `src/presentation/hooks/useDashboardSummary.ts`
- `src/presentation/hooks/queryKeys.ts`
- `src/presentation/stores/campaignFiltersStore.ts`
- `src/presentation/components/filterOptions.ts`
- `src/presentation/features/dashboard/DashboardScreen.tsx`
- `src/presentation/features/dashboard/components/DashboardContent.tsx`
- `src/presentation/features/dashboard/components/DashboardKpiGrid.tsx`
- `src/presentation/features/dashboard/components/ChannelBreakdownList.tsx`
- `src/presentation/features/dashboard/components/TopCampaignsList.tsx`
- `src/presentation/components/ui/KpiCard.tsx`
- `src/presentation/components/ui/ProgressBar.tsx`
- `src/presentation/components/ui/ChipGroup.tsx`
- `src/presentation/format/formatters.ts`
- `src/presentation/format/labels.ts`
- `src/presentation/format/campaignText.ts`
- `src/presentation/format/errorMessage.ts`

Testes:

- `src/app/__tests__/page.test.tsx`
- `src/domain/dashboard/__tests__/DashboardSummary.test.ts`
- `src/application/dashboard/__tests__/GetDashboardSummary.test.ts`
- `src/application/campaigns/__tests__/campaignUseCases.test.ts` (`resolvePeriodPreset`)
- `src/presentation/hooks/__tests__/hooks.test.tsx`
- `src/presentation/features/dashboard/__tests__/DashboardScreen.test.tsx`
- `src/presentation/features/dashboard/components/__tests__/DashboardContent.test.tsx`
- `src/presentation/features/dashboard/components/__tests__/ChannelBreakdownList.test.tsx`
- `src/presentation/features/dashboard/components/__tests__/TopCampaignsList.test.tsx`
- `src/presentation/components/ui/__tests__/KpiCard.test.tsx`
- `src/presentation/components/ui/__tests__/ProgressBar.test.tsx`
- `src/presentation/components/ui/__tests__/ChipGroup.test.tsx`
- `src/presentation/format/__tests__/format.test.ts`

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                    |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | `activeCount` conta só campanhas com status `ativa`.                                                                                                                         |
| RN-02 | Totais = soma de impressões, cliques, conversões, investimento e receita de todas as campanhas do período.                                                                   |
| RN-03 | KPIs consolidados: CTR = cliques/impressões, CPC = investimento/cliques, CPA = investimento/conversões, ROAS = receita/investimento, taxa de conversão = conversões/cliques. |
| RN-04 | Divisão por zero em qualquer KPI retorna `null` no domínio e é exibida como "—" na UI.                                                                                       |
| RN-05 | Breakdown por canal: só canais com ao menos uma campanha, ordenados por investimento decrescente.                                                                            |
| RN-06 | `spendShare` = investimento do canal / investimento total; `null` quando o total é zero (barra com largura 0, sem `aria-valuenow`, `aria-valuetext` "—").                    |
| RN-07 | Top campanhas: ignora ROAS `null`, ordena por ROAS desc, desempata por nome, limite padrão 5; limite negativo resulta em lista vazia.                                        |
| RN-08 | Presets de período: `all` → sem período; `30d`/`90d` → de `now - (dias-1)` dias até `now`; `ytd` → de 1º de janeiro (UTC) do ano corrente até `now`.                         |
| RN-09 | O filtro de período retorna campanhas cujo período se sobrepõe ao intervalo (`DateRange.overlaps`).                                                                          |
| RN-10 | O preset de período é compartilhado entre dashboard e lista de campanhas (mesma store).                                                                                      |
| RN-11 | Estado vazio é decidido por `campaignCount === 0`, não por listas parciais.                                                                                                  |
| RN-12 | Formatação pt-BR: moeda BRL, percentual e ROAS com 2 casas ("3,00x", "4,50%"), impressões em notação compacta (1 casa).                                                      |

## 11. BDD — Cenários de teste unitário

| Cenário                             | Arquivo de teste                                                                         | Asserção                                                                                                                                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rota define título                  | `src/app/__tests__/page.test.tsx`                                                        | `metadata` com título "Dashboard".                                                                                                                                                              |
| Rota renderiza o dashboard          | `src/app/__tests__/page.test.tsx`                                                        | `DashboardPage` renderiza a tela do dashboard.                                                                                                                                                  |
| rankByRoas ordena e desempata       | `src/domain/dashboard/__tests__/DashboardSummary.test.ts`                                | Ordem `['a','b','e','c']`; campanha com ROAS `null` excluída.                                                                                                                                   |
| rankByRoas limite                   | `src/domain/dashboard/__tests__/DashboardSummary.test.ts`                                | Limite 2 → `['a','b']`; limite -1 → `[]`.                                                                                                                                                       |
| breakdownByChannel                  | `src/domain/dashboard/__tests__/DashboardSummary.test.ts`                                | Ordem `['meta','google','email','tiktok']`; google com 2 campanhas, spend 1500, revenue 6000.                                                                                                   |
| buildDashboardSummary consolida     | `src/domain/dashboard/__tests__/DashboardSummary.test.ts`                                | 5 campanhas, 3 ativas, spend 5500, revenue 14000, 4 canais, top 3 `['a','b','e']`.                                                                                                              |
| buildDashboardSummary vazio         | `src/domain/dashboard/__tests__/DashboardSummary.test.ts`                                | `campaignCount` 0, ROAS total `null`, `byChannel` e `topByRoas` vazios.                                                                                                                         |
| GetDashboardSummary consolida       | `src/application/dashboard/__tests__/GetDashboardSummary.test.ts`                        | Período de 365 dias repassado; 3 campanhas, 2 ativas; spend 5000; revenue 12000; ROAS 2,4; canais `['meta','google']`; `spendShare` meta 0,6; ROAS google 3; top `['a','b']` (limite 2).        |
| GetDashboardSummary padrão          | `src/application/dashboard/__tests__/GetDashboardSummary.test.ts`                        | `findAll` chamado com `{}`; top com `DEFAULT_TOP_LIMIT` (5) itens de 8.                                                                                                                         |
| spendShare nulo                     | `src/application/dashboard/__tests__/GetDashboardSummary.test.ts`                        | Total zero → `spendShare` `null`; top vazio.                                                                                                                                                    |
| Presets de período                  | `src/application/campaigns/__tests__/campaignUseCases.test.ts`                           | `PERIOD_PRESETS` = `['all','30d','90d','ytd']`; 30d a partir de `2026-10-22T15:00Z` começa em `2026-09-23T15:00Z`; 90d em `2026-07-25T15:00Z`; ytd em `2026-01-01T00:00Z`; `all` → `undefined`. |
| useDashboardSummary preset all      | `src/presentation/hooks/__tests__/hooks.test.tsx`                                        | `execute` chamado com `{}`.                                                                                                                                                                     |
| useDashboardSummary preset relativo | `src/presentation/hooks/__tests__/hooks.test.tsx`                                        | `execute` chamado com `{ period: { start, end } }`.                                                                                                                                             |
| queryKeys dashboard                 | `src/presentation/hooks/__tests__/hooks.test.tsx`                                        | `queryKeys.dashboard({})` = `['dashboard', {}]`.                                                                                                                                                |
| Loading                             | `src/presentation/features/dashboard/__tests__/DashboardScreen.test.tsx`                 | `role="status"` com "Carregando indicadores…" e h1 "Dashboard".                                                                                                                                 |
| Dados                               | `src/presentation/features/dashboard/__tests__/DashboardScreen.test.tsx`                 | Região "Investimento por canal"; article "ROAS: 3,00x"; "1 de 2 campanhas ativas"; "CTR 4,50%"; item "Google Ads"; "Top Um".                                                                    |
| Links                               | `src/presentation/features/dashboard/__tests__/DashboardScreen.test.tsx`                 | "Abrir campanha Top Dois" → `/campaigns/cmp-2`; "Ver todas as campanhas" → `/campaigns`.                                                                                                        |
| Vazio                               | `src/presentation/features/dashboard/__tests__/DashboardScreen.test.tsx`                 | "Sem campanhas no período", descrição e nenhuma `region`.                                                                                                                                       |
| Erro e retry                        | `src/presentation/features/dashboard/__tests__/DashboardScreen.test.tsx`                 | Alert "Não foi possível carregar os dados."; após "Tentar novamente" exibe "Top Um".                                                                                                            |
| Troca de período                    | `src/presentation/features/dashboard/__tests__/DashboardScreen.test.tsx`                 | Clique em "Período: Últimos 90 dias" → store `90d`, radio `aria-checked="true"`, `execute` com `{ period: { start, end } }`.                                                                    |
| Botão Atualizar                     | `src/presentation/features/dashboard/__tests__/DashboardScreen.test.tsx`                 | Durante refetch "Atualizando…" desabilitado; `execute` 2 vezes; volta a "Atualizar" habilitado.                                                                                                 |
| DashboardContent                    | `src/presentation/features/dashboard/components/__tests__/DashboardContent.test.tsx`     | Mostra KPIs e as seções de canais e top campanhas.                                                                                                                                              |
| ChannelBreakdownList linhas         | `src/presentation/features/dashboard/components/__tests__/ChannelBreakdownList.test.tsx` | 2 linhas; Google com "ROAS 3,00x" e "1 campanha(s) · CTR 5,00% · CPA"; item Meta Ads.                                                                                                           |
| ChannelBreakdownList participação   | `src/presentation/features/dashboard/components/__tests__/ChannelBreakdownList.test.tsx` | Google `aria-valuetext` "66,67%"; Meta sem `aria-valuenow` e `aria-valuetext` "—".                                                                                                              |
| ChannelBreakdownList vazio          | `src/presentation/features/dashboard/components/__tests__/ChannelBreakdownList.test.tsx` | "Nenhum canal no período." e nenhuma lista.                                                                                                                                                     |
| TopCampaignsList ordem e links      | `src/presentation/features/dashboard/components/__tests__/TopCampaignsList.test.tsx`     | 2 itens; "Top Um" → `/campaigns/cmp-1` com posição 1 e "5,00x"; "Top Dois" → `/campaigns/cmp-2` com posição 2, "Meta Ads" e "investidos".                                                       |
| TopCampaignsList vazio              | `src/presentation/features/dashboard/components/__tests__/TopCampaignsList.test.tsx`     | "Nenhuma campanha no período." e nenhum link.                                                                                                                                                   |
| KpiCard                             | `src/presentation/components/ui/__tests__/KpiCard.test.tsx`                              | Exibe rótulo, valor e dica; omite dica ausente.                                                                                                                                                 |
| ProgressBar                         | `src/presentation/components/ui/__tests__/ProgressBar.test.tsx`                          | Valor na faixa; limita a 100% e marca excedido; negativos viram 0; valor `null` tratado.                                                                                                        |
| ChipGroup                           | `src/presentation/components/ui/__tests__/ChipGroup.test.tsx`                            | Radiogroup acessível; marca selecionado e notifica seleção; opções cobrem todos os valores.                                                                                                     |
| Formatadores                        | `src/presentation/format/__tests__/format.test.ts`                                       | Moeda BRL e nulo ("—"); inteiros e compactos; percentual e ROAS; datas UTC; `toUserMessage`.                                                                                                    |

## Nota

Visual atualizado pela fase 5 (platform/apsen-visual-identity). A seção 3 (UX) descreve o visual da época; o markup e as classes atuais estão em [apsen-visual-identity](../platform/apsen-visual-identity.md) e em `docs/design/DESIGN_SPEC.md`.
