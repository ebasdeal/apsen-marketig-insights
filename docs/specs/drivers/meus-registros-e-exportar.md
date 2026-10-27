---
status: READY
fase: 21
area: drivers
feature: meus-registros-e-exportar
azure-devops-work-item:
---

# Meus Registros e Exportar JSON

## 1. Overview

Porta as telas `lista` (Meus Registros, L1537–1560, JS `drvRenderLista`/`drvDel` L6201–6248) e `export` (Exportar JSON, L1563–1591, JS `drvRenderJSON`/`drvCopiar`/`drvBaixar` L6251–6272) do protótipo `docs/Negócio/di-drivers-v2_84.html`. A lista mostra os drivers gravados em `/drivers` (paginada no servidor) e permite remover; a exportação monta o payload `drivers-demanda-farma-v2.1` para o Data Lake, com copiar e baixar.

Depende da [registrar-driver](registrar-driver.md) (fase 20): entidade `Driver`, `DriverRepository`, `DriverLookupRepository`, mapper e schemas. Esta spec acrescenta `list`, `listAll` e `remove` ao repositório, o `DriverTypeBadge` com os tokens `db-*` (usado também pelo catálogo, fase 22) e a leitura de `exportSchema`/`instrucoes_modelagem` do `/config`.

Decisões desta spec:

- **Paginação no servidor** (ARQUITETURA §7.1): `GET /drivers?_page&_limit`, total por `X-Total-Count`; página e tamanho em `?page=&size=`. A ordem é a da API (inserção), como no protótipo.
- **Remover pede confirmação em `Modal`** (§7.3) com o texto do `confirm` do protótipo, "Remover este registro?", e atualização otimista com rollback. O protótipo não mostra toast ao remover; só a falha tem toast [derivado].
- **Cor do badge pela categoria do tipo** (decisão 8), usando o mapa `CAT_BADGE` do protótipo (L6208) com `midia → db-tv` (a classe `db-midia` não existe).
- **Exportar lê a coleção inteira** (`GET /drivers` sem paginação): o JSON é o conjunto completo por definição. Rota de nível 3 (RN-TIP-07: exportação respeita o perfil).

Perguntas em aberto ao PO (não bloqueiam):

1. A lista do protótipo diz "Drivers cadastrados nesta sessão", mas mostra todos os drivers da base (inclusive os 4 do `db.json`). Mantido o texto; filtrar por autor depende do SSO (PBI 39032).
2. Sem checagem extra de perfil no botão Remover (decisão 11).
3. `exportado_em` é o instante da geração (como no protótipo); confirmar se deve ser o do ciclo ativo.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CA-01 | `/drivers` mostra "Meus Registros" / "Drivers cadastrados nesta sessão", a ação "+ Novo Driver" (→ `/drivers/novo`) e o `ScreenDesc` 📋; estados carregando (skeleton), erro com "Tentar novamente" e vazio 📋 "Nenhum registro ainda" / "Vá para **Registrar Driver** e adicione o primeiro driver.".                                                                                                       |
| CA-02 | Cada driver vira um `DriverListItem`: badge do tipo (rótulo curto e cor da categoria), título "{produto} — {titulo}", linha "📅 {inicio} → {fim}" + "⚡ ★★★★☆" + "💰 R$ {verba}", "🏪 {canais}", até 4 parâmetros "_{chave}_: {valor}" e "💬 {observações}", e o botão "Remover".                                                                                                                            |
| CA-03 | A lista é paginada no servidor (10 por página); página e tamanho ficam na URL; com mais de 50 registros aparece o seletor 10/25/50; trocar de página mantém os itens anteriores até chegar a nova página.                                                                                                                                                                                                    |
| CA-04 | "Remover" abre o modal "Remover este registro?"; confirmar tira o item na hora (otimista), chama `DELETE /drivers/{id}` e atualiza o badge "Meus Registros"; falha devolve o item e mostra toast de erro; cancelar não remove.                                                                                                                                                                               |
| CA-05 | `/drivers/exportar` mostra "Exportar JSON" / "Payload para ingestão no Data Lake · ApsenPLPEngine", `ScreenDesc` 📦, o card "JSON para Análise Causal" com o alerta "**Apsen PLP Agent:** …", os botões "📋 Copiar JSON" e "💾 Baixar .json" e o bloco de código com o JSON indentado (2 espaços) `{schema, exportado_em, total_registros, instrucoes_modelagem, drivers}`; sem drivers, "Nenhum registro.". |
| CA-06 | "Copiar JSON" regera o JSON, copia para a área de transferência e troca o rótulo para "✅ Copiado!" por 1,6 s; "Baixar .json" baixa `drivers_demanda_v2_{AAAA-MM-DD}.json` com o mesmo conteúdo.                                                                                                                                                                                                             |
| CA-07 | O badge do tipo usa as cores `db-*` do protótipo por categoria, nos temas claro e escuro, só com tokens.                                                                                                                                                                                                                                                                                                     |

