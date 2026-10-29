---
status: READY
fase: 6
area: platform
feature: ui-kit-base
azure-devops-work-item: 39014
---

# Componentes base do UI kit

## 1. Overview

Enabler da Sprint 1 (work item 39014, "[FRONT] Criar os componentes base do UI kit"). As telas do Demand Intelligence vão precisar de componentes que o protótipo `di-drivers-v2_84.html` usa e que `@presentation/components/ui` ainda não tem: campo de formulário e grade, modal, tabela genérica, tooltip, alerta, toggle e abas. Cada um entra no UI kit com teste, só com tokens `apsen-*`, e é exportado pelo `index.ts`. Esta fase continua a [apsen-visual-identity](apsen-visual-identity.md) (fase 5, `DONE`), que não é alterada. Os componentes existentes mantêm a API.

Fora do escopo: Autocomplete e seletor de período (Sprint 2), telas, rotas e migração de telas já prontas (a `CampaignTable` continua como está).

Restrições da história: nenhuma dependência nova (React puro, sem Radix nem Headless UI), componentes de até 120 linhas, sem comentários no código, `'use client'` só onde houver estado, efeito, contexto ou handler.

Dúvidas abertas: nenhuma.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | Formulário: `FormField` renderiza rótulo (`.form-label`) associado ao controle por `htmlFor`/`id`, uma dica opcional (`.form-hint`), o marcador de obrigatório (`.req`, `*` vermelho, `aria-hidden`) com `required` no controle e uma mensagem de erro opcional que põe `aria-invalid="true"` no controle e entra no `aria-describedby` junto com a dica. `TextInput` (`.form-input`) e `TextArea` (`.form-textarea`, `min-h-[72px]`, `resize-y`) são controlados e herdam do `FormField` o `id`, a descrição, `required` e `aria-invalid`. `FormGrid` monta a grade `.form-grid` com 1, 2 (`.fg-2`) ou 3 (`.fg-3`) colunas, com os breakpoints de 800px e 560px, e `FormField full` ocupa a linha toda (`.fg-full`). |
| CA-02 | Modal: `Modal` renderiza `role="dialog"`, `aria-modal="true"` e `aria-labelledby` apontando para o título do cabeçalho (`.modal-head`), corpo (`.modal-body`) e rodapé opcional (`.modal-foot`), nos tamanhos `md` (500px) e `lg` (`.modal-lg`, 680px). Fecha (chama `onClose`) pelo botão "Fechar" (`.modal-x`, ✕), pela tecla Esc e pelo clique no overlay (`.modal-overlay`); clique dentro da caixa não fecha. Ao abrir, o foco vai para o primeiro elemento focável; Tab e Shift+Tab circulam só dentro do modal; ao fechar, o foco volta ao elemento que abriu. Com `open={false}` nada é renderizado.                                                                                                          |
| CA-03 | Tabela: `Table` genérica renderiza `.table-wrap`, `caption` acessível (`sr-only`), cabeçalho com `th scope="col"`, uma linha por item com as células definidas nas colunas, coluna "Ações" opcional com `ActionGroup` e, sem linhas, o estado vazio em uma `td` com `colSpan` igual ao total de colunas (incluindo "Ações"). Os slots `toolbar` e `footer` recebem `SearchInput` e `Pagination` existentes sem alterá-los; com `pageSlice`/`pageCount`/`pageRangeLabel` de `pageRange.ts`, buscar filtra as linhas e trocar de página troca o conteúdo da tabela.                                                                                                                                                     |
| CA-04 | Tooltip e alerta: `Tooltip` renderiza um botão com o ícone de informação (`.tip-icon`) e nome acessível próprio; o balão (`.tip-box`, `role="tooltip"`) aparece com mouse sobre o gatilho e com foco por teclado, some ao tirar o mouse, ao perder o foco e com Esc, e o conteúdo é a descrição acessível do botão (`aria-describedby`) mesmo fechado. `Alert` renderiza `.alert` nos tons `info`, `success`, `warning` e `error`, com ícone decorativo, título opcional em `<strong>` e `role="status"` (info, sucesso) ou `role="alert"` (aviso, erro).                                                                                                                                                             |
| CA-05 | Toggle e abas: `Toggle` é um `input type="checkbox"` com `role="switch"`, controlado por `checked`/`onChange`, com nome acessível, operável por clique e por Espaço, e visual `.toggle`/`.toggle-track` (trilho verde e bolinha deslocada 17px quando ligado). `Tabs` segue o padrão WAI-ARIA de abas: `tablist` com nome, `tab` com `aria-selected` e `aria-controls`, `tabpanel` com `aria-labelledby`, tabindex móvel (só a aba ativa tem `tabIndex=0`), setas esquerda/direita circulares, Home e End movem o foco e ativam a aba, e o visual segue as abas `tab-ativas`/`tab-resolvidas`, com contador opcional.                                                                                                 |
| CA-06 | Temas e entrega: os novos componentes usam só tokens `apsen-*` (sem hex solto, sem paleta padrão do Tailwind e sem `dark:`), funcionam nos temas claro e escuro pela redefinição dos tokens em `html.dark` (os tokens novos do tooltip também são redefinidos), cada componente tem o seu arquivo de teste em `components/ui/__tests__/` e todos são reexportados por `@presentation/components/ui` (`index.ts`).                                                                                                                                                                                                                                                                                                     |

