---
status: DONE
fase: 3
area: campaigns
feature: campaign-list
azure-devops-work-item:
---

# Lista de campanhas com filtros

## 1. Overview

Tela `/campaigns` que lista as campanhas em cards (nome, canal · período, status, investimento, receita e ROAS) com filtros por canal, status e período (presets). Os filtros vivem em uma store Zustand em memória (compartilhada com o dashboard no caso do período) e a lista é obtida pelo caso de uso `ListCampaigns`, que converte a entrada em `CampaignFilter` de domínio, consulta o repositório e ordena pelo início mais recente. No modo HTTP o repositório chama `GET /campaigns` e valida a resposta com Zod; no modo mock filtra em memória.

Esta spec é retroativa: documenta o comportamento implementado e coberto por testes.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | A rota `/campaigns` renderiza `CampaignListScreen` com título de página "Campanhas" (metadata), h1 "Campanhas" e descrição "Acompanhe o desempenho das suas campanhas.".                                                                                                              |
| CA-02 | A seção "Filtros" exibe os radiogroups "Canal" (Todos, Google Ads, Meta Ads, LinkedIn Ads, E-mail, TikTok Ads), "Status" (Todos, Ativa, Pausada, Encerrada) e "Período" (Todo o período, Últimos 30 dias, Últimos 90 dias, Ano atual); inicialmente "Todos"/"Todos"/"Todo o período". |
| CA-03 | Selecionar uma opção atualiza a store e refaz a consulta com `{ channel?, status?, period? }`; valores "Todos"/"Todo o período" são omitidos da entrada.                                                                                                                              |
| CA-04 | O botão "Limpar filtros" aparece somente quando há filtro diferente do inicial e restaura `channel: null`, `status: null`, `period: 'all'`.                                                                                                                                           |
| CA-05 | Enquanto carrega, exibe `role="status"` com "Carregando campanhas…".                                                                                                                                                                                                                  |
| CA-06 | Em erro, exibe `role="alert"` com "Não foi possível carregar os dados. Verifique sua conexão e tente novamente." e "Tentar novamente", que refaz a consulta.                                                                                                                          |
| CA-07 | Lista vazia exibe "Nenhuma campanha encontrada" / "Ajuste os filtros para ampliar a busca."; com filtros ativos o vazio também oferece a ação "Limpar filtros".                                                                                                                       |
| CA-08 | Com dados, exibe o contador "{n} campanha(s)" (`aria-live="polite"`) e a lista "Campanhas" em grade responsiva de 1, 2 e 3 colunas.                                                                                                                                                   |
| CA-09 | Cada card é um link "Abrir campanha {nome}" para `/campaigns/{id}` (id codificado) e mostra nome (h3), "{canal} · dd/mm/aaaa – dd/mm/aaaa", status, Investimento, Receita e ROAS.                                                                                                     |
| CA-10 | ROAS indefinido aparece como "—".                                                                                                                                                                                                                                                     |
| CA-11 | As campanhas são ordenadas pela data de início mais recente primeiro.                                                                                                                                                                                                                 |
| CA-12 | No modo HTTP, os filtros são enviados como query `channel`, `status`, `from`, `to` (ISO-8601); filtro vazio não gera query string.                                                                                                                                                    |
| CA-13 | Payload fora do contrato ou que viola regras de domínio gera `InvalidResponseError`; erros HTTP e de rede são propagados e levam ao estado de erro.                                                                                                                                   |

## 3. UX / Fluxo de tela

**Rota:** `src/app/campaigns/page.tsx` (Server Component, `metadata = { title: 'Campanhas' }`) → `<CampaignListScreen />` (`'use client'`). Renderização estática; dados no cliente.

**Estrutura:**

1. `PageHeader` "Campanhas" / "Acompanhe o desempenho das suas campanhas.".
2. `CampaignFilters` — `<section aria-label="Filtros">` com três `ChipGroup` (radios com nome acessível "{grupo}: {opção}", ex.: "Canal: Meta Ads") e o botão "Limpar filtros" condicional.
3. `CampaignListContent` com os estados:

