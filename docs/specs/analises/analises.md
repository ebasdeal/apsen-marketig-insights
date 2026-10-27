---
status: IN_PROGRESS
fase: 53
area: analises
feature: analises
azure-devops-work-item:
---

# Análises de impacto (lista, nova análise, visualização com gráfico, chat e PDF)

## 1. Overview

Porta as telas `analises` (L2851–2881), `analise-form` (L2884–2985) e `analise-view` (L2988–3067) do protótipo `docs/Negócio/di-drivers-v2_84.html`, o gráfico `chart-comparacao` (L7407–7542, inventário §5), o chat (L5300–5364) e o modal `modal-pdf` (L3445–3464) para `/analises`, `/analises/nova` e `/analises/[id]`, com dados reais via json-server (`/analises`, `/skusCiclo`, `/modelosGuiados`, `/aprovacoes`, `/ciclos`, `/config`). A análise projeta a demanda de SKUs com vs. sem drivers (RN-ANL-01, RN-ANL-07); o resultado segue o mock do protótipo (decisão 16, sem modelo real). Onda 5 (`docs/prototipo/ARQUITETURA.md` §6); segue §1–§4, §7 e as decisões 16, 19 e 21 do §5.

Fase provisória: 53 (onda 5 → 5x); o orquestrador atualiza o índice e pode renumerar.

Dependências de outras ondas (usar os nomes reais se diferirem, sem duplicar):

- Onda 0: `screens.ts` (`analises`, `analise-form`, `analise-view`, nível 2, módulo `analises`, crumbs "Minhas Análises", "Nova Análise", "Análise"), guarda, `useToast`, `UseCases` por módulo, badges calculados, `HttpClient.getPage`.
- Onda 1: `Button` variante `orange`, `ModeSelector` (`accent="orange"`), `SelectableCard`, `CheckboxCard`, `Breadcrumb`, `Section variant="detail"` (título laranja), `Modal`, `Pagination`, `FormField error`, `Alert`, `CardTitle`.
- Onda 3: `AprovacaoRepository` (lista paginada com filtro `status`) e `CicloRepository.list()` + `cicloAtivo(ciclos)` (decisão 21).
- Pré-requisito do mock-api (fora desta spec): campo `codigo` (= `id` atual) em `analises`. O mapper usa `codigo ?? id`.

Perguntas em aberto (comportamento definido abaixo):

