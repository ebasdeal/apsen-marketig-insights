---
status: READY
fase: 51
area: restricoes
feature: restricoes
azure-devops-work-item:
---

# Restrições & Alertas

## 1. Overview

Porta a tela `restricoes` do protótipo `docs/Negócio/di-drivers-v2_84.html` (L2556–2609, JS L6410–6539, modal `modal-restricao` L3298–3374) para `/restricoes`, com dados reais via json-server (`/restricoes`). O planejador lista as restrições operacionais ativas e resolvidas (RN-RES-01, RN-RES-02), registra uma nova, edita uma ativa (pré-preenchida, **atualizando** o mesmo registro) e marca como resolvida. Onda 5 do porte (`docs/prototipo/ARQUITETURA.md` §6); segue §1–§4, §7 e a decisão 14 do §5 (edição atualiza e pré-preenche todos os campos, contadores das abas dinâmicos, vazio correto).

Fase provisória: 51 (onda 5 → 5x). O índice `docs/specs/README.md` é atualizado pelo orquestrador, que pode renumerar.

Dependências de outras ondas (assumidas como entregues; usar os nomes reais se diferirem, sem duplicar):

- Onda 0: `screens.ts` (tela `restricoes`, nível 3, módulo `restricoes`, crumb "Restrições & Alertas"), guarda de perfil antes das queries, `useToast().show(msg)` (anúncio `role="status"`), `UseCases` por módulo e `createFakeUseCases` com stubs por módulo, badges da sidebar calculados dos dados, `HttpClient.getPage(path, { query }) → { data, total }` (lê `X-Total-Count`) com timeout de 15 s.
- Onda 1: `Button` variante `red`, `Tabs` com tom por aba (`TabItem.tone`), `Modal size="lg"`, `Pagination`, `FormField error`.
- Pré-requisito do mock-api (fora desta spec, não editado aqui): todo registro de `restricoes` com o campo `codigo` (= `id` atual, ex. `"RST-001"`). Sem ele, a leitura funciona (o mapper usa `codigo ?? id`), mas o cálculo do próximo código por `_sort=codigo` fica incorreto.

Perguntas em aberto (não bloqueiam; comportamento definido abaixo):

- PO: a edição mantém o título "Registrar Restrição", o botão "Registrar Restrição" e o toast "✅ Restrição registrada!" do protótipo. Confirmar se deve haver textos próprios de edição.
- PO: RN-RES-03 / RN-ANL-06 — o protótipo só lembra de registrar o driver de demanda censurada (texto "Lembre:"); não cria o vínculo restrição ↔ driver. Mantido fiel.
- PO: não há reabrir restrição resolvida (fiel). Confirmar.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CA-01 | `/restricoes` mostra o cabeçalho "Restrições & Alertas" / "Impedimentos operacionais que afetam a execução do plano de produção", a ação "+ Registrar Restrição" (botão vermelho sólido) e o banner "Restrição vs. Driver de Demanda — qual a diferença?" com o texto exato do protótipo (L2570–2588).                                                                                                                                                 |
| CA-02 | As abas "Ativas" (tom vermelho) e "Resolvidas" (tom azul) mostram contadores vindos do total da API (8 e 14 com a massa inicial); a aba vem de `?aba=` (padrão `ativas`) e trocar de aba atualiza a URL e volta para a página 1.                                                                                                                                                                                                                       |
| CA-03 | A tabela da aba é paginada no servidor (`status`, `_page`, `_limit=10`), com "Mostrando a–b de n" e página em `?pagina=`; trocar de página mantém as linhas anteriores até chegar a próxima.                                                                                                                                                                                                                                                           |
| CA-04 | Colunas Tipo · Descrição · Produto / Linha · Impacto · Prazo · Responsável · Status · Ações com as cores do protótipo (impacto por `impCor`, prazo vermelho se crítica, pill "● Crítica/Atenção/Em análise" nas ativas, badge "✅ Resolvida" nas resolvidas).                                                                                                                                                                                          |
| CA-05 | Em ativas, as ações são ✏️ Editar e ✓ Resolver; em resolvidas, a coluna Ações mostra os 40 primeiros caracteres de `resolucao`.                                                                                                                                                                                                                                                                                                                        |
| CA-06 | Aba sem registros mostra "Nenhum registro" com ícone ✅ em Ativas e 📋 em Resolvidas.                                                                                                                                                                                                                                                                                                                                                                  |
| CA-07 | "+ Registrar Restrição" abre o modal lg "Registrar Restrição" limpo (Tipo vazio, Severidade "Crítica", Responsável "Ana Planejadora"). Sem tipo: toast "⚠️ Selecione o tipo.", erro no campo Tipo e foco nele; sem descrição: "⚠️ Informe a descrição.", erro e foco em Descrição. Com sucesso: `POST` com `id` UUID e `codigo` `RST-nnn` (maior + 1), status ativa, modal fecha, lista/contadores/badge atualizam e toast "✅ Restrição registrada!". |
| CA-08 | ✏️ Editar abre o modal pré-preenchido com tipo, severidade, descrição, produto, impacto, prazo, responsável e observações; salvar faz `PATCH /restricoes/:id` no mesmo registro e mostra "✅ Restrição registrada!".                                                                                                                                                                                                                                   |
| CA-09 | ✓ Resolver remove a linha de Ativas na hora (otimista), grava `status: "resolvida"` e `resolucao: "Resolvida em {dd/mm/aaaa}"` e mostra "✅ Restrição marcada como resolvida."; se a API falhar, a linha volta e aparece o toast de erro.                                                                                                                                                                                                              |
| CA-10 | Botão de salvar fica desabilitado com "Salvando…" durante o envio; fechar o modal com alterações não salvas pede confirmação.                                                                                                                                                                                                                                                                                                                          |
| CA-11 | Estados: `loading.tsx` com skeleton do layout, carregando da tabela, erro com "Tentar novamente" (tela e `error.tsx` do segmento), vazio (CA-06) e dados.                                                                                                                                                                                                                                                                                              |
| CA-12 | O badge "Restrições Ativas" da sidebar mostra o total de ativas e muda após registrar/resolver.                                                                                                                                                                                                                                                                                                                                                        |