| Estado  | Condição            | Exibição                                                                                                                                                   |
| ------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading | `query.isPending`   | `LoadingState` "Carregando campanhas…"                                                                                                                     |
| Erro    | `query.isError`     | `ErrorState` com `toUserMessage(error)` e "Tentar novamente"                                                                                               |
| Vazio   | `data.length === 0` | `EmptyState` "Nenhuma campanha encontrada" / "Ajuste os filtros para ampliar a busca."; ação "Limpar filtros" (chama `reset`) apenas se `hasActiveFilters` |
| Dados   | demais              | `ResultCount` "{n} campanha(s)" + `<ul aria-label="Campanhas" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">` com um `CampaignCard` por `<li>`    |

**Card (`CampaignCard`):** `Link` com `aria-label="Abrir campanha {nome}"`, `href = campaignDetailsRoute(id)`, classe `surface` + `focus-ring`; dentro, `<article>` com h3 do nome, `describeChannelPeriod`, `StatusBadge` (`data-status`) e `<dl>` com "Investimento" (`formatCurrency(spend)`), "Receita" (`formatCurrency(revenue)`) e "ROAS" (`formatRoas(roas)`).

## 4. Contratos de API consumidos

**Endpoint:** `GET {NEXT_PUBLIC_API_URL}/campaigns`

| Query param | Origem                              | Formato                                         |
| ----------- | ----------------------------------- | ----------------------------------------------- |
| `channel`   | `filter.channel`                    | `google \| meta \| linkedin \| email \| tiktok` |
| `status`    | `filter.status`                     | `ativa \| pausada \| encerrada`                 |
| `from`      | `filter.period.start.toISOString()` | ISO-8601                                        |
| `to`        | `filter.period.end.toISOString()`   | ISO-8601                                        |

Todos opcionais; parâmetros `undefined` ou vazios são omitidos e os valores são codificados com `encodeURIComponent`. Cabeçalho `Accept: application/json`. Exemplo:

```
GET https://api.exemplo.com/campaigns?channel=google&status=ativa&from=2026-01-01T00%3A00%3A00.000Z&to=2026-02-01T00%3A00%3A00.000Z
```

Resposta esperada:

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

**Validação Zod (`src/infrastructure/campaigns/campaignDto.ts`):**

- `campaignListResponseSchema = z.object({ data: z.array(campaignDtoSchema) })`.
- `campaignDtoSchema`: `id`/`name` `string().min(1)`; `channel` `z.enum(CHANNELS)`; `status` `z.enum(CAMPAIGN_STATUSES)`; `period.start`/`period.end` string com `Date.parse` válido ("Data ISO inválida"); `budget`, `metrics.spend`, `metrics.revenue` `number().nonnegative()`; `impressions`, `clicks`, `conversions` `number().int().nonnegative()`.
- Após o Zod, o mapper cria as entidades e aplica as regras de domínio: `clicks ≤ impressions`, `conversions ≤ clicks`, `end ≥ start`, id/nome não vazios após trim.

**Erros:**

| Situação                      | Erro                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Payload não bate com o schema | `InvalidResponseError` "Contrato inválido em GET /campaigns: {caminho}: {mensagem}" (caminho `(raiz)` quando na raiz) |
| Viola regra de domínio        | `InvalidResponseError` "Campanha {id} inconsistente: {mensagem}"                                                      |
| Status não-2xx                | `HttpError(status, url, body)`                                                                                        |
| Falha do `fetch`              | `NetworkError(url, cause)`                                                                                            |
| 2xx com corpo não JSON        | `InvalidResponseError` "Resposta de {url} não é JSON válido"                                                          |

Na UI todos resultam em "Não foi possível carregar os dados. Verifique sua conexão e tente novamente.".

## 5. Domínio

- `src/domain/campaign/Campaign.ts` — entidade `Campaign` (`create` com trim e validação de id/nome; getters; `kpis()`).
- `src/domain/campaign/Metrics.ts` — value object com contagens inteiras não negativas, `clicks ≤ impressions`, `conversions ≤ clicks`; `roas()` = receita/investimento (`null` se investimento zero).
- `src/domain/campaign/CampaignFilter.ts` — `CampaignFilter { channel?; status?; period?: DateRange }` e `matchesFilter(campaign, filter)` (canal igual, status igual, período sobreposto).
- `src/domain/campaign/Channel.ts` — `CHANNELS`, `Channel`, `isChannel`.
- `src/domain/campaign/CampaignStatus.ts` — `CAMPAIGN_STATUSES`, `CampaignStatus`, `isCampaignStatus`.
- `src/domain/shared/DateRange.ts` — `create`/`fromIso` (rejeita data inválida ou fim antes do início), `days` (inclusivo), `contains`, `overlaps`.
- `src/domain/shared/Money.ts`, `src/domain/shared/Percentage.ts`, `src/domain/shared/DomainError.ts` (`DomainError`, `InvalidValueError`).
- `src/domain/campaign/CampaignRepository.ts` — porta `findAll(filter): Promise<Campaign[]>`.

