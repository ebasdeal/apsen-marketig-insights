---
status: READY
fase: 32
area: admin
feature: fontes
azure-devops-work-item:
---

# Fontes de Dados / APIs

## 1. Overview

Porta a tela `fontes` (`docs/Negócio/di-drivers-v2_84.html` L3070–3087, JS `renderFontes`…`fonteExcluir` L7153–7404) e o `modal-fonte` (L3468–3565) para `/admin/fontes`, com a coleção `fontes` da API local. O admin DI vê as integrações, cria uma fonte nova, configura modo (mock/API), URL, autenticação, cache e mapeamento, testa a conexão (simulada) e remove fontes personalizadas. Atende RN-FON-01 (cadastro com modo, URL, autenticação, cache e mapeamento) e RN-FON-02 (personalizadas podem ser excluídas; fixas são protegidas). As fontes também alimentam as opções "Fonte de dados (API)" do tipo-form (RN-FON-03, RN-TIP-02 — spec [tipos](tipos.md)).

Onda 3, fase provisória 32. Inventário §2.12 e §3 (`modal-fonte`). Gravação de todos os campos do modal exceto o token (ARQUITETURA #20, RN-SEG-05).

**Dependências:** as mesmas da spec [ciclos](ciclos.md) §1 (plataforma/onda 0, onda 1, `useListSearchParams`, `IdGenerator`). Da onda 1: `ModeSelector` (accent blue), `Modal` 620px, `FormActions`. Esta spec **cria no UI kit** `ConfirmDialog` (§8), usado por todas as exclusões das ondas 3 e 4 (ARQUITETURA §7.3: excluir sempre confirma); se outra onda já tiver criado um equivalente, reutilizar.

**Decisões [derivado]:**

- Fonte nova recebe `id` UUID (RN-SEG-03). O protótipo usa o slug do nome como `id`; aqui o slug só serve para detectar nome repetido ("⚠️ Já existe uma fonte com este nome.").
- `mapValor`/`mapLabel` (JSON paths) passam a ser gravados; nas fontes do `db.json` que não os têm, o mapper usa os padrões do protótipo `"nome"`/`"razao_social"`.
- Exclusão usa `ConfirmDialog` em vez de `confirm()`, com o texto do protótipo.

**Perguntas em aberto:**

- PO: o protótipo só valida a URL no modo API para fonte **nova**; configurar uma fonte existente como API sem URL é aceito (o card mostra "GET (sem URL)"). Mantido fiel.
- PO: cache `0` vira `60` no protótipo (`+valor || 60`). Mantido fiel.
- PO: RN-FON-04 cita busca hierárquica e consulta externa parametrizada; o autocomplete de concorrentes consulta `/concorrentes` (ARQUITETURA #20) e não usa o modo configurado aqui. Sem mudança nesta spec.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/admin/fontes` mostra o header "Fontes de Dados / APIs" / "Configuração de integrações externas · Admin DI" com o botão azul sólido "+ Nova Fonte de Dados", o `ScreenDesc` 🔌 (L3082–3083) e a lista de cards paginada no servidor (10 por página; paginação só com mais de uma página; página na URL).                                                                                                             |
| CA-02 | Cada card mostra ícone (26px), nome + pill de status ("🔌 API externa ativa" verde ou "📦 Lista interna (mock)" neutra), descrição e, no modo API, a linha mono "GET {url ou (sem URL)} · auth: {auth} · cache: {n}min"; botões "⚙️ Configurar" e, só em fontes personalizadas (`_custom`), "🗑".                                                                                                                      |
| CA-03 | "+ Nova Fonte de Dados" abre o modal "Nova Fonte de Dados" (620px, `next/dynamic`) com a seção de identificação (Nome `*`, Ícone com 9 opções, Descrição), o seletor de modo "📦 Lista interna (mock)" / "🔌 API externa" com o hint do modo e, no modo API, a caixa de configuração (URL `*` com hint `?busca=`, autenticação, cache, token se auth ≠ "Nenhuma", JSON paths de valor e rótulo, "🔍 Testar conexão"). |
| CA-04 | "⚙️ Configurar" abre "Configurar: {nome}" sem a seção de identificação, pré-preenchido com modo, URL, autenticação, cache e JSON paths da fonte.                                                                                                                                                                                                                                                                      |
| CA-05 | "🔍 Testar conexão" sem URL mostra (no resultado, fundo vermelho-claro) "⚠️ Informe a URL do endpoint antes de testar."; com URL mostra "⟳ Testando conexão com {url}..." e, após 1,2 s, "✅ Conexão simulada com sucesso — 3 registros retornados em 142ms." + a nota "(Mockup: no sistema real, este teste faz uma chamada HTTP verdadeira ao endpoint.)". Não grava nada.                                          |
| CA-06 | "Salvar configuração" em fonte nova valida (RN-03), grava `POST /fontes` (RN-04), fecha o modal e mostra `✅ Nova fonte "{nome}" adicionada.`; em fonte existente grava `PATCH /fontes/{id}` (RN-05) e mostra "✅ Fonte configurada para API externa." ou "✅ Fonte configurada para lista interna.". Botão "Salvando…" desabilitado durante o envio.                                                                 |
| CA-07 | "🗑" abre o `ConfirmDialog` `Remover a fonte "{nome}"?`; confirmar remove o card na hora (otimista), faz `DELETE /fontes/{id}` e mostra "Fonte removida."; falha restaura o card e mostra o toast de falha. Fontes fixas não têm o botão.                                                                                                                                                                              |
| CA-08 | Estados: `loading.tsx` com skeleton de cards, erro com "Tentar novamente", vazio (`EmptyState` 🔌 "Nenhuma fonte cadastrada" / "Clique em "+ Nova Fonte de Dados" para configurar a primeira."), dados.                                                                                                                                                                                                               |
| CA-09 | O token digitado nunca é enviado à API nem guardado em cache/estado global; some ao fechar o modal.                                                                                                                                                                                                                                                                                                                   |

## 3. UX / Fluxo de tela

- Rota `src/app/admin/fontes/page.tsx` (`metadata.title = 'Fontes de Dados / APIs'`, renderiza `<FontesScreen />`), `loading.tsx`, `error.tsx`.
- Referências: `DESIGN_SPEC.md` §3.5 `Card`, §3.7, §3.8, §3.16 `Modal`, §3.15 formulário, §3.1 `Button`; `ModeSelector` da onda 1.

### Card (`FonteCard`, L7178–7197)

`Card className="mb-[12px] px-[18px] py-[16px]"` → `flex items-start gap-[14px]`: ícone `text-[26px] shrink-0` · bloco `flex-1` (linha `flex items-center gap-[10px] mb-[3px]` com nome `text-[14px] font-semibold text-apsen-slate` e pill `rounded-[20px] px-[9px] py-[2px] text-[11px] font-semibold` — API `bg-apsen-green-bg text-apsen-green`, mock `bg-apsen-bg text-apsen-muted`; descrição `mb-[8px] text-[12.5px] leading-[1.5] text-apsen-muted`; linha API `rounded-[6px] bg-apsen-bg px-[10px] py-[6px] font-mono text-[11.5px] text-apsen-muted`) · ações `flex shrink-0 gap-[6px]`: `Button variant="ghost" size="sm"` "⚙️ Configurar" (`aria-label="Configurar {nome}"`) e, se personalizada, `Button variant="ghost" size="sm" className="text-apsen-red"` "🗑" (`aria-label="Remover a fonte {nome}"`).

### Modal (`FonteModal`, L3468–3565)

`Modal` 620px, título "Nova Fonte de Dados" / "Configurar: {nome}", corpo `flex flex-col gap-[14px]`:

1. Só em nova: bloco `flex flex-col gap-[12px] border-b border-apsen-border pb-[14px]` com `FormGrid columns={2}` (Nome da fonte `*` placeholder "Ex: Distribuidores / Redes de Farmácia"; Ícone `FormSelect` `FONTE_ICONES`, padrão 🔌) e Descrição (placeholder "Onde esta fonte é usada no sistema").
2. "Modo de operação": `ModeSelector` com `mock` "📦 Lista interna (mock)" e `api` "🔌 API externa" (ativo azul sólido, inativo branco/borda/muted, `flex-1`, `p-[10px]`, `rounded-apsen`, `text-[12.5px] font-semibold`) + hint "Usa a lista interna do sistema. Sem chamada de rede." / "Consulta a API externa em tempo real a cada busca do usuário.".
3. Só no modo API: caixa `flex flex-col gap-[12px] rounded-apsen border border-apsen-border bg-apsen-bg p-[14px]` com URL do endpoint `*` (placeholder "https://api.apsen.com.br/v1/concorrentes", hint "Deve aceitar o parâmetro <code>?busca=</code> para filtro incremental."), `FormGrid columns={2}` (Método de autenticação `FONTE_AUTH`; Cache (minutos) `type="number" min=0`), Token / Chave (`type="password"`, placeholder "••••••••••••••••", hint "Armazenado de forma segura no backend — nunca exposto ao frontend.") só se auth ≠ `none`, `FormGrid columns={2}` (Campo de valor (JSON path) placeholder "Ex: data[].nome"; Campo de rótulo (JSON path) placeholder "Ex: data[].razao_social"), `Button variant="ghost" size="sm" className="self-start"` "🔍 Testar conexão" e o resultado (`role="status"`, `rounded-[6px] px-[12px] py-[9px] text-[12.5px]`; erro `bg-apsen-kpi-red text-apsen-red`, testando `bg-apsen-bg text-apsen-muted`, sucesso `bg-apsen-green-bg text-apsen-green` + nota `text-[11px] opacity-80`).

Rodapé: "Cancelar" (`ghost sm`) · "Salvar configuração" (`primary sm`, "Salvando…"). Fechar sujo → `ConfirmDialog` "Descartar alterações?" (mesmo texto da spec ciclos).

### Textos

| Situação              | Texto                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| nova ok               | `✅ Nova fonte "{nome}" adicionada.`                                                                                                 |
| config ok             | "✅ Fonte configurada para API externa." / "✅ Fonte configurada para lista interna."                                                |
| remover (confirmação) | `Remover a fonte "{nome}"?` · botões "Cancelar" / "Remover"                                                                          |
| removida              | "Fonte removida."                                                                                                                    |
| validação             | "⚠️ Informe o nome da fonte." · "⚠️ Informe a URL do endpoint para o modo API." · [derivado] "⚠️ Já existe uma fonte com este nome." |
| falha                 | "⚠️ Não foi possível salvar as alterações. Tente novamente."                                                                         |

## 4. Contratos de API consumidos

| Uso                 | Requisição                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| lista               | `GET /fontes?_page={p}&_limit={size}` via `getPage`                                                                       |
| opções do tipo-form | `GET /fontes?_page=1&_limit=50` (catálogo pequeno, `staleTime` 5 min)                                                     |
| nome repetido       | `GET /fontes?nome_like={regex escapado}` (case-insensitive no json-server) — confirmação final por `slugFonte` no cliente |
| criar               | `POST /fontes` → `201`                                                                                                    |
| configurar          | `PATCH /fontes/{id}` → `200`                                                                                              |
| remover             | `DELETE /fontes/{id}` → `200`                                                                                             |

Item do `db.json`:

```json
{
  "id": "concorrentes",
  "nome": "Concorrentes / Marcas",
  "icon": "🏁",
  "desc": "Alimenta o autocomplete \"Nome do concorrente\" no registro de drivers.",
  "modo": "mock",
  "url": "",
  "auth": "none",
  "cache": 60,
  "campos": "MARCAS_CONC"
}
```

`POST`:

```json
{
  "id": "9b2f…",
  "nome": "Distribuidores",
  "icon": "🚚",
  "desc": "Fonte de dados personalizada.",
  "modo": "api",
  "url": "https://api.apsen.com.br/v1/distribuidores",
  "auth": "bearer",
  "cache": 60,
  "mapValor": "nome",
  "mapLabel": "razao_social",
  "campos": "—",
  "_custom": true
}
```

`PATCH`: `{ "modo", "url", "auth", "cache", "mapValor", "mapLabel" }`. Nunca contém token.

Schema Zod (`src/infrastructure/fontes/fonteSchema.ts`):

```ts
export const fonteDtoSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  icon: z.string(),
  desc: z.string(),
  modo: z.enum(['mock', 'api']),
  url: z.string(),
  auth: z.enum(['none', 'apikey', 'bearer', 'basic']),
  cache: z.number().nonnegative(),
  campos: z.string().optional(),
  mapValor: z.string().optional(),
  mapLabel: z.string().optional(),
  _custom: z.boolean().optional(),
});
```

Erros: inválido → `InvalidResponseError`; 404 → `NotFoundError('Fonte', id)`; 5xx/rede/timeout propagados.

## 5. Domínio (`src/domain`)

`src/domain/fontes/`:

- `Fonte.ts` — `type FonteModo = 'mock' | 'api'`; `type FonteAuth = 'none' | 'apikey' | 'bearer' | 'basic'`; `interface Fonte { id; nome; icon; desc; modo; url; auth; cache; campos; mapValor; mapLabel; custom: boolean }`; `interface FonteDraft { nome; icon; desc; modo; url; auth; cache: string; mapValor; mapLabel }`.
- `fonteRules.ts`: `slugFonte(nome)` (algoritmo de L7297: NFD, remove acentos, minúsculas, `[^a-z0-9]+` → `_`, apara `_`); `parseCache(valor)` = `Number(valor) || 60`; `statusLabel(f)`; `apiLine(f)` → `"GET {url || '(sem URL)'} · auth: {auth} · cache: {cache}min"`; `optionLabel(f)` → `"{icon} {nome} (API ativa|mock)"`; `validateFonteDraft(draft, { nova, nomesExistentes })` → `Partial<Record<'nome'|'url', string>>` (RN-03); `testeConexao(url)` → `{ tone: 'error', texto }` ou `{ tone: 'loading', texto }` + `TESTE_OK` (textos do CA-05).
- `vocabulario.ts`: `FONTE_ICONES` (9, `config.opcoes.fonteIcones`), `FONTE_AUTH` (4, `config.opcoes.fonteAuth`), `MAP_PADRAO = { valor: 'nome', label: 'razao_social' }`.
- `FonteRepository.ts`: `listPage({page,size})`, `listAll()`, `existsNome(nome)`, `create(f)`, `update(id, patch)`, `delete(id)`.
- `FonteValidationError extends DomainError` (`errors`); `FonteProtegidaError extends DomainError` ("Fonte do sistema não pode ser removida.").

## 6. Aplicação (`src/application`)

`src/application/fontes/`:

- `ListFontes(repo)` → `execute({page,size})` → `{ items: FonteCardDto[]; total; totalPages }` com `FonteCardDto { id; nome; icon; desc; isApi; statusLabel; apiLine: string | null; removivel; config: { modo; url; auth; cache; mapValor; mapLabel } }`.
- `ListFonteOptions(repo)` → `{ value: id; label: optionLabel }[]` (para o tipo-form).
- `CreateFonte(repo, ids)` → valida (nome, URL no modo API, nome repetido por `slugFonte`), cria (RN-04), devolve `{ toast }`.
- `UpdateFonteConfig(repo)` → `PATCH` (RN-05), devolve o toast por modo.
- `DeleteFonte(repo)` → só se `custom` (senão `FonteProtegidaError`), devolve `{ toast: 'Fonte removida.' }`.

## 7. Infraestrutura (`src/infrastructure`)

`src/infrastructure/fontes/{fonteSchema,fonteMapper,HttpFonteRepository}.ts`: mapper com `custom = dto._custom ?? false`, `mapValor ?? 'nome'`, `mapLabel ?? 'razao_social'`, `campos ?? '—'`; o mapper inverso grava `_custom`. Requisições do §4; schema em toda resposta; 404 → `NotFoundError`.

## 8. Apresentação (`src/presentation`)

- `queryKeys.fontes = { all: ['fontes'] as const, page: (p) => ['fontes','page',p] as const, options: () => ['fontes','options'] as const }`.
- Hooks: `useFontesPage` (`keepPreviousData`, 30 s), `useFonteOptions` (5 min), `useCreateFonteMutation`, `useUpdateFonteMutation` (invalidam `fontes.all`), `useDeleteFonteMutation` (otimista nas páginas em cache, rollback + toast).
- Feature `src/presentation/features/fontes/`: `FontesScreen.tsx`, `components/{FonteCard,FonteModal,FonteApiConfig,FonteTestResult}.tsx`. O resultado do teste usa `setTimeout` de 1200 ms limpo no unmount; o token fica só no `useState` do modal.
- **UI kit novo** `src/presentation/components/ui/ConfirmDialog.tsx` (`'use client'`), exportado no `index.ts`:

  ```ts
  interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel: string;
    cancelLabel?: string; // padrão "Cancelar"
    tone?: 'danger' | 'primary'; // padrão 'danger'
    pending?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```

  Usa `Modal size="md"` (focus trap, Esc/overlay = cancelar); rodapé `Button ghost sm` (cancelar) e `Button danger sm`/`primary sm` (confirmar, desabilitado com `pending`); foco inicial no botão de cancelar.

- `UseCases.fontes = { list; options; create; update; remove }`; `createContainer` registra `HttpFonteRepository`.

## 9. Arquivos

### Novos

- `src/domain/fontes/{Fonte,fonteRules,vocabulario,FonteRepository,errors}.ts` e `__tests__/{fonteRules,vocabulario}.test.ts`
- `src/application/fontes/{ListFontes,ListFonteOptions,CreateFonte,UpdateFonteConfig,DeleteFonte,dto}.ts` e `__tests__/*.test.ts`
- `src/infrastructure/fontes/{fonteSchema,fonteMapper,HttpFonteRepository}.ts` e `__tests__/HttpFonteRepository.test.ts`
- `src/presentation/hooks/{useFontes,useFonteMutations}.ts` e `__tests__/useFontes.test.tsx`
- `src/presentation/features/fontes/FontesScreen.tsx`, `components/*.tsx`, `__tests__/{FontesScreen,FonteModal}.test.tsx`
- `src/presentation/components/ui/ConfirmDialog.tsx` e `__tests__/ConfirmDialog.test.tsx`
- `src/app/admin/fontes/{page,loading,error}.tsx` e `__tests__/page.test.tsx`

### Modificados

- `queryKeys.ts`, `UseCasesContext.tsx`, `container.ts` (+ teste), `test/renderWithProviders.tsx` — módulo `fontes`.
- `src/presentation/components/ui/index.ts` e `__tests__/index.test.ts` — `ConfirmDialog`.
- `docs/design/DESIGN_SPEC.md` — seção do `ConfirmDialog` no §3.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Status do card: `modo === 'api'` → "🔌 API externa ativa" (verde) e linha `apiLine`; senão "📦 Lista interna (mock)" sem linha (RN-FON-01).                                                                                                                                       |
| RN-02 | Só fontes personalizadas (`_custom: true`) podem ser removidas; fixas não têm o botão e `DeleteFonte` recusa (RN-FON-02).                                                                                                                                                         |
| RN-03 | Validação: nova sem nome → "⚠️ Informe o nome da fonte."; nova em modo API sem URL → "⚠️ Informe a URL do endpoint para o modo API."; nova com `slugFonte(nome)` igual ao de uma existente → "⚠️ Já existe uma fonte com este nome." [derivado]. Existente não valida URL (fiel). |
| RN-04 | Fonte nova: `id` UUID (RN-SEG-03), `nome` com `trim`, `icon` (padrão 🔌), `desc` com `trim` ou "Fonte de dados personalizada.", `modo`, `url` com `trim`, `auth`, `cache = parseCache`, `mapValor`/`mapLabel` (padrões `nome`/`razao_social`), `campos: "—"`, `_custom: true`.    |
| RN-05 | Configurar grava `modo`, `url`, `auth`, `cache = parseCache`, `mapValor`, `mapLabel` (ARQUITETURA #20). Nome, ícone e descrição não mudam.                                                                                                                                        |
| RN-06 | O token nunca é persistido nem enviado (RN-SEG-05; segredos só no backend/Key Vault).                                                                                                                                                                                             |
| RN-07 | Teste de conexão é simulado e determinístico (CA-05), sem chamada de rede.                                                                                                                                                                                                        |

## 11. BDD — Cenários de teste unitário

| Cenário                                                                                                                                                         | Arquivo de teste                                                   | Asserção                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-03 Dado "Distribuidores / Redes de Farmácia", quando gera o slug, então `distribuidores_redes_de_farmacia`; nome repetido com outra caixa/acento é detectado | `src/domain/fontes/__tests__/fonteRules.test.ts`                   | `slugFonte`; `validateFonteDraft` → erro `nome` "⚠️ Já existe uma fonte com este nome."                                                              |
| RN-03 Dado nova sem nome / API sem URL, quando valida, então as mensagens; existente sem URL é válida                                                           | `fonteRules.test.ts`                                               | mensagens exatas; `{}` para existente                                                                                                                |
| RN-01 RN-05 Dado fontes, quando formata, então pill, linha API, opção e cache                                                                                   | `fonteRules.test.ts`                                               | "GET (sem URL) · auth: none · cache: 60min"; `optionLabel` "🏁 Concorrentes / Marcas (mock)"; `parseCache('0')` = 60; `parseCache('15')` = 15        |
| RN-07 Dado URL vazia ou preenchida, quando testa, então textos do CA-05                                                                                         | `fonteRules.test.ts`                                               | erro e "⟳ Testando conexão com https://x..."                                                                                                         |
| §5 Dado o db.json, quando compara o vocabulário, então ícones e auth batem com `config.opcoes`                                                                  | `src/domain/fontes/__tests__/vocabulario.test.ts`                  | lê `mock-api/db.json` e compara `fonteIcones`/`fonteAuth`                                                                                            |
| RN-04 CA-06 Dado rascunho válido, quando CreateFonte executa, então POST com UUID e `_custom`                                                                   | `src/application/fontes/__tests__/CreateFonte.test.ts`             | corpo do §4; desc padrão; toast `✅ Nova fonte "Distribuidores" adicionada.`; sem campo de token                                                     |
| RN-05 Dado config API, quando UpdateFonteConfig executa, então PATCH só da config e toast por modo                                                              | `UpdateFonteConfig.test.ts`                                        | `update(id, {modo:'api', url, auth, cache, mapValor, mapLabel})`; "✅ Fonte configurada para API externa."; mock → "…para lista interna."            |
| RN-02 Dado fonte fixa, quando DeleteFonte executa, então recusa; personalizada remove                                                                           | `DeleteFonte.test.ts`                                              | `FonteProtegidaError`; `delete(id)` + "Fonte removida."                                                                                              |
| §4 Dado a API, quando o repositório lê/grava, então queries, schema e mapper                                                                                    | `src/infrastructure/fontes/__tests__/HttpFonteRepository.test.ts`  | `getPage` com `_page/_limit`; `mapValor` padrão "nome"; `custom` de `_custom`; `modo` "x" → `InvalidResponseError`; 404 → `NotFoundError`            |
| CA-01 CA-02 Dado a massa, quando renderiza, então header, descrição e 4 cards mock                                                                              | `src/presentation/features/fontes/__tests__/FontesScreen.test.tsx` | `heading`; 4 × "📦 Lista interna (mock)"; nenhum "Remover a fonte…"; fonte API mostra a linha mono                                                   |
| CA-03 Dado "+ Nova Fonte de Dados", quando abre e troca para API, então identificação e caixa API aparecem; token só com auth                                   | `src/presentation/features/fontes/__tests__/FonteModal.test.tsx`   | `dialog` "Nova Fonte de Dados"; campos do §3; hint muda; selecionar "Bearer Token / OAuth2" mostra "Token / Chave"                                   |
| CA-04 Dado ⚙️, quando abre, então "Configurar: {nome}" sem identificação e pré-preenchido                                                                       | `FonteModal.test.tsx`                                              | sem campo "Nome da fonte"; modo/URL/cache/JSON paths da fonte                                                                                        |
| CA-05 Dado URL vazia e depois preenchida, quando testa, então mensagens e sucesso após 1,2 s                                                                    | `FonteModal.test.tsx`                                              | fake timers: erro; "⟳ Testando conexão com …"; `advanceTimersByTime(1200)` → texto de sucesso + nota                                                 |
| CA-06 Dado salvar nova sem nome, quando clica, então erro no campo, foco e toast                                                                                | `FonteModal.test.tsx`                                              | `aria-invalid` + foco em "Nome da fonte"; toast "⚠️ Informe o nome da fonte."; com dados válidos chama `create` e fecha; "Salvando…" durante o envio |
| CA-07 Dado fonte personalizada, quando clica 🗑 e confirma, então some na hora; falha restaura                                                                   | `FontesScreen.test.tsx`                                            | `dialog` `Remover a fonte "X"?`; card some antes de resolver; toast "Fonte removida."; rejeição → card volta + toast de falha                        |
| CA-08 Dado carregando/erro/vazio, quando renderiza, então estados                                                                                               | `FontesScreen.test.tsx`                                            | "Carregando…"; "Tentar novamente" refaz; vazio "Nenhuma fonte cadastrada"                                                                            |
| CA-09 RN-06 Dado token digitado, quando salva, então o caso de uso não recebe token                                                                             | `FonteModal.test.tsx`                                              | argumentos de `create.execute`/`update.execute` sem chave com o valor digitado                                                                       |
| §8 Dado o ConfirmDialog, quando abre, então diálogo com foco no cancelar, Esc cancela, confirmar chama `onConfirm`                                              | `src/presentation/components/ui/__tests__/ConfirmDialog.test.tsx`  | `getByRole('dialog', {name})`; foco em "Cancelar"; Esc → `onCancel`; `pending` desabilita confirmar; tom `danger` usa `Button danger`                |
| §3 Dado a rota, quando renderiza, então metadata, loading e error                                                                                               | `src/app/admin/fontes/__tests__/page.test.tsx`                     | `metadata.title` "Fontes de Dados / APIs"                                                                                                            |

## 12. Requisitos não funcionais

| Item | Como atende                                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §7.1 | Lista paginada no servidor (10, `X-Total-Count`), página na URL, `keepPreviousData`. Sem busca (o protótipo não tem). Opções do tipo-form com `_limit=50`. |
| §7.2 | Rota própria, `loading.tsx` (skeleton de 3 cards), `error.tsx`, `FonteModal` via `next/dynamic`, guarda antes das queries.                                 |
| §7.3 | `staleTime` 30 s (lista) e 5 min (opções); invalidação só de `fontes.all`; exclusão otimista com rollback; confirmação por `ConfirmDialog`; "Salvando…".   |
| §7.4 | Erros por campo + foco no primeiro inválido + toast; `cache` `min=0`; aviso ao fechar o modal sujo.                                                        |
| §7.5 | Cards e botões com nome acessível; resultado do teste em `role="status"`; modal com focus trap; layout empilha em 360 px (ações quebram linha).            |
| §7.6 | Token nunca sai do componente (RN-SEG-05); nada em `console`; IDs UUID (RN-SEG-03).                                                                        |
