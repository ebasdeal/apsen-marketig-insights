---
status: REVIEW
fase: 8
area: platform
feature: prototipo-ui-kit
azure-devops-work-item: 39014
---

# UI kit do protótipo Demand Intelligence (onda 1)

## 1. Overview

Complemento do enabler 39014: entram em `@presentation/components/ui` os componentes **genéricos** marcados como NOVO no `docs/prototipo/INVENTARIO.md` §4, as extensões dos componentes existentes listadas ali e os tokens `apsen-*` das cores do protótipo que ainda não têm token (inventário §4, última subseção), nos temas claro e escuro. Entram também os itens de ARQUITETURA §7 que são de UI kit: seletor de tamanho de página na `Pagination`, skeletons de carregamento, diálogo de confirmação, estado "Salvando…" do botão, foco no primeiro campo inválido e guarda de alterações não salvas.

Continua as fases 6 ([ui-kit-base](ui-kit-base.md)) e 7 ([prototipo-plataforma](prototipo-plataforma.md), que já trouxe `RoleSwitcher`, `AccessDenied` e `Toast`/`ToastProvider`). APIs existentes continuam compatíveis, salvo o `FormSelect` (§8.2, sem uso hoje em `src/`). Nenhuma tela, rota ou dado: é um enabler, consumido pelas ondas 2–5.

**Componentes NOVO deixados para as specs dos módulos** (dependem de regra ou dado de um módulo):

| Componente                                                                                                | Onda / spec  |
| --------------------------------------------------------------------------------------------------------- | ------------ |
| `DynamicFieldsCard`, `DriverListItem`, `DriverTypeBadge` (mapa tipo → `CategoryTag`), `SelectedTypeBadge` | 2 — drivers  |
| `ApprovalCard`, `EditableParamsTable`                                                                     | 3 — admin    |
| `AnalysisCard`, `ImpactRow`, `ChatPanel`                                                                  | 5 — análises |

`RoleSwitcher`, `AccessDenied` e `ToastProvider` já estão na fase 7.

**Perguntas em aberto / desvios registrados:**