## 3. UX / Fluxo de tela

Referências: `DESIGN_SPEC.md` §3.1 (`Button`), §3.5 (`Card`), §3.7, §3.8, §3.12 (estados), §3.14 (`Pagination`), §3.16 (`Modal`), §3.19 (`Alert`) e `CodeBlock` (onda 1). Esta spec cria as seções §4.x "Meus Registros" e "Exportar JSON" e o `DriverTypeBadge` no `DESIGN_SPEC.md`.

### 3.1 Rotas

| Rota                        | Arquivo                             | `metadata.title` | Nível        |
| --------------------------- | ----------------------------------- | ---------------- | ------------ |
| `/drivers` (`?page=&size=`) | `src/app/drivers/page.tsx`          | "Meus Registros" | 2 (`lista`)  |
| `/drivers/exportar`         | `src/app/drivers/exportar/page.tsx` | "Exportar JSON"  | 3 (`export`) |

Páginas finas (`searchParams: Promise<…>` passado como props `page`/`size` já normalizados por `parsePageParams`: inteiro ≥ 1, `size` ∈ {10, 25, 50}, senão padrão). `loading.tsx`/`error.tsx` do segmento `src/app/drivers/` (fase 20) e `src/app/drivers/exportar/loading.tsx` próprio (skeleton do card).

### 3.2 Meus Registros (L1537–1560)

- `PageHeader title="Meus Registros" description="Drivers cadastrados nesta sessão" actions={<ButtonLink variant="outline" size="sm" href="/drivers/novo">+ Novo Driver</ButtonLink>}`.
- `ScreenDesc icon="📋"`: "**Lista de todos os drivers registrados nesta sessão.** Revise os dados antes de exportar. Cada item vai para o pipeline de ingestão do Data Lake, onde o _FeatureEngineer_ do ApsenPLPEngine transformará o driver em variável exógena para o modelo."
- Lista `ul` (`aria-label="Drivers registrados"`) de `DriverListItem` (`li`).
- Rodapé: `Pagination` (`info` "Mostrando a–b de n") quando `total > size`; seletor de tamanho (`FormSelect aria-label="Itens por página"`, 10/25/50) só com `total > 50`.
- Vazio (total 0): `EmptyState icon="📋" title="Nenhum registro ainda" description={<>Vá para <strong>Registrar Driver</strong> e adicione o primeiro driver.</>}` (`description` aceita `ReactNode`). Página além da última (ex. `?page=9`): volta para a última página existente.
- Carregando: `DriversListSkeleton` (3 blocos com a altura do `drv-item`, `role="status"` "Carregando registros…"). Erro: `ErrorState` + "Tentar novamente".

`DriverListItem` (`.drv-item` L341–348, markup L6222–6244):