- PO: RN-ANL-04 — o modo e o modelo escolhidos (guiado/avançado, horizonte, parâmetros) são **gravados** em `config_modelo`, mas o resultado e o rótulo "Automático → SARIMAX" seguem o mock (decisão 16). Exibir o modelo escolhido?
- PO: RN-ANL-03 — drivers pré-selecionados = todos os aprovados, sem filtrar pelos SKUs (fiel). Os desmarcados são gravados em `drivers`, mas não alteram o resultado.
- PO: RN-ANL-08 — métricas (AIC, MAPE) vêm do texto `modelo_info` do mock.
- PO: RN-ANL-10 — "Baixar PDF" só mostra o toast (fiel); não gera arquivo.
- PO: a busca usa `q=` do json-server (título, SKU, ciclo e demais campos, sem diferenciar caixa); o protótipo procura só em título e ciclo (com o bug de caixa da lacuna 16). O placeholder "Título, SKU, ciclo..." fica atendido.
- Técnico: o gráfico só tem 12 meses (Jan–Dez) qualquer que seja o horizonte (fiel).

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/analises` mostra "Análises" / "Análises de impacto de drivers · ApsenPLPEngine", "+ Nova Análise" (laranja → `/analises/nova`), o `ScreenDesc` 🔬, busca "Título, SKU, ciclo..." (debounce 300 ms) e o filtro de status (Todos, 📝 Rascunho, ✅ Salva, 📄 Relatório emitido), aplicados na API e na URL.                                                                                                                      |
| CA-02 | O contador mostra "**{n}** análise(s)" ("análise" para 1, "análises" nos demais) com o total filtrado; a lista é paginada no servidor (10 por página).                                                                                                                                                                                                                                                                          |
| CA-03 | Cada `AnalysisCard` mostra título, pill de status (📝 Rascunho / ✅ Salva / 📄 Relatório) e "🗓️ {ciclo} · 📦 {n} SKU(s) · ⚙️ {modelo} · 📅 {criada}"; clicar abre `/analises/{id}`. Sem resultado: 🔬 "Nenhuma análise encontrada".                                                                                                                                                                                             |
| CA-04 | `/analises/nova` mostra breadcrumb "Análises › Nova Análise", "← Voltar", `ScreenDesc` ⚙️ e os cards 01–04 com número em pill laranja; o select de ciclo vem de `/ciclos` com "(ativo)" no ciclo ativo.                                                                                                                                                                                                                         |
| CA-05 | Escolher o ciclo carrega os SKUs de `/skusCiclo/{ciclo}` agrupados por família (título na cor da família, "({n} SKUs)"), com "{dias}d estoque" vermelho (< 30), amarelo (< 60) ou verde; sem ciclo: "Selecione um ciclo para carregar os SKUs."; sem SKUs: "Nenhum SKU para este ciclo."; "✓ Selecionar todos" e "✗ Limpar" funcionam.                                                                                          |
| CA-06 | Com ≥ 1 SKU marcado aparece o card 03 "Drivers Identificados" com os drivers aprovados, todos marcados, desmarcáveis.                                                                                                                                                                                                                                                                                                           |
| CA-07 | O card 04 alterna Automático (alerta de sucesso), Guiado (6 cards de `/modelosGuiados`, padrão SARIMAX) e Avançado (modelo, horizonte 1–24 padrão 3 e parâmetros de SARIMAX/Prophet/Ensemble).                                                                                                                                                                                                                                  |
| CA-08 | "Executar Análise" valida "⚠️ Informe o título." / "⚠️ Selecione o ciclo." / "⚠️ Selecione ao menos um SKU." (toast, erro no campo e foco); válido: toast "⟳ Executando análise com o ApsenPLPEngine...", cria a análise rascunho (UUID + `ANL-nnn`) com o resultado mock de `/config`, navega para `/analises/{id}` e mostra "✅ Análise executada! Salve para emitir o relatório.".                                           |
| CA-09 | `/analises/[id]` mostra breadcrumb "Análises › {título}", título, meta "Ciclo: **{ciclo}** · Modelo: **{modelo}** · {n} SKU(s) · {criada}", pill de status, "Salvar" e "Exportar PDF" (desabilitado em rascunho).                                                                                                                                                                                                               |
| CA-10 | Seções em ordem: 📄 Sumário Executivo, 📊 Impacto por Driver, 📈 Previsão: com vs. sem drivers (resumo, legenda, gráfico de linha 250 px, tabela mês a mês com Total), 📋 Justificativas, ⚙️ Modelo Utilizado e 💬 Interações com IA Documentadas (só com histórico).                                                                                                                                                           |
| CA-11 | Gráfico e tabela usam os dados determinísticos do protótipo (seed do código da análise, impacto total = soma dos impactos ou 14); cores lidas dos tokens em runtime e atualizadas ao trocar o tema.                                                                                                                                                                                                                             |
| CA-12 | "Salvar" grava `status: "salva"` (ou mantém `relatorio`) e `salvo_em`, com toast "✅ Análise salva! PDF disponível."; "Exportar PDF" grava `status: "relatorio"` e abre o modal "Exportar Relatório PDF" (5 seções, só "Interações com IA" desmarcada); "Baixar PDF" mostra "📄 Relatório PDF gerado!" e fecha.                                                                                                                 |
| CA-13 | Chat "CHAT · APSENPLPENGINE": mensagem inicial, Enter envia / Shift+Enter quebra linha, "⟳ Analisando..." por 1,4 s e resposta por palavra-chave de `config.chatRespostas`; "💾 Salvar interação" grava a última pergunta+resposta em `historico_ia` ("✅ Interação documentada."; sem par: "⚠️ Nenhuma interação completa."); "Limpar" mostra "Chat limpo. Como posso ajudar?". Ao abrir, o chat é semeado com `historico_ia`. |
| CA-14 | Estados: `loading.tsx` com skeleton nas três rotas; carregando; erro com "Tentar novamente"; id inexistente → `not-found` "Análise não encontrada"; vazio (CA-03); dados.                                                                                                                                                                                                                                                       |
| CA-15 | O badge "Minhas Análises" mostra o total de análises e muda após executar.                                                                                                                                                                                                                                                                                                                                                      |

## 3. UX / Fluxo de tela

Referências: `docs/design/DESIGN_SPEC.md` §3.1, §3.5, §3.6 (`Section detail`), §3.7, §3.8, §3.12, §3.14, §3.15, §3.16, §3.19. `Lnnnn` = protótipo.

### 3.1 `/analises` — `AnalisesScreen`

- Rota `src/app/analises/page.tsx`, `metadata = { title: 'Análises' }`; `loading.tsx`, `error.tsx`.
- `PageHeader` "Análises" / "Análises de impacto de drivers · ApsenPLPEngine"; ação `ButtonLink variant="orange" size="sm" href="/analises/nova"` "+ Nova Análise".
- `ScreenDesc icon="🔬"`: "**Análises de impacto de drivers em SKUs específicos, com suporte de IA.** Cada análise vincula ciclo, SKUs e drivers aprovados, aplica modelo estatístico e documenta justificativas. O chat permite refinamentos diretos. _Salvar é obrigatório para emitir relatório._"
- Filtros (`role="search"`, `mb-[14px] flex flex-wrap gap-[10px]`): `SearchInput` `aria-label="Buscar análises"` placeholder "Título, SKU, ciclo..." (`min-w-[220px] flex-1`); `FormSelect` `aria-label="Status"` `w-[170px]` ("Todos os status", "📝 Rascunho", "✅ Salva", "📄 Relatório emitido").
- Contador `p mb-[12px] text-[13px] text-apsen-muted` `aria-live="polite"`: `<strong>{total}</strong> {total === 1 ? 'análise' : 'análises'}`.
- Lista `ul` de `AnalysisCard` (feature): `Link` `block mb-[10px] rounded-[10px] border border-apsen-border bg-apsen-white px-[18px] py-[14px] transition-[border] duration-[140ms] hover:border-apsen-orange focus-ring`; linha 1 `mb-[5px] flex items-center gap-[10px]`: título `flex-1 text-[14px] font-semibold text-apsen-slate` + `AnaliseStatusPill`; linha 2 `text-[12px] text-apsen-muted` "🗓️ {ciclo} · 📦 {n} SKU(s) · ⚙️ {modelo} · 📅 {criada}" (separador "&nbsp;·&nbsp;"). `aria-label` do link = título.
- `AnaliseStatusPill` (feature): `rounded-[20px] border px-[9px] py-[2px] text-[11px] font-semibold` (lista) ou `px-[12px] py-[4px] text-[12px]` (`size="lg"`, cabeçalho): rascunho `border-apsen-border bg-apsen-bg text-apsen-muted` "📝 Rascunho"; salva `border-apsen-green-b bg-apsen-green-bg text-apsen-green` "✅ Salva"; relatorio `border-apsen-blue-light bg-apsen-blue-bg text-apsen-blue` "📄 Relatório".
- `Pagination` abaixo da lista quando `total > 10`.
- URL: `busca`, `status`, `pagina` (`analisesUrl.ts`); busca com `useDebouncedValue(300)`; mudar busca/status remove `pagina`.
- Estados: `LoadingState` "Carregando análises…"; `ErrorState` + "Tentar novamente"; vazio `EmptyState icon="🔬" title="Nenhuma análise encontrada"`.

### 3.2 `/analises/nova` — `NovaAnaliseScreen`

- Rota `src/app/analises/nova/page.tsx`, `metadata = { title: 'Nova Análise' }`; `loading.tsx`, `error.tsx`.
- `Breadcrumb items=[{ label: 'Análises', href: '/analises' }, { label: 'Nova Análise' }] backHref="/analises"`.
- `ScreenDesc icon="⚙️"`: "**Configure o escopo: ciclo, SKUs e drivers.** A IA pré-seleciona os drivers relevantes. Escolha o modelo estatístico — use _Automático_ se não tiver certeza."
- Número dos cards: `CardTitle step="01" stepTone="orange"` (pill `rounded-[6px] bg-apsen-orange-soft px-[10px] py-[2px] text-[11px] font-bold text-apsen-orange`). Se o `CardTitle` ainda não tiver `step`/`stepTone`, esta spec adiciona as props (com teste) em `components/ui/Card.tsx`.
- **01 Identificação** (`FormGrid columns={2}`):
  - "Título da análise" `*` `full` `TextInput` placeholder "Ex: Impacto campanha TV Inverno — Baricitinibe" (`maxLength` 160 [derivado]).
  - "Ciclo" `*` `FormSelect` placeholder "Selecione..."; opções de `GetNovaAnaliseOpcoes` (RN-02).
  - "Tipo de análise" `FormSelect` (padrão a 1ª): Impacto de drivers em SKUs específicos · Forecast / previsão de demanda · Comparativo ciclo a ciclo · Análise de demanda censurada · Marketing Mix Modeling (MMM) · Análise ad hoc.
  - "Comentários / contexto" `full` `TextArea rows={2}` placeholder "Hipóteses, perguntas-chave, restrições...".
- **02 SKUs a Analisar**: `Button ghost sm className="border-dashed"` "✓ Selecionar todos" e "✗ Limpar" (`mb-[12px] flex gap-[8px]`). Corpo:
  - sem ciclo: `div rounded-apsen bg-apsen-bg p-[18px] text-center text-[13px] text-apsen-muted` "Selecione um ciclo para carregar os SKUs.";
  - carregando: mesmo bloco "Carregando SKUs…" [derivado]; erro: `Alert tone="error"` "Não foi possível carregar os SKUs." + `Button outline sm` "Tentar novamente";
  - vazio: `p-[16px] text-center text-apsen-muted` "Nenhum SKU para este ciclo.";
  - grupos `SkuGrupo`: título `mb-[8px] border-b-2 pt-[6px] pb-[8px] text-[10.5px] font-bold uppercase tracking-[.07em]` na cor da família (borda = cor/12,5%, protótipo `cor+'20'`) "{familia} ({n} SKUs)"; itens `CheckboxCard` (fundo branco, raio 6px, `px-[12px] py-[9px] mb-[5px]`, check `accent-apsen-orange size-[15px]`): título `nome` (13px/500), subtítulo `codigo` (11.5px muted), `aside` "{dias}d estoque" (`text-[11px] font-semibold whitespace-nowrap`, vermelho/amarelo/verde por `nivelEstoque`; oculto se `dias` for 0).
  - Trocar de ciclo limpa os SKUs marcados.
- **03 Drivers Identificados** (só com ≥ 1 SKU): `CardTitle` com `small` "Pré-selecionados pela IA · desmarque se não aplicável"; `Alert tone="info"` "Drivers aprovados relevantes para os SKUs selecionados. Desmarque os que não devem influenciar esta análise."; itens `CheckboxCard` fundo `bg-apsen-bg`, raio 8px, `px-[12px] py-[10px] mb-[6px]` (se o `CheckboxCard` não tiver variante de fundo, adicionar `surface?: 'white' | 'muted'`): título "{tipo} <span muted 11.5px>{produto}</span>", subtítulo `params` (11.5px muted, `mt-[2px]`), `aside` "⚡ {intensidade}" `text-[11px] font-semibold text-apsen-orange`. Todos marcados ao carregar; a seleção não é refeita quando os SKUs mudam [mapeamento]. Vazio: "Nenhum driver aprovado encontrado." (`p-[10px] text-[13px] text-apsen-muted`). Mais de 50 aprovados: nota "+{n} drivers aprovados não exibidos" [derivado].
- **04 Modelo Estatístico**: `ModeSelector accent="orange"` `aria-label="Modo de escolha do modelo"` com 🤖 "Automático" / "IA escolhe o modelo" (padrão), 📋 "Guiado" / "Escolha com descrição", ⚙️ "Avançado" / "Parâmetros técnicos".
  - Automático: `Alert tone="success"` "A IA selecionará automaticamente o modelo mais adequado e justificará a escolha no resultado."
  - Guiado: `grid grid-cols-3 gap-[10px] max-[800px]:grid-cols-2 max-[560px]:grid-cols-1` de `SelectableCard` (`icon`, `title=nome`, `description=desc`, `tag`, `selected`); padrão `sarimax`; `role="radiogroup"` `aria-label="Modelo guiado"`.
  - Avançado (`FormGrid columns={2}`): "Modelo" `*` `FormSelect` (sarimax "SARIMAX", prophet "Prophet (Meta)", regressao_causal "Regressão Causal", holt_winters "Holt-Winters", media_movel "Média Móvel", ensemble "Ensemble"); "Horizonte (meses)" `TextInput type="number" min=1 max=24 step=1` padrão "3" (fora de 1–24 → erro "Informe um horizonte entre 1 e 24 meses." [derivado], §7.4); parâmetros `full` conforme o modelo — SARIMAX: rótulo "Ordem ARIMA (p,d,q) e Sazonal (P,D,Q,s)" + `grid grid-cols-7 gap-[6px] mt-[6px]` com 7 `number` (rótulo 10px muted centralizado p, d, q, P, D, Q, s; padrão 1; `min=0 max=12`; `px-[2px] py-[6px] text-center`); Prophet: "Sazonalidades" + checkboxes Anual, Semanal, Mensal, Feriados BR (marcados, `accent-apsen-orange`, 12.5px); Ensemble: "Modelos a combinar" + SARIMAX, Prophet, Reg. Causal (marcados); demais modelos sem parâmetros. [mapeamento] O protótipo só mostra os parâmetros depois de trocar o modelo; o app mostra os do modelo selecionado desde o início.
- Ações (`mt` com `border-t border-apsen-border pt-[14px]`, alinhadas à direita): `Button ghost` "Cancelar" (→ `/analises`) · `Button orange sm` com ícone de pulso (L2981) "Executar Análise" ("Executando…" e desabilitado durante a execução).
- Validação ao executar (RN-04): toast + `error` no campo (texto sem "⚠️ ") + foco: Título (`TextInput`), Ciclo (`FormSelect`), SKUs (foco no primeiro checkbox; erro "Selecione ao menos um SKU." abaixo dos botões do card 02).
- Alterações não salvas: `useUnsavedChangesGuard(dirty)` (onda 0/1 ou criado na spec de planos) ao sair por Cancelar, "← Voltar", breadcrumb ou fechar a aba; desligado após executar com sucesso.

### 3.3 `/analises/[id]` — `AnaliseViewScreen`

- Rota `src/app/analises/[id]/page.tsx`: `params: Promise<{ id: string }>` → `<AnaliseViewScreen id={id} />`; `metadata = { title: 'Análise' }`; `loading.tsx` (skeleton das seções + coluna de 360 px), `error.tsx`, `not-found.tsx` (`ErrorState` 🔍 "Análise não encontrada" + `ButtonLink outline` "← Voltar para Análises"); `notFound()` quando o caso de uso lança `NotFoundError`.
- `Breadcrumb items=[{ label: 'Análises', href: '/analises' }, { label: titulo }]` (sem botão Voltar, fiel).
- Cabeçalho `mb-[16px] flex flex-wrap items-center justify-between gap-[10px]`: `h1.page-title` título e `p.page-sub` "Ciclo: <strong>{ciclo}</strong> · Modelo: <strong>{modelo}</strong> · {n} SKU(s) · {criada}"; à direita `flex items-center gap-[8px]`: `AnaliseStatusPill size="lg"`, `Button ghost sm` (ícone disquete L2999) "Salvar" ("Salvando…"), `Button ghost sm` (ícone documento L3001) "Exportar PDF" — `disabled` em rascunho com `disabled:opacity-40` (protótipo `.4`) e `title` "Salve antes de emitir o relatório." [derivado].
- Grid `grid grid-cols-[1fr_360px] items-start gap-[16px] max-[1100px]:grid-cols-1` [derivado no breakpoint].
- Coluna principal, `Section variant="detail"` na ordem:
  1. "📄 Sumário Executivo": `RichText` (`text-[13.5px] leading-[1.75]`) a partir de `sumarioSegmentos` (só `<strong>` é interpretado; nada de `dangerouslySetInnerHTML`). Vazio → "—".
  2. "📊 Impacto por Driver": `ImpactRow` por item (feature): `flex items-center gap-[10px] border-b border-apsen-bg py-[6px] text-[13px] last:border-b-0`; rótulo `flex-1 text-[12.5px]` "{tipo} <span className='text-[11.5px] text-apsen-muted'>{id}</span>"; barra `h-[6px] shrink-0 rounded-[3px]` largura `min(|impacto|×5, 120)px` (estilo inline de largura; cor por classe `bg-apsen-green`/`bg-apsen-red`), `aria-hidden`; valor `min-w-[44px] text-right text-[13px] font-bold` verde/vermelho "+14%" / "-5%"; confiança `min-w-[52px] text-right text-[11.5px] text-apsen-muted` "88% conf.".
  3. "📈 Previsão: com vs. sem drivers": resumo `mb-[14px] text-[12.5px] leading-[1.6] text-apsen-muted` "No horizonte de 12 meses, o efeito combinado dos drivers representa <strong className={verde|vermelho}>{±N} unidades ({±P}%)</strong> em relação ao baseline sem drivers."; legenda `mb-[8px] text-[12px] text-apsen-muted` (traço `inline-block h-[3px] w-[14px] rounded-[2px] bg-apsen-blue mr-[5px] align-middle` "Com drivers" e traço `w-[14px] border-t-2 border-dashed border-apsen-muted-2 mr-[5px]` "Sem drivers (baseline)"); contêiner `relative mb-[18px] h-[250px]` com `ComparacaoChart` (`next/dynamic`, `ssr: false`; enquanto carrega, bloco vazio de 250 px); `ComparacaoTable` (`overflow-x-auto`, `table w-full border-collapse text-[12.5px]`, `caption sr-only` "Previsão mês a mês com e sem drivers"): cabeçalho `border-b-2 border-apsen-border`, `th` `px-[10px] py-[8px] text-[11px] uppercase tracking-[.05em]` Mês (esq., muted), Sem drivers (dir., muted), Com drivers (dir., azul), Δ un. (dir., muted), Δ % (dir., muted); linhas `border-b border-apsen-bg`, `td px-[10px] py-[7px]`: mês 500, sem muted, com 600 azul, Δ un. verde/vermelho, Δ % 600 verde/vermelho; linha Total `border-t-2 border-apsen-border font-bold`, `py-[9px]`.
  4. "📋 Justificativas": `NumberedList` (feature, `ol`): itens `border-b border-apsen-bg py-[7px] text-[13px] leading-[1.6] last:border-b-0` com número `mr-[6px] font-bold text-apsen-orange` "1.".
  5. "⚙️ Modelo Utilizado": `text-[13px] leading-[1.7]` `modelo_info` (ou "—").
  6. "💬 Interações com IA Documentadas" (só com `historico_ia`): por item `border-b border-apsen-bg py-[10px]`: "PERGUNTA {n}" `mb-[4px] text-[11px] font-bold uppercase text-apsen-muted`; pergunta `mb-[6px] text-[13px] italic text-apsen-slate` entre aspas; resposta `rounded-[6px] bg-apsen-bg px-[12px] py-[8px] text-[12.5px] text-apsen-muted`.
- Coluna lateral `sticky top-[16px]` (estática abaixo de 1100 px): rótulo `mb-[8px] text-[11px] font-bold uppercase tracking-[.06em] text-apsen-muted` "Chat · ApsenPLPEngine"; `ChatPanel` (feature, `next/dynamic`, `ssr: false`):
  - caixa `flex h-[420px] flex-col overflow-hidden rounded-[10px] border border-apsen-border bg-apsen-white`;
  - mensagens `flex-1 overflow-y-auto p-[14px] flex flex-col gap-[8px]`, `role="log"` `aria-live="polite"` `aria-label="Conversa com a IA"`, rola para o fim a cada mensagem; IA `self-start max-w-[82%] rounded-[12px_12px_12px_3px] border border-apsen-border bg-apsen-bg px-[13px] py-[9px] text-[13px] leading-[1.6]`; usuário `self-end max-w-[82%] rounded-[12px_12px_3px_12px] bg-apsen-blue px-[13px] py-[9px] text-[13px] leading-[1.6] text-white`; carregando = bolha IA `text-apsen-muted` "⟳ Analisando...";
  - sem mensagens: bolha IA de boas-vindas — inicial "Pronto para ajudar. Posso **explicar resultados**, **ajustar parâmetros** ou comparar cenários."; após "Limpar", "Chat limpo. Como posso ajudar?" [mapeamento: o protótipo apaga a boas-vindas ao abrir uma análise sem histórico];
  - entrada `flex items-end gap-[8px] border-t border-apsen-border p-[10px]`: `textarea rows=1` `aria-label="Pergunte à IA"` placeholder "Pergunte à IA..." (`flex-1 resize-none rounded-apsen border border-apsen-border px-[11px] py-[8px] text-[13px] leading-[1.5] field-focus`), altura automática até 100 px; Enter envia, Shift+Enter quebra; texto vazio não envia; desabilitado enquanto responde; botão `size-[34px] rounded-apsen bg-apsen-blue text-white` `aria-label="Enviar"` (ícone avião L3058);
  - abaixo `mt-[8px] flex gap-[6px]`: `Button ghost sm className="flex-1 text-[11.5px]"` "💾 Salvar interação" · `Button ghost sm className="text-[11.5px]"` "Limpar".
- `PdfExportModal` (`next/dynamic`): `Modal size="md" title="Exportar Relatório PDF"`; corpo `p mb-[12px] text-[13px] leading-[1.55] text-apsen-muted` "Selecione as seções a incluir no relatório." + `flex flex-col gap-[8px]` de `label` (`flex items-center gap-[8px] text-[13px]`) com checkbox `accent-apsen-orange`: Sumário executivo ✓, Impacto por driver ✓, Justificativas ✓, Modelo utilizado ✓, Interações com IA ☐ (estado local); rodapé "Cancelar" (ghost sm) · `Button orange sm` "Baixar PDF".
- Fluxos:
  - Salvar → `salvar` → toast "✅ Análise salva! PDF disponível." (o detalhe e a lista são invalidados; o botão PDF habilita).
  - Exportar PDF → `exportarPdf` (status `relatorio`) → abre o modal; "Baixar PDF" → toast "📄 Relatório PDF gerado!" e fecha; Cancelar só fecha (o status já é `relatorio`, fiel).
  - Chat enviar → mensagem do usuário, "⟳ Analisando...", `responderChat` (espera 1,4 s) → resposta. Salvar interação → `ultimaInteracao(mensagens)`; `null` → toast "⚠️ Nenhuma interação completa."; senão `documentarInteracao` → toast "✅ Interação documentada." e a seção 6 aparece. Limpar → mensagens vazias + boas-vindas "Chat limpo…". As mensagens do chat ficam em estado local (perdem-se ao sair, fiel).
  - Erro HTTP em qualquer escrita: toast "⚠️ Não foi possível salvar. Tente novamente." [derivado].

### 3.4 Gráfico `ComparacaoChart`

`react-chartjs-2` `Line` com `buildComparacaoChart(comparacao, cores)` (função pura em `features/analises/chart/buildComparacaoChart.ts`):

- registra `CategoryScale`, `LinearScale`, `PointElement`, `LineElement`, `Filler`, `Tooltip` (sem `Legend`);
- `labels` Jan…Dez; datasets "Com drivers" (`borderColor` azul, `backgroundColor` chart-fill, `borderWidth 2.5`, `tension .35`, `pointRadius 3`, `pointHoverRadius 5`, `fill true`) e "Sem drivers" (`borderColor` muted-2, transparente, `borderWidth 2`, `borderDash [6, 4]`, `tension .35`, `pointRadius 2`, `pointHoverRadius 4`, `fill false`);
- `options`: `responsive`, `maintainAspectRatio false`, `layout.padding { top 18, bottom 6 }`, `interaction { mode 'index', intersect false }`, `plugins.legend.display false`, tooltip `label` " {dataset}: {y pt-BR} un", `afterBody` `['', '  Δ drivers: {±d pt-BR} un ({±p}%)']` com ≥ 2 itens; `scales.x` sem grid, ticks 11px e cor muted; `scales.y` ticks 10px `v >= 1000 ? Math.round(v/1000)+'k' : v`, grid chart-grid;
- plugin `valLabels` (`afterDatasetsDraw`): escreve `formatarMilhar(valor)` acima (dataset 0, `700 9.5px Inter, sans-serif`, azul, dy −8) e abaixo (dataset 1, `400`, muted-2, dy +14) de cada ponto;
- `formatarMilhar(v)`: `v >= 1000` → `(v/1000).toFixed(1)` sem ",0" final, com vírgula decimal ("40,7k", "41k"); senão `String(v)`. [mapeamento] O protótipo usa ponto decimal ("40.7k", "+13.5%"); o app usa o formato pt-BR em gráfico, tabela e resumo.
- `cores` vêm de `useCssColorTokens(['--color-apsen-blue', '--color-apsen-muted-2', '--color-apsen-muted', '--color-apsen-chart-fill', '--color-apsen-chart-grid'])` (hook em `src/presentation/hooks/`): lê `getComputedStyle(document.documentElement)` e relê quando a classe de `<html>` muda (`MutationObserver` em `class`), então o gráfico redesenha no tema escuro.
- `role="img"` no `canvas` com `aria-label` "Gráfico de previsão com e sem drivers; detalhes na tabela abaixo".

### Estados (resumo)

| Tela    | Carregando                                                                                          | Erro                                                                                                 | Vazio                           |
| ------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------- |
| Lista   | `loading.tsx` skeleton (header, filtros, 3 cards `h-[64px]`); `LoadingState` "Carregando análises…" | `ErrorState` + "Tentar novamente"                                                                    | 🔬 "Nenhuma análise encontrada" |
| Nova    | `loading.tsx` skeleton dos 4 cards; ciclos carregando: select desabilitado "Carregando ciclos…"     | `ErrorState` se ciclos/modelos/config falharem; erros por card (SKUs/drivers) com "Tentar novamente" | textos do card 02/03            |
| Detalhe | `loading.tsx` skeleton; `LoadingState` "Carregando análise…"                                        | `ErrorState`; `not-found` para id inexistente                                                        | "—" em sumário/modelo sem texto |

## 4. Contratos de API consumidos

Base `{NEXT_PUBLIC_API_URL}`.

| Uso                           | Requisição                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| Lista                         | `GET /analises?q=bari&status=salva&_page=1&_limit=10` → array + `X-Total-Count`                      |
| Total (badge)                 | `GET /analises?_limit=1`                                                                             |
| Detalhe                       | `GET /analises/:id` (`404` → `NotFoundError('Análise', id)`)                                         |
| Próximo código                | `GET /analises?_sort=codigo&_order=desc&_limit=1`                                                    |
| Criar                         | `POST /analises` → `201`                                                                             |
| Salvar / exportar / interação | `PATCH /analises/:id` `{ status, salvo_em }` · `{ status: "relatorio" }` · `{ historico_ia: [...] }` |
| SKUs do ciclo                 | `GET /skusCiclo/:ciclo` (`404` → lista vazia)                                                        |
| Modelos guiados               | `GET /modelosGuiados`                                                                                |
| Resultado mock e chat         | `GET /config` (usa só `analiseMockResultado` e `chatRespostas`)                                      |
| Drivers aprovados             | via `AprovacaoRepository`: `GET /aprovacoes?status=aprovado&_page=1&_limit=50`                       |
| Ciclos                        | via `CicloRepository`: `GET /ciclos`                                                                 |

Exemplo de análise (`GET /analises/ANL-001`):

```json
{
  "id": "ANL-001",
  "codigo": "ANL-001",
  "titulo": "Impacto campanha TV Inverno — Baricitinibe",
  "ciclo": "PLP-2026-07",
  "tipo": "Impacto de drivers em SKUs específicos",
  "skus": ["SKU-00312", "SKU-00313"],
  "modelo": "SARIMAX",
  "status": "salva",
  "criada": "20/06/2026",
  "sumario": "A análise identificou impacto positivo de <strong>+18% no sell-out</strong> de Baricitinibe…",
  "drivers_impacto": [
    { "id": "DRV-2026-034", "tipo": "💻 Digital", "impacto": 14, "dir": "up", "conf": 88 }
  ],
  "justificativas": ["Driver de campanha digital tem lag histórico de +1 mês em imunologia."],
  "modelo_info": "SARIMAX (p=1,d=1,q=1)(P=1,D=1,Q=1,s=12). AIC=847.3, MAPE=8.4%.",
  "historico_ia": [],
  "salvo_em": "20/06/2026 15:42"
}
```

Corpo do `POST` (nova análise; campos extras `comentarios`, `drivers`, `config_modelo`):

```json
{
  "id": "9a7c…-uuid",
  "codigo": "ANL-003",
  "titulo": "Teste Cardio",
  "ciclo": "PLP-2026-07",
  "tipo": "Impacto de drivers em SKUs específicos",
  "skus": ["SKU-00058"],
  "modelo": "Automático → SARIMAX",
  "status": "rascunho",
  "criada": "27/10/2026",
  "comentarios": "",
  "drivers": ["DRV-2026-032"],
  "config_modelo": {
    "modo": "avancado",
    "modelo": "sarimax",
    "horizonte": 3,
    "parametros": { "p": 1, "d": 1, "q": 1, "P": 1, "D": 1, "Q": 1, "s": 1 }
  },
  "sumario": "…",
  "drivers_impacto": [],
  "justificativas": [],
  "modelo_info": "…",
  "historico_ia": [],
  "salvo_em": null
}
```

(`sumario`, `drivers_impacto`, `justificativas`, `modelo_info` e `modelo` copiados de `config.analiseMockResultado`.)

Schemas Zod (`src/infrastructure/analises/analiseSchemas.ts`):

```ts
const driverImpacto = z.object({
  id: z.string(),
  tipo: z.string(),
  impacto: z.number(),
  dir: z.enum(['up', 'down']),
  conf: z.number(),
});
const interacao = z.object({
  pergunta: z.string(),
  resposta: z.string(),
  ts: z.string().optional(),
});
const configModelo = z.object({
  modo: z.enum(['auto', 'guiado', 'avancado']),
  modelo: z.string().optional(),
  horizonte: z.number().int().optional(),
  parametros: z.record(z.string(), z.union([z.number(), z.boolean()])).optional(),
});
export const analiseDtoSchema = z.object({
  id: z.string().min(1),
  codigo: z.string().optional(),
  titulo: z.string(),
  ciclo: z.string(),
  tipo: z.string(),
  skus: z.array(z.string()),
  modelo: z.string(),
  status: z.enum(['rascunho', 'salva', 'relatorio']),
  criada: z.string(),
  comentarios: z.string().optional(),
  drivers: z.array(z.string()).optional(),
  config_modelo: configModelo.optional(),
  sumario: z.string().default(''),
  drivers_impacto: z.array(driverImpacto).default([]),
  justificativas: z.array(z.string()).default([]),
  modelo_info: z.string().default(''),
  historico_ia: z.array(interacao).default([]),
  salvo_em: z.string().nullable().default(null),
});
export const skusCicloDtoSchema = z.object({
  id: z.string(),
  skus: z.array(
    z.object({
      codigo: z.string(),
      nome: z.string(),
      familia: z.string(),
      dias: z.number().default(0),
    }),
  ),
});
export const modeloGuiadoDtoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  icon: z.string(),
  desc: z.string(),
  tag: z.string(),
});
export const analiseConfigDtoSchema = z.object({
  analiseMockResultado: z.object({
    modelo: z.string(),
    sumario: z.string(),
    drivers_impacto: z.array(driverImpacto),
    justificativas: z.array(z.string()),
    modelo_info: z.string(),
  }),
  chatRespostas: z.array(z.object({ gatilhos: z.array(z.string()), resposta: z.string() })).min(1),
});
```

Erros: schema inválido, `X-Total-Count` ausente ou `chatRespostas` sem regra padrão (`gatilhos: []`) → `InvalidResponseError`; `404` em `/analises/:id` → `NotFoundError`; `404` em `/skusCiclo/:id` → `[]`; `5xx`/rede → `HttpError`/`NetworkError`.

## 5. Domínio (`src/domain`)

`src/domain/analises/`:

- `Analise.ts`
  ```ts
  export type AnaliseStatus = 'rascunho' | 'salva' | 'relatorio';
  export interface DriverImpacto {
    id: string;
    tipo: string;
    impacto: number;
    dir: 'up' | 'down';
    conf: number;
  }
  export interface InteracaoIa {
    pergunta: string;
    resposta: string;
    ts: string | null;
  }
  export type ModoModelo = 'auto' | 'guiado' | 'avancado';
  export interface ConfigModelo {
    modo: ModoModelo;
    modelo?: string;
    horizonte?: number;
    parametros?: Record<string, number | boolean>;
  }
  export interface Analise {
    id: string;
    codigo: string;
    titulo: string;
    ciclo: string;
    tipo: string;
    skus: string[];
    modelo: string;
    status: AnaliseStatus;
    criada: string;
    comentarios: string;
    drivers: string[];
    configModelo: ConfigModelo | null;
    sumario: string;
    driversImpacto: DriverImpacto[];
    justificativas: string[];
    modeloInfo: string;
    historicoIa: InteracaoIa[];
    salvoEm: string | null;
  }
  export interface SkuCiclo {
    codigo: string;
    nome: string;
    familia: string;
    dias: number;
  }
  export interface ModeloGuiado {
    id: string;
    nome: string;
    icon: string;
    desc: string;
    tag: string;
  }
  export interface ResultadoMock {
    modelo: string;
    sumario: string;
    driversImpacto: DriverImpacto[];
    justificativas: string[];
    modeloInfo: string;
  }
  export interface RegraChat {
    gatilhos: string[];
    resposta: string;
  }
  export interface MensagemChat {
    papel: 'usuario' | 'ia';
    texto: string;
  }
  export interface NovaAnaliseForm {
    titulo: string;
    ciclo: string;
    tipo: string;
    comentarios: string;
    skus: string[];
    drivers: string[];
    configModelo: ConfigModelo;
    horizonteTexto: string;
  }
  ```
- `analiseConstants.ts`: `ANALISE_STATUS_LABEL` (📝 Rascunho, ✅ Salva, 📄 Relatório), `ANALISE_STATUS_FILTRO` (… "📄 Relatório emitido"), `ANALISE_TIPOS` (6), `MODELOS_AVANCADOS` (6, value/label), `PARAMS_SARIMAX` (`p d q P D Q s`), `SAZONALIDADES_PROPHET` (4), `MODELOS_ENSEMBLE` (3), `PDF_SECOES` (5 com `marcada`), `ANALISES_POR_PAGINA = 10`, `MESES` (Jan…Dez), `CRESCIMENTO` (`[0, .03, .06, .09, .13, .17, .21, .25, .22, .19, .15, .10]`), `ESPERA_EXECUCAO_MS = 2000`, `ESPERA_CHAT_MS = 1400`.
- `analiseRules.ts` (puro):
  - `proximoCodigoAnalise(maiorCodigo)` — `ANL-` + (sufixo + 1), 3 dígitos; `null` → `ANL-001`.
  - `validarNovaAnalise(form)` — nesta ordem: `AnaliseInvalidaError('⚠️ Informe o título.', 'titulo')` (após `trim`), `('⚠️ Selecione o ciclo.', 'ciclo')`, `('⚠️ Selecione ao menos um SKU.', 'skus')`; no modo avançado, horizonte inteiro fora de 1–24 → `('⚠️ Informe um horizonte entre 1 e 24 meses.', 'horizonte')` [derivado].
  - `novaAnalise(form, resultado, id, codigo, hoje)` — `status 'rascunho'`, `criada` dd/mm/aaaa, `modelo = resultado.modelo`, cópia do resultado, `historicoIa []`, `salvoEm null`, `tipo` = form ou "Análise ad hoc" se vazio.
  - `statusAoSalvar(status)` — `relatorio` → `relatorio`; demais → `salva` (decisão 16).
  - `podeExportarPdf(status)` — `status !== 'rascunho'`; `exportarPdf(status)` lança `AnaliseInvalidaError('⚠️ Salve antes de emitir o relatório.')` se não puder.
  - `agruparPorFamilia(skus)` — grupos na ordem da primeira aparição.
  - `nivelEstoque(dias)` — `< 30` `critico`, `< 60` `atencao`, senão `ok`; `0` → `null` (não exibe).
  - `rotuloCiclo(ciclo, ativoId)` — `"{id} · {descricao sem 'Planejamento '}"` + `" (ativo)"` se ativo (ex.: "PLP-2026-07 · Julho 2026 (ativo)").
  - `responderChat(pergunta, regras, contexto: { ciclo: string; modelo: string })` — `pergunta.toLowerCase()`; primeira regra com algum gatilho contido; senão a regra com `gatilhos: []`, trocando `{ciclo}` e `{modelo}`.
  - `ultimaInteracao(mensagens): { pergunta; resposta } | null` — última mensagem do usuário e última da IA; falta qualquer uma → `null`.
  - `mensagensDoHistorico(historico)` — `[usuario, ia]` por item.
  - `comparacaoComVsSemDrivers(analise): Comparacao` — `seed = codigo.charCodeAt(codigo.length - 1)`; `impactoTotal = soma(impacto) || 14`; `base = 40000 + seed * 700`; `sem[i] = round(base * (1 + CRESCIMENTO[i]) * (1 + sin(i * .5 + seed * .3) * .04))`; `com[i] = round(sem[i] * (1 + impactoTotal / 100 * clamp((i + 3) / 8, .3, 1)))`; `linhas[i] = { mes, sem, com, deltaUn, deltaPct }`; `total = { sem, com, deltaUn, deltaPct }`; `deltaPct = sem === 0 ? null : round1(delta / sem * 100)`.
  - `larguraBarraImpacto(impacto)` — `min(|impacto| * 5, 120)`.
  - `segmentosRichText(html)` — divide em `{ texto, forte }` reconhecendo só `<strong>…</strong>`; demais tags removidas como texto.
- `analiseDatas.ts`: `dataBr(date)` (dd/mm/aaaa local) e `dataHoraBr(date)` ("dd/mm/aaaa hh:mm", formato do `db.json`).
- Portas: `AnaliseRepository { listPage({ busca, status, pagina, tamanho }): Promise<Pagina<Analise>>; count(filtro?: { status?: AnaliseStatus }): Promise<number>; get(id); maiorCodigo(); create(a); update(id, patch) }`; `AnaliseApoioRepository { skusDoCiclo(ciclo): Promise<SkuCiclo[]>; modelosGuiados(): Promise<ModeloGuiado[]>; configuracao(): Promise<{ resultado: ResultadoMock; regrasChat: RegraChat[] }> }`.
- `AnaliseInvalidaError extends DomainError` (`campo?: 'titulo' | 'ciclo' | 'skus' | 'horizonte'`).

## 6. Aplicação (`src/application`)

`src/application/analises/` (`esperar: (ms: number) => Promise<void>` e `now`/`gerarId` vêm do container):

| Caso de uso            | Construtor                                                                 | Entrada → saída                                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ListAnalises`         | `AnaliseRepository`                                                        | `{ busca, status, pagina }` → `{ itens: AnaliseCardOutput[]; total; pagina; tamanho }` (`AnaliseCardOutput { id, titulo, status, statusLabel, ciclo, skusCount, modelo, criada }`) |
| `ContarAnalises`       | `AnaliseRepository`                                                        | → `number`                                                                                                                                                                         |
| `GetAnalise`           | `AnaliseRepository`                                                        | `id` → `AnaliseDetailOutput` (campos da análise + `metaSkus`, `podeExportarPdf`, `sumarioSegmentos`, `impactos[{ …, largura, sinal }]`, `comparacao`, `historico`)                 |
| `GetNovaAnaliseOpcoes` | `CicloRepository`, `AnaliseApoioRepository`                                | → `{ ciclos: { value, label }[]; modelosGuiados }`                                                                                                                                 |
| `ListSkusDoCiclo`      | `AnaliseApoioRepository`                                                   | `ciclo` → `{ familia, skus: { codigo, nome, dias, nivelEstoque }[] }[]`                                                                                                            |
| `ListDriversSugeridos` | `AprovacaoRepository`                                                      | → `{ itens: { id, tipo, produto, params, intensidade }[]; total }` (status aprovado, página 1, 50)                                                                                 |
| `ExecutarAnalise`      | `AnaliseRepository`, `AnaliseApoioRepository`, `now`, `gerarId`, `esperar` | `NovaAnaliseForm` → `{ id }`: valida; `Promise.all([configuracao(), maiorCodigo(), esperar(2000)])`; `create(novaAnalise(...))`                                                    |
| `SalvarAnalise`        | `AnaliseRepository`, `now`                                                 | `id` → `get`; `update(id, { status: statusAoSalvar(atual), salvoEm: dataHoraBr(now()) })`                                                                                          |
| `ExportarPdfAnalise`   | `AnaliseRepository`                                                        | `id` → `get`; `exportarPdf(status)`; `update(id, { status: 'relatorio' })`                                                                                                         |
| `DocumentarInteracao`  | `AnaliseRepository`, `now`                                                 | `{ id, pergunta, resposta }` → `get`; `update(id, { historicoIa: [...atual, { pergunta, resposta, ts: dataHoraBr(now()) }] })`                                                     |
| `ResponderChat`        | `AnaliseApoioRepository`, `esperar`                                        | `{ pergunta, ciclo, modelo }` → `string` (`esperar(1400)` + `responderChat`)                                                                                                       |