1. **Modal 620/720**: o inventário pede essas larguras, mas no protótipo a `.modal` fixa `width:500px` e o inline só troca o `max-width` (`modal-fonte` L3469 `max-width:620px`, `modal-cat-drivers` L3570 `max-width:720px`). A largura renderizada continua 500 px (`md`), e o único com 720 é o `modal-cat-drivers`, órfão e não portado (ARQUITETURA §5 #13). Por isso o `Modal` **não ganha tamanhos novos**: `modal-fonte` usa `size="md"`.
2. **Badge `lg`** já existe (status do cabeçalho da análise, com borda e sem ponto). O badge "{n} pendentes" do cabeçalho de aprovações (L1818) é outro visual (12.5px, padding 5/13, com ponto, sem borda) e vira `size="xl"`.
3. **Section `tone`**: a variante `detail` já tem o título laranja do `.analise-section-title`; nada muda além da prop explícita `tone` (§8.2).
4. **Tooltip rico**: o `Tooltip` já recebe `children: ReactNode`; a extensão é só garantir `strong`/`em`/`br`, uso dentro de `th` e fora do `<label>` (prop `tip` do `FormField`), sem mudar a API.
5. **Debounce do autocomplete**: o protótipo usa 250 ms (L7108); ARQUITETURA §7.1 manda 300 ms. Padrão 300 ms.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | Extensões de formulário: `FormGrid columns={4}` (`.fg-4`, com 2 colunas até 800 px e 1 até 560 px); `FormField` aceita `label: ReactNode` e `tip?: ReactNode` (renderizado ao lado do `<label>`, fora dele, para não entrar no nome acessível do campo); `TextInput` aceita `min`, `max`, `step`, `inputMode` e `ref`; `FormSelect` aceita `groups` (optgroup), `placeholder` (opção `""` selecionável), `disabled`, usa o `id`/`aria-describedby`/`required`/`aria-invalid` do `FormField` e emite `T \| ''`. |
| CA-02 | Botões: variantes `orange` e `red` (sólidas, sem hover, como os inline do protótipo), prop `dashed` (borda tracejada) em `Button`/`ButtonLink`, e `loading`/`loadingLabel` no `Button` (desabilitado, `aria-busy="true"`, texto "Salvando…" por padrão). `IconButton` aceita `tone` `blue` (padrão), `red`, `teal` e `green` com os hovers de `.action-btn` e o desabilitado `opacity-[.3]`.                                                                                                                   |
| CA-03 | Extensões visuais: `CardTitle` com `step` (pílula "01") e `stepTone` `blue`/`orange`; `Section` com `tone` explícito; `Badge size="xl"`; `Tabs` com `tone` e `countTone` por item (Ativas vermelha com contador sempre vermelho, Resolvidas azul com contador sempre cinza, L2590–2606, L6418–6431).                                                                                                                                                                                                           |
| CA-04 | `Pagination` ganha seletor de tamanho (`pageSize`, `pageSizeOptions` padrão 10/25/50, `onPageSizeChange`) rotulado "Itens por página", e a variante `centered` da Fila de Aprovação ("Página X de Y", botões redondos de 30 px sem borda, L381–388, L4219–4227).                                                                                                                                                                                                                                               |
| CA-05 | Componentes de estrutura: `Breadcrumb` (trilha interna + "← Voltar"), `CardSectionLabel`, `FormActions`, `Toolbar` (com slot `right`), `FilterBar`, `StatusField`, `CodeBlock`, `NumberedList`, com as medidas do §3. A `Table` passa a usar `Toolbar` no slot `toolbar`.                                                                                                                                                                                                                                      |
| CA-06 | Componentes de seleção: `ChipMultiSelect` (chips com `aria-pressed`), `ModeSelector` (radiogroup de botões-cartão em 3 tamanhos e accent `blue`/`orange`), `RangeSlider` (accent `blue`/`purple`, valor formatado ao lado), `SelectableCard` (radio em cartão com check), `CheckboxCard` (variantes `plain`/`muted`), todos controlados e operáveis por teclado.                                                                                                                                               |
| CA-07 | `Autocomplete` (`.ac-*`, L495–510, L7065–7149): combobox WAI-ARIA com debounce (300 ms), estados "⟳ {loadingText}", vazio "Nenhum resultado. Você pode digitar um valor novo.", mensagem de bloqueio (`disabledMessage`, ex.: "⚠️ Selecione primeiro o laboratório."), itens com etiqueta e rodapé "{n} resultado(s) · Fonte: {sourceLabel}"; setas, Enter e Esc; clique fora fecha; aceita texto livre.                                                                                                       |
| CA-08 | Componentes de dados: `ColorPill` (variantes `outlined` e `soft`, 8 cores categóricas), `CategoryTag` (14 tons `db-*`, L410–423), `PendingItemRow` (L4987–4992), `StatusDistributionRow` (L5005–5011).                                                                                                                                                                                                                                                                                                         |
| CA-09 | Skeletons: `Skeleton`, `SkeletonText`, `TableSkeleton`, `CardSkeleton` e `PageSkeleton` só com tokens, `aria-hidden` nos blocos e um `role="status"` "Carregando…" por skeleton, animação só com `motion-safe`. `src/app/loading.tsx` usa `PageSkeleton`.                                                                                                                                                                                                                                                      |
| CA-10 | `ConfirmDialog` (sobre o `Modal`) com título, mensagem, "Cancelar" e ação (`danger` por padrão) com estado de envio; `focusFirstInvalid(container)` foca o primeiro controle com `aria-invalid="true"`; `useUnsavedChangesGuard(dirty)` avisa no `beforeunload` e, ao clicar num link interno com o formulário sujo, abre o `ConfirmDialog` "Sair sem salvar?" / "Há alterações não salvas. Deseja sair mesmo assim?" e só navega ao confirmar.                                                                |
| CA-11 | Tokens novos do §10 (RN-06) existem no `@theme` e em `html.dark`, estão documentados no `DESIGN_SPEC.md` §1 e nenhum arquivo de `src/` tem hex, `rgba(` em classe ou paleta padrão do Tailwind (`designTokensSource`).                                                                                                                                                                                                                                                                                         |
| CA-12 | Todo componente novo tem teste em `components/ui/__tests__/`, é reexportado por `index.ts`, tem até 120 linhas, sem comentários, e só usa `'use client'` quando há estado, efeito, contexto ou handler.                                                                                                                                                                                                                                                                                                        |

## 3. UX / Fluxo de tela

Sem rota, tela ou `metadata`. Estados de tela não se aplicam: os componentes cobrem os estados que lhes cabem (skeletons para carregando, `Autocomplete` com carregando/vazio/bloqueado, `ConfirmDialog` com envio, `Pagination` com pontas desabilitadas). Textos fixos em pt-BR. Esta spec cria as seções §3.22 a §3.45 do `DESIGN_SPEC.md` com as tabelas abaixo e atualiza §3.1, §3.2, §3.5, §3.6, §3.14, §3.15, §3.18, §3.21.

### 3.1 Extensões

| Componente                               | Mudança                                                                                                                                                                              | Classes / comportamento                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FormGrid` (L160–163)                    | `columns: 1 \| 2 \| 3 \| 4`                                                                                                                                                          | `4`: `grid-cols-4 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `FormField`                              | `label: ReactNode`, `tip?: ReactNode`, `labelClassName?`                                                                                                                             | linha `flex items-center` com `<label>` + `tip`; `small` dentro do label (ex.: "(máx. 1 ano da data início)", L733) fica `text-[11px] font-normal normal-case text-apsen-muted` por conta de quem usa                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `TextInput`                              | `min?`, `max?`, `step?: number \| string`, `inputMode?`, `ref` (React 19 `ref` como prop)                                                                                            | repassados ao `input`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `FormSelect`                             | `options?`, `groups?: readonly { label: string; options: readonly SelectOption<T>[] }[]`, `placeholder?`, `disabled?`, `'aria-label'?`, `value: T \| ''`, `onChange(value: T \| '')` | `placeholder` vira `<option value="">` no topo; grupos depois das opções soltas; `disabled:cursor-default disabled:bg-apsen-bg disabled:text-apsen-muted` [derivado]                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `Button` (L180–199, inline L2249, L2564) | `orange`: `border-apsen-orange bg-apsen-orange text-white`; `red`: `border-apsen-red bg-apsen-red text-white`; `dashed` → `border-dashed`; `loading`                                 | `loading`: `disabled`, `aria-busy="true"`, conteúdo = `loadingLabel` ("Salvando…")                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `IconButton` (L234–240)                  | `tone`                                                                                                                                                                               | `blue` (atual); `red`: `hover:bg-apsen-red-bg hover:text-apsen-red`; `teal`: `hover:bg-apsen-teal-bg hover:text-apsen-teal`; `green`: `text-apsen-green hover:bg-apsen-blue-bg` (L6464: o inline verde vence o hover); todos `disabled:cursor-default disabled:opacity-[.3] disabled:hover:bg-transparent`                                                                                                                                                                                                                                                                                                             |
| `CardTitle` (L709, L2898)                | `step?: string`, `stepTone?: 'blue' \| 'orange'`                                                                                                                                     | pílula antes do título: `rounded-[6px] px-[10px] py-[2px] text-[11px] font-bold` + `bg-apsen-blue-bg text-apsen-blue` ou `bg-apsen-orange-soft text-apsen-orange`                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `Section`                                | `tone?: 'muted' \| 'orange'`                                                                                                                                                         | padrão `muted` em `panel` e `orange` em `detail` (visual atual)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Badge` (L1818)                          | `size="xl"`                                                                                                                                                                          | `gap-[5px] px-[13px] py-[5px] text-[12.5px] font-medium` + ponto do `md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `Tabs`                                   | `TabItem.tone?: TabsTone`, `TabItem.countTone?: 'blue' \| 'red' \| 'gray'`                                                                                                           | `tone` do item vence o da lista; com `countTone`, o contador usa sempre esse tom (`red`/`blue`: `bg-apsen-{tom} font-bold text-white`; `gray`: `bg-apsen-border font-semibold text-apsen-muted`)                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `Tooltip`                                | sem mudança de API                                                                                                                                                                   | conteúdo rico (`strong`, `em`, `br`) e uso dentro de `th`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `Pagination`                             | `variant?: 'range' \| 'centered'`, `pageSize?`, `pageSizeOptions?` (padrão `PAGE_SIZES`), `onPageSizeChange?`                                                                        | seletor só com `onPageSizeChange`: `FormSelect` `w-auto` com `aria-label="Itens por página"`, à esquerda do grupo de botões; `centered` (`.pag`): `nav` `flex flex-wrap items-center justify-center gap-[5px] pt-[16px] pb-[2px]`, info "Página X de Y" `mr-[6px] text-[12px] text-apsen-muted`, número `h-[30px] min-w-[30px] rounded-full border-0 bg-transparent text-[13px] text-apsen-muted hover:bg-apsen-blue-bg hover:text-apsen-blue`, atual `bg-apsen-blue font-semibold text-white`, ‹ › `rounded-[6px] px-[8px] text-[14px]`, reticências sem hover; `totalPages <= 1` não renderiza na `centered` (L4217) |
| `Table`                                  | slot `toolbar` renderizado por `Toolbar`                                                                                                                                             | mesmas classes de hoje                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### 3.2 Estrutura

| Componente         | Origem                             | Classes                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Breadcrumb`       | L1644–1649, L2148–2153, L2885–2890 | `nav aria-label="Trilha da página"`: `mb-[10px] flex items-center gap-[5px] text-[12.5px] text-apsen-muted`; item com `href` = `TextLink` `table` (L1645) ou `crumb` (L2886, prop `linkVariant`); separador `ChevronRightIcon` `size-[11px]`; atual `font-medium text-apsen-slate` com `aria-current="page"`; com `backHref`: `ButtonLink ghost sm` `mb-[16px]` `backLabel` (padrão "← Voltar")                                                                                  |
| `CardSectionLabel` | L151–154                           | `mb-[13px] flex items-center gap-[6px] border-b-2 border-apsen-blue-bg pt-[12px] pb-[8px] text-[10.5px] font-bold uppercase tracking-[.08em] text-apsen-blue` (`h3`)                                                                                                                                                                                                                                                                                                             |
| `FormActions`      | L176–177                           | `flex justify-end gap-[8px] border-t border-apsen-border pt-[14px]`                                                                                                                                                                                                                                                                                                                                                                                                              |
| `Toolbar`          | L245–246                           | `mb-[13px] flex flex-wrap items-center gap-[8px]`; `right`: `ml-auto flex gap-[6px]`                                                                                                                                                                                                                                                                                                                                                                                             |
| `FilterBar`        | L1830–1833                         | `role="search"` + `aria-label`; `mb-[16px] grid items-end gap-[10px] rounded-apsen-lg border border-apsen-border bg-apsen-white px-[16px] py-[14px]` + `columnsClassName` (padrão `grid-cols-[1fr_auto_auto_auto_auto]`) + `max-[800px]:grid-cols-2 max-[560px]:grid-cols-1` [derivado]                                                                                                                                                                                          |
| `StatusField`      | L282–288, L1789–1801               | `flex items-center justify-between gap-[14px] rounded-apsen border border-apsen-border bg-apsen-bg px-[14px] py-[11px]`; título `strong text-[13px] font-medium text-apsen-slate`; descrição `mt-[2px] block text-[11.5px] text-apsen-muted`; controle `flex shrink-0 items-center gap-[9px]`; etiqueta `text-[12px] font-medium` verde (`onLabel`, padrão "Ativo") ou muted (`offLabel`, padrão "Inativo"); `Toggle` com `aria-label` = título e `aria-describedby` = descrição |
| `CodeBlock`        | L351–353                           | `pre` `max-h-[360px] overflow-y-auto whitespace-pre rounded-apsen bg-apsen-code-bg p-[14px] font-mono text-[11.5px] leading-[1.5] text-apsen-code-fg`, `tabIndex={0}`, `aria-label`, prop `maxHeightClassName`                                                                                                                                                                                                                                                                   |
| `NumberedList`     | L470–471, L5268                    | `ol role="list"`; item `border-b border-apsen-bg py-[7px] text-[13px] leading-[1.6] last:border-b-0`; número `mr-[6px] font-bold text-apsen-orange` "{n}." `aria-hidden`                                                                                                                                                                                                                                                                                                         |

### 3.3 Seleção

| Componente        | Origem                                                | Classes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChipMultiSelect` | L215–221, L1474–1492, L2201–2212                      | grupo e rótulo iguais ao `ChipGroup` (com `hideLabel` e `tip`), lista `mt-[4px] flex flex-wrap gap-[5px]` com `role="group"`; chip = classes do `ChipGroup` (`.chip`/`.chip.sel`), `button aria-pressed`; `disabled` → `cursor-default` e sem clique (modo visualizar do driver)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `ModeSelector`    | L742–770 (`lg`), L2948–2955 (`md`), L3503–3511 (`sm`) | `role="radiogroup"` `flex gap-[8px]`; opção `button role="radio"` `flex flex-1 cursor-pointer flex-col items-center gap-[3px] rounded-apsen border-2 font-[inherit] transition-all duration-[150ms] focus-ring`; inativa `border-apsen-border bg-apsen-white text-apsen-muted`; ativa `border-apsen-{accent} bg-apsen-{accent} text-white`; `lg`: `px-[16px] py-[12px] text-[13px] font-semibold`, ícone `text-[18px]`, descrição `text-[11px] font-normal opacity-[.85]`; `md`: `px-[8px] py-[11px]`, rótulo `text-[12px] font-semibold`, descrição `text-[10px] opacity-[.85]`; `sm`: `p-[10px] text-[12.5px] font-semibold`, ícone inline antes do rótulo, sem descrição                                                                                                                                                     |
| `RangeSlider`     | L336–338, L1498–1502, L2516–2520                      | linha `flex items-center` + `blue`: `mt-[3px] gap-[10px]`, `purple`: `mt-[4px] gap-[12px]`; `input type="range"` `flex-1 accent-apsen-{accent}`; valor `text-[15px] font-bold text-apsen-{accent}` + `blue`: `min-w-[18px]`, `purple`: `min-w-[44px]`; `aria-valuetext` = `format(value)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `SelectableCard`  | L474–477, L5196–5202                                  | `button role="radio"` `relative cursor-pointer rounded-[10px] border-2 border-apsen-border bg-apsen-bg p-[14px] text-left transition-all hover:border-apsen-orange focus-ring`; selecionado `border-apsen-orange bg-apsen-orange-soft`; check `absolute top-[10px] right-[10px] flex size-[18px] items-center justify-center rounded-full border-2 border-apsen-border bg-apsen-white text-[10px]` → selecionado `border-apsen-orange bg-apsen-orange text-white` "✓"; ícone `mb-[5px] text-[20px]`; título `mb-[3px] text-[13px] font-semibold text-apsen-slate`; descrição `text-[12px] leading-[1.5] text-apsen-muted`; tag `mt-[5px] inline-block rounded-[8px] border border-apsen-orange-b bg-apsen-orange-soft px-[7px] py-[1px] text-[10.5px] font-semibold text-apsen-orange`. Quem usa envolve em `role="radiogroup"` |
| `CheckboxCard`    | L5152–5156 (`plain`), L5170–5175 (`muted`)            | `label` `flex cursor-pointer items-center gap-[10px] border border-apsen-border`; `plain`: `mb-[5px] rounded-[6px] bg-apsen-white px-[12px] py-[9px]`; `muted`: `mb-[6px] rounded-apsen bg-apsen-bg px-[12px] py-[10px]`; checkbox `size-[15px] shrink-0 accent-apsen-orange`; corpo `flex-1`: título `text-[13px] font-medium`, subtítulo `text-[11.5px] text-apsen-muted` (+ `mt-[2px]` no `muted`); `aside` à direita                                                                                                                                                                                                                                                                                                                                                                                                        |

### 3.4 `Autocomplete` — L495–510, L5726–5734, L7065–7149

| Parte                          | Classes                                                                                                                                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| wrapper                        | `relative`                                                                                                                                                                                                                        |
| input                          | `TextInput` com `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`, `autoComplete="off"`                                                                                    |
| lista                          | `absolute top-full right-0 left-0 z-50 mt-[2px] max-h-[220px] overflow-y-auto rounded-apsen border border-apsen-border bg-apsen-white shadow-apsen-dropdown`, `role="listbox"`                                                    |
| item                           | `role="option"` `flex cursor-pointer items-center gap-[8px] border-b border-apsen-bg px-[12px] py-[9px] text-[13px] transition-[background] duration-100 last:border-b-0 hover:bg-apsen-blue-bg aria-selected:bg-apsen-blue-bg`   |
| etiqueta                       | `ml-auto shrink-0 rounded-[8px] bg-apsen-bg px-[7px] py-[1px] text-[10px] font-semibold text-apsen-muted` (`itemTag`, ex.: "Laboratório", "Marca")                                                                                |
| carregando / vazio / bloqueado | `p-[12px] text-center text-[12.5px] text-apsen-muted`: "⟳ {loadingText}" (padrão "Consultando..."), "Nenhum resultado. Você pode digitar um valor novo.", `disabledMessage`                                                       |
| fonte                          | `flex items-center gap-[5px] border-t border-apsen-border bg-apsen-bg px-[12px] py-[6px] text-[10.5px] text-apsen-muted` com ícone de pulso 10 px: "{n} resultado(s) · Fonte: {sourceLabel}" ou, no vazio, "Fonte: {sourceLabel}" |

Abre no foco e ao digitar; com `disabledMessage` abre mostrando só a mensagem e não busca; busca `search(term)` após `debounceMs` (padrão 300), descartando respostas antigas; setas movem o destaque, Enter escolhe, Esc fecha; clique fora fecha; texto digitado é o valor (`allowFreeText`, padrão `true`).

### 3.5 Dados

| Componente              | Origem                                | Classes                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ColorPill`             | `outlined`: L6698–6699; `soft`: L7625 | `outlined`: `inline-flex w-fit items-center whitespace-nowrap rounded-[10px] border px-[9px] py-[2px] text-[11.5px] font-semibold` + `text-apsen-pal-{c} bg-apsen-pal-{c}/[9.4%] border-apsen-pal-{c}/[18.8%]`; `soft`: `rounded-[6px] px-[9px] py-[2px] text-[11px] font-bold` + `text-apsen-pal-{c} bg-apsen-pal-{c}/[8.2%]`. Cores: `blue`, `purple`, `cyan`, `amber`, `emerald`, `red`, `lime`, `slate` (fallback `#64748B`). O "● " do plano vem no `children` |
| `CategoryTag`           | L345–346, L410–423                    | `inline-block rounded-[4px] border px-[8px] py-[2px] text-[10.5px] font-bold`; tons: `tv`, `digital`, `pdv`, `conc`, `sazo`, `viral` (tokens `cat-*` novos), `campo` (blue-bg/blue-light/blue), `medico`, `canal`, `macro` (purple-bg/purple-b/purple), `preco` (red-bg/red-b/red), `supply` (orange-bg/orange-b/orange), `reg` (teal-bg/teal-light/teal), `outro` (bg/border/muted)                                                                                |
| `PendingItemRow`        | L4987–4992                            | `flex items-center gap-[10px] border-b border-apsen-bg py-[8px] text-[13px] last:border-b-0`; código `min-w-[95px] font-mono text-[11px] font-semibold text-apsen-blue`; `flex-1`: título `text-[12.5px] font-medium`, subtítulo `text-[11.5px] text-apsen-muted`; ação `ButtonLink ghost sm` com `px-[8px] py-[2px] text-[11px]` (`actionLabel`, `actionHref`)                                                                                                     |
| `StatusDistributionRow` | L5005–5011                            | `mb-[10px] flex items-center gap-[10px]`; bolinha `size-[9px] shrink-0 rounded-full`; rótulo `flex-1 text-[13px]`; contagem `text-[13px] font-semibold`; trilho `role="meter"` `h-[5px] w-[70px] overflow-hidden rounded-[3px] bg-apsen-bg` com fill `h-full` na largura `pct%`; percentual `min-w-[28px] text-right text-[11px] text-apsen-muted` "{pct}%"; tom `green`/`orange`/`red`/`muted` pinta bolinha, contagem e fill                                      |

### 3.6 Carregamento, confirmação e formulários [derivado, ARQUITETURA §7]

| Componente                                | Classes / comportamento                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Skeleton`                                | `rounded-[6px] bg-apsen-border motion-safe:animate-pulse` + `className` de tamanho; `aria-hidden`                                                                                                                                                                                                                                                                                                                     |
| `SkeletonText`                            | `lines` barras `h-[12px]` com `gap-[8px]`, a última com `w-3/5`                                                                                                                                                                                                                                                                                                                                                       |
| `TableSkeleton`                           | wrapper da `Table` (`overflow-x-auto rounded-apsen-lg border … shadow-apsen-sm`), cabeçalho `bg-apsen-bg h-[38px]`, `rows` (padrão 10) linhas de `h-[45px]` com `columns` barras                                                                                                                                                                                                                                      |
| `CardSkeleton`                            | `surface` + barra de título `h-[14px] w-[180px]` + `SkeletonText`                                                                                                                                                                                                                                                                                                                                                     |
| `PageSkeleton`                            | `PageHeader` falso (título `h-[22px] w-[260px]`, sub `h-[14px] w-[360px]`), bloco `ScreenDesc` `h-[58px]` e um `CardSkeleton`; envolve tudo em `div role="status" aria-label="Carregando…" aria-busy="true"`                                                                                                                                                                                                          |
| `ConfirmDialog`                           | `Modal size="md"` com a mensagem em `p text-[13px] text-apsen-slate-3`; rodapé `Button ghost sm` "Cancelar" + `Button sm` da ação (`tone` `danger` → variante `red`, `primary` → `primary`) com `loading` (`pending`); Esc/overlay fecham só quando não está enviando                                                                                                                                                 |
| `useUnsavedChangesGuard(dirty, options?)` | com `dirty`: `beforeunload` com `preventDefault`; captura (`click`, fase de captura) em `a[href]` interno sem `target` e sem modificador: cancela e abre o `ConfirmDialog` "Sair sem salvar?" / "Há alterações não salvas. Deseja sair mesmo assim?" / "Sair" (`tone="danger"`); confirmar → `router.push(href)`. Devolve `{ dialog: ReactNode; confirmLeave(href) }` para botões "Cancelar"/"← Voltar" programáticos |
| `focusFirstInvalid(container)`            | foca o primeiro `[aria-invalid="true"]` em ordem de DOM e devolve se achou                                                                                                                                                                                                                                                                                                                                            |

## 4. Contratos de API consumidos

Nenhum. O `Autocomplete` recebe `search(term): Promise<readonly AutocompleteItem[]>` de quem usa (os módulos consultam a API com limite, ARQUITETURA §7.1).

## 5. Domínio (`src/domain`)

Nenhum (o mapa tipo → `CategoryTone` e as regras de % ficam nos módulos; `PAGE_SIZES` vem de `domain/shared/Page.ts`, fase 7).

## 6. Aplicação (`src/application`)

Nenhum.

## 7. Infraestrutura (`src/infrastructure`)

Nenhum.

## 8. Apresentação (`src/presentation`)

Sem hooks de query, `queryKeys`, stores nem mudança em `UseCases`/`createContainer`. Tudo em `src/presentation/components/ui/`.

### 8.1 API pública (novos)

```ts
interface BreadcrumbItem {
  label: string;
  href?: string;
}
interface BreadcrumbProps {
  items: readonly BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  linkVariant?: 'table' | 'crumb';
}

function CardSectionLabel(props: { children: ReactNode }): JSX.Element;
function FormActions(props: { children: ReactNode; className?: string }): JSX.Element;
function Toolbar(props: { children: ReactNode; right?: ReactNode }): JSX.Element;
interface FilterBarProps {
  'aria-label': string;
  children: ReactNode;
  columnsClassName?: string;
}

interface StatusFieldProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  disabled?: boolean;
}
interface CodeBlockProps {
  children: string;
  'aria-label': string;
  maxHeightClassName?: string;
}
interface NumberedListProps {
  items: readonly ReactNode[];
  'aria-label'?: string;
}