## 3. UX / Fluxo de tela

Nenhuma rota, tela ou `metadata` nova: é um enabler. Os componentes serão usados pelas telas do Demand Intelligence em specs futuras.

Estados de tela (carregando, erro com "Tentar novamente", vazio, dados): não se aplicam, porque não há tela nem busca de dados. Os componentes que mostram dados cobrem os estados que lhes cabem: a `Table` tem o estado vazio (`emptyText`) e o `FormField` tem o estado de erro do campo. Carregando e erro de tela continuam com `LoadingState`/`ErrorState` (`DESIGN_SPEC.md` §3.12).

Referências: base em `docs/design/DESIGN_SPEC.md` §1 (tokens e utilities `focus-ring`, `field-focus`) e §3 (UI kit). A tabela reaproveita §3.13 e a busca e a paginação, §3.14. Esta spec cria as seções §3.15 a §3.21 do `DESIGN_SPEC.md` com as tabelas abaixo. Os números de linha (`L123`) são do protótipo. Hex do protótipo aparece aqui só para descrever o visual; o código usa os tokens.

### 3.1 `FormField`, `TextInput`, `TextArea` e `FormGrid` — `.form-*` (L157-175)

| Parte                 | Classes                                                                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| grupo (`.form-group`) | `flex flex-col gap-[5px]`; com `full`, `+ col-span-full`                                                                                                                                                          |
| rótulo                | `text-[11.5px] font-semibold uppercase tracking-[.04em] text-apsen-muted`                                                                                                                                         |
| obrigatório (`.req`)  | `<span aria-hidden="true" className="text-apsen-red"> *</span>` dentro do `label`                                                                                                                                 |
| controle (constante)  | `rounded-[6px] border border-apsen-border bg-apsen-white px-[11px] py-[8px] font-[inherit] text-[13.5px] text-apsen-slate transition-[border,box-shadow] duration-[140ms] field-focus` (igual ao do `FormSelect`) |
| input                 | constante `+ w-full read-only:bg-apsen-bg read-only:text-apsen-muted aria-[invalid=true]:border-apsen-red-b`                                                                                                      |
| textarea              | input `+ min-h-[72px] resize-y`                                                                                                                                                                                   |
| dica                  | `mt-[2px] text-[11px] text-apsen-muted-2`                                                                                                                                                                         |
| erro [derivado]       | `mt-[2px] text-[11px] text-apsen-red` (o protótipo não tem estado de erro de campo)                                                                                                                               |
| grade                 | `mb-[16px] grid gap-[13px]` + `1`: `grid-cols-1`; `2`: `grid-cols-2 max-[560px]:grid-cols-1`; `3`: `grid-cols-3 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1`                                                  |

```tsx
<FormGrid columns={2}>
  <FormField label="Descrição" required hint="Ex: Planejamento Setembro 2026" error={erro}>
    <TextInput value={descricao} onChange={setDescricao} />
  </FormField>
  <FormField label="Observações" full>
    <TextArea value={obs} onChange={setObs} />
  </FormField>
</FormGrid>
```

O `.field` (L308-320, rótulo 10.5px/700) é uma variante antiga do formulário dinâmico e fica de fora: o padrão é o `.form-group`/`.form-label`.

### 3.2 `Modal` — `.modal-*` (L255-269, markup L3184-3240)

| Parte     | Classes                                                                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| overlay   | `fixed inset-0 z-[9000] flex items-center justify-center bg-apsen-overlay`                                                                                                                                                |
| caixa     | `flex max-h-[90vh] max-w-[95vw] flex-col rounded-apsen-lg bg-apsen-white shadow-apsen-modal` + `md`: `w-[500px]`; `lg`: `w-[680px]`                                                                                       |
| cabeçalho | `flex items-center justify-between border-b border-apsen-border px-[20px] pt-[16px] pb-[13px]`; título `h3` `text-[14.5px] font-semibold text-apsen-slate`                                                                |
| fechar    | `cursor-pointer rounded-[4px] border-0 bg-transparent px-[6px] py-[2px] text-[17px] leading-none text-apsen-muted hover:bg-apsen-bg hover:text-apsen-slate focus-ring`; `aria-label="Fechar"`, conteúdo `✕` `aria-hidden` |
| corpo     | `flex flex-col gap-[13px] overflow-y-auto px-[20px] py-[18px]`                                                                                                                                                            |
| rodapé    | `flex justify-end gap-[8px] border-t border-apsen-border px-[20px] py-[12px]` (botões `Button ghost sm` "Cancelar" e a ação principal, a cargo de quem usa)                                                               |

