---
status: REVIEW
fase: 52
area: planos
feature: plano-de-producao
azure-devops-work-item:
---

# Plano de Produção (PLP ativo, detalhe do item e inclusão)

## 1. Overview

Porta as telas `planos` (L2613–2692, JS L6542–6851) e `plano-item` (L2695–2774) e o modal `modal-plano-item` (L3378–3441) do protótipo `docs/Negócio/di-drivers-v2_84.html` para `/planos` e `/planos/[id]`, com dados reais via json-server (`/planoItens`, `/skuMeta`, `/ciclos`). O planejador lista os 247 itens do plano com busca, filtros, ordenação e paginação **no servidor**, inclui um item, edita os não aprovados e exclui com confirmação (RN-PLN-01, RN-PLN-02). Onda 5 (`docs/prototipo/ARQUITETURA.md` §6); segue §1–§4, §7 e as decisões 11, 17 e 21 do §5.

Fase provisória: 52 (onda 5 → 5x); o orquestrador atualiza o índice e pode renumerar.

Dependências de outras ondas (usar os nomes reais se diferirem, sem duplicar):

- Onda 0: `screens.ts` (`planos` e `plano-item`, nível 1, módulo `planos`, crumbs "Planos de Produção" e "Detalhe do Item"), guarda, `useToast`, `UseCases` por módulo, badges calculados, `HttpClient.getPage → { data, total }`.
- Onda 1: `Button`, `Breadcrumb` (`items`, `backHref`), `ColorPill`, `Modal size="lg"`, `Pagination`, `FormField error`, `SearchInput`, `FormSelect`.
- Onda 3 (ciclos): `CicloRepository.list()` (ou equivalente) e a regra de ciclo ativo (decisão 21; aqui referida como `cicloAtivo(ciclos): Ciclo | null`). Se não existir na onda 3, criar `cicloAtivo` em `src/domain/ciclos/cicloRules.ts` (status `ativo`; primeiro encontrado).
- Pré-requisito do mock-api (fora desta spec): campo `codigo` (= `id` atual) em todos os `planoItens`. O mapper usa `codigo ?? id` na leitura; ordenação por código e cálculo do próximo código dependem dele.

Perguntas em aberto:

- PO: RN-PLN-03 pede indicador visual de restrição nos itens afetados; o protótipo não tem e não há vínculo item ↔ restrição nos dados. Não implementado.
- PO: RN-PLN-01 diz que o plano é gerido por ciclo, mas `planoItens` não tem ciclo; a tela lista todos os itens e usa o ciclo ativo só nos textos e no prefixo do código novo (lacuna 21).
- ~~PO: decisão 11 — ações de escrita para todos os perfis~~ **Respondida pela RN §3** (Visualizador consulta o plano só para leitura; o Planejador gerencia o plano): "+ Incluir Item", ✏️ Editar e 🗑 Excluir só aparecem para nível ≥ 3 (Planejador, Admin); para Visualizador e Área o detalhe abre sempre em modo leitura (RN-11 abaixo).
- PO: o protótipo mantém a quantidade anterior quando o campo fica vazio no detalhe; o app exige quantidade > 0 (§7.4), com a mensagem do modal "⚠️ Informe a quantidade.".
- Divergência técnica: a busca usa `q=` do json-server, que procura em todos os campos (o protótipo procura só em código, nome, SKU e linha).

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/planos` mostra "Planos de Produção — {ciclo ativo}" / "Lista e gerencia todos os itens programados para produção no ciclo ativo", a ação "+ Incluir Item" (azul) e o `ScreenDesc` 📋 com o texto do protótipo. Sem ciclo ativo, o título é "Planos de Produção".                                                                                                                                                         |
| CA-02 | A tabela é paginada no servidor (`_page`, `_limit`; padrão 10, seletor 10/25/50), com "Mostrando a–b de n"; o contador mostra "**{n}** itens no plano · Ciclo {ciclo}" com o total filtrado.                                                                                                                                                                                                                               |
| CA-03 | Busca (debounce 300 ms, `q=`), família e status vão para a API e para a URL; mudar qualquer um volta à página 1.                                                                                                                                                                                                                                                                                                           |
| CA-04 | Clicar em "Código" ou "Qtd. Planejada" ordena no servidor (`_sort`/`_order`), alternando asc/desc no segundo clique, com `aria-sort` no cabeçalho e ordem na URL.                                                                                                                                                                                                                                                          |
| CA-05 | Colunas: ☐ · Código · Produto / Apresentação · Família (pill da cor da família) · Qtd. Planejada ("{n} cp") · Linha · Semana Prod. · Status ("● {label}" colorido) · Ações. O ☐ do cabeçalho marca/desmarca os itens da página, sem ação em lote.                                                                                                                                                                          |
| CA-06 | Ações: 👁 Visualizar sempre; ✏️ Editar e 🗑 Excluir só para itens não aprovados. Excluir abre confirmação "Excluir o item {código} do plano?"; confirmar remove a linha na hora (otimista), faz `DELETE` e mostra "🗑️ Item removido do plano."; falha restaura a linha e mostra o toast de erro.                                                                                                                             |
| CA-07 | "+ Incluir Item" abre o modal lg "Incluir Item no Plano" (SKUs da lista do protótipo, Linha 1, S27, Ana Planejadora). Sem SKU: "⚠️ Selecione o SKU."; sem quantidade > 0: "⚠️ Informe a quantidade." (toast + erro no campo + foco). Sucesso: `POST` com `id` UUID, `codigo` `{ciclo}-nnn` (maior + 1), status pendente, dados do SKU de `/skuMeta`; toast "✅ Item {código} incluído no plano."; lista e badge atualizam. |
| CA-08 | `/planos/[id]` mostra "Planos de Produção › {código}" + "← Voltar", os cards "Identificação do Item", "Programação" e "Status & Justificativa" preenchidos; salvar faz `PATCH` e mostra "✅ Item {código} atualizado." e volta para `/planos`.                                                                                                                                                                             |
| CA-09 | Item aprovado abre em modo leitura: campos desabilitados e sem "Salvar Alterações".                                                                                                                                                                                                                                                                                                                                        |
| CA-10 | Id inexistente em `/planos/[id]` renderiza o `not-found` do segmento ("Item não encontrado" + "← Voltar para Planos").                                                                                                                                                                                                                                                                                                     |
| CA-11 | Salvar e incluir ficam "Salvando…" e desabilitados durante o envio; sair do detalhe ou fechar o modal com alterações pede confirmação.                                                                                                                                                                                                                                                                                     |
| CA-12 | Estados de lista e detalhe: `loading.tsx` com skeleton, carregando, erro com "Tentar novamente", vazio ("Nenhum item encontrado com os filtros atuais.") e dados.                                                                                                                                                                                                                                                          |
| CA-13 | O badge "PLP Ativo" da sidebar mostra o total de itens e muda após incluir/excluir.                                                                                                                                                                                                                                                                                                                                        |

## 3. UX / Fluxo de tela

Referências: `docs/design/DESIGN_SPEC.md` §3.1, §3.5 (Card), §3.7, §3.8 (ScreenDesc), §3.12, §3.13/§3.17 (tabela), §3.14 (filtros e paginação), §3.15, §3.16.

### 3.1 `/planos` — `PlanosScreen`

- Rota `src/app/planos/page.tsx`, `metadata = { title: 'Planos de Produção' }`; `loading.tsx` (`PlanosSkeleton`), `error.tsx`.
- `PageHeader` title `Planos de Produção — {ciclo}` (ou "Planos de Produção" sem ciclo ativo); description "Lista e gerencia todos os itens programados para produção no ciclo ativo"; actions `Button variant="primary" size="sm"` "+ Incluir Item".
- `ScreenDesc icon="📋"`: "**Lista e gerencia todos os itens programados para produção no ciclo ativo.** É a tela operacional central do PLP — onde o planejador inclui, ajusta e acompanha cada SKU do plano. A _acurácia deste plano_ é o que reduz o gap entre previsão e produção real: itens mal dimensionados aqui geram ruptura de estoque ou excesso, impactando diretamente o nível de serviço e o capital de giro." (o `em` do `ScreenDesc` já é azul/500, como o span do protótipo; sem ação).
- Filtros (`role="search"`, `mb-[12px] flex flex-wrap items-center gap-[10px]`): `SearchInput` `aria-label="Buscar itens do plano"` placeholder "Buscar produto, código, linha..." (`min-w-[220px] flex-1`); `FormSelect` `aria-label="Família"` `w-[180px]` ("Todas as famílias", Imunologia, Cardio, Dermatologia, Neurologia, Reumatologia, Endocrinologia, Gastro); `FormSelect` `aria-label="Status"` `w-[170px]` ("Todos os status", "● Aprovado", "● Em Revisão", "● Bloqueado", "● Pendente").
- Contador `p mb-[12px] text-[13px] text-apsen-muted` (`aria-live="polite"`): "<strong>{total}</strong> itens no plano · Ciclo {ciclo|—}".
- `PlanoItensTable` (feature, sobre `Table`, `caption` "Itens do plano de produção"):

| Coluna                 | Render                                                                                                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ☐                      | cabeçalho `input type="checkbox"` `aria-label="Selecionar itens da página"` `accent-apsen-blue`; linha `aria-label="Selecionar {código}"`. Seleção em `useState<Set<string>>`, limpa ao mudar página/filtro/ordem; cabeçalho marcado = todos da página marcados. Sem ação em lote (decisão 17). |
| Código                 | cabeçalho `button` "Código" `text-apsen-blue` (sort `codigo`); célula `font-mono text-[12px] font-semibold text-apsen-blue`                                                                                                                                                                     |
| Produto / Apresentação | `div text-[13px] font-medium` `nome` + `div text-[11.5px] text-apsen-muted` "{apres} · SKU {sku sem 'SKU-'}"                                                                                                                                                                                    |
| Família                | `ColorPill` "● {familia}" (fundo cor/9,4%, borda cor/18,8% — protótipo `cor+'18'`/`'30'`) com a cor de `FAMILIA_TOM` (§8)                                                                                                                                                                       |
| Qtd. Planejada         | cabeçalho `button` "Qtd. Planejada" (sort `qtd`); célula `text-[13px] font-semibold` `formatInteger(qtd)` + `<span className="text-[11px] font-normal text-apsen-muted"> cp</span>`                                                                                                             |
| Linha                  | `text-[12.5px]`                                                                                                                                                                                                                                                                                 |
| Semana Prod.           | `text-[12.5px]`                                                                                                                                                                                                                                                                                 |
| Status                 | `text-[12px] font-semibold` "● {label}": aprovado `text-apsen-green`, revisão `text-apsen-orange`, bloqueado `text-apsen-red`, pendente `text-apsen-muted`                                                                                                                                      |
| Ações                  | `ActionGroup`: `IconLink` olho `aria-label="Visualizar {código}"` → `/planos/{id}`; se não aprovado, `IconLink` lápis `aria-label="Editar {código}"` → `/planos/{id}` e `IconButton tone="red"` lixeira `aria-label="Excluir {código}"` (paths L6706–6711)                                      |

Cabeçalhos ordenáveis: `aria-sort="ascending|descending|none"`; primeiro clique asc, mesmo cabeçalho de novo inverte, outro cabeçalho começa asc (fiel a `planoSort`). Ordenar não muda a página (fiel).

- Rodapé: `Pagination` ("Mostrando a–b de n", botões redondos 28px, janela ±1) + `FormSelect` `aria-label="Itens por página"` `w-[90px]` (10, 25, 50) à esquerda da navegação [derivado, §7.1]. O protótipo usa 8 por página; §7.1 define 10.
- Exclusão: `ConfirmarExclusaoModal` (feature, `Modal size="md"`, `next/dynamic`): título "Excluir item", corpo "Excluir o item {código} do plano?" (texto do `confirm` do protótipo), rodapé `Button ghost sm` "Cancelar" · `Button danger sm` "Excluir".
- Modal de inclusão: §3.3.

### 3.2 `/planos/[id]` — `PlanoItemScreen`

- Rota `src/app/planos/[id]/page.tsx`: `export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <PlanoItemScreen id={id} />; }`, `metadata = { title: 'Detalhe do Item' }`; `loading.tsx` (skeleton dos 3 cards), `error.tsx`, `not-found.tsx` (`ErrorState` ícone 🔍, título "Item não encontrado", `ButtonLink outline` "← Voltar para Planos"). A tela chama `notFound()` quando o caso de uso lança `NotFoundError`.
- `Breadcrumb items=[{ label: 'Planos de Produção', href: '/planos' }, { label: codigo }] backHref="/planos"` ("← Voltar").
- Grid `grid grid-cols-2 gap-x-[16px] max-[800px]:grid-cols-1` com:
  - `Card` + `CardTitle` "Identificação do Item": "Código do plano" `TextInput readOnly` `font-mono` (código) · "Produto / SKU" `readOnly` "{nome} · {apres} · {sku}" · "Família" `readOnly`.
  - `Card` "Programação": "Qtd. Planejada" `*` `TextInput type="number"` `min=1 step=1` placeholder "Ex: 50000" · "Linha de Produção" `*` `FormSelect` (Linha 1–4) · "Semana de Produção" `*` `FormSelect` (`SEMANAS`).
- `Card` "Status & Justificativa": `FormGrid columns={2}`: "Status" `FormSelect` (pendente "Pendente", revisao "Em Revisão", aprovado "Aprovado", bloqueado "Bloqueado") · "Responsável" `FormSelect` (Ana Planejadora, Carlos Lima, Roberto Gerente) · "Justificativa / Observação" `TextArea rows={2} full` placeholder "Motivo de revisão, bloqueio ou ajuste de quantidade...".
- Ações (`FormActions`, ou `form-actions` local se a onda 1 não tiver): `Button ghost` "Cancelar" (→ `/planos`) · `Button primary sm` "Salvar Alterações" ("Salvando…" no envio).
- Modo leitura (status carregado = `aprovado`, decisão 17 e RN-PLN-02): todos os controles `disabled`, "Salvar Alterações" oculto, "Cancelar" mantido.
- Sucesso: toast "✅ Item {código} atualizado." e `router.push('/planos')`. Validação: quantidade vazia/≤ 0/não inteira → toast "⚠️ Informe a quantidade.", erro "Informe a quantidade." no campo e foco.
- Alterações não salvas: `useUnsavedChangesGuard(dirty)` (onda 0/1; se não existir, criar em `src/presentation/hooks/useUnsavedChangesGuard.ts`): `beforeunload` enquanto sujo e `confirmarSaida()` (`window.confirm('Há alterações não salvas. Deseja sair mesmo assim?')` [derivado]) antes de Cancelar, "← Voltar" e o link do breadcrumb.

### 3.3 `IncluirItemModal` (`next/dynamic`, `ssr: false`)

`Modal size="lg" title="Incluir Item no Plano"`:

- "Produto / SKU" `*` `FormSelect` placeholder "Selecione o SKU..."; opções = `PLANO_SKUS_INCLUSAO` (`SKU-00312`, `SKU-00313`, `SKU-00058`, `SKU-00059`, `SKU-00091`, `SKU-00092`, `SKU-00189`, `SKU-00315`, `SKU-00071`, `SKU-00140`, nessa ordem) com rótulo "{nome} — {apres} · {id}" vindo de `/skuMeta`.
- `FormGrid columns={2}`: "Qtd. Planejada (cp)" `*` `number` `min=1 step=1` placeholder "Ex: 50000" · "Linha" `*` (Linha 1–4, padrão Linha 1) · "Semana de Produção" `*` (`SEMANAS`, padrão S27) · "Responsável" (padrão Ana Planejadora).
- "Justificativa" `TextInput` placeholder "Motivo da inclusão, fonte da previsão...".
- Rodapé: "Cancelar" (ghost sm) · "Incluir Item" (primary sm; "Salvando…"). Fechar sujo pede confirmação (mesmo texto).
- Opções carregando: select desabilitado com "Carregando SKUs…"; erro: `Alert tone="error"` "Não foi possível carregar os SKUs." + `Button outline sm` "Tentar novamente" [derivado].

### 3.4 Estado na URL (`/planos`)

`busca`, `familia`, `status`, `ordem` (`codigo-asc|codigo-desc|qtd-asc|qtd-desc`), `pagina` (≥ 1), `tamanho` (10|25|50). `lerFiltroPlano(searchParams)`/`escreverFiltroPlano(filtro)` em `features/planos/planoUrl.ts` (valor inválido → padrão; padrões omitidos da URL). Busca: input controlado local, `useDebouncedValue(valor, 300)` atualiza a URL. `router.replace(..., { scroll: false })`.

### 3.5 Estados

- `loading.tsx`: header + filtros estáticos + 8 linhas `h-[48px] rounded-apsen bg-apsen-bg` (sem animação).
- Primeira carga: `LoadingState` "Carregando itens do plano…"; troca de página/filtro: `keepPreviousData` (linhas anteriores ficam).
- Erro: `ErrorState` (`toUserMessage`) com "Tentar novamente".
- Vazio: `Table emptyText` "Nenhum item encontrado com os filtros atuais." [derivado; o protótipo deixa o `tbody` vazio]; contador e paginação ("Mostrando 0–0 de 0") visíveis.

## 4. Contratos de API consumidos

Base `{NEXT_PUBLIC_API_URL}`.

| Uso            | Requisição                                                                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lista          | `GET /planoItens?q=bari&familia=Imunologia&status=aprovado&_sort=codigo&_order=asc&_page=1&_limit=10` → array + `X-Total-Count` (parâmetros vazios não são enviados) |
| Total (badge)  | `GET /planoItens?_limit=1` → `X-Total-Count`                                                                                                                         |
| Detalhe        | `GET /planoItens/:id` → objeto; `404` → `NotFoundError('Item do plano', id)`                                                                                         |
| Próximo código | `GET /planoItens?codigo_like=^PLP-2026-07-&_sort=codigo&_order=desc&_limit=1`                                                                                        |
| SKUs do modal  | `GET /skuMeta?id=SKU-00312&id=SKU-00313&…` (10 ids)                                                                                                                  |
| Ciclo ativo    | via `CicloRepository` (onda 3): `GET /ciclos?status=ativo`                                                                                                           |
| Incluir        | `POST /planoItens` → `201`                                                                                                                                           |
| Editar         | `PATCH /planoItens/:id` `{ qtd, linha, semana, status, resp, obs }` → `200`                                                                                          |
| Excluir        | `DELETE /planoItens/:id` → `200` `{}`                                                                                                                                |

Exemplo de item:

```json
{
  "id": "PLP-2026-07-001",
  "codigo": "PLP-2026-07-001",
  "sku": "SKU-00312",
  "nome": "Baricitinibe 2mg",
  "apres": "Blister 28cp",
  "familia": "Imunologia",
  "qtd": 42500,
  "linha": "Linha 1",
  "semana": "S27 (30/06–06/07)",
  "status": "aprovado",
  "resp": "Ana Planejadora",
  "obs": ""
}
```

Novo item (`POST`):

```json
{
  "id": "2b9d6c1e-8f0a-4c3e-9a77-5e4d3c2b1a00",
  "codigo": "PLP-2026-07-248",
  "sku": "SKU-00058",
  "nome": "Apixabana 5mg",
  "apres": "Blister 60cp",
  "familia": "Cardio",
  "qtd": 50000,
  "linha": "Linha 2",
  "semana": "S28 (07–13/07)",
  "status": "pendente",
  "resp": "Carlos Lima",
  "obs": "Previsão comercial"
}
```

Schemas Zod (`src/infrastructure/planos/planoSchemas.ts`):

```ts
export const planoItemDtoSchema = z.object({
  id: z.string().min(1),
  codigo: z.string().min(1).optional(),
  sku: z.string(),
  nome: z.string(),
  apres: z.string().default(''),
  familia: z.string().default(''),
  qtd: z.number().int().nonnegative(),
  linha: z.string(),
  semana: z.string(),
  status: z.enum(['aprovado', 'revisao', 'bloqueado', 'pendente']),
  resp: z.string().default(''),
  obs: z.string().default(''),
});
export const planoItemListSchema = z.array(planoItemDtoSchema);
export const skuMetaDtoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  apres: z.string(),
  familia: z.string(),
});
export const skuMetaListSchema = z.array(skuMetaDtoSchema);
```

Erros: schema inválido ou `X-Total-Count` ausente → `InvalidResponseError`; `404` em detalhe/PATCH/DELETE → `NotFoundError`; `5xx`/rede → `HttpError`/`NetworkError`.

## 5. Domínio (`src/domain`)

`src/domain/planos/`:

- `PlanoItem.ts`
  ```ts
  export type PlanoStatus = 'aprovado' | 'revisao' | 'bloqueado' | 'pendente';
  export interface PlanoItem {
    id: string;
    codigo: string;
    sku: string;
    nome: string;
    apres: string;
    familia: string;
    qtd: number;
    linha: string;
    semana: string;
    status: PlanoStatus;
    resp: string;
    obs: string;
  }
  export interface SkuMeta {
    id: string;
    nome: string;
    apres: string;
    familia: string;
  }
  export type PlanoOrdem = { campo: 'codigo' | 'qtd'; direcao: 'asc' | 'desc' } | null;
  export interface PlanoFiltro {
    busca: string;
    familia: string;
    status: PlanoStatus | '';
    ordem: PlanoOrdem;
    pagina: number;
    tamanho: 10 | 25 | 50;
  }
  export interface PlanoItemForm {
    qtd: string;
    linha: string;
    semana: string;
    status: PlanoStatus;
    resp: string;
    obs: string;
  }
  export interface InclusaoForm {
    sku: string;
    qtd: string;
    linha: string;
    semana: string;
    resp: string;
    obs: string;
  }
  ```
- `planoConstants.ts`: `PLANO_STATUS_LABEL` (Aprovado, Em Revisão, Bloqueado, Pendente), `PLANO_FAMILIAS` (7), `LINHAS` (Linha 1–4), `SEMANAS` (5, `config.SEMANAS`), `RESPONSAVEIS_PLANO` (3), `PLANO_SKUS_INCLUSAO` (10), `TAMANHOS_PAGINA = [10, 25, 50]`, `TAMANHO_PADRAO = 10`.
- `planoRules.ts` (puro):
  - `alternarOrdem(atual, campo): PlanoOrdem` — mesmo campo inverte; outro campo começa `asc`.
  - `proximoCodigoPlano(prefixo, maiorCodigo): string` — `{prefixo}-` + (sufixo + 1) com 3 dígitos; `null` → `{prefixo}-001`.
  - `prefixoDoCiclo(cicloAtivoId: string | null, maiorCodigoGeral: string | null): string` — id do ciclo ativo; sem ciclo, o prefixo do maior código existente (tudo antes do último `-`); sem nenhum, `PlanoSemCicloError`.
  - `podeEditar(item): boolean` — `status !== 'aprovado'` (RN-PLN-02).
  - `quantidadeValida(texto): number | null` — inteiro > 0 ou `null`.
  - `validarInclusao(form)` — `PlanoInvalidoError('⚠️ Selecione o SKU.', 'sku')`, depois `PlanoInvalidoError('⚠️ Informe a quantidade.', 'qtd')`.
  - `validarEdicao(form)` — `PlanoInvalidoError('⚠️ Informe a quantidade.', 'qtd')`.
  - `novoItem(form, meta, id, codigo): PlanoItem` — `status 'pendente'`, `nome/apres/familia` do `SkuMeta`, `qtd` inteiro.
  - `skuSemPrefixo(sku)` — remove `SKU-`.
  - `formularioDoItem(item)`, `formularioInclusaoVazio()` (Linha 1, S27, Ana Planejadora), `formularioAlterado(a, b)`.
- `PlanoItemRepository.ts`
  ```ts
  export interface PlanoItemRepository {
    listPage(filtro: PlanoFiltro): Promise<Pagina<PlanoItem>>;
    count(filtro?: { status?: PlanoStatus }): Promise<number>;
    get(id: string): Promise<PlanoItem>;
    maiorCodigo(prefixo?: string): Promise<string | null>;
    create(item: PlanoItem): Promise<PlanoItem>;
    update(id: string, patch: Partial<Omit<PlanoItem, 'id' | 'codigo'>>): Promise<PlanoItem>;
    delete(id: string): Promise<void>;
  }
  export interface SkuMetaRepository {
    listByIds(ids: readonly string[]): Promise<SkuMeta[]>;
  }
  ```
  (`Pagina<T>` compartilhado conforme a spec de restrições/onda 0; `count` por status é usado pelo dashboard.)
- `PlanoInvalidoError` (`campo: 'sku' | 'qtd'`), `PlanoSemCicloError` (mensagem "⚠️ Nenhum ciclo ativo para gerar o código." [derivado]) — ambos `extends DomainError`.

## 6. Aplicação (`src/application`)

`src/application/planos/`:

- `dto.ts`: `PlanoItemRowOutput { id, codigo, sku, skuCurto, nome, apres, familia, qtd, linha, semana, status, statusLabel, editavel }`, `PlanoListOutput { itens, total, pagina, tamanho, ciclo: string | null }`, `PlanoItemDetailOutput { ...row, resp, obs, produtoLabel: '{nome} · {apres} · {sku}', somenteLeitura, form }`, `SkuOpcaoOutput { value, label }`.
- `ListPlanoItens(itens: PlanoItemRepository, ciclos: CicloRepository)` → `execute(filtro)`: `Promise.all([listPage, ciclos.list()])`; `ciclo = cicloAtivo(...)?.id ?? null`.
- `ContarPlanoItens(itens)` → total (badge).
- `GetPlanoItem(itens)` → detalhe; propaga `NotFoundError`.
- `ListSkusInclusao(skuMeta)` → opções na ordem de `PLANO_SKUS_INCLUSAO` (ids sem meta são omitidos).
- `IncluirPlanoItem(itens, skuMeta, ciclos, gerarId)` → `execute(form): Promise<{ id; codigo }>`: `validarInclusao`; meta do SKU; prefixo (`cicloAtivo` + `maiorCodigo()` geral); `maiorCodigo(prefixo)` → `proximoCodigoPlano`; `create(novoItem(...))`.
- `AtualizarPlanoItem(itens)` → `execute(id, form)`: `validarEdicao`; `update(id, { qtd, linha, semana, status, resp, obs })`; devolve `{ codigo }`.
- `ExcluirPlanoItem(itens)` → `execute(id)`.

## 7. Infraestrutura (`src/infrastructure`)

`src/infrastructure/planos/`:

- `planoSchemas.ts` (§4), `planoMapper.ts` (`codigo ?? id`).
- `HttpPlanoItemRepository` — `listPage` monta `q`, `familia`, `status`, `_sort` (`codigo`|`qtd`), `_order`, `_page`, `_limit` (omitindo vazios) e usa `http.getPage`; `count` com `_limit=1`; `get`/`update`/`delete` com `encodeURIComponent(id)` e `HttpError` 404 → `NotFoundError('Item do plano', id)`; `maiorCodigo(prefixo)` com `codigo_like=^{prefixo}-` (regex escapada) + `_sort=codigo&_order=desc&_limit=1`.
- `HttpSkuMetaRepository` — `GET skuMeta` com `id` repetido (`HttpClient` precisa aceitar `QueryParams` com array; se não aceitar, montar o path `skuMeta?id=…&id=…` com `encodeURIComponent`).

## 8. Apresentação (`src/presentation`)

- `queryKeys.planos = { all: ['planos'], list: (filtro) => [...], detail: (id) => [...], total: () => [...], skusInclusao: () => [...] }`.
- Hooks `src/presentation/hooks/usePlanos.ts`: `usePlanoItens(filtro)` (`staleTime` 30 s, `keepPreviousData`, prefetch da próxima página), `useTotalPlanoItens()` (badge), `usePlanoItem(id)`, `useSkusInclusao()` (`staleTime` 5 min, só com o modal aberto), `useIncluirPlanoItemMutation`, `useAtualizarPlanoItemMutation` (invalidam `planos.all` e `dashboard.all`), `useExcluirPlanoItemMutation` (otimista: remove da página em cache e decrementa total; rollback + toast "⚠️ Não foi possível excluir. Tente novamente." [derivado]; `onSettled` invalida `planos.all` e `dashboard.all`).
- `src/presentation/hooks/useDebouncedValue.ts` (se a onda 0/1 não tiver criado).
- `UseCases.planos = { list, contar, get, skusInclusao, incluir, atualizar, excluir }` + stubs em `createFakeUseCases`.
- `createContainer`: `HttpPlanoItemRepository` (instância única, reutilizada pelo dashboard), `HttpSkuMetaRepository`, `CicloRepository` da onda 3 (mesma instância), `gerarId`.
- Feature `src/presentation/features/planos/`: `PlanosScreen.tsx`, `PlanoItemScreen.tsx`, `planoUrl.ts`, `planoStyles.ts` (status → classe; `FAMILIA_TOM`), `components/{PlanoFiltros,PlanoItensTable,PlanoPaginacao,IncluirItemModal,ConfirmarExclusaoModal,PlanoItemForm,PlanosSkeleton,PlanoItemSkeleton}.tsx`.
- Rotas em `routes.ts`: `PLANOS_ROUTE = '/planos'`, `planoItemRoute(id)` (`encodeURIComponent`).

### Cores de família

`FAMILIA_TOM` mapeia para os tons do `ColorPill` (onda 1) com estes valores do protótipo (`FAMILIA_COR`): Imunologia `#7C3AED` (= `apsen-purple`), Cardio e Neurologia `#2563EB`, Dermatologia `#D97706`, Reumatologia `#059669`, Endocrinologia `#0891B2` (= `apsen-cyan`), Gastro `#65A30D`, outras `#64748B`. Se o `ColorPill` não tiver algum desses tons, criar o token (`--color-apsen-pal-{blue|amber|emerald|lime|slate}`, claro = hex acima, escuro [derivado] mais claro) e documentar no `DESIGN_SPEC.md`.