## 7. Infraestrutura (`src/infrastructure`)

`src/infrastructure/analises/`:

- `analiseSchemas.ts` (§4); `analiseMapper.ts` (snake_case ↔ camelCase; `codigo ?? id`; `comentarios ''`, `drivers []`, `config_modelo` → `configModelo | null`, `ts` ausente → `null`).
- `HttpAnaliseRepository` — `listPage` com `q`, `status`, `_page`, `_limit` (`getPage`); `count` `_limit=1` (com `status` opcional; usado pelo dashboard); `get`/`update` com `encodeURIComponent` e 404 → `NotFoundError('Análise', id)`; `maiorCodigo` `_sort=codigo&_order=desc&_limit=1`; `create` `POST`.
- `HttpAnaliseApoioRepository` — `skusDoCiclo` (`GET skusCiclo/{id}`, `HttpError` 404 → `[]`), `modelosGuiados`, `configuracao` (`GET config` + `analiseConfigDtoSchema`; sem regra padrão → `InvalidResponseError`).

## 8. Apresentação (`src/presentation`)

- `queryKeys.analises = { all, list(input), total(), detail(id), opcoes(), skusCiclo(ciclo), driversSugeridos() }`.
- Hooks `src/presentation/hooks/useAnalises.ts`: `useAnalises(input)` (30 s, `keepPreviousData`), `useTotalAnalises()` (badge), `useAnalise(id)`, `useNovaAnaliseOpcoes()` (5 min), `useSkusDoCiclo(ciclo)` (`enabled: ciclo !== ''`, 5 min), `useDriversSugeridos(enabled)` (30 s), `useExecutarAnaliseMutation`, `useSalvarAnaliseMutation`, `useExportarPdfMutation`, `useDocumentarInteracaoMutation` (invalidam `analises.all` e `dashboard.all`; salvar/exportar atualizam o `status` do detalhe em cache de forma otimista, com rollback), `useResponderChatMutation`.
- `useCssColorTokens` (`src/presentation/hooks/useCssColorTokens.ts`), `useDebouncedValue` e `useUnsavedChangesGuard` (criados pela spec de planos ou pela onda 0/1 — não duplicar).
- `UseCases.analises = { list, contar, get, opcoes, skusDoCiclo, driversSugeridos, executar, salvar, exportarPdf, documentarInteracao, responderChat }` + stubs em `createFakeUseCases`.
- `createContainer`: `HttpAnaliseRepository` (instância única, reutilizada pelo dashboard), `HttpAnaliseApoioRepository`, `AprovacaoRepository`/`CicloRepository` da onda 3 (mesmas instâncias), `esperar = (ms) => new Promise((r) => setTimeout(r, ms))`, `now`, `gerarId` (sobrescrevíveis em `ContainerOverrides`).
- Feature `src/presentation/features/analises/`: `AnalisesScreen.tsx`, `NovaAnaliseScreen.tsx`, `AnaliseViewScreen.tsx`, `analisesUrl.ts`, `components/{AnalysisCard,AnaliseStatusPill,SkusCard,SkuGrupo,DriversCard,ModeloCard,ParametrosAvancados,ImpactRow,ComparacaoResumo,ComparacaoTable,NumberedList,InteracoesDocumentadas,RichText,ChatPanel,ChatBubble,PdfExportModal,AnalisesSkeleton}.tsx`, `chart/{ComparacaoChart.tsx,buildComparacaoChart.ts,formatarMilhar.ts}`, `familiaTom.ts` (mesmas cores do `FAMILIA_TOM` da spec de planos — importar de lá ou mover para `presentation/format` se ambos usarem). Estado do formulário em `useNovaAnaliseForm` (`useReducer`).
- Rotas `routes.ts`: `ANALISES_ROUTE`, `NOVA_ANALISE_ROUTE = '/analises/nova'`, `analiseRoute(id)`.