- O fechamento pelo overlay usa `onMouseDown` com `event.target === event.currentTarget` (equivale ao `if(event.target===this)` do protótipo e não fecha ao arrastar uma seleção de dentro para fora).
- Sem portal: o `fixed` já cobre a viewport, porque nenhum ancestral do shell usa `transform`. O `body` já tem `overflow: hidden` (§1), então não há trava de rolagem.
- Foco preso [derivado]: o protótipo não trata foco. A regra fica no hook `useFocusTrap`.

### 3.3 `Table` — `.table-wrap` + `table` (L224-240), igual ao §3.13

| Parte          | Classes                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| toolbar (slot) | `mb-[13px] flex flex-wrap items-center gap-[8px]` (`.toolbar`, L245); só renderiza com `toolbar`                                                   |
| wrapper        | `overflow-x-auto rounded-apsen-lg border border-apsen-border bg-apsen-white shadow-apsen-sm`                                                       |
| table          | `w-full min-w-[560px] border-collapse` + `<caption className="sr-only">`                                                                           |
| thead tr       | `border-b border-apsen-border bg-apsen-bg`                                                                                                         |
| th             | `whitespace-nowrap px-[14px] py-[10px] text-left text-[11.5px] font-semibold tracking-[.02em]` + `headerClassName` da coluna ou `text-apsen-muted` |
| tbody tr       | `hover:bg-apsen-row-hover [&:last-child>td]:border-b-0`                                                                                            |
| td             | `border-b border-apsen-bg px-[14px] py-[12px] align-middle text-[13px]` + `className` da coluna                                                    |
| ações          | `th` "Ações" e `td` com `<ActionGroup>{actions(row)}</ActionGroup>` (`IconButton`/`IconLink` existentes)                                           |
| vazio          | `<tr><td colSpan={total} className="p-[30px] text-center text-[13px] text-apsen-muted">{emptyText}</td></tr>`                                      |
| footer (slot)  | renderizado depois do wrapper, sem classes próprias (a `Pagination` já traz as suas)                                                               |

A `Table` não pagina nem filtra: recebe as linhas já recortadas. Quem usa combina `SearchInput` (slot `toolbar`), `pageSlice`/`pageCount`/`pageRangeLabel` e `Pagination` (slot `footer`), como a lista de campanhas já faz.

### 3.4 `Tooltip` — `.tip-*` (L426-444, markup L1517 e L1634)

| Parte   | Classes                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| wrapper | `relative ml-[4px] inline-flex items-center align-middle`                                                                                                                                                                                                                                                                                                                                                                                 |
| gatilho | `inline-flex cursor-help items-center border-0 bg-transparent p-0 text-apsen-muted-2 transition-colors hover:text-apsen-blue focus-visible:text-apsen-blue focus-ring`; `InfoIcon` `size-[14px] shrink-0`                                                                                                                                                                                                                                 |
| balão   | `absolute top-[calc(100%+8px)] left-1/2 z-[9000] w-[290px] -translate-x-1/2 rounded-apsen bg-apsen-tip-bg px-[14px] py-[11px] text-left text-[12px] leading-[1.65] font-normal whitespace-normal normal-case not-italic tracking-normal text-apsen-tip-fg shadow-apsen-tip pointer-events-none [&_strong]:font-semibold [&_strong]:text-apsen-tip-strong [&_em]:not-italic [&_em]:text-apsen-tip-em`; fechado, recebe o atributo `hidden` |
| seta    | `before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[5px] before:border-transparent before:border-b-apsen-tip-bg before:content-['']`                                                                                                                                                                                                                                                               |

Tokens novos (o protótipo usa hex soltos `#1E293B`, `#CBD5E1`, `#F8FAFC`, `#7DD3FC` e a sombra `0 8px 28px rgba(0,0,0,.28)`, sem equivalente entre os tokens):

| Token                      | Claro (protótipo)            | Escuro [derivado]           |
| -------------------------- | ---------------------------- | --------------------------- |
| `--color-apsen-tip-bg`     | `#1e293b`                    | `#2b3446`                   |
| `--color-apsen-tip-fg`     | `#cbd5e1`                    | `#d5dbe5`                   |
| `--color-apsen-tip-strong` | `#f8fafc`                    | `#f8fafc`                   |
| `--color-apsen-tip-em`     | `#7dd3fc`                    | `#7dd3fc`                   |
| `--shadow-apsen-tip`       | `0 8px 28px rgba(0,0,0,.28)` | `0 8px 28px rgba(0,0,0,.6)` |

