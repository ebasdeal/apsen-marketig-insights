---
status: READY
fase: 55
area: dashboard
feature: dashboard-demand-intelligence
azure-devops-work-item:
---

# Dashboard — Demand Intelligence

## 1. Overview

Porta a tela `dashboard` do protótipo `docs/Negócio/di-drivers-v2_84.html` (markup L2808–2848, `dashRender` L4895–5014, CSS L479–489) para `/`: visão rápida do ciclo ativo com 4 cartões (drivers no pipeline, restrições ativas, itens do plano, análises), barras por categoria de driver e por tipo de restrição ativa, a fila de aprovação pendente e a distribuição de status do plano (RN-DSH-01). Os números vêm dos dados reais (`/aprovacoes`, `/restricoes`, `/planoItens`, `/analises`, `/ciclos`), sem valores aleatórios (decisão 19) e com o ciclo ativo de `/ciclos` (decisão 21). Onda 5 (`docs/prototipo/ARQUITETURA.md` §6), nível mínimo 1.

Substitui o dashboard de campanhas da spec [dashboard-summary](dashboard-summary.md) (fase 2, `DONE`), que não é alterada: esta é uma feature nova na mesma rota. Código remanescente daquele dashboard (`GetDashboardSummary`, `queryKeys.dashboard(input)`, componentes de campanha) sai se ainda existir.

Fase provisória: 55 (onda 5 → 5x; depende das fases 51–53); o orquestrador atualiza o índice e pode renumerar.

### Decisão: um caso de uso de dashboard que compõe os repositórios

`GetDashboardOverview` (`src/application/dashboard/`) recebe no construtor as portas `AprovacaoRepository` (onda 3), `RestricaoRepository`, `PlanoItemRepository`, `AnaliseRepository` (fases 51–53) e `CicloRepository` (onda 3), as mesmas instâncias registradas no container, e faz as consultas em paralelo. Motivos:

1. **Contagens no servidor, sem baixar coleções.** Os casos de uso de lista dos módulos devolvem páginas prontas para tabela (10 itens); o dashboard precisa de totais e contagens por status/categoria/tipo. Com as portas, cada número é uma consulta `_limit=1` lida do `X-Total-Count` (§7.1), sem trazer os 247 itens do plano.
2. **Um único estado de carga.** Uma query, um loading, um erro com "Tentar novamente" e um "Atualizado em" coerente (decisão 19: horário em que a carga terminou).
3. **Regras puras testadas uma vez.** Percentuais, recorte de pendentes, produto curto e filtragem `n > 0` ficam em `src/domain/dashboard`.
4. **Sem HTTP duplicado.** Reaproveita os repositórios; nenhum endpoint novo.

Custo aceito: ~25 requisições pequenas em paralelo por carga (no json-server local, ~300 ms cada, limitadas pelo navegador a 6 por host). Pergunta em aberto para o backend real: endpoint agregado `/dashboard/resumo`.

Dependências de outras ondas (usar os nomes reais se diferirem, sem duplicar):

- Onda 0: `screens.ts` (`dashboard`, nível 1, crumb "Dashboard"), store do perfil simulado (nível atual), `HttpClient.getPage`, badges.
- Onda 1: `StatusDistributionRow` (`label`, `color`, `count`, `pct`), `PendingItemRow` (`id`, `title`, `subtitle`, `action`), `Section variant="panel"` com `action`.
- Onda 3: `AprovacaoRepository` com contagem por `status`/`cat` e página por `status` (se a porta não tiver `count`, esta spec adiciona `count(filtro): Promise<number>` à porta e ao `HttpAprovacaoRepository`, com teste); `CicloRepository` + `cicloAtivo`; as mutações de aprovações (aprovar, rejeitar, reabrir) passam a invalidar `queryKeys.dashboard.all`.
- Fases 51–53: `count` de restrições (`status`, `sev`, `tipo`), planos (`status`) e análises (`status`).

Perguntas em aberto:

- Backend: endpoint agregado para o dashboard no lugar das contagens individuais.
- PO: o gráfico "Restrições ativas por tipo" não tem o tipo "outro" (fiel ao protótipo); uma restrição "outro" conta no cartão, mas não aparece nas barras.
- PO: o banner do perfil Área diz que planos são do Planejador, mas `planos` é nível 1 (lacuna 11); textos mantidos.
- PO: os cartões levam a telas de nível 2–3; para o Visualizador, o clique cai no Acesso Negado (fiel).

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/` mostra "Dashboard — Demand Intelligence" / "Visão geral do ciclo ativo · {ciclo}" e, à direita, "Atualizado em **{data e hora pt-BR}**" com o horário da última carga concluída. Sem ciclo ativo, "—".                                                                                                                                                                                                                                         |
| CA-02 | Banner do perfil com "🔑 " + texto do nível: oculto para Admin; Planejador, Área e Visualizador com as cores do protótipo. Muda ao trocar o perfil simulado, sem nova consulta.                                                                                                                                                                                                                                                                    |
| CA-03 | 4 cartões clicáveis: 📥 azul total de aprovações "Drivers no pipeline" + "{n} pendentes" (amarelo) → `/admin/aprovacoes`; ⚠️ vermelho restrições ativas "Restrições ativas" + "{n} críticas" → `/restricoes`; 📋 verde total do plano "Itens no plano {ciclo}" + "{n} aprovados" → `/planos`; 🔬 laranja total de análises "Análises realizadas" + "{n} salvas" (verde; salva ou relatório) → `/analises`. Massa inicial: 14/2, 8/3, 247/107, 2/2. |
| CA-04 | "Drivers por Categoria": 6 barras fixas (Mídia / Digital, Comercial / Trade, Supply / MP, Regulatório, Sazonalidade, Concorrência) com a contagem de aprovações por `cat`, largura relativa ao maior e zero exibido como 0 (sem aleatório).                                                                                                                                                                                                        |
| CA-05 | "Restrições Ativas por Tipo": barras só dos tipos com n > 0 (Matéria-Prima, Capacidade, Demanda, Qualidade, Regulatório, Logística); nenhuma → "✅ Nenhuma restrição ativa".                                                                                                                                                                                                                                                                       |
| CA-06 | "Aguardando Aprovação" + "Ver todos →": até 4 pendentes (id, produto curto, tipo, botão "Revisar" → `/admin/aprovacoes`), "+mais {n}" se houver mais; nenhum → "✅ Nenhum driver pendente".                                                                                                                                                                                                                                                        |
| CA-07 | "Plano de Produção — Status" + "Ver plano →": Aprovado (verde), Em Revisão (laranja), Bloqueado (vermelho), Pendente (cinza) com contagem, mini-barra e % arredondado; rodapé "{total} itens · {ciclo}"; com total 0, % "—".                                                                                                                                                                                                                       |
| CA-08 | Estados: `loading.tsx` com skeleton do layout; carregando (header e banner visíveis, "Atualizado em —"); erro com "Tentar novamente" que refaz a carga; dados. Vazios por painel conforme CA-05/CA-06.                                                                                                                                                                                                                                             |
| CA-09 | Mutações de restrições, planos, análises e aprovações invalidam o dashboard; ao voltar para `/`, os números refletem a mudança.                                                                                                                                                                                                                                                                                                                    |

## 3. UX / Fluxo de tela

- Rota `src/app/page.tsx` (Server Component fino), `metadata = { title: 'Dashboard' }`, renderiza `<DashboardScreen />`; `src/app/loading.tsx` e `src/app/error.tsx` (raiz) passam a usar o skeleton/erro do dashboard ou mantêm os genéricos, e a rota ganha `DashboardSkeleton` dentro da tela para a primeira carga.
- Referências: `docs/design/DESIGN_SPEC.md` §3.6 (Section panel), §3.7, §3.9 (KpiCard), §3.10 (BarRow), §3.12; §4.1 é reescrita para este dashboard.

Estrutura (ordem do protótipo):

1. `PageHeader title="Dashboard — Demand Intelligence"`, `description` "Visão geral do ciclo ativo · {ciclo ?? '—'}", `actions` `<span className="text-[12px] text-apsen-muted">Atualizado em <strong>{atualizadoEmTexto}</strong></span>` (`aria-live="polite"`).
2. `PerfilBanner` (feature; `role="note"`): `mb-[14px] rounded-apsen border px-[16px] py-[10px] text-[13px] leading-[1.5]` com "🔑 " + mensagem (o nome do perfil em `<strong>`):

| Nível          | Texto                                                                                                                                                        | Classes                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| 4 Admin        | — (oculto)                                                                                                                                                   | —                                                                |
| 3 Planejador   | "Você está como **Planejador** — acesso operacional completo, exceto Agentes de IA e Controle de Acesso."                                                    | `border-apsen-blue-soft bg-apsen-kpi-blue text-apsen-blue`       |
| 2 Área         | "Você está como **Área** — pode registrar drivers e consultar análises. Ciclos, restrições e planos de produção estão disponíveis apenas para o Planejador." | `border-apsen-teal-soft-b bg-apsen-teal-soft-bg text-apsen-cyan` |
| 1 Visualizador | "Você está como **Visualizador** — acesso somente leitura. Disponível: Dashboard, Plano de Produção e Relatórios."                                           | `border-apsen-border bg-apsen-bg text-apsen-muted`               |

O nível vem da store do perfil (onda 0); não depende da query. 3. KPIs: `grid grid-cols-4 gap-[14px] mb-[20px] max-[800px]:grid-cols-2 max-[560px]:grid-cols-1` com 4 `KpiCard` (`href` → `<Link>`):

| icon | tone   | value                           | label                           | hint                    | hintTone | href                |
| ---- | ------ | ------------------------------- | ------------------------------- | ----------------------- | -------- | ------------------- |
| 📥   | blue   | `formatInteger(pipeline.total)` | "Drivers no pipeline"           | "{pendentes} pendentes" | yellow   | `/admin/aprovacoes` |
| ⚠️   | red    | ativas                          | "Restrições ativas"             | "{criticas} críticas"   | red      | `/restricoes`       |
| 📋   | green  | total do plano                  | "Itens no plano {ciclo ?? '—'}" | "{aprovados} aprovados" | green    | `/planos`           |
| 🔬   | orange | total de análises               | "Análises realizadas"           | "{salvas} salvas"       | green    | `/analises`         |

O `KpiCard` ganha `hintTone?: KpiTone | 'yellow'` (padrão = `tone`), porque no protótipo o hint do 1º cartão é amarelo e o do 4º é verde (L4936–4939). 4. Painéis 1: `grid grid-cols-2 gap-x-[16px] max-[800px]:grid-cols-1`:

- `Section variant="panel" title="Drivers por Categoria"`: 6 `BarRow` (`label`, `value=n`, `max=maior n (mín. 1)`, `valueLabel=String(n)`, `valueWidth="compact"`, `fillClassName` por categoria).
- `Section variant="panel" title="Restrições Ativas por Tipo"`: `BarRow` por tipo com n > 0, ou `InlineEmpty` "✅ Nenhuma restrição ativa".
- O `BarRow` ganha `valueWidth?: 'wide' | 'compact'` (padrão `wide` = `min-w-[72px]` atual; `compact` = `w-[24px]`, como o protótipo).

5. Painéis 2: mesmo grid:
   - `Section variant="panel" title="Aguardando Aprovação" action={<TextLink href="/admin/aprovacoes" aria-label="Ver todos os drivers pendentes">Ver todos →</TextLink>}` (`text-[12px] text-apsen-blue`): `ul` de `PendingItemRow` (`id` mono azul 11px `min-w-[95px]`, `title` produto curto 12.5px/500, `subtitle` tipo 11.5px muted, `action` `ButtonLink variant="ghost" size="sm" className="px-[8px] py-[2px] text-[11px]"` "Revisar" `aria-label="Revisar {id}"` → `/admin/aprovacoes`); depois, se `restantes > 0`, `p py-[6px] text-center text-[12px] text-apsen-muted` "+mais {restantes}"; vazio `InlineEmpty` "✅ Nenhum driver pendente".
   - `Section variant="panel" title="Plano de Produção — Status" action={<TextLink href="/planos" aria-label="Ver plano de produção">Ver plano →</TextLink>}`: 4 `StatusDistributionRow` (bolinha 9 px, rótulo 13px `flex-1`, contagem 13px/600 na cor, mini-barra 70×5 px, % 11px muted `min-w-[28px]`; `pct null` → "—"), cores verde/laranja/vermelho/muted; rodapé `border-t border-apsen-border pt-[8px] text-[12px] text-apsen-muted` "{total} itens · {ciclo ?? '—'}".

Cores das barras (tokens existentes `ch-*`, mesmos hex do protótipo; se a onda 1 os renomeou, usar os nomes novos):

| Categoria (`cat`)             | Hex       | Classe                 | Tipo de restrição         | Hex       | Classe                 |
| ----------------------------- | --------- | ---------------------- | ------------------------- | --------- | ---------------------- |
| `midia` Mídia / Digital       | `#3B82F6` | `bg-apsen-ch-google`   | `mp` Matéria-Prima        | `#EF4444` | `bg-apsen-ch-extra`    |
| `comercial` Comercial / Trade | `#F59E0B` | `bg-apsen-ch-email`    | `capacidade` Capacidade   | `#F59E0B` | `bg-apsen-ch-email`    |
| `supply` Supply / MP          | `#EF4444` | `bg-apsen-ch-extra`    | `demanda` Demanda         | `#3B82F6` | `bg-apsen-ch-google`   |
| `regulatorio` Regulatório     | `#8B5CF6` | `bg-apsen-ch-linkedin` | `qualidade` Qualidade     | `#8B5CF6` | `bg-apsen-ch-linkedin` |
| `sazo` Sazonalidade           | `#10B981` | `bg-apsen-ch-tiktok`   | `regulatorio` Regulatório | `#6366F1` | `bg-apsen-ch-meta`     |
| `concorrencia` Concorrência   | `#6366F1` | `bg-apsen-ch-meta`     | `logistica` Logística     | `#10B981` | `bg-apsen-ch-tiktok`   |