interface ChipMultiSelectProps<T extends string> {
  label: string;
  options: readonly ChipOption<T>[];
  selected: readonly T[];
  onChange: (next: T[]) => void;
  disabled?: boolean;
  hideLabel?: boolean;
  tip?: ReactNode;
}
interface ModeOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
  description?: string;
}
interface ModeSelectorProps<T extends string> {
  'aria-label': string;
  options: readonly ModeOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accent?: 'blue' | 'orange';
  size?: 'lg' | 'md' | 'sm';
  disabled?: boolean;
}
interface RangeSliderProps {
  'aria-label': string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  accent?: 'blue' | 'purple';
  format?: (value: number) => string;
  disabled?: boolean;
}
interface SelectableCardProps {
  title: string;
  description?: string;
  icon?: string;
  tag?: string;
  selected: boolean;
  onSelect: () => void;
}
interface CheckboxCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
  variant?: 'plain' | 'muted';
  disabled?: boolean;
}

interface AutocompleteItem {
  value: string;
  tag?: string;
}
interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  search: (term: string) => Promise<readonly AutocompleteItem[]>;
  sourceLabel: string;
  'aria-label'?: string;
  placeholder?: string;
  itemTag?: string;
  loadingText?: string;
  disabledMessage?: string;
  debounceMs?: number;
  allowFreeText?: boolean;
}