No protótipo o balão abre só com `:hover` e o wrapper é um `span`. No app [derivado] o gatilho vira `button type="button"` (focável), o balão abre também no foco e fecha com Esc (WAI-ARIA tooltip).

### 3.5 `Alert` — `.alert-*` (L291-296, markup L1579-1584)

| Parte     | Classes                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| base      | `mb-[14px] flex items-start gap-[9px] rounded-apsen border px-[14px] py-[10px] text-[12.5px] leading-[1.6]` |
| `info`    | `border-apsen-blue-light bg-apsen-blue-bg text-apsen-blue`                                                  |
| `success` | `border-apsen-green-b bg-apsen-green-bg text-apsen-success-fg`                                              |
| `warning` | `border-apsen-yellow-b bg-apsen-yellow-bg text-apsen-warning-fg`                                            |
| `error`   | `border-apsen-red-b bg-apsen-red-bg text-apsen-danger-fg` (`.alert-danger` do protótipo)                    |
| ícone     | `AlertCircleIcon` `mt-[3px] size-[14px] shrink-0` (`aria-hidden`), o mesmo nos quatro tons                  |
| título    | `<strong>{title}</strong>` antes do texto, como "**Apsen PLP Agent:**" no protótipo                         |

### 3.6 `Toggle` — `.toggle` (L272-279, markup L3225-3229)

| Parte   | Classes                                                                                                                                                                                                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label` | `relative inline-block h-[21px] w-[38px] shrink-0`                                                                                                                                                                                                                                           |
| input   | `peer absolute size-0 opacity-0` com `type="checkbox"` e `role="switch"`                                                                                                                                                                                                                     |
| trilho  | `absolute inset-0 cursor-pointer rounded-[20px] bg-apsen-border transition-all duration-[180ms] peer-checked:bg-apsen-green peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-apsen-blue peer-disabled:cursor-default peer-disabled:opacity-[.35]` |
| bolinha | `before:absolute before:top-[3px] before:left-[3px] before:size-[15px] before:rounded-full before:bg-white before:transition-all before:duration-[180ms] before:content-[''] peer-checked:before:translate-x-[17px]`                                                                         |

O texto de estado ao lado ("Rascunho"/"Ativo" no `.status-field`) fica com quem usa. O foco visível e o desabilitado são [derivado], com o mesmo padrão do `focus-ring` e da paginação.

### 3.7 `Tabs` — `#tab-ativas`/`#tab-resolvidas` (inline L2590-2606) e `.tab-line` (L397-400)

| Parte            | Classes                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| tablist          | `mb-[16px] flex border-b border-apsen-border`                                                                                         |
| tab base         | `-mb-px cursor-pointer whitespace-nowrap border-0 border-b-2 bg-transparent px-[20px] py-[9px] text-[13px] transition-all focus-ring` |
| tab inativa      | `border-transparent text-apsen-muted`                                                                                                 |
| tab ativa `blue` | `border-apsen-blue font-medium text-apsen-blue` (`.tab-line.active`, padrão)                                                          |
| tab ativa `red`  | `border-apsen-red font-medium text-apsen-red` (`#tab-ativas` das restrições)                                                          |
| contador base    | `ml-[4px] rounded-[10px] px-[7px] py-[1px] text-[10px]`                                                                               |
| contador ativo   | `bg-apsen-blue` ou `bg-apsen-red` (conforme o tom) `font-bold text-white`                                                             |
| contador inativo | `bg-apsen-border font-semibold text-apsen-muted`                                                                                      |
| painel           | `role="tabpanel"`, `tabIndex={0}`, `focus-ring`, sem classes de layout                                                                |

O segmented `.tabs-pill` (L391-396) não tem uso no markup do protótipo e fica de fora, como já registrado no §3.4 do `DESIGN_SPEC.md`.

### Textos (pt-BR)

| Componente | Texto padrão                              |
| ---------- | ----------------------------------------- |
| `Modal`    | botão de fechar com `aria-label` "Fechar" |
| `Table`    | cabeçalho da coluna de ações "Ações"      |
| demais     | todos os textos vêm por props de quem usa |

## 4. Contratos de API consumidos

Nenhum.

## 5. Domínio (`src/domain`)

Nenhum.

## 6. Aplicação (`src/application`)

Nenhum.

## 7. Infraestrutura (`src/infrastructure`)

Nenhum.

## 8. Apresentação (`src/presentation`)

Sem hooks de query, `queryKeys`, stores nem mudança em `UseCases`/`createContainer`. Tudo fica em `src/presentation/components/ui/`.

### API pública

