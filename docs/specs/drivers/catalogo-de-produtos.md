---
status: REVIEW
fase: 22
area: drivers
feature: catalogo-de-produtos
azure-devops-work-item: 39038
---

# Consultar o Catálogo de Produtos e os drivers da família

## 1. Overview

PBI 39038 "[FRONT] Consultar o Catálogo de Produtos" (`docs/Sprint-1-Historias/F6-Catalogo-de-Produtos.md`): **como** Planejador de demanda, **quero** consultar o catálogo (franquia → família → SKU), **para** saber em qual produto vou registrar drivers. Porta as telas `catalogo` (L3090–3131, JS L7545–7637) e `catalogo-drivers` (L3134–3151, JS L7639–7710) do protótipo `docs/Negócio/di-drivers-v2_84.html`: uma linha por família com franquia, nº de SKUs e nº de drivers (RN-DRV-03, RN-DRV-11), e o detalhe de uma família com seus drivers, de onde se visualiza, edita ou cadastra driver já com a família preenchida (RN-DRV-10).

Escopo: a tabela do catálogo (`/drivers/catalogo`) cumpre a PBI 39038; o detalhe `/drivers/catalogo/[familia]` e o "Cadastrar novo driver" estavam fora da Sprint 1 na história e entram aqui, na onda 2, porque o formulário ([registrar-driver](registrar-driver.md), fase 20) e a lista ([meus-registros-e-exportar](meus-registros-e-exportar.md), fase 21, com o `DriverTypeBadge`) já existem.

Decisões desta spec:

- **Integração HTTP** (ARQUITETURA §1, final): a leitura é pela porta `ProductCatalogRepository` (o "`IProductCatalogProvider`" da história) implementada por `HttpProductCatalogRepository` no json-server. O CA-05 da história ("sem rede com o mock") é substituído pela decisão transversal; trocar pelo Snowflake continua sendo só outra implementação da porta.
- **Paginação, busca e filtros no servidor** (§7.1): `GET /familias?_page&_limit&_sort=franquia,id&q=&franquia=&id=`, total por `X-Total-Count`, 10 por página com seletor 10/25/50 (92 famílias), estado na URL.
- **Filtros encadeados** (CA-03 da história): escolher a franquia limita as famílias do segundo select e limpa a família se ela não pertence à franquia. No protótipo os filtros não são encadeados (L7549) — divergência registrada.
- **Contagem de drivers** fiel a `catalogoDriversDaFamilia` (L7569–7581), calculada no domínio sobre todos os drivers (`GET /drivers`), porque a regra casa por substring e não tem filtro equivalente no json-server.

Perguntas em aberto ao PO (não bloqueiam):