## 3. UX / Fluxo de tela

- Rota: `src/app/restricoes/page.tsx` (Server Component fino), `metadata = { title: 'Restrições & Alertas' }`, renderiza `<RestricoesScreen />`. `src/app/restricoes/loading.tsx` (`RestricoesSkeleton`) e `src/app/restricoes/error.tsx` (`'use client'`, `ErrorState` com `reset` em "Tentar novamente"). Nível mínimo 3.
- Referências: `docs/design/DESIGN_SPEC.md` §3.1, §3.7, §3.12, §3.14 (Pagination), §3.15, §3.16, §3.17, §3.21. `Lnnnn` = linhas do protótipo.

### Estrutura (ordem do protótipo)

1. `PageHeader` title "Restrições & Alertas", description "Impedimentos operacionais que afetam a execução do plano de produção", actions `Button variant="red" size="sm"` "+ Registrar Restrição". Sem `ScreenDesc` (o protótipo não tem).
2. `RestricaoVsDriverBanner` (`role="note"`): `mb-[18px] flex gap-[12px] rounded-[10px] border border-apsen-red-soft bg-apsen-kpi-red px-[18px] py-[14px]`; "⚠️" `shrink-0 text-[20px]` `aria-hidden`; texto `text-[13px] leading-[1.75] text-apsen-red-ink`:
   - `<strong className="mb-[5px] block text-apsen-danger-fg">Restrição vs. Driver de Demanda — qual a diferença?</strong>`
   - "**Driver de Demanda** é um evento externo que explica variação na demanda (campanha de TV, sazonalidade, lançamento de concorrente) — serve de input para o modelo causal."`<br>`
   - "**Restrição &amp; Alerta** é um impedimento operacional que afeta a _capacidade de executar_ o plano (falta de IFA, manutenção de linha, demanda acima do plano) — aciona revisão imediata do S&amp;OP."`<br>`
   - pill `mt-[5px] inline-block rounded-[4px] bg-apsen-red-soft px-[8px] py-[2px] text-[11.5px] font-semibold` "Atenção:" + " Um mesmo evento pode gerar _ambos_: falta de IFA deve ser registrada como Driver (demanda censurada) _e_ como Restrição (bloqueio de linha)."
3. `Tabs` `id="restricoes-tabs"` `aria-label="Situação das restrições"`: `{ value: 'ativas', label: 'Ativas', count: totalAtivas, tone: 'red' }`, `{ value: 'resolvidas', label: 'Resolvidas', count: totalResolvidas, tone: 'blue' }`. [mapeamento] No protótipo o contador de "Ativas" é sempre vermelho e o de "Resolvidas" sempre cinza; o app segue o padrão do `Tabs` (contador da aba ativa no tom, inativa cinza).
4. Painel: `RestricoesTable` + `Pagination` (slot `footer`), ou o vazio.

### `RestricoesTable`

`Table` com `caption` "Restrições ativas" / "Restrições resolvidas" (`scope="col"` nos cabeçalhos). Colunas:

| Coluna          | Render                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipo            | pill neutra `whitespace-nowrap rounded-[10px] border border-apsen-border bg-apsen-bg px-[9px] py-[2px] text-[11.5px] font-semibold` com `label`                                                                                                                                                                                                                        |
| Descrição       | `div text-[13px] font-medium` `desc` + `div text-[11.5px] text-apsen-muted` `det`                                                                                                                                                                                                                                                                                      |
| Produto / Linha | `text-[12.5px]`                                                                                                                                                                                                                                                                                                                                                        |
| Impacto         | `text-[12px] font-semibold` + `critica` `text-apsen-red` · `atencao` `text-apsen-amber` · `analise` `text-apsen-blue` (por `impCor`)                                                                                                                                                                                                                                   |
| Prazo           | `whitespace-nowrap text-[12.5px]` + `text-apsen-red` se `sev === 'critica'`, senão `text-apsen-slate`                                                                                                                                                                                                                                                                  |
| Responsável     | `text-[12.5px]`                                                                                                                                                                                                                                                                                                                                                        |
| Status          | ativa: `SeveridadePill` `rounded-[20px] border px-[10px] py-[3px] text-[11.5px] font-semibold` "● {label}" — crítica `border-apsen-red-soft bg-apsen-kpi-red text-apsen-red`, atenção `border-apsen-amber-b bg-apsen-amber-bg text-apsen-amber`, em análise `border-apsen-blue-light bg-apsen-blue-bg text-apsen-blue`; resolvida: `Badge tone="green"` "✅ Resolvida" |
| Ações           | ativa: `ActionGroup` com `IconButton` `aria-label="Editar {desc}"` (lápis, L6462–6463) e `IconButton tone="green"` `aria-label="Marcar {desc} como resolvida"` `title="Resolvida"` (check, L6466); resolvida: `<small className="text-apsen-muted">{resolucaoResumo}</small>`                                                                                          |