### Dependências novas (justificativa: ARQUITETURA §3)

- `chart.js` `4.5.1` e `react-chartjs-2` `^5.3.0` (compatível com chart.js 4 e React 19) em `dependencies`. Usados só em `ComparacaoChart`, carregado com `next/dynamic` (`ssr: false`), fora do bundle inicial. Nos testes, `vi.mock('react-chartjs-2')` captura as props do `Line` (jsdom não tem canvas).

### Tokens

| Token                      | Claro (protótipo)         | Escuro [derivado]           | Uso                    |
| -------------------------- | ------------------------- | --------------------------- | ---------------------- |
| `--color-apsen-chart-fill` | `rgba(27, 78, 201, 0.08)` | `rgba(124, 135, 245, 0.14)` | área sob "Com drivers" |
| `--color-apsen-chart-grid` | `rgba(0, 0, 0, 0.04)`     | `rgba(255, 255, 255, 0.06)` | grade do eixo y        |

Criar se a onda 1 não tiver criado (claro e escuro) e documentar no `DESIGN_SPEC.md`. Azul (`#0A13B6`) e cinza (`#8A8A8A`) já são `apsen-blue`/`apsen-muted-2`. Cores de família no card 02: as da spec de planos (`FAMILIA_TOM`).

## 9. Arquivos