## 6. Aplicação

- `src/application/campaigns/ListCampaigns.ts`
  - `toCampaignFilter(input: ListCampaignsInput): CampaignFilter` — copia `channel`/`status` definidos e converte `period` com `DateRange.fromIso` (propaga `InvalidValueError`).
  - `ListCampaigns.execute(input = {})` → `CampaignListItemOutput[]`, ordenado por `period.start` desc.
- `src/application/campaigns/dto.ts`
  - Entrada `ListCampaignsInput { channel?: Channel; status?: CampaignStatus; period?: { start: string; end: string } }`.
  - Saída `CampaignListItemOutput { id; name; channel; status; periodStart; periodEnd (ISO); budget; spend; revenue; roas: number | null }`.
- `src/application/campaigns/mappers.ts` — `toCampaignListItem`.
- `src/application/campaigns/periodPresets.ts` — `PERIOD_PRESETS`, `PeriodPreset`, `resolvePeriodPreset`.

## 7. Infraestrutura

- `src/infrastructure/campaigns/HttpCampaignRepository.ts` — `findAll` monta a query, valida com `parseWith(campaignListResponseSchema, payload, 'GET /campaigns')` e mapeia com `toCampaign`.
- `src/infrastructure/campaigns/campaignDto.ts` — schemas Zod e tipos `CampaignDto`, `CampaignListResponse`.
- `src/infrastructure/campaigns/campaignMapper.ts` — `toCampaign(dto)` (converte `DomainError` em `InvalidResponseError`, repropaga outros erros) e `parseWith(schema, payload, context)`.
- `src/infrastructure/http/HttpClient.ts` — porta `HttpClient.get(path, { query?, signal? })`, `HttpError`, `NetworkError`, `InvalidResponseError`.
- `src/infrastructure/http/FetchHttpClient.ts` — remove barras finais da base e iniciais do path, monta query ignorando vazios, `Accept: application/json`, corpo vazio → `null`.
- `src/infrastructure/campaigns/InMemoryCampaignRepository.ts` — filtra com `matchesFilter` após latência opcional (`latencyMs`, padrão 0; `sleep` injetável).
- `src/infrastructure/campaigns/mockCampaigns.ts` — 14 campanhas seed (5 canais, ids únicos) com períodos relativos à data de referência (início do dia UTC).

## 8. Apresentação

- **Hook:** `src/presentation/hooks/useCampaigns.ts` — `toListCampaignsInput(filters, now)` (omite `null` e resolve o preset) e `useCampaigns(filters)` com entrada memoizada por `channel/status/period`; `queryKey = queryKeys.campaignList(input)` = `['campaigns', 'list', input]`; `queryFn = listCampaigns.execute(input)`.
- **Store:** `src/presentation/stores/campaignFiltersStore.ts` — `CampaignFiltersValues { channel: Channel | null; status: CampaignStatus | null; period: PeriodPreset }`, `INITIAL_CAMPAIGN_FILTERS = { channel: null, status: null, period: 'all' }`, ações `setChannel`, `setStatus`, `setPeriod`, `reset`; `hasActiveFilters(values)`. Sem persistência.
- **Opções:** `src/presentation/components/filterOptions.ts` — `CHANNEL_OPTIONS` e `STATUS_OPTIONS` (com "Todos" = `null`) e `PERIOD_OPTIONS`.
- **Componentes:** `CampaignListScreen` (`CampaignGrid`, `ResultCount`, `CampaignListContent` internos), `CampaignFilters`, `CampaignCard`; UI kit `PageHeader`, `ChipGroup`, `StatusBadge`, `LoadingState`, `ErrorState`, `EmptyState`.
- **Formatação/rotas:** `formatCurrency`, `formatRoas`, `describeChannelPeriod`, `CHANNEL_LABELS`, `STATUS_LABELS`, `PERIOD_LABELS`, `toUserMessage`, `CAMPAIGNS_ROUTE`, `campaignDetailsRoute`.