Estados:

- Primeira carga: header (descrição com "—"), banner e `DashboardSkeleton` (4 cartões `h-[118px]` e 4 painéis `h-[180px]` em `rounded-[10px] bg-apsen-bg`, sem animação). `src/app/loading.tsx` renderiza o mesmo skeleton durante a navegação.
- Erro: `ErrorState` (`toUserMessage(error)`) com "Tentar novamente" (`refetch`), abaixo do header e do banner.
- Recarga em segundo plano (após invalidação): dados anteriores ficam na tela; "Atualizado em" muda quando a nova carga termina.
- Dados: blocos acima; os vazios são por painel (CA-05, CA-06). Os cartões mostram 0 quando não há registros.

## 4. Contratos de API consumidos

Todas as contagens usam `_limit=1` e leem `X-Total-Count`; a lista de pendentes usa `_limit=4`. Base `{NEXT_PUBLIC_API_URL}`.

| Número                        | Requisição (via repositório)                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Drivers no pipeline           | `GET /aprovacoes?_limit=1`                                                                                   |
| Pendentes (cartão e fila)     | `GET /aprovacoes?status=pendente&_page=1&_limit=4` (itens + total)                                           |
| Por categoria (×6)            | `GET /aprovacoes?cat={slug}&_limit=1`                                                                        |
| Restrições ativas / críticas  | `GET /restricoes?status=ativa&_limit=1` · `GET /restricoes?status=ativa&sev=critica&_limit=1`                |
| Ativas por tipo (×6)          | `GET /restricoes?status=ativa&tipo={tipo}&_limit=1`                                                          |
| Plano total / por status (×4) | `GET /planoItens?_limit=1` · `GET /planoItens?status={status}&_limit=1`                                      |
| Análises total / salvas       | `GET /analises?_limit=1` · `GET /analises?status=salva&_limit=1` · `GET /analises?status=relatorio&_limit=1` |
| Ciclo ativo                   | `GET /ciclos` (via `CicloRepository`)                                                                        |