### Novos

- `src/domain/analises/{Analise,analiseConstants,analiseRules,analiseDatas,AnaliseRepository,AnaliseApoioRepository,AnaliseInvalidaError}.ts`, `__tests__/{analiseRules,comparacao,chatRules}.test.ts`
- `src/application/analises/{dto,ListAnalises,ContarAnalises,GetAnalise,GetNovaAnaliseOpcoes,ListSkusDoCiclo,ListDriversSugeridos,ExecutarAnalise,SalvarAnalise,ExportarPdfAnalise,DocumentarInteracao,ResponderChat}.ts`, `__tests__/analisesUseCases.test.ts`
- `src/infrastructure/analises/{analiseSchemas,analiseMapper,HttpAnaliseRepository,HttpAnaliseApoioRepository}.ts`, `__tests__/{HttpAnaliseRepository,HttpAnaliseApoioRepository}.test.ts`
- `src/presentation/hooks/{useAnalises,useCssColorTokens}.ts` + testes
- `src/presentation/features/analises/` (§8) e `__tests__/{AnalisesScreen,NovaAnaliseScreen,AnaliseViewScreen,ChatPanel,PdfExportModal,ComparacaoTable,ImpactRow,buildComparacaoChart,formatarMilhar,analisesUrl}.test.tsx|ts`
- `src/app/analises/{page,loading,error}.tsx`, `src/app/analises/nova/{page,loading,error}.tsx`, `src/app/analises/[id]/{page,loading,error,not-found}.tsx`, com `__tests__/page.test.tsx` em cada segmento