1. **Coluna Drivers sem drivers**: a história pede "0"; o protótipo mostra "—". Segue a história ("0", mesmo estilo muted do "—").
2. **Filtros encadeados** (história) × independentes (protótipo): segue a história.
3. **Busca**: `q=` do json-server também casa o nome da franquia, além de família e SKU (protótipo: só família ou SKU).
4. **Regra de contagem** do protótipo conta um driver de modo Franquia em todas as famílias da franquia e, por substring, um driver da família `RETEMIC` também em `RETEMIC UD`. Mantida fiel; confirmar.
5. Fonte de verdade das duas massas de produto (decisão 1): drivers com produtos fora do catálogo (ex. Baricitinibe) não aparecem em nenhuma família.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                              |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/drivers/catalogo` mostra o título "Catálogo de Produtos", o subtítulo "Franquias e famílias cadastradas · Drivers por produto" e o `ScreenDesc` 📚.                                                                                                                                                                                                 |
| CA-02 | A tabela tem as colunas Franquia, Família, SKUs, Drivers e Ações; uma linha por família, ordenada por franquia e família; Franquia em pill com a cor da franquia; Drivers em pill azul com o número, ou "0" quando não há; Ações com "📊 Drivers" que leva a `/drivers/catalogo/{familia}`.                                                           |
| CA-03 | Filtros: busca "Buscar família ou SKU..." (debounce 300 ms), "Todas as franquias" + franquias em ordem alfabética, "Todas as famílias" agrupadas por franquia; escolher a franquia limita as famílias; o contador "**{n}** família(s) no catálogo" reflete o total filtrado.                                                                          |
| CA-04 | Estados de carregando (skeleton da tabela), erro com "Tentar novamente" e vazio "Nenhuma família encontrada com os filtros atuais."; lista paginada no servidor (10 por página, seletor 10/25/50); busca, filtros, página e tamanho na URL; mudar busca ou filtro volta à página 1.                                                                   |
| CA-05 | A tela lê só pelos casos de uso do módulo `catalogo` (porta `ProductCatalogRepository`), sem acesso direto à infraestrutura.                                                                                                                                                                                                                          |
| CA-06 | Perfil sem nível 2 (Visualizador) vê o Acesso Negado em `/drivers/catalogo` e `/drivers/catalogo/{familia}`, sem carregar dados.                                                                                                                                                                                                                      |
| CA-07 | Segue o `DESIGN_SPEC.md` nos dois temas (só tokens), acessível por teclado e leitor de tela (tabela com `caption`/`scope`, filtros com rótulo).                                                                                                                                                                                                       |
| CA-08 | `/drivers/catalogo/{familia}` mostra "Drivers — {familia}" / "Franquia **{F}** · Família **{fam}** · {n} driver(s) cadastrado(s)", as ações "← Voltar ao catálogo" e "+ Cadastrar novo driver" (→ `/drivers/novo?familia={fam}`), o `ScreenDesc` 🎯 e a tabela Tipo · Título / Produto · Período · Nível · Intens. · Ações (👁 Visualizar, ✏️ Editar). |
| CA-09 | Sem drivers, o detalhe mostra 📭 "Nenhum driver cadastrado para esta família" / 'Clique em "Cadastrar novo driver" para registrar o primeiro.'; família inexistente mostra a página de não encontrado; estados de carregando e erro com "Tentar novamente".                                                                                           |
| CA-10 | Visualizar e Editar levam a `/drivers/{id}?familia={fam}` e `/drivers/{id}/editar?familia={fam}`; voltando do formulário, a lista e as contagens refletem o que foi salvo.                                                                                                                                                                            |

## 3. UX / Fluxo de tela

Referências: `DESIGN_SPEC.md` §3.7 (`PageHeader`), §3.8 (`ScreenDesc`), §3.12 (estados), §3.14 (`SearchInput`, `FormSelect`, `ResultSummary`, `Pagination`), §3.17 (`Table`) e o `DriverTypeBadge` (fase 21). Esta spec cria as seções §4.x "Catálogo de Produtos" e "Drivers da Família" e a variante `card` da `Table` no `DESIGN_SPEC.md`.

### 3.1 Rotas

| Rota                                                       | Arquivo                                       | `metadata.title`       | Tela (nível)           |
| ---------------------------------------------------------- | --------------------------------------------- | ---------------------- | ---------------------- |
| `/drivers/catalogo` (`?q=&franquia=&familia=&page=&size=`) | `src/app/drivers/catalogo/page.tsx`           | "Catálogo de Produtos" | `catalogo` (2)         |
| `/drivers/catalogo/[familia]` (`?page=`)                   | `src/app/drivers/catalogo/[familia]/page.tsx` | "Drivers da Família"   | `catalogo-drivers` (2) |

- Páginas finas: `searchParams`/`params` são `Promise` (Next 16); a página normaliza (`parseCatalogParams`: `q` texto, `franquia`/`familia` texto ou vazio, `page` ≥ 1, `size` ∈ {10,25,50}) e passa à `Screen`. `familia` do segmento chega decodificada; nomes com espaço e `+` (`MOTILEX HA + MSM`) usam `catalogoFamiliaRoute` (`encodeURIComponent`, fase 20).
- Segmento `src/app/drivers/catalogo/` com `loading.tsx` (skeleton da tabela) e `error.tsx`; `src/app/drivers/catalogo/[familia]/not-found.tsx` (`ErrorState icon="🔍" title="Família não encontrada"` + `ButtonLink outline` "← Voltar ao catálogo").
- Crumbs (`crumbMap`): "Catálogo de Produtos" e "Drivers da Família"; ambas no módulo Drivers da sidebar (item "Catálogo de Produtos" ativo nas duas).

### 3.2 Catálogo de Produtos (L3090–3131)

- `PageHeader title="Catálogo de Produtos" description="Franquias e famílias cadastradas · Drivers por produto"`.
- `ScreenDesc icon="📚"`: "**Consulte as franquias e famílias do catálogo Apsen e os drivers já registrados para cada uma.** Use os filtros para localizar uma franquia ou família. Clique no ícone de drivers de uma linha para ver todos os drivers cadastrados para aquela família e seus SKUs."
- Barra de filtros `div role="search" aria-label="Filtrar catálogo"` `mb-[14px] flex flex-wrap gap-[10px]`:
  - `SearchInput` placeholder "Buscar família ou SKU..." `aria-label="Buscar família ou SKU"`, `className="min-w-[200px]"`, altura 38px (`[&_input]:h-[38px]`), sem `max-w` [L3104: `flex:1`] — extensão `SearchInput` com `grow` (`max-w-none`).
  - `FormSelect aria-label="Filtrar por franquia" placeholder="Todas as franquias"` `className="w-[190px] h-[38px]"`, opções = franquias ordenadas.
  - `FormSelect aria-label="Filtrar por família" placeholder="Todas as famílias"` mesmo tamanho; sem franquia: `groups` = uma por franquia (ordenadas) com as famílias ordenadas; com franquia: só as famílias dela, sem grupos.
- `ResultSummary`: `<strong>{total}</strong> {total === 1 ? 'família' : 'famílias'} no catálogo` (`aria-live="polite"`); à direita, o seletor "Itens por página" (10/25/50).
- `Table variant="card" caption="Famílias do catálogo de produtos"`:

| Coluna   | `header` | Alinhamento | Célula                                                                                                                                                                                                  |
| -------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| franquia | Franquia | esquerda    | `FranquiaPill`: `inline-flex rounded-[6px] px-[9px] py-[2px] text-[11px] font-bold` + `text-apsen-franq-{f} bg-apsen-franq-{f}/[8.2%]` (alpha `15` hex, L7625); franquia fora do mapa → `franq-default` |
| familia  | Família  | esquerda    | `font-medium text-apsen-slate`                                                                                                                                                                          |
| skus     | SKUs     | centro      | `text-apsen-muted`, nº de SKUs                                                                                                                                                                          |
| drivers  | Drivers  | centro      | `n > 0`: `inline-flex items-center rounded-[20px] bg-apsen-blue-bg px-[10px] py-[2px] text-[12px] font-semibold text-apsen-blue` com `n`; `n = 0`: `text-[12px] text-apsen-muted` "0"                   |
| acoes    | Ações    | centro      | `IconLink variant="outlined-wide" tone="blue"` com `ChartIcon` 14px + "Drivers", `title="Ver drivers desta família"`, `aria-label="Ver drivers da família {fam}"` → `catalogoFamiliaRoute(fam)`         |

- Rodapé `Pagination` (`info` "Mostrando a–b de n") quando `total > size`; `keepPreviousData` (linhas anteriores ficam até chegar a página nova, com `aria-busy`).
- Vazio: `emptyText="Nenhuma família encontrada com os filtros atuais."`. Carregando: `CatalogTableSkeleton` (cabeçalho real + 10 linhas cinza, `role="status"` "Carregando catálogo…"). Erro: `ErrorState` + "Tentar novamente".

Variante `card` da `Table` (extensão; L3117–3127, L7624–7635): wrapper `mb-[16px] overflow-hidden rounded-apsen-lg border border-apsen-border bg-apsen-white shadow-apsen-sm` (`.card` com `padding:0`), `th` `px-[16px] py-[11px] text-[11px] font-semibold uppercase tracking-[.05em] text-apsen-muted`, `td` `border-b border-apsen-bg px-[16px] py-[11px] text-[13px]`, coluna com `align: 'center'` → `text-center`. A variante `default` não muda. A coluna "Ações" da variante usa o mesmo `th` e `align` da coluna `acoes` (o catálogo passa as ações como coluna para centralizar).

### 3.3 Drivers da Família (L3134–3151, L7652–7710)

- `PageHeader title="Drivers — {familia}" meta={<>Franquia <strong>{franquia}</strong> · Família <strong>{familia}</strong> · {n} driver(s) cadastrado(s)</>}` e ações `ButtonLink ghost sm` "← Voltar ao catálogo" → `/drivers/catalogo` e `ButtonLink primary sm` "+ Cadastrar novo driver" → `novoDriverRoute(familia)`.
- `ScreenDesc icon="🎯"`: "**Drivers cadastrados para esta família.** Visualize os detalhes de cada driver, edite os existentes ou cadastre um novo — a família já vem preenchida automaticamente."
- `Table variant="card" caption="Drivers da família {familia}"`:

| Coluna      | `header`         | Alinhamento                 | Célula                                                                                                                                                                                                                              |
| ----------- | ---------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tipo        | Tipo             | esquerda                    | `DriverTypeBadge`                                                                                                                                                                                                                   |
| titulo      | Título / Produto | esquerda                    | `div.font-semibold.text-apsen-slate` `{titulo ‖ '—'}` + `div.text-[11.5px].text-apsen-muted` `{produto}`                                                                                                                            |
| periodo     | Período          | esquerda                    | `text-[12px] text-apsen-muted` "{inicio} → {fim}"                                                                                                                                                                                   |
| nivel       | Nível            | centro                      | `DriverLevelPill` `rounded-[8px] px-[8px] py-[2px] text-[10px]`: SKU `bg-apsen-blue-bg text-apsen-blue`; Franquia `bg-apsen-cyan-bg text-apsen-cyan`; Família `bg-apsen-purple-soft text-apsen-purple`                              |
| intensidade | Intens.          | centro                      | `text-[12px] text-apsen-star` com `estrelas(n)` e `aria-label="Intensidade {n} de 5"`                                                                                                                                               |
| acoes       | Ações            | centro, `whitespace-nowrap` | `IconLink variant="outlined"` `EyeIcon` `aria-label="Visualizar"` (muted) → `driverRoute(id, familia)` · `IconLink variant="outlined" tone="blue"` `EditIcon` `aria-label="Editar"` → `editarDriverRoute(id, familia)`, `gap-[4px]` |

- Mais de 10 drivers: `Pagination` local (10 por página, `?page=` na URL).
- Vazio: `Card` com `EmptyState icon="📭" title="Nenhum driver cadastrado para esta família" description='Clique em "Cadastrar novo driver" para registrar o primeiro.'` (protótipo `padding:40px`; o `state-block` tem 48/24 — diferença aceita).
- Carregando: skeleton de header + tabela; erro: `ErrorState` + "Tentar novamente"; família inexistente: `notFound()`.

`IconLink` ganha `variant?: 'ghost' | 'outlined' | 'outlined-wide'` (padrão `ghost`, igual a hoje) e `tone?: 'muted' | 'blue'`: `outlined` = `inline-flex items-center rounded-[6px] border border-apsen-border bg-transparent px-[8px] py-[5px] transition-all duration-[130ms] hover:bg-apsen-blue-bg focus-ring` (L7700–7705); `outlined-wide` = `inline-flex items-center gap-[5px] rounded-[7px] border border-apsen-border bg-transparent px-[10px] py-[5px] text-[12px] hover:bg-apsen-blue-bg focus-ring` (L7630–7633); `tone` muted `text-apsen-muted`, blue `text-apsen-blue`. Se a onda 1 já tiver `tone`, reaproveitar.

### 3.4 Tokens novos (claro = protótipo; escuro [derivado])

| Token                         | Claro     | Escuro    | Uso                 |
| ----------------------------- | --------- | --------- | ------------------- |
| `--color-apsen-franq-aster`   | `#2563eb` | `#6b93f5` | pill ASTER          |
| `--color-apsen-franq-lyra`    | `#7c3aed` | `#a78bfa` | pill LYRA           |
| `--color-apsen-franq-polaris` | `#0891b2` | `#22b8d6` | pill POLARIS        |
| `--color-apsen-franq-sagita`  | `#d97706` | `#f0a23a` | pill SAGITA         |
| `--color-apsen-franq-sirius`  | `#059669` | `#34c99a` | pill SIRIUS         |
| `--color-apsen-franq-solaris` | `#dc2626` | `#f06565` | pill SOLARIS        |
| `--color-apsen-franq-default` | `#64748b` | `#94a3b8` | fallback (L7620)    |
| `--color-apsen-cyan-bg`       | `#e0f2fe` | `#0b2a3a` | pill nível Franquia |
| `--color-apsen-purple-soft`   | `#f3e8ff` | `#2a1f4a` | pill nível Família  |
| `--color-apsen-star`          | `#f59e0b` | `#f59e0b` | estrelas            |