type PillColor = 'blue' | 'purple' | 'cyan' | 'amber' | 'emerald' | 'red' | 'lime' | 'slate';
interface ColorPillProps {
  color: PillColor;
  variant?: 'outlined' | 'soft';
  children: ReactNode;
}
type CategoryTone =
  | 'tv'
  | 'digital'
  | 'pdv'
  | 'campo'
  | 'medico'
  | 'preco'
  | 'conc'
  | 'sazo'
  | 'supply'
  | 'canal'
  | 'reg'
  | 'viral'
  | 'macro'
  | 'outro';
interface CategoryTagProps {
  tone: CategoryTone;
  children: ReactNode;
  className?: string;
}
interface PendingItemRowProps<T extends string> {
  code: string;
  title: string;
  subtitle?: string;
  actionLabel: string;
  actionHref: Route<T>;
}
interface StatusDistributionRowProps {
  label: string;
  count: number;
  pct: number;
  tone: 'green' | 'orange' | 'red' | 'muted';
}

function Skeleton(props: { className?: string }): JSX.Element;
function SkeletonText(props: { lines?: number }): JSX.Element;
function TableSkeleton(props: { rows?: number; columns: number; label?: string }): JSX.Element;
function CardSkeleton(props: { lines?: number; label?: string }): JSX.Element;
function PageSkeleton(props: { label?: string }): JSX.Element;

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: 'danger' | 'primary';
  pending?: boolean;
}
function useUnsavedChangesGuard(
  dirty: boolean,
  options?: { title?: string; message?: string; confirmLabel?: string },
): { dialog: ReactNode; confirmLeave: (href: string) => void };
function focusFirstInvalid(container: HTMLElement | null): boolean;
```

### 8.2 API pública (extensões)

```ts
type FormGridColumns = 1 | 2 | 3 | 4;
interface FormFieldProps {
  label: ReactNode;
  tip?: ReactNode;
  labelClassName?: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  full?: boolean;
}
interface TextInputProps {
  /* atuais */ min?: number | string;
  max?: number | string;
  step?: number | string;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email';
  ref?: Ref<HTMLInputElement>;
}
interface SelectGroup<T extends string> {
  label: string;
  options: readonly SelectOption<T>[];
}
interface FormSelectProps<T extends string> {
  value: T | '';
  onChange: (value: T | '') => void;
  options?: readonly SelectOption<T>[];
  groups?: readonly SelectGroup<T>[];
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}
type ButtonVariant = /* atuais */ 'orange' | 'red';
interface ButtonProps {
  /* atuais */ dashed?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}