```ts
type FormGridColumns = 1 | 2 | 3;
interface FormGridProps {
  columns?: FormGridColumns;
  children: ReactNode;
  className?: string;
}

interface FormFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  full?: boolean;
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'number' | 'date' | 'password' | 'tel' | 'url';
  placeholder?: string;
  name?: string;
  readOnly?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}
interface TextAreaProps extends Omit<TextInputProps, 'type'> {
  rows?: number;
}

type ModalSize = 'md' | 'lg';
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
}

interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  headerClassName?: string;
  className?: string;
}
interface TableProps<T> {
  caption: string;
  columns: readonly TableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  emptyText: string;
  actions?: (row: T) => ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
}

interface TooltipProps {
  label: string;
  children: ReactNode;
}

type AlertTone = 'info' | 'success' | 'warning' | 'error';
interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  'aria-label': string;
  disabled?: boolean;
  'aria-describedby'?: string;
}

type TabsTone = 'blue' | 'red';
interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}
interface TabsProps<T extends string> {
  id: string;
  'aria-label': string;
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  children: ReactNode;
  tone?: TabsTone;
}
```

### Comportamento

- **`FormField`** (`'use client'`): gera o `id` com `useId` e publica `{ id, describedBy, invalid, required }` num contexto (`FieldControlContext`). `describedBy` junta `${id}-hint` e `${id}-error` (só os presentes) e é `undefined` sem nenhum dos dois. Renderiza `label htmlFor={id}`, o filho, a dica e o erro, nessa ordem.
- **`TextInput`/`TextArea`** (`'use client'`): leem o contexto com `useFieldControl()` (exportado só pelo arquivo, não pelo índice). Dentro de um `FormField` usam `id`, `aria-describedby`, `aria-invalid` e `required` dele; fora, só as próprias props (`aria-label`). `onChange` emite `event.target.value`. Os padrões são `type="text"` e `rows={3}`.
- **`fieldClasses.ts`**: exporta `FIELD_CONTROL`, a constante de classes do controle, usada por `TextInput`, `TextArea` e `FormSelect` (RN-04).
- **`FormGrid`** (sem `'use client'`): só layout. O padrão é `columns={1}`.
- **`Modal`** (`'use client'`): com `open={false}` retorna `null`. Aberto, usa `useFocusTrap(dialogRef, onClose)`, que (a) ao montar guarda `document.activeElement` e foca o primeiro focável da caixa (pela ordem do DOM, o botão "Fechar" do cabeçalho); (b) devolve um `onKeyDown` para a caixa: Esc chama `onClose`, Tab no último focável vai para o primeiro e Shift+Tab no primeiro vai para o último; (c) ao desmontar, devolve o foco ao elemento guardado, se ele ainda estiver no documento. Os focáveis vêm da função pura `focusableElements(container)` (seletor `a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`). O padrão é `size="md"`.
- **`Table`** (sem `'use client'`, para funcionar em Server e Client Components): `th`/`td` por coluna, coluna "Ações" só com `actions`, vazio com `colSpan = columns.length + (actions ? 1 : 0)`.
- **`Tooltip`** (`'use client'`): estado interno `open` (o único estado interno do lote, RN-03). `onMouseEnter`/`onMouseLeave` no wrapper e `onFocus`/`onBlur` no botão abrem e fecham; Esc com foco no botão fecha. O balão fica sempre no DOM, com `id` de `useId`, `role="tooltip"` e `hidden` quando fechado, e o botão tem `aria-label={label}` e `aria-describedby` apontando para ele.
- **`Alert`** (sem `'use client'`): `data-tone={tone}`, `role` `alert` para `warning`/`error` e `status` para `info`/`success`. O padrão é `tone="info"`.
- **`Toggle`** (`'use client'`): `onChange(event.target.checked)`. Sem estado interno.
- **`Tabs`** (`'use client'`): ids `${id}-tab-${value}` e `${id}-panel`; cada aba tem `aria-controls="${id}-panel"` e o painel único tem `aria-labelledby` da aba ativa e renderiza `children` (o conteúdo da aba ativa, escolhido por quem usa). O teclado usa a função pura `nextTabIndex(current, total, key)` (`ArrowRight` +1 circular, `ArrowLeft` -1 circular, `Home` 0, `End` último, outra tecla `null`). Com índice novo, chama `onChange` e foca a aba (ativação automática), usando refs das abas. O contador aparece só com `count` definido (inclusive 0) e entra no nome acessível ("Ativas 8"). O padrão é `tone="blue"`.
- **`icons.tsx`**: ganha `InfoIcon` (círculo com "i", paths de L1517) e `AlertCircleIcon` (círculo com "!", paths de L1580), no mesmo formato do `EyeIcon` (`aria-hidden`, `stroke="currentColor"`, `strokeWidth="2"`).
- **`index.ts`**: reexporta `Alert`, `type AlertTone`, `AlertCircleIcon`, `FormField`, `FormGrid`, `type FormGridColumns`, `InfoIcon`, `Modal`, `type ModalSize`, `Table`, `type TableColumn`, `Tabs`, `type TabItem`, `type TabsTone`, `TextArea`, `TextInput`, `Toggle` e `Tooltip`.