Se outra spec da onda já criou token com o mesmo valor e papel (ex. pills de franquia/família do plano), reutilizar e não duplicar.

## 4. Contratos de API consumidos

`GET {API}/familias?_page={p}&_limit={s}&_sort=franquia,id&_order=asc,asc[&q={busca}][&franquia={F}][&id={FAM}]` — via `HttpClient.getPage`; `X-Total-Count` obrigatório.

```json
[
  {
    "id": "ENIAGOR",
    "franquia": "ASTER",
    "skus": ["ENIAGOR 50MG/ML  SOL - 1 FR. (3250)", "ENIAGOR CONTA GOTAS 50ML (3785)"]
  }
]
```

`GET {API}/franquias` — `[{ "id": "ASTER", "familias": ["ENIAGOR", "ENIAGOR SEC", "…"] }]` (6 itens; opções dos dois selects; `staleTime` 5 min).

`GET {API}/familias/{encodeURIComponent(familia)}` — uma família; 404 → `NotFoundError('Família', familia)`.

`GET {API}/drivers` — todos os drivers (schema `driverDtoSchema`, fase 20) para contar e listar; `GET /categorias` e `GET /config` (fases 20/21) para o badge do tipo.

```ts
const familiaSchema = z.object({
  id: z.string().min(1),
  franquia: z.string().min(1),
  skus: z.array(z.string()),
});
const franquiaSchema = z.object({ id: z.string().min(1), familias: z.array(z.string()) });
```