| Parte     | Classes / conteúdo                                                                                                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| contêiner | `mb-[8px] flex items-start justify-between gap-[10px] rounded-[8px] border border-apsen-border bg-apsen-white px-[15px] py-[13px] transition-[border] duration-[130ms] hover:border-apsen-blue-light` |
| badge     | `DriverTypeBadge` com `mb-[5px] inline-block`                                                                                                                                                         |
| título    | `mb-[3px] text-[13.5px] font-semibold text-apsen-slate`: `{produto                                                                                                                                    |     | '—'}` + (`titulo`?` — {titulo}` : '') |
| info      | `text-[12px] leading-[1.7] text-apsen-muted`, montada por `linhasDoDriver` (RN-03) com `&nbsp;·&nbsp;` entre itens da 1ª linha e `<br/>` entre linhas; chaves de parâmetro em `<em>`                  |
| ação      | `Button variant="danger" size="sm"` com `TrashIcon` 12px, `shrink-0 mt-[4px]`, texto "Remover", `aria-label="Remover {produto} — {titulo}"`                                                           |

Modal de remoção (`next/dynamic`): `Modal size="md" title="Remover registro"`, corpo "Remover este registro?", rodapé `Button ghost sm` "Cancelar" e `Button danger sm` "Remover" (desabilitado com "Removendo…" durante a chamada).

### 3.3 `DriverTypeBadge` (`.drv-badge` + `db-*`, L345–346, L410–423)

`inline-block rounded-[4px] border px-[8px] py-[2px] text-[10.5px] font-bold` + classes do tom. Texto = `config.LABEL[tipo] ?? tipo`.

| Tom      | Categorias         | Fundo / borda / texto                                                 |
| -------- | ------------------ | --------------------------------------------------------------------- |
| `tv`     | midia              | `bg-apsen-db-tv-bg border-apsen-db-tv-b text-apsen-db-tv-fg`          |
| `pdv`    | comercial          | `bg-apsen-db-pdv-bg border-apsen-db-pdv-b text-apsen-warning-fg`      |
| `supply` | produto, supply    | `bg-apsen-orange-bg border-apsen-orange-b text-apsen-orange`          |
| `canal`  | logistica          | `bg-apsen-purple-bg border-apsen-purple-b text-apsen-purple`          |
| `conc`   | concorrencia       | `bg-apsen-db-conc-bg border-apsen-db-conc-b text-apsen-db-conc-fg`    |
| `reg`    | regulatorio        | `bg-apsen-teal-bg border-apsen-teal-light text-apsen-teal`            |
| `sazo`   | sazo               | `bg-apsen-db-sazo-bg border-apsen-db-sazo-b text-apsen-db-sazo-fg`    |
| `viral`  | social             | `bg-apsen-db-viral-bg border-apsen-db-viral-b text-apsen-db-viral-fg` |
| `macro`  | macro              | `bg-apsen-purple-bg border-apsen-purple-b text-apsen-purple`          |
| `outro`  | tipo sem categoria | `bg-apsen-bg border-apsen-border text-apsen-muted`                    |

Tokens novos (claro = protótipo; escuro [derivado]):

| Token                                      | Claro                             | Escuro                            |
| ------------------------------------------ | --------------------------------- | --------------------------------- |
| `--color-apsen-db-tv-bg` / `-b` / `-fg`    | `#eef2ff` / `#a5b4fc` / `#4338ca` | `#1e2048` / `#3f468f` / `#a5b4fc` |
| `--color-apsen-db-pdv-bg` / `-b`           | `#fffbeb` / `#fcd34d`             | `#3a3115` / `#8a7420`             |
| `--color-apsen-db-conc-bg` / `-b` / `-fg`  | `#ecfeff` / `#67e8f9` / `#0e7490` | `#0b2d33` / `#1f6f7d` / `#67e8f9` |
| `--color-apsen-db-sazo-bg` / `-b` / `-fg`  | `#f0fdf4` / `#6ee7b7` / `#065f46` | `#0f2e24` / `#2a7a5f` / `#6ee7b7` |
| `--color-apsen-db-viral-bg` / `-b` / `-fg` | `#fdf2f8` / `#f0abfc` / `#86198f` | `#35142f` / `#8a3a86` / `#f0abfc` |

### 3.4 Exportar JSON (L1563–1591)