interface ButtonLinkProps<T> {
  /* atuais */ dashed?: boolean;
}
type IconButtonTone = 'blue' | 'red' | 'teal' | 'green';
interface IconButtonProps {
  /* atuais */ tone?: IconButtonTone;
}
interface CardTitleProps {
  children: ReactNode;
  small?: ReactNode;
  step?: string;
  stepTone?: 'blue' | 'orange';
}
interface SectionProps {
  /* atuais */ tone?: 'muted' | 'orange';
}
type BadgeSize = 'md' | 'lg' | 'xl';
interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
  tone?: TabsTone;
  countTone?: 'blue' | 'red' | 'gray';
}
interface PaginationProps {
  page: number;
  totalPages: number;
  info?: string;
  onPageChange: (page: number) => void;
  variant?: 'range' | 'centered';
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
}
```

`buttonClasses(variant, size, className)` não muda; `dashed` entra pelo `className` interno. `FormSelect` busca o `useFieldControl()` como o `TextInput`; fora de `FormField` exige `aria-label` (documentado; o teste cobre os dois).

### 8.3 Comportamento

- **`ChipMultiSelect`**: clique alterna o valor; `onChange` recebe a seleção na ordem das `options`; sem estado interno.
- **`ModeSelector`**: setas esquerda/direita movem e selecionam (reusa `nextTabIndex`), tabindex móvel; desabilitado não emite.
- **`RangeSlider`**: `onChange(Number(event.target.value))`; padrão `format = String`.
- **`Autocomplete`** (`'use client'`, ≤120 linhas com `useAutocomplete.ts` à parte): estado `open`, `items`, `status` (`idle | loading | ready | blocked`), `activeIndex`; contador de requisição para descartar respostas fora de ordem; `useDebouncedValue` da fase 7.
- **`useUnsavedChangesGuard`**: listener só com `dirty`; remove no cleanup; link externo, `target="_blank"`, Ctrl/Meta/Shift e `href` igual ao atual não são interceptados.
- **`PageSkeleton`** em `src/app/loading.tsx` no lugar do `LoadingState` (ARQUITETURA §7.2); `LoadingState` continua exportado.
- **`index.ts`** reexporta todos os novos componentes, `useUnsavedChangesGuard`, `focusFirstInvalid` e os tipos `BreadcrumbItem`, `ModeOption`, `AutocompleteItem`, `PillColor`, `CategoryTone`, `IconButtonTone`, `SelectGroup`.

## 9. Arquivos

### Novos

- `src/presentation/components/ui/{Breadcrumb,CardSectionLabel,FormActions,Toolbar,FilterBar,StatusField,CodeBlock,NumberedList,ChipMultiSelect,ModeSelector,RangeSlider,SelectableCard,CheckboxCard,Autocomplete,ColorPill,CategoryTag,PendingItemRow,StatusDistributionRow,Skeleton,ConfirmDialog}.tsx` (`Skeleton.tsx` exporta `Skeleton`, `SkeletonText`, `TableSkeleton`, `CardSkeleton`, `PageSkeleton`; dividir se passar de 120 linhas)
- `src/presentation/components/ui/{useAutocomplete,useUnsavedChangesGuard,focusFirstInvalid,pillColors,categoryTones}.ts`
- `src/presentation/components/ui/__tests__/` — um teste por componente/hook (§11)
- Entregues também (divisão por tamanho ou peças genéricas pedidas pelas specs das ondas 2–5): `PageSizeSelect.tsx` e `PaginationCentered.tsx` (partes da `Pagination`), `AutocompleteMenu.tsx` (lista do `Autocomplete`), `TableSkeleton.tsx` (separado do `Skeleton.tsx`), `chipClasses.ts` (classes compartilhadas por `ChipGroup` e `ChipMultiSelect`), `DetailField.tsx` ([ingeridos](../admin/ingeridos.md), [agentes](../agentes/agentes.md)) e `CodeTag.tsx` ([tipos](../admin/tipos.md)), com testes em `__tests__/{FormFieldRich,structure,Badge}.test.tsx`.

### Modificados

- `src/presentation/components/ui/{FormGrid,FormField,TextInput,FormSelect,Button,buttonClasses,IconButton,Card,Section,Badge,Tabs,Pagination,Table,index}.ts(x)` — §3.1/§8.2.
- Também modificados: `Modal.tsx`/`useFocusTrap.ts` (`initialFocusRef`, foco inicial no "Cancelar" do `ConfirmDialog`, pedido pela spec [fontes](../admin/fontes.md)); `ChipGroup.tsx` (usa `chipClasses.ts`); `icons.tsx` (`PulseIcon` do rodapé do `Autocomplete`); `buttonClasses.ts` ganha o tamanho `xs` (ação do `PendingItemRow`, evita classes conflitantes sobre o `sm`); `IconLink` aceita `tone` como o `IconButton`.
- Compatibilidade com as specs das ondas 2–5: `Pagination` aceita `layout="centered"` como alias de `variant="centered"` ([aprovacoes](../admin/aprovacoes.md)); `ConfirmDialog` aceita `description` (alias de `message`) e `cancelLabel` ([fontes](../admin/fontes.md), [ciclos](../admin/ciclos.md)); `useUnsavedChangesGuard` devolve também `confirmNavigation` (= `confirmLeave`, [tipos](../admin/tipos.md)) e aceita `cancelLabel`; `TableSkeleton` aceita `headers` ("cabeçalho real" do [catálogo](../drivers/catalogo-de-produtos.md)). `TextInput` repassa atributos nativos do `input` (necessário para o combobox do `Autocomplete`).
- `src/presentation/components/ui/__tests__/{FormGrid,FormField,FormSelect,Button,IconButton,layout,Badge,Tabs,Pagination,Table,Tooltip,index,uiKitSource}.test.ts(x)` — casos novos; `uiKitSource` passa a cobrir os arquivos novos.
- `src/app/loading.tsx` e `src/app/__tests__/loading.test.tsx` — `PageSkeleton`.
- `src/app/globals.css` e `src/app/__tests__/globals.test.ts` — tokens do RN-06.
- `docs/design/DESIGN_SPEC.md` — §1 (tokens) e §3 (§3.22–§3.45 novos e extensões), com as tabelas do §3.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Componentes controlados: nenhum guarda valor de negócio (só `Tooltip`, `Autocomplete` e `Pagination` guardam estado de UI: aberto, destaque, resultados).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| RN-02 | `FormSelect` com `placeholder` emite `''` ao escolhê-lo; sem `placeholder`, `''` nunca é emitido. Opção fora das listas é ignorada.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| RN-03 | `ChipMultiSelect` preserva a ordem das opções no resultado e não duplica valores.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| RN-04 | `Pagination`: mudar o tamanho chama só `onPageSizeChange` (voltar à página 1 é do `useUrlState`, fase 7 RN-11); `centered` some com 1 página; pontas desabilitadas com `opacity-[.35]`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| RN-05 | `Autocomplete`: com `disabledMessage` não chama `search`; resposta mais antiga que a última requisição é descartada; termo vazio também busca (o protótipo mostra os 12 primeiros).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| RN-06 | Tokens novos (claro / escuro [derivado]), nomes `--color-apsen-*`: `cat-tv-bg #eef2ff / #1e2148`, `cat-tv-b #a5b4fc / #4b53a8`, `cat-tv-fg #4338ca / #a5b4fc`; `cat-digital-bg #f0fdf4 / #12301f`, `cat-digital-b #86efac / #2e7d4f`, `cat-digital-fg #166534 / #86efac`; `cat-pdv-bg #fffbeb / #3a3115`, `cat-pdv-b #fcd34d / #8a7420`, `cat-pdv-fg #92400e / #fcd34d`; `cat-conc-bg #ecfeff / #0e2e36`, `cat-conc-b #67e8f9 / #1f6b7a`, `cat-conc-fg #0e7490 / #67e8f9`; `cat-sazo-bg #f0fdf4 / #10302a`, `cat-sazo-b #6ee7b7 / #2a7a62`, `cat-sazo-fg #065f46 / #6ee7b7`; `cat-viral-bg #fdf2f8 / #3a1630`, `cat-viral-b #f0abfc / #8a3f8f`, `cat-viral-fg #86198f / #f0abfc`; `danger-b-soft #fca5a5 / #a33a3a`; `danger-ink #7f1d1d / #fecaca`; `attention #b45309 / #f59e0b`; `row-active #fffbf5 / #241c14`; `pal-blue #2563eb / #5b8def`, `pal-purple #7c3aed / #a78bfa`, `pal-cyan #0891b2 / #22b8d6`, `pal-amber #d97706 / #f0a43a`, `pal-emerald #059669 / #34c08f`, `pal-red #dc2626 / #f06565`, `pal-lime #65a30d / #8fc93a`, `pal-slate #64748b / #94a3b8`; `purple-soft #f3e8ff / #2a1f4a`, `purple-soft-b #ddd6fe / #5b45a8`, `blue-soft-b #c7d7fa / #2e3680`, `teal-soft #f0fdfa / #0e2a2a`, `teal-soft-b #99f6e4 / #1f6b5e`, `cyan-bg #e0f2fe / #0e2a3b`, `cyan-b #bae6fd / #1f5675`, `yellow-soft #fff8ec / #3a3115`; `code-bg #141414 / #0b0c0e`, `code-fg #7dd3fc / #7dd3fc`; `chart-fill rgba(27, 78, 201, 0.08) / rgba(124, 135, 245, 0.16)`, `chart-grid rgba(0, 0, 0, 0.04) / rgba(255, 255, 255, 0.06)`. Os da role bar e `avatar-muted` estão na fase 7. Link "Plano MVP" (`#DCFCE7`) não é portado e não ganha token. |
| RN-07 | Cor só por token; sem `dark:`; sem dependência nova; até 120 linhas por arquivo; sem comentários.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| RN-08 | Textos fixos em pt-BR: "← Voltar", "Itens por página", "Página X de Y", "Nenhum resultado. Você pode digitar um valor novo.", "{n} resultado(s) · Fonte: …", "Carregando…", "Cancelar", "Salvando…", "Sair sem salvar?", "Há alterações não salvas. Deseja sair mesmo assim?", "Sair", "Ativo"/"Inativo".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## 11. BDD — Cenários de teste unitário