Payload fora do schema → `InvalidResponseError` (estado de erro com "Tentar novamente"); 5xx/`NetworkError` → idem.

## 5. Domínio (`src/domain`)

- `catalogo/ProductCatalogRepository` ganha `listFamilias(q: CatalogQuery): Promise<Page<Familia>>` com `CatalogQuery { busca: string; franquia: string; familia: string; page: number; size: number }`.
- `catalogo/driversDaFamilia.ts`: `driversDaFamilia(drivers, franquia, familia, skusDaFamilia)` (RN-02) e `contarDrivers(...)`.
- `catalogo/filtrosCatalogo.ts`: `opcoesFranquia(franquias)` (ids ordenados), `opcoesFamilia(franquias, franquia)` (RN-04), `aplicarFranquia(filtros, franquia, franquias)` (limpa família de outra franquia), `normalizarBusca(texto)` (`trim`).
- `catalogo/nivel.ts`: `nivelDoDriver(modo): { label: 'SKU' | 'Franquia' | 'Família'; tone: 'sku' | 'franquia' | 'familia' }`.
- `catalogo/franquiaTone.ts`: `tomDaFranquia(id): 'aster'|'lyra'|'polaris'|'sagita'|'sirius'|'solaris'|'default'`.
- `estrelas`, `periodoTexto`, `badgeTone` vêm de `domain/drivers` (fase 21).