## 9. Arquivos

### Novos

- `src/domain/planos/{PlanoItem,planoConstants,planoRules,PlanoItemRepository,PlanoErrors}.ts`, `__tests__/planoRules.test.ts`
- `src/application/planos/{dto,ListPlanoItens,ContarPlanoItens,GetPlanoItem,ListSkusInclusao,IncluirPlanoItem,AtualizarPlanoItem,ExcluirPlanoItem}.ts`, `__tests__/planosUseCases.test.ts`
- `src/infrastructure/planos/{planoSchemas,planoMapper,HttpPlanoItemRepository,HttpSkuMetaRepository}.ts`, `__tests__/{HttpPlanoItemRepository,HttpSkuMetaRepository}.test.ts`
- `src/presentation/hooks/usePlanos.ts`, `__tests__/usePlanos.test.tsx`; `useDebouncedValue.ts` e `useUnsavedChangesGuard.ts` (+ testes) se ainda não existirem
- `src/presentation/features/planos/` (§8) e `__tests__/{PlanosScreen,PlanoItensTable,IncluirItemModal,PlanoItemScreen,planoUrl}.test.tsx|ts`
- `src/app/planos/{page,loading,error}.tsx`, `src/app/planos/[id]/{page,loading,error,not-found}.tsx`, `__tests__/page.test.tsx` em cada segmento