Todos em `src/presentation/components/ui/__tests__/`.

| Cenário                                                         | Arquivo de teste                                                                    | Asserção                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 `FormGrid` 4 colunas                                      | `FormGrid.test.tsx`                                                                 | `grid-cols-4 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1`.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CA-01 `FormField` com label rico e `tip`                        | `FormField.test.tsx`                                                                | Label com `<small>` e `tip={<Tooltip label="Ajuda sobre data fim">…</Tooltip>}`: `getByRole('textbox', { name: 'Data Fim * (máx. 1 ano da data início)' })` sem o texto do tooltip; botão do tooltip fora do `<label>`.                                                                                                                                                                                                                                                                                                 |
| CA-01 `TextInput` numérico                                      | `FormField.test.tsx`                                                                | `min="-3" max="6" step="0.5"` no `input`; `ref` recebe o elemento.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| CA-01/RN-02 `FormSelect`                                        | `FormSelect.test.tsx`                                                               | `placeholder` "— Selecione a franquia —" como primeira opção `value=""` e escolhê-lo emite `''`; `groups` geram `optgroup label="ASTER"`; `disabled` com `bg-apsen-bg`; dentro de `FormField` "Franquia" obrigatório: `getByRole('combobox', { name: 'Franquia' })` `toBeRequired()` e `aria-invalid` com erro; fora usa `aria-label`; classes `FIELD_CONTROL` mantidas.                                                                                                                                                |
| CA-02 variantes de botão                                        | `Button.test.tsx`                                                                   | `orange` com `bg-apsen-orange border-apsen-orange text-white` sem `hover:`; `red` idem com `apsen-red`; `dashed` → `border-dashed` em `Button` e `ButtonLink`; `loading` → `disabled`, `aria-busy="true"`, texto "Salvando…" e `loadingLabel` customizado.                                                                                                                                                                                                                                                              |
| CA-02 tons de `IconButton`                                      | `IconButton.test.tsx`                                                               | `red` → `hover:bg-apsen-red-bg hover:text-apsen-red`; `teal`; `green` → `text-apsen-green`; desabilitado `disabled:opacity-[.3]`; padrão igual ao atual.                                                                                                                                                                                                                                                                                                                                                                |
| CA-03 `CardTitle` step, `Section` tone                          | `layout.test.tsx`                                                                   | "01" com `bg-apsen-blue-bg text-apsen-blue`, `stepTone="orange"` com `bg-apsen-orange-soft text-apsen-orange`; `Section variant="detail"` título `text-apsen-orange`; `tone="muted"` em `detail` troca para `text-apsen-muted`.                                                                                                                                                                                                                                                                                         |
| CA-03 `Badge xl`                                                | `Badge.test.tsx`                                                                    | `px-[13px] py-[5px] text-[12.5px]` e `before:size-[5px]`; `lg` inalterado.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CA-03 abas por item                                             | `Tabs.test.tsx`                                                                     | Itens Ativas (`tone: 'red'`, `countTone: 'red'`) e Resolvidas (`tone: 'blue'`, `countTone: 'gray'`): com Resolvidas ativa, aba `border-apsen-blue`, contador dela `bg-apsen-border` e contador de Ativas continua `bg-apsen-red`; sem `countTone` o comportamento atual se mantém.                                                                                                                                                                                                                                      |
| CA-04/RN-04 seletor de tamanho                                  | `Pagination.test.tsx`                                                               | `getByRole('combobox', { name: 'Itens por página' })` com 10/25/50; escolher 25 chama `onPageSizeChange(25)` e não `onPageChange`; sem `onPageSizeChange` não há seletor.                                                                                                                                                                                                                                                                                                                                               |
| CA-04 variante `centered`                                       | `Pagination.test.tsx`                                                               | "Página 2 de 5"; botões `h-[30px] min-w-[30px] border-0`; atual `bg-apsen-blue` com `aria-current`; ‹ desabilitado na página 1; com 1 página nada é renderizado.                                                                                                                                                                                                                                                                                                                                                        |
| CA-05 `Breadcrumb`                                              | `Breadcrumb.test.tsx`                                                               | `navigation` "Trilha da página"; link "Catálogo" com `font-medium text-apsen-blue`; atual "Configurar Tipo" `aria-current="page"`; `backHref` → link "← Voltar ao Catálogo" `ghost sm mb-[16px]`; `linkVariant="crumb"` sem `font-medium`.                                                                                                                                                                                                                                                                              |
| CA-05 `CardSectionLabel`, `FormActions`, `Toolbar`, `FilterBar` | `structure.test.tsx`                                                                | Classes do §3.2; `Toolbar` com `right` em `ml-auto`; `FilterBar` `role="search"` nomeado e `grid-cols-[1fr_auto_auto_auto_auto]`; `Table` com `toolbar` continua passando (`Table.test.tsx`).                                                                                                                                                                                                                                                                                                                           |
| CA-05 `StatusField`                                             | `StatusField.test.tsx`                                                              | `switch` com nome "Ativo no Driver Form" e descrição; etiqueta "Ativo" `text-apsen-green`; desligado "Inativo" `text-apsen-muted`; `offLabel="Rascunho"`; clique emite `onChange(false)` sem mudar sozinho.                                                                                                                                                                                                                                                                                                             |
| CA-05 `CodeBlock`, `NumberedList`                               | `CodeBlock.test.tsx`, `NumberedList.test.tsx`                                       | `pre` com `bg-apsen-code-bg text-apsen-code-fg max-h-[360px] whitespace-pre`, focável e nomeado; `list` com 3 `listitem`, número "1." `text-apsen-orange` `aria-hidden`.                                                                                                                                                                                                                                                                                                                                                |
| CA-06/RN-03 `ChipMultiSelect`                                   | `ChipMultiSelect.test.tsx`                                                          | "Farmácias" `aria-pressed="true"`; clicar "Hospitalar" emite `['farmacias','hospitalar']` na ordem das opções; clicar de novo remove; `disabled` não emite; chip ativo `bg-apsen-blue-bg border-apsen-blue`.                                                                                                                                                                                                                                                                                                            |
| CA-06 `ModeSelector`                                            | `ModeSelector.test.tsx`                                                             | `radiogroup` com 3 `radio`; ativo `bg-apsen-blue text-white` (`accent="orange"` → `bg-apsen-orange`); clique e seta direita emitem o valor; `lg`/`md`/`sm` aplicam padding e tamanho de fonte do §3.3; `sm` sem descrição.                                                                                                                                                                                                                                                                                              |
| CA-06 `RangeSlider`                                             | `RangeSlider.test.tsx`                                                              | `slider` nomeado com `min`/`max`; `fireEvent.change` → `onChange(4)` numérico; valor "75%" com `format` e `aria-valuetext`; `accent="purple"` → `accent-apsen-purple` e `min-w-[44px]`.                                                                                                                                                                                                                                                                                                                                 |
| CA-06 `SelectableCard`, `CheckboxCard`                          | `SelectableCard.test.tsx`, `CheckboxCard.test.tsx`                                  | `radio` `aria-checked` com "✓" e `border-apsen-orange bg-apsen-orange-soft`; tag com `border-apsen-orange-b`; checkbox nomeado pelo título, `accent-apsen-orange`, `plain` `bg-apsen-white rounded-[6px]` e `muted` `bg-apsen-bg`; `aside` renderizado.                                                                                                                                                                                                                                                                 |
| CA-07/RN-05 `Autocomplete`                                      | `Autocomplete.test.tsx`, `useAutocomplete.test.tsx`                                 | Fake timers: foco abre "⟳ Consultando base de concorrentes..." e chama `search('')` após 300 ms; resultados com etiqueta "Laboratório" e "2 resultado(s) · Fonte: API de Concorrentes (mock)"; vazio com a mensagem e "Fonte: …"; `disabledMessage` mostra "⚠️ Selecione primeiro o laboratório." sem chamar `search`; ArrowDown + Enter escolhe; Esc e clique fora fecham; resposta antiga descartada; `combobox`/`listbox`/`option` com `aria-activedescendant`.                                                      |
| CA-08 `ColorPill`, `CategoryTag`                                | `ColorPill.test.tsx`, `CategoryTag.test.tsx`                                        | `outlined` `amber` → `text-apsen-pal-amber bg-apsen-pal-amber/[9.4%] border-apsen-pal-amber/[18.8%]`; `soft` → `/[8.2%]` sem borda; os 14 tons de `CategoryTag` com as classes do §3.5 (`tv` → `bg-apsen-cat-tv-bg border-apsen-cat-tv-b text-apsen-cat-tv-fg`).                                                                                                                                                                                                                                                        |
| CA-08 `PendingItemRow`, `StatusDistributionRow`                 | `PendingItemRow.test.tsx`, `StatusDistributionRow.test.tsx`                         | Código mono `min-w-[95px]`, link "Revisar" para o `actionHref` com `text-[11px]`; `meter` com `aria-valuenow=43`, fill `width: 43%`, "43%" e cor do tom em bolinha, contagem e fill.                                                                                                                                                                                                                                                                                                                                    |
| CA-09 skeletons                                                 | `Skeleton.test.tsx`, `src/app/__tests__/loading.test.tsx`                           | `PageSkeleton` → um `status` "Carregando…" com `aria-busy`, blocos `aria-hidden` com `motion-safe:animate-pulse` e `bg-apsen-border`; `TableSkeleton rows={3} columns={4}` → 3 linhas × 4 barras; `loading.tsx` renderiza `PageSkeleton`.                                                                                                                                                                                                                                                                               |
| CA-10 `ConfirmDialog`                                           | `ConfirmDialog.test.tsx`                                                            | `dialog` nomeado pelo título; "Cancelar" chama `onCancel`; ação `red` chama `onConfirm`; `pending` → botão "Salvando…" desabilitado e Esc não fecha.                                                                                                                                                                                                                                                                                                                                                                    |
| CA-10 alterações não salvas                                     | `useUnsavedChangesGuard.test.tsx`, `focusFirstInvalid.test.ts`                      | `dirty`: evento `beforeunload` com `defaultPrevented`; clique num `<a href="/drivers">` abre "Sair sem salvar?" e não navega; "Sair" → `routerMock.push('/drivers')`; "Cancelar" fecha; `dirty=false` não intercepta; link com `target="_blank"` não é interceptado; listener removido no unmount; `focusFirstInvalid` foca o 2º campo quando só ele é inválido e devolve `false` sem inválidos.                                                                                                                        |
| CA-11/RN-06 tokens                                              | `src/app/__tests__/globals.test.ts`, `src/app/__tests__/designTokensSource.test.ts` | Cada token do RN-06 com o valor claro no `@theme` e o escuro em `html.dark`; nenhum arquivo de `src/` com hex/paleta.                                                                                                                                                                                                                                                                                                                                                                                                   |
| CA-12/RN-07 entrega                                             | `index.test.ts`, `uiKitSource.test.ts`                                              | Lista ordenada de exports com os novos; arquivos novos ≤ 120 linhas, sem `//`/`/*`, sem `dark:`; `'use client'` presente em `ChipMultiSelect`, `ModeSelector`, `RangeSlider`, `SelectableCard`, `CheckboxCard`, `Autocomplete`, `StatusField`, `ConfirmDialog`, `Pagination` e ausente em `Breadcrumb`, `CardSectionLabel`, `FormActions`, `Toolbar`, `FilterBar`, `CodeBlock`, `NumberedList`, `ColorPill`, `CategoryTag`, `PendingItemRow`, `StatusDistributionRow`, `Skeleton`; `package.json` sem dependência nova. |
| RN-08 textos                                                    | testes de cada componente                                                           | Textos fixos do RN-08 consultados por nome acessível.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Tema escuro                                                     | QA visual no navegador                                                              | Harness com todos os componentes em claro e escuro: nada ilegível (`CategoryTag`, `ColorPill`, `CodeBlock`, skeleton).                                                                                                                                                                                                                                                                                                                                                                                                  |