Responsivo: a `Table` já rola na horizontal dentro do contêiner (360 px).

### `RestricaoModal` (carregado com `next/dynamic`, `ssr: false`, só ao abrir)

`Modal size="lg" title="Registrar Restrição"` em novo e edição. Corpo:

| Campo                   | Controle               | Detalhes                                                                                                                                                                                                                                                                                         |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tipo `*`                | `FormSelect`           | placeholder "Selecione..."; `mp` "🧪 Matéria-Prima / IFA", `capacidade` "⚙️ Capacidade de Linha", `demanda` "📈 Demanda acima do plano", `qualidade` "🔬 Qualidade / Reprovação de lote", `regulatorio` "📋 Regulatório / Registro", `logistica` "🚚 Logística / Fornecedor", `outro` "➕ Outro" |
| Severidade `*`          | `FormSelect`           | `critica` "🔴 Crítica — bloqueio total" (padrão), `atencao` "🟡 Atenção — impacto parcial", `analise` "🔵 Em análise — monitorar"                                                                                                                                                                |
| Descrição `*`           | `TextInput`            | placeholder "Ex: Falta de IFA — Baricitinibe · Fornecedor com atraso"; `maxLength` 200 [derivado]                                                                                                                                                                                                |
| Produto / Linha Afetada | `TextInput`            | placeholder "Ex: Baricitinibe 2mg e 4mg · Linha 2"                                                                                                                                                                                                                                               |
| Impacto / Prazo         | `FormGrid columns={2}` | Impacto `TextInput` placeholder "Ex: Bloqueio total"; Prazo `TextInput type="date"`                                                                                                                                                                                                              |
| Responsável             | `FormSelect`           | "Ana Planejadora" (padrão), "Carlos Lima", "Roberto Gerente"                                                                                                                                                                                                                                     |
| Observações             | `TextArea rows={2}`    | placeholder "Contexto adicional, ações em andamento..."                                                                                                                                                                                                                                          |
| lembrete                | `div`                  | `rounded-apsen border border-apsen-red-soft bg-apsen-kpi-red px-[13px] py-[10px] text-[12.5px] leading-[1.6] text-apsen-red-ink`: "**Lembre:** se envolve falta de MP ou ruptura, registre também um **Driver de Demanda** correspondente para tratar a demanda censurada." (RN-ANL-06)          |

Rodapé: `Button ghost sm` "Cancelar" · `Button red sm` "Registrar Restrição" (durante o envio: desabilitado, texto "Salvando…").

Fluxos:

- Novo: `formularioVazio()`; editar: `formularioDe(item)` (o item já vem da página carregada).
- Salvar: em `RestricaoInvalidaError` mostra o toast com a mensagem, põe `error` (mensagem sem "⚠️ ") no `FormField` do campo (`campo` do erro) e foca o controle; em sucesso fecha, mostra "✅ Restrição registrada!" e invalida as chaves (§8). Erro HTTP: toast "⚠️ Não foi possível salvar. Tente novamente." [derivado], modal aberto.
- Fechar (Cancelar, ✕, Esc, overlay) com o formulário diferente do inicial: `window.confirm('Há alterações não salvas. Deseja sair mesmo assim?')` [derivado]; cancelar a confirmação mantém o modal.
- Resolver: sem confirmação (não é exclusão; fiel), otimista (§7.3).

### Estado na URL

`?aba=ativas|resolvidas` (padrão `ativas`; valor inválido → `ativas`) e `?pagina=n` (padrão 1, inteiro ≥ 1). Função pura `lerFiltroRestricoes(searchParams)` / `escreverFiltroRestricoes(filtro)` em `features/restricoes/restricoesUrl.ts`; navegação com `router.replace` (`scroll: false`). Trocar aba → `pagina` removida. Página além do total → a API devolve vazio e a tela mostra o vazio com a paginação.

### Estados

- `loading.tsx`: `RestricoesSkeleton` — header, banner e abas reais (texto estático) + 6 linhas `h-[44px] rounded-apsen bg-apsen-bg` no lugar da tabela, sem animação (`DESIGN_SPEC` §3.12).
- Carregando a primeira vez na tela: `LoadingState` "Carregando restrições…" no lugar da tabela; ao paginar, `placeholderData: keepPreviousData` mantém as linhas.
- Erro: `ErrorState` com `toUserMessage(error)` e `onRetry` ("Tentar novamente").
- Vazio por aba: `EmptyState icon="✅"|"📋" title="Nenhum registro"`.
- Dados: tabela + `Pagination` ("Mostrando a–b de n").

## 4. Contratos de API consumidos

Base `{NEXT_PUBLIC_API_URL}` (padrão `http://localhost:3001`).

- `GET /restricoes?status=ativa&_page=1&_limit=10` → `200` array + header `X-Total-Count: 8`.
- Contadores das abas: `GET /restricoes?status=ativa&_limit=1` e `GET /restricoes?status=resolvida&_limit=1` (só o `X-Total-Count` é usado).
- Próximo código: `GET /restricoes?_sort=codigo&_order=desc&_limit=1`.
- `POST /restricoes` → `201`; `PATCH /restricoes/:id` → `200`.

Exemplo de item (existente sem `codigo` e novo com UUID):

