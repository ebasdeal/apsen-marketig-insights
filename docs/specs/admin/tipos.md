---
status: READY
fase: 33
area: admin
feature: tipos
azure-devops-work-item:
---

# Catálogo de Tipos, Configurar Tipo e Importar Catálogo

## 1. Overview

Porta três peças do protótipo (`docs/Negócio/di-drivers-v2_84.html`): a tela `tipos` (L1595–1640, JS `renderTipos`/`tipoFilterCat`/`tipoToggleAtivo` L3873–3931), a tela `tipo-form` (L1643–1808, JS `tfAddParam` L3933, `tfOpcoesFonteHTML`/`tfTipoChange`/`tfOrigemChange`/`tfInitOpcoes` L7337–7393) e o `modal-importar` (L3166–3180). O admin DI consulta os 47 tipos, filtra por categoria, ativa/desativa, cria e edita um tipo (identificação, feature engineering, parâmetros do formulário, status), exclui e importa um catálogo JSON. Tudo persiste via API (ARQUITETURA #7, #13): o tipo em `/tipos`, **todos** os campos do formulário em `/camposTipo` e a lista de tipos da categoria em `/categorias` (usada pela cascata do Driver Form).

Regras de negócio: RN-TIP-01 (tipo com categoria, dono, lag e parâmetros; ativável), RN-TIP-02 / RN-FON-03 (opções de select fixas ou de uma Fonte de Dados), RN-TIP-04 (obrigatoriedade definida por campo no próprio catálogo — coluna "Obrigatório").

Onda 3, fase provisória 33. Inventário §2.8, §2.9, §3 (`modal-importar`).

**Dependências:** as da spec [ciclos](ciclos.md) §1; `ConfirmDialog` e `useFonteOptions` da spec [fontes](fontes.md); da onda 1: `Breadcrumb`, `StatusField`, `FormActions`, `Button` `dashed`, `IconButton`/`IconLink` `tone="teal"|"red"`, `Tooltip` com conteúdo `ReactNode`, `FormField` com rótulo `ReactNode`, `FormSelect` com `placeholder`/`disabled`, `TextInput` com `min`/`max`. **Esta spec cria**: `CodeTag` no UI kit (também usado por ingeridos e agentes) e o hook `useUnsavedChangesGuard` (se a onda 2 já tiver criado, reutilizar). Os módulos de categorias e campos do tipo são **deste** módulo (`tipos`); se a onda 2 já tiver entidades de `Categoria`/`CamposTipo` para a cascata do Driver Form, unificar nelas (sem schemas duplicados).

**Decisões [derivado]:**

- IDs: tipo novo recebe `id` UUID (RN-SEG-03) e o slug em `slug`; o registro de `/camposTipo` do tipo usa **o mesmo `id` do tipo** (legado: `id = slug` nos dois). Rotas usam o `id`: `/admin/tipos/[id]/editar` (para a massa do `db.json` o `id` é o slug, igual ao inventário).
- Em edição o slug é somente leitura (é a chave do `DriverRecord.tipo`).
- Feature/autocomplete/opções agrupadas que o formulário não edita são preservados (RN-07).
- Validações e textos de validação (o protótipo não valida) — RN-04/RN-05/RN-09.
- Exclusão pede confirmação (`ConfirmDialog` `Remover o tipo "{slug}"?`), ARQUITETURA §7.3.

**Perguntas em aberto:**

- PO: a matriz de permissões (`/permissoes`, linhas 6–7) diz que só Admin cria/edita/ativa tipos, mas `SCREEN_ROLES` libera `tipos`/`tipo-form` para Planejador (nível 3). Seguido o protótipo (ARQUITETURA #11): sem checagem extra.
- PO: tipos existentes usam valores de feature fora das 7 opções do select (`continua_grp`, `continua_impressoes`, `dummy_gap`…). Em edição o valor atual entra como opção extra; confirmar o vocabulário oficial.
- PO: excluir um tipo usado por drivers existentes não é bloqueado (o protótipo só mostra o toast). Os registros históricos mantêm o slug.
- PO: o protótipo não define o formato do JSON exportado de "outro ambiente"; o formato aceito está no RN-09.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/admin/tipos` mostra o header "Catálogo de Tipos de Driver" / "Define quais tipos estão disponíveis no Driver Form · Feature engineering configurável" com "Importar JSON" (ghost sm) e "+ Novo Tipo" (teal sm → `/admin/tipos/novo`), o `ScreenDesc` 📚 (L1608–1611), os chips de categoria (Todos, 📡 Mídia … 🌍 Macro; um selecionado por vez) e o resumo "**{filtrados} de {total} tipos** cadastrados · {ativos} ativos" (ativos em verde, totais do servidor). |
| CA-02 | A tabela é paginada no servidor (10 por página, seletor 10/25/50), filtrada por `cat` quando o chip não é "Todos"; categoria e página ficam na URL (`?cat=midia&page=2&size=25`); trocar o chip volta para a página 1.                                                                                                                                                                                                                                                |
| CA-03 | Colunas Tipo / Slug · Categoria · Dono de Área · Feature Engineering · Lag · Campos · Ativo · Ações, com tooltips em Tipo/Slug, Feature Engineering, Lag e Campos (textos de L1634–1635) e o visual de L3885–3916: label 13px/500 + slug mono 11px muted; pill neutra `catL`; feature em `CodeTag` com a cor de `FEATURE_COLORS`; lag centralizado mono ("+1", "0", "-1"); campos azul 600 centralizado.                                                              |
| CA-04 | O Toggle "Ativo" atualiza na hora (otimista), grava `PATCH /tipos/{id} {ativo}` e mostra `✅ "{slug}" ativado.` / `⏸ "{slug}" desativado.`; falha restaura e mostra o toast de falha.                                                                                                                                                                                                                                                                                 |
| CA-05 | ✏️ (teal) navega para `/admin/tipos/{id}/editar`; 🗑 (red) abre `Remover o tipo "{slug}"?`; confirmar remove a linha na hora, apaga o tipo, os campos e a entrada na categoria e mostra "🗑 Tipo removido."; falha restaura.                                                                                                                                                                                                                                            |
| CA-06 | "Importar JSON" abre (via `next/dynamic`) o modal "Importar Catálogo de Tipos" com o texto de L3170, o campo "JSON do catálogo" (textarea mono 6 linhas, placeholder `{"schema":"drivers-catalogo-v1","tipos":[...]}`) e Cancelar/Importar (teal). Importar valida (RN-09); erro → toast com a mensagem e erro no campo, modal aberto; sucesso insere os slugs novos, atualiza os existentes, fecha e mostra "✅ Catálogo importado!".                                |
| CA-07 | `/admin/tipos/novo` mostra o breadcrumb "Catálogo › Configurar Tipo", o botão "← Voltar ao Catálogo", o `ScreenDesc` 🔧 e os cards "Identificação do Tipo", "Feature Engineering · ApsenPLPEngine" (com o `Alert` warning de L1708), "Parâmetros do Formulário" e "Status", com todos os campos, placeholders, hints e tooltips do protótipo; lag padrão 0 (min -3, max 6); status Ativo ligado.                                                                      |
| CA-08 | A tabela de parâmetros começa com a linha exemplo (tipo `select`, obrigatório, "Opções fixas" com `Epidemia                                                                                                                                                                                                                                                                                                                                                           | Alta sazonal | Pandemia`); "+ Adicionar campo" acrescenta uma linha `text`não obrigatória; "×" remove a linha; as opções só aparecem para tipo`select`; "Fonte de dados (API)" troca o input de opções pelo select de fontes ("— Selecione a fonte —" + "{icon} {nome} (API ativa | mock)"). |
| CA-09 | "Salvar Tipo" valida (RN-04/RN-05) com erro no campo (ou na célula da linha), foco no primeiro inválido e toast com a primeira mensagem; válido grava tipo, campos e categoria (RN-06), mostra "✅ Tipo salvo!" e volta para `/admin/tipos`. "Salvando…" desabilitado durante o envio; "Cancelar" volta sem gravar.                                                                                                                                                   |
| CA-10 | `/admin/tipos/{id}/editar` carrega o tipo, os campos e as fontes e pré-preenche tudo (slug somente leitura); salvar faz `PATCH`/`PUT` (RN-06) e "✅ Tipo salvo!". Id inexistente renderiza o `not-found` do segmento ("Tipo não encontrado" + "← Voltar ao Catálogo").                                                                                                                                                                                                |
| CA-11 | Sair do formulário com alterações (Cancelar, Voltar, breadcrumb, sidebar ou fechar a aba) pede "Descartar alterações?".                                                                                                                                                                                                                                                                                                                                               |
| CA-12 | Estados nas três peças: skeleton (`loading.tsx` da lista e do formulário), erro com "Tentar novamente", vazio da tabela ("Nenhum tipo nesta categoria.") e dados.                                                                                                                                                                                                                                                                                                     |

## 3. UX / Fluxo de tela

Rotas (Server Components finos; `params` é `Promise` no Next 16):

- `src/app/admin/tipos/page.tsx` — `metadata.title = 'Catálogo de Tipos'` → `<TiposScreen />`; `loading.tsx`, `error.tsx`.
- `src/app/admin/tipos/novo/page.tsx` — `metadata.title = 'Novo Tipo'` → `<TipoFormScreen />`.
- `src/app/admin/tipos/[id]/editar/page.tsx` — `metadata.title = 'Editar Tipo'`; `const { id } = await params;` → `<TipoFormScreen id={decodeURIComponent(id)} />`; `loading.tsx`, `not-found.tsx`.

Referências: `DESIGN_SPEC.md` §3.4 `ChipGroup`, §3.17 `Table`, §3.18 `Tooltip`, §3.20 `Toggle`, §3.15 formulário, §3.19 `Alert`, §3.16 `Modal`; `Breadcrumb`/`StatusField`/`FormActions` da onda 1.

### Tela `tipos`

| Bloco     | Componente                                                                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header    | `PageHeader` + `Button ghost sm` "Importar JSON" + `ButtonLink teal sm` "+ Novo Tipo"                                                                                        |
| Descrição | `ScreenDesc icon="📚"`                                                                                                                                                       |
| Filtro    | `ChipGroup label="Filtrar por categoria" hideLabel` com `TIPO_CAT_FILTERS`, `mb-[14px]`                                                                                      |
| Resumo    | `<p className="mb-[12px] text-[13px] text-apsen-muted"><strong>{f} de {t} tipos</strong> cadastrados · <span className="font-medium text-apsen-green">{a} ativos</span></p>` |
| Tabela    | `Table caption="Catálogo de tipos de driver"` + `footer` `Pagination` com seletor de tamanho                                                                                 |

Células: Categoria `rounded-[4px] border border-apsen-border bg-apsen-bg px-[8px] py-[2px] text-[11.5px] font-semibold`; Dono `text-[12.5px]`; Feature `CodeTag tone={featureTone(feature)}`; Lag `text-center font-mono text-[13px]`; Campos `text-center text-[13px] font-semibold text-apsen-blue`; Ativo `Toggle aria-label="Tipo {slug} ativo"`; Ações `IconLink tone="teal"` lápis (`aria-label="Editar tipo {slug}"`) e `IconButton tone="red"` lixeira (`aria-label="Excluir tipo {slug}"`).

### Tela `tipo-form` (L1643–1808)

1. `Breadcrumb items={[{ label: 'Catálogo', href: '/admin/tipos' }, { label: 'Configurar Tipo' }]}` + `ButtonLink ghost sm` "← Voltar ao Catálogo" `mb-[16px]`.
2. `ScreenDesc icon="🔧"` (L1653–1656).
3. Card "Identificação do Tipo" — `FormGrid columns={2}`: Chave interna (slug) `*` (tooltip L1663, `TextInput className="font-mono"` placeholder "Ex: sazo_epi", hint "Sem espaços, use underscore. Identifica o tipo no DriverRecord.", readonly em edição) · Label no Driver Form `*` (tooltip L1668, placeholder "Ex: 🌡️ Sazonal / Epidemiológico") · Categoria `*` (`FormSelect` placeholder "Selecione...", opções `categorias[].labelTipoForm` por `slug`) · Dono de Área `*` (tooltip L1688, `DONOS_AREA`) · Descrição resumida `full` (tooltip L1698, placeholder de L1699).
4. Card "Feature Engineering · ApsenPLPEngine" — `Alert tone="warning"` (L1708) + `FormGrid columns={2}`: Tipo de feature gerada (tooltip L1712, `FEATURE_TIPOS`, + valor atual se fora da lista) · Lag padrão (meses) (tooltip L1724, `type="number" min=-3 max=6 step=1`, hint de L1726) · Impacto esperado na série (tooltip L1729, `IMPACTO_SERIE`) · Permanência do efeito (tooltip L1738, `PERMANENCIA`) · Nota metodológica para o analista `full` (tooltip L1746, `TextArea` placeholder L1748).
5. Card "Parâmetros do Formulário" — `CardTitle small="campos que aparecerão no Driver Form para este tipo"`; hint "Estes campos compõem o objeto `DriverRecord.parametros`." (code `rounded-[3px] bg-apsen-bg px-[5px] py-[1px] font-mono text-[11px]`); `EditableParamsTable` dentro de `overflow-hidden rounded-apsen border border-apsen-border mb-[10px]`; `Button variant="ghost" size="sm" dashed className="w-full"` "+ Adicionar campo".
6. Card "Status" — `StatusField title="Ativo no Driver Form" description="Tipos inativos ficam ocultos no formulário das áreas mas preservam os registros históricos."` (Ativo verde / Inativo muted) + `FormActions className="mt-[14px]"`: `Button ghost` "Cancelar" · `Button teal` "Salvar Tipo".

### `EditableParamsTable` (feature, `.inline-table` L370–378)

`table` `w-full border-collapse text-[12.5px]`; `th` `bg-apsen-bg px-[11px] py-[7px] text-left text-[10.5px] font-bold uppercase tracking-[.04em] text-apsen-muted border-b border-apsen-border`; `td` `px-[11px] py-[8px] align-middle border-b border-apsen-row-hover` (token de `#F1F5F9`; criar `--color-apsen-inline-border` se não houver equivalente), última linha sem borda. Colunas: Nome (slug) (`TextInput font-mono text-[11.5px]`, placeholder "ex: tipo_epi" na linha exemplo / "nome_campo" nas novas) · Label exibido (`text-[12px]`, "Tipo epidemiológico" / "Label do campo") · Tipo (`FormSelect text-[12px]` `PARAM_TIPOS`, + `autocomplete` só se o campo original for autocomplete) · Obrigatório (checkbox centralizado, `accent-apsen-blue`) · Opções (select): `FormSelect` origem `text-[10.5px] px-[6px] py-[4px]` ("Opções fixas"/"Fonte de dados (API)") + `TextInput text-[11px]` "Opção 1|Opção 2|..." ou `FormSelect` de fontes; vazio para tipos ≠ select · "×" (`text-[15px] text-apsen-muted-2 hover:text-apsen-red`, `aria-label="Remover campo {n}"`). Cada controle tem `aria-label` com o número da linha ("Nome do campo 1"…). Em telas estreitas a tabela rola na horizontal.

### Modal importar (L3166–3180)

`Modal size="md"` "Importar Catálogo de Tipos": `<p className="text-[13px] leading-[1.55] text-apsen-muted">Cole o JSON exportado de outro ambiente. Tipos com o mesmo slug serão <strong>atualizados</strong>; novos slugs serão <strong>inseridos</strong>.</p>` + `FormField label="JSON do catálogo" error` → `TextArea rows={6} className="font-mono text-[11.5px]"`. Rodapé `ghost sm` "Cancelar" · `teal sm` "Importar" ("Importando…" durante o envio).

### Textos

| Situação  | Texto                                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| toggle    | `✅ "{slug}" ativado.` / `⏸ "{slug}" desativado.`                                                                                                                        |
| excluir   | confirmação `Remover o tipo "{slug}"?` (descrição [derivado] "O tipo some do Driver Form; drivers já registrados mantêm o slug.") · "Remover" · toast "🗑 Tipo removido." |
| salvar    | "✅ Tipo salvo!"                                                                                                                                                         |
| importar  | "✅ Catálogo importado!"                                                                                                                                                 |
| validação | RN-04, RN-05, RN-09                                                                                                                                                      |
| falha     | "⚠️ Não foi possível salvar as alterações. Tente novamente."                                                                                                             |

## 4. Contratos de API consumidos

| Uso            | Requisição                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| tabela         | `GET /tipos?_page={p}&_limit={size}[&cat={slug}]` via `getPage`                                                                    |
| total / ativos | `GET /tipos?_page=1&_limit=1` (total) e `GET /tipos?ativo=true&_page=1&_limit=1` (ativos), via `getPage`                           |
| tipo           | `GET /tipos/{id}` (404 → não encontrado)                                                                                           |
| slug repetido  | `GET /tipos?slug={slug}`                                                                                                           |
| campos         | `GET /camposTipo/{id}` (404 → sem campos) · `POST /camposTipo` · `PUT /camposTipo/{id}` · `DELETE /camposTipo/{id}` (404 ignorado) |
| categorias     | `GET /categorias` (10, `staleTime` 5 min) · `PATCH /categorias/{id}` `{ "tipos": [...] }`                                          |
| tipo           | `POST /tipos` · `PATCH /tipos/{id}` · `DELETE /tipos/{id}`                                                                         |

Tipo do `db.json` e o mesmo tipo após edição (campos novos `desc`, `impacto`, `perm`, `nota`):

```json
{
  "id": "tv",
  "slug": "tv",
  "label": "📺 TV Aberta",
  "cat": "midia",
  "catL": "📡 Mídia",
  "dono": "Marketing",
  "feature": "continua_grp",
  "lag": 1,
  "params": 6,
  "ativo": true,
  "desc": "",
  "impacto": "aumento",
  "perm": "residual",
  "nota": ""
}
```

`camposTipo` (novo tipo com UUID):

```json
{
  "id": "5d1c…",
  "title": "🌡️ Sazonal / Epidemiológico",
  "layout": "g2",
  "campos": [
    {
      "label": "Tipo epidemiológico",
      "required": true,
      "id": "d_tipo_epi",
      "param": "tipo_epi",
      "type": "select",
      "options": ["Epidemia", "Alta sazonal", "Pandemia"]
    },
    {
      "label": "Fonte",
      "required": false,
      "id": "d_fonte_epi",
      "param": "fonte_epi",
      "type": "select",
      "fonte": "moleculas"
    }
  ]
}
```

JSON de importação aceito:

```json
{
  "schema": "drivers-catalogo-v1",
  "tipos": [
    {
      "slug": "sazo_epi",
      "label": "🌡️ Sazonal / Epidemiológico",
      "cat": "sazo",
      "dono": "S&OP / Planejamento",
      "feature": "fourier_sazo",
      "lag": 0,
      "ativo": true,
      "campos": [
        {
          "param": "tipo_epi",
          "label": "Tipo",
          "type": "select",
          "required": true,
          "options": ["Epidemia"]
        }
      ]
    }
  ]
}
```

Schemas Zod (`src/infrastructure/tipos/tipoSchemas.ts`):

```ts
const catSlug = z.enum([
  'midia',
  'comercial',
  'produto',
  'supply',
  'logistica',
  'concorrencia',
  'regulatorio',
  'sazo',
  'social',
  'macro',
]);
export const tipoDtoSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  label: z.string(),
  cat: catSlug,
  catL: z.string(),
  dono: z.string(),
  feature: z.string(),
  lag: z.number().int(),
  params: z.number().int().nonnegative(),
  ativo: z.boolean(),
  desc: z.string().optional(),
  impacto: z.string().optional(),
  perm: z.string().optional(),
  nota: z.string().optional(),
});
const opcao = z.union([z.string(), z.object({ label: z.string(), group: z.string() })]);
export const campoDtoSchema = z
  .object({
    label: z.string(),
    required: z.boolean(),
    id: z.string(),
    param: z.string(),
    type: z.enum(['text', 'number', 'date', 'select', 'autocomplete']),
    options: z.array(opcao).optional(),
    placeholder: z.string().optional(),
    step: z.union([z.string(), z.number()]).optional(),
    readonly: z.boolean().optional(),
    autocomplete: z.enum(['labs', 'marcas']).optional(),
    labelHint: z.string().optional(),
    fonte: z.string().optional(),
  })
  .passthrough();
export const camposTipoDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  layout: z.enum(['g2', 'g3']),
  campos: z.array(campoDtoSchema),
});
export const categoriaDtoSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  slug: catSlug,
  labelTipoForm: z.string(),
  tipos: z.array(z.object({ slug: z.string(), label: z.string() })),
});
```

Erros: inválido → `InvalidResponseError`; 404 no `GET /tipos/{id}` → `NotFoundError('Tipo', id)` (a tela chama `notFound()`); 404 no `GET /camposTipo/{id}` → `null`; 5xx/rede/timeout propagados. Atenção na validação em tela: confirmar que `PATCH /categorias/0` funciona no json-server 0.17 (id numérico 0).

## 5. Domínio (`src/domain`)

`src/domain/tipos/`:

- `Tipo.ts` — `type CategoriaSlug` (10); `interface Tipo { id; slug; label; cat; catL; dono; feature; lag; params; ativo; desc; impacto; perm; nota }`; `interface Categoria { id: number; label; slug; labelTipoForm; tipos: { slug; label }[] }`; `type ParamTipo = 'select' | 'text' | 'number' | 'date' | 'autocomplete'`; `interface CampoTipo { label; required; id; param; type; options?; placeholder?; step?; readonly?; autocomplete?; labelHint?; fonte? }`; `interface CamposTipo { id; title; layout: 'g2' | 'g3'; campos: CampoTipo[] }`.
- `ParamRow` (rascunho de linha): `{ key: string; nome; label; tipo: ParamTipo; obrigatorio: boolean; origem: 'fixas' | 'api'; opcoes: string; fonte: string; original?: CampoTipo }`; `TipoDraft { slug; label; cat; dono; desc; feature; lag: string; impacto; perm; nota; ativo; rows: ParamRow[] }`.
- `vocabulario.ts` — `TIPO_CAT_FILTERS`, `DONOS_AREA`, `FEATURE_TIPOS`, `IMPACTO_SERIE`, `PERMANENCIA`, `PARAM_TIPOS`, `PARAM_ORIGENS` (espelham `config.opcoes`), `FEATURE_TONES` (de `config.FEATURE_COLORS`: `var(--blue)` → `'blue'` etc.), `EXEMPLO_ROW`.
- `tipoRules.ts`:
  - `formatLag(lag)`; `featureTone(feature)` (fallback `'muted'`); `catLabelCurto(cat)` (label do chip, = `catL`).
  - `SLUG_REGEX = /^[a-z][a-z0-9_]*$/`.
  - `validateTipoDraft(draft, { modo, slugExiste })` → `{ fields: Partial<Record<'slug'|'label'|'cat'|'dono'|'lag', string>>; rows: Record<string, string> }` (RN-04/RN-05).
  - `rowsToCampos(rows)` / `camposToRows(campos)` (RN-07).
  - `categoriaPatches(categorias, { slug, label, catAnterior, catNova, remover? })` → `{ id; tipos }[]` (RN-08).
- `catalogoImport.ts` — `parseCatalogoImport(texto)` → `{ ok: true; tipos: ImportTipo[] } | { ok: false; erro: string }` (RN-09).
- `TipoRepository.ts` — `listPage({page,size,cat?})`, `count({ativo?})`, `get(id)`, `findBySlug(slug)`, `create(tipo)`, `update(id, patch)`, `delete(id)`, `getCampos(id)`, `saveCampos(campos, existe)`, `deleteCampos(id)`, `listCategorias()`, `updateCategoriaTipos(id, tipos)`.
- `TipoValidationError extends DomainError` (`fields`, `rows`, `message` = primeira mensagem).

## 6. Aplicação (`src/application`)

`src/application/tipos/`:

- `ListTipos(repo)` → `execute({page,size,cat})` → `{ rows: TipoRowDto[]; filtrados; total; ativos; totalPages }` (`TipoRowDto { id; slug; label; catL; dono; feature; featureTone; lagTxt; params; ativo }`).
- `ListCategorias(repo)` → `Categoria[]` (também usado pelo user-form).
- `GetTipoForm(repo)` → `execute(id)` → `{ draft: TipoDraft; campos: CamposTipo | null; featureExtra: string | null }` (lança `NotFoundError`).
- `SaveTipo(repo, ids)` → `execute({ modo; id?; draft })` → `{ toast: '✅ Tipo salvo!' }` (RN-04–RN-08).
- `ToggleTipoAtivo(repo)` → `{ toast }`; `DeleteTipo(repo)` → `{ toast: '🗑 Tipo removido.' }` (apaga tipo, campos e entrada na categoria).
- `ImportCatalogo(repo, ids)` → `execute(texto)` → `{ toast: '✅ Catálogo importado!'; inseridos; atualizados }` (lança `CatalogoImportError` com a mensagem de RN-09).

## 7. Infraestrutura (`src/infrastructure`)

`src/infrastructure/tipos/{tipoSchemas,tipoMapper,HttpTipoRepository}.ts` com as requisições do §4. Mapper: `desc/nota ?? ''`, `impacto ?? 'aumento'`, `perm ?? 'temporario'`; campos com `passthrough` para não perder atributos desconhecidos. `saveCampos(c, existe)` → `PUT` se existe, senão `POST`.

## 8. Apresentação (`src/presentation`)

- `queryKeys.tipos = { all: ['tipos'], page: (p) => ['tipos','page',p], resumo: (cat) => ['tipos','resumo',cat], form: (id) => ['tipos','form',id], categorias: () => ['tipos','categorias'] }`.
- Hooks: `useTiposPage` (`keepPreviousData`, 30 s, prefetch da próxima), `useTiposResumo`, `useCategorias` (5 min), `useTipoForm(id)`, `useSaveTipoMutation`, `useImportCatalogoMutation` (invalidam `tipos.all`), `useToggleTipoMutation` e `useDeleteTipoMutation` (otimistas com rollback).
- `useListSearchParams` com `cat`, `page`, `size`.
- Feature `src/presentation/features/tipos/`: `TiposScreen.tsx`, `TipoFormScreen.tsx`, `components/{TiposTable,TipoHeaderTooltips,ImportCatalogoModal,TipoIdentificacaoCard,TipoFeatureCard,TipoParamsCard,EditableParamsTable,ParamRowEditor,TipoStatusCard}.tsx`. O formulário guarda `TipoDraft` em `useReducer` (ações `set`, `addRow`, `removeRow`, `updateRow`), compara com o inicial para saber se está sujo e foca o primeiro inválido (refs por campo e por linha).
- **UI kit novo** `CodeTag` (`src/presentation/components/ui/CodeTag.tsx`): `{ children; tone?: 'slate'|'muted'|'blue'|'red'|'purple'|'orange'|'green'|'teal'|'yellow' }` → `<code className="rounded-[4px] bg-apsen-bg px-[7px] py-[2px] font-mono text-[11px] {cor}">` (padrão `slate`).
- **Hook novo** `src/presentation/hooks/useUnsavedChangesGuard.ts`: `useUnsavedChangesGuard(dirty)` → `{ confirmNavigation(href) ; dialog }` — registra `beforeunload` quando sujo, intercepta cliques em links internos do documento (captura) e as ações Cancelar/Voltar, e renderiza o `ConfirmDialog` "Descartar alterações?".
- `UseCases.tipos = { list; categorias; getForm; save; toggle; remove; importar }`; `createContainer` registra `HttpTipoRepository`.

## 9. Arquivos

### Novos

- `src/domain/tipos/{Tipo,vocabulario,tipoRules,catalogoImport,TipoRepository,errors}.ts` e `__tests__/{tipoRules,catalogoImport,vocabulario}.test.ts`
- `src/application/tipos/{ListTipos,ListCategorias,GetTipoForm,SaveTipo,ToggleTipoAtivo,DeleteTipo,ImportCatalogo,dto}.ts` e `__tests__/*.test.ts`
- `src/infrastructure/tipos/{tipoSchemas,tipoMapper,HttpTipoRepository}.ts` e `__tests__/HttpTipoRepository.test.ts`
- `src/presentation/hooks/{useTipos,useTipoMutations,useUnsavedChangesGuard}.ts` e `__tests__/{useTipos,useUnsavedChangesGuard}.test.tsx`
- `src/presentation/features/tipos/{TiposScreen,TipoFormScreen}.tsx`, `components/*.tsx`, `__tests__/{TiposScreen,TipoFormScreen,EditableParamsTable,ImportCatalogoModal}.test.tsx`
- `src/presentation/components/ui/CodeTag.tsx` e `__tests__/CodeTag.test.tsx`
- `src/app/admin/tipos/{page,loading,error}.tsx`, `src/app/admin/tipos/novo/page.tsx`, `src/app/admin/tipos/[id]/editar/{page,loading,not-found}.tsx` e `__tests__/page.test.tsx` em cada pasta

### Modificados

- `queryKeys.ts`, `UseCasesContext.tsx`, `container.ts` (+ teste), `test/renderWithProviders.tsx` — módulo `tipos`.
- `src/presentation/components/ui/index.ts` (+ `index.test.ts`) — `CodeTag`.
- `src/presentation/navigation/routes.ts` — `TIPOS_ROUTE`, `TIPO_NOVO_ROUTE`, `tipoEditarRoute(id)` (se a onda 0 não criou); o registro `screens.ts` cobre `/admin/tipos/[id]/editar` (nível 3, crumb "Novo Tipo" do `crumbMap`).
- Badge "Catálogo de Tipos" da sidebar: `total` de `useTiposResumo`.
- `src/app/globals.css` — `--color-apsen-inline-border` (`#f1f5f9` / escuro `#262b33`) se não houver token equivalente; `DESIGN_SPEC.md` §1 e §3 (`CodeTag`).

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Filtro por categoria = igualdade de `cat` no servidor; "Todos" sem filtro. Resumo: `filtrados` = total da consulta filtrada; `total` e `ativos` = contagens de toda a coleção (o "38 ativos" fixo do protótipo vira dado — ARQUITETURA #5).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| RN-02 | Lag exibido: `0` → "0", positivo → "+n", negativo → "-n". Cor da feature por `FEATURE_COLORS`, fallback muted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| RN-03 | Toggle grava só `ativo` (RN-TIP-01); tipos inativos somem do Driver Form (consumido pela onda 2) e preservam o histórico.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| RN-04 | Validação do tipo [derivado], nesta ordem: slug vazio → "⚠️ Informe o slug."; slug fora de `SLUG_REGEX` → "⚠️ Slug inválido — use letras minúsculas, números e underscore."; slug já usado (novo) → "⚠️ Já existe um tipo com este slug."; label vazio → "⚠️ Informe o label."; sem categoria → "⚠️ Selecione a categoria."; sem dono → "⚠️ Selecione o dono de área."; lag não inteiro ou fora de -3..6 → "⚠️ O lag deve ser um número inteiro entre -3 e 6.".                                                                                                                                                                                                                                                                                                                                                                                                                                |
| RN-05 | Linhas de parâmetro: linha com nome e label vazios é descartada; nome ou label vazio → "⚠️ Campo {n}: informe o nome e o label."; nome de linha nova fora de `SLUG_REGEX` → "⚠️ Campo {n}: nome inválido — use letras minúsculas, números e underscore."; nome repetido → "⚠️ Campo {n}: nome repetido."; select com opções fixas sem nenhuma opção → "⚠️ Campo {n}: informe as opções separadas por \|."; select com origem API sem fonte → "⚠️ Campo {n}: selecione a fonte de dados." (n = posição na tabela). A obrigatoriedade é a coluna "Obrigatório" (RN-TIP-04).                                                                                                                                                                                                                                                                                                                      |
| RN-06 | Salvar novo: `POST /tipos` (`id` UUID, `slug`, `label`, `cat`, `catL` do filtro da categoria, `dono`, `feature`, `lag`, `params = campos.length`, `ativo`, `desc`, `impacto`, `perm`, `nota`) → `POST /camposTipo` (`id` do tipo, `title = label`, `layout: 'g2'`, todos os campos — ARQUITETURA #7) → categoria (RN-08). Editar: `PATCH /tipos/{id}` (tudo menos `id`/`slug`) → `PUT` ou `POST /camposTipo/{id}` (mantém `layout`, `title = label`) → categoria.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| RN-07 | `rowsToCampos`: `id = original?.id ?? 'd_' + nome`, `param = nome`, `label`, `required = obrigatorio`, `type = tipo`; select fixas → `options` = itens de `opcoes.split('                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | ')`com`trim`, sem vazios — se o texto não mudou em relação ao original, mantém as `options`originais (com`group`); select API → `fonte`, sem `options`; demais tipos sem `options`/`fonte`; os outros atributos do original (`placeholder`, `step`, `readonly`, `autocomplete`, `labelHint`) são preservados. `camposToRows` faz o inverso (`opcoes`= labels unidos por` | `; `origem = fonte ? 'api' : 'fixas'`). |
| RN-08 | `/categorias[].tipos` fica coerente com o catálogo: criar acrescenta `{slug,label}` na categoria; editar com mudança de categoria remove da antiga e acrescenta na nova; editar só o label atualiza a entrada; excluir remove.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| RN-09 | Importação: texto vazio → "⚠️ Cole o JSON do catálogo."; JSON inválido → "⚠️ JSON inválido — verifique a sintaxe."; `schema` ≠ `drivers-catalogo-v1` → "⚠️ Schema não reconhecido — use drivers-catalogo-v1."; `tipos` não é array ou vazio → "⚠️ Nenhum tipo encontrado no JSON."; item sem `slug` válido, `label`, `cat` válida ou `dono` → "⚠️ Tipo {n}: informe slug, label, categoria e dono válidos."; slug repetido no arquivo → "⚠️ Tipo {n}: slug repetido no arquivo.". Válido: para cada item, slug existente → `PATCH` dos campos presentes; novo → `POST` com padrões (`feature: 'dummy'`, `lag: 0`, `ativo: true`, textos vazios). `campos` (opcional, mesmo formato de `camposTipo.campos`; `id` padrão `d_` + `param`) faz upsert em `/camposTipo` e define `params`; sem `campos`, novo recebe `campos: []`. RN-08 vale para cada item. Nada é gravado se a validação falhar. |
| RN-10 | Botões de escrita seguem o protótipo (ARQUITETURA #11); ver pergunta ao PO sobre a matriz de permissões.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## 11. BDD — Cenários de teste unitário

| Cenário                                                                                                                  | Arquivo de teste                                                                              | Asserção                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-02 Dado lags e features, quando formata, então "+1", "0", "-1" e tons                                                 | `src/domain/tipos/__tests__/tipoRules.test.ts`                                                | `formatLag`; `featureTone('dummy_censored')` = red; desconhecida = muted                                                                                                                                                |
| RN-04 Dado rascunhos inválidos, quando valida, então mensagens na ordem e por campo                                      | `tipoRules.test.ts`                                                                           | as sete mensagens; `slugExiste` só em novo; lag "7" e "1.5" inválidos                                                                                                                                                   |
| RN-05 Dado linhas, quando valida, então descarta vazias e acusa cada erro com o número                                   | `tipoRules.test.ts`                                                                           | mensagens com {n}; linha original com nome fora do regex é aceita                                                                                                                                                       |
| RN-07 Dado linhas e campos originais, quando converte, então preserva atributos e grupos                                 | `tipoRules.test.ts`                                                                           | `rowsToCampos` gera `d_tipo_epi`; opções agrupadas preservadas com texto igual; origem API grava `fonte` e remove `options`; ida-e-volta `camposToRows` → `rowsToCampos` idempotente para os 47 `camposTipo` do db.json |
| RN-08 Dado mudança de categoria, quando calcula patches, então remove e acrescenta                                       | `tipoRules.test.ts`                                                                           | dois patches; só label → um patch com o label novo; remover → slug fora                                                                                                                                                 |
| RN-09 Dado textos de importação, quando faz o parse, então cada erro e o caso válido                                     | `src/domain/tipos/__tests__/catalogoImport.test.ts`                                           | as seis mensagens; válido devolve os tipos normalizados                                                                                                                                                                 |
| §5 Dado o db.json, quando compara o vocabulário, então as listas batem com `config.opcoes`                               | `src/domain/tipos/__tests__/vocabulario.test.ts`                                              | `tipoCatFilters`, `donosArea`, `featureTipos`, `impactoSerie`, `permanencia`, `paramTipos`; `FEATURE_TONES` cobre `FEATURE_COLORS`                                                                                      |
| RN-01 CA-01 Dado filtro midia, quando ListTipos executa, então filtrados/total/ativos                                    | `src/application/tipos/__tests__/ListTipos.test.ts`                                           | repositório recebe `{cat:'midia'}`; `count()` e `count({ativo:true})`; `lagTxt`                                                                                                                                         |
| RN-06 CA-09 Dado tipo novo, quando SaveTipo executa, então POST tipo, POST campos e PATCH categoria na ordem             | `SaveTipo.test.ts`                                                                            | corpo com UUID, `catL` "🌡️ Sazonalidade", `params` 2; campos com `id` do tipo; categoria com o slug acrescentado; toast "✅ Tipo salvo!"                                                                                |
| RN-06 CA-10 Dado edição com troca de categoria, quando salva, então PATCH, PUT e duas categorias                         | `SaveTipo.test.ts`                                                                            | sem `slug` no PATCH; `layout` mantido; patches das duas categorias                                                                                                                                                      |
| RN-04 Dado slug existente em novo, quando salva, então TipoValidationError sem gravar                                    | `SaveTipo.test.ts`                                                                            | `fields.slug`; nenhuma escrita                                                                                                                                                                                          |
| RN-03 CA-04 Dado toggle, quando executa, então PATCH ativo e toast                                                       | `ToggleTipoAtivo.test.ts`                                                                     | `update(id,{ativo:false})`; `⏸ "tv" desativado.`                                                                                                                                                                        |
| CA-05 Dado exclusão, quando DeleteTipo executa, então apaga tipo, campos (404 tolerado) e categoria                      | `DeleteTipo.test.ts`                                                                          | três chamadas; toast "🗑 Tipo removido."                                                                                                                                                                                 |
| RN-09 CA-06 Dado catálogo com um slug existente e um novo, quando importa, então PATCH + POST e categorias               | `ImportCatalogo.test.ts`                                                                      | contagens; toast "✅ Catálogo importado!"; JSON inválido → `CatalogoImportError` e nenhuma escrita                                                                                                                      |
| CA-10 Dado tipo legado, quando GetTipoForm executa, então draft com feature extra e linhas dos campos                    | `GetTipoForm.test.ts`                                                                         | `featureExtra` "continua_grp"; 6 linhas para `tv`; 404 → `NotFoundError`                                                                                                                                                |
| §4 Dado a API, quando o repositório lê/grava, então queries, schemas e 404 de campos                                     | `src/infrastructure/tipos/__tests__/HttpTipoRepository.test.ts`                               | `getPage('/tipos', {query:{_page,_limit,cat}})`; `count({ativo:true})` lê `total`; `getCampos` 404 → `null`; `saveCampos` PUT/POST; `type` inválido → `InvalidResponseError`                                            |
| CA-01 CA-03 Dado a massa, quando a tela renderiza, então header, chips, resumo e colunas                                 | `src/presentation/features/tipos/__tests__/TiposScreen.test.tsx`                              | resumo "47 de 47 tipos" e "45 ativos"; 10 linhas na página 1; `CodeTag` com tom; tooltips com nome acessível nos 4 cabeçalhos                                                                                           |
| CA-02 Dado `?cat=midia`, quando renderiza e troca chip, então filtra e volta à página 1                                  | `TiposScreen.test.tsx`                                                                        | `list.execute` com `cat:'midia'`; clicar "Filtrar por categoria: 🛒 Comercial" → `routerMock.replace` com `cat=comercial` sem `page`; seletor de tamanho grava `size`                                                   |
| CA-04 Dado o toggle, quando clica e a API falha, então muda e volta                                                      | `TiposScreen.test.tsx`                                                                        | otimista; rollback + toast de falha; sucesso → `⏸ "tv" desativado.`                                                                                                                                                     |
| CA-05 Dado 🗑, quando confirma, então some na hora e toast                                                                | `TiposScreen.test.tsx`                                                                        | `dialog` `Remover o tipo "tv"?`; linha some; "🗑 Tipo removido."                                                                                                                                                         |
| CA-06 Dado o modal de importação, quando importa JSON inválido e depois válido, então erro no campo e sucesso            | `ImportCatalogoModal.test.tsx`                                                                | `aria-invalid` + toast "⚠️ JSON inválido — verifique a sintaxe."; válido chama `importar.execute`, fecha e toast                                                                                                        |
| CA-07 Dado `/admin/tipos/novo`, quando renderiza, então breadcrumb, cards, campos e padrões                              | `TipoFormScreen.test.tsx`                                                                     | breadcrumb "Catálogo"/"Configurar Tipo"; "← Voltar ao Catálogo" (`href` `/admin/tipos`); lag 0 com `min=-3 max=6`; switch "Ativo no Driver Form" ligado; alerta warning                                                 |
| CA-08 Dado a tabela de parâmetros, quando adiciona, remove e troca tipo/origem, então controles mudam                    | `EditableParamsTable.test.tsx`                                                                | linha exemplo com "Epidemia\|Alta sazonal\|Pandemia"; nova linha `text` sem opções; tipo select mostra origem; API mostra "— Selecione a fonte —" e "🏁 Concorrentes / Marcas (mock)"; "Remover campo 1" remove         |
| CA-09 Dado salvar com slug vazio, quando clica, então erro, foco e toast; válido navega                                  | `TipoFormScreen.test.tsx`                                                                     | `aria-invalid` + foco no slug; toast "⚠️ Informe o slug."; válido → `save.execute`, toast "✅ Tipo salvo!", `routerMock.push('/admin/tipos')`; "Salvando…" desabilitado                                                 |
| CA-10 Dado `/admin/tipos/tv/editar`, quando carrega, então pré-preenche com slug readonly; id inexistente chama notFound | `TipoFormScreen.test.tsx`                                                                     | valores de `tv`; slug `readonly`; feature "continua_grp" selecionada; `NotFoundError` → `notFound` mockado chamado                                                                                                      |
| CA-11 Dado formulário sujo, quando clica Cancelar ou link, então confirma                                                | `src/presentation/hooks/__tests__/useUnsavedChangesGuard.test.tsx`, `TipoFormScreen.test.tsx` | `dialog` "Descartar alterações?"; "Descartar" navega; limpo navega direto; `beforeunload` registrado só sujo                                                                                                            |
| CA-12 Dado carregando/erro/vazio, quando renderiza, então estados                                                        | `TiposScreen.test.tsx`, `TipoFormScreen.test.tsx`                                             | "Carregando…"; "Tentar novamente"; "Nenhum tipo nesta categoria."                                                                                                                                                       |
| §8 Dado CodeTag, quando renderiza com tom, então classes                                                                 | `src/presentation/components/ui/__tests__/CodeTag.test.tsx`                                   | `font-mono text-[11px] bg-apsen-bg`; `tone="red"` → `text-apsen-red`; padrão slate                                                                                                                                      |
| §3 Dado as rotas, quando renderiza, então metadata e `params` Promise                                                    | `src/app/admin/tipos/**/__tests__/page.test.tsx`                                              | títulos "Catálogo de Tipos"/"Novo Tipo"/"Editar Tipo"; página de edição `await params` e passa `id` decodificado                                                                                                        |

## 12. Requisitos não funcionais

| Item | Como atende                                                                                                                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §7.1 | Tabela paginada no servidor (10, seletor 10/25/50), filtro `cat` no servidor, `cat`/`page`/`size` na URL, troca de filtro volta à página 1, `keepPreviousData` e prefetch da próxima página. Sem busca textual (o protótipo não tem). |
| §7.2 | Rotas próprias para lista, novo e edição; `loading.tsx`, `error.tsx` e `not-found.tsx` (edição); `ImportCatalogoModal` via `next/dynamic`; guarda antes das queries.                                                                  |
| §7.3 | `staleTime` 30 s (lista) e 5 min (categorias, opções de fonte); invalidação só de `tipos.all`; toggle e exclusão otimistas com rollback; exclusão confirmada; "Salvando…"/"Importando…".                                              |
| §7.4 | Validação por campo e por linha, foco no primeiro inválido, toast; lag `min/max/step`; aviso de alterações não salvas.                                                                                                                |
| §7.5 | Controles da tabela de parâmetros com `aria-label` por linha; `Table` com `caption`; tooltips acessíveis por teclado; tabela de parâmetros e catálogo com scroll horizontal em 360 px.                                                |
| §7.6 | IDs UUID para tipos novos (RN-SEG-03); sem `console`; o JSON importado não é logado.                                                                                                                                                  |
