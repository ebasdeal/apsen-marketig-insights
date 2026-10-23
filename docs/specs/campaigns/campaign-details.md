---
status: DONE
fase: 4
area: campaigns
feature: campaign-details
azure-devops-work-item:
---

# Detalhe da campanha

## 1. Overview

Tela `/campaigns/[id]` com o detalhe de uma campanha: cabeçalho (nome, status, canal · período · duração em dias), uso do orçamento (investido de orçamento, percentual, barra de progresso e alerta de estouro) e grade com 9 métricas/KPIs (ROAS, Receita, CPA, CPC, CTR, Taxa de conversão, Impressões, Cliques, Conversões). Os dados vêm do caso de uso `GetCampaignDetails`; campanha inexistente (inclusive `404` da API) gera `CampaignNotFoundError`, exibido como "Campanha não encontrada." sem opção de tentar novamente.

Esta spec é retroativa: documenta o comportamento implementado e coberto por testes.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | A rota `/campaigns/[id]` (dinâmica, `params` como `Promise`) renderiza `CampaignDetailsScreen` com o `id` da URL e título de página "Detalhe da campanha".      |
| CA-02 | O link "Voltar para campanhas" (`/campaigns`) aparece em todos os estados.                                                                                      |
| CA-03 | Enquanto não há dados, exibe `role="status"` com "Carregando campanha…".                                                                                        |
| CA-04 | Com dados, exibe h1 com o nome, descrição "{canal} · dd/mm/aaaa – dd/mm/aaaa · {n} dias" e o `StatusBadge`.                                                     |
| CA-05 | A seção "Orçamento" exibe "{investido} de {orçamento} ({uso}%)" e a barra "Uso do orçamento" com `aria-valuenow` igual ao uso (limitado a 0–100).               |
| CA-06 | Quando o investimento excede o orçamento, exibe o alerta "Orçamento excedido" e a barra fica marcada como excedida (`data-exceeded="true"`, cor vermelha).      |
| CA-07 | A seção "Métricas e KPIs" exibe 9 cards: ROAS, Receita, CPA, CPC, CTR, Taxa de conversão, Impressões, Cliques, Conversões.                                      |
| CA-08 | KPIs sem base de cálculo e uso de orçamento com orçamento zero aparecem como "—"; a barra fica sem `aria-valuenow`.                                             |
| CA-09 | Campanha inexistente exibe `role="alert"` "Campanha não encontrada." sem botão "Tentar novamente" e sem novas tentativas automáticas.                           |
| CA-10 | Outros erros exibem "Não foi possível carregar os dados. Verifique sua conexão e tente novamente." com "Tentar novamente"; o hook faz 1 retentativa automática. |
| CA-11 | No modo HTTP, busca `GET /campaigns/{id}` com id codificado; `404` vira "não encontrada"; demais erros HTTP, de rede ou de contrato são propagados.             |
| CA-12 | Id vazio não dispara consulta.                                                                                                                                  |

## 3. UX / Fluxo de tela

**Rota:** `src/app/campaigns/[id]/page.tsx` — Server Component assíncrono, `metadata = { title: 'Detalhe da campanha' }`, `const { id } = await params` → `<CampaignDetailsScreen id={id} />`. Renderização dinâmica.

**Estrutura (`CampaignDetailsScreen`, `'use client'`):**

1. `BackToCampaignsLink` — link "← Voltar para campanhas" (seta `aria-hidden`) para `CAMPAIGNS_ROUTE`.
2. `CampaignDetailsBody`:

| Estado                | Condição                                                   | Exibição                                                                                                                     |
| --------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Erro "não encontrada" | `query.isError` e `error instanceof CampaignNotFoundError` | `ErrorState` "Campanha não encontrada." sem `onRetry`                                                                        |
| Erro genérico         | `query.isError`                                            | `ErrorState` "Não foi possível carregar os dados. Verifique sua conexão e tente novamente." + "Tentar novamente" (`refetch`) |
| Loading               | `query.data === undefined`                                 | `LoadingState` "Carregando campanha…"                                                                                        |
| Dados                 | demais                                                     | `CampaignHeader`, `BudgetUsage`, `MetricsGrid`                                                                               |