- `PageHeader title="Exportar JSON" description="Payload para ingestão no Data Lake · ApsenPLPEngine"`.
- `ScreenDesc icon="📦"`: "**JSON estruturado para consumo pelo pipeline de Demand Intelligence.** Cada driver inclui metadados de modelagem: tipo de feature engineering recomendado, instrução sobre demanda censurada e nota metodológica para o analista. _Correlação ≠ causa_ — valide sempre com backtesting e contrafactual."
- `Card` + `CardTitle` "JSON para Análise Causal":
  - `Alert tone="info" title="Apsen PLP Agent:" className="mb-[12px]"`: "recall e ruptura logística = demanda censurada, não queda real. TV/digital → indicador ou variável numérica (GRP). Viral/off-label → indicador agudo + decaimento exponencial. Concorrente descontinuado → indicador permanente de ganho de share."
  - `div.mb-[12px] flex gap-[8px]`: `Button variant="outline" size="sm"` "📋 Copiar JSON" (rótulo "✅ Copiado!" por 1600 ms, `aria-live="polite"`) e `Button variant="ghost" size="sm"` "💾 Baixar .json".
  - `CodeBlock maxHeight={360}` (fundo `slate`, mono 11.5px `text-apsen-tip-em`, `white-space: pre`, L351–353) com o texto de RN-05 ou "Nenhum registro.".
- Carregando: skeleton do card (`role="status"` "Gerando JSON…"). Erro: `ErrorState` + "Tentar novamente".
- Falha ao copiar (clipboard indisponível) [derivado]: toast "⚠️ Não foi possível copiar o JSON.".

### 3.5 Textos (pt-BR, exatos)

| Situação                    | Texto                                           |
| --------------------------- | ----------------------------------------------- |
| confirmação de remoção      | Remover este registro?                          |
| falha ao remover [derivado] | ⚠️ Não foi possível remover o registro. (toast) |
| copiado                     | ✅ Copiado!                                     |
| export vazio                | Nenhum registro.                                |

## 4. Contratos de API consumidos

`GET {API}/drivers?_page={page}&_limit={size}` — via `HttpClient.getPage`; resposta = array de drivers (schema `driverDtoSchema` da fase 20) e header `X-Total-Count: 4`. Header ausente ou não numérico → `InvalidResponseError`.

```json
[
  {
    "id": 1,
    "modo": "sku",
    "produto": "Baricitinibe 2mg (SKU-00312)",
    "molecula": "Baricitinibe",
    "codigo": "SKU-00312",
    "skus_afetados_ia": [],
    "titulo": "Campanha Instagram Jul/2026",
    "periodo": { "inicio": "2026-07-01", "fim": "2026-07-31" },
    "tipo": "digital",
    "cobertura": { "regioes": ["nacional"], "canais": ["farmacias"] },
    "intensidade_esperada": 4,
    "uplift_pct": 20,
    "verba_rs": 250000,
    "observacoes": "Teste de registro",
    "parametros": { "plataforma": "Instagram", "formato": "Reels", "impressoes": "2400000" }
  }
]
```

`DELETE {API}/drivers/{encodeURIComponent(id)}` — 200 `{}`; 404 → `NotFoundError` (tratado como já removido: sucesso silencioso, a lista é recarregada).

`GET {API}/drivers` — coleção inteira para o export (mesmo schema, array).

`GET {API}/config` — além dos campos da fase 20, `exportSchema: z.string().min(1)` (`"drivers-demanda-farma-v2.1"`) e `instrucoes_modelagem: z.array(z.string()).min(1)` (7 frases). `GET /categorias` (fase 20) para a categoria do tipo.

Erros: 5xx/`NetworkError` → estado de erro (lista/export) ou toast (remover).

## 5. Domínio (`src/domain`)