## 9. Arquivos

### Novos

- `src/presentation/components/ui/FormField.tsx` — `FormField`, `FieldControlContext` e `useFieldControl`
- `src/presentation/components/ui/TextInput.tsx` — `TextInput` e `TextArea`
- `src/presentation/components/ui/fieldClasses.ts` — `FIELD_CONTROL`
- `src/presentation/components/ui/FormGrid.tsx`
- `src/presentation/components/ui/Modal.tsx`
- `src/presentation/components/ui/useFocusTrap.ts` — `useFocusTrap` e `focusableElements`
- `src/presentation/components/ui/Table.tsx`
- `src/presentation/components/ui/Tooltip.tsx`
- `src/presentation/components/ui/Alert.tsx`
- `src/presentation/components/ui/Toggle.tsx`
- `src/presentation/components/ui/Tabs.tsx`
- `src/presentation/components/ui/tabKeys.ts` — `nextTabIndex`
- `src/presentation/components/ui/__tests__/{FormField,FormGrid,Modal,Table,Tooltip,Alert,Toggle,Tabs}.test.tsx`
- `src/presentation/components/ui/__tests__/{useFocusTrap,tabKeys,uiKitSource}.test.ts`

### Modificados

- `src/presentation/components/ui/index.ts` — reexporta os componentes, ícones e tipos novos.
- `src/presentation/components/ui/icons.tsx` — adiciona `InfoIcon` e `AlertCircleIcon`.
- `src/presentation/components/ui/FormSelect.tsx` — troca a constante local `SELECT` por `FIELD_CONTROL`, com as mesmas classes (o teste atual continua passando sem mudança).
- `src/presentation/components/ui/__tests__/index.test.ts` — lista ordenada com as novas chaves (`Alert`, `AlertCircleIcon`, `FormField`, `FormGrid`, `InfoIcon`, `Modal`, `Table`, `Tabs`, `TextArea`, `TextInput`, `Toggle`, `Tooltip`).
- `src/app/globals.css` — tokens `--color-apsen-tip-bg`, `--color-apsen-tip-fg`, `--color-apsen-tip-strong`, `--color-apsen-tip-em` e `--shadow-apsen-tip` no `@theme` e redefinidos em `html.dark` (§3.4).
- `src/app/__tests__/globals.test.ts` — novo caso para os tokens do tooltip nos dois temas.
- `docs/design/DESIGN_SPEC.md` — seções §3.15 (formulário), §3.16 (modal), §3.17 (tabela genérica), §3.18 (tooltip), §3.19 (alerta), §3.20 (toggle) e §3.21 (abas), com as tabelas do §3 desta spec, e os tokens do tooltip no bloco do §1.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Cor só por token `apsen-*` (mais `white`, já usado no kit para texto sobre fundo sólido e para a bolinha do toggle). Os arquivos novos não têm hex, paleta padrão do Tailwind (`slate-N`, `gray-N`, `red-N` etc.) nem `dark:`; o tema escuro vem só de `html.dark`. |
| RN-02 | Sem dependência nova em `package.json`: só `react` e `react-dom`, que já existem. Cada arquivo novo tem até 120 linhas, não tem comentários e só começa com `'use client'` se usar hook, contexto ou handler.                                                       |
| RN-03 | Os componentes são controlados: `Modal` (`open`/`onClose`), `Toggle` (`checked`/`onChange`), `Tabs` (`value`/`onChange`) e `TextInput`/`TextArea` (`value`/`onChange`) não guardam o valor. Só o `Tooltip` tem estado interno (visibilidade).                       |
| RN-04 | Classe repetida em mais de um componente vira constante ou utility compartilhada: o controle de formulário (`FIELD_CONTROL`) é o mesmo para `TextInput`, `TextArea` e `FormSelect`.                                                                                 |
| RN-05 | Os textos fixos dos componentes estão em pt-BR ("Fechar", "Ações") e os demais vêm por props.                                                                                                                                                                       |

## 11. BDD — Cenários de teste unitário