Exemplo (pendentes):

```json
[
  {
    "id": "DRV-2026-034",
    "modo": "SKU",
    "produto": "Baricitinibe 2mg — Blister 28cp",
    "molecula": "Baricitinibe",
    "tipo": "💻 Digital / Redes",
    "cat": "midia",
    "periodo": { "ini": "2026-07-01", "fim": "2026-07-31" },
    "intensidade": 4,
    "registrante": "Fernanda Marketing",
    "data_reg": "2026-06-20",
    "status": "pendente",
    "params": "Plataforma: Instagram · Formato: Reels · Impressões: 2.400.000",
    "motivo_rejeicao": ""
  }
]
```

Headers: `X-Total-Count: 2`. Validação: os schemas Zod de cada módulo (`aprovacaoDtoSchema` da onda 3, `restricaoDtoSchema`, `planoItemDtoSchema`, `analiseDtoSchema`) e, para o total, `z.coerce.number().int().nonnegative()` sobre o header (ausente/inválido → `InvalidResponseError`, já tratado no `getPage`). Qualquer falha (`HttpError`, `NetworkError`, `InvalidResponseError`) rejeita a carga inteira e a tela mostra `ErrorState`.

## 5. Domínio (`src/domain`)

`src/domain/dashboard/`:

- `dashboardConstants.ts`: `CATEGORIAS_DASHBOARD` (6 `{ slug, label }` na ordem do protótipo — `config.dashboardCategorias`), `TIPOS_RESTRICAO_DASHBOARD` (6 `{ tipo, label }` — `config.dashboardRestricaoTipos`, sem `outro`), `STATUS_PLANO_DASHBOARD` (`aprovado` Aprovado, `revisao` Em Revisão, `bloqueado` Bloqueado, `pendente` Pendente), `LIMITE_PENDENTES = 4`.
- `dashboardRules.ts` (puro):
  - `percentual(n, total): number | null` — `total === 0` → `null`; senão `Math.round(n / total * 100)`.
  - `barras(contagens: { chave; label; n }[], { somentePositivos })` — devolve `{ chave, label, n, max }` com `max = Math.max(...n, 1)`; `somentePositivos` remove `n === 0`.
  - `produtoCurto(produto)` — `produto.split('—')[0].trim().split('·')[0].trim()` (L4989).
  - `restantesPendentes(total, exibidos)` — `Math.max(total - exibidos, 0)`.
  - `distribuicaoPlano(contagens, total)` — 4 linhas na ordem fixa com `pct = percentual(n, total)`.

