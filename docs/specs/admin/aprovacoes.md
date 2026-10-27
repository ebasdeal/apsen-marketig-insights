---
status: IN_PROGRESS
fase: 34
area: admin
feature: aprovacoes
azure-devops-work-item:
---

# Fila de Aprovação e Rejeição

## 1. Overview

Porta a tela `aprovacoes` (`docs/Negócio/di-drivers-v2_84.html` L1811–1887, JS L4092–4286) e o `modal-rejeicao` (L3245–3280) para `/admin/aprovacoes`, com a coleção `aprovacoes` da API local. O planejador filtra os drivers registrados pelas áreas, aprova, rejeita (motivo + justificativa, ambos gravados — ARQUITETURA #15) e reabre decisões que ainda não estão em uso no Data Lake. RN-TIP-05: "A Fila de Aprovação lista os drivers pendentes… permitindo aprovar ou rejeitar. Apenas drivers aprovados são elegíveis para ingestão".

Onda 3, fase provisória 34. Inventário §2.10 e §3 (`modal-rejeicao`).

**Dependências:** as da spec [ciclos](ciclos.md) §1 (inclui `useListSearchParams`, `useDebouncedValue`); da onda 1: `FilterBar`, `Badge size="lg"`, `Button` `success`/`danger`/`dashed`, `ResultSummary`, `Modal`. **Esta spec cria** a variante centralizada do `Pagination` (`layout="centered"`, §8) se a onda 1 não a entregou.

**Decisões [derivado]:**

- Busca textual no servidor com `q=` do json-server (procura em todos os campos de texto); o protótipo procura em id, produto, molécula, registrante e tipo. O resultado é um superconjunto (ex.: casa também `params`).
- "Em uso no Data Lake" vem de `config.APROV_INGERIDOS` (fiel; inclui o DRV-2026-028 rejeitado — INVENTARIO §6 #3).
- A justificativa da rejeição é gravada em `justificativa_rejeicao` e exibida após o motivo ("Motivo: {motivo} — {justificativa}").
- Aprovar, rejeitar e reabrir são otimistas (ARQUITETURA §7.3).

**Perguntas em aberto:**

- PO: §7.1 fixa 10 itens por página; o protótipo usa 5 (`APROV_PER_PAGE`). Adotado 10.
- PO: RN-TIP-05 fala em fila **por ciclo**; o protótipo não tem filtro de ciclo e `aprovacoes` não tem vínculo com `ciclos`.
- PO: aprovar não cria registro em `/ingeridos` (o protótipo só muda o status e mostra "enviado para ingestão"). Mantido fiel.
- PO: o texto do modal diz "O planejador responsável será notificado", o toast diz "Registrante notificado"; nenhuma notificação real existe.
- PO: RN-GOV-02 (trilha de auditoria das decisões) não existe no protótipo; nenhum histórico é gravado além do status.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/admin/aprovacoes` mostra o header "Fila de Aprovação" / "Drivers registrados pelas áreas · histórico completo de decisões" com o `Badge` amarelo grande "{n} pendente(s)" (total de pendentes da coleção), o `ScreenDesc` ✅ (L1824–1826), a barra de filtros, o resumo com "Limpar filtros", a lista de cards e a paginação centralizada.                                                                                                                                     |
| CA-02 | Filtros (grid `1fr auto auto auto auto`): Busca ("Produto, molécula, registrante, código...", debounce 300 ms), Data inicial / Data final (sobre `data_reg`), Tipo de Driver ("Todos os tipos" + 10 labels) e Status ("Todos", "⏳ Pendente", "✅ Aprovado", "❌ Rejeitado"). São aplicados no servidor, ficam na URL (`q`, `ini`, `fim`, `tipo`, `status`, `page`) e qualquer mudança volta para a página 1. "Limpar filtros" zera todos.                                       |
| CA-03 | O resumo mostra "**{n}** registro(s) encontrado(s)" e, se houver pendentes no resultado, " · {p} pendente(s)" em amarelo (totais do servidor).                                                                                                                                                                                                                                                                                                                                   |
| CA-04 | Cada card (L4194–4213) mostra: código mono azul, Badge "Por Molécula" (roxo) ou "Por SKU" (azul), Badge de status (`STATUS_CFG`), "Registrado por {registrante} · {dd/mm/aaaa}"; grade Produto / Molécula · Tipo de Driver · Período ("dd/mm/aaaa → dd/mm/aaaa" ou "Permanente" se o fim é 2099-12-31) · Intensidade (⚡×n na cor de `INT_COR`); faixa "**Parâmetros:** {params}"; card decidido com borda esquerda 3px verde (aprovado) ou vermelha (rejeitado).                |
| CA-05 | Pendente: "✓ Aprovar" (success sm) aprova na hora (otimista), grava `PATCH {status:"aprovado"}` e mostra "✅ {id} aprovado e enviado para ingestão!"; "✕ Rejeitar" (danger sm) abre o modal de rejeição.                                                                                                                                                                                                                                                                         |
| CA-06 | O modal "Rejeitar Item" (via `next/dynamic`) tem o texto de L3253–3255, Motivo `*` (7 opções) e Justificativa detalhada `*` (textarea 3 linhas, "Descreva o motivo da rejeição..."). "Confirmar Rejeição" sem motivo → "⚠️ Selecione o motivo da rejeição."; sem justificativa → "⚠️ Informe a justificativa." (erro no campo + foco + toast); válido grava `status`, `motivo_rejeicao` e `justificativa_rejeicao`, fecha e mostra "❌ {id} rejeitado. Registrante notificado.". |
| CA-07 | Decidido: texto do status colorido, "Motivo: {motivo}" (+ " — {justificativa}" se houver) quando rejeitado e, se o id está em `APROV_INGERIDOS`, a pill "🔒 Em uso no Data Lake — não pode alterar"; senão o botão ghost tracejado "✏️ Alterar decisão", que volta o item para pendente (limpa motivo e justificativa) e mostra "↩️ Decisão reaberta — driver voltou para pendente.".                                                                                            |
| CA-08 | Paginação centralizada (só com mais de uma página): "Página X de Y", ‹ › desabilitados nas pontas, números com janela ±1 + primeira/última + "…"; trocar de página rola o conteúdo para o topo e grava `page` na URL.                                                                                                                                                                                                                                                            |
| CA-09 | O badge do header e o badge "Fila de Aprovação" da sidebar mostram o total de pendentes e mudam logo após aprovar/rejeitar/reabrir. Falha da API desfaz a mudança otimista (card, contadores e badges) e mostra o toast de falha.                                                                                                                                                                                                                                                |
| CA-10 | Estados: skeleton (`loading.tsx` com filtros + 3 cards), dados anteriores mantidos ao paginar/filtrar, erro com "Tentar novamente", vazio 🔍 "Nenhum registro encontrado" / "Tente ajustar os filtros.".                                                                                                                                                                                                                                                                         |

## 3. UX / Fluxo de tela

- Rota `src/app/admin/aprovacoes/page.tsx` (`metadata.title = 'Fila de Aprovação'` → `<AprovacoesScreen />`), `loading.tsx`, `error.tsx`.
- Referências: `DESIGN_SPEC.md` §3.2 `Badge`, §3.14 busca/paginação, §3.15 formulário, §3.16 `Modal`, `FilterBar` da onda 1.

### Blocos

| Bloco     | Componente                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header    | `PageHeader actions={<Badge tone="yellow" size="lg">{n} pendente(s)</Badge>}` (`text-[12.5px] px-[13px] py-[5px]`)                                                                                                                                                                                                                                                                                                                                  |
| Descrição | `ScreenDesc icon="✅"`                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Filtros   | `FilterBar` (card branco, `rounded-apsen-lg`, `px-[16px] py-[14px]`, `mb-[16px]`, grid `1fr auto auto auto auto`, `items-end`, `gap-[10px]`; colapsa em 1 coluna abaixo de 800px): `FormField label="Busca"` + `SearchInput className="max-w-full"`; `FormField label="Data inicial"` (`min-w-[130px]`, `TextInput type="date"`); "Data final"; "Tipo de Driver" (`min-w-[160px]`, `FormSelect` `["", ...APROV_TIPOS]`); "Status" (`min-w-[140px]`) |
| Resumo    | `ResultSummary action={<Button variant="ghost" size="sm">Limpar filtros</Button>}`                                                                                                                                                                                                                                                                                                                                                                  |
| Lista     | `ApprovalCard` por item (`ul`/`li`, `aria-label="Fila de aprovação"`)                                                                                                                                                                                                                                                                                                                                                                               |
| Paginação | `Pagination layout="centered" info="Página {p} de {t}"`                                                                                                                                                                                                                                                                                                                                                                                             |

### `ApprovalCard` (feature; CSS `.aprov-*` L447–462)

- Card `mb-[14px] rounded-apsen-lg border border-apsen-border bg-apsen-white px-[20px] py-[18px] transition-[border] hover:border-apsen-blue-light`; decidido + `border-l-[3px] border-l-apsen-green|red`.
- Header `mb-[14px] flex flex-wrap items-center gap-[10px]`: código `font-mono text-[12.5px] font-bold text-apsen-blue`; `Badge tone="purple"|"blue"` (`text-[11px]`); `Badge` do status; meta `ml-auto text-[12px] text-apsen-muted`.
- Grade `mb-[12px] grid grid-cols-[2fr_1fr_1fr_1fr] gap-[16px] max-[800px]:grid-cols-2`; rótulo `mb-[3px] text-[10.5px] font-bold uppercase tracking-[.06em] text-apsen-muted`; valor `text-[13px] font-medium leading-[1.5] text-apsen-slate` (molécula `text-[11px] text-apsen-muted`; tipo `text-[12.5px]`; intensidade `font-semibold` + cor).
- Parâmetros `mb-[13px] rounded-r-[6px] border-l-[3px] border-apsen-border bg-apsen-bg px-[13px] py-[9px] text-[12.5px] leading-[1.65] text-apsen-slate-3`.
- Ações `flex items-center gap-[8px]`: pendente → `Button success sm` (ícone check L4171) "Aprovar" (`aria-label="Aprovar {id}"`) + `Button danger sm` (ícone x L4175) "Rejeitar" (`aria-label="Rejeitar {id}"`); decidido → `<span className="text-[12px] font-semibold">` na cor do status, motivo `ml-[8px] text-[11.5px] text-apsen-muted`, e em `ml-[12px]` a pill (`inline-flex gap-[4px] rounded-[10px] border border-apsen-border bg-apsen-bg px-[9px] py-[2px] text-[11px] font-semibold text-apsen-muted`) ou `Button ghost sm dashed className="text-[11.5px]"` "✏️ Alterar decisão".

### Modal de rejeição

`RejeicaoModal` `Modal size="md"` "Rejeitar Item": `<p className="text-[13px] leading-[1.55] text-apsen-muted">` (L3253–3255); `FormField label="Motivo" required error` → `FormSelect` com placeholder "Selecione..." e `MOTIVOS_REJEICAO`; `FormField label="Justificativa detalhada" required error` → `TextArea rows={3}`. Rodapé `ghost sm` "Cancelar" · `danger sm` "Confirmar Rejeição" ("Salvando…"). Abrir sempre limpa os campos (L4247–4252).

### Textos

| Situação  | Texto                                                                |
| --------- | -------------------------------------------------------------------- |
| aprovar   | "✅ {id} aprovado e enviado para ingestão!"                          |
| rejeitar  | "❌ {id} rejeitado. Registrante notificado."                         |
| reabrir   | "↩️ Decisão reaberta — driver voltou para pendente."                 |
| validação | "⚠️ Selecione o motivo da rejeição." · "⚠️ Informe a justificativa." |
| vazio     | 🔍 "Nenhum registro encontrado" / "Tente ajustar os filtros."        |
| falha     | "⚠️ Não foi possível salvar as alterações. Tente novamente."         |

## 4. Contratos de API consumidos

| Uso                    | Requisição                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| lista                  | `GET /aprovacoes?_page={p}&_limit=10&_sort=id&_order=desc[&q=][&data_reg_gte=][&data_reg_lte=][&tipo=][&status=]` via `getPage` |
| pendentes do resultado | mesma consulta com `status=pendente&_page=1&_limit=1` (`total`); se o filtro de status é aprovado/rejeitado, 0 sem chamada      |
| pendentes da coleção   | `GET /aprovacoes?status=pendente&_page=1&_limit=1` (`total`)                                                                    |
| em uso                 | `GET /config` → `APROV_INGERIDOS` (`staleTime` 5 min)                                                                           |
| decisão                | `PATCH /aprovacoes/{id}`                                                                                                        |

Item do `db.json`:

```json
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
```

Payloads: aprovar `{ "status": "aprovado" }`; rejeitar `{ "status": "rejeitado", "motivo_rejeicao": "Produto / molécula incorreto", "justificativa_rejeicao": "SKU informado é de outra molécula." }`; reabrir `{ "status": "pendente", "motivo_rejeicao": "", "justificativa_rejeicao": "" }`.

Schemas Zod (`src/infrastructure/aprovacoes/aprovacaoSchema.ts`):

```ts
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const aprovacaoDtoSchema = z.object({
  id: z.string().min(1),
  modo: z.enum(['SKU', 'Molécula']),
  produto: z.string(),
  molecula: z.string(),
  tipo: z.string(),
  cat: z.string(),
  periodo: z.object({ ini: isoDate, fim: isoDate }),
  intensidade: z.number().int().min(1).max(5),
  registrante: z.string(),
  data_reg: isoDate,
  status: z.enum(['pendente', 'aprovado', 'rejeitado']),
  params: z.string(),
  motivo_rejeicao: z.string(),
  justificativa_rejeicao: z.string().optional(),
});
export const aprovConfigSchema = z.object({ APROV_INGERIDOS: z.array(z.string()) }).passthrough();
```

Erros: inválido → `InvalidResponseError`; 404 no `PATCH` → `NotFoundError('Aprovação', id)`; 5xx/rede/timeout → rollback + toast.

## 5. Domínio (`src/domain`)

`src/domain/aprovacoes/`:

- `Aprovacao.ts` — `type AprovStatus = 'pendente' | 'aprovado' | 'rejeitado'`; `interface Aprovacao { id; modo: 'SKU' | 'Molécula'; produto; molecula; tipo; cat; periodo: { ini; fim }; intensidade: 1|2|3|4|5; registrante; dataReg; status; params; motivoRejeicao; justificativaRejeicao }`; `interface AprovFiltro { q; ini; fim; tipo; status: AprovStatus | '' }`; `FILTRO_VAZIO`.
- `vocabulario.ts` — `APROV_TIPOS` (10), `APROV_STATUS`, `MOTIVOS_REJEICAO` (7), `STATUS_CFG` (`label`, `tone`: yellow/green/red), `INT_LABEL`, `INT_TONE` (`['', 'green','green','blue','orange','red']`), `PERMANENTE_FIM = '2099-12-31'` — espelham `config` (teste de paridade); `APROV_PAGE_SIZE = 10` (ARQUITETURA §7.1; difere de `config.APROV_PER_PAGE` = 5 de propósito, fora do teste de paridade).
- `aprovacaoRules.ts`: `formatDataBr(iso)`; `formatPeriodo(p)` (RN-02); `pluralPendentes(n)` → "{n} pendente"/"{n} pendentes"; `resumoTexto(total, pendentes)` → `{ registros: '{n} registro(s) encontrado(s)', pendentes: string | null }`; `validateRejeicao({ motivo, justificativa })` → `Partial<Record<'motivo'|'justificativa', string>>`; `aplicarDecisao(item, decisao)` (usada no otimista e nos testes).
- `AprovacaoRepository.ts` — `listPage(filtro, {page,size})`, `countPendentes(filtro?)`, `listEmUso()`, `update(id, patch)`.
- `RejeicaoValidationError extends DomainError` (`errors`).

## 6. Aplicação (`src/application`)

`src/application/aprovacoes/`:

- `ListAprovacoes(repo)` → `execute({ filtro, page })` → `{ cards: AprovacaoCardDto[]; total; totalPages; pendentesNoResultado }` (`AprovacaoCardDto` com `id`, `modoLabel`, `modoTone`, `statusLabel`, `statusTone`, `meta`, `produto`, `molecula`, `tipo`, `periodo`, `intensidadeLabel`, `intensidadeTone`, `params`, `status`, `motivo`, `justificativa`, `emUso`).
- `CountPendentes(repo)` → `number` (header e sidebar).
- `AprovarAprovacao(repo)` / `RejeitarAprovacao(repo)` (valida, lança `RejeicaoValidationError`) / `ReabrirAprovacao(repo)` (recusa se `emUso`, `DomainError` "Driver em uso no Data Lake — não pode alterar") → `{ toast }`.

## 7. Infraestrutura (`src/infrastructure`)

`src/infrastructure/aprovacoes/{aprovacaoSchema,aprovacaoMapper,HttpAprovacaoRepository}.ts`: converte `AprovFiltro` nas queries do §4 (omitindo vazios), `data_reg` ↔ `dataReg`, `justificativa_rejeicao ?? ''`; `listEmUso` lê `/config` com `aprovConfigSchema`.

## 8. Apresentação (`src/presentation`)

- `queryKeys.aprovacoes = { all: ['aprovacoes'], page: (f, p) => ['aprovacoes','page',f,p], pendentes: () => ['aprovacoes','pendentes'], emUso: () => ['aprovacoes','emUso'] }`.
- Hooks: `useAprovacoesPage(filtro, page)` (`keepPreviousData`, 30 s, prefetch da próxima), `usePendentesCount()` (também alimenta o badge da sidebar da onda 0), `useEmUso()` (5 min), `useAprovarMutation`, `useRejeitarMutation`, `useReabrirMutation` — todos otimistas: `onMutate` aplica `aplicarDecisao` nas páginas em cache e ajusta `pendentes` (±1) e `pendentesNoResultado`; `onError` restaura snapshot + toast de falha; `onSettled` invalida `aprovacoes.all`.
- Filtros na URL via `useListSearchParams` (`q` com `useDebouncedValue` 300 ms; `ini`, `fim`, `tipo`, `status`, `page`); sem store.
- Feature `src/presentation/features/aprovacoes/`: `AprovacoesScreen.tsx`, `components/{AprovacoesFilters,AprovacoesSummary,ApprovalCard,ApprovalCardActions,RejeicaoModal}.tsx`. Troca de página chama `document.querySelector('main')?.scrollTo({ top: 0 })`.
- **UI kit**: `Pagination` ganha `layout?: 'split' | 'centered'` (padrão `split`, comportamento atual). `centered` (`.pag` L381–388): `nav` `flex flex-wrap items-center justify-center gap-[5px] pt-[16px] pb-[2px]`; info `mr-[6px] text-[12px] text-apsen-muted` antes dos botões; botões `h-[30px] min-w-[30px] rounded-full border-0 bg-transparent text-[13px] text-apsen-muted hover:bg-apsen-blue-bg hover:text-apsen-blue`; ativo `bg-apsen-blue font-semibold text-white`; ‹ › `rounded-[6px] px-[8px] text-[14px]` com `disabled:opacity-[.35]`.
- `UseCases.aprovacoes = { list; pendentes; aprovar; rejeitar; reabrir }`; `createContainer` registra `HttpAprovacaoRepository`.

## 9. Arquivos

### Novos

- `src/domain/aprovacoes/{Aprovacao,vocabulario,aprovacaoRules,AprovacaoRepository,errors}.ts` e `__tests__/{aprovacaoRules,vocabulario}.test.ts`
- `src/application/aprovacoes/{ListAprovacoes,CountPendentes,AprovarAprovacao,RejeitarAprovacao,ReabrirAprovacao,dto}.ts` e `__tests__/*.test.ts`
- `src/infrastructure/aprovacoes/{aprovacaoSchema,aprovacaoMapper,HttpAprovacaoRepository}.ts` e `__tests__/HttpAprovacaoRepository.test.ts`
- `src/presentation/hooks/{useAprovacoes,useAprovacaoMutations}.ts` e `__tests__/useAprovacaoMutations.test.tsx`
- `src/presentation/features/aprovacoes/AprovacoesScreen.tsx`, `components/*.tsx`, `__tests__/{AprovacoesScreen,ApprovalCard,RejeicaoModal}.test.tsx`
- `src/app/admin/aprovacoes/{page,loading,error}.tsx` e `__tests__/page.test.tsx`

### Modificados

- `queryKeys.ts`, `UseCasesContext.tsx`, `container.ts` (+ teste), `test/renderWithProviders.tsx` — módulo `aprovacoes`.
- `src/presentation/components/ui/Pagination.tsx` e `__tests__/Pagination.test.tsx` — `layout="centered"` (se ausente).
- Badge "Fila de Aprovação" da sidebar (onda 0): fonte = `usePendentesCount()`.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Filtros: `q` (texto, servidor), `data_reg_gte = ini`, `data_reg_lte = fim`, `tipo` igual ao label, `status` igual; vazios são omitidos; mudança de qualquer filtro → página 1.            |
| RN-02 | Período: `dd/mm/aaaa → dd/mm/aaaa`; fim `2099-12-31` → "Permanente". Data de registro em `dd/mm/aaaa`.                                                                                    |
| RN-03 | Pluralização do protótipo: "1 registro encontrado", "2 registros encontrados"; "1 pendente", "2 pendentes", "0 pendentes" (header); o trecho de pendentes do resumo só aparece com p > 0. |
| RN-04 | Aprovar: só pendente; grava `status: "aprovado"` (RN-TIP-05).                                                                                                                             |
| RN-05 | Rejeitar exige motivo e justificativa (`trim`), nessa ordem de validação; grava `status`, `motivo_rejeicao` e `justificativa_rejeicao` (ARQUITETURA #15).                                 |
| RN-06 | Reabrir: decidido e fora de `APROV_INGERIDOS`; volta para pendente e limpa motivo e justificativa. Em uso → pill sem botão e o caso de uso recusa.                                        |
| RN-07 | Badges de pendentes (header e sidebar) contam a coleção inteira, não o filtro (L4149).                                                                                                    |
| RN-08 | Ações seguem o protótipo; a guarda da tela (nível 3) é a única checagem ("Somente Planejadores e Administradores podem aprovar ou rejeitar", RN-ACS-04).                                  |

## 11. BDD — Cenários de teste unitário

| Cenário                                                                                                   | Arquivo de teste                                                                            | Asserção                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-02 RN-03 Dado datas e contagens, quando formata, então período, permanente e plurais                   | `src/domain/aprovacoes/__tests__/aprovacaoRules.test.ts`                                    | "18/06/2026 → Permanente"; "1 registro encontrado"/"14 registros encontrados"; `pendentes: null` com 0; "1 pendente"/"0 pendentes"                                   |
| RN-05 Dado motivo/justificativa vazios, quando valida, então mensagens na ordem                           | `aprovacaoRules.test.ts`                                                                    | "⚠️ Selecione o motivo da rejeição."; "⚠️ Informe a justificativa." (só espaços conta como vazio)                                                                    |
| RN-04 RN-06 Dado um item, quando aplica decisão, então novo estado                                        | `aprovacaoRules.test.ts`                                                                    | aprovar/rejeitar/reabrir com campos limpos                                                                                                                           |
| §5 Dado o db.json, quando compara vocabulário, então bate com `config`                                    | `src/domain/aprovacoes/__tests__/vocabulario.test.ts`                                       | `aprovTipos`, `motivosRejeicao`, `STATUS_CFG` labels, `INT_LABEL`, `INT_COR` → tons                                                                                  |
| RN-01 CA-02 Dado filtros, quando ListAprovacoes executa, então repassa filtro/página e marca em uso       | `src/application/aprovacoes/__tests__/ListAprovacoes.test.ts`                               | DRV-2026-032 `emUso: true`; `pendentesNoResultado` não consulta quando status = aprovado                                                                             |
| RN-04 CA-05 Dado pendente, quando aprova, então PATCH e toast                                             | `AprovarAprovacao.test.ts`                                                                  | `update('DRV-2026-034',{status:'aprovado'})`; "✅ DRV-2026-034 aprovado e enviado para ingestão!"                                                                    |
| RN-05 CA-06 Dado motivo e justificativa, quando rejeita, então grava os dois e toast                      | `RejeitarAprovacao.test.ts`                                                                 | corpo do §4; "❌ DRV-2026-034 rejeitado. Registrante notificado."; sem justificativa → `RejeicaoValidationError` sem gravar                                          |
| RN-06 CA-07 Dado decidido fora de uso, quando reabre, então pendente; em uso recusa                       | `ReabrirAprovacao.test.ts`                                                                  | corpo de reabrir; toast; em uso → erro e nada gravado                                                                                                                |
| §4 Dado filtros, quando o repositório consulta, então query do json-server                                | `src/infrastructure/aprovacoes/__tests__/HttpAprovacaoRepository.test.ts`                   | `_sort=id&_order=desc`, `q`, `data_reg_gte`, `data_reg_lte`, `tipo`, `status`; vazios omitidos; `listEmUso` de `/config`; `intensidade: 7` → `InvalidResponseError`  |
| CA-01 CA-03 CA-04 Dado a massa, quando renderiza, então header, resumo e cards                            | `src/presentation/features/aprovacoes/__tests__/AprovacoesScreen.test.tsx`                  | "2 pendentes" no header; "14 registros encontrados · 2 pendentes"; 10 cards na página 1; DRV-2026-033 "Por Molécula" e "Permanente"                                  |
| CA-04 CA-07 Dado cards decididos, quando renderiza, então borda, motivo, pill ou botão                    | `ApprovalCard.test.tsx`                                                                     | aprovado `border-l-apsen-green`; rejeitado com "Motivo: …"; DRV-2026-028 com pill "🔒 Em uso no Data Lake — não pode alterar"; DRV-2026-026 com "✏️ Alterar decisão" |
| CA-02 Dado digitação na busca, quando passa 300 ms, então grava `q` e página 1                            | `AprovacoesScreen.test.tsx`                                                                 | fake timers; `routerMock.replace` só após 300 ms com `q=bari` sem `page`; "Limpar filtros" remove todos                                                              |
| CA-05 CA-09 Dado "Aprovar", quando clica e a API falha, então muda na hora e volta                        | `AprovacoesScreen.test.tsx`                                                                 | card decidido + header "1 pendente" antes de resolver; rejeição → volta a "2 pendentes" + toast de falha                                                             |
| CA-06 Dado o modal, quando confirma sem motivo, então erro no campo e foco; válido fecha e toast          | `RejeicaoModal.test.tsx`                                                                    | `aria-invalid` no select e foco; toast; válido chama `rejeitar.execute({id, motivo, justificativa})`                                                                 |
| CA-07 Dado "✏️ Alterar decisão", quando clica, então volta a pendente com toast                           | `AprovacoesScreen.test.tsx`                                                                 | `reabrir.execute`; toast "↩️ Decisão reaberta — driver voltou para pendente."                                                                                        |
| CA-08 Dado 14 registros, quando troca de página, então centralizada, URL e rolagem                        | `AprovacoesScreen.test.tsx`, `src/presentation/components/ui/__tests__/Pagination.test.tsx` | "Página 1 de 2"; ‹ desabilitado; `page=2` na URL; `scrollTo` chamado; `layout="centered"` com `justify-center`; padrão `split` inalterado                            |
| CA-10 Dado carregando/erro/vazio, quando renderiza, então estados                                         | `AprovacoesScreen.test.tsx`                                                                 | "Carregando…"; "Tentar novamente" refaz; vazio 🔍 "Nenhum registro encontrado"                                                                                       |
| RN-07 Dado filtro de status aprovado, quando renderiza, então header ainda mostra os pendentes da coleção | `AprovacoesScreen.test.tsx`                                                                 | header "2 pendentes" com `?status=aprovado`                                                                                                                          |
| §3 Dado a rota, quando renderiza, então metadata                                                          | `src/app/admin/aprovacoes/__tests__/page.test.tsx`                                          | `metadata.title` "Fila de Aprovação"                                                                                                                                 |

## 12. Requisitos não funcionais

| Item | Como atende                                                                                                                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §7.1 | Paginação, busca (`q`, debounce 300 ms) e filtros no servidor; estado na URL; página 1 ao filtrar; `keepPreviousData`; prefetch da próxima página. 14 registros: sem seletor de tamanho.       |
| §7.2 | Rota própria, `loading.tsx` (skeleton), `error.tsx`, `RejeicaoModal` via `next/dynamic`, guarda antes das queries.                                                                             |
| §7.3 | `staleTime` 30 s (lista/contagem) e 5 min (`/config`); aprovar/rejeitar/reabrir otimistas com rollback; badges da sidebar atualizados pela mesma chave; "Salvando…" no modal.                  |
| §7.4 | Erros no campo + foco + toast no modal; datas do filtro com `max`/`min` cruzados (fim ≥ início).                                                                                               |
| §7.5 | Cards em lista semântica, botões com nome que inclui o código, filtros com rótulo, paginação com `aria-current`; grade dos cards cai para 2 colunas em 800 px e os filtros empilham em 360 px. |
| §7.6 | Nomes de registrantes exibidos como no protótipo, sem e-mail; nada em `console`.                                                                                                               |