| Cenário                                                                                                                                 | Arquivo de teste                                                                  | Asserção                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 Dado um `FormField` "Descrição" obrigatório com `TextInput`, quando renderiza, então o campo tem o nome do rótulo e é obrigatório | `src/presentation/components/ui/__tests__/FormField.test.tsx`                     | `getByRole('textbox', { name: 'Descrição' })` com `toBeRequired()`; `*` com `aria-hidden` e `text-apsen-red`; rótulo com `uppercase` e `text-[11.5px]`.                                                                                                              |
| CA-01 Dado dica e erro, quando renderiza, então os dois descrevem o campo e ele fica inválido                                           | `src/presentation/components/ui/__tests__/FormField.test.tsx`                     | `toHaveAccessibleDescription` com a dica e o erro; `aria-invalid="true"`; dica `text-[11px] text-apsen-muted-2`, erro `text-apsen-red`. Sem dica nem erro, não há `aria-describedby` nem `aria-invalid`.                                                             |
| CA-01 Dado um `TextArea` no `FormField`, quando o usuário digita, então emite o texto                                                   | `src/presentation/components/ui/__tests__/FormField.test.tsx`                     | `onChange` chamado com o valor; `min-h-[72px]` e `resize-y`; `TextInput` fora do `FormField` usa o `aria-label`; `readOnly` aplica as classes de leitura.                                                                                                            |
| CA-01 Dado `FormGrid` com 1, 2 e 3 colunas e um campo `full`, quando renderiza, então aplica a grade e os breakpoints                   | `src/presentation/components/ui/__tests__/FormGrid.test.tsx`                      | `grid-cols-1`; `grid-cols-2 max-[560px]:grid-cols-1`; `grid-cols-3 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1`; `gap-[13px]`; `FormField full` com `col-span-full`.                                                                                             |
| CA-02 Dado um `Modal` aberto com título, corpo e rodapé, quando renderiza, então é um diálogo nomeado pelo título                       | `src/presentation/components/ui/__tests__/Modal.test.tsx`                         | `getByRole('dialog', { name: 'Novo ciclo' })` com `aria-modal="true"`; corpo e rodapé presentes; `w-[500px]` em `md` e `w-[680px]` em `lg`; com `open={false}`, `queryByRole('dialog')` nulo.                                                                        |
| CA-02 Dado um `Modal` aberto, quando clica em "Fechar", aperta Esc ou clica no overlay, então chama `onClose`; clicando dentro, não     | `src/presentation/components/ui/__tests__/Modal.test.tsx`                         | `onClose` uma vez por caso; clique no corpo não chama.                                                                                                                                                                                                               |
| CA-02 Dado um `Modal` aberto a partir de um botão, quando navega com Tab e fecha, então o foco fica preso e volta ao botão              | `src/presentation/components/ui/__tests__/Modal.test.tsx`, `useFocusTrap.test.ts` | Primeiro focável recebe foco ao abrir; Tab no último volta ao primeiro; Shift+Tab no primeiro vai ao último; ao fechar (rerender com `open={false}`), o botão de origem tem foco; `focusableElements` ignora `disabled` e `tabindex="-1"`.                           |
| CA-03 Dado colunas, linhas e `actions`, quando renderiza, então mostra caption, cabeçalhos, células e ações                             | `src/presentation/components/ui/__tests__/Table.test.tsx`                         | `getByRole('table', { name })`; `columnheader` com `scope="col"` incluindo "Ações"; uma `row` por item mais o cabeçalho; `IconButton` dentro do `ActionGroup`; `headerClassName` aplicado.                                                                           |
| CA-03 Dado `rows` vazio, quando renderiza, então mostra o estado vazio em uma célula que ocupa todas as colunas                         | `src/presentation/components/ui/__tests__/Table.test.tsx`                         | Texto de `emptyText`; `colSpan` igual a colunas + 1 com `actions` e igual às colunas sem `actions`; `p-[30px]`.                                                                                                                                                      |
| CA-03 Dado `Table` com `SearchInput` no `toolbar` e `Pagination` no `footer`, quando busca e troca de página, então as linhas mudam     | `src/presentation/components/ui/__tests__/Table.test.tsx`                         | Harness com `useState` + `pageSlice`/`pageCount`/`pageRangeLabel`: digitar filtra as linhas; clicar em "Próxima página" mostra a página 2 e "Mostrando a–b de n" muda.                                                                                               |
| CA-04 Dado um `Tooltip`, quando o mouse entra e sai, então o balão aparece e some                                                       | `src/presentation/components/ui/__tests__/Tooltip.test.tsx`                       | `user.hover` → `getByRole('tooltip')` visível; `user.unhover` → oculto (`hidden`).                                                                                                                                                                                   |
| CA-04 Dado um `Tooltip`, quando recebe foco por Tab e depois Esc ou blur, então abre e fecha, e o conteúdo é a descrição do botão       | `src/presentation/components/ui/__tests__/Tooltip.test.tsx`                       | `getByRole('button', { name: 'Ajuda sobre verba' })` com `toHaveAccessibleDescription(conteúdo)` mesmo fechado; Tab abre; Esc fecha; Tab para fora fecha; balão com `bg-apsen-tip-bg` e `w-[290px]`.                                                                 |
| CA-04 Dado `Alert` em cada tom, quando renderiza, então aplica o tom e o papel acessível                                                | `src/presentation/components/ui/__tests__/Alert.test.tsx`                         | `info`/`success` com `role="status"` e `warning`/`error` com `role="alert"`; classes de cada tom (`bg-apsen-blue-bg`, `bg-apsen-green-bg`, `bg-apsen-yellow-bg`, `bg-apsen-red-bg`); ícone `aria-hidden`; `title` em `<strong>`; padrão `info`.                      |
| CA-05 Dado um `Toggle` desligado, quando clica ou aperta Espaço, então emite o novo estado sem mudar sozinho                            | `src/presentation/components/ui/__tests__/Toggle.test.tsx`                        | `getByRole('switch', { name })` não marcado; `onChange(true)` no clique e no Espaço; continua desmarcado até o rerender com `checked`; `disabled` não emite; trilho com `peer-checked:bg-apsen-green`.                                                               |
| CA-05 Dado `Tabs` com "Ativas" e "Resolvidas", quando renderiza, então segue o padrão WAI-ARIA                                          | `src/presentation/components/ui/__tests__/Tabs.test.tsx`                          | `tablist` nomeado; aba ativa com `aria-selected="true"` e `tabIndex=0`, a outra com `-1`; `aria-controls` aponta para o `tabpanel`, que tem `aria-labelledby` da ativa; contador no nome ("Ativas 8"); tom `red` com `border-apsen-red`.                             |
| CA-05 Dado `Tabs` com foco na aba ativa, quando aperta setas, Home e End ou clica, então troca e foca a aba                             | `src/presentation/components/ui/__tests__/Tabs.test.tsx`, `tabKeys.test.ts`       | `onChange` com o valor certo e foco na aba nova; seta circular nas pontas; `nextTabIndex` devolve `null` para outras teclas.                                                                                                                                         |
| CA-06 Dado os tokens do tooltip, quando lê o `globals.css`, então existem nos dois temas                                                | `src/app/__tests__/globals.test.ts`                                               | `--color-apsen-tip-bg: #1e293b;` no `@theme` e `--color-apsen-tip-bg: #2b3446;` em `html.dark`, e o mesmo para `tip-fg`, `tip-strong`, `tip-em` e `--shadow-apsen-tip`.                                                                                              |
| CA-06 Dado o índice do kit, quando importa, então reexporta os novos componentes                                                        | `src/presentation/components/ui/__tests__/index.test.ts`                          | Lista ordenada de chaves com as 12 novas.                                                                                                                                                                                                                            |
| CA-06 / RN-01 Dado os arquivos novos, quando lê o código-fonte, então só há tokens `apsen-*`                                            | `src/presentation/components/ui/__tests__/uiKitSource.test.ts`                    | Nenhum `#[0-9a-fA-F]{3,8}`, nenhum `dark:` e nenhuma cor da paleta padrão (`/(bg                                                                                                                                                                                     | text | border)-(slate | gray | zinc | neutral | red | green | blue | yellow | amber | emerald)-\d/`) nos arquivos novos. |
| CA-06 Dado `html.dark`, quando abre um harness com os componentes, então nada fica ilegível                                             | QA visual no navegador (como na fase 5)                                           | Screenshot claro e escuro com campo, modal, tabela, tooltip aberto, os 4 alertas, toggle e abas.                                                                                                                                                                     |
| RN-02 Dado os arquivos novos, quando lê o código-fonte, então respeitam tamanho, comentários e `'use client'`                           | `src/presentation/components/ui/__tests__/uiKitSource.test.ts`                    | Até 120 linhas por arquivo; sem `//` nem `/*`; `'use client'` presente em `FormField`, `TextInput`, `Modal`, `Tooltip`, `Toggle` e `Tabs` e ausente em `FormGrid`, `Table` e `Alert`; `package.json` sem nenhuma dependência além das de hoje (lista fixa no teste). |
| RN-03 Dado `Modal`, `Toggle` e `Tabs` controlados, quando o usuário interage, então só emitem eventos                                   | `Modal.test.tsx`, `Toggle.test.tsx`, `Tabs.test.tsx`                              | Após Esc o diálogo continua aberto até o pai mudar `open`; o toggle não muda sem `checked`; a aba ativa não muda sem `value`.                                                                                                                                        |
| RN-04 Dado `TextInput`, `TextArea` e `FormSelect`, quando renderizam, então usam as mesmas classes de controle                          | `FormField.test.tsx`, `FormSelect.test.tsx` (atual, sem mudança)                  | Os três têm `px-[11px] py-[8px] text-[13.5px] rounded-[6px] border-apsen-border field-focus`.                                                                                                                                                                        |
| RN-05 Dado `Modal` e `Table` com ações, quando renderizam, então os textos fixos estão em pt-BR                                         | `Modal.test.tsx`, `Table.test.tsx`                                                | `getByRole('button', { name: 'Fechar' })` e `getByRole('columnheader', { name: 'Ações' })`.                                                                                                                                                                          |