### Modificados

- `queryKeys.ts`, `UseCasesContext.tsx`, `test/renderWithProviders.tsx` — grupo `planos`.
- `src/main/container.ts` (+ teste).
- `routes.ts` (+ teste), `screens.ts` (telas `planos`/`plano-item`, fonte do badge `planos`).
- `globals.css`/`DESIGN_SPEC.md` — tons de família, se faltarem.
- `src/infrastructure/http/HttpClient.ts`/`FetchHttpClient.ts` — só se `QueryParams` ainda não aceitar valores repetidos (`string[]`), com teste.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RN-01 | Busca (`q`, debounce 300 ms), família (igualdade) e status (igualdade) são aplicados no servidor; mudar qualquer um volta à página 1 (RN-PLN-01).                                          |
| RN-02 | Ordenação por código (`_sort=codigo`, lexical = numérica com sufixo de 3 dígitos; decisão 17) ou quantidade; mesmo cabeçalho inverte, outro começa asc; não muda a página.                 |
| RN-03 | Itens `aprovado` não mostram Editar/Excluir na lista e abrem o detalhe em modo leitura (decisão 17, RN-PLN-02).                                                                            |
| RN-04 | Inclusão: SKU obrigatório ("⚠️ Selecione o SKU."), quantidade inteira > 0 ("⚠️ Informe a quantidade."); status inicial `pendente`; nome/apresentação/família vêm de `/skuMeta`.            |
| RN-05 | Item novo: `id` UUID (RN-SEG-03); `codigo` = `{ciclo ativo}-` + (maior sufixo com o mesmo prefixo + 1), 3 dígitos; sem ciclo ativo, prefixo do maior código existente. Nunca `length + 1`. |
| RN-06 | Edição grava `qtd`, `linha`, `semana`, `status`, `resp`, `obs`; quantidade inteira > 0 obrigatória.                                                                                        |
| RN-07 | Excluir sempre confirma (modal) com "Excluir o item {código} do plano?", remove otimista e restaura em erro.                                                                               |
| RN-08 | Textos do ciclo ("Planos de Produção — …", "Ciclo …") vêm do ciclo ativo de `/ciclos` (decisão 21); sem ciclo ativo, sem sufixo no título e "—" no contador.                               |
| RN-09 | O checkbox do cabeçalho seleciona só os itens da página; não há ação em lote (decisão 17).                                                                                                 |
| RN-10 | Filtros, ordem, página e tamanho ficam na URL; valores inválidos caem no padrão; tamanhos 10/25/50 (padrão 10).                                                                            |