```json
[
  {
    "id": "RST-001",
    "codigo": "RST-001",
    "tipo": "mp",
    "label": "🧪 Matéria-Prima",
    "desc": "Falta de IFA — Baricitinibe",
    "det": "Fornecedor Lilly com atraso na entrega · reabastecimento previsto 10/07",
    "produto": "Baricitinibe 2mg e 4mg · Linha 2",
    "impacto": "Bloqueio total",
    "impCor": "critica",
    "prazo": "05/07/2026",
    "resp": "Ana Planejadora",
    "sev": "critica",
    "status": "ativa",
    "obs": "Compra emergencial em avaliação. Produção suspensa até regularização."
  },
  {
    "id": "6f1c2a9e-3b7d-4e0a-9c55-1d2e3f4a5b6c",
    "codigo": "RST-023",
    "tipo": "capacidade",
    "label": "⚙️ Capacidade",
    "desc": "Parada da Linha 4",
    "det": "",
    "produto": "Linha 4",
    "impacto": "Redução 20% cap.",
    "impCor": "atencao",
    "prazo": "15/08/2026",
    "resp": "Carlos Lima",
    "sev": "atencao",
    "status": "ativa",
    "obs": ""
  }
]
```

Corpos de escrita: `POST` = DTO completo acima; `PATCH` de edição `{ tipo, label, desc, produto, impacto, impCor, prazo, resp, sev, obs }`; `PATCH` de resolver `{ "status": "resolvida", "resolucao": "Resolvida em 27/10/2026" }`.

Schema Zod (`src/infrastructure/restricoes/restricaoSchemas.ts`):

```ts
const severidade = z.enum(['critica', 'atencao', 'analise']);
export const restricaoDtoSchema = z.object({
  id: z.string().min(1),
  codigo: z.string().min(1).optional(),
  tipo: z.enum(['mp', 'capacidade', 'demanda', 'qualidade', 'regulatorio', 'logistica', 'outro']),
  label: z.string(),
  desc: z.string(),
  det: z.string().default(''),
  produto: z.string().default(''),
  impacto: z.string().default(''),
  impCor: severidade,
  prazo: z.string().default('—'),
  resp: z.string().default(''),
  sev: severidade,
  status: z.enum(['ativa', 'resolvida']),
  obs: z.string().default(''),
  resolucao: z.string().optional(),
});
export const restricaoListSchema = z.array(restricaoDtoSchema);
```

Erros: payload fora do schema ou sem `X-Total-Count` numérico → `InvalidResponseError`; `PATCH` `404` → `NotFoundError('Restrição', id)`; `5xx`/rede/timeout → `HttpError`/`NetworkError` (tela: `ErrorState`; mutação: toast de erro e rollback).

## 5. Domínio (`src/domain`)

`src/domain/restricoes/`:

- `Restricao.ts`
  ```ts
  export type RestricaoTipo =
    'mp' | 'capacidade' | 'demanda' | 'qualidade' | 'regulatorio' | 'logistica' | 'outro';
  export type Severidade = 'critica' | 'atencao' | 'analise';
  export type RestricaoStatus = 'ativa' | 'resolvida';
  export interface Restricao {
    id: string;
    codigo: string;
    tipo: RestricaoTipo;
    label: string;
    desc: string;
    det: string;
    produto: string;
    impacto: string;
    impCor: Severidade;
    prazo: string;
    resp: string;
    sev: Severidade;
    status: RestricaoStatus;
    obs: string;
    resolucao: string | null;
  }
  export interface RestricaoForm {
    tipo: RestricaoTipo | '';
    sev: Severidade;
    desc: string;
    produto: string;
    impacto: string;
    prazoIso: string;
    resp: string;
    obs: string;
  }
  export interface Pagina<T> {
    itens: T[];
    total: number;
    pagina: number;
    tamanho: number;
  }
  ```
  (`Pagina<T>` só se a onda 0 não tiver criado um tipo equivalente em `src/domain/shared`; nesse caso usar o de lá.)
- `restricaoConstants.ts`: `RESTRICAO_LABELS` (`mp` "🧪 Matéria-Prima", `capacidade` "⚙️ Capacidade", `demanda` "📈 Demanda", `qualidade` "🔬 Qualidade", `regulatorio` "📋 Regulatório", `logistica` "🚚 Logística", `outro` "➕ Outro" — L6521), `RESTRICAO_TIPO_OPCOES`, `SEVERIDADE_OPCOES`, `SEVERIDADE_LABEL` (`Crítica`, `Atenção`, `Em análise`), `RESPONSAVEIS`, `RESTRICOES_POR_PAGINA = 10`.
- `restricaoRules.ts` (puro):
  - `proximoCodigoRestricao(maiorCodigo: string | null): string` — `RST-` + (sufixo numérico + 1) com 3 dígitos; `null`/fora do padrão → `RST-001`.
  - `validarRestricao(form): void` — `RestricaoInvalidaError('⚠️ Selecione o tipo.', 'tipo')` se `tipo === ''`; depois `RestricaoInvalidaError('⚠️ Informe a descrição.', 'desc')` se `desc.trim() === ''`.
  - `prazoDeIso(iso)` — `yyyy-mm-dd` → `dd/mm/aaaa` por texto (sem `Date`, evita o deslocamento de fuso do protótipo); vazio → `'—'`.
  - `isoDePrazo(prazo)` — `dd/mm/aaaa` → `yyyy-mm-dd`; outro formato ("22–25/07/2026", "—") → `''`.
  - `novaRestricao(form, id, codigo): Restricao` — `label = RESTRICAO_LABELS[tipo]`, `det ''`, `impCor = sev`, `prazo = prazoDeIso(prazoIso)`, `status 'ativa'`, `resolucao null`, `desc` com `trim`.
  - `alteracoesDaEdicao(original, form)` — `{ tipo, label, desc, produto, impacto, impCor, prazo, resp, sev, obs }`; prazo: se `prazoIso` vazio e `isoDePrazo(original.prazo) === ''`, mantém `original.prazo`; senão `prazoDeIso(prazoIso)`.
  - `resolucaoEm(hoje: Date): string` — `'Resolvida em ' + dd/mm/aaaa` (data local).
  - `formularioVazio()` (`tipo ''`, `sev 'critica'`, `resp 'Ana Planejadora'`, resto `''`), `formularioDe(r)` (`prazoIso = isoDePrazo(r.prazo)`), `formularioAlterado(a, b): boolean`.
  - `resumoResolucao(r)` — `(r.resolucao ?? '').slice(0, 40)`.