### Modificados

- `package.json`/lockfile — `chart.js`, `react-chartjs-2`.
- `queryKeys.ts`, `UseCasesContext.tsx`, `test/renderWithProviders.tsx` — grupo `analises`.
- `src/main/container.ts` (+ teste) — repositórios, `esperar`, casos de uso.
- `routes.ts` (+ teste), `screens.ts` (3 telas, fonte do badge `analises`).
- `src/presentation/components/ui/Card.tsx` (+ teste) — `step`/`stepTone` no `CardTitle`, se faltar; `CheckboxCard` — `surface`, se faltar.
- `globals.css` (+ `globals.test.ts`) e `DESIGN_SPEC.md` — tokens do gráfico, se faltarem.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RN-01 | Lista filtrada e paginada no servidor: `q` (sem diferenciar caixa, decisão 16) e `status`; 10 por página; busca com debounce 300 ms; filtros e página na URL; mudar filtro volta à página 1.                                                                                                                 |
| RN-02 | Opções de ciclo = `/ciclos`, rótulo "{id} · {descrição sem 'Planejamento '}" + " (ativo)" no ciclo ativo (decisão 21).                                                                                                                                                                                       |
| RN-03 | SKUs agrupados por família na ordem de chegada; estoque `< 30` vermelho, `< 60` amarelo, senão verde; `dias` 0 não exibe (RN-ANL-02).                                                                                                                                                                        |
| RN-04 | Executar valida título, ciclo e ≥ 1 SKU, nesta ordem, com os toasts do protótipo; no avançado, horizonte inteiro 1–24.                                                                                                                                                                                       |
| RN-05 | Análise nova: `id` UUID (RN-SEG-03), `codigo` `ANL-nnn` = maior + 1; status `rascunho`; resultado, `modelo` e textos de `config.analiseMockResultado` (decisão 16); grava `skus`, `drivers` marcados, `comentarios` e `config_modelo` (RN-ANL-03, RN-ANL-04). Espera mínima de 2 s antes de concluir (fiel). |
| RN-06 | Salvar: `relatorio` continua `relatorio`, demais viram `salva`; `salvo_em` "dd/mm/aaaa hh:mm" (decisão 16).                                                                                                                                                                                                  |
| RN-07 | PDF só fora de rascunho (botão desabilitado; o caso de uso recusa com "⚠️ Salve antes de emitir o relatório."); exportar grava `relatorio` antes de abrir o modal (RN-ANL-10).                                                                                                                               |
| RN-08 | Comparação determinística: seed = código do último caractere do `codigo`, impacto total = soma dos impactos ou 14, fórmulas do protótipo (L7414–7431); Δ% `null` se o baseline for 0 e a UI mostra "—" (RN-ANL-07).                                                                                          |
| RN-09 | Barra de impacto `min(                                                                                                                                                                                                                                                                                       | impacto | × 5, 120)`px; verde e "+" para`up`, vermelho para `down`. |
| RN-10 | Chat: primeira regra cujo gatilho está contido na pergunta em minúsculas; senão a regra padrão com `{ciclo}`/`{modelo}`; resposta após 1,4 s (RN-ANL-09).                                                                                                                                                    |
| RN-11 | Salvar interação grava a última pergunta e a última resposta (com `ts`) em `historico_ia`; sem as duas, "⚠️ Nenhuma interação completa."                                                                                                                                                                     |
| RN-12 | O sumário só interpreta `<strong>`; o restante é texto (sem HTML arbitrário).                                                                                                                                                                                                                                |
| RN-13 | Badge "Minhas Análises" = total de análises (`X-Total-Count`).                                                                                                                                                                                                                                               |