Sem entidades ou portas novas: usa `Aprovacao` e `AprovacaoRepository` (onda 3), `RestricaoRepository`, `PlanoItemRepository`, `AnaliseRepository`, `CicloRepository` e `cicloAtivo`.

## 6. Aplicação (`src/application`)

`src/application/dashboard/`:

- `dto.ts`
  ```ts
  export interface DashboardOverviewOutput {
    ciclo: string | null;
    atualizadoEm: string;
    pipeline: { total: number; pendentes: number };
    restricoes: { ativas: number; criticas: number };
    plano: {
      total: number;
      aprovados: number;
      status: { status: PlanoStatus; label: string; n: number; pct: number | null }[];
    };
    analises: { total: number; salvas: number };
    categorias: { slug: string; label: string; n: number; max: number }[];
    restricoesPorTipo: { tipo: RestricaoTipo; label: string; n: number; max: number }[];
    pendentes: { itens: { id: string; produto: string; tipo: string }[]; restantes: number };
  }
  ```
- `GetDashboardOverview` — `constructor(aprovacoes, restricoes, planoItens, analises, ciclos, now: () => Date)`; `execute()`: dispara todas as consultas do §4 com `Promise.all`; monta o DTO com as regras do §5; `salvas = count(salva) + count(relatorio)`; `aprovados` = contagem de `aprovado`; `pendentes.itens` = página de pendentes (id, `produtoCurto(produto)`, `tipo`); `atualizadoEm = now().toISOString()` lido **depois** das consultas.

## 7. Infraestrutura (`src/infrastructure`)

Nenhum arquivo novo. Usa os repositórios HTTP das fases 51–53 e da onda 3. Se `HttpAprovacaoRepository` não tiver `count`, adicionar (`getPage` com `_limit=1` e filtros `status`/`cat`) com teste.

## 8. Apresentação (`src/presentation`)

- `queryKeys.dashboard = { all: ['dashboard'] as const, overview: () => ['dashboard', 'overview'] as const }` (substitui `dashboard(input)`).
- `src/presentation/hooks/useDashboard.ts`: `useDashboardOverview()` — `useQuery`, `staleTime: 30_000`, `refetchOnMount: true`, `placeholderData: keepPreviousData`.
- `UseCases.dashboard = { overview: Pick<GetDashboardOverview, 'execute'> }`; `createFakeUseCases` com stub que rejeita "não configurado" (como hoje).
- `createContainer`: `new GetDashboardOverview(aprovacaoRepository, restricaoRepository, planoItemRepository, analiseRepository, cicloRepository, now)` com as **mesmas** instâncias dos módulos.
- `src/presentation/format/formatters.ts`: `formatDateTime(iso)` → `new Date(iso).toLocaleString('pt-BR')` (formato do protótipo, L4897); `null`/vazio → "—".
- Feature `src/presentation/features/dashboard/` (substitui a de campanhas): `DashboardScreen.tsx` (`'use client'`), `perfilBanner.ts` (textos e classes por nível), `dashboardStyles.ts` (cores das barras e dos status), `components/{PerfilBanner,DashboardKpis,CategoriasPanel,RestricoesTipoPanel,PendentesPanel,PlanoStatusPanel,DashboardSkeleton}.tsx`.
- UI kit (modificações com teste): `KpiCard` — `hintTone?: KpiTone | 'yellow'` (`yellow` → `text-apsen-yellow`); `BarRow` — `valueWidth?: 'wide' | 'compact'`.
- Rotas usadas: `/admin/aprovacoes` (onda 3), `RESTRICOES_ROUTE`, `PLANOS_ROUTE`, `ANALISES_ROUTE`.