## 12. Requisitos não funcionais

| Item (ARQUITETURA §7)               | Nesta onda                                                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 Paginação e busca               | Seletor 10/25/50 na `Pagination` (`PAGE_SIZES` da fase 7); `Autocomplete` com debounce de 300 ms e busca sob demanda (o limite fica com o `search` do módulo).            |
| 7.2 Carregamento                    | Skeletons para os `loading.tsx` por segmento; `PageSkeleton` no `loading.tsx` raiz.                                                                                       |
| 7.3 Escrita                         | `Button loading` ("Salvando…", sem duplo envio) e `ConfirmDialog` para exclusões.                                                                                         |
| 7.4 Formulários                     | `FormField error` + `focusFirstInvalid`, `useUnsavedChangesGuard`, `TextInput` com `min`/`max`/`step`.                                                                    |
| 7.5 Acessibilidade e responsividade | Combobox, radiogroup, `aria-pressed`, `meter`, `role="status"` nos skeletons, `FilterBar`/`FormGrid` colapsam em 800/560 px, `motion-safe`/`motion-reduce` nas animações. |
| 7.6 Segurança                       | Nada de `dangerouslySetInnerHTML` (conteúdo rico por `ReactNode`).                                                                                                        |
| Dependências                        | Nenhuma nova.                                                                                                                                                             |

## Revisão de 28/10/2026 — células de tabela

`Table` aplica `whitespace-nowrap` em todas as células por padrão (códigos, status, datas, "Linha 1"); colunas descritivas optam por quebra com `wrap: true` em `TableColumn` (`CardTableColumn` idem). Testes: `TableNowrap.test.tsx`, `tableCellsSource.test.ts`.