- `drivers/Page.ts` (se a onda 0 não tiver um tipo compartilhado em `domain/shared`): `PageRequest { page: number; size: number }`, `Page<T> { items: T[]; total: number }`.
- `DriverRepository` ganha `list(req: PageRequest): Promise<Page<Driver>>`, `listAll(): Promise<Driver[]>`, `remove(id: string): Promise<void>`.
- `DriverLookupRepository.getFormConfig` passa a devolver também `exportSchema` e `instrucoesModelagem` (`DriverConfig`).
- `drivers/badgeTone.ts`: `type DriverBadgeTone = 'tv'|'pdv'|'supply'|'canal'|'conc'|'reg'|'sazo'|'viral'|'macro'|'outro'`; `tomPorCategoria(slug)`; `categoriaDoTipo(tipo, categorias)`.
- `drivers/resumoDriver.ts`: `estrelas(n)` (`'★'.repeat(n) + '☆'.repeat(5 − n)`), `periodoTexto(periodo)`, `parametrosResumo(parametros)` (até 4, `_` → espaço), `tituloDoDriver(driver)`.
- `drivers/exportPayload.ts`: `montarExport(drivers, meta, exportadoEm: Date)` e `nomeArquivoExport(data: Date)`.

## 6. Aplicação (`src/application`)

| Caso de uso        | Construtor                                                        | `execute`          | Saída                                                   |
| ------------------ | ----------------------------------------------------------------- | ------------------ | ------------------------------------------------------- |
| `ListDrivers`      | `DriverRepository`, `DriverLookupRepository`                      | `({ page, size })` | `{ items: DriverListItemDto[]; total; page; size }`     |
| `DeleteDriver`     | `DriverRepository`                                                | `(id)`             | `void` (404 engolido)                                   |
| `GetDriversExport` | `DriverRepository`, `DriverLookupRepository`, `clock: () => Date` | `()`               | `{ texto: string; nomeArquivo: string; total: number }` |

```ts
interface DriverListItemDto {
  id: string;
  badge: { label: string; tone: DriverBadgeTone };
  titulo: string;
  periodo: string;
  estrelas: string | null;
  verba: number | null;
  canais: string[];
  parametros: { chave: string; valor: string }[];
  observacoes: string;
}
```

`ListDrivers` busca a página e, em paralelo, categorias e config (o cache de 5 min fica na apresentação; o caso de uso só compõe). `GetDriversExport.texto` = `JSON.stringify(montarExport(...), null, 2)` ou "Nenhum registro." sem drivers.

## 7. Infraestrutura (`src/infrastructure`)

- `HttpDriverRepository`: `list` com `getPage('/drivers', { query: { _page, _limit } })` → `{ data, total }` validados; `listAll` com `get('/drivers')`; `remove` com `delete`.
- `driverConfigSchema` ganha `exportSchema` e `instrucoes_modelagem`.
- `toDriverDto` (fase 20) garante a ordem de chaves do export: `id, modo, produto, molecula, codigo, skus_afetados_ia, titulo, periodo{inicio,fim}, tipo, cobertura{regioes,canais}, intensidade_esperada, uplift_pct, verba_rs, observacoes, parametros`. O domínio expõe `driverParaExport(driver)` com essa mesma forma (snake_case) para não depender da infraestrutura.

## 8. Apresentação (`src/presentation`)

- `UseCases.drivers` ganha `list`, `remove`, `export`; `createContainer` registra (clock `() => new Date()`); `createFakeUseCases` com stubs.
- `queryKeys.drivers.list = (page, size) => ['drivers','list',page,size]`, `queryKeys.drivers.export = ['drivers','export']`, `queryKeys.drivers.total = ['drivers','total']`.
- Hooks: `useDrivers({ page, size })` (`staleTime` 30 s, `placeholderData: keepPreviousData`, prefetch da próxima página quando existe); `useDeleteDriverMutation` (otimista: `onMutate` cancela e remove o item de todas as páginas em cache, `onError` restaura + toast, `onSettled` invalida `['drivers']` e `['catalogo']`); `useDriversExport` (`staleTime` 30 s); `useDriversTotal` (`list({page:1,size:1}).total`) para o badge "Meus Registros" da sidebar (integra no ponto de badges da onda 0).
- `usePageParams()` (`src/presentation/navigation/usePageParams.ts`, se a onda 0 não tiver): lê/escreve `page`/`size` em `useSearchParams` com `router.replace` (sem rolar), mudar `size` volta à página 1.
- Componentes em `src/presentation/features/drivers/list/`: `DriversListScreen`, `DriverListItem`, `RemoveDriverModal`, `DriversListSkeleton`; em `src/presentation/features/drivers/export/`: `DriversExportScreen`, `CopyJsonButton`, `downloadText.ts` (`Blob` `application/json`, `URL.createObjectURL`, `<a download>` e `revokeObjectURL`). `DriverTypeBadge` em `src/presentation/features/drivers/components/` (compartilhado com o catálogo).
- `src/presentation/format/formatters.ts`: `formatVerba(n)` = `new Intl.NumberFormat('pt-BR').format(n)` ("250.000").