## 6. Aplicação (`src/application`)

| Caso de uso           | Construtor                                                               | `execute`        | Saída                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ListCatalogFamilias` | `ProductCatalogRepository`, `DriverRepository`                           | `(CatalogQuery)` | `{ rows: CatalogRowDto[]; total; page; size }`, `CatalogRowDto { franquia; familia; nSkus; nDrivers }` (página e drivers em paralelo) |
| `GetCatalogFilters`   | `ProductCatalogRepository`                                               | `()`             | `{ franquias: string[]; familiasPorFranquia: Record<string, string[]> }` (ordenados por RN-04)                                        |
| `GetFamiliaDrivers`   | `ProductCatalogRepository`, `DriverRepository`, `DriverLookupRepository` | `(familia)`      | `{ franquia; familia; drivers: FamiliaDriverRowDto[] }`; `NotFoundError` se a família não existe                                      |

```ts
interface FamiliaDriverRowDto {
  id: string;
  badge: { label: string; tone: DriverBadgeTone };
  titulo: string;
  produto: string;
  periodo: string;
  nivel: { label: 'SKU' | 'Franquia' | 'Família'; tone: 'sku' | 'franquia' | 'familia' };
  intensidade: number;
  estrelas: string;
}
```

## 7. Infraestrutura (`src/infrastructure`)

`HttpProductCatalogRepository.listFamilias`: monta a query só com os filtros preenchidos (`q`, `franquia`, `id`), `_page`, `_limit`, `_sort=franquia,id`, `_order=asc,asc`; valida `familiaSchema[]` e o total. `listFranquias`/`getFamilia` já existem (fase 20). Teste com `fakeFetch` cobrindo URL, header de total e 404.

## 8. Apresentação (`src/presentation`)

- `UseCases.catalogo` ganha `listFamilias`, `filters`, `familiaDrivers`; `createContainer` e `createFakeUseCases` atualizados.
- `queryKeys.catalogo.list = (q: CatalogQuery) => ['catalogo','list',q]`, `queryKeys.catalogo.filters = ['catalogo','filters']`, `queryKeys.catalogo.familia = (f) => ['catalogo','familia',f]`. As mutações de driver (fases 20/21) já invalidam `['catalogo']`.
- Hooks: `useCatalogFamilias(query)` (`staleTime` 30 s, `keepPreviousData`, prefetch da próxima página), `useCatalogFilters()` (5 min), `useFamiliaDrivers(familia)` (30 s).
- `useCatalogParams()` (`src/presentation/features/drivers/catalog/useCatalogParams.ts`): lê `q`, `franquia`, `familia`, `page`, `size` de `useSearchParams` e escreve com `router.replace`; a busca tem estado local e só vai para a URL após 300 ms sem digitar (`useDebouncedValue`); toda mudança de busca/filtro/tamanho grava `page=1`; parâmetros padrão saem da URL.
- Componentes em `src/presentation/features/drivers/catalog/`: `CatalogScreen`, `CatalogFilters`, `CatalogTable`, `CatalogTableSkeleton`, `FranquiaPill`, `FamiliaDriversScreen`, `FamiliaDriversTable`, `DriverLevelPill`.

## 9. Arquivos

### Novos

- `src/domain/catalogo/{driversDaFamilia,filtrosCatalogo,nivel,franquiaTone}.ts` + `__tests__/`
- `src/application/catalogo/{ListCatalogFamilias,GetCatalogFilters,GetFamiliaDrivers}.ts` + `__tests__/`
- `src/presentation/features/drivers/catalog/` (componentes do §8 e `useCatalogParams.ts`) + `__tests__/`
- `src/presentation/hooks/{useCatalogFamilias,useCatalogFilters,useFamiliaDrivers,useDebouncedValue}.ts` + `__tests__/` (`useDebouncedValue` só se ainda não existir)
- `src/app/drivers/catalogo/page.tsx`, `src/app/drivers/catalogo/loading.tsx`, `src/app/drivers/catalogo/error.tsx`, `src/app/drivers/catalogo/[familia]/page.tsx`, `src/app/drivers/catalogo/[familia]/not-found.tsx` + `src/app/__tests__/catalogoRoutes.test.tsx`
- `test/factories/catalogo.ts` (`makeFamilia`, `makeFranquia`, `makeCatalogRow`)

### Modificados

- `src/domain/catalogo/ProductCatalogRepository.ts`, `src/infrastructure/catalogo/HttpProductCatalogRepository.ts` (+ testes) — `listFamilias`.
- `src/presentation/providers/UseCasesContext.tsx`, `src/main/container.ts`, `test/renderWithProviders.tsx`, `src/presentation/hooks/queryKeys.ts`.
- `src/presentation/components/ui/Table.tsx` (+ teste) — `variant?: 'default' | 'card'` e `TableColumn.align?: 'left' | 'center'`.
- `src/presentation/components/ui/IconButton.tsx` (+ teste) — `IconLink` com `variant` e `tone` (§3.3).
- `src/presentation/components/ui/SearchInput.tsx` (+ teste) — `grow?: boolean` (sem `max-w-[360px]`, altura 38px).
- `src/presentation/components/ui/icons.tsx` + `index.ts` (+ teste) — `ChartIcon` (L7632) e `EditIcon` (L7705).
- `src/presentation/navigation/screens.ts` — conferir `catalogo` e `catalogo-drivers` (onda 0).
- `src/app/globals.css` (+ `globals.test.ts`) — tokens do §3.4.
- `docs/design/DESIGN_SPEC.md` — §4 "Catálogo de Produtos", "Drivers da Família", variante `card` da tabela, `IconLink` outlined e tokens.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Uma linha por família (RN-DRV-11), ordenada por franquia e depois família (`_sort=franquia,id`); `nSkus = skus.length`.                                                                                                                                                                                                                                                                                                    |
| RN-02 | `driversDaFamilia` (L7569–7581): o driver entra se (a) `molecula === familia`; ou (b) `modo === 'franquia'` e `molecula === franquia`; ou (c) `codigo` não vazio e algum SKU `s` tem `s.includes(codigo)` ou `codigo.includes(s)`; ou (d) `produto` não vazio e, com `base = produto.split('(')[0].trim()`, algum SKU tem `s.includes(base)` ou `base.includes(s.split('(')[0].trim())`. Ordem = ordem dos drivers na API. |
| RN-03 | Busca: texto com `trim` enviado como `q` (sem diferenciar caixa, pelo json-server); vazio não filtra.                                                                                                                                                                                                                                                                                                                      |
| RN-04 | Filtros encadeados (CA-03 da PBI): opções de franquia = ids ordenados (`<`, como `.sort()` L7554); opções de família = sem franquia, grupos por franquia ordenada com famílias ordenadas; com franquia, só as dela. Escolher uma franquia que não contém a família selecionada limpa a família.                                                                                                                            |
| RN-05 | Toda mudança de busca, franquia, família ou tamanho volta à página 1; `page` acima da última vai para a última.                                                                                                                                                                                                                                                                                                            |
| RN-06 | Contador: `<strong>{total}</strong> família` + `s` quando `total !== 1` + " no catálogo" (L7606).                                                                                                                                                                                                                                                                                                                          |
| RN-07 | Coluna Drivers: `nDrivers > 0` em pill azul; `0` como texto muted "0" (PBI CA-02; divergência registrada).                                                                                                                                                                                                                                                                                                                 |
| RN-08 | Detalhe: título "Drivers — {familia}", subtítulo com franquia, família e `{n} driver(s) cadastrado(s)` (n = total da família, não da página); nível SKU/Franquia/Família por `modo`; estrelas `★`×n + `☆`×(5−n); título vazio vira "—".                                                                                                                                                                                    |
| RN-09 | Links do detalhe sempre levam `?familia={fam}` (contexto `_catCtxFamilia`): o formulário usa para o subtítulo, o "Voltar" e o retorno pós-salvar (fase 20).                                                                                                                                                                                                                                                                |
| RN-10 | `tomDaFranquia`: ASTER, LYRA, POLARIS, SAGITA, SIRIUS, SOLARIS → token próprio; outra → `default` (L7614–7620).                                                                                                                                                                                                                                                                                                            |

## 11. Requisitos não funcionais

| Item (ARQUITETURA §7)   | Como se aplica                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 paginação/busca/URL | catálogo paginado no servidor (`_page`/`_limit`, `X-Total-Count`), 10 por página com seletor 10/25/50; busca com debounce 300 ms e filtros na API; `q`/`franquia`/`familia`/`page`/`size` na URL; ordenação no servidor; `keepPreviousData` + prefetch da próxima página. Selects de filtro vêm de `/franquias` (6 registros), sem baixar as 92 famílias. Exceções justificadas: a contagem de drivers e a lista da família usam todos os drivers (regra por substring); a tabela da família pagina no cliente. |
| 7.2 rotas               | rotas reais por tela; `loading.tsx`, `error.tsx` e `not-found.tsx`; guarda de perfil antes das queries (onda 0).                                                                                                                                                                                                                                                                                                                                                                                                |
| 7.3 cache               | lista 30 s, filtros 5 min; invalidação por `['catalogo']` nas mutações de driver.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 7.4 formulários         | não se aplica (só filtros).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 7.5 a11y/responsivo     | `caption` e `th scope="col"`; filtros com `aria-label`; `role="search"`; links de ação com nome próprio ("Ver drivers da família X", "Visualizar", "Editar"); contador `aria-live`; tabela com scroll horizontal no contêiner e filtros quebrando linha até 360 px; `aria-busy` durante a troca de página.                                                                                                                                                                                                      |
| 7.6 segurança           | sem `console.*`; parâmetros com `encodeURIComponent`.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## 12. BDD — Cenários de teste unitário

| Cenário                                                                                                                                          | Arquivo de teste                                                                             | Asserção                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 Dado o catálogo carregado, quando abre, então título, subtítulo e ScreenDesc                                                               | `src/presentation/features/drivers/catalog/__tests__/CatalogScreen.test.tsx`                 | `heading` "Catálogo de Produtos"; "Franquias e famílias cadastradas · Drivers por produto"; `strong` do ScreenDesc                                                                                                                                                                                      |
| CA-02 / RN-01 / RN-07 Dado ASTER/LEVOXIN com 2 drivers e ASTER/FEMELIV com 0, quando renderiza, então colunas e células                          | `CatalogTable.test.tsx`                                                                      | `columnheader` Franquia, Família, SKUs, Drivers, Ações; pill ASTER com `text-apsen-franq-aster`; "2" em pill `bg-apsen-blue-bg`; FEMELIV "0" `text-apsen-muted`; link "Ver drivers da família LEVOXIN" → `/drivers/catalogo/LEVOXIN`; `MOTILEX HA + MSM` → `/drivers/catalogo/MOTILEX%20HA%20%2B%20MSM` |
| CA-03 / RN-04 Dado franquias, quando escolhe LYRA, então o select de famílias só tem as de LYRA e a família de outra franquia é limpa            | `CatalogFilters.test.tsx`, `filtrosCatalogo.test.ts`                                         | opções "Todas as famílias" + famílias de LYRA; sem franquia, `optgroup` por franquia ordenada; `aplicarFranquia` zera `familia` de ASTER                                                                                                                                                                |
| CA-03 / RN-03 / RN-05 Dado a busca, quando digita "lev", então só após 300 ms grava `q=lev&page=1`                                               | `useCatalogParams.test.tsx`                                                                  | fake timers: antes de 300 ms `routerMock.replace` não chamado; depois com `q=lev` e `page=1`; mudar franquia também grava `page=1`                                                                                                                                                                      |
| CA-03 / RN-06 Dado total 1 e 92, quando renderiza, então contador singular/plural                                                                | `CatalogScreen.test.tsx`                                                                     | "1 família no catálogo"; "92 famílias no catálogo" com `strong`                                                                                                                                                                                                                                         |
| CA-04 Dado query pendente, rejeitada e vazia, quando renderiza, então skeleton, erro com retry e vazio                                           | `CatalogScreen.test.tsx`                                                                     | `role="status"` "Carregando catálogo…"; "Tentar novamente" refaz `listFamilias.execute`; "Nenhuma família encontrada com os filtros atuais." com `colSpan=5`                                                                                                                                            |
| CA-04 Dado total 92 e `?page=2&size=25`, quando renderiza, então pede a página e mostra paginação e seletor                                      | `CatalogScreen.test.tsx`, `ListCatalogFamilias.test.ts`                                      | `listFamilias.execute` com `{page:2,size:25,…}`; "Mostrando 26–50 de 92"; seletor com 10/25/50                                                                                                                                                                                                          |
| CA-04 Dado filtros, quando o repositório lista, então URL do json-server                                                                         | `src/infrastructure/catalogo/__tests__/HttpProductCatalogRepository.test.ts`                 | `/familias?_page=1&_limit=10&_sort=franquia%2Cid&_order=asc%2Casc&q=lev&franquia=ASTER`; sem filtros, sem `q`/`franquia`/`id`; sem `X-Total-Count` → `InvalidResponseError`                                                                                                                             |
| CA-05 Dado a tela, quando renderiza com `createFakeUseCases`, então só usa `useCases.catalogo`                                                   | `CatalogScreen.test.tsx`                                                                     | só os stubs `catalogo.listFamilias`/`catalogo.filters` chamados; lint de camadas verde                                                                                                                                                                                                                  |
| CA-06 Dado perfil Visualizador, quando abre as duas rotas, então Acesso Negado e nenhuma query                                                   | `CatalogScreen.test.tsx`, `FamiliaDriversScreen.test.tsx` (guarda da onda 0)                 | tela de acesso negado; `listFamilias.execute`/`familiaDrivers.execute` não chamados                                                                                                                                                                                                                     |
| CA-07 Dado a tabela, quando renderiza, então `caption`, `scope` e tokens                                                                         | `CatalogTable.test.tsx`, `src/app/__tests__/globals.test.ts`, `designTokensSource`           | `getByRole('table', { name: 'Famílias do catálogo de produtos' })`; `th` com `scope="col"` e `uppercase`; tokens `franq-*`, `cyan-bg`, `purple-soft`, `star` nos dois temas; nenhum hex nos arquivos novos                                                                                              |
| RN-02 Dado drivers dos 4 casos, quando conta, então casa como o protótipo                                                                        | `src/domain/catalogo/__tests__/driversDaFamilia.test.ts`                                     | por `molecula`; modo franquia em todas as famílias da franquia; `codigo` "2300" em LEVOXIN; `produto` "LEVOXIN (Família)" casa LEVOXIN; `RETEMIC (Família)` também em RETEMIC UD; `produto` vazio não casa                                                                                              |
| CA-08 / RN-08 Dado LEVOXIN com 2 drivers, quando abre o detalhe, então header, ações e tabela                                                    | `FamiliaDriversScreen.test.tsx`, `FamiliaDriversTable.test.tsx`, `GetFamiliaDrivers.test.ts` | `heading` "Drivers — LEVOXIN"; meta com `strong` ASTER e LEVOXIN e "2 driver(s) cadastrado(s)"; "← Voltar ao catálogo" → `/drivers/catalogo`; "+ Cadastrar novo driver" → `/drivers/novo?familia=LEVOXIN`; nível "Família" com `bg-apsen-purple-soft`; "★★★★★"; título vazio "—"                        |
| CA-09 Dado família sem drivers / inexistente / erro, quando abre, então vazio, not-found e retry                                                 | `FamiliaDriversScreen.test.tsx`                                                              | "Nenhum driver cadastrado para esta família"; `NotFoundError` → `notFound` chamado; "Tentar novamente" refaz                                                                                                                                                                                            |
| CA-10 / RN-09 Dado um driver, quando renderiza as ações, então links com `?familia`                                                              | `FamiliaDriversTable.test.tsx`                                                               | "Visualizar" → `/drivers/3?familia=LEVOXIN`; "Editar" → `/drivers/3/editar?familia=LEVOXIN`                                                                                                                                                                                                             |
| RN-10 Dado franquia desconhecida, quando renderiza a pill, então tom default                                                                     | `FranquiaPill.test.tsx`, `franquiaTone.test.ts`                                              | `text-apsen-franq-default`                                                                                                                                                                                                                                                                              |
| UI kit Dado `Table variant="card"`, `IconLink variant="outlined"` e `SearchInput grow`, quando renderiza, então classes novas sem mudar o padrão | `src/presentation/components/ui/__tests__/{Table,IconButton,SearchInput}.test.tsx`           | `px-[16px] py-[11px] uppercase` só no `card`; `text-center` com `align`; `rounded-[6px] border` no outlined; `ghost` igual ao atual; `grow` sem `max-w-[360px]`                                                                                                                                         |
| Rotas Dado as páginas, quando renderiza com `params`/`searchParams` Promise, então normaliza e passa à tela                                      | `src/app/__tests__/catalogoRoutes.test.tsx`                                                  | títulos "Catálogo de Produtos" e "Drivers da Família"; `size=7` → 10; `familia` "MOTILEX HA + MSM" chega íntegra                                                                                                                                                                                        |