## 9. Arquivos

Produção:

- `src/app/campaigns/page.tsx`
- `src/domain/campaign/Campaign.ts`
- `src/domain/campaign/Metrics.ts`
- `src/domain/campaign/CampaignFilter.ts`
- `src/domain/campaign/CampaignRepository.ts`
- `src/domain/campaign/Channel.ts`
- `src/domain/campaign/CampaignStatus.ts`
- `src/domain/shared/DateRange.ts`
- `src/domain/shared/Money.ts`
- `src/domain/shared/Percentage.ts`
- `src/domain/shared/DomainError.ts`
- `src/application/campaigns/ListCampaigns.ts`
- `src/application/campaigns/dto.ts`
- `src/application/campaigns/mappers.ts`
- `src/application/campaigns/periodPresets.ts`
- `src/infrastructure/campaigns/HttpCampaignRepository.ts`
- `src/infrastructure/campaigns/InMemoryCampaignRepository.ts`
- `src/infrastructure/campaigns/campaignDto.ts`
- `src/infrastructure/campaigns/campaignMapper.ts`
- `src/infrastructure/campaigns/mockCampaigns.ts`
- `src/infrastructure/http/HttpClient.ts`
- `src/infrastructure/http/FetchHttpClient.ts`
- `src/presentation/hooks/useCampaigns.ts`
- `src/presentation/hooks/queryKeys.ts`
- `src/presentation/stores/campaignFiltersStore.ts`
- `src/presentation/components/filterOptions.ts`
- `src/presentation/features/campaigns/CampaignListScreen.tsx`
- `src/presentation/features/campaigns/components/CampaignFilters.tsx`
- `src/presentation/features/campaigns/components/CampaignCard.tsx`
- `src/presentation/components/ui/ChipGroup.tsx`
- `src/presentation/components/ui/StatusBadge.tsx`
- `src/presentation/format/campaignText.ts`
- `src/presentation/format/formatters.ts`
- `src/presentation/format/labels.ts`
- `src/presentation/navigation/routes.ts`

Testes:

- `src/app/campaigns/__tests__/page.test.tsx`
- `src/domain/campaign/__tests__/campaign.test.ts`
- `src/domain/shared/__tests__/valueObjects.test.ts`
- `src/application/campaigns/__tests__/campaignUseCases.test.ts`
- `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`
- `src/infrastructure/campaigns/__tests__/InMemoryCampaignRepository.test.ts`
- `src/infrastructure/http/__tests__/FetchHttpClient.test.ts`
- `src/presentation/hooks/__tests__/hooks.test.tsx`
- `src/presentation/stores/__tests__/stores.test.ts`
- `src/presentation/features/campaigns/__tests__/CampaignListScreen.test.tsx`
- `src/presentation/features/campaigns/components/__tests__/CampaignFilters.test.tsx`
- `src/presentation/features/campaigns/components/__tests__/CampaignCard.test.tsx`
- `src/presentation/components/ui/__tests__/ChipGroup.test.tsx`
- `src/presentation/components/ui/__tests__/StatusBadge.test.tsx`
- `src/presentation/format/__tests__/campaignText.test.ts`
- `src/presentation/navigation/__tests__/routes.test.ts`

## 10. Regras de negócio

| RN    | Descrição                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| RN-01 | Filtro de canal/status por igualdade; ausência (`undefined`/"Todos") não filtra.                                               |
| RN-02 | Filtro de período inclui campanhas cujo período se sobrepõe ao intervalo (`start ≤ fim do filtro` e `início do filtro ≤ end`). |
| RN-03 | Período com fim anterior ao início ou data inválida lança `InvalidValueError`.                                                 |
| RN-04 | Ordenação da lista por data de início decrescente (mais recente primeiro).                                                     |
| RN-05 | ROAS = receita / investimento; investimento zero → `null` → "—".                                                               |
| RN-06 | `hasActiveFilters` é verdadeiro se qualquer valor difere de `INITIAL_CAMPAIGN_FILTERS`.                                        |
| RN-07 | `reset` restaura `{ channel: null, status: null, period: 'all' }`.                                                             |
| RN-08 | `toListCampaignsInput` omite `channel`/`status` nulos e `period` quando o preset é `all`.                                      |
| RN-09 | Contrato: `channel` ∈ `google                                                                                                  | meta | linkedin | email | tiktok`; `status`∈`ativa | pausada | encerrada`; contagens inteiras não negativas; valores monetários não negativos; datas ISO válidas. |
| RN-10 | Domínio: `clicks ≤ impressions`, `conversions ≤ clicks`, `end ≥ start`, id e nome não vazios após trim.                        |
| RN-11 | Valores monetários são arredondados para centavos (`Money.of`); negativos, `NaN` e infinitos são rejeitados.                   |
| RN-12 | Query string omite parâmetros `undefined` ou vazios; sem parâmetros não há `?`.                                                |
| RN-13 | Rota de detalhe codifica o id com `encodeURIComponent`.                                                                        |
| RN-14 | Mock em memória aplica latência só quando `latencyMs > 0`.                                                                     |