## 11. Requisitos não funcionais

| Item (§7) | Aplicação                                                                                                                                                                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1       | Lista paginada no servidor (10; sem seletor, < 50), `q` com debounce 300 ms, `status`, estado na URL, `keepPreviousData`, prefetch da próxima página; drivers sugeridos limitados a 50; SKUs por ciclo sob demanda.                                              |
| 7.2       | Três rotas com `loading.tsx` (skeleton) e `error.tsx`; `not-found.tsx` em `[id]`; `next/dynamic` `ssr: false` para gráfico, chat e modal de PDF; guarda antes das queries.                                                                                       |
| 7.3       | `staleTime` 30 s (listas/detalhe) e 5 min (ciclos, modelos, config, SKUs do ciclo); invalida `analises` e `dashboard`; salvar/exportar otimistas com rollback; "Salvando…"/"Executando…" sem duplo envio.                                                        |
| 7.4       | Validação no domínio com mensagens do protótipo, erro no campo e foco no primeiro inválido; `number` com min/max/step; aviso de alterações não salvas na nova análise.                                                                                           |
| 7.5       | `ModeSelector`/`SelectableCard` como `radiogroup`, checkboxes com nome, chat `role="log"` `aria-live`, gráfico com `aria-label` e tabela equivalente com `caption`; coluna lateral empilha abaixo de 1100 px; tabela com scroll horizontal; sem animações novas. |
| 7.6       | Sem `console.*`; ids UUID; sumário sem `dangerouslySetInnerHTML`; o chat não envia dados a serviços externos (mock local).                                                                                                                                       |

## 12. BDD — Cenários de teste unitário

