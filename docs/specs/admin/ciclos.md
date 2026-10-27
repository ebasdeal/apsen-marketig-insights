---
status: IN_PROGRESS
fase: 31
area: admin
feature: ciclos
azure-devops-work-item:
---

# Ciclos de Planejamento

## 1. Overview

Porta a tela `ciclos` do protótipo (`docs/Negócio/di-drivers-v2_84.html` L2241–2350, JS `cicloToggle` L4452–4470) e o `modal-ciclo` (L3184–3241) para `/admin/ciclos`, com dados reais da coleção `ciclos` da API local (json-server). O planejador vê os ciclos, cria um ciclo, edita o ciclo pré-preenchido e troca o ciclo ativo, com um único ciclo ativo por vez (RN-TIP-03: "Os Ciclos de Planejamento delimitam janelas temporais… Cada ciclo tem estado próprio"). Tudo persiste via API (ARQUITETURA §5 #13, #21) e segue §7 (qualidade além do protótipo).

Onda 3. Fase provisória 31 (onda 3 → 3x); o orquestrador pode renumerar ao atualizar o índice. Inventário: `docs/prototipo/INVENTARIO.md` §2.7 e §3 (`modal-ciclo`).

**Dependências (assumidas entregues; usar os nomes reais se diferirem, sem duplicar):**

- Plataforma/onda 0: `HttpClient.getPage(path, { query })` → `{ data, total }` (lê `X-Total-Count`, já em `src/infrastructure/http/HttpClient.ts`), `TimeoutError`; registro `src/presentation/navigation/screens.ts` (tela `ciclos`, rota `/admin/ciclos`, nível 3, módulo `admin`, crumb "Ciclos de Planejamento"); guarda de perfil que roda antes das queries; `ToastProvider` + `useToast().show(msg)`; `UseCases` por módulo; `createFakeUseCases(overrides)`; badges da sidebar calculados dos dados.
- Onda 1: `StatusField`, `FormActions`, `Button` variante `orange`, `IconButton`/`IconLink` com `tone`, `Modal`, `FormField` com `error` e rótulo `ReactNode`.
- Utilitários de lista (§7.1): esta spec é a primeira da onda 3 e **cria, se ainda não existirem** (outra onda pode ter criado — reutilizar): `src/presentation/hooks/useListSearchParams.ts` (lê/grava `page`, `size`, `q` e filtros nomeados em `searchParams` com `router.replace`, sem rolar; mudar `q`/filtro volta `page` para 1) e `src/presentation/hooks/useDebouncedValue.ts` (300 ms).

**Decisões [derivado]** (o protótipo não tem a lógica; comportamento coerente com a ARQUITETURA):

- Ciclo novo sem "Ativar imediatamente" fica `rascunho` (o rótulo do toggle desligado no modal já é "Rascunho"). Linha `rascunho` mostra Toggle desligado + "Rascunho"; ligá-lo encerra o ativo. `encerrado` não reabre (Badge "Encerrado", como no protótipo).
- Desligar o toggle do ativo grava `encerrado`.
- Registro novo tem `id` UUID (RN-SEG-03, ARQUITETURA §1) e o código de negócio em `codigo` (`PLP-AAAA-MM`). Registros do `db.json` não têm `codigo`: o mapper usa `codigo = dto.codigo ?? dto.id`. Código novo = mês seguinte ao maior código existente (o protótipo mostra "PLP-2026-09" fixo); datas padrão = 1º e último dia desse mês.
- Editar o ciclo ativo não mostra o `StatusField` (status muda só pelo toggle da tabela); editar um rascunho mostra.

**Perguntas em aberto (não bloqueiam):**

- PO: a contagem "Drivers · ingeridos" de cada ciclo é mantida como está no `db.json` (sem vínculo real — INVENTARIO §6 #3). RN-TIP-03 fala em janelas de registro, aprovação e ingestão por ciclo; o protótipo não usa o ciclo para filtrar nada além dos textos.
- PO: RN-GOV-02/RN-GOV-03 (trilha de auditoria e histórico temporal) não existem no protótipo; a `meta` "Criado em…/Encerrado em…" é o único registro. Fica para o backend real.
- PO: o protótipo não tem exclusão de ciclo (o 🗑 do ativo é só desabilitado). Rascunhos também não têm exclusão aqui.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/admin/ciclos` mostra o header "Ciclos de Planejamento" / "Períodos de planejamento de produção vinculados ao pipeline de drivers" com o botão laranja "+ Novo Ciclo", o `ScreenDesc` 🗓️ (texto de L2256–2259), o `Alert` info do ciclo ativo, o resumo e a tabela, nessa ordem.                                                                                                                                                                                                                             |
| CA-02 | O `Alert` mostra "Ciclo ativo: **{codigo} · {Mês Ano}** — drivers registrados nesta sessão serão vinculados a este ciclo." com o ciclo de status `ativo` (mês/ano por extenso a partir de `inicio`); sem ativo: "Nenhum ciclo ativo — ative um ciclo para vincular os drivers registrados nesta sessão.". O resumo mostra "**{n} ciclos** cadastrados · {a} ativo" com totais do servidor (singular "1 ciclo"; "{a} ativos" se a≠1).                                                                          |
| CA-03 | Tabela paginada no servidor (10 por página, `_sort=inicio&_order=desc`), colunas Código · Descrição · Período · Drivers · Responsável · Status · Ações, visual do protótipo: linha ativa com fundo laranja-claro e código laranja bold, demais com código muted, Descrição = descrição + `meta`, Drivers = número azul + "ingeridos". A paginação só aparece com mais de uma página e a página fica na URL (`?page=`).                                                                                        |
| CA-04 | Status/ações por linha: ativo → Toggle ligado + "Ativo" verde, ✏️ Editar, 👁 Ver drivers, 🗑 desabilitado ("Ciclo ativo — não pode excluir"); rascunho → Toggle desligado + "Rascunho" muted, ✏️ e 👁; encerrado → Badge gray "Encerrado", 👁. 👁 navega para `/admin/ingeridos`.                                                                                                                                                                                                                                  |
| CA-05 | Desligar o toggle do ativo atualiza a linha na hora (otimista), grava `status: "encerrado"` e `meta: "Encerrado em {hoje} · v{versao}"` e mostra "⏸ Ciclo encerrado. Ative outro ciclo para continuar."; se a API falhar, a linha volta ao estado anterior e aparece o toast de falha.                                                                                                                                                                                                                        |
| CA-06 | Ligar o toggle de um rascunho encerra o ativo atual e grava o rascunho como `ativo`, ambos refletidos de forma otimista, com "✅ Ciclo ativado como ciclo corrente."; nunca há dois ativos.                                                                                                                                                                                                                                                                                                                   |
| CA-07 | "+ Novo Ciclo" abre o modal "Novo Ciclo de Planejamento" (carregado com `next/dynamic`) com Código readonly (próximo código, hint "Gerado automaticamente."), Descrição `*`, Data Início `*`/Data Fim `*` (padrão do mês do código), Responsável (Ana Planejadora, Carlos Planejador; padrão o primeiro) e o `StatusField` "Ativar imediatamente" ("Rascunho"/"Ativo") com descrição "Encerra o ciclo {codigo ativo} e ativa este como ciclo corrente." (sem ativo: "Ativa este ciclo como ciclo corrente."). |
| CA-08 | "Criar Ciclo" valida (RN-04): cada campo inválido mostra o erro no próprio `FormField`, o foco vai para o primeiro inválido e o toast mostra a primeira mensagem; válido grava `POST /ciclos` (RN-05) — encerrando antes o ativo se "Ativar imediatamente" estiver ligado —, fecha o modal, mostra "✅ Ciclo criado!" e o badge "Ciclos" da nav passa a contar o novo. Durante o envio o botão fica desabilitado com "Salvando…".                                                                             |
| CA-09 | ✏️ abre o modal "Editar Ciclo de Planejamento" pré-preenchido; "Salvar alterações" valida, grava `PATCH /ciclos/{id}` e mostra "✅ Ciclo atualizado!".                                                                                                                                                                                                                                                                                                                                                        |
| CA-10 | Estados: `loading.tsx` do segmento com skeleton (header + alerta + tabela) e `LoadingState` na troca de página mantendo os dados anteriores; erro (`error.tsx` e `ErrorState` com "Tentar novamente" que refaz a busca); vazio ("Nenhum ciclo cadastrado." na tabela, alerta sem ativo, "0 ciclos"); dados. Falha de escrita → "⚠️ Não foi possível salvar as alterações. Tente novamente." e o modal continua aberto.                                                                                        |
| CA-11 | Fechar o modal com alterações (Cancelar, ✕, Esc ou overlay) pede confirmação "Descartar alterações?" antes de fechar.                                                                                                                                                                                                                                                                                                                                                                                         |

## 3. UX / Fluxo de tela

- Rota: `src/app/admin/ciclos/page.tsx` — Server Component fino, `export const metadata = { title: 'Ciclos de Planejamento' }`, renderiza `<CiclosScreen />`. `src/app/admin/ciclos/loading.tsx` (skeleton) e `src/app/admin/ciclos/error.tsx` (`'use client'`, `ErrorState` com "Tentar novamente" → `reset()`).
- Referências: `DESIGN_SPEC.md` §3.7 `PageHeader`, §3.8 `ScreenDesc`, §3.19 `Alert`, §3.17 `Table`, §3.20 `Toggle`, §3.2 `Badge`, §3.16 `Modal`, §3.15 formulário, §3.14 paginação; `StatusField`/`FormActions`/`orange` nas seções da onda 1.

### Tela (L2241–2350)

| Bloco     | Componente                                               | Detalhe                                                                                                     |
| --------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Header    | `PageHeader`                                             | ação `Button variant="orange" size="sm"` "+ Novo Ciclo"                                                     |
| Descrição | `ScreenDesc icon="🗓️"`                                   | texto de L2256–2259 (com `<strong>` e `<em>Ativo</em>`)                                                     |
| Alerta    | `ActiveCicloAlert` → `Alert tone="info"` `mb-[16px]`     | CA-02                                                                                                       |
| Resumo    | `<p className="mb-[12px] text-[13px] text-apsen-muted">` | `<strong>{n} ciclos</strong> cadastrados · <span className="font-medium text-apsen-green">{a} ativo</span>` |
| Tabela    | `Table` + `rowClassName`                                 | colunas abaixo; `footer` = `Pagination` quando `totalPages > 1`                                             |

| Coluna      | Render                                                                                                                                                                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Código      | `font-mono text-[12px]`; ativo `font-bold text-apsen-orange`; demais `text-apsen-muted`; valor `codigo`                                                                                                                                                                                                                                    |
| Descrição   | `<div className="font-medium">{descricao}</div><div className="text-[11.5px] text-apsen-muted">{meta}</div>`                                                                                                                                                                                                                               |
| Período     | `text-[12.5px] whitespace-nowrap` `{periodo}`                                                                                                                                                                                                                                                                                              |
| Drivers     | `<div className="text-[13px] font-semibold text-apsen-blue">{drivers}</div><div className="text-[11px] text-apsen-muted">ingeridos</div>`                                                                                                                                                                                                  |
| Responsável | `text-[12.5px]`                                                                                                                                                                                                                                                                                                                            |
| Status      | `CicloStatusCell`: `flex items-center gap-[8px]` + `Toggle aria-label="Ciclo {codigo} ativo"` + `<span className="text-[12px] font-medium">` "Ativo" verde / "Rascunho" muted; encerrado → `Badge tone="gray"` "Encerrado"                                                                                                                 |
| Ações       | `IconButton` lápis (L2300) `aria-label="Editar ciclo {codigo}"`; `IconLink` olho (L2303) `aria-label="Ver drivers do ciclo {codigo}"` `href="/admin/ingeridos"`; só no ativo: `IconButton` lixeira (L2306) `disabled title="Ciclo ativo — não pode excluir" aria-label="Excluir ciclo {codigo}" className="cursor-not-allowed opacity-30"` |

Linha ativa: `rowClassName` → `bg-apsen-orange-row` (token de `#FFFBF5`, ver §9). Toggle desabilitado enquanto a mutação da linha está pendente.

### Modal (L3184–3241)

`CicloModal` (via `next/dynamic`), `Modal size="md"`, título "Novo Ciclo de Planejamento" / "Editar Ciclo de Planejamento":

1. `FormField label="Código" required hint="Gerado automaticamente."` → `TextInput readOnly className="font-mono"` (próximo código ou o `codigo` em edição).
2. `FormField label="Descrição" required error` → `TextInput placeholder="Ex: Planejamento Setembro 2026"`.
3. `FormGrid columns={2}`: Data Início `*` e Data Fim `*` (`TextInput type="date"`; fim com `min` = início).
4. `FormField label="Responsável"` → `FormSelect` com `RESPONSAVEIS_CICLO` (+ o valor atual como opção extra se não estiver na lista).
5. `StatusField title="Ativar imediatamente" description=… onLabel="Ativo" offLabel="Rascunho"` (não renderiza ao editar o ativo).

Rodapé: `Button variant="ghost" size="sm"` "Cancelar" · `Button variant="orange" size="sm"` "Criar Ciclo" / "Salvar alterações" ("Salvando…" e desabilitado durante o envio). Abrir em "novo" sempre reinicia o formulário.

### Textos (pt-BR)

| Situação                    | Texto                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| criar ok                    | "✅ Ciclo criado!"                                                                                                                     |
| editar ok [derivado]        | "✅ Ciclo atualizado!"                                                                                                                 |
| encerrar                    | "⏸ Ciclo encerrado. Ative outro ciclo para continuar."                                                                                 |
| ativar                      | "✅ Ciclo ativado como ciclo corrente."                                                                                                |
| falha de escrita [derivado] | "⚠️ Não foi possível salvar as alterações. Tente novamente."                                                                           |
| descartar [derivado]        | `ConfirmDialog` "Descartar alterações?" / "As alterações feitas neste formulário serão perdidas." · "Continuar editando" · "Descartar" |
| validação [derivado]        | RN-04                                                                                                                                  |

`ConfirmDialog` é criado pela spec [fontes](fontes.md) (fase 32); se esta spec for implementada antes, ela o cria com a API definida lá.

## 4. Contratos de API consumidos

Base `NEXT_PUBLIC_API_URL` (padrão `http://localhost:3001`).

| Uso                        | Requisição                                                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| página da tabela           | `GET /ciclos?_page={p}&_limit={size}&_sort=inicio&_order=desc` via `getPage` → `{ data, total }`                                                                                                 |
| total                      | `total` da própria página (`X-Total-Count`)                                                                                                                                                      |
| ativo + contagem de ativos | `GET /ciclos?status=ativo&_page=1&_limit=1` via `getPage` (`data[0]` = ativo, `total` = ativos)                                                                                                  |
| próximo código             | `GET /ciclos` (coleção inteira, só para calcular o maior código; exceção justificada: a geração do código é responsabilidade do servidor no backend real e a coleção é administrativa e pequena) |
| criar                      | `POST /ciclos` → `201`                                                                                                                                                                           |
| editar / encerrar / ativar | `PATCH /ciclos/{id}` → `200` (`404` se não existe)                                                                                                                                               |

Exemplo do `db.json` (sem `codigo`):

```json
{
  "id": "PLP-2026-07",
  "descricao": "Planejamento Julho 2026",
  "meta": "Criado em 01/06/2026 · v1",
  "inicio": "2026-07-01",
  "fim": "2026-07-31",
  "periodo": "01/07 → 31/07/2026",
  "drivers": 4,
  "responsavel": "Ana Planejadora",
  "status": "ativo",
  "versao": 1
}
```

Payload do `POST` (ativar ligado, hoje = 27/10/2026):

```json
{
  "id": "3f6c1e0a-6d2b-4c51-9a77-2b1f0d6c9e10",
  "codigo": "PLP-2026-08",
  "descricao": "Planejamento Agosto 2026",
  "meta": "Criado em 27/10/2026 · v1",
  "inicio": "2026-08-01",
  "fim": "2026-08-31",
  "periodo": "01/08 → 31/08/2026",
  "drivers": 0,
  "responsavel": "Ana Planejadora",
  "status": "ativo",
  "versao": 1
}
```

`PATCH` de encerramento: `{ "status": "encerrado", "meta": "Encerrado em 27/10/2026 · v1" }`. `PATCH` de edição: `{ "descricao", "inicio", "fim", "periodo", "responsavel" }` (+ `"status": "ativo"` quando um rascunho é ativado no modal).

Schema Zod (`src/infrastructure/ciclos/cicloSchema.ts`):

```ts
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const cicloDtoSchema = z.object({
  id: z.string().min(1),
  codigo: z
    .string()
    .regex(/^PLP-\d{4}-\d{2}$/)
    .optional(),
  descricao: z.string(),
  meta: z.string(),
  inicio: isoDate,
  fim: isoDate,
  periodo: z.string(),
  drivers: z.number().int().nonnegative(),
  responsavel: z.string(),
  status: z.enum(['ativo', 'encerrado', 'rascunho']),
  versao: z.number().int().positive(),
});
export const cicloListSchema = z.array(cicloDtoSchema);
```

Erros: payload inválido (inclusive `id` legado que não casa `PLP-AAAA-MM` quando `codigo` falta) → `InvalidResponseError`; `404` no `PATCH` → `NotFoundError('Ciclo', id)`; 5xx/rede/timeout → `HttpError`/`NetworkError`/`TimeoutError` propagados (leitura → `ErrorState`; escrita → rollback + toast de falha).

## 5. Domínio (`src/domain`)

`src/domain/ciclos/`:

- `Ciclo.ts` — `type CicloStatus = 'ativo' | 'encerrado' | 'rascunho'`; `interface Ciclo { id; codigo; descricao; meta; inicio; fim; periodo; drivers; responsavel; status; versao }` (`readonly`); `interface CicloDraft { descricao; inicio; fim; responsavel; ativar: boolean }`; `type CicloField = 'descricao' | 'inicio' | 'fim'`.
- `cicloRules.ts` (puras):
  - `nextCicloCodigo(codigos: readonly string[], today: Date): string` — maior `PLP-AAAA-MM` por (ano, mês) + 1 mês (dez → jan do ano seguinte); sem código válido usa o mês de `today`.
  - `defaultPeriodo(codigo): { inicio; fim }`; `formatPeriodo(inicio, fim)` → `"dd/mm → dd/mm/aaaa"` (mesmo ano) ou `"dd/mm/aaaa → dd/mm/aaaa"`; `formatDateBr(date)`.
  - `metaCriado(today, versao)` → `"Criado em {dd/mm/aaaa} · v{versao}"`; `metaEncerrado(today, versao)` → `"Encerrado em {dd/mm/aaaa} · v{versao}"`.
  - `mesAno(inicio)` → "Julho 2026" (tabela fixa de meses pt-BR).
  - `validateCicloDraft(draft): Partial<Record<CicloField, string>>` — RN-04 (objeto vazio = válido); `firstError(errors, order)` devolve a primeira mensagem na ordem dos campos.
  - `RESPONSAVEIS_CICLO = ['Ana Planejadora', 'Carlos Planejador'] as const` (espelha `config.opcoes.responsaveisCiclo`).
- `CicloRepository.ts` — `listPage(q: { page; size }): Promise<{ items: Ciclo[]; total }>`; `findAtivo(): Promise<{ ativo: Ciclo | null; totalAtivos: number }>`; `listCodigos(): Promise<string[]>`; `create(ciclo): Promise<Ciclo>`; `update(id, patch): Promise<Ciclo>`.
- `CicloValidationError extends DomainError` com `errors: Partial<Record<CicloField, string>>` e `message` = primeira mensagem.
- `IdGenerator` — porta compartilhada `src/domain/shared/IdGenerator.ts` (`next(): string`), criada aqui se não existir; implementação `crypto.randomUUID()` em `src/infrastructure/shared/CryptoIdGenerator.ts`.

## 6. Aplicação (`src/application`)

`src/application/ciclos/` (portas no construtor; `now: () => Date` injetado):

- `ListCiclos(repo)` → `execute({ page, size }): Promise<CiclosPageDto>` — `{ rows: CicloRowDto[]; total; totalPages }` (`CicloRowDto` = campos de exibição + `id`, `codigo`, `status`, `inicio`, `fim`).
- `GetCiclosResumo(repo, now)` → `execute(): Promise<CiclosResumoDto>` — `{ total; ativos; ativo: { id; codigo; mesAno } | null; proximoCodigo; proximoPeriodo }` (`total` via `listPage({page:1,size:1})`).
- `SaveCiclo(repo, ids: IdGenerator, now)` → `execute({ modo: 'novo' | 'editar'; id?: string; draft }): Promise<{ toast: string }>` — valida (lança `CicloValidationError`); se `ativar` e há outro ativo, encerra-o primeiro (RN-02); `novo` cria (RN-05); `editar` faz `PATCH` (RN-06).
- `ToggleCiclo(repo, now)` → `execute({ id, ativo }): Promise<{ toast: string; encerradoId: string | null }>` — RN-02/RN-03.

## 7. Infraestrutura (`src/infrastructure`)

- `src/infrastructure/ciclos/cicloSchema.ts` (§4); `cicloMapper.ts` (`toCiclo(dto)` com `codigo = dto.codigo ?? dto.id`; `toCicloDto(ciclo)`).
- `src/infrastructure/ciclos/HttpCicloRepository.ts` — `implements CicloRepository` sobre `HttpClient` com as requisições do §4; toda resposta passa pelo schema (`safeParse` falho → `InvalidResponseError('Resposta de /ciclos inválida')`); `HttpError` 404 → `NotFoundError('Ciclo', id)`; ids em URL com `encodeURIComponent`.
- `src/infrastructure/shared/CryptoIdGenerator.ts` (se não existir).

Sem repositório em memória (ARQUITETURA §1).

## 8. Apresentação (`src/presentation`)

- `queryKeys.ciclos = { all: ['ciclos'] as const, page: (p: { page: number; size: number }) => ['ciclos', 'page', p] as const, resumo: () => ['ciclos', 'resumo'] as const }`.
- Hooks: `useCiclosPage({ page, size })` (`placeholderData: keepPreviousData`, `staleTime` 30 s, prefetch da próxima página); `useCiclosResumo()`; `useSaveCicloMutation()` (invalida `queryKeys.ciclos.all`); `useToggleCicloMutation()` — **otimista** (`onMutate` cancela e atualiza as páginas em cache e o resumo; `onError` restaura o snapshot + toast de falha; `onSettled` invalida `queryKeys.ciclos.all`).
- Estado da URL com `useListSearchParams` (`page`, `size`); sem store zustand.
- Feature `src/presentation/features/ciclos/`: `CiclosScreen.tsx` (`'use client'`), `components/{ActiveCicloAlert,CiclosSummary,CiclosTable,CicloStatusCell,CicloModal,CicloFormFields}.tsx`; o formulário controlado usa `useState`, guarda os erros por campo e foca o primeiro inválido via refs.
- `UseCases.ciclos = { list; resumo; save; toggle }` (`Pick<…,'execute'>`); `createContainer` registra `HttpCicloRepository`, `CryptoIdGenerator` e os casos de uso com `now`.

## 9. Arquivos

### Novos

- `src/domain/ciclos/{Ciclo,cicloRules,CicloRepository,CicloValidationError}.ts`, `src/domain/ciclos/__tests__/cicloRules.test.ts`
- `src/domain/shared/IdGenerator.ts` (se ausente)
- `src/application/ciclos/{ListCiclos,GetCiclosResumo,SaveCiclo,ToggleCiclo,dto}.ts` e `__tests__/{ListCiclos,GetCiclosResumo,SaveCiclo,ToggleCiclo}.test.ts`
- `src/infrastructure/ciclos/{cicloSchema,cicloMapper,HttpCicloRepository}.ts` e `__tests__/HttpCicloRepository.test.ts`
- `src/infrastructure/shared/CryptoIdGenerator.ts` e `__tests__/CryptoIdGenerator.test.ts` (se ausente)
- `src/presentation/hooks/{useCiclos,useCicloMutations}.ts` e `__tests__/useCiclos.test.tsx`
- `src/presentation/hooks/{useListSearchParams,useDebouncedValue}.ts` e testes (se ausentes)
- `src/presentation/features/ciclos/CiclosScreen.tsx`, `components/*.tsx` (§8), `__tests__/{CiclosScreen,CiclosTable,CicloModal}.test.tsx`
- `src/app/admin/ciclos/{page,loading,error}.tsx` e `__tests__/page.test.tsx`

### Modificados

- `src/presentation/hooks/queryKeys.ts` — grupo `ciclos`.
- `src/presentation/providers/UseCasesContext.tsx` — módulo `ciclos`; `src/main/container.ts` e `src/main/__tests__/container.test.ts`.
- `test/renderWithProviders.tsx` — stubs de `ciclos`.
- `src/presentation/components/ui/Table.tsx` — prop opcional `rowClassName?: (row: T) => string` no `<tr>` (comportamento atual preservado) + caso no `Table.test.tsx`.
- `src/app/globals.css` — `--color-apsen-orange-row` (claro `#fffbf5`, escuro `#2a2016`) no `@theme` e em `html.dark`, se a onda 1 não criou equivalente para `#FFFBF5`; documentar em `docs/design/DESIGN_SPEC.md` §1; caso em `src/app/__tests__/globals.test.ts`.
- Badge "Ciclos" da sidebar (onda 0): fonte = `total` de `useCiclosResumo()`.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Ciclo ativo = registro com `status: "ativo"` (ARQUITETURA #21, RN-TIP-03). Alerta, `StatusField` e resumo usam esse registro e os totais do servidor, nunca "PLP-2026-07" fixo.                                                                                                                                               |
| RN-02 | Um ativo por vez: ativar (toggle ou "Ativar imediatamente") primeiro encerra o ativo atual (`status: "encerrado"`, `meta: metaEncerrado(hoje, versao)`) e depois grava o novo como `ativo`.                                                                                                                                   |
| RN-03 | Desligar o toggle do ativo grava `encerrado` com a `meta` de encerramento. Encerrado não volta a ativo pela tela. Rascunho mostra toggle desligado.                                                                                                                                                                           |
| RN-04 | Validação [derivado], ordem descricao → inicio → fim: descrição vazia (após `trim`) → "⚠️ Informe a descrição."; início vazio → "⚠️ Informe a data de início."; fim vazio → "⚠️ Informe a data fim."; fim < início → "⚠️ A data fim não pode ser anterior à data início." (ARQUITETURA #10: obrigatório = `*`; início ≤ fim). |
| RN-05 | Ciclo novo: `id` = UUID (RN-SEG-03), `codigo = nextCicloCodigo` (maior + 1 mês), `drivers: 0`, `versao: 1`, `meta: metaCriado(hoje, 1)`, `periodo: formatPeriodo(inicio, fim)`, `status: ativar ? 'ativo' : 'rascunho'`, descrição com `trim`.                                                                                |
| RN-06 | Edição grava `descricao`, `inicio`, `fim`, `periodo` recalculado e `responsavel`; não muda `id`, `codigo`, `drivers`, `versao` nem `meta`. Rascunho com "Ativar imediatamente" aplica RN-02.                                                                                                                                  |
| RN-07 | Botões de escrita seguem o protótipo, sem checagem extra além da guarda da tela (nível 3) — ARQUITETURA #11, RN-ACS-04.                                                                                                                                                                                                       |

## 11. BDD — Cenários de teste unitário

| Cenário                                                                                                                                 | Arquivo de teste                                                                             | Asserção                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-05 Dado códigos até PLP-2026-07, quando calcula o próximo, então PLP-2026-08; com PLP-2026-12, PLP-2027-01; sem códigos, mês de hoje | `src/domain/ciclos/__tests__/cicloRules.test.ts`                                             | `nextCicloCodigo`; `defaultPeriodo('PLP-2026-02')` = 2026-02-01/2026-02-28                                                                                                                                                 |
| RN-05 Dado datas, quando formata, então gera período e meta                                                                             | `cicloRules.test.ts`                                                                         | "01/07 → 31/07/2026"; anos diferentes com ano nos dois lados; "Criado em 27/10/2026 · v1"; `mesAno('2026-07-01')` = "Julho 2026"                                                                                           |
| RN-04 Dado rascunhos inválidos, quando valida, então devolve os erros por campo e a primeira mensagem na ordem                          | `cicloRules.test.ts`                                                                         | as quatro mensagens; `{}` para válido; `firstError` = descrição quando todos faltam                                                                                                                                        |
| CA-03 Dado uma página da API, quando ListCiclos executa, então devolve linhas e total                                                   | `src/application/ciclos/__tests__/ListCiclos.test.ts`                                        | repositório falso recebe `{page:2,size:10}`; `totalPages` = `ceil(total/size)`; `codigo` legado = `id`                                                                                                                     |
| CA-02 RN-01 Dado o ativo, quando GetCiclosResumo executa, então devolve totais, ativo e próximo código                                  | `GetCiclosResumo.test.ts`                                                                    | `{total:3, ativos:1, ativo:{codigo:'PLP-2026-07', mesAno:'Julho 2026'}, proximoCodigo:'PLP-2026-08'}`; sem ativo → `ativo: null`                                                                                           |
| RN-02 CA-08 Dado "Ativar imediatamente", quando SaveCiclo cria, então encerra o ativo antes e cria com UUID e código                    | `SaveCiclo.test.ts`                                                                          | ordem `update(ativoId, {status:'encerrado', meta})` → `create({id:<id do gerador>, codigo:'PLP-2026-08', status:'ativo', drivers:0, versao:1})`; toast "✅ Ciclo criado!"                                                  |
| RN-05 Dado ativar desligado, quando cria, então grava rascunho sem encerrar                                                             | `SaveCiclo.test.ts`                                                                          | `status:'rascunho'`; `update` não chamado                                                                                                                                                                                  |
| RN-06 CA-09 Dado edição, quando salva, então PATCH só dos editáveis                                                                     | `SaveCiclo.test.ts`                                                                          | `update(id, {descricao, inicio, fim, periodo, responsavel})`; toast "✅ Ciclo atualizado!"                                                                                                                                 |
| RN-04 Dado rascunho inválido, quando SaveCiclo executa, então lança CicloValidationError com os erros e não grava                       | `SaveCiclo.test.ts`                                                                          | `errors.descricao` = "⚠️ Informe a descrição."; repositório intocado                                                                                                                                                       |
| RN-03 CA-05 Dado o ativo, quando ToggleCiclo desliga, então grava encerrado                                                             | `ToggleCiclo.test.ts`                                                                        | `update` com encerrado/meta; toast "⏸ Ciclo encerrado. Ative outro ciclo para continuar."                                                                                                                                  |
| RN-02 CA-06 Dado um rascunho, quando ToggleCiclo liga, então encerra o ativo e ativa o rascunho                                         | `ToggleCiclo.test.ts`                                                                        | duas chamadas na ordem; `encerradoId` = id do antigo ativo; toast "✅ Ciclo ativado como ciclo corrente."                                                                                                                  |
| §4 Dado respostas da API, quando o repositório lê e grava, então usa as queries e valida                                                | `src/infrastructure/ciclos/__tests__/HttpCicloRepository.test.ts`                            | `getPage('/ciclos', {query:{_page:'1',_limit:'10',_sort:'inicio',_order:'desc'}})`; `findAtivo` com `status=ativo`; `POST`/`PATCH` com o corpo; item sem `status` → `InvalidResponseError`; 404 → `NotFoundError`          |
| CA-01 CA-02 CA-03 Dado a massa, quando a tela renderiza, então mostra header, alerta, resumo e linhas                                   | `src/presentation/features/ciclos/__tests__/CiclosScreen.test.tsx`                           | `heading` "Ciclos de Planejamento"; "+ Novo Ciclo"; alerta com "PLP-2026-07 · Julho 2026"; "3 ciclos"/"1 ativo"; linha ativa `bg-apsen-orange-row`; sem paginação com 3 itens                                              |
| CA-03 Dado `?page=2`, quando renderiza, então pede a página 2 e a troca de página grava a URL                                           | `CiclosScreen.test.tsx`                                                                      | `list.execute` com `{page:2,size:10}`; clicar "Próxima página" → `routerMock.replace` com `page=3`                                                                                                                         |
| CA-04 Dado as linhas, quando renderiza, então status e ações variam por status                                                          | `CiclosTable.test.tsx`                                                                       | ativo: `switch` "Ciclo PLP-2026-07 ativo" marcado + "Excluir ciclo PLP-2026-07" desabilitado com `title`; encerrado: "Encerrado" e só "Ver drivers…" (`href` `/admin/ingeridos`); rascunho: switch desmarcado + "Rascunho" |
| CA-05 Dado o toggle do ativo, quando clica e a API falha, então a linha muda na hora e volta                                            | `CiclosScreen.test.tsx`                                                                      | após o clique (antes de resolver) a linha mostra "Encerrado"; com `toggle.execute` rejeitando, volta a "Ativo" e mostra "⚠️ Não foi possível salvar as alterações. Tente novamente."                                       |
| CA-06 Dado um rascunho, quando liga o toggle, então mostra o toast de ativação                                                          | `CiclosScreen.test.tsx`                                                                      | `toggle.execute({id, ativo:true})`; toast "✅ Ciclo ativado como ciclo corrente."                                                                                                                                          |
| CA-07 Dado "+ Novo Ciclo", quando abre, então o modal vem com código, datas padrão e toggle desligado                                   | `CicloModal.test.tsx`                                                                        | `dialog` "Novo Ciclo de Planejamento"; código "PLP-2026-08" readonly; datas 2026-08-01/31; "Rascunho"; descrição do StatusField com "PLP-2026-07"                                                                          |
| CA-08 Dado descrição vazia, quando clica "Criar Ciclo", então mostra erro no campo, foca e mantém aberto                                | `CicloModal.test.tsx`                                                                        | campo "Descrição" com `aria-invalid="true"` e descrição acessível "⚠️ Informe a descrição."; `toHaveFocus()`; toast com a mensagem; diálogo presente                                                                       |
| CA-08 Dado envio em andamento, quando clica de novo, então não reenvia                                                                  | `CicloModal.test.tsx`                                                                        | botão "Salvando…" desabilitado; `save.execute` chamado uma vez                                                                                                                                                             |
| CA-09 Dado ✏️ no ativo, quando abre, então pré-preenchido e sem StatusField                                                             | `CicloModal.test.tsx`                                                                        | "Editar Ciclo de Planejamento"; valores de PLP-2026-07; sem switch "Ativar imediatamente"; "Salvar alterações"                                                                                                             |
| CA-10 Dado carregando, erro e vazio, quando renderiza, então mostra os estados                                                          | `CiclosScreen.test.tsx`                                                                      | "Carregando…"; `ErrorState` + "Tentar novamente" chama `list.execute` de novo; vazio "Nenhum ciclo cadastrado." + "Nenhum ciclo ativo…"                                                                                    |
| CA-10 Dado falha HTTP ao salvar, quando salva, então toast de falha e modal aberto                                                      | `CicloModal.test.tsx`                                                                        | `HttpError` → "⚠️ Não foi possível salvar as alterações. Tente novamente."                                                                                                                                                 |
| CA-11 Dado o modal com descrição digitada, quando clica Cancelar, então pede confirmação                                                | `CicloModal.test.tsx`                                                                        | `dialog` "Descartar alterações?"; "Continuar editando" mantém; "Descartar" fecha; sem alterações fecha direto                                                                                                              |
| RN-07 Dado perfil Planejador, quando acessa, então vê os botões de escrita                                                              | `CiclosScreen.test.tsx`                                                                      | "+ Novo Ciclo" presente                                                                                                                                                                                                    |
| §3 Dado a rota, quando renderiza, então exporta metadata, loading e error                                                               | `src/app/admin/ciclos/__tests__/page.test.tsx`                                               | `metadata.title` = "Ciclos de Planejamento"; `loading` renderiza o skeleton; `error` mostra "Tentar novamente" e chama `reset`                                                                                             |
| §9 Dado o token novo, quando lê o globals.css, então existe nos dois temas                                                              | `src/app/__tests__/globals.test.ts`                                                          | `--color-apsen-orange-row` no `@theme` e em `html.dark`                                                                                                                                                                    |
| §12 Dado o hook de URL, quando muda `q` ou filtro, então volta para a página 1; e o debounce espera 300 ms                              | `src/presentation/hooks/__tests__/useListSearchParams.test.tsx`, `useDebouncedValue.test.ts` | `routerMock.replace` com `page` removido/1; `vi.advanceTimersByTime(299)` não emite, 300 emite                                                                                                                             |

## 12. Requisitos não funcionais

ARQUITETURA §7, itens aplicáveis:

| Item                       | Como esta tela atende                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §7.1 Paginação no servidor | `_page`/`_limit` + `X-Total-Count`, tamanho 10, sem seletor (coleção < 50); `keepPreviousData`; prefetch da próxima página. Sem busca/filtro (o protótipo não tem). |
| §7.1 Estado na URL         | `?page=` (e `size` se presente) via `useListSearchParams`; F5 e voltar mantêm a página.                                                                             |
| §7.2 Rota e carregamento   | rota própria; `loading.tsx` com skeleton; `error.tsx` com "Tentar novamente"; `CicloModal` via `next/dynamic`; a guarda (onda 0) roda antes das queries.            |
| §7.3 Cache                 | `staleTime` 30 s; mutações invalidam só `queryKeys.ciclos.all` (e o badge da nav lê dela); toggle otimista com rollback; botão "Salvando…".                         |
| §7.4 Formulário            | validação por campo + foco no primeiro inválido + toast; início ≤ fim (`min` no input de fim); aviso de alterações não salvas ao fechar o modal sujo (CA-11).       |
| §7.5 A11y/responsivo       | `Table` com `caption` "Ciclos de planejamento" e `scope`; toggles com nome; modal com focus trap; tabela com scroll horizontal até 360 px; `FormGrid` colapsa.      |
| §7.6 Segurança             | IDs UUID (RN-SEG-03); nenhum `console.*`; responsável é nome de pessoa exibido como no protótipo, sem e-mail.                                                       |