### Tokens

| Token                        | Claro (protótipo) | Escuro [derivado] | Uso                        |
| ---------------------------- | ----------------- | ----------------- | -------------------------- |
| `--color-apsen-blue-soft`    | `#c7d7fa`         | `#2e3680`         | borda do banner Planejador |
| `--color-apsen-teal-soft-bg` | `#f0fdfa`         | `#0d2a2a`         | fundo do banner Área       |
| `--color-apsen-teal-soft-b`  | `#99f6e4`         | `#1f5c55`         | borda do banner Área       |

`#EEF3FF` = `apsen-kpi-blue`; `#0891B2` = `apsen-cyan`. Usar os tokens da onda 1 com esses valores se já existirem; senão criar nos dois temas e documentar no `DESIGN_SPEC.md` (§1 e §4.1 reescrita).

## 9. Arquivos

### Novos

- `src/domain/dashboard/{dashboardConstants,dashboardRules}.ts`, `__tests__/dashboardRules.test.ts`
- `src/application/dashboard/{dto,GetDashboardOverview}.ts`, `__tests__/GetDashboardOverview.test.ts`
- `src/presentation/hooks/useDashboard.ts`, `__tests__/useDashboard.test.tsx`
- `src/presentation/features/dashboard/` (§8) e `__tests__/{DashboardScreen,PerfilBanner,PendentesPanel,PlanoStatusPanel}.test.tsx`

### Modificados

- `src/app/page.tsx` (+ `src/app/__tests__/page.test.tsx`) — `metadata.title` "Dashboard" e a nova tela; `src/app/loading.tsx` — skeleton do dashboard (+ teste).
- `src/presentation/hooks/queryKeys.ts`, `UseCasesContext.tsx`, `test/renderWithProviders.tsx` — grupo `dashboard`; remoção do que restar do dashboard de campanhas.
- `src/main/container.ts` (+ teste).
- `src/presentation/components/ui/KpiCard.tsx`, `BarRow.tsx` (+ testes `KpiCard.test.tsx`, `BarRow.test.tsx`).
- `src/presentation/format/formatters.ts` (+ `format.test.ts`) — `formatDateTime`.
- Hooks de mutação de aprovações (onda 3) — invalidar `queryKeys.dashboard.all`, se ainda não invalidam; `AprovacaoRepository`/`HttpAprovacaoRepository` — `count`, se faltar.
- `src/app/globals.css` (+ `globals.test.ts`) e `docs/design/DESIGN_SPEC.md` (§4.1) — tokens e descrição da tela.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Cartões: pipeline = total de aprovações e pendentes = `status pendente`; restrições = ativas e críticas (ativa e `sev critica`); plano = total e `status aprovado`; análises = total e salvas (`salva` + `relatorio`) (RN-DSH-01). |
| RN-02 | Categorias: 6 fixas na ordem do protótipo, n = aprovações com `cat` igual ao slug (todos os status, fiel); zero aparece como 0 (decisão 19, sem aleatório); largura = n / maior n (mín. 1).                                        |
| RN-03 | Restrições por tipo: só ativas, 6 tipos fixos (sem `outro`), só n > 0; nenhuma → "✅ Nenhuma restrição ativa".                                                                                                                     |
| RN-04 | Pendentes: os 4 primeiros na ordem da API, produto = texto antes do primeiro "—" e depois do primeiro "·"; "+mais N" com N = pendentes − 4 quando positivo.                                                                        |
| RN-05 | Plano por status: 4 linhas fixas, `pct = round(n / total × 100)`; total 0 → `null` e a UI mostra "—".                                                                                                                              |
| RN-06 | Ciclo nos textos = ciclo ativo de `/ciclos` (decisão 21); sem ciclo, "—".                                                                                                                                                          |
| RN-07 | "Atualizado em" = horário em que a última carga terminou, formatado `toLocaleString('pt-BR')` (decisão 19).                                                                                                                        |
| RN-08 | Banner por nível do perfil simulado: Admin oculto; Planejador, Área e Visualizador com texto e cores do protótipo, prefixo "🔑 ".                                                                                                  |
| RN-09 | Mutações de aprovações, restrições, planos e análises invalidam `['dashboard']`.                                                                                                                                                   |

## 11. Requisitos não funcionais