## 9. Arquivos

### Novos

- `src/domain/drivers/{Page,badgeTone,resumoDriver,exportPayload}.ts` + `__tests__/{badgeTone,resumoDriver,exportPayload}.test.ts`
- `src/application/drivers/{ListDrivers,DeleteDriver,GetDriversExport}.ts` + `__tests__/`
- `src/presentation/features/drivers/list/{DriversListScreen,DriverListItem,RemoveDriverModal,DriversListSkeleton}.tsx` + `__tests__/`
- `src/presentation/features/drivers/export/{DriversExportScreen,CopyJsonButton}.tsx`, `downloadText.ts` + `__tests__/`
- `src/presentation/features/drivers/components/DriverTypeBadge.tsx` + `__tests__/DriverTypeBadge.test.tsx`
- `src/presentation/hooks/{useDrivers,useDeleteDriverMutation,useDriversExport,useDriversTotal}.ts` + `__tests__/`
- `src/presentation/navigation/usePageParams.ts` + teste (se ainda não existir)
- `src/app/drivers/page.tsx`, `src/app/drivers/exportar/page.tsx`, `src/app/drivers/exportar/loading.tsx` + `src/app/__tests__/driversListRoutes.test.tsx`

### Modificados

- `src/domain/drivers/{DriverRepository,DriverLookupRepository,lookups}.ts` — métodos e campos do §5.
- `src/infrastructure/drivers/{HttpDriverRepository,HttpDriverLookupRepository,schemas}.ts` (+ testes).
- `src/presentation/providers/UseCasesContext.tsx`, `src/main/container.ts`, `test/renderWithProviders.tsx`, `src/presentation/hooks/queryKeys.ts`.
- `src/presentation/components/ui/StateViews.tsx` (+ teste) — `EmptyState.description: ReactNode` (se a onda 1 não fez).
- `src/presentation/components/ui/icons.tsx` + `index.ts` — `TrashIcon` (L6238–6241).
- `src/presentation/format/formatters.ts` (+ teste) — `formatVerba`.
- `src/app/globals.css` (+ `globals.test.ts`) — tokens `db-*` do §3.3.
- `docs/design/DESIGN_SPEC.md` — §4 "Meus Registros", "Exportar JSON", `DriverTypeBadge` e tokens no §1.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Lista em ordem da API (inserção), 10 por página por padrão; `size` só 10/25/50; seletor visível só com `total > 50`; mudar `size` volta à página 1.                                                                                                                                                                                                                                                                                       |
| RN-02 | `tomPorCategoria`: midia→tv, comercial→pdv, produto→supply, supply→supply, logistica→canal, concorrencia→conc, regulatorio→reg, sazo→sazo, social→viral, macro→macro; categoria desconhecida → outro (decisão 8, `CAT_BADGE` L6208). Rótulo = `LABEL[tipo] ?? tipo`.                                                                                                                                                                      |
| RN-03 | `linhasDoDriver`: linha 1 = "📅 {inicio} → {fim}" (datas cruas, vazio vira "") + "⚡ {estrelas}" se intensidade > 0 + "💰 R$ {formatVerba(verba)}" se verba > 0; linha "🏪 {canais.join(', ')}" se houver canal (valores crus, ex. "farmacias, hospitalar"); linha de até 4 parâmetros "{chave com _ → espaço}: {valor}" separados por " · "; linha "💬 {observacoes}" se houver. Título "{produto ‖ '—'}{titulo ? ' — ' + titulo : ''}". |
| RN-04 | Remover: modal de confirmação; otimista com rollback; 404 no `DELETE` conta como sucesso; ao final invalida drivers e catálogo (contagens e badge).                                                                                                                                                                                                                                                                                       |
| RN-05 | `montarExport(drivers, {exportSchema, instrucoesModelagem}, agora)` = `{ schema: exportSchema, exportado_em: agora.toISOString(), total_registros: drivers.length, instrucoes_modelagem, drivers: drivers.map(driverParaExport) }`; sem drivers o texto é "Nenhum registro." (L6253).                                                                                                                                                     |
| RN-06 | Copiar e baixar regeram o texto com o instante atual (como `drvCopiar`/`drvBaixar` chamam `drvRenderJSON`); o bloco exibido passa a mostrar o texto regerado. Nome do arquivo `drivers_demanda_v2_${agora.toISOString().slice(0, 10)}.json`.                                                                                                                                                                                              |
| RN-07 | Exportar exige nível 3 (`SCREEN_ROLES.export`, RN-TIP-07); a guarda da onda 0 roda antes da query.                                                                                                                                                                                                                                                                                                                                        |