- `RestricaoRepository.ts`
  ```ts
  export interface RestricaoFiltro {
    status?: RestricaoStatus;
    sev?: Severidade;
    tipo?: RestricaoTipo;
  }
  export interface RestricaoRepository {
    listPage(filtro: RestricaoFiltro, pagina: number, tamanho: number): Promise<Pagina<Restricao>>;
    count(filtro: RestricaoFiltro): Promise<number>;
    maiorCodigo(): Promise<string | null>;
    create(restricao: Restricao): Promise<Restricao>;
    update(id: string, patch: Partial<Omit<Restricao, 'id' | 'codigo'>>): Promise<Restricao>;
  }
  ```
  (`count` com `sev`/`tipo` é usado pelo dashboard.)
- `RestricaoInvalidaError.ts`: `class RestricaoInvalidaError extends DomainError { constructor(message: string, readonly campo: 'tipo' | 'desc') }`.

## 6. Aplicação (`src/application`)

`src/application/restricoes/`:

- `dto.ts`
  ```ts
  export interface RestricaoItemOutput {
    id: string;
    codigo: string;
    tipo: RestricaoTipo;
    label: string;
    desc: string;
    det: string;
    produto: string;
    impacto: string;
    impCor: Severidade;
    prazo: string;
    resp: string;
    sev: Severidade;
    sevLabel: string;
    status: RestricaoStatus;
    resolucaoResumo: string;
    form: RestricaoForm;
  }
  export interface ListRestricoesInput {
    aba: 'ativas' | 'resolvidas';
    pagina: number;
  }
  export interface RestricoesPaginaOutput {
    itens: RestricaoItemOutput[];
    total: number;
    pagina: number;
    tamanho: number;
  }
  export interface ContagemRestricoesOutput {
    ativas: number;
    resolvidas: number;
  }
  ```
- `ListRestricoes(repo)` → `execute({ aba, pagina })`: `repo.listPage({ status: aba === 'ativas' ? 'ativa' : 'resolvida' }, pagina, RESTRICOES_POR_PAGINA)`.
- `ContarRestricoes(repo)` → `{ ativas, resolvidas }` (duas `count` em paralelo).
- `RegistrarRestricao(repo, gerarId: () => string)` → `execute(form): Promise<{ id: string; codigo: string }>`: `validarRestricao`, `maiorCodigo` → `proximoCodigoRestricao`, `repo.create(novaRestricao(form, gerarId(), codigo))`.
- `AtualizarRestricao(repo)` → `execute(original: RestricaoItemOutput, form)`: `validarRestricao`, `repo.update(original.id, alteracoesDaEdicao(original, form))`.
- `ResolverRestricao(repo, now: () => Date)` → `execute(id)`: `repo.update(id, { status: 'resolvida', resolucao: resolucaoEm(now()) })`.

## 7. Infraestrutura (`src/infrastructure`)

`src/infrastructure/restricoes/`:

- `restricaoSchemas.ts` — §4.
- `restricaoMapper.ts` — `toRestricao(dto)` (`codigo = dto.codigo ?? dto.id`, `resolucao` ausente → `null`), `toRestricaoDto(r)` (omite `resolucao` `null`).
- `HttpRestricaoRepository.ts` — `constructor(http: HttpClient)`: `listPage` → `http.getPage('restricoes', { query: { status, sev, tipo, _page, _limit } })` + `restricaoListSchema`; `count` → `getPage` com `_limit: '1'` e devolve `total`; `maiorCodigo` → `GET restricoes?_sort=codigo&_order=desc&_limit=1` → `codigo` do primeiro ou `null`; `create` → `POST restricoes`; `update` → `PATCH restricoes/{encodeURIComponent(id)}` (`HttpError` 404 → `NotFoundError`). Escritas validadas com `restricaoDtoSchema`; falha → `InvalidResponseError('Resposta inválida de /restricoes')`.

## 8. Apresentação (`src/presentation`)