## 11. BDD — Cenários de teste unitário

| Cenário                        | Arquivo de teste                                                                    | Asserção                                                                                                                                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rota renderiza a tela          | `src/app/campaigns/__tests__/page.test.tsx`                                         | Renderiza a tela de campanhas.                                                                                                                                                                                     |
| Rota define título             | `src/app/campaigns/__tests__/page.test.tsx`                                         | `metadata` com título "Campanhas".                                                                                                                                                                                 |
| Métricas inconsistentes        | `src/domain/campaign/__tests__/campaign.test.ts`                                    | Impressões -1/1,5, cliques -1, conversões 2,2, cliques > impressões, conversões > cliques lançam com mensagem.                                                                                                     |
| Campaign normaliza             | `src/domain/campaign/__tests__/campaign.test.ts`                                    | `'  cmp-7 '` → `cmp-7`, `' Verão '` → `Verão`; período 31 dias; ROAS 4.                                                                                                                                            |
| Campaign exige id e nome       | `src/domain/campaign/__tests__/campaign.test.ts`                                    | Id em branco → `InvalidValueError`; nome vazio → "Campanha precisa de um nome".                                                                                                                                    |
| Type guards                    | `src/domain/campaign/__tests__/campaign.test.ts`                                    | `isChannel('tiktok')` true, `'orkut'`/`1` false; `isCampaignStatus('pausada')` true, `'rascunho'`/`null` false.                                                                                                    |
| matchesFilter                  | `src/domain/campaign/__tests__/campaign.test.ts`                                    | Filtro vazio aceita; canal/status iguais aceitam e diferentes recusam; período sobreposto aceita e disjunto recusa.                                                                                                |
| DateRange                      | `src/domain/shared/__tests__/valueObjects.test.ts`                                  | Dias inclusivos, cópia imutável, rejeita datas inválidas/invertidas, `contains`, `overlaps`.                                                                                                                       |
| Money                          | `src/domain/shared/__tests__/valueObjects.test.ts`                                  | Arredonda centavos; rejeita -1/NaN/∞; `divideBy`/`ratioTo` com null em divisor zero; igualdade.                                                                                                                    |
| toCampaignFilter               | `src/application/campaigns/__tests__/campaignUseCases.test.ts`                      | `{}` → `{}`; mapeia canal, status e período de 31 dias; período invertido lança `InvalidValueError`.                                                                                                               |
| ListCampaigns ordena           | `src/application/campaigns/__tests__/campaignUseCases.test.ts`                      | `findAll` com `{ channel: 'google' }`; ordem `['new','old']`; item completo com `roas: 4`.                                                                                                                         |
| ListCampaigns entrada padrão   | `src/application/campaigns/__tests__/campaignUseCases.test.ts`                      | `execute()` → `[]` e `findAll` com `{}`.                                                                                                                                                                           |
| HTTP envia filtros             | `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`             | URL `https://api.exemplo.com/campaigns?channel=google&status=ativa&from=...&to=...`; 1 entidade "Search Marca" com ROAS 5.                                                                                         |
| HTTP sem query                 | `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`             | Filtro vazio → URL `https://api.exemplo.com/campaigns`.                                                                                                                                                            |
| HTTP payload fora do contrato  | `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`             | `null`, `{ items: [] }`, canal `orkut`, data `ontem`, `clicks: -1` → `InvalidResponseError` citando `(raiz)`, `data`, `data.0.channel`, `data.0.period.start`, `data.0.metrics.clicks`.                            |
| HTTP regra de domínio          | `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`             | "Campanha cmp-1 inconsistente: Cliques não podem exceder impressões".                                                                                                                                              |
| HTTP erro de status            | `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`             | 503 → `HttpError`.                                                                                                                                                                                                 |
| Mapeamento com erro inesperado | `src/infrastructure/campaigns/__tests__/HttpCampaignRepository.test.ts`             | `RangeError` do mapeamento é repropagado.                                                                                                                                                                          |
| InMemory filtra                | `src/infrastructure/campaigns/__tests__/InMemoryCampaignRepository.test.ts`         | Canal `meta` → `['b']`; sem latência não chama `sleep`.                                                                                                                                                            |
| InMemory latência              | `src/infrastructure/campaigns/__tests__/InMemoryCampaignRepository.test.ts`         | `sleep(250)` em `findAll` e `findById`; `defaultSleep(100)` resolve só após 100 ms.                                                                                                                                |
| Mock válido                    | `src/infrastructure/campaigns/__tests__/InMemoryCampaignRepository.test.ts`         | ≥ 10 DTOs válidos pelo schema; primeiro começa em `2026-10-02T00:00Z` para referência `2026-10-22`; 5 canais; ids únicos; há ROAS `null` e campanha acima do orçamento.                                            |
| FetchHttpClient                | `src/infrastructure/http/__tests__/FetchHttpClient.test.ts`                         | Monta URL ignorando vazios; sem query/signal quando ausentes; corpo vazio → `null`; não-2xx → `HttpError` com corpo; 2xx não JSON → `InvalidResponseError`; falha → `NetworkError`; usa `fetch` global por padrão. |
| toListCampaignsInput           | `src/presentation/hooks/__tests__/hooks.test.tsx`                                   | Filtros iniciais → `{}`; `meta/ativa/ytd` → período de `2026-01-01T00:00Z` a `2026-10-22T00:00Z`.                                                                                                                  |
| useCampaigns                   | `src/presentation/hooks/__tests__/hooks.test.tsx`                                   | `execute` chamado com `{ channel: 'google' }`.                                                                                                                                                                     |
| queryKeys lista                | `src/presentation/hooks/__tests__/hooks.test.tsx`                                   | `['campaigns']` e `['campaigns','list',{ channel: 'meta' }]`.                                                                                                                                                      |
| Store de filtros               | `src/presentation/stores/__tests__/stores.test.ts`                                  | Começa sem filtros; atualiza e reseta; detecta filtros ativos.                                                                                                                                                     |
| Loading e lista                | `src/presentation/features/campaigns/__tests__/CampaignListScreen.test.tsx`         | h1 "Campanhas"; "Carregando campanhas…"; 2 itens; "2 campanha(s)"; sem "Limpar filtros".                                                                                                                           |
| Grid responsivo                | `src/presentation/features/campaigns/__tests__/CampaignListScreen.test.tsx`         | Lista com `grid-cols-1`, `md:grid-cols-2`, `xl:grid-cols-3`.                                                                                                                                                       |
| Filtros reconsultam            | `src/presentation/features/campaigns/__tests__/CampaignListScreen.test.tsx`         | Store `meta/pausada/ytd`; `execute` com `{ channel, status, period }`; "Limpar filtros" → `execute({})`.                                                                                                           |
| Vazio com filtros              | `src/presentation/features/campaigns/__tests__/CampaignListScreen.test.tsx`         | "Nenhuma campanha encontrada", descrição, 2 botões "Limpar filtros"; o do vazio zera o canal.                                                                                                                      |
| Vazio sem filtros              | `src/presentation/features/campaigns/__tests__/CampaignListScreen.test.tsx`         | Sem "Limpar filtros" e sem contador.                                                                                                                                                                               |
| Erro e retry                   | `src/presentation/features/campaigns/__tests__/CampaignListScreen.test.tsx`         | Alert com mensagem completa; sem vazio; após "Tentar novamente" exibe "Alfa"; `execute` 2 vezes.                                                                                                                   |
| Card aponta para detalhe       | `src/presentation/features/campaigns/__tests__/CampaignListScreen.test.tsx`         | "Abrir campanha Beta" → `/campaigns/b`.                                                                                                                                                                            |
| CampaignFilters inicial        | `src/presentation/features/campaigns/components/__tests__/CampaignFilters.test.tsx` | Radiogroups Canal, Status, Período; "Canal: Todos" marcado; sem "Limpar filtros".                                                                                                                                  |
| CampaignFilters interação      | `src/presentation/features/campaigns/components/__tests__/CampaignFilters.test.tsx` | Seleção atualiza store e `aria-checked`; "Limpar filtros" volta a `null/null/all` e some.                                                                                                                          |
| CampaignCard dados             | `src/presentation/features/campaigns/components/__tests__/CampaignCard.test.tsx`    | Link `/campaigns/abc`; h3; "Google Ads · 01/01/2026 – 31/01/2026"; "Pausada" com `data-status`; R$ 1.000,00; R$ 2.500,00; "2,50x".                                                                                 |
| CampaignCard sem ROAS          | `src/presentation/features/campaigns/components/__tests__/CampaignCard.test.tsx`    | Exibe "—".                                                                                                                                                                                                         |
| describeChannelPeriod          | `src/presentation/format/__tests__/campaignText.test.ts`                            | Combina rótulo do canal com o período formatado.                                                                                                                                                                   |
| Rotas                          | `src/presentation/navigation/__tests__/routes.test.ts`                              | `CAMPAIGNS_ROUTE` = `/campaigns`; detalhe codifica o id.                                                                                                                                                           |
| ChipGroup                      | `src/presentation/components/ui/__tests__/ChipGroup.test.tsx`                       | Radiogroup acessível; seleção notificada; opções cobrem todos os canais/status/presets.                                                                                                                            |
| StatusBadge                    | `src/presentation/components/ui/__tests__/StatusBadge.test.tsx`                     | Rótulo e `data-status` por status.                                                                                                                                                                                 |