## 11. Requisitos não funcionais

| Item (ARQUITETURA §7) | Como se aplica                                                                                                                                                                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 paginação/URL     | lista paginada no servidor com `_page`/`_limit` e `X-Total-Count`; `page`/`size` na URL (F5 e voltar funcionam); `keepPreviousData` e prefetch da próxima página. Busca/filtros/ordenação: o protótipo não tem. Export: coleção inteira (justificado).                      |
| 7.2 rotas             | `loading.tsx`/`error.tsx` por segmento; `RemoveDriverModal` por `next/dynamic`.                                                                                                                                                                                             |
| 7.3 cache/escrita     | lista `staleTime` 30 s, lookups 5 min; remover otimista com rollback + toast; confirmação em modal; botões "Removendo…" desabilitados; invalidação só de `['drivers']`/`['catalogo']`, atualizando o badge.                                                                 |
| 7.4 formulários       | não se aplica.                                                                                                                                                                                                                                                              |
| 7.5 a11y/responsivo   | lista `ul`/`li` com nome; botão Remover com `aria-label` do item; modal com focus trap; "✅ Copiado!" anunciado (`aria-live`); `CodeBlock` com `role="region"` e `aria-label="JSON exportado"` rolável por teclado (`tabIndex=0`); item da lista quebra o texto até 360 px. |
| 7.6 segurança         | sem `console.*`; download por `Blob` local, sem enviar dados a terceiros.                                                                                                                                                                                                   |

## 12. BDD — Cenários de teste unitário