- `queryKeys.restricoes = { all: ['restricoes'], list: (input) => ['restricoes', 'list', input], contagem: () => ['restricoes', 'contagem'] }` (`as const`).
- Hooks `src/presentation/hooks/useRestricoes.ts`:
  - `useRestricoes(input)` — `useQuery`, `staleTime: 30_000`, `placeholderData: keepPreviousData`; prefetch da próxima página quando `pagina * tamanho < total`.
  - `useContagemRestricoes()` — `staleTime: 30_000` (também fonte do badge da sidebar).
  - `useRegistrarRestricaoMutation()`, `useAtualizarRestricaoMutation()` — sucesso invalida `restricoes.all` e `dashboard.all`.
  - `useResolverRestricaoMutation()` — otimista: `onMutate` cancela `restricoes.list(input)`, remove o item da página em cache e ajusta `contagem` (ativas −1, resolvidas +1), guardando o snapshot; `onError` restaura e mostra "⚠️ Não foi possível salvar. Tente novamente."; `onSettled` invalida `restricoes.all` e `dashboard.all`.
- `UseCases.restricoes = { list, contar, registrar, atualizar, resolver }`; `createFakeUseCases` com stubs (`list` resolve `{ itens: [], total: 0, pagina: 1, tamanho: 10 }`, `contar` resolve `{ ativas: 0, resolvidas: 0 }`).
- `createContainer`: `restricaoRepository = new HttpRestricaoRepository(http)` (instância única, reutilizada pelo dashboard); `gerarId = () => crypto.randomUUID()` e `now` do container (sobrescrevíveis em `ContainerOverrides` para teste).
- Feature `src/presentation/features/restricoes/`: `RestricoesScreen.tsx` (`'use client'`), `restricoesUrl.ts`, `restricaoStyles.ts`, `components/{RestricaoVsDriverBanner,RestricoesTable,SeveridadePill,RestricaoModal,RestricoesSkeleton}.tsx`. O modal é importado com `dynamic(() => import('./components/RestricaoModal'), { ssr: false })`.
- `RESTRICOES_ROUTE = '/restricoes'` em `routes.ts`.

### Tokens

Usar o token da onda 1 com o mesmo valor, se existir; senão criar no `@theme` e em `html.dark` e documentar em `docs/design/DESIGN_SPEC.md`:

| Token                    | Claro (protótipo) | Escuro [derivado] | Uso                                                         |
| ------------------------ | ----------------- | ----------------- | ----------------------------------------------------------- |
| `--color-apsen-red-soft` | `#fca5a5`         | `#7a2e2e`         | borda do banner/lembrete, pill "Atenção:", borda da crítica |
| `--color-apsen-red-ink`  | `#7f1d1d`         | `#fecaca`         | texto do banner e do lembrete                               |
| `--color-apsen-amber`    | `#b45309`         | `#fbbf24`         | impacto/severidade "Atenção"                                |
| `--color-apsen-amber-bg` | `#fffbeb`         | `#2e2410`         | fundo da severidade "Atenção"                               |
| `--color-apsen-amber-b`  | `#fcd34d`         | `#8a6d1f`         | borda da severidade "Atenção"                               |

`#FEF2F2` = `apsen-kpi-red`; `#991B1B` = `apsen-danger-fg`.

## 9. Arquivos

### Novos

- `src/domain/restricoes/{Restricao,restricaoConstants,restricaoRules,RestricaoRepository,RestricaoInvalidaError}.ts`, `__tests__/restricaoRules.test.ts`
- `src/application/restricoes/{dto,ListRestricoes,ContarRestricoes,RegistrarRestricao,AtualizarRestricao,ResolverRestricao}.ts`, `__tests__/restricoesUseCases.test.ts`
- `src/infrastructure/restricoes/{restricaoSchemas,restricaoMapper,HttpRestricaoRepository}.ts`, `__tests__/HttpRestricaoRepository.test.ts`
- `src/presentation/hooks/useRestricoes.ts`, `src/presentation/hooks/__tests__/useRestricoes.test.tsx`
- `src/presentation/features/restricoes/` (arquivos do §8) e `__tests__/{RestricoesScreen,RestricaoModal,RestricoesTable,restricoesUrl}.test.tsx|ts`
- `src/app/restricoes/{page,loading,error}.tsx`, `src/app/restricoes/__tests__/page.test.tsx`

### Modificados

- `src/presentation/hooks/queryKeys.ts`, `src/presentation/providers/UseCasesContext.tsx`, `test/renderWithProviders.tsx` — grupo `restricoes`.
- `src/main/container.ts` (+ `__tests__/container.test.ts`) — repositório, `gerarId`, casos de uso.
- `src/presentation/navigation/routes.ts` (+ teste), `src/presentation/navigation/screens.ts` — rota, tela e fonte do badge.
- `src/app/globals.css` (+ `src/app/__tests__/globals.test.ts`) e `docs/design/DESIGN_SPEC.md` — tokens, se ainda não existirem.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Ativas = `status === 'ativa'`, resolvidas = `status === 'resolvida'`, organizadas em abas (RN-RES-02). Contadores e badge vêm do `X-Total-Count` (nada fixo).                                                                            |
| RN-02 | Vazio: ✅ em Ativas e 📋 em Resolvidas, texto "Nenhum registro" (corrige `'ativa'` × `'ativas'`).                                                                                                                                        |
| RN-03 | Registro novo: `id` = UUID (RN-SEG-03); `codigo` = `RST-` + (maior sufixo existente + 1) com 3 dígitos, nunca `length + 1`. Rotas e PATCH usam o `id`; a tela não exibe o código (fiel: o protótipo não mostra o id da restrição).       |
| RN-04 | Validação, nesta ordem: tipo vazio "⚠️ Selecione o tipo."; descrição vazia (após `trim`) "⚠️ Informe a descrição.". Toast + erro no campo + foco. Nenhum outro campo é obrigatório.                                                      |
| RN-05 | Novo registro: `label` curto do tipo, `impCor = sev`, `det = ''`, `status = 'ativa'`, `prazo` `dd/mm/aaaa` ou "—".                                                                                                                       |
| RN-06 | Editar pré-preenche todos os campos do modal e salva no **mesmo** id (PATCH). `det`, `status`, `resolucao` e `codigo` não mudam; `label` e `impCor` recalculados; prazo em formato não `dd/mm/aaaa` é preservado se o campo ficar vazio. |
| RN-07 | Resolver grava `status 'resolvida'` e `resolucao 'Resolvida em {dd/mm/aaaa}'` (data local), sem confirmação, com atualização otimista e rollback.                                                                                        |
| RN-08 | Resolvidas mostram só os 40 primeiros caracteres de `resolucao` e não têm ações.                                                                                                                                                         |
| RN-09 | Cores: crítica vermelho, atenção âmbar `#B45309`, em análise azul; prazo vermelho só se `sev === 'critica'`.                                                                                                                             |
| RN-10 | Aba e página ficam na URL (`aba`, `pagina`); mudar de aba volta à página 1; valores inválidos caem no padrão.                                                                                                                            |