| RN-11 | Escrita no plano (incluir, editar, excluir) só para nível ≥ 3 (RN §3: Visualizador só lê; o Planejador gerencia o plano). Níveis 1–2 veem a lista e o detalhe em modo leitura, sem "+ Incluir Item", ✏️ e 🗑. |

### Ajustes da implementação (fase B)

- Ciclo ativo: `CicloAtivoRepository` (porta do módulo) adaptado no `createPlanosModule` sobre o `HttpCicloRepository.findAtivo()` do módulo de ciclos (código do ciclo `ativo`).
- Chaves e hooks em `src/presentation/hooks/planos/` (`planosKeys`, `usePlanos`, `usePlanoMutations`); mutações invalidam `planos`, `['dashboard']` e `navegacao.badges`.
- Rotas: `src/app/(app)/planos/...` e `PLANOS_ROUTE`/`planoItemRoute` em `features/planos/planoRoutes.ts` (fora do `routes.ts` compartilhado).
- Confirmações de saída com alterações usam o `ConfirmDialog` do UI kit ("Sair sem salvar?" · "Há alterações não salvas. Deseja sair mesmo assim?") e o `useUnsavedChangesGuard` do kit no detalhe, no lugar de `window.confirm`.
- A tabela é um componente da feature (o `Table` do kit não aceita `aria-sort`); classes idênticas às do `Table`.

