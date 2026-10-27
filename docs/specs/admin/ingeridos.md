---
status: IN_PROGRESS
fase: 35
area: admin
feature: ingeridos
azure-devops-work-item:
---

# Drivers Ingeridos

## 1. Overview

Porta a tela `ingeridos` (`docs/Negócio/di-drivers-v2_84.html` L1891–1976, tabela estática) para `/admin/ingeridos`, com a coleção `ingeridos` da API local. O planejador consulta os drivers validados no Data Lake, busca e filtra por categoria (que no protótipo não funcionam — ARQUITETURA #13), vê o detalhe de um driver e remove um driver da ingestão. RN-TIP-06: "Os Drivers Ingeridos representam os drivers efetivamente considerados pelo modelo… com rastreabilidade da origem".

Onda 3, fase provisória 35. Inventário §2.11.

**Dependências:** as da spec [ciclos](ciclos.md) §1; `ConfirmDialog` ([fontes](fontes.md)); `CodeTag` ([tipos](tipos.md)); da onda 1 `Toolbar`, `IconButton`/`IconLink` `tone`; da onda 2 `DriverTypeBadge` com a variante de categoria `db-*` (ARQUITETURA #8) — aqui recebe a variante a partir do campo `badge` (`"db-supply"` → `supply`). **Esta spec cria** `DetailField` no UI kit (também usado pela spec [agentes](../agentes/agentes.md)).

**Decisões [derivado]:**

- "👁 Ver" (sem ação no protótipo) abre um modal de detalhe só leitura com os campos do registro, no padrão visual do `modal-agente-ver` (L4419–4442).
- "🗑" pede confirmação (`Remover o driver {id} da ingestão?`) e apaga via API (ARQUITETURA #13, §7.3).
- Busca no servidor com `q=` (todos os campos de texto; o placeholder fala em "produto, tipo, origem").

**Perguntas em aberto:**

- PO: o filtro de categoria tem só Regulatório, Concorrência, Supply e Mídia (fiel); os dados têm também Sazonalidade e Comercial, que só aparecem em "Todas as categorias".
- PO: a matriz de permissões diz que só Admin pode "Remover da ingestão" (linha 9); a tela é nível 3 e o botão segue o protótipo (ARQUITETURA #11).
- PO: "Exportar para ML Engine" só mostra o toast (sem integração). IDs `DRV-2026-028` e `DRF-2026-027` não batem com `aprovacoes` (INVENTARIO §6 #3) — dados mantidos.
- PO: RN-GOV-02 (auditoria da remoção) não existe no protótipo.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/admin/ingeridos` mostra o header "Drivers Ingeridos" / "Data Lake · status Validado · alimentam o ApsenPLPEngine" com "Exportar para ML Engine" (ghost sm → toast "📊 Exportando para ML Engine..."), o `ScreenDesc` 💾 (L1903–1906), a toolbar (busca "Buscar produto, tipo, origem..." + select "Todas as categorias", Regulatório, Concorrência, Supply, Mídia), o resumo "**{n} drivers** ingeridos no Data Lake" e a tabela. |
| CA-02 | Busca (debounce 300 ms) e categoria filtram no servidor, ficam na URL (`q`, `categoria`, `page`) e voltam para a página 1; o resumo usa o total filtrado ("1 driver" no singular).                                                                                                                                                                                                                                                  |
| CA-03 | Tabela paginada no servidor (10 por página), colunas ID · Produto · Tipo · Período · Feature · Área · Validado por · Ações: ID mono 12px na cor de `idCor` (DRV azul, DRF teal), Produto (nome 500 + SKU 11px muted), Tipo (`DriverTypeBadge` da variante de `badge`), Período 12px, Feature (`CodeTag` na cor de `featureCor`), Área e Validado por 12px.                                                                          |
| CA-04 | "👁 Ver" abre o modal "Driver {id}" com Produto, SKU, Tipo, Período, Feature, Categoria, Área e Validado por, e o botão "Fechar".                                                                                                                                                                                                                                                                                                    |
| CA-05 | "🗑" abre `Remover o driver {id} da ingestão?`; confirmar remove a linha na hora, faz `DELETE /ingeridos/{id}` e mostra "⚠️ Driver removido."; falha restaura a linha e mostra o toast de falha.                                                                                                                                                                                                                                     |
| CA-06 | Estados: skeleton (`loading.tsx`), dados anteriores mantidos ao filtrar, erro com "Tentar novamente", vazio ("Nenhum driver ingerido encontrado." na tabela, resumo "0 drivers").                                                                                                                                                                                                                                                   |

## 3. UX / Fluxo de tela

- Rota `src/app/admin/ingeridos/page.tsx` (`metadata.title = 'Drivers Ingeridos'` → `<IngeridosScreen />`), `loading.tsx`, `error.tsx`.
- Referências: `DESIGN_SPEC.md` §3.14 (busca/select), §3.17 `Table`, §3.16 `Modal`; `Toolbar` da onda 1; `DriverTypeBadge` da onda 2.

| Bloco     | Componente                                                                                                                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header    | `PageHeader` + `Button ghost sm` "Exportar para ML Engine"                                                                                                                                                           |
| Descrição | `ScreenDesc icon="💾"`                                                                                                                                                                                               |
| Toolbar   | `Toolbar`: `SearchInput aria-label="Buscar drivers ingeridos"` + `FormSelect className="w-auto text-[13px]" aria-label="Categoria"` (`""` = "Todas as categorias")                                                   |
| Resumo    | `<p className="mb-[12px] text-[13px] text-apsen-muted"><strong>{n} drivers</strong> ingeridos no Data Lake</p>`                                                                                                      |
| Tabela    | `Table caption="Drivers ingeridos no Data Lake"`; ações `IconButton` olho (`aria-label="Ver {id}"`) e `IconButton tone="red"` lixeira (`aria-label="Remover {id}"`); `footer` `Pagination` só com mais de uma página |

Modal `IngeridoDetailModal` (`next/dynamic`, `Modal size="md"`, título "Driver {id}"): grade `grid grid-cols-2 gap-[14px]` de `DetailField` — Produto, SKU, Tipo (`DriverTypeBadge`), Período, Feature (`CodeTag`), Categoria, Área, Validado por; rodapé `Button ghost sm` "Fechar".

**UI kit novo** `DetailField` (`src/presentation/components/ui/DetailField.tsx`): `{ label: string; children: ReactNode; full?: boolean }` → `<div className={full ? 'col-span-full' : ''}><div className="mb-[3px] text-[10.5px] font-bold uppercase tracking-[.05em] text-apsen-muted">{label}</div><div className="text-[13px]">{children}</div></div>` (estilo de L4421–4441).

Textos: "📊 Exportando para ML Engine..." · `Remover o driver {id} da ingestão?` / "Remover" · "⚠️ Driver removido." · falha "⚠️ Não foi possível salvar as alterações. Tente novamente.".

## 4. Contratos de API consumidos

| Uso     | Requisição                                                           |
| ------- | -------------------------------------------------------------------- |
| lista   | `GET /ingeridos?_page={p}&_limit=10[&q=][&categoria=]` via `getPage` |
| remover | `DELETE /ingeridos/{id}` → `200` (`404` → `NotFoundError`)           |

Item do `db.json`:

```json
{
  "id": "DRV-2026-029",
  "produto": "Baricitinibe 2mg",
  "sku": "SKU-00312",
  "tipo": "⚗️ Falta MP",
  "badge": "db-supply",
  "periodo": "01/06 → 05/07/2026",
  "feature": "dummy_censored",
  "featureCor": "var(--red)",
  "area": "Supply & PCP",
  "validadoPor": "Ana P.",
  "categoria": "Supply",
  "idCor": "var(--blue)"
}
```

Schema Zod (`src/infrastructure/ingeridos/ingeridoSchema.ts`):

```ts
const cssVar = z.string().regex(/^var\(--[a-z-]+\)$/);
export const ingeridoDtoSchema = z.object({
  id: z.string().min(1),
  produto: z.string(),
  sku: z.string(),
  tipo: z.string(),
  badge: z.string().regex(/^db-[a-z]+$/),
  periodo: z.string(),
  feature: z.string(),
  featureCor: cssVar,
  area: z.string(),
  validadoPor: z.string(),
  categoria: z.string(),
  idCor: cssVar,
});
```

Erros: inválido → `InvalidResponseError`; 404 → `NotFoundError('Driver ingerido', id)`; 5xx/rede/timeout → `ErrorState` (leitura) ou rollback + toast (remoção).

## 5. Domínio (`src/domain`)

`src/domain/ingeridos/`:

- `Ingerido.ts` — `interface Ingerido { id; produto; sku; tipo; badge: DbBadge; periodo; feature; featureTone: Tone; area; validadoPor; categoria; idTone: Tone }`; `type DbBadge = 'tv'|'digital'|'pdv'|'campo'|'medico'|'preco'|'conc'|'sazo'|'supply'|'canal'|'reg'|'viral'|'macro'|'outro'`.
- `ingeridoRules.ts` — `cssVarTone('var(--blue)')` → `'blue'` (fallback `'muted'`); `badgeVariant('db-supply')` → `'supply'` (fallback `'outro'`); `resumoIngeridos(n)` → "{n} drivers" / "1 driver"; `INGERIDOS_CATEGORIAS = ['Regulatório','Concorrência','Supply','Mídia']` (espelha `config.opcoes.ingeridosCategorias` sem o item "Todas").
- `IngeridoRepository.ts` — `listPage({ q, categoria }, { page, size })`, `delete(id)`.

## 6. Aplicação (`src/application`)

`src/application/ingeridos/`: `ListIngeridos(repo)` → `{ rows: IngeridoRowDto[]; total; totalPages; resumo }`; `DeleteIngerido(repo)` → `{ toast: '⚠️ Driver removido.' }`.

## 7. Infraestrutura (`src/infrastructure`)

`src/infrastructure/ingeridos/{ingeridoSchema,ingeridoMapper,HttpIngeridoRepository}.ts` — requisições do §4 (vazios omitidos), mapper aplica `cssVarTone`/`badgeVariant`.

## 8. Apresentação (`src/presentation`)

- `queryKeys.ingeridos = { all: ['ingeridos'], page: (f, p) => ['ingeridos','page',f,p] }`.
- Hooks: `useIngeridosPage` (`keepPreviousData`, 30 s), `useDeleteIngeridoMutation` (otimista com rollback, invalida `ingeridos.all`).
- URL: `useListSearchParams` com `q` (debounce 300 ms), `categoria`, `page`.
- Feature `src/presentation/features/ingeridos/`: `IngeridosScreen.tsx`, `components/{IngeridosToolbar,IngeridosTable,IngeridoDetailModal}.tsx`.
- `UseCases.ingeridos = { list; remove }`; `createContainer` registra `HttpIngeridoRepository`.

## 9. Arquivos

### Novos

- `src/domain/ingeridos/{Ingerido,ingeridoRules,IngeridoRepository}.ts` e `__tests__/ingeridoRules.test.ts`
- `src/application/ingeridos/{ListIngeridos,DeleteIngerido,dto}.ts` e `__tests__/{ListIngeridos,DeleteIngerido}.test.ts`
- `src/infrastructure/ingeridos/{ingeridoSchema,ingeridoMapper,HttpIngeridoRepository}.ts` e `__tests__/HttpIngeridoRepository.test.ts`
- `src/presentation/hooks/useIngeridos.ts` e `__tests__/useIngeridos.test.tsx`
- `src/presentation/features/ingeridos/IngeridosScreen.tsx`, `components/*.tsx`, `__tests__/{IngeridosScreen,IngeridoDetailModal}.test.tsx`
- `src/presentation/components/ui/DetailField.tsx` e `__tests__/DetailField.test.tsx`
- `src/app/admin/ingeridos/{page,loading,error}.tsx` e `__tests__/page.test.tsx`

### Modificados

- `queryKeys.ts`, `UseCasesContext.tsx`, `container.ts` (+ teste), `test/renderWithProviders.tsx` — módulo `ingeridos`.
- `src/presentation/components/ui/index.ts` (+ `index.test.ts`) — `DetailField`; `docs/design/DESIGN_SPEC.md` §3.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Busca `q` e `categoria` (igualdade) no servidor; vazios omitidos; mudança volta para a página 1 (ARQUITETURA #13).                                                                                |
| RN-02 | Cores do ID e da feature vêm de `idCor`/`featureCor` do registro (fiel ao HTML estático, que difere de `FEATURE_COLORS` em `continua_grp`); badge do tipo pela variante `badge` (ARQUITETURA #8). |
| RN-03 | Remover pede confirmação, apaga o registro e mostra "⚠️ Driver removido."; a lista e o resumo refletem na hora (otimista).                                                                        |
| RN-04 | "Exportar para ML Engine" não grava nem chama API; só o toast (fiel).                                                                                                                             |
| RN-05 | Ações seguem o protótipo com a guarda da tela (nível 3) — ARQUITETURA #11.                                                                                                                        |

## 11. BDD — Cenários de teste unitário

| Cenário                                                                                                     | Arquivo de teste                                                         | Asserção                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| RN-02 Dado `var(--teal)` e `db-sazo`, quando converte, então tom e variante; desconhecidos caem no fallback | `src/domain/ingeridos/__tests__/ingeridoRules.test.ts`                   | `'teal'`, `'sazo'`, `'muted'`, `'outro'`; `resumoIngeridos(1)` = "1 driver"                                                           |
| RN-01 CA-02 Dado filtros, quando ListIngeridos executa, então repassa e monta o resumo                      | `src/application/ingeridos/__tests__/ListIngeridos.test.ts`              | repositório recebe `{q:'bari', categoria:'Supply'}`; `resumo` "1 driver"                                                              |
| RN-03 Dado um id, quando DeleteIngerido executa, então apaga e devolve o toast                              | `DeleteIngerido.test.ts`                                                 | `delete('DRV-2026-029')`; "⚠️ Driver removido."                                                                                       |
| §4 Dado a API, quando o repositório consulta e apaga, então query e schema                                  | `src/infrastructure/ingeridos/__tests__/HttpIngeridoRepository.test.ts`  | `_page/_limit/q/categoria`; `badge: "x"` → `InvalidResponseError`; DELETE 404 → `NotFoundError`                                       |
| CA-01 CA-03 Dado a massa, quando renderiza, então header, toolbar, resumo e 4 linhas                        | `src/presentation/features/ingeridos/__tests__/IngeridosScreen.test.tsx` | "4 drivers"; DRF-2026-027 `text-apsen-teal`; `CodeTag` `dummy_censored` vermelho; select com as 5 opções                              |
| RN-04 Dado "Exportar para ML Engine", quando clica, então só toast                                          | `IngeridosScreen.test.tsx`                                               | toast "📊 Exportando para ML Engine..."; nenhum caso de uso chamado                                                                   |
| CA-02 Dado busca e categoria, quando muda, então URL e página 1 após 300 ms                                 | `IngeridosScreen.test.tsx`                                               | fake timers; `routerMock.replace` com `q`/`categoria` sem `page`                                                                      |
| CA-04 Dado "Ver DRV-2026-029", quando clica, então modal com os campos                                      | `IngeridoDetailModal.test.tsx`                                           | `dialog` "Driver DRV-2026-029"; "SKU-00312", "Supply & PCP", "Ana P."; "Fechar" fecha                                                 |
| CA-05 RN-03 Dado "Remover", quando confirma e a API falha, então some e volta                               | `IngeridosScreen.test.tsx`                                               | `dialog` `Remover o driver DRV-2026-029 da ingestão?`; linha some; rejeição → volta + toast de falha; sucesso → "⚠️ Driver removido." |
| CA-06 Dado carregando/erro/vazio, quando renderiza, então estados                                           | `IngeridosScreen.test.tsx`                                               | "Carregando…"; "Tentar novamente"; "Nenhum driver ingerido encontrado." + "0 drivers"                                                 |
| §3 Dado DetailField, quando renderiza, então rótulo uppercase e `full`                                      | `src/presentation/components/ui/__tests__/DetailField.test.tsx`          | `text-[10.5px] uppercase`; `col-span-full`                                                                                            |
| §3 Dado a rota, quando renderiza, então metadata                                                            | `src/app/admin/ingeridos/__tests__/page.test.tsx`                        | "Drivers Ingeridos"                                                                                                                   |

## 12. Requisitos não funcionais

| Item | Como atende                                                                                                      |
| ---- | ---------------------------------------------------------------------------------------------------------------- |
| §7.1 | Paginação, busca (debounce 300 ms) e filtro no servidor; estado na URL; página 1 ao filtrar; `keepPreviousData`. |
| §7.2 | Rota própria, `loading.tsx`, `error.tsx`, modal de detalhe via `next/dynamic`, guarda antes das queries.         |
| §7.3 | `staleTime` 30 s; remoção otimista com rollback e confirmação; invalida só `ingeridos.all`.                      |
| §7.5 | `Table` com `caption`; botões de linha com nome incluindo o id; toolbar quebra linha e tabela rola em 360 px.    |
| §7.6 | "Validado por" é abreviado como nos dados (sem e-mail); nada em `console`.                                       |
