---
status: REVIEW
fase: 42
area: agentes
feature: agentes
azure-devops-work-item:
---

# Agentes de IA, Cadastro de Agente e Visualização

## 1. Overview

Porta o módulo Agentes de IA do protótipo (`docs/Negócio/di-drivers-v2_84.html`): a tela `agentes` (L2354–2397, JS `renderAgentes`/`agenteToggle`/`agenteTestar` L4318–4412), o `modal-agente-ver` (L3283–3294, corpo `agenteVer` L4415–4444) e a tela `agente-form` (L2400–2552, `agentTestConn` L4446–4449). O admin monitora os agentes de coleta, ativa/inativa, testa a conexão (determinística — ARQUITETURA #18), visualiza o detalhe, cria e edita agentes. Tudo persiste via API (`/agentes`, ARQUITETURA #13). Credenciais: só a referência ao secret no Key Vault é guardada (RN-SEG-05).

Onda 4, fase provisória 42. Inventário §2.16, §2.17 e §3 (`modal-agente-ver`).

**Dependências:** as da spec [ciclos](../admin/ciclos.md) §1 (plataforma, onda 1, `useListSearchParams`, `IdGenerator`); `CodeTag` ([tipos](../admin/tipos.md)); `DetailField` ([ingeridos](../admin/ingeridos.md)); `useUnsavedChangesGuard` ([tipos](../admin/tipos.md)); da onda 1 `Breadcrumb`, `StatusField`, `FormActions`, `RangeSlider` (`accent="purple"`), `FormSelect` com `groups` (optgroup) e `placeholder`, `Tooltip` com `ReactNode`, `Modal size="lg"`.

**Decisões do usuário de 27/10/2026 ([login](../platform/login.md) §1.1):** usuário inativo vê a tela só para leitura — "+ Novo Agente" some, Toggle e "Testar conexão" ficam desabilitados e "Salvar Agente" desabilitado; escrita recusada pela API (403 `somente_leitura`) mostra o toast de erro. A pill do provedor anthropic usa o token existente `apsen-yellow-soft` (`#FFF8EC`), sem token novo.

**Decisões [derivado]:**

- IDs: agente novo recebe `id` UUID (RN-SEG-03) e o código de negócio `codigo` (`AG-nnn`, maior + 1); legado: `codigo = id`. Rotas usam o `id`.
- O select "Papel do Agente" tem rótulos longos ("🏛️ Agente Regulatório — DOU / ANVISA / CMED / MS"); grava-se em `papel` a parte antes de " — " ("🏛️ Agente Regulatório"), como na massa. Em edição, a opção é a que começa pelo `papel` gravado.
- Campos novos gravados: `nome` (Nome de exibição) e `limiar` (Limiar de confiança, padrão 75). `fontes` recebe o texto de "Fontes monitoradas". A tabela continua mostrando `papel` + `fontes` (fiel); o modal de visualização mostra "Nome de exibição" quando houver.
- Ambiente: o dado legado "Dev" é pré-selecionado como "Desenvolvimento"; qualquer ambiente que não seja Produção/Homologação aparece na pill como "Dev" (L4336, fiel).
- Agente novo: `ultimo_teste = { status: 'pendente', ts: '— não testado' }` (como AG-004).
- Teste de conexão da tabela: sempre sucesso, grava `ultimo_teste = { status: 'ok', ts: agora }`; o toast de falha do protótipo ("❌ Falha ao conectar — …") é usado quando a gravação falha.
- Alerta e resumo calculados dos dados (ARQUITETURA #18); "próxima execução" = agente ativo com schedule "Diário · HHhMM" de menor horário (determinístico, sem relógio).

**Perguntas em aberto:**

- PO (divergência importante): RN-AGE-01 diz que os agentes são criados, configurados e mantidos no Azure AI Foundry e que **a aplicação não oferece tela de cadastro de agentes**; o protótipo tem cadastro e edição. Seguido o protótipo no visual e no comportamento (ARQUITETURA §8); confirmar se o cadastro sai do escopo quando houver integração real.
- PO: RN-AGE-03, RN-GOV-04 e RN-GOV-05 exigem registrar input, output, modelo e tokens de cada interação com agentes; não há essa tela nem dado no protótipo.
- PO: o select de Schedule tem "A cada 6 horas (H24)" e o dado AG-003 tem "H24 · a cada 6h"; em edição o valor atual entra como opção extra.
- PO: o alerta do protótipo usa o ícone de cadeado numa mensagem informativa; mantido.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/agentes` mostra o header "Agentes de IA" / "AI Agent Engine & Crawler · monitoramento e configuração dos agentes de coleta" com "+ Novo Agente" (roxo sm → `/agentes/novo`), o `ScreenDesc` 🤖 (L2368–2372), o `Alert` info com cadeado "**{n} agentes cadastrados · {a} ativos** — próxima execução: {nome} em **{HHhMM}**" (sem agendamento: "— nenhuma execução agendada") e o resumo "{n} agentes cadastrados · {a} ativos" (totais do servidor).                                                                                                                                                                                                                         |
| CA-02 | Tabela paginada no servidor (10 por página, página na URL), colunas Nome / Papel C4 · Provedor · Endpoint · Secret (Key Vault ref.) · Modelo · Schedule · Ambiente · Último Teste · Status · Ações com o visual de L4325–4385 (pills de provedor e ambiente, endpoint com reticências em 160px, cadeado + secret + "vault: {vault}", modelo em `CodeTag`, schedule em pill azul, último teste "✓ OK"/"✗ Falha — timeout"/ts muted). Sem exclusão.                                                                                                                                                                                                                               |
| CA-03 | O Toggle de status muda na hora (otimista), grava `PATCH {ativo}` e mostra "✅ {papel curto} ativado." / "⏸ {papel curto} desativado." (papel curto = duas primeiras palavras do papel, ex.: "🏛️ Agente"); alerta e resumo acompanham; falha restaura e mostra o toast de falha.                                                                                                                                                                                                                                                                                                                                                                                                |
| CA-04 | "📈 Testar" mostra "⟳ Testando {papel curto}...", desabilita o botão da linha, grava `ultimo_teste = {status:"ok", ts:"dd/mm/aaaa HH:MM"}` e, após no mínimo 1,8 s, mostra "✅ Conexão OK — {papel curto}" com a célula atualizada; se a API falhar, "❌ Falha ao conectar — {papel curto}".                                                                                                                                                                                                                                                                                                                                                                                    |
| CA-05 | "👁 Visualizar" abre (via `next/dynamic`) o modal lg com título = papel e a grade de L4419–4442: Provedor, Modelo (code), Endpoint (largura total, mono azul), Secret (Key Vault ref.) + vault, Schedule, Ambiente, Fontes, Status ("✅ Ativo" verde / "⏸ Inativo" muted), Último Teste (largura total, "✓ OK"/"✗ Falha"/"—" + ts); com `nome`, "Nome de exibição" no topo (largura total). Rodapé "Fechar".                                                                                                                                                                                                                                                                     |
| CA-06 | "✏️ Editar" navega para `/agentes/{id}/editar`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CA-07 | `/agentes/novo` mostra o breadcrumb "Agentes › Novo Agente", "← Voltar", o `ScreenDesc` 🛠️ (L2410–2412) e os cards "Identificação" (Papel `*`, Nome de exibição `*`, Provedor `*`, Ambiente `*`, Endpoint `*` mono largura total), "Azure Key Vault — Credencial" (`Alert` warning com cadeado de L2463; Key Vault URI `*` mono; Secret Name `*` mono com hint "Nome do secret — não o valor."), "Modelo & Execução" (Modelo padrão `*` com grupos Claude/GPT; Schedule `*` com 5 opções, a primeira selecionada; Fontes monitoradas 2 linhas com hint; Limiar de confiança 50–100 padrão 75 roxo com "75%" e tooltip de L2514) e "Status" (`StatusField` desligado "Inativo"). |
| CA-08 | "Testar Conexão" do formulário mostra "⟳ Testando conexão..." e, após 2 s, "✅ Conexão OK — Key Vault e endpoint acessíveis." (sem gravar).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CA-09 | "Salvar Agente" valida (RN-04) com erro no campo, foco no primeiro inválido e toast; válido grava (RN-05), mostra "✅ Agente salvo!" e volta para `/agentes`. "Salvando…" desabilitado durante o envio; "Cancelar" volta.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CA-10 | `/agentes/{id}/editar` pré-preenche tudo (breadcrumb "Agentes › Editar Agente"); salvar faz `PATCH` e "✅ Agente salvo!". Id inexistente → `not-found` ("Agente não encontrado" + "← Voltar"). Sair com alterações pede "Descartar alterações?".                                                                                                                                                                                                                                                                                                                                                                                                                                |
| CA-11 | Estados: skeleton (`loading.tsx` da lista e do formulário), erro com "Tentar novamente", vazio ("Nenhum agente cadastrado." na tabela; alerta "0 agentes cadastrados · 0 ativos — nenhuma execução agendada") e dados.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## 3. UX / Fluxo de tela

Rotas (Server Components finos; `params` é `Promise`):

- `src/app/agentes/page.tsx` (`metadata.title = 'Agentes de IA'`), `loading.tsx`, `error.tsx`.
- `src/app/agentes/novo/page.tsx` (`'Novo Agente'`).
- `src/app/agentes/[id]/editar/page.tsx` (`'Editar Agente'`, `const { id } = await params`), `loading.tsx`, `not-found.tsx`.

Referências: `DESIGN_SPEC.md` §3.17, §3.19, §3.20, §3.16, §3.15; `RangeSlider`, `StatusField`, `Breadcrumb`, `FormActions` da onda 1; `CodeTag`, `DetailField`.

### `agentes`

| Bloco     | Componente                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header    | `PageHeader` + `ButtonLink variant="purple" size="sm"` "+ Novo Agente" (`#7C3AED` = token `purple`)                                               |
| Descrição | `ScreenDesc icon="🤖"`                                                                                                                            |
| Alerta    | `AgentesAlert` → `Alert tone="info" className="mb-[16px]"` com ícone de cadeado (paths L2376) no lugar do ícone padrão (`icon` da onda 1 ou slot) |
| Resumo    | `<p className="mb-[12px] text-[13px] text-apsen-muted">`                                                                                          |
| Tabela    | `Table caption="Agentes de IA cadastrados"`; `footer` `Pagination` só com mais de uma página                                                      |

| Coluna          | Render                                                                                                                                                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nome / Papel C4 | `<div className="text-[13px] font-medium">{papel}</div><div className="text-[11.5px] text-apsen-muted">{fontes}</div>`                                                                                                                                                                                |
| Provedor        | `ProviderPill` `rounded-[8px] border px-[8px] py-[2px] text-[11px] font-bold`: azure-foundry `bg-apsen-kpi-blue text-apsen-blue border-apsen-blue-light`; anthropic `bg-apsen-anthropic-bg text-apsen-yellow border-apsen-yellow-b`; openai `bg-apsen-green-bg text-apsen-green border-apsen-green-b` |
| Endpoint        | `max-w-[160px] truncate text-[11.5px] text-apsen-slate` + `title={endpoint}`                                                                                                                                                                                                                          |
| Secret          | `flex items-center gap-[5px] text-[12px] text-apsen-muted` (cadeado 11px L4356) + secret; `mt-[2px] text-[10.5px] text-apsen-muted-2` "vault: {vault}"                                                                                                                                                |
| Modelo          | `CodeTag`                                                                                                                                                                                                                                                                                             |
| Schedule        | `rounded-[8px] bg-apsen-blue-bg px-[8px] py-[2px] text-[11.5px] font-semibold text-apsen-blue`                                                                                                                                                                                                        |
| Ambiente        | `EnvironmentPill` `rounded-[6px] border px-[8px] py-[2px] text-[11px] font-semibold`: Produção red/red-bg/red-b; Homologação yellow/yellow-bg/yellow-b; demais green/green-bg/green-b com texto "Dev"                                                                                                 |
| Último Teste    | `LastTestCell`: ok `text-[12.5px] font-medium text-apsen-green` "✓ OK" + ts `text-[11px] text-apsen-muted`; falha `text-[12px] font-medium text-apsen-red` "✗ Falha — timeout" + ts; pendente ts `text-[12px] text-apsen-muted`                                                                       |
| Status          | `flex items-center gap-[8px]` + `Toggle aria-label="Agente {papel} ativo"` + rótulo `text-[12px] font-medium`                                                                                                                                                                                         |
| Ações           | `IconButton` pulso (L4376, `aria-label="Testar conexão — {papel}"`), `IconButton` olho (`aria-label="Visualizar {papel}"`), `IconLink` lápis (`aria-label="Editar {papel}"`)                                                                                                                          |

### Modal `AgenteViewModal`

`Modal size="lg"` título = papel; corpo `grid grid-cols-2 gap-[14px]` de `DetailField`: (Nome de exibição `full`, se houver) · Provedor (`text-[13px] font-medium`) · Modelo (`CodeTag className="text-[12px]"`) · Endpoint `full` (`font-mono text-[12px] text-apsen-blue`) · Secret (Key Vault ref.) (`text-[12.5px]` + `<br>` vault `text-[11px] text-apsen-muted`) · Schedule · Ambiente (texto do dado) · Fontes (`text-[12.5px]`) · Status (`font-semibold` verde/muted) · Último Teste `full` (cor por status + ts `ml-[8px] text-[11.5px] text-apsen-muted`). Rodapé `Button ghost sm` "Fechar".

### `agente-form` (L2400–2552)

1. `Breadcrumb items={[{label:'Agentes', href:'/agentes'}, {label: modo === 'novo' ? 'Novo Agente' : 'Editar Agente'}]}` + `ButtonLink ghost sm` "← Voltar".
2. `ScreenDesc icon="🛠️"`.
3. Card "Identificação" `FormGrid columns={2}`: Papel do Agente `*` (`AGENTE_PAPEIS`, placeholder "Selecione...") · Nome de exibição `*` ("Ex: Agente Regulatório — Produção") · Provedor `*` (`AGENTE_PROVEDORES`) · Ambiente `*` (`AGENTE_AMBIENTES`) · Endpoint `*` `full` `font-mono` ("Ex: https://apsen-di.services.ai.azure.com").
4. Card "Azure Key Vault — Credencial": `Alert tone="warning"` (cadeado; "Armazene apenas a **referência** ao secret — nunca o token real. O BFF busca em runtime via Managed Identity.") + `FormGrid columns={2}`: Key Vault URI `*` mono ("https://apsen-keyvault.vault.azure.net") · Secret Name `*` mono ("Ex: apsen-di-reg-agent-key", hint).
5. Card "Modelo & Execução" `FormGrid columns={2}`: Modelo padrão `*` (`FormSelect groups={AGENTE_MODELOS}` placeholder "Selecione...") · Schedule `*` (`AGENTE_SCHEDULES`, padrão o primeiro) · Fontes monitoradas `full` (`TextArea rows={2}` "Ex: https://www.in.gov.br, https://consultas.anvisa.gov.br", hint "URLs separadas por vírgula. O agente fará scraping nestas fontes.") · Limiar de confiança para enfileirar (%) `full` (tooltip L2514; `RangeSlider min={50} max={100} accent="purple" format={(v) => `${v}%`}`, valor `min-w-[44px] text-[15px] font-bold text-apsen-purple`).
6. Card "Status": `StatusField title="Ativo / Inativo" description="Agentes inativos não executam o schedule. Rascunhos existentes na fila são preservados."` (padrão desligado) + `FormActions className="mt-[14px]"`: `Button ghost` "Cancelar" · `Button outline sm` (pulso 13px) "Testar Conexão" · `Button purple sm` "Salvar Agente".

### Textos

| Situação                  | Texto                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| toggle                    | "✅ {papel curto} ativado." / "⏸ {papel curto} desativado."                                              |
| testar (tabela)           | "⟳ Testando {papel curto}..." → "✅ Conexão OK — {papel curto}" / "❌ Falha ao conectar — {papel curto}" |
| testar (form)             | "⟳ Testando conexão..." → "✅ Conexão OK — Key Vault e endpoint acessíveis."                             |
| salvar                    | "✅ Agente salvo!"                                                                                       |
| validação [derivado]      | RN-04                                                                                                    |
| falha                     | "⚠️ Não foi possível salvar as alterações. Tente novamente."                                             |
| não encontrado [derivado] | "Agente não encontrado" / "O agente não existe ou foi removido."                                         |

## 4. Contratos de API consumidos

| Uso                             | Requisição                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| tabela                          | `GET /agentes?_page={p}&_limit=10` via `getPage` (`total` = cadastrados)                                    |
| ativos (alerta/resumo)          | `GET /agentes?ativo=true&_page=1&_limit=50` via `getPage` (`total` = ativos; itens para a próxima execução) |
| próximo código                  | `GET /agentes` (coleção inteira, só para o maior `AG-nnn`; mesma exceção justificada da spec ciclos)        |
| agente                          | `GET /agentes/{id}` (404 → não encontrado)                                                                  |
| criar / editar / status / teste | `POST /agentes` · `PATCH /agentes/{id}`                                                                     |

Agente do `db.json` e `POST`:

```json
{
  "id": "AG-001",
  "papel": "🏛️ Agente Regulatório",
  "fontes": "DOU · ANVISA · CMED · MS",
  "provedor": "azure-foundry",
  "endpoint": "https://apsen-di.services.ai.azure.com",
  "secret": "apsen-di-reg-agent-key",
  "vault": "apsen-keyvault.vault.azure.net",
  "modelo": "claude-sonnet-4-6",
  "schedule": "Diário · 03h00",
  "ambiente": "Produção",
  "ultimo_teste": { "status": "ok", "ts": "19/06/2026 03:12" },
  "ativo": true
}
```

```json
{
  "id": "e7d4…",
  "codigo": "AG-006",
  "papel": "➕ Agente customizado",
  "nome": "Agente Preços — Homologação",
  "fontes": "https://www.gov.br/anvisa",
  "provedor": "openai",
  "endpoint": "https://api.openai.com",
  "secret": "apsen-di-precos-key",
  "vault": "https://apsen-keyvault.vault.azure.net",
  "modelo": "gpt-4o",
  "schedule": "Diário · 03h00",
  "ambiente": "Homologação",
  "limiar": 80,
  "ultimo_teste": { "status": "pendente", "ts": "— não testado" },
  "ativo": false
}
```

Teste: `PATCH /agentes/{id}` `{ "ultimo_teste": { "status": "ok", "ts": "27/10/2026 14:05" } }`.

Schema Zod (`src/infrastructure/agentes/agenteSchema.ts`):

```ts
export const agenteDtoSchema = z.object({
  id: z.string().min(1),
  codigo: z
    .string()
    .regex(/^AG-\d{3,}$/)
    .optional(),
  papel: z.string().min(1),
  nome: z.string().optional(),
  fontes: z.string(),
  provedor: z.enum(['azure-foundry', 'anthropic', 'openai']),
  endpoint: z.string(),
  secret: z.string(),
  vault: z.string(),
  modelo: z.string(),
  schedule: z.string(),
  ambiente: z.string(),
  ultimo_teste: z.object({ status: z.enum(['ok', 'falha', 'pendente']), ts: z.string() }),
  ativo: z.boolean(),
  limiar: z.number().int().min(50).max(100).optional(),
});
```

Erros: inválido → `InvalidResponseError`; 404 → `NotFoundError('Agente', id)`; 5xx/rede/timeout propagados.

## 5. Domínio (`src/domain`)

`src/domain/agentes/`:

- `Agente.ts` — `type Provedor = 'azure-foundry' | 'anthropic' | 'openai'`; `type TesteStatus = 'ok' | 'falha' | 'pendente'`; `interface Agente { id; codigo; papel; nome: string; fontes; provedor; endpoint; secret; vault; modelo; schedule; ambiente; ultimoTeste: { status; ts }; ativo; limiar: number }`; `interface AgenteDraft { papelOpcao; nome; provedor: Provedor | ''; ambiente; endpoint; vault; secret; modelo; schedule; fontes; limiar: number; ativo }`.
- `vocabulario.ts` — `AGENTE_PAPEIS` (6), `AGENTE_PROVEDORES` (3), `AGENTE_AMBIENTES` (3), `AGENTE_MODELOS` (grupos), `AGENTE_SCHEDULES` (5), `LIMIAR_PADRAO = 75` (espelham `config.opcoes`).
- `agenteRules.ts` — `papelCurto(papel)` = `papel.split(' ').slice(0, 2).join(' ')`; `papelDaOpcao(opcao)` = parte antes de " — "; `opcaoDoPapel(papel)`; `ambienteDoSelect(ambiente)` ("Dev" → "Desenvolvimento"); `ambienteTone(ambiente)` e `ambientePillLabel(ambiente)` (RN-06); `resumoAgentes(total, ativos)`; `proximaExecucao(ativos)` → `{ nome; hora } | null` (RN-07); `formatTs(date)` → `dd/mm/aaaa HH:MM`; `nextAgenteCodigo(codigos)`; `validateAgenteDraft(draft)` (RN-04); `optionsComExtra(lista, atual)`.
- `AgenteRepository.ts` — `listPage({page,size})`, `listAtivos()`, `listCodigos()`, `get(id)`, `create`, `update`.
- `AgenteValidationError`.

## 6. Aplicação (`src/application`)

`src/application/agentes/` (`now: () => Date` injetado):

- `ListAgentes(repo)` → `{ rows: AgenteRowDto[]; total; totalPages }`.
- `GetAgentesResumo(repo)` → `{ total; ativos; proxima: { nome; hora } | null; alertaTexto; resumoTexto }`.
- `GetAgenteForm(repo)` → `{ draft; extras: { schedule?: string; modelo?: string } }` (`NotFoundError`).
- `SaveAgente(repo, ids)` → `{ toast: '✅ Agente salvo!' }` (RN-04/RN-05).
- `ToggleAgente(repo)` → `{ toast }` (RN-03).
- `TestarAgente(repo, now)` → `{ toast: '✅ Conexão OK — {papel curto}'; ultimoTeste }` (grava ok + `formatTs(now())`).

## 7. Infraestrutura (`src/infrastructure`)

`src/infrastructure/agentes/{agenteSchema,agenteMapper,HttpAgenteRepository}.ts` — `codigo ?? id`, `nome ?? ''`, `limiar ?? 75`, `ultimo_teste` ↔ `ultimoTeste`; requisições do §4.

## 8. Apresentação (`src/presentation`)

- `queryKeys.agentes = { all: ['agentes'], page: (p) => ['agentes','page',p], resumo: () => ['agentes','resumo'], form: (id) => ['agentes','form',id] }`.
- Hooks: `useAgentesPage` (`keepPreviousData`, 30 s), `useAgentesResumo`, `useAgenteForm(id)`, `useSaveAgenteMutation` (invalida `agentes.all`), `useToggleAgenteMutation` (otimista nas páginas e no resumo, rollback), `useTestarAgenteMutation` (toast inicial em `onMutate`; aguarda `Promise.all([execute, wait(1800)])` — `wait` injetável para fake timers; sucesso atualiza a célula, erro mostra o toast de falha).
- URL: `useListSearchParams` com `page`.
- Feature `src/presentation/features/agentes/`: `AgentesScreen.tsx`, `AgenteFormScreen.tsx`, `components/{AgentesAlert,AgentesTable,ProviderPill,EnvironmentPill,LastTestCell,AgenteStatusCell,AgenteViewModal,AgenteIdentificacaoCard,AgenteKeyVaultCard,AgenteModeloCard,AgenteStatusCard}.tsx`. O "Testar Conexão" do formulário usa `setTimeout(2000)` limpo no unmount; formulário com `useReducer`, `useUnsavedChangesGuard` e foco no primeiro inválido.
- `UseCases.agentes = { list; resumo; getForm; save; toggle; testar }`; `createContainer` registra `HttpAgenteRepository` com `now`.

## 9. Arquivos

### Novos

- `src/domain/agentes/{Agente,vocabulario,agenteRules,AgenteRepository,errors}.ts` e `__tests__/{agenteRules,vocabulario}.test.ts`
- `src/application/agentes/{ListAgentes,GetAgentesResumo,GetAgenteForm,SaveAgente,ToggleAgente,TestarAgente,dto}.ts` e `__tests__/*.test.ts`
- `src/infrastructure/agentes/{agenteSchema,agenteMapper,HttpAgenteRepository}.ts` e `__tests__/HttpAgenteRepository.test.ts`
- `src/presentation/hooks/{useAgentes,useAgenteMutations}.ts` e `__tests__/useAgenteMutations.test.tsx`
- `src/presentation/features/agentes/*` e `__tests__/{AgentesScreen,AgenteViewModal,AgenteFormScreen}.test.tsx`
- `src/app/agentes/{page,loading,error}.tsx`, `novo/page.tsx`, `[id]/editar/{page,loading,not-found}.tsx` e `__tests__/page.test.tsx` em cada pasta

### Modificados

- `queryKeys.ts`, `UseCasesContext.tsx`, `container.ts` (+ teste), `test/renderWithProviders.tsx` — módulo `agentes`.
- `src/presentation/navigation/routes.ts` — `AGENTES_ROUTE`, `AGENTE_NOVO_ROUTE`, `agenteEditarRoute(id)` (se ausentes); `screens.ts` cobre `/agentes/[id]/editar` (nível 4).
- Badge "Agentes Cadastrados" da sidebar: `total` de `useAgentesResumo` (deixa de ser o 5 fixo).
- `src/app/globals.css` — `--color-apsen-anthropic-bg` (claro `#fff8ec`, escuro `#2e2716`) se a onda 1 não criou token para `#FFF8EC`; `DESIGN_SPEC.md` §1; caso em `globals.test.ts`.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RN-01 | Resumo "{n} agentes cadastrados · {a} ativos" e alerta com totais do servidor (ARQUITETURA #18; o texto fixo "5 · 3 · 03h00" vira dado).                                                                                                                                                                                                                                                                                                         |
| RN-02 | Papel curto = duas primeiras palavras separadas por espaço (fiel a L4396/L4402, inclui o emoji).                                                                                                                                                                                                                                                                                                                                                 |
| RN-03 | Toggle grava só `ativo`; toast com o papel curto.                                                                                                                                                                                                                                                                                                                                                                                                |
| RN-04 | Validação [derivado], ordem: papel → "⚠️ Selecione o papel do agente."; nome → "⚠️ Informe o nome de exibição."; provedor → "⚠️ Selecione o provedor."; ambiente → "⚠️ Selecione o ambiente."; endpoint vazio ou sem `https://` → "⚠️ Informe um endpoint https:// válido."; vault → "⚠️ Informe a Key Vault URI."; secret → "⚠️ Informe o Secret Name."; modelo → "⚠️ Selecione o modelo padrão.". Limiar inteiro em 50–100 (o slider garante). |
| RN-05 | Salvar grava `papel = papelDaOpcao`, `nome`, `provedor`, `ambiente`, `endpoint`, `vault`, `secret` (só a referência — RN-SEG-05), `modelo`, `schedule`, `fontes`, `limiar`, `ativo`; textos com `trim`. Novo: `id` UUID (RN-SEG-03), `codigo` = maior `AG-nnn` + 1 (3 dígitos), `ultimo_teste` pendente. Edição: `PATCH` sem `id`, `codigo`, `ultimo_teste`.                                                                                     |
| RN-06 | Pill de ambiente: "Produção" vermelha, "Homologação" amarela, demais verde com texto "Dev"; o select mostra "Desenvolvimento" para "Dev".                                                                                                                                                                                                                                                                                                        |
| RN-07 | Próxima execução: entre os ativos com `schedule` no formato `Diário · HHhMM`, o de menor `HHhMM`; nome = papel sem o primeiro token (emoji). Sem nenhum → "— nenhuma execução agendada". Com a massa: "Agente Regulatório em 03h00".                                                                                                                                                                                                             |
| RN-08 | Teste de conexão determinístico (sucesso) — ARQUITETURA #18; nenhum `Math.random`.                                                                                                                                                                                                                                                                                                                                                               |
| RN-09 | Sem exclusão de agentes (fiel); botões de escrita com a guarda da tela (nível 4) — ARQUITETURA #11.                                                                                                                                                                                                                                                                                                                                              |

## 11. BDD — Cenários de teste unitário

| Cenário                                                                                                              | Arquivo de teste                                                     | Asserção                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-02 RN-06 Dado papéis e ambientes, quando formata, então papel curto, pill e select                                | `src/domain/agentes/__tests__/agenteRules.test.ts`                   | "🏛️ Agente"; "Dev"→"Desenvolvimento"; `ambientePillLabel('Desenvolvimento')` = "Dev" com tom green                                                          |
| RN-07 Dado os ativos da massa, quando calcula a próxima execução, então Agente Regulatório 03h00; sem diários → null | `agenteRules.test.ts`                                                | `{nome:'Agente Regulatório', hora:'03h00'}`; só "H24 · a cada 6h" → `null`                                                                                  |
| RN-05 Dado códigos AG-001…AG-005, quando calcula o próximo, então AG-006; opção ↔ papel                              | `agenteRules.test.ts`                                                | `nextAgenteCodigo`; `papelDaOpcao` e `opcaoDoPapel` ida e volta para os 5 papéis                                                                            |
| RN-04 Dado rascunhos inválidos, quando valida, então mensagens na ordem                                              | `agenteRules.test.ts`                                                | as oito mensagens; endpoint "http://x" inválido                                                                                                             |
| §5 Dado o db.json, quando compara vocabulário, então bate com `config.opcoes`                                        | `src/domain/agentes/__tests__/vocabulario.test.ts`                   | papéis, provedores, ambientes, modelos, schedules                                                                                                           |
| RN-01 Dado totais e ativos, quando GetAgentesResumo executa, então textos                                            | `src/application/agentes/__tests__/GetAgentesResumo.test.ts`         | "5 agentes cadastrados · 3 ativos"; alerta com "Agente Regulatório" e "03h00"                                                                               |
| RN-05 CA-09 Dado rascunho válido, quando SaveAgente cria, então POST com UUID, código e teste pendente               | `SaveAgente.test.ts`                                                 | corpo do §4; edição sem `codigo`/`ultimo_teste` no PATCH                                                                                                    |
| RN-03 CA-03 Dado toggle, quando executa, então PATCH e toast                                                         | `ToggleAgente.test.ts`                                               | "⏸ 🏛️ Agente desativado."                                                                                                                                   |
| RN-08 CA-04 Dado um agente, quando TestarAgente executa, então grava ok com o horário do relógio                     | `TestarAgente.test.ts`                                               | `now` fixo → ts "27/10/2026 14:05"; toast "✅ Conexão OK — 🏛️ Agente"                                                                                       |
| CA-10 Dado AG-003, quando GetAgenteForm executa, então schedule extra; AG-005 ambiente Desenvolvimento               | `GetAgenteForm.test.ts`                                              | `extras.schedule` "H24 · a cada 6h"; 404 → `NotFoundError`                                                                                                  |
| §4 Dado a API, quando o repositório consulta, então queries e schema                                                 | `src/infrastructure/agentes/__tests__/HttpAgenteRepository.test.ts`  | `getPage` com `_page/_limit`; `ativo=true`; `codigo` legado = id; `provedor:'x'` → `InvalidResponseError`                                                   |
| CA-01 CA-02 Dado a massa, quando renderiza, então alerta, resumo e colunas                                           | `src/presentation/features/agentes/__tests__/AgentesScreen.test.tsx` | alerta "5 agentes cadastrados · 3 ativos"; pill "anthropic" com `bg-apsen-anthropic-bg`; AG-005 "Dev"; "✗ Falha — timeout"; nenhum botão de exclusão        |
| CA-03 Dado o toggle, quando a API falha, então rollback                                                              | `AgentesScreen.test.tsx`                                             | otimista + resumo "4 ativos"; volta a "3 ativos" + toast de falha                                                                                           |
| CA-04 Dado "Testar conexão — 🏛️ Agente Regulatório", quando clica, então toasts e célula                             | `AgentesScreen.test.tsx`                                             | fake timers: "⟳ Testando 🏛️ Agente..."; após 1800 ms "✅ Conexão OK — 🏛️ Agente"; botão desabilitado durante; rejeição → "❌ Falha ao conectar — 🏛️ Agente" |
| CA-05 Dado "Visualizar", quando abre, então grade do modal                                                           | `AgenteViewModal.test.tsx`                                           | título "🏛️ Agente Regulatório"; Endpoint `text-apsen-blue`; "✅ Ativo"; "✓ OK" + ts; com `nome` mostra "Nome de exibição"; "Fechar" fecha                   |
| CA-06 Dado "Editar", quando renderiza, então link                                                                    | `AgentesScreen.test.tsx`                                             | `href` `/agentes/AG-001/editar`                                                                                                                             |
| CA-07 Dado `/agentes/novo`, quando renderiza, então cards, padrões e slider                                          | `AgenteFormScreen.test.tsx`                                          | breadcrumb "Novo Agente"; schedule "Diário · 03h00"; slider 75 e "75%"; switch desligado "Inativo"; grupos "Claude (Anthropic)"/"GPT (OpenAI)"              |
| CA-08 Dado "Testar Conexão" do formulário, quando clica, então toasts sem gravar                                     | `AgenteFormScreen.test.tsx`                                          | "⟳ Testando conexão..." → 2000 ms → "✅ Conexão OK — Key Vault e endpoint acessíveis."; `save.execute` não chamado                                          |
| CA-09 Dado papel vazio, quando salva, então erro, foco e toast; válido navega                                        | `AgenteFormScreen.test.tsx`                                          | "⚠️ Selecione o papel do agente."; válido → "✅ Agente salvo!" e `routerMock.push('/agentes')`; "Salvando…"                                                 |
| CA-10 Dado `/agentes/AG-005/editar`, quando carrega, então pré-preenche; inexistente notFound; sujo confirma         | `AgenteFormScreen.test.tsx`                                          | "Editar Agente"; ambiente "Desenvolvimento"; `notFound` em 404; "Descartar alterações?" ao clicar "← Voltar" sujo                                           |
| CA-11 Dado carregando/erro/vazio, quando renderiza, então estados                                                    | `AgentesScreen.test.tsx`                                             | "Carregando…"; "Tentar novamente"; "Nenhum agente cadastrado." + alerta "— nenhuma execução agendada"                                                       |
| §3 Dado as rotas, quando renderiza, então metadata e `params` Promise                                                | `src/app/agentes/**/__tests__/page.test.tsx`                         | títulos; edição `await params`                                                                                                                              |
| §9 Dado o token novo, quando lê o globals.css, então existe nos dois temas                                           | `src/app/__tests__/globals.test.ts`                                  | `--color-apsen-anthropic-bg`                                                                                                                                |

## 12. Requisitos não funcionais

| Item | Como atende                                                                                                                                                                                               |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §7.1 | Tabela paginada no servidor (10), página na URL, `keepPreviousData`. Sem busca/filtro (o protótipo não tem).                                                                                              |
| §7.2 | Rotas próprias, `loading.tsx`, `error.tsx`, `not-found.tsx` (edição), `AgenteViewModal` via `next/dynamic`, guarda (nível 4) antes das queries.                                                           |
| §7.3 | `staleTime` 30 s; toggle otimista com rollback; teste com botão desabilitado (sem duplo clique); "Salvando…"; invalidação só de `agentes.all` (badge da nav incluso). Sem exclusão, logo sem confirmação. |
| §7.4 | Erros por campo, foco no primeiro inválido, toast; endpoint `https://`; limiar 50–100; aviso de alterações não salvas.                                                                                    |
| §7.5 | Ações com nome que inclui o papel; endpoint truncado com `title`; slider com `aria-valuetext` "{n}%"; tabela com 10 colunas rola na horizontal em 360 px; `FormGrid` colapsa.                             |
| §7.6 | RN-SEG-05: só a referência ao secret e a URI do vault, nunca o valor; nada em `console`; IDs UUID (RN-SEG-03).                                                                                            |