| Item (§7) | Aplicação                                                                                                                                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7.1       | Nenhuma coleção é baixada inteira: contagens por `X-Total-Count` com `_limit=1` e só 4 pendentes; sem paginação na tela (não há lista longa); sem estado na URL (não há filtros).                                                                                        |
| 7.2       | Rota `/` com `loading.tsx` (skeleton) e `error.tsx` com "Tentar novamente"; sem dependências pesadas (sem chart.js aqui); prefetch dos links dos cartões e painéis pelo `<Link>`.                                                                                        |
| 7.3       | `staleTime` 30 s, `refetchOnMount`, `keepPreviousData` nas recargas; invalidação pelas mutações dos 4 módulos (RN-09).                                                                                                                                                   |
| 7.4       | Não se aplica (sem formulário).                                                                                                                                                                                                                                          |
| 7.5       | Cartões são links com nome acessível (`aria-label` do `KpiCard`), barras com `role="meter"` (`BarRow`), banner `role="note"`, "Atualizado em" `aria-live`; grids 4 → 2 → 1 colunas e painéis 2 → 1 abaixo de 800 px; sem animações novas (hover de sombra já existente). |
| 7.6       | Sem `console.*`; o painel de pendentes mostra só id, produto e tipo (sem o registrante).                                                                                                                                                                                 |

## 12. BDD — Cenários de teste unitário

| Cenário                                                                                                                     | Arquivo de teste                                                                                    | Asserção                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CA-01 / RN-06 / RN-07 Dado ciclo PLP-2026-07 e `atualizadoEm` fixo, quando renderiza, então título, subtítulo e horário     | `src/presentation/features/dashboard/__tests__/DashboardScreen.test.tsx`                            | `heading` "Dashboard — Demand Intelligence"; "Visão geral do ciclo ativo · PLP-2026-07"; `strong` = `new Date(iso).toLocaleString('pt-BR')`; `ciclo null` → "—"                                                                                                                                  |
| CA-02 / RN-08 Dado os níveis 4, 3, 2 e 1, quando renderiza o banner, então oculto e textos/classes                          | `src/presentation/features/dashboard/__tests__/PerfilBanner.test.tsx`                               | nível 4 sem `note`; 3 "🔑 Você está como Planejador — …" com `bg-apsen-kpi-blue`; 2 `bg-apsen-teal-soft-bg text-apsen-cyan`; 1 `bg-apsen-bg text-apsen-muted`; trocar o perfil na store não chama `overview.execute` de novo                                                                     |
| CA-03 / RN-01 Dado o overview da massa inicial, quando renderiza, então 4 cartões, hints e links                            | `DashboardScreen.test.tsx`                                                                          | `article` "Drivers no pipeline: 14" com hint "2 pendentes" `text-apsen-yellow`; "Restrições ativas: 8" "3 críticas"; "Itens no plano PLP-2026-07: 247" "107 aprovados"; "Análises realizadas: 2" "2 salvas" `text-apsen-green`; links `/admin/aprovacoes`, `/restricoes`, `/planos`, `/analises` |
| CA-04 / RN-02 Dado contagens 3/4/2/1/2/0, quando calcula e renderiza, então 6 barras e zero mostrado                        | `src/domain/dashboard/__tests__/dashboardRules.test.ts`, `DashboardScreen.test.tsx`                 | `barras` com `max 4`; 6 `meter`; Concorrência `aria-valuenow 0` e "0"; fill `bg-apsen-ch-google` em Mídia                                                                                                                                                                                        |
| CA-05 / RN-03 Dado ativas só de `mp` (2) e `outro` (1), quando renderiza, então uma barra; dado nenhuma, o vazio            | `DashboardScreen.test.tsx`, `dashboardRules.test.ts`                                                | 1 `meter` "Matéria-Prima"; `somentePositivos` remove zeros; "✅ Nenhuma restrição ativa"                                                                                                                                                                                                         |
| CA-06 / RN-04 Dado 6 pendentes, quando renderiza, então 4 linhas, "Revisar" e "+mais 2"; dado 0, o vazio                    | `src/presentation/features/dashboard/__tests__/PendentesPanel.test.tsx`, `dashboardRules.test.ts`   | ids mono; `produtoCurto('Baricitinibe 2mg — Blister 28cp') === 'Baricitinibe 2mg'`; `produtoCurto('Apixabana · Cardio') === 'Apixabana'`; `link` "Revisar DRV-2026-034" → `/admin/aprovacoes`; "+mais 2"; "✅ Nenhum driver pendente"; "Ver todos →"                                             |
| CA-07 / RN-05 Dado 107/70/35/35 de 247, quando renderiza, então % e rodapé; total 0 → "—"                                   | `src/presentation/features/dashboard/__tests__/PlanoStatusPanel.test.tsx`, `dashboardRules.test.ts` | "43%", "28%", "14%", "14%"; "247 itens · PLP-2026-07"; `percentual(0, 0) === null` → "—"                                                                                                                                                                                                         |
| CA-08 Dado `overview` pendente, rejeitado e depois resolvido, quando clica "Tentar novamente", então skeleton, erro e dados | `DashboardScreen.test.tsx`, `src/app/__tests__/page.test.tsx`                                       | skeleton presente e "Atualizado em —"; `alert` com "Tentar novamente"; 2ª chamada; `metadata.title` "Dashboard"; `loading.tsx` renderiza o skeleton                                                                                                                                              |
| CA-09 / RN-09 Dado uma mutação de restrição, quando conclui, então a query do dashboard é invalidada e refeita ao montar    | `src/presentation/hooks/__tests__/useDashboard.test.tsx`                                            | `invalidateQueries({ queryKey: ['dashboard'] })` torna a query `stale`; nova montagem chama `overview.execute`                                                                                                                                                                                   |
| Caso de uso Dado repositórios falsos, quando executa, então consultas em paralelo e DTO completo                            | `src/application/dashboard/__tests__/GetDashboardOverview.test.ts`                                  | `count` chamado com cada filtro do §4 (`{ cat: 'midia' }`, `{ status: 'ativa', sev: 'critica' }`, `{ status: 'aprovado' }`…); `salvas = 1 + 1`; `atualizadoEm` = ISO do `now` falso; rejeição de qualquer repositório rejeita o `execute`                                                        |
| UI kit Dado `KpiCard` com `hintTone="yellow"` e `BarRow` com `valueWidth="compact"`, quando renderiza, então as classes     | `src/presentation/components/ui/__tests__/KpiCard.test.tsx`, `BarRow.test.tsx`                      | hint `text-apsen-yellow` com valor azul; sem `hintTone` = cor do tom; valor `w-[24px]`; padrão `min-w-[72px]`                                                                                                                                                                                    |
| Formatação Dado ISO e `null`, quando formata, então pt-BR e "—"                                                             | `src/presentation/format/__tests__/format.test.ts`                                                  | `formatDateTime(iso) === new Date(iso).toLocaleString('pt-BR')`; `formatDateTime(null) === '—'`                                                                                                                                                                                                  |