## 11. Requisitos não funcionais

| Item (ARQUITETURA §7)     | Aplicação                                                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 Paginação no servidor | `_page`/`_limit=10` por aba, total do `X-Total-Count`; sem seletor de tamanho (22 registros < 50); `keepPreviousData`; prefetch da próxima página. Sem busca (o protótipo não tem).                                  |
| 7.1 Estado na URL         | `aba` e `pagina` (RN-10).                                                                                                                                                                                            |
| 7.2 Rotas e carregamento  | `loading.tsx` (skeleton), `error.tsx` ("Tentar novamente"); modal via `next/dynamic` `ssr: false`; guarda de perfil antes das queries. Sem detalhe por id (não há `not-found` próprio).                              |
| 7.3 Cache e escrita       | `staleTime` 30 s; invalida só `restricoes` e `dashboard`; resolver otimista com rollback; "Salvando…" e botão desabilitado; não há exclusão.                                                                         |
| 7.4 Formulários           | validação no domínio com mensagens do protótipo, erro no campo e foco no primeiro inválido; confirmação ao fechar modal sujo; data via `type="date"`.                                                                |
| 7.5 A11y / responsivo     | `caption`/`scope`, botões de ação com `aria-label` próprio, `Tabs` WAI-ARIA, focus trap do `Modal`, toasts em `role="status"`; tabela com scroll horizontal e `FormGrid` colapsando até 360 px; sem animações novas. |
| 7.6 Segurança             | sem `console.*`; ids UUID (RN-SEG-03); nenhum dado pessoal além do nome do responsável, que já é exibido.                                                                                                            |

## 12. BDD — Cenários de teste unitário