Não há estado vazio: a ausência da campanha é tratada como erro "não encontrada". A página global `not-found.tsx` não é usada neste fluxo.

**`CampaignHeader`:** `PageHeader` com título = nome, descrição = `describeChannelPeriod(campaign) + " · {durationDays} dias"` e ação `StatusBadge`.

**`BudgetUsage`:** `Section` "Orçamento" com texto `"{formatCurrency(spend)} de {formatCurrency(budget)} ({formatPercent(usage)})"`, `ProgressBar` "Uso do orçamento" e, se `overBudget`, `<p role="alert">Orçamento excedido</p>`.

**`MetricsGrid`:** `Section` "Métricas e KPIs" com grade `grid-cols-2 lg:grid-cols-3` de `KpiCard` (`aria-label="{rótulo}: {valor}"`):

| Rótulo            | Valor                                           |
| ----------------- | ----------------------------------------------- |
| ROAS              | `formatRoas(kpis.roas)` ("4,00x")               |
| Receita           | `formatCurrency(revenue)`                       |
| CPA               | `formatCurrency(kpis.cpa)`                      |
| CPC               | `formatCurrency(kpis.cpc)`                      |
| CTR               | `formatPercent(kpis.ctr)` ("5,00%")             |
| Taxa de conversão | `formatPercent(kpis.conversionRate)`            |
| Impressões        | `formatInteger(metrics.impressions)` ("10.000") |
| Cliques           | `formatInteger(metrics.clicks)`                 |
| Conversões        | `formatInteger(metrics.conversions)`            |

## 4. Contratos de API consumidos

**Endpoint:** `GET {NEXT_PUBLIC_API_URL}/campaigns/{id}` — `id` com `encodeURIComponent`; sem query params; cabeçalho `Accept: application/json`.

```
GET https://api.exemplo.com/campaigns/cmp%201
```

Resposta (objeto de campanha, mesmo formato dos itens de `GET /campaigns`):

```json
{
  "id": "cmp-1",
  "name": "Search Marca",
  "channel": "google",
  "status": "ativa",
  "period": { "start": "2026-01-01T00:00:00.000Z", "end": "2026-01-31T00:00:00.000Z" },
  "budget": 5000,
  "metrics": {
    "impressions": 1000,
    "clicks": 100,
    "conversions": 10,
    "spend": 400,
    "revenue": 2000
  }
}
```

**Validação Zod:** `campaignDtoSchema` (`src/infrastructure/campaigns/campaignDto.ts`) via `parseWith(campaignDtoSchema, payload, 'GET /campaigns/{id}')`, seguido de `toCampaign` com as regras de domínio. Detalhes do schema em `campaign-list.md` (seção 4).

**Erros:**

| Situação                     | Tratamento                                                                                                                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `404`                        | `HttpError` com status 404 capturado no repositório → `findById` retorna `null` → `GetCampaignDetails` lança `CampaignNotFoundError(id)` ("Campanha {id} não encontrada") → UI "Campanha não encontrada." |
| Outro status não-2xx         | `HttpError` propagado → erro genérico com "Tentar novamente"                                                                                                                                              |
| Falha de rede                | `NetworkError` propagado                                                                                                                                                                                  |
| Payload fora do contrato     | `InvalidResponseError` "Contrato inválido em GET /campaigns/{id}: ..."                                                                                                                                    |
| Violação de regra de domínio | `InvalidResponseError` "Campanha {id} inconsistente: ..."                                                                                                                                                 |

No modo mock, `InMemoryCampaignRepository.findById` retorna `null` para id inexistente, com o mesmo resultado.

## 5. Domínio