## 11. Requisitos não funcionais

| Item (§7) | Aplicação                                                                                                                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1       | Paginação, busca, filtros e ordenação no servidor; seletor 10/25/50 (247 itens); debounce 300 ms; estado na URL; `keepPreviousData`; SKUs do modal buscados por id (10), sem baixar `/skuMeta` inteiro sem necessidade. |
| 7.2       | `loading.tsx`/`error.tsx` em `/planos` e `/planos/[id]`, `not-found.tsx` no detalhe; modais via `next/dynamic` `ssr: false`; prefetch da próxima página; guarda antes das queries.                                      |
| 7.3       | `staleTime` 30 s (lista/detalhe) e 5 min (SKUs); invalida `planos` e `dashboard`; exclusão otimista com confirmação; "Salvando…" sem duplo envio.                                                                       |
| 7.4       | Validação no domínio, toast + erro no campo + foco no primeiro inválido; `number` com `min=1 step=1`; guarda de alterações não salvas no detalhe e no modal.                                                            |
| 7.5       | `caption`/`scope`, `aria-sort`, `aria-label` nas ações e checkboxes, contador `aria-live`; tabela com scroll horizontal, grid de cards em 1 coluna abaixo de 800 px.                                                    |
| 7.6       | Sem `console.*`; ids UUID; cliente HTTP central com timeout.                                                                                                                                                            |