| Cenário                                                                                                                                                     | Arquivo de teste                                                           | Asserção                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 Dado a tela carregada, quando renderiza, então mostra título, subtítulo, botão vermelho e banner                                                      | `src/presentation/features/restricoes/__tests__/RestricoesScreen.test.tsx` | `heading` "Restrições & Alertas"; `button` "+ Registrar Restrição" com `bg-apsen-red`; `note` com "Restrição vs. Driver de Demanda — qual a diferença?" e "Atenção:"                                                                                                            |
| CA-02 / RN-01 / RN-10 Dado contagem 8/14 e `?aba=resolvidas`, quando renderiza e clica "Ativas", então seleciona e troca a URL                              | `RestricoesScreen.test.tsx`                                                | `tab` "Resolvidas 14" selecionada; clique em "Ativas 8" → `routerMock.replace` com `?aba=ativas` (sem `pagina`); `list.execute({ aba: 'ativas', pagina: 1 })`                                                                                                                   |
| CA-03 Dado total 22 e `?pagina=2`, quando renderiza, então pede a página 2 e mostra o intervalo                                                             | `RestricoesScreen.test.tsx`                                                | `list.execute` com `pagina: 2`; "Mostrando 11–20 de 22"; "Próxima página" → `replace` com `pagina=3`                                                                                                                                                                            |
| CA-04 / RN-09 Dado uma ativa crítica e uma atenção, quando renderiza, então aplica cores e pill                                                             | `src/presentation/features/restricoes/__tests__/RestricoesTable.test.tsx`  | 8 `columnheader` na ordem com `scope="col"`; impacto `text-apsen-red`/`text-apsen-amber`; prazo crítico `text-apsen-red`; "● Crítica"                                                                                                                                           |
| CA-05 / RN-08 Dado uma resolvida com `resolucao` longa, quando renderiza, então mostra 40 caracteres e nenhum botão                                         | `RestricoesTable.test.tsx`                                                 | texto truncado; "✅ Resolvida"; sem `button` "Editar …"                                                                                                                                                                                                                         |
| CA-06 / RN-02 Dado página vazia, quando renderiza Ativas e depois Resolvidas, então ✅ e 📋 "Nenhum registro"                                               | `RestricoesScreen.test.tsx`                                                | ícones e título                                                                                                                                                                                                                                                                 |
| CA-07 / RN-04 Dado o modal novo, quando salva sem tipo e depois sem descrição, então toast, erro no campo e foco                                            | `src/presentation/features/restricoes/__tests__/RestricaoModal.test.tsx`   | toast "⚠️ Selecione o tipo."; combobox "Tipo" com `aria-invalid` e `toHaveFocus()`; depois "⚠️ Informe a descrição." e foco em "Descrição"; `dialog` aberto                                                                                                                     |
| CA-07 / RN-03 Dado o modal preenchido, quando salva, então registra, fecha e mostra o toast                                                                 | `RestricoesScreen.test.tsx`                                                | `registrar.execute(form)`; `dialog` some; toast "✅ Restrição registrada!"; padrões "🔴 Crítica — bloqueio total" e "Ana Planejadora"                                                                                                                                           |
| CA-08 / RN-06 Dado uma ativa com prazo "05/07/2026", quando edita e salva, então campos preenchidos e `atualizar` com o item                                | `RestricaoModal.test.tsx`                                                  | Prazo `2026-07-05`; todos os campos; `atualizar.execute(item, form)`; `registrar` não chamado                                                                                                                                                                                   |
| CA-09 / RN-07 Dado uma ativa, quando resolve e a API falha, então some, volta e mostra o erro                                                               | `src/presentation/hooks/__tests__/useRestricoes.test.tsx`                  | após `mutate`, cache da página sem o item e `contagem.ativas` −1; com `resolver` rejeitado, cache restaurado e toast "⚠️ Não foi possível salvar. Tente novamente."; sucesso → toast "✅ Restrição marcada como resolvida." e invalidação de `['restricoes']` e `['dashboard']` |
| CA-10 Dado `registrar` pendente, quando salva, então o botão fica "Salvando…" desabilitado; dado form sujo, quando fecha, então confirma                    | `RestricaoModal.test.tsx`                                                  | `button` "Salvando…" `disabled`; `window.confirm` com "Há alterações não salvas. Deseja sair mesmo assim?"; retorno `false` mantém o `dialog`                                                                                                                                   |
| CA-11 Dado `list` pendente / rejeitado, quando renderiza e clica "Tentar novamente", então loading, erro e nova chamada                                     | `RestricoesScreen.test.tsx`, `src/app/restricoes/__tests__/page.test.tsx`  | `status` "Carregando restrições…"; `alert` com "Tentar novamente"; 2ª chamada; `loading.tsx` renderiza o skeleton; `error.tsx` chama `reset`                                                                                                                                    |
| CA-12 Dado a mutação concluída, quando invalida, então a contagem é recarregada                                                                             | `useRestricoes.test.tsx`                                                   | `contar.execute` chamado de novo                                                                                                                                                                                                                                                |
| RN-03 Dado maior código `RST-022`, quando gera, então `RST-023`; `null` → `RST-001`                                                                         | `src/domain/restricoes/__tests__/restricaoRules.test.ts`                   | igualdade; `"ABC"` → `RST-001`                                                                                                                                                                                                                                                  |
| RN-04 Dado `validarRestricao` sem tipo e sem descrição, então a primeira mensagem é a do tipo e `campo` é `tipo`                                            | `restricaoRules.test.ts`                                                   | mensagem e `campo`; com tipo e `desc` " " → `desc`                                                                                                                                                                                                                              |
| RN-05 Dado form com prazo `2026-08-15` e sev `atencao`, quando cria, então label, impCor, prazo e status                                                    | `restricaoRules.test.ts`                                                   | "⚙️ Capacidade", `atencao`, "15/08/2026", `det ''`, `ativa`; sem prazo → "—"                                                                                                                                                                                                    |
| RN-06 Dado original com prazo "22–25/07/2026", quando edita sem prazo, então preserva; com `2026-07-30`, substitui                                          | `restricaoRules.test.ts`                                                   | `isoDePrazo` `''`; `prazo` preservado; "30/07/2026"                                                                                                                                                                                                                             |
| RN-07 Dado hoje 27/10/2026, quando resolve, então `resolucao` "Resolvida em 27/10/2026"                                                                     | `src/application/restricoes/__tests__/restricoesUseCases.test.ts`          | `repo.update(id, { status: 'resolvida', resolucao: 'Resolvida em 27/10/2026' })`                                                                                                                                                                                                |
| RN-10 Dado `?aba=xyz&pagina=-3`, quando lê a URL, então `ativas` e 1                                                                                        | `src/presentation/features/restricoes/__tests__/restricoesUrl.test.ts`     | igualdade; `escreverFiltroRestricoes({ aba: 'ativas', pagina: 1 })` → `''`                                                                                                                                                                                                      |
| Use cases Dado repositório falso, quando registra, então UUID de `gerarId` e próximo código                                                                 | `restricoesUseCases.test.ts`                                               | `create` com `id` do stub e `codigo: 'RST-023'`; `ContarRestricoes` → `{ ativas: 8, resolvidas: 14 }`                                                                                                                                                                           |
| Infra Dado `fetchFn` falso, quando lista, então query, `X-Total-Count` e mapeamento; payload inválido → `InvalidResponseError`; PATCH 404 → `NotFoundError` | `src/infrastructure/restricoes/__tests__/HttpRestricaoRepository.test.ts`  | URL `…/restricoes?status=ativa&_page=1&_limit=10`; `codigo` ausente → `id`; `resolucao` ausente → `null`; `maiorCodigo` usa `_sort=codigo&_order=desc&_limit=1`                                                                                                                 |
| Rota Dado `page.tsx`, quando renderiza, então `metadata.title` e a tela                                                                                     | `src/app/restricoes/__tests__/page.test.tsx`                               | "Restrições & Alertas"                                                                                                                                                                                                                                                          |