| Cenário                                                                                                                                                         | Arquivo de teste                                                                                                     | Asserção                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 / RN-01 Dado a lista, quando digita "plp" e espera 300 ms e escolhe "✅ Salva", então URL e chamada                                                       | `src/presentation/features/analises/__tests__/AnalisesScreen.test.tsx` (fake timers)                                 | título, subtítulo, `ScreenDesc`; `link` "+ Nova Análise" → `/analises/nova` com `bg-apsen-orange`; `replace` com `busca=plp` depois `status=salva`, sem `pagina`; `list.execute({ busca: 'plp', status: 'salva', pagina: 1 })`                                                                        |
| CA-02 Dado total 1 e 2, quando renderiza, então "análise" e "análises"                                                                                          | `AnalisesScreen.test.tsx`                                                                                            | "1 análise"; "2 análises"                                                                                                                                                                                                                                                                             |
| CA-03 Dado ANL-001, quando renderiza o card, então pill e meta; vazio mostra 🔬                                                                                 | `AnalisesScreen.test.tsx`                                                                                            | `link` "Impacto campanha TV Inverno — Baricitinibe" → `/analises/ANL-001`; "✅ Salva"; "🗓️ PLP-2026-07 · 📦 2 SKU(s) · ⚙️ SARIMAX · 📅 20/06/2026"; "Nenhuma análise encontrada"                                                                                                                      |
| CA-04 / RN-02 Dado ciclos, quando abre a nova análise, então rótulos e cards numerados                                                                          | `NovaAnaliseScreen.test.tsx`, `src/domain/analises/__tests__/analiseRules.test.ts`                                   | opção "PLP-2026-07 · Julho 2026 (ativo)"; pills "01"–"04" `text-apsen-orange`; `rotuloCiclo`                                                                                                                                                                                                          |
| CA-05 / RN-03 Dado o ciclo PLP-2026-07, quando seleciona, então grupos, cores de estoque e botões                                                               | `NovaAnaliseScreen.test.tsx`                                                                                         | "IMUNOLOGIA (2 SKUs)" (texto "Imunologia (2 SKUs)"); "18d estoque" `text-apsen-red`, "45d" `text-apsen-yellow`, "90d" `text-apsen-green`; "✓ Selecionar todos" marca 14; "✗ Limpar" desmarca e esconde o card 03; `skusDoCiclo` vazio → "Nenhum SKU para este ciclo."                                 |
| CA-06 Dado 1 SKU marcado, quando renderiza, então drivers aprovados marcados                                                                                    | `NovaAnaliseScreen.test.tsx`                                                                                         | `heading`/texto "Drivers Identificados"; checkboxes `checked`; desmarcar um remove de `drivers` no `executar`                                                                                                                                                                                         |
| CA-07 Dado o card 04, quando troca de modo, então alerta, 6 cards e parâmetros                                                                                  | `NovaAnaliseScreen.test.tsx`                                                                                         | `radio` "Automático" marcado + alerta; Guiado: `radio` "SARIMAX" marcado, clicar "Prophet" marca; Avançado: horizonte "3", 7 `spinbutton` p…s; trocar para "Prophet (Meta)" mostra 4 checkboxes; "Holt-Winters" sem parâmetros                                                                        |
| CA-08 / RN-04 Dado o form vazio, quando executa, então toasts, erros e foco em ordem; válido, executa e navega                                                  | `NovaAnaliseScreen.test.tsx`                                                                                         | "⚠️ Informe o título." + foco no título; "⚠️ Selecione o ciclo."; "⚠️ Selecione ao menos um SKU."; sucesso: toast "⟳ Executando análise com o ApsenPLPEngine...", `routerMock.push('/analises/{id}')`, toast "✅ Análise executada! Salve para emitir o relatório."                                   |
| RN-05 Dado maior `ANL-002`, config mock e hoje 27/10/2026, quando executa, então cria rascunho com UUID e ANL-003                                               | `src/application/analises/__tests__/analisesUseCases.test.ts`                                                        | `create` com `id` do `gerarId`, `codigo: 'ANL-003'`, `status: 'rascunho'`, `criada: '27/10/2026'`, `modelo: 'Automático → SARIMAX'`, `drivers`, `configModelo`; `esperar(2000)` chamado                                                                                                               |
| CA-09 Dado ANL-002 (relatório), quando abre, então cabeçalho e PDF habilitado; rascunho desabilita                                                              | `AnaliseViewScreen.test.tsx`                                                                                         | `navigation` com "Análises"; meta com `strong` "PLP-2026-06" e "Prophet"; pill "📄 Relatório"; `button` "Exportar PDF" habilitado; rascunho → `disabled`                                                                                                                                              |
| CA-10 Dado ANL-002, quando renderiza, então seções em ordem e interações                                                                                        | `AnaliseViewScreen.test.tsx`                                                                                         | 6 `heading` na ordem; "PERGUNTA 1" e "\"Por que Anlodipino não foi afetado?\""; ANL-001 (sem histórico) não mostra a seção 6                                                                                                                                                                          |
| CA-11 / RN-08 Dado ANL-001 (impactos 14, 6, −5), quando calcula, então seed 49, impacto 15 e fórmula                                                            | `src/domain/analises/__tests__/comparacao.test.ts`                                                                   | `sem[0] === Math.round(74300 * (1 + 0) * (1 + Math.sin(14.7) * 0.04))`; `com[0] === Math.round(sem[0] * (1 + 0.15 * 0.375))`; 12 linhas; total = somas; impactos somando 0 → usa 14; baseline 0 → `deltaPct null`                                                                                     |
| CA-11 Dado a comparação e cores, quando monta o gráfico, então datasets, opções e callbacks do protótipo                                                        | `src/presentation/features/analises/__tests__/buildComparacaoChart.test.ts`, `formatarMilhar.test.ts`                | `borderDash [6, 4]`, `fill`, `tension .35`, `legend.display false`, tooltip " Com drivers: 76.814 un", `afterBody` com "Δ drivers"; tick `41000` → "41k"; `formatarMilhar(40700)` "40,7k", `41000` "41k", `950` "950"                                                                                 |
| CA-11 Dado o tema trocado para escuro, quando a classe do html muda, então as cores são relidas                                                                 | `src/presentation/hooks/__tests__/useCssColorTokens.test.tsx`                                                        | valores lidos de `getComputedStyle` mudam após `document.documentElement.classList.add('dark')`                                                                                                                                                                                                       |
| CA-11 Dado a tabela, quando renderiza, então 12 meses + Total e cores de Δ                                                                                      | `ComparacaoTable.test.tsx`                                                                                           | 13 linhas no `tbody`; Δ positivo `text-apsen-green`; `deltaPct null` → "—"                                                                                                                                                                                                                            |
| CA-12 / RN-06 / RN-07 Dado rascunho, quando salva, então status salva e toast; dado salva, quando exporta, então relatorio e modal; "Baixar PDF" mostra o toast | `AnaliseViewScreen.test.tsx`, `PdfExportModal.test.tsx`, `analisesUseCases.test.ts`                                  | toast "✅ Análise salva! PDF disponível."; `statusAoSalvar('relatorio') === 'relatorio'`; `exportarPdf.execute(id)`; `dialog` "Exportar Relatório PDF" com 4 marcados e "Interações com IA" desmarcado; "📄 Relatório PDF gerado!"; rascunho no caso de uso → "⚠️ Salve antes de emitir o relatório." |
| CA-13 / RN-10 Dado o chat, quando envia "qual o lag?" com Enter, então "⟳ Analisando..." e a resposta de lag                                                    | `src/presentation/features/analises/__tests__/ChatPanel.test.tsx`, `src/domain/analises/__tests__/chatRules.test.ts` | bolha do usuário; `status`/texto "⟳ Analisando..."; resposta "O lag de +1 mês…"; Shift+Enter não envia; "Acurácia" casa com `mape`; pergunta sem gatilho → "Com base nesta análise (ciclo PLP-2026-07, modelo SARIMAX): …"                                                                            |
| CA-13 / RN-11 Dado chat sem resposta, quando salva interação, então "⚠️ Nenhuma interação completa."; com par, documenta                                        | `ChatPanel.test.tsx`, `analiseRules.test.ts`                                                                         | toast; `documentarInteracao.execute({ id, pergunta, resposta })`; "✅ Interação documentada."; `ultimaInteracao` `null` sem IA                                                                                                                                                                        |
| CA-13 Dado ANL-002 com histórico, quando abre, então o chat mostra a pergunta e a resposta; "Limpar" mostra "Chat limpo. Como posso ajudar?"                    | `ChatPanel.test.tsx`                                                                                                 | 2 bolhas iniciais; após Limpar, só a boas-vindas nova; sem histórico, "Pronto para ajudar."                                                                                                                                                                                                           |
| CA-14 Dado `get` com `NotFoundError`, quando renderiza, então `notFound()`; demais estados                                                                      | `AnaliseViewScreen.test.tsx`, `src/app/analises/[id]/__tests__/page.test.tsx`                                        | `notFound` chamado; `not-found.tsx` "Análise não encontrada"; `LoadingState` "Carregando análise…"; erro com "Tentar novamente"; `page` aguarda `params`                                                                                                                                              |
| CA-15 / RN-13 Dado executar concluído, quando invalida, então total recarregado e dashboard invalidado                                                          | `src/presentation/hooks/__tests__/useAnalises.test.tsx`                                                              | `contar.execute` de novo; `invalidateQueries` com `['analises']` e `['dashboard']`; salvar otimista com rollback em erro                                                                                                                                                                              |
| RN-09 Dado impacto −5 e 30, quando calcula a largura, então 25 e 120                                                                                            | `analiseRules.test.ts`, `ImpactRow.test.tsx`                                                                         | `larguraBarraImpacto`; "-5%" `text-apsen-red`, "+14%" `text-apsen-green`, "88% conf."                                                                                                                                                                                                                 |
| RN-12 Dado sumário com `<strong>` e `<script>`, quando segmenta, então só o forte é negrito                                                                     | `analiseRules.test.ts`, `AnaliseViewScreen.test.tsx`                                                                 | segmentos `{ forte: true }`; nenhum elemento `script` no DOM                                                                                                                                                                                                                                          |
| Infra Dado `fetchFn` falso, quando lista/obtém/cria e lê config, então URLs, mapeamento e erros                                                                 | `src/infrastructure/analises/__tests__/HttpAnaliseRepository.test.ts`, `HttpAnaliseApoioRepository.test.ts`          | `…/analises?q=bari&status=salva&_page=1&_limit=10`; `X-Total-Count`; `salvo_em` ausente → `null`; 404 detalhe → `NotFoundError`; 404 `skusCiclo` → `[]`; config sem regra padrão → `InvalidResponseError`                                                                                             |
| Rotas Dado as três páginas, quando renderiza, então `metadata.title` "Análises", "Nova Análise" e "Análise"                                                     | `src/app/analises/**/__tests__/page.test.tsx`                                                                        | títulos e telas                                                                                                                                                                                                                                                                                       |