## Nota

Visual atualizado pela fase 5 (platform/apsen-visual-identity). A seção 3 (UX) descreve o visual da época; o markup e as classes atuais estão em [apsen-visual-identity](../platform/apsen-visual-identity.md) e em `docs/design/DESIGN_SPEC.md`.

## Adendo — fase 5: selects, busca e paginação

A fase 5 seguiu o `#screen-planos` do protótipo e mudou a apresentação da lista. Domínio, `ListCampaigns`, contrato HTTP e as RNs desta spec não mudam. Os CAs abaixo substituem CA-02, CA-04, CA-07 a CA-09 só no que diz respeito à UX; os critérios completos são CA-08 e CA-13 a CA-15 de [apsen-visual-identity](../platform/apsen-visual-identity.md).

- **Filtros:** os três `ChipGroup` deram lugar a `FormSelect` "Canal" ("Todos os canais" + canais), "Status" ("Todos os status" + "● Ativa/Pausada/Encerrada") e "Período" (presets). "Todos" continua virando `null` e a consulta continua `{ channel?, status?, period? }`.
- **Busca (nova):** `SearchInput` "Buscar campanha" filtra no cliente pelo nome, sem caixa nem acento (`filterCampaignsByName`), sem nova consulta. Conta como filtro ativo para "Limpar filtros".
- **Paginação (nova):** 8 campanhas por página (`CAMPAIGNS_PER_PAGE`), "Mostrando a–b de n", botões de página com `aria-current="page"` e reticências. Mudar busca ou filtro volta para a página 1; página fora do intervalo é ajustada (`clampPage`).
- **Store:** `campaignFiltersStore` ganha `search`, `page`, `setSearch` e `setPage` (estado de apresentação). `reset` zera filtros, busca e página.
- **Contador e vazio:** "**n** campanha(s) · {período}"; o vazio é uma linha da tabela ("Nenhuma campanha encontrada com os filtros atuais." ou "Nenhuma campanha cadastrada."), com contador e paginação visíveis.
- **Linha:** código como `TextLink` `code` e ação como `IconLink` "Abrir campanha {nome}" para `/campaigns/{id}`; status em texto colorido.
- **Testes:** `features/campaigns/__tests__/{CampaignListScreen,campaignListView,campaignFilterOptions}.test.ts(x)`, `features/campaigns/components/__tests__/{CampaignFilters,CampaignResultSummary,CampaignTable}.test.tsx`, `components/ui/__tests__/{FormSelect,SearchInput,Pagination,pageRange}.test.ts(x)` e `stores/__tests__/stores.test.ts`.