| Cenário                                                                                                               | Arquivo de teste                                                                                                                       | Asserção                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 Dado 0 drivers, quando abre a lista, então mostra o vazio do protótipo                                          | `src/presentation/features/drivers/list/__tests__/DriversListScreen.test.tsx`                                                          | "Nenhum registro ainda"; `strong` "Registrar Driver"; link "+ Novo Driver" → `/drivers/novo`                                                                                                              |
| CA-01 Dado query pendente/rejeitada, quando renderiza, então skeleton e erro com retry                                | `DriversListScreen.test.tsx`                                                                                                           | `role="status"` "Carregando registros…"; "Tentar novamente" chama `list.execute` de novo                                                                                                                  |
| CA-02 / RN-03 Dado o driver 1 do `db.json`, quando renderiza, então título e linhas exatas                            | `DriverListItem.test.tsx`, `resumoDriver.test.ts`                                                                                      | "Baricitinibe 2mg (SKU-00312) — Campanha Instagram Jul/2026"; "📅 2026-07-01 → 2026-07-31"; "⚡ ★★★★☆"; "💰 R$ 250.000"; "🏪 farmacias"; `em` "impressoes"; sem verba não mostra 💰; 5 parâmetros → 4     |
| CA-03 / RN-01 Dado total 60, quando abre `?page=2&size=10`, então pede página 2, mostra seletor e muda URL ao paginar | `DriversListScreen.test.tsx`, `usePageParams.test.tsx`, `ListDrivers.test.ts`                                                          | `list.execute({page:2,size:10})`; `combobox` "Itens por página"; clicar próxima → `routerMock.replace` com `page=3`; mudar size → `page=1`; total 4 → sem seletor nem paginação                           |
| CA-03 Dado `getPage` sem `X-Total-Count`, quando lista, então `InvalidResponseError`                                  | `src/infrastructure/drivers/__tests__/HttpDriverRepository.test.ts`                                                                    | rejeita; URL `/drivers?_page=1&_limit=10`                                                                                                                                                                 |
| CA-04 / RN-04 Dado um item, quando clica Remover e confirma, então some na hora e chama DELETE                        | `DriversListScreen.test.tsx`, `useDeleteDriverMutation.test.tsx`                                                                       | `dialog` "Remover registro" com "Remover este registro?"; item ausente antes da promise resolver; `remove.execute('1')`; cancelar mantém                                                                  |
| CA-04 Dado DELETE rejeitado, quando confirma, então item volta e toast                                                | `useDeleteDriverMutation.test.tsx`                                                                                                     | item de volta; toast "⚠️ Não foi possível remover o registro."; 404 → `DeleteDriver` resolve                                                                                                              |
| CA-05 / RN-05 Dado 2 drivers e clock fixo, quando abre export, então JSON com as chaves na ordem                      | `src/presentation/features/drivers/export/__tests__/DriversExportScreen.test.tsx`, `exportPayload.test.ts`, `GetDriversExport.test.ts` | `"schema": "drivers-demanda-farma-v2.1"`, `exportado_em` ISO do clock, `total_registros: 2`, 7 instruções, chaves `id…parametros`; alerta com `strong` "Apsen PLP Agent:"; 0 drivers → "Nenhum registro." |
| CA-06 / RN-06 Dado o export, quando clica Copiar, então `clipboard.writeText` e rótulo temporário                     | `CopyJsonButton.test.tsx`                                                                                                              | `writeText` com o texto; "✅ Copiado!" e volta a "📋 Copiar JSON" após 1600 ms (fake timers); rejeição → toast "⚠️ Não foi possível copiar o JSON."                                                       |
| CA-06 Dado o export em 2026-10-27, quando clica Baixar, então arquivo com o nome certo                                | `downloadText.test.ts`, `DriversExportScreen.test.tsx`                                                                                 | `a.download === 'drivers_demanda_v2_2026-10-27.json'`; `createObjectURL` com `Blob` `application/json`; `revokeObjectURL` chamado                                                                         |
| CA-07 / RN-02 Dado tipos de cada categoria, quando renderiza o badge, então tom e rótulo                              | `DriverTypeBadge.test.tsx`, `badgeTone.test.ts`                                                                                        | `tv` → `bg-apsen-db-tv-bg`; `digital` (midia) → tv; `pdv` → `text-apsen-warning-fg`; tipo desconhecido → `outro` e rótulo = slug                                                                          |
| CA-07 Dado `globals.css`, quando lê, então tokens `db-*` nos dois temas                                               | `src/app/__tests__/globals.test.ts`                                                                                                    | `--color-apsen-db-tv-bg: #eef2ff;` no `@theme` e `#1e2048` em `html.dark`; idem demais                                                                                                                    |
| RN-07 Dado perfil Área (nível 2), quando abre `/drivers/exportar`, então Acesso Negado sem query                      | `DriversExportScreen.test.tsx` (com a guarda da onda 0)                                                                                | `export.execute` não chamado; tela de acesso negado                                                                                                                                                       |
| Rotas Dado as páginas, quando renderiza, então `metadata` e props de página                                           | `src/app/__tests__/driversListRoutes.test.tsx`                                                                                         | títulos "Meus Registros" e "Exportar JSON"; `?page=abc` → 1; `size=7` → 10                                                                                                                                |