- `src/domain/campaign/Campaign.ts` — `kpis()`, `budgetUsage(): Percentage | null` (investimento/orçamento; `null` com orçamento zero), `isOverBudget()` (razão > 1; falso com orçamento zero).
- `src/domain/campaign/Metrics.ts` — `ctr()` = cliques/impressões, `cpc()` = investimento/cliques, `cpa()` = investimento/conversões, `roas()` = receita/investimento, `conversionRate()` = conversões/cliques; `kpis()` agrega os cinco. Todos `null` com denominador zero.
- `src/domain/shared/Money.ts` — `divideBy(n)` (`null` para divisor ≤ 0 ou não finito), `ratioTo(other)` (`null` se `other` zero), arredondamento em centavos.
- `src/domain/shared/Percentage.ts` — `fromRatio`, `fromFraction` (`null` se denominador zero), `value` = razão × 100.
- `src/domain/shared/DateRange.ts` — `days` inclusivo.
- `src/domain/shared/DomainError.ts` — `CampaignNotFoundError(campaignId)`.
- `src/domain/campaign/CampaignRepository.ts` — porta `findById(id): Promise<Campaign | null>`.

## 6. Aplicação

- `src/application/campaigns/GetCampaignDetails.ts` — `execute(id)`: `findById`; `null` → `throw new CampaignNotFoundError(id)`; senão `toCampaignDetails`.
- `src/application/campaigns/dto.ts` — saída `CampaignDetailsOutput extends CampaignListItemOutput` com `durationDays`, `metrics: MetricsOutput { impressions; clicks; conversions; spend; revenue }`, `kpis: KpisOutput { ctr; cpc; cpa; roas; conversionRate }` (todos `number | null`), `budgetUsage: number | null`, `overBudget: boolean`.
- `src/application/campaigns/mappers.ts` — `toCampaignDetails`, `toMetricsOutput`, `toKpisOutput` (CTR e taxa de conversão em pontos percentuais; CPC e CPA em reais; ROAS como razão) e `budgetUsage` em pontos percentuais.

## 7. Infraestrutura

- `src/infrastructure/campaigns/HttpCampaignRepository.ts` — `findById(id)`: `GET /campaigns/{encodeURIComponent(id)}`, valida com `campaignDtoSchema`, mapeia com `toCampaign`; `HttpError` 404 → `null`; demais erros repropagados.
- `src/infrastructure/campaigns/InMemoryCampaignRepository.ts` — `findById` por igualdade de id (com latência opcional).
- `src/infrastructure/campaigns/campaignDto.ts`, `campaignMapper.ts`, `src/infrastructure/http/FetchHttpClient.ts`, `src/infrastructure/http/HttpClient.ts` — compartilhados com a lista.

## 8. Apresentação

- **Hook:** `src/presentation/hooks/useCampaignDetails.ts` — `useCampaignDetails(id)`; `queryKey = queryKeys.campaignDetails(id)` = `['campaigns', 'details', id]`; `queryFn = getCampaignDetails.execute(id)`; `enabled: id.length > 0`; `retry: (failureCount, error) => !(error instanceof CampaignNotFoundError) && failureCount < 1`.
- **Stores:** Nenhuma.
- **Componentes:** `CampaignDetailsScreen` (`CampaignDetailsBody`, `CampaignDetailsContent` internos), `BackToCampaignsLink`, `CampaignHeader`, `BudgetUsage`, `MetricsGrid`; UI kit `PageHeader`, `StatusBadge`, `Section`, `KpiCard`, `ProgressBar`, `LoadingState`, `ErrorState`.
- **Formatação:** `formatCurrency`, `formatPercent`, `formatRoas`, `formatInteger`, `describeChannelPeriod`, `toUserMessage` (`CampaignNotFoundError` → "Campanha não encontrada.").
- **Rotas:** `CAMPAIGNS_ROUTE`; a navegação até aqui usa `campaignDetailsRoute(id)` a partir da lista e do dashboard.

## 9. Arquivos

Produção:

- `src/app/campaigns/[id]/page.tsx`
- `src/domain/campaign/Campaign.ts`
- `src/domain/campaign/Metrics.ts`
- `src/domain/campaign/CampaignRepository.ts`
- `src/domain/shared/Money.ts`
- `src/domain/shared/Percentage.ts`
- `src/domain/shared/DateRange.ts`
- `src/domain/shared/DomainError.ts`
- `src/application/campaigns/GetCampaignDetails.ts`
- `src/application/campaigns/dto.ts`
- `src/application/campaigns/mappers.ts`
- `src/infrastructure/campaigns/HttpCampaignRepository.ts`
- `src/infrastructure/campaigns/InMemoryCampaignRepository.ts`
- `src/infrastructure/campaigns/campaignDto.ts`
- `src/infrastructure/campaigns/campaignMapper.ts`
- `src/presentation/hooks/useCampaignDetails.ts`
- `src/presentation/hooks/queryKeys.ts`
- `src/presentation/features/campaigns/details/CampaignDetailsScreen.tsx`
- `src/presentation/features/campaigns/details/components/BackToCampaignsLink.tsx`
- `src/presentation/features/campaigns/details/components/CampaignHeader.tsx`
- `src/presentation/features/campaigns/details/components/BudgetUsage.tsx`
- `src/presentation/features/campaigns/details/components/MetricsGrid.tsx`
- `src/presentation/components/ui/KpiCard.tsx`
- `src/presentation/components/ui/ProgressBar.tsx`
- `src/presentation/format/errorMessage.ts`
- `src/presentation/format/formatters.ts`

Testes:

- `src/app/campaigns/[id]/__tests__/page.test.tsx`
- `src/domain/campaign/__tests__/campaign.test.ts`
- `src/domain/shared/__tests__/valueObjects.test.ts`
- `src/application/campaigns/__tests__/campaignUseCases.test.ts`
- `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`
- `src/infrastructure/campaigns/__tests__/InMemoryCampaignRepository.test.ts`
- `src/presentation/hooks/__tests__/hooks.test.tsx`
- `src/presentation/features/campaigns/details/__tests__/CampaignDetailsScreen.test.tsx`
- `src/presentation/features/campaigns/details/components/__tests__/components.test.tsx`
- `src/presentation/components/ui/__tests__/KpiCard.test.tsx`
- `src/presentation/components/ui/__tests__/ProgressBar.test.tsx`
- `src/presentation/format/__tests__/format.test.ts`

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RN-01 | CTR = cliques / impressões × 100.                                                                                                                                                                                              |
| RN-02 | CPC = investimento / cliques (R$, arredondado em centavos).                                                                                                                                                                    |
| RN-03 | CPA = investimento / conversões (R$, arredondado em centavos).                                                                                                                                                                 |
| RN-04 | ROAS = receita / investimento (razão, exibida com 2 casas e sufixo "x").                                                                                                                                                       |
| RN-05 | Taxa de conversão = conversões / cliques × 100.                                                                                                                                                                                |
| RN-06 | Uso do orçamento = investimento / orçamento × 100.                                                                                                                                                                             |
| RN-07 | Divisão por zero (impressões, cliques, conversões, investimento ou orçamento iguais a zero) retorna `null` no domínio e aparece como "—" na UI; sem conversões o CPA é `null`, mas a taxa de conversão é 0% se houver cliques. |
| RN-08 | Orçamento excedido quando investimento/orçamento > 1 (igual ao orçamento não excede); orçamento zero nunca é excedido.                                                                                                         |
| RN-09 | A barra de progresso limita a largura entre 0 e 100 e marca excedido quando o valor > 100.                                                                                                                                     |
| RN-10 | Duração em dias é inclusiva: `floor((fim - início) / 1 dia) + 1`.                                                                                                                                                              |
| RN-11 | Campanha inexistente (null no repositório ou 404 na API) → `CampaignNotFoundError`, sem retentativa automática nem botão "Tentar novamente".                                                                                   |
| RN-12 | Demais erros têm 1 retentativa automática e botão "Tentar novamente".                                                                                                                                                          |
| RN-13 | Id vazio desabilita a consulta (permanece em loading).                                                                                                                                                                         |
| RN-14 | O id é codificado com `encodeURIComponent` na URL da API e na rota da tela.                                                                                                                                                    |

## 11. BDD — Cenários de teste unitário