## 12. BDD — Cenários de teste unitário

| Cenário                                                                                                                                                                                  | Arquivo de teste                                                                                       | Asserção                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 / RN-08 Dado ciclo ativo PLP-2026-07, quando renderiza, então título, subtítulo, botão e `ScreenDesc`                                                                              | `src/presentation/features/planos/__tests__/PlanosScreen.test.tsx`                                     | `heading` "Planos de Produção — PLP-2026-07"; `button` "+ Incluir Item"; "acurácia deste plano" em `em`; com `ciclo: null`, "Planos de Produção" e "Ciclo —"                                                                          |
| CA-02 Dado total 247, quando renderiza, então contador e paginação                                                                                                                       | `PlanosScreen.test.tsx`                                                                                | "247 itens no plano · Ciclo PLP-2026-07"; "Mostrando 1–10 de 247"; trocar tamanho para 25 → URL `tamanho=25` sem `pagina`                                                                                                             |
| CA-03 / RN-01 Dado busca digitada, quando passa 300 ms, então atualiza a URL e volta à página 1                                                                                          | `PlanosScreen.test.tsx` (fake timers)                                                                  | sem `replace` antes de 300 ms; depois `replace` com `busca=bari` e sem `pagina`; família "Cardio" → `familia=Cardio`                                                                                                                  |
| CA-04 / RN-02 Dado cliques em "Código" duas vezes e depois em "Qtd. Planejada", quando ordena, então `codigo-asc`, `codigo-desc`, `qtd-asc`                                              | `PlanosScreen.test.tsx`, `src/domain/planos/__tests__/planoRules.test.ts`                              | `aria-sort`; `alternarOrdem`; `pagina` preservada                                                                                                                                                                                     |
| CA-05 / RN-09 Dado uma página com 2 itens, quando marca o cabeçalho, então as duas linhas ficam marcadas e nada é chamado                                                                | `src/presentation/features/planos/__tests__/PlanoItensTable.test.tsx`                                  | checkboxes marcados; nenhum caso de uso de escrita; pill "● Imunologia"; "42.500 cp"; "Blister 28cp · SKU 00312"; status "● Aprovado" `text-apsen-green`                                                                              |
| CA-06 / RN-03 / RN-07 Dado item pendente, quando exclui e confirma, então some na hora e mostra o toast; com erro, volta                                                                 | `PlanoItensTable.test.tsx`, `src/presentation/hooks/__tests__/usePlanos.test.tsx`                      | aprovado sem "Editar"/"Excluir"; `dialog` "Excluir o item PLP-2026-07-005 do plano?"; `excluir.execute(id)`; toast "🗑️ Item removido do plano."; rollback em rejeição                                                                 |
| CA-07 / RN-04 Dado o modal, quando inclui sem SKU e sem quantidade, então toasts, erro e foco; preenchido, inclui                                                                        | `src/presentation/features/planos/__tests__/IncluirItemModal.test.tsx`                                 | "⚠️ Selecione o SKU." com foco no SKU; "⚠️ Informe a quantidade."; padrões Linha 1/S27/Ana Planejadora; sucesso → toast "✅ Item PLP-2026-07-248 incluído no plano."                                                                  |
| RN-05 Dado maior `PLP-2026-07-247`, quando gera, então `PLP-2026-07-248`; sem ciclo e maior `PLP-2026-07-010`, prefixo `PLP-2026-07`                                                     | `planoRules.test.ts`, `src/application/planos/__tests__/planosUseCases.test.ts`                        | `proximoCodigoPlano`; `prefixoDoCiclo`; `create` com `id` do `gerarId` e `status: 'pendente'`; sem nenhum → `PlanoSemCicloError`                                                                                                      |
| CA-08 / RN-06 Dado item pendente, quando edita a quantidade e salva, então PATCH, toast e volta                                                                                          | `src/presentation/features/planos/__tests__/PlanoItemScreen.test.tsx`                                  | breadcrumb "Planos de Produção" → "PLP-2026-07-005"; campos preenchidos; `atualizar.execute(id, form)`; toast "✅ Item PLP-2026-07-005 atualizado."; `routerMock.push('/planos')`; quantidade "0" → "⚠️ Informe a quantidade." e foco |
| CA-09 Dado item aprovado, quando abre, então campos desabilitados e sem salvar                                                                                                           | `PlanoItemScreen.test.tsx`                                                                             | `spinbutton` "Qtd. Planejada" `disabled`; sem `button` "Salvar Alterações"                                                                                                                                                            |
| CA-10 Dado `get` com `NotFoundError`, quando renderiza, então chama `notFound()`; `not-found.tsx` mostra o texto                                                                         | `PlanoItemScreen.test.tsx`, `src/app/planos/[id]/__tests__/page.test.tsx`                              | `notFound` mockado chamado; "Item não encontrado" e link "← Voltar para Planos"                                                                                                                                                       |
| CA-11 Dado salvar pendente e form sujo, quando clica Cancelar, então "Salvando…" e confirmação                                                                                           | `PlanoItemScreen.test.tsx`                                                                             | botão `disabled` "Salvando…"; `window.confirm` com "Há alterações não salvas. Deseja sair mesmo assim?"; `false` não navega                                                                                                           |
| CA-12 Dado lista pendente/erro/vazia, quando renderiza, então estados                                                                                                                    | `PlanosScreen.test.tsx`, `src/app/planos/__tests__/page.test.tsx`                                      | "Carregando itens do plano…"; "Tentar novamente" refaz; "Nenhum item encontrado com os filtros atuais."; `metadata.title` "Planos de Produção"; `[id]/page` aguarda `params` e repassa o id                                           |
| CA-13 Dado incluir/excluir concluído, quando invalida, então total recarregado e dashboard invalidado                                                                                    | `usePlanos.test.tsx`                                                                                   | `contar.execute` de novo; `invalidateQueries` com `['planos']` e `['dashboard']`                                                                                                                                                      |
| RN-10 Dado `?ordem=xpto&tamanho=7&pagina=0`, quando lê, então padrões                                                                                                                    | `src/presentation/features/planos/__tests__/planoUrl.test.ts`                                          | `ordem null`, `tamanho 10`, `pagina 1`; escrita omite padrões                                                                                                                                                                         |
| Infra Dado filtro completo, quando lista, então URL com `q`, `familia`, `status`, `_sort`, `_order`, `_page`, `_limit` e total; 404 → `NotFoundError`; inválido → `InvalidResponseError` | `src/infrastructure/planos/__tests__/HttpPlanoItemRepository.test.ts`, `HttpSkuMetaRepository.test.ts` | URL exata; `codigo ?? id`; `DELETE` método; `skuMeta?id=…&id=…`                                                                                                                                                                       |