## Adendo do orquestrador (27/10/2026) — endpoint agregado

Decisão: em vez de ~25 contagens com `_limit=1`, a tela consome **um** endpoint agregado, como o BFF real deve expor. Já implementado em `mock-api/server.mjs`:

`GET /dashboard` (Bearer) →

```json
{
  "atualizadoEm": "ISO",
  "cicloAtivo": { "id": "PLP-2026-07", "descricao": "Planejamento Julho 2026" },
  "pipeline": { "total": 14, "pendentes": 2 },
  "restricoes": {
    "ativas": 8,
    "criticas": 3,
    "porTipo": [{ "tipo": "mp", "label": "Matéria-Prima", "n": 2 }]
  },
  "plano": {
    "total": 247,
    "aprovados": 107,
    "porStatus": { "aprovado": 107, "revisao": 70, "bloqueado": 35, "pendente": 35 }
  },
  "analises": { "total": 2, "salvas": 2 },
  "driversPorCategoria": [{ "categoria": "midia", "label": "Mídia / Digital", "n": 3 }],
  "aguardandoAprovacao": {
    "total": 2,
    "itens": [{ "id": "DRV-2026-034", "produto": "…", "tipo": "💻 Digital / Redes" }]
  }
}
```

- `porTipo` só traz tipos com `n > 0` (vazio → "✅ Nenhuma restrição ativa"); `itens` traz até 4 pendentes ("+mais N" = `total - itens.length`).
- Cores não vêm da API: categoria/tipo → token `apsen-*` no front.
- Módulo `dashboard` próprio: `DashboardRepository.overview()` → `HttpDashboardRepository` (zod) → `GetDashboardOverview`. Substitui a composição pelos repositórios dos outros módulos descrita acima. Invalida junto com `queryKeys.navegacao.badges()` após mutações dos outros módulos (prefixo `['dashboard']`).
- "Atualizado em" = `atualizadoEm` formatado em pt-BR.