| Cenário                               | Arquivo de teste                                                                       | Asserção                                                                                                                                                                                                                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rota define título                    | `src/app/campaigns/[id]/__tests__/page.test.tsx`                                       | `metadata` com título "Detalhe da campanha".                                                                                                                                                                                                                                                                       |
| Rota repassa o id                     | `src/app/campaigns/[id]/__tests__/page.test.tsx`                                       | Renderiza o detalhe da campanha com o id vindo de `params`.                                                                                                                                                                                                                                                        |
| KPIs calculados                       | `src/domain/campaign/__tests__/campaign.test.ts`                                       | 20000 impr., 400 cliques, 20 conv., R$ 1000, R$ 3500 → CTR 2, CPC 2,5, CPA 50, ROAS 3,5, taxa 5.                                                                                                                                                                                                                   |
| KPIs com divisão por zero             | `src/domain/campaign/__tests__/campaign.test.ts`                                       | `Metrics.empty().kpis()` com todos `null`.                                                                                                                                                                                                                                                                         |
| CPA sem conversões                    | `src/domain/campaign/__tests__/campaign.test.ts`                                       | CPA `null`, taxa 0, CTR 10.                                                                                                                                                                                                                                                                                        |
| Soma de métricas                      | `src/domain/campaign/__tests__/campaign.test.ts`                                       | Somas de impressões, cliques, conversões, investimento e receita.                                                                                                                                                                                                                                                  |
| Uso e estouro de orçamento            | `src/domain/campaign/__tests__/campaign.test.ts`                                       | 1000/2000 → 50% sem estouro; 1000/1000 sem estouro; 1000/500 com estouro.                                                                                                                                                                                                                                          |
| Orçamento zero                        | `src/domain/campaign/__tests__/campaign.test.ts`                                       | `budgetUsage()` `null`; `isOverBudget()` falso.                                                                                                                                                                                                                                                                    |
| Value objects                         | `src/domain/shared/__tests__/valueObjects.test.ts`                                     | `Money.divideBy`/`ratioTo` null em zero; `Percentage.fromFraction` null com denominador zero; `DateRange.days` inclusivo; `CampaignNotFoundError` preserva nome e id.                                                                                                                                              |
| GetCampaignDetails com dados          | `src/application/campaigns/__tests__/campaignUseCases.test.ts`                         | `durationDays` 31; métricas; KPIs `{ ctr: 5, cpc: 2, cpa: 20, roas: 4, conversionRate: 10 }`; `budgetUsage` 125; `overBudget` true.                                                                                                                                                                                |
| GetCampaignDetails sem base           | `src/application/campaigns/__tests__/campaignUseCases.test.ts`                         | KPIs todos `null`; `budgetUsage` `null`.                                                                                                                                                                                                                                                                           |
| GetCampaignDetails inexistente        | `src/application/campaigns/__tests__/campaignUseCases.test.ts`                         | Rejeita com `CampaignNotFoundError`.                                                                                                                                                                                                                                                                               |
| HTTP busca por id com encoding        | `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`                | `findById('cmp 1')` chama `https://api.exemplo.com/campaigns/cmp%201`.                                                                                                                                                                                                                                             |
| HTTP 404                              | `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`                | `findById('x')` resolve `null`.                                                                                                                                                                                                                                                                                    |
| HTTP outros erros                     | `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`                | 500 rejeita com `status: 500`; payload `{ id: 'x' }` rejeita com `InvalidResponseError`.                                                                                                                                                                                                                           |
| InMemory por id                       | `src/infrastructure/campaigns/__tests__/InMemoryCampaignRepository.test.ts`            | Encontra `a`; `zzz` → `null`.                                                                                                                                                                                                                                                                                      |
| useCampaignDetails carrega            | `src/presentation/hooks/__tests__/hooks.test.tsx`                                      | Dados retornados; `execute('cmp-1')`.                                                                                                                                                                                                                                                                              |
| useCampaignDetails sem id             | `src/presentation/hooks/__tests__/hooks.test.tsx`                                      | `fetchStatus` `idle`; `execute` não chamado.                                                                                                                                                                                                                                                                       |
| useCampaignDetails não encontrada     | `src/presentation/hooks/__tests__/hooks.test.tsx`                                      | `execute` chamado 1 vez.                                                                                                                                                                                                                                                                                           |
| useCampaignDetails erro transitório   | `src/presentation/hooks/__tests__/hooks.test.tsx`                                      | `execute` chamado 2 vezes.                                                                                                                                                                                                                                                                                         |
| queryKeys detalhe                     | `src/presentation/hooks/__tests__/hooks.test.tsx`                                      | `['campaigns', 'details', 'x']`.                                                                                                                                                                                                                                                                                   |
| Loading e voltar                      | `src/presentation/features/campaigns/details/__tests__/CampaignDetailsScreen.test.tsx` | "Carregando campanha…"; link "Voltar para campanhas" → `/campaigns`.                                                                                                                                                                                                                                               |
| Dados completos                       | `src/presentation/features/campaigns/details/__tests__/CampaignDetailsScreen.test.tsx` | h1 "Campanha Teste"; `execute('cmp-1')`; "Google Ads · 01/01/2026 – 31/01/2026 · 31 dias"; "Ativa"; região "Orçamento" com "(50,00%)" e `aria-valuenow` 50; região "Métricas e KPIs"; "CTR: 5,00%", "Taxa de conversão: 10,00%", "Impressões: 10.000", "Cliques: 500", "Conversões: 50"; sem "Orçamento excedido". |
| Orçamento excedido e KPIs indefinidos | `src/presentation/features/campaigns/details/__tests__/CampaignDetailsScreen.test.tsx` | "Orçamento excedido"; barra `data-exceeded="true"`; "ROAS: —".                                                                                                                                                                                                                                                     |
| Não encontrada                        | `src/presentation/features/campaigns/details/__tests__/CampaignDetailsScreen.test.tsx` | Alert "Campanha não encontrada."; sem "Tentar novamente"; link de voltar presente; `execute` 1 vez.                                                                                                                                                                                                                |
| Erro com retry                        | `src/presentation/features/campaigns/details/__tests__/CampaignDetailsScreen.test.tsx` | Alert "Não foi possível carregar os dados."; após "Tentar novamente" exibe heading "Recuperada".                                                                                                                                                                                                                   |
| BackToCampaignsLink                   | `src/presentation/features/campaigns/details/components/__tests__/components.test.tsx` | Link → `/campaigns`.                                                                                                                                                                                                                                                                                               |
| CampaignHeader                        | `src/presentation/features/campaigns/details/components/__tests__/components.test.tsx` | h1 "Campanha Teste"; "Meta Ads · 01/01/2026 – 31/01/2026 · 31 dias"; "Pausada" com `data-status="pausada"`.                                                                                                                                                                                                        |
| BudgetUsage dentro do limite          | `src/presentation/features/campaigns/details/components/__tests__/components.test.tsx` | "R$ 500,00 de R$ 1.000,00 (50,00%)"; `aria-valuenow` 50; sem alert.                                                                                                                                                                                                                                                |
| BudgetUsage excedido                  | `src/presentation/features/campaigns/details/components/__tests__/components.test.tsx` | Alert "Orçamento excedido".                                                                                                                                                                                                                                                                                        |
| BudgetUsage indefinido                | `src/presentation/features/campaigns/details/components/__tests__/components.test.tsx` | Barra sem `aria-valuenow`.                                                                                                                                                                                                                                                                                         |
| MetricsGrid                           | `src/presentation/features/campaigns/details/components/__tests__/components.test.tsx` | 9 `article`; "CPC: R$ 2,00"; "Receita: R$ 4.000,00".                                                                                                                                                                                                                                                               |
| ProgressBar                           | `src/presentation/components/ui/__tests__/ProgressBar.test.tsx`                        | Valor na faixa; limita a 100% e destaca excedido; negativo vira 0; `null` tratado.                                                                                                                                                                                                                                 |
| KpiCard                               | `src/presentation/components/ui/__tests__/KpiCard.test.tsx`                            | Rótulo, valor e dica; dica omitida quando ausente.                                                                                                                                                                                                                                                                 |
| toUserMessage                         | `src/presentation/format/__tests__/format.test.ts`                                     | Traduz `CampaignNotFoundError` e erros genéricos.                                                                                                                                                                                                                                                                  |

## Nota

Visual atualizado pela fase 5 (platform/apsen-visual-identity). A seção 3 (UX) descreve o visual da época; o markup e as classes atuais estão em [apsen-visual-identity](../platform/apsen-visual-identity.md) e em `docs/design/DESIGN_SPEC.md`.
