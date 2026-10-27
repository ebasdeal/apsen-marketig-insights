---
status: IN_PROGRESS
fase: 20
area: drivers
feature: registrar-driver
azure-devops-work-item:
---

# Registrar, visualizar e editar Driver de Demanda

## 1. Overview

Porta a tela `form` do protótipo (`docs/Negócio/di-drivers-v2_84.html`, markup L690–1534, JS L4775–4893, L5467–6198, L6964–7149, L7713–7945) para o App Router, gravando de verdade em `/drivers` pelo json-server. É a tela mais complexa do app: identificação do evento com 3 granularidades (Franquia, Família, SKU), cascata categoria → tipo, campos dinâmicos por tipo vindos de `camposTipo`, autocomplete de concorrentes por `/concorrentes`, intensidade ⟷ uplift, cobertura por região e canal, e três modos (novo, visualizar, editar), também acionados pelo Catálogo de Produtos (`?familia=`).

Esta spec cria a base do módulo `drivers` (entidade `Driver`, portas, repositórios HTTP, mapeadores) e a parte do módulo `catalogo` usada pelo formulário (busca de SKUs e famílias). As specs [meus-registros-e-exportar](meus-registros-e-exportar.md) (fase 21) e [catalogo-de-produtos](catalogo-de-produtos.md) (fase 22) reutilizam essa base.

Pré-requisitos (ondas 0 e 1, assumidos prontos): registro de telas `screens.ts` com guarda por perfil e Acesso Negado, `ToastProvider`/`useToast`, `UseCases` agrupado por módulo, `HttpClient.getPage` (`{ data, total }` com `X-Total-Count`) e timeout no cliente HTTP; UI kit com `Autocomplete`, `RangeSlider`, `ModeSelector`, `ChipMultiSelect`, `FormActions`, `CardTitle step`, `FormSelect` com `groups`/`placeholder`/`disabled`, `TextInput` com `min`/`max`/`step`/`disabled`, `FormField` com `label: ReactNode` e `Tooltip` com conteúdo `ReactNode`. Decisões transversais em `docs/prototipo/ARQUITETURA.md` (finais). Regras de negócio citadas: `analise/texto/20260824_Regras_de_Negocio_Apsen_PLP_Agent.txt` (RN-DRV-01 a 10, RN-TIP-04, RN-FRM-01 a 03, RN-SEG-03).

Decisões desta spec (além das do `ARQUITETURA.md` §5, itens 6–10 e 20):

- **IDs (RN-SEG-03)**: driver novo recebe `id` UUID (`crypto.randomUUID()`, via porta `IdGenerator`). Os 4 drivers do `db.json` têm `id` numérico (1–4) e continuam válidos: o schema aceita número ou texto e o domínio trata o `id` sempre como `string`. O protótipo não exibe código de negócio para drivers, então nenhum é criado (ver perguntas).
- **SKU e Família viram `Autocomplete`** com busca no servidor e limite de 20 (ARQUITETURA §7.1: listas de selects com centenas de itens não são baixadas inteiras). O visual do campo segue o `form-input` e os textos do protótipo (placeholder, dica, caixas de SKUs). Franquia (6 itens) continua `FormSelect`.
- **Tipos inativos** (`/tipos` com `ativo: false`, hoje `fv` e `validade`) ficam fora da cascata, exceto o tipo do driver aberto em visualização/edição (texto do protótipo no tipo-form: "Tipos inativos ficam ocultos no formulário das áreas mas preservam os registros históricos", RN-TIP-01).
- **Selects dinâmicos** não têm opção vazia: começam na primeira opção, como no protótipo (L5474), e por isso entram nos `parametros`.
- **Parâmetros**: grava todos os campos do tipo (decisão 7), chave = `param`, só valores não vazios; na edição sem troca de tipo, chaves antigas que não existem no `camposTipo` atual são preservadas (dados do `db.json` usam chaves como `emissora` e `praças`).
- **`skus_afetados_ia`** (decisão 6): código do SKU (número entre parênteses no fim do nome, ex. `(2298)` → `"2298"`) ou o nome inteiro quando não há código.

Perguntas em aberto ao PO (não bloqueiam; o comportamento abaixo é o implementado):

1. **RN-DRV-01/RN-DRV-04 × protótipo**: a RN diz "data de início obrigatória, data de fim opcional"; o protótipo marca `*` só na Data Fim. Segue o protótipo e a decisão 10 (Data Fim obrigatória, Data Início opcional).
2. **RN-DRV-06 × `camposTipo`**: a RN diz que Prescrição Digital, Protocolo Clínico e Posicionamento "exigem" alguns campos, mas em `camposTipo` só `concorrente.lab_conc` tem `required: true`. Segue `camposTipo` (RN-TIP-04: obrigatoriedade vem do catálogo de tipos).
3. Salvar driver não cria item na Fila de Aprovação (decisão 2).
4. Driver precisa de código de negócio exibível (ex. `DRV-2026-nnn`)? Hoje não há.
5. Tipos inativos fora do formulário (decisão desta spec) — confirmar.
6. Os 4 drivers do `db.json` usam produtos fora do catálogo (`Baricitinibe 2mg (SKU-00312)`) ou chaves de parâmetro antigas; ao editar, o SKU pode não ser encontrado e precisa ser escolhido de novo.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | Em `/drivers/novo` a tela mostra o cabeçalho "Registrar Driver de Demanda" / "Cadastre variáveis externas para análise causal · Apsen PLP Agent Framework", o `ScreenDesc` 📋, o Card 01 e o Card 02; Cards 03 e 04 só aparecem depois de escolher o tipo. Estados de carregando (skeleton), erro com "Tentar novamente" e dados.                                                                                                                                                               |
| CA-02 | Card 01: Título, Data Início e Data Fim (`*`, "(máx. 1 ano da data início)") com os tooltips do protótipo; ao mudar uma data, Data Fim ganha `min` = início e `max` = início + 1 ano, e a caixa vermelha mostra "⚠️ A data fim não pode ser anterior à data início." ou "⚠️ A data fim não pode ultrapassar 1 ano a partir da data início.", com a Data Fim marcada inválida; corrigido, a caixa some.                                                                                          |
| CA-03 | Seletor de granularidade com 🏢 Franquia / 🔬 Família / 💊 SKU (SKU ativo por padrão). Trocar de modo mostra só os campos do modo e limpa os valores dos outros modos.                                                                                                                                                                                                                                                                                                                          |
| CA-04 | Modo Franquia: select com as 6 franquias e caixa teal "SKUs da franquia — somente leitura" listando famílias e SKUs. Modo Família: autocomplete de família e caixa "SKUs identificados pela IA — somente leitura · SKU · Medicamento · Família" com textarea de um SKU por linha (`rows = min(n+1, 8)`). Modo SKU: autocomplete de SKU e grade "SKU / Produto · Família · Franquia". SKU e Família buscam no servidor (limite 20, debounce 300 ms).                                             |
| CA-05 | Card 02: Categoria (10 categorias) e Tipo específico, desabilitado até escolher a categoria e só com os tipos ativos da categoria (RN-DRV-05). Escolher o tipo mostra o badge "● {LABEL} selecionado", o Card 03 "Parâmetros: {title}" e o Card 04. Trocar a categoria limpa tipo, badge e Cards 03/04.                                                                                                                                                                                         |
| CA-06 | Card 03 renderiza os campos do tipo a partir de `camposTipo` (layout `g2`/`g3`, `text`, `number` com `step`, `date`, `select` com e sem grupos, `autocomplete`, `readonly`, `labelHint`, `required`) (RN-FRM-01/02). Selects começam na primeira opção.                                                                                                                                                                                                                                         |
| CA-07 | Regras especiais: em `concorrente`/`conc_lanc` a molécula do concorrente vem preenchida com a família do Card 01 (fundo teal claro e placeholder "{mol} (herdado — edite se o concorrente for diferente)"); em `preco` a Variação (%) é calculada ao digitar os preços.                                                                                                                                                                                                                         |
| CA-08 | Autocomplete de concorrentes (RN-DRV-08): Laboratório busca em `/concorrentes`; Marca exige laboratório ("⚠️ Selecione primeiro o laboratório.") e lista só as marcas dele; escolher o laboratório limpa a marca e troca o placeholder para "Digite para buscar a marca de {lab}..."; textos de carregando, vazio e fonte do protótipo; valor livre permitido.                                                                                                                                  |
| CA-09 | Card 04: chips de regiões (nenhuma marcada) e canais (💊 Farmácias marcado), slider de intensidade 1–5 (padrão 1) com legenda "**{n} — {label}** · uplift típico **{faixa}**" + descrição; mover o slider reescreve o uplift com o padrão da intensidade e a dica "Sugerido pela intensidade ({faixa}) — ajuste se necessário."; digitar o uplift mostra "Valor ajustado manualmente."; Verba e Observações.                                                                                    |
| CA-10 | "✓ Adicionar Registro" valida na ordem do protótipo e mostra o toast exato do primeiro erro, marca o campo com erro e foca nele; sem erro grava em `/drivers` com o payload do protótipo corrigido (decisões 6 e 7), mostra "✅ Driver registrado com sucesso!" e vai para `/drivers` (ou para `/drivers/catalogo/{familia}` quando veio do catálogo). Durante o envio o botão fica desabilitado com "Salvando…".                                                                               |
| CA-11 | "Limpar" volta o formulário ao estado inicial (mantém a granularidade), com intensidade 1, uplift sugerido e canal Farmácias.                                                                                                                                                                                                                                                                                                                                                                   |
| CA-12 | Modo visualizar (`/drivers/[id]`): título "Visualizar Driver", subtítulo "Somente leitura · {familia}", banner "👁️ Modo visualização — os campos estão travados. Clique em Editar para modificar.", todos os campos travados, sem botões de envio e com ações "Voltar" e "Editar".                                                                                                                                                                                                              |
| CA-13 | Modo editar (`/drivers/[id]/editar`): título "Editar Driver", subtítulo "Editando registro existente · {familia}", banner "✏️ Modo edição — altere os campos e clique em Salvar alterações.", campos pré-preenchidos (granularidade, produto, datas, categoria e tipo — inclusive categoria 0 —, parâmetros, intensidade, uplift salvo, chips, verba, observações), botão "✓ Salvar alterações" que atualiza o mesmo registro (RN-DRV-10), toast "✅ Driver atualizado com sucesso!" e retorno. |
| CA-14 | `/drivers/novo?familia=X` (vindo do catálogo) abre com Família pré-selecionada e a caixa de SKUs dela, e a ação "Voltar aos drivers"; família inexistente é ignorada. `id` inexistente em visualizar/editar mostra a página de não encontrado.                                                                                                                                                                                                                                                  |
| CA-15 | Sair do formulário com alterações não salvas pede confirmação; falha da API ao salvar mostra toast de erro e mantém os dados.                                                                                                                                                                                                                                                                                                                                                                   |

## 3. UX / Fluxo de tela

Referências: `docs/design/DESIGN_SPEC.md` §3.5 (`Card`/`CardTitle`), §3.7 (`PageHeader`), §3.8 (`ScreenDesc`), §3.12 (estados), §3.15 (formulário), §3.18 (`Tooltip`), §3.19 (`Alert`) e as seções da onda 1 para `Autocomplete`, `RangeSlider`, `ModeSelector`, `ChipMultiSelect`, `FormActions`. Esta spec cria a seção §4.x "Registrar Driver" do `DESIGN_SPEC.md` com as tabelas abaixo. `Lnnnn` = linha do protótipo; hex aparece só para descrever, o código usa tokens.

### 3.1 Rotas

| Rota                                        | Arquivo                                | `metadata.title`    | Modo   |
| ------------------------------------------- | -------------------------------------- | ------------------- | ------ |
| `/drivers/novo` (aceita `?familia=`)        | `src/app/drivers/novo/page.tsx`        | "Registrar Driver"  | `new`  |
| `/drivers/[id]` (aceita `?familia=`)        | `src/app/drivers/[id]/page.tsx`        | "Visualizar Driver" | `view` |
| `/drivers/[id]/editar` (aceita `?familia=`) | `src/app/drivers/[id]/editar/page.tsx` | "Editar Driver"     | `edit` |

- Páginas são Server Components finos: `params: Promise<{ id: string }>` e `searchParams: Promise<{ familia?: string \| string[] }>` (Next 16), leem os valores com `await` e renderizam `<DriverFormScreen key={`${mode}:${id ?? ''}:${familia ?? ''}`} mode={mode} driverId={id} familia={familia} />`. O `key` remonta a tela quando só os parâmetros mudam (ex.: menu "Registrar Driver" estando em `?familia=`). `familia` em array usa o primeiro valor.
- Segmento `src/app/drivers/` ganha `loading.tsx` (skeleton dos Cards 01/02), `error.tsx` (`ErrorState` com "Tentar novamente" → `reset()`) e `src/app/drivers/[id]/not-found.tsx` (`ErrorState icon="🔍" title="Driver não encontrado"` com `ButtonLink outline` "← Voltar aos registros" → `/drivers`). A tela chama `notFound()` quando o caso de uso lança `NotFoundError` ou o `id` é vazio.
- Telas registradas em `screens.ts` (onda 0) como `form` (nível 2, crumb "Registrar Driver", módulo Drivers) para os três padrões de rota. A guarda da onda 0 roda antes das queries.
- Helpers em `src/presentation/navigation/routes.ts`: `DRIVERS_ROUTE = '/drivers'`, `novoDriverRoute(familia?)`, `driverRoute(id, familia?)`, `editarDriverRoute(id, familia?)`, `catalogoFamiliaRoute(familia)` (`/drivers/catalogo/${encodeURIComponent(f)}`); `familia` vai como `?familia=${encodeURIComponent(f)}`.

### 3.2 Cabeçalho, banner e ações por modo (decisão 9; elementos `form-titulo`/`form-sub`/`form-view-banner`/`form-hdr-actions`, L7815–7849)

| Modo                   | `PageHeader.title`          | subtítulo                                                                                | Banner (logo abaixo do header, antes do `ScreenDesc`)                                                    | Ações do header                                                                                      | Ações do rodapé (`FormActions`)                                                                         |
| ---------------------- | --------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| new (menu)             | Registrar Driver de Demanda | Cadastre variáveis externas para análise causal · Apsen PLP Agent Framework              | —                                                                                                        | —                                                                                                    | `Button ghost` "Limpar" · `Button primary` ✓ "Adicionar Registro"                                       |
| new + `familia` válida | idem                        | idem                                                                                     | —                                                                                                        | `ButtonLink ghost sm` "Voltar aos drivers" → `catalogoFamiliaRoute(f)`                               | idem                                                                                                    |
| view                   | Visualizar Driver           | `Somente leitura · {familia}` (sem `familia`: "Somente leitura")                         | `Alert tone="info"`: "👁️ Modo visualização — os campos estão travados. Clique em Editar para modificar." | `ButtonLink ghost sm` "Voltar" · `ButtonLink primary sm` "Editar" → `editarDriverRoute(id, familia)` | nenhuma [derivado: o protótipo esconde só o envio; "Limpar" num formulário travado não tem efeito útil] |
| edit                   | Editar Driver               | `Editando registro existente · {familia}` (sem `familia`: "Editando registro existente") | `Alert tone="warning"`: "✏️ Modo edição — altere os campos e clique em Salvar alterações."               | `ButtonLink ghost sm` "Voltar"                                                                       | "Limpar" · ✓ "Salvar alterações" [o banner cita o rótulo; o código nunca o troca]                       |

"Voltar" → `catalogoFamiliaRoute(familia)` quando há `familia`, senão `DRIVERS_ROUTE`. Ícone do envio: check SVG 13px `stroke-width 2.5` (`polyline 20 6 9 17 4 12`, L1529) → `CheckIcon` no `icons.tsx`. Durante o envio: `disabled` e texto "Salvando…".

`ScreenDesc icon="📋"` (L700–703): "**Use este formulário para registrar eventos que afetam a demanda de produtos.** Cada driver registrado vira variável exógena no modelo causal — quanto mais completo o registro, melhor a qualidade do forecast. Vincule ao produto correto, informe o período e escolha o tipo específico. _Correlação ≠ causa_: o analista validará o impacto no backtesting." (`<strong>` e `<em>`).

### 3.3 Card 01 — Identificação do Evento (L707–1426)

`Card` + `CardTitle step="01" stepTone="blue" small="Selecione o nível de granularidade do registro"` "Identificação do Evento".

1. **Título / Nome do Evento** — `FormField` (fora de grade, `mb-[14px]`) + `Tooltip` T1; `TextInput` placeholder "Ex: Campanha Inverno Globo Jan/26". Não obrigatório.
2. **Datas** — `FormGrid columns={3}` (`mb-[14px]`): Data Início (`TextInput type="date"`, tooltip T2); Data Fim (`required`, rótulo "Data Fim" + `<span className="text-[11px] font-normal text-apsen-muted">(máx. 1 ano da data início)</span>` + tooltip T3, `min`/`max` conforme RN-05). Abaixo, ocupando a linha toda com `-mt-[6px]`, `DataFimMessage` (`role="alert"`, só quando há erro de período): `rounded-[6px] border border-apsen-red-soft-b bg-apsen-kpi-red px-[10px] py-[7px] text-[12px] leading-[1.5] text-apsen-red`. A Data Fim recebe `invalid` (borda vermelha) e `aria-describedby` da mensagem.
3. **Granularidade** — `ModeSelector accent="blue"` (`flex gap-[8px] mb-[18px]`), opções na ordem: `{value:'franquia', icon:'🏢', label:'Franquia', description:'Linha terapêutica completa'}`, `{value:'familia', icon:'🔬', label:'Família', description:'Molécula / princípio ativo'}`, `{value:'sku', icon:'💊', label:'SKU', description:'Produto específico com código'}`; padrão `sku`. Botões `flex-1 px-[16px] py-[12px] rounded-[8px] border-2`, ativo fundo/borda azul e texto branco, inativo fundo branco, borda `border` e texto muted (L742–770).
4. **Modo Franquia** (`FormGrid columns={2}`, campo `full`): "Franquia / Linha Terapêutica" `*` + tooltip T4; `FormSelect` placeholder "— Selecione a franquia —", opções ASTER, LYRA, POLARIS, SAGITA, SIRIUS, SOLARIS (de `/franquias`); dica "O pipeline identificará todos os SKUs desta franquia após a ingestão.". Com franquia escolhida, `FranquiaSkusBox` (L789–800, L6983–7001): `mb-[14px] rounded-[8px] border border-apsen-border border-l-[3px] border-l-apsen-teal bg-apsen-bg px-[14px] py-[12px]`; título `mb-[6px] flex items-center gap-[6px] text-[11px] font-bold uppercase tracking-[.06em] text-apsen-teal` com ícone de grade 12px "SKUs da franquia — somente leitura"; por família (ordem de `franquias[f].familias`): nome `mt-[8px] mb-[3px] text-[10px] font-bold uppercase tracking-[.05em] text-apsen-teal` e SKUs `pl-[8px] font-mono text-[12px] text-apsen-slate`; sem SKUs: "Nenhum SKU encontrado." (`text-[12px] text-apsen-muted`). Carregando: "⟳ Carregando SKUs…" na caixa.
5. **Modo Família**: "Família / Molécula" `*` + tooltip T5; `Autocomplete` estrito (sem texto livre) placeholder "— Selecione a família —", item com a família e tag com a franquia; dica "O pipeline de IA identificará os SKUs afetados após a ingestão.". Com família escolhida e SKUs, `FamiliaSkusBox` (L918–935): mesma caixa teal, título com ícone de engrenagem "SKUs identificados pela IA — somente leitura · SKU · Medicamento · Família" (`mb-[8px]`), `textarea` `readOnly` com `aria-label="SKUs identificados pela IA"`, `rows={Math.min(n + 1, 8)}`, um SKU por linha, `w-full resize-y rounded-[6px] border border-apsen-teal-light bg-apsen-white px-[11px] py-[9px] font-mono text-[12.5px] leading-[1.8] text-apsen-slate`, e nota `mt-[5px] text-[11px] text-apsen-teal opacity-80` "O pipeline de ingestão confirma estes SKUs com base na composição da molécula.". Sem SKUs a caixa não aparece.
6. **Modo SKU** (padrão): "Produto / SKU" `*` + tooltip T6; `Autocomplete` estrito placeholder "— Selecione ou busque pelo nome / código —", item com o nome do SKU e tag "{FAMÍLIA} ({FRANQUIA})"; dica "Selecione o SKU — os campos abaixo serão preenchidos automaticamente.". Com SKU, `SkuAutoFields` (L1407–1424): `mb-[14px] grid grid-cols-3 gap-[10px] rounded-[8px] border border-apsen-border border-l-[3px] border-l-apsen-blue bg-apsen-bg px-[14px] py-[12px]` (`max-[560px]:grid-cols-1` [derivado]); rótulos `mb-[3px] text-[10px] uppercase tracking-[.05em] text-apsen-muted` "SKU / Produto" · "Família" · "Franquia"; valores: nome `font-mono text-[13px] font-semibold text-apsen-blue`, família `text-[13px] font-medium text-apsen-slate`, franquia `text-[13px] text-apsen-slate`.

Autocomplete de SKU/Família: carregando "⟳ Buscando no catálogo...", vazio "Nenhum resultado." [derivado: no protótipo eram selects]. Ao perder o foco sem escolher, o texto volta ao item escolhido (ou vazio).

### 3.4 Card 02 — Tipo de Driver (L1430–1460)

`CardTitle step="02"` "Tipo de Driver". Grade `mb-[6px] grid grid-cols-2 gap-[12px] max-[560px]:grid-cols-1` (`.cascade-wrap`):

- **Categoria** `*` + tooltip T7: `FormSelect` placeholder "— Selecione a categoria —", opções = `categorias` em ordem de `id` (valor = `id` 0–9, rótulo `label`: 📡 Mídia & Comunicação … 🌍 Macro & Externos).
- **Tipo específico** `*` + tooltip T8: `FormSelect` placeholder "— Selecione o tipo —", `disabled` sem categoria; opções = `categorias[id].tipos` (rótulo longo) filtradas por RN-07.
- `SelectedTipoBadge` (L326–329, L6013): `mt-[6px] inline-flex items-center gap-[6px] rounded-[20px] border border-apsen-blue-light bg-apsen-blue-bg px-[13px] py-[4px] text-[12.5px] font-semibold text-apsen-blue`, ponto `size-[6px] rounded-full bg-apsen-blue` (`aria-hidden`), texto "{LABEL[slug] ?? slug} selecionado" (`config.LABEL`).

### 3.5 Card 03 — Parâmetros: {title} (`DynamicFieldsCard`, L6014–6028)

Aparece com tipo escolhido e `camposTipo` do slug existente (sem config: só o Card 04, como no protótipo). `Card` + `CardTitle step="03"` "Parâmetros: {title}". `FormGrid columns={layout === 'g2' ? 2 : 3}` com um `DynamicField` por campo, na ordem do array:

| `type`           | Controle                     | Detalhes                                                                                                                                                                         |
| ---------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`           | `TextInput`                  | `placeholder`                                                                                                                                                                    |
| `number`         | `TextInput type="number"`    | `step` do campo; `placeholder`                                                                                                                                                   |
| `date`           | `TextInput type="date"`      | —                                                                                                                                                                                |
| `select`         | `FormSelect` sem placeholder | opções `string` → `{value: s, label: s}`; opções `{label, group}` → `groups` na ordem de primeira aparição; valor salvo fora das opções entra como opção extra no fim [derivado] |
| `autocomplete`   | `Autocomplete` (ver §3.6)    | `placeholder`                                                                                                                                                                    |
| `readonly: true` | `TextInput readOnly`         | só `preco.var_preco` (placeholder "Auto")                                                                                                                                        |

Rótulo = `label`; com `labelHint` acrescenta `<small className="font-normal text-apsen-muted">{labelHint}</small>`; `required` → `FormField required` (`*`). Erro de obrigatório no `FormField error`. Valor inicial: `select` = primeira opção; demais `''`.

Regras especiais (RN-09, RN-10): molécula herdada em `concorrente.mol_conc` / `conc_lanc.cl_molecula` (classe `bg-apsen-teal-soft` enquanto o tipo não muda e placeholder "{mol} (herdado — edite se o concorrente for diferente)"); `preco.var_preco` recalculado a cada digitação em `preco_ant`/`preco_novo`.

### 3.6 Autocomplete de concorrentes (L7065–7149, CSS L495–510; RN-DRV-08)

`Autocomplete` (onda 1) com `debounceMs={300}`, busca também ao focar, `allowFreeText`:

| Campo (`param`, `autocomplete`)                        | `search(term)`                                                      | `itemTag`     | `disabledMessage`                                                                | Ao escolher                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `lab_conc` (`labs`, obrigatório) · `cd_lab` · `cl_lab` | `useCases.drivers.searchLaboratorios`                               | "Laboratório" | —                                                                                | em `lab_conc`: limpa `conc_nome` e troca o placeholder dele para "Digite para buscar a marca de {lab}..." |
| `conc_nome` (`marcas`)                                 | `useCases.drivers.searchMarcas({ laboratorio: valor de lab_conc })` | "Marca"       | "⚠️ Selecione primeiro o laboratório." (quando `lab_conc` vazio, sem requisição) | —                                                                                                         |

Textos: carregando "⟳ Consultando base de concorrentes..."; vazio "Nenhum resultado. Você pode digitar um valor novo." + rodapé "Fonte: API de Concorrentes (mock)"; com resultados, rodapé "{n} resultado(s) · Fonte: API de Concorrentes (mock)" com o ícone de pulso 10px. Lista `max-h-[220px]`, item com tag à direita, fecha ao clicar fora (comportamento do componente da onda 1).

### 3.7 Card 04 — Cobertura, Canal & Impacto (L1466–1533)

`CardTitle step="04"` "Cobertura, Canal & Impacto". Visível com tipo escolhido.

- `FormGrid columns={2}`: **Regiões cobertas** + tooltip T9 → `ChipMultiSelect` com `config.opcoes.regioes` (🇧🇷 Nacional, Norte, Nordeste, Centro-Oeste, Sudeste, Sul; RN-DRV-09); **Canal impactado** + tooltip T10 → `ChipMultiSelect` com `config.opcoes.canais` (💊 Farmácias, 🏥 Hospitalar, 🛒 Varejo Alim., 🌐 E-commerce, 📦 Atacado/Dist., 🏛️ Governo/Licitação), inicial `config.opcoes.canaisDefault` (`["farmacias"]`).
- `FormGrid columns={2}` com `mt-[6px]`:
  - Coluna 1: **Intensidade esperada** + tooltip T11 → `RangeSlider min={1} max={5} step={1} accent="blue"` com valor ao lado (`min-w-[18px] text-[15px] font-bold text-apsen-blue`); `IntensidadeLegenda` `mt-[6px] rounded-[6px] border-l-[3px] border-apsen-blue bg-apsen-bg px-[10px] py-[7px] text-[11.5px] leading-[1.5] text-apsen-muted` com "<strong>{n} — {label}</strong> · uplift típico <strong>{faixa}</strong><br/>{desc}" (`aria-live="polite"`). Bloco `mt-[12px]`: rótulo `text-[12px]` "Uplift esperado (%)" + `<small>(opcional)</small>` + tooltip T12; `TextInput type="number" step="0.5" placeholder="15"` alinhado à direita, em `flex max-w-[220px] items-center gap-[8px]` com sufixo "%" `text-[14px] font-semibold text-apsen-muted`; dica (`aria-live="polite"`) por RN-12.
  - Coluna 2: **Verba / Investimento R$** + tooltip T13 → `TextInput type="number" min={0}` placeholder "Ex: 250000".
  - `full`: **Observações / contexto** + tooltip T14 → `TextArea` placeholder "Contexto relevante: antecipação de compra, lag de efeito estimado, ressalvas para o analista...".
- `FormActions` (§3.2).

### 3.8 Modo visualizar

Todos os `input`/`select`/`textarea`/`Autocomplete`/`RangeSlider` com `disabled`; `ModeSelector` e `ChipMultiSelect` com `disabled` (chips `opacity-70`, sem clique, L7858–7861); Cards 03/04 visíveis com os valores salvos.

### 3.9 Tooltips (conteúdo `ReactNode`; nome acessível "Ajuda: {rótulo}")

| #   | Campo               | Conteúdo (`<strong>`, `<em>`, `<br/>` como no protótipo)                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | Título (L722)       | **Nome descritivo para identificar o driver na lista de registros.**<br/><br/>_Boas práticas:_<br/>✓ Campanha TV Inverno Globo Jul/2026<br/>✓ Falta IFA Baricitinibe — Fornecedor Lilly Jun/2026<br/>✓ Restrição ANVISA RDC 212/2026<br/><br/>✗ Evite: "Campanha", "Problema", "Evento" — sem contexto temporal ou de produto.                                                                                                                                                      |
| T2  | Data Início (L729)  | **Data em que o evento começa a ter efeito na demanda** — não necessariamente quando foi anunciado.<br/><br/>_Ex TV:_ campanha vai ao ar no dia 10/07 → data início = 10/07<br/>_Ex MP:_ falta de IFA confirmada em 15/06 → data início = 15/06<br/>_Ex Reajuste de preço:_ vigência a partir de 01/08 → data início = 01/08<br/><br/>Para campanhas com lead de efeito (o modelo antecipa o comportamento), o analista pode ajustar o lag na modelagem — não antecipe a data aqui. |
| T3  | Data Fim (L733)     | **Data em que o efeito do evento cessa**.<br/><br/>Para eventos com efeito permanente (ex: mudança de classificação Rx→OTC, concorrente descontinuado), use uma data distante como _31/12/2099_ — o analista vai tratar como dummy permanente.<br/><br/>Para eventos ainda em curso sem data prevista de encerramento, use a data de revisão do próximo ciclo.                                                                                                                      |
| T4  | Franquia (L776)     | **Franquia** é a linha terapêutica completa — todos os produtos de uma área.<br/><br/>_Quando usar:_ o driver afeta toda uma área terapêutica.<br/>_Ex:_ campanha institucional de Cardiologia, mudança regulatória que impacta toda a linha de Imunologia.                                                                                                                                                                                                                         |
| T5  | Família (L807)      | **Molécula** é o princípio ativo — a substância que produz o efeito terapêutico.<br/><br/>_Quando usar este modo:_ quando o driver afeta todos os medicamentos que contêm aquela substância, independente da dosagem ou apresentação.<br/><br/>_Ex:_ uma restrição regulatória da ANVISA sobre Baricitinibe impacta o 2mg e o 4mg ao mesmo tempo. A IA identifica automaticamente quais SKUs têm essa molécula na composição.                                                       |
| T6  | SKU (L942)          | **SKU** (Stock Keeping Unit) é o código único de cada apresentação do medicamento.<br/><br/>_Ex:_ Baricitinibe 2mg Blister 28cp = SKU-00312<br/>Baricitinibe 4mg Blister 28cp = SKU-00313<br/><br/>Selecione o SKU mais específico afetado pelo driver. Se o evento impacta toda a molécula, use o modo _Por Molécula_.                                                                                                                                                             |
| T7  | Categoria (L1437)   | **Agrupa o driver por natureza do evento** para facilitar a modelagem causal.<br/><br/>_Exemplos:_<br/>📡 _Mídia:_ TV, rádio, digital, outdoor<br/>🛒 _Comercial:_ ação PDV, visita médica, desconto<br/>⚙️ _Supply:_ falta de MP, recall, reprovação de lote<br/>📋 _Regulatório:_ ANVISA, CMED, RENAME<br/>🌡️ _Sazonalidade:_ gripe, dengue, calendário<br/><br/>A categoria define os tipos disponíveis no campo abaixo.                                                         |
| T8  | Tipo (L1453)        | **Define exatamente que tipo de evento é este driver** e quais campos adicionais serão solicitados.<br/><br/>O tipo determina também como o _ApsenPLPEngine_ vai transformar este driver em variável exógena para o modelo:<br/>• TV → variável numérica com GRP<br/>• Falta de MP → indicador de demanda censurada<br/>• Recall → indicador de demanda censurada<br/>• Sazonalidade → padrão recorrente de Fourier<br/>• Viral → indicador agudo com decaimento                    |
| T9  | Regiões (L1473)     | **Onde o evento tem efeito geográfico.**<br/><br/>Impacta como o modelo trata a série: um evento regional deve ser modelado apenas na série regional, não na nacional.<br/><br/>_Dica:_ se nacional mas com intensidade maior no Sudeste, selecione Nacional mesmo assim — o analista pondera na modelagem.                                                                                                                                                                         |
| T10 | Canal (L1484)       | **Canal de distribuição/venda afetado pelo driver.**<br/><br/>• _Farmácias:_ sell-out varejo<br/>• _Hospitalar:_ licitações institucionais<br/>• _Governo/Licitação:_ RENAME, Farmácia Popular, CEAF                                                                                                                                                                                                                                                                                |
| T11 | Intensidade (L1497) | **Estimativa do impacto na demanda (1 baixa → 5 muito alta).**<br/><br/>⚡ 1 — marginal, difícil detectar<br/>⚡⚡ 2 — variação até ~5%<br/>⚡⚡⚡ 3 — variação visível ~10–15%<br/>⚡⚡⚡⚡ 4 — distorção clara >15%<br/>⚡⚡⚡⚡⚡ 5 — ruptura ou pico expressivo                                                                                                                                                                                                                 |
| T12 | Uplift (L1506)      | **Aumento percentual esperado sobre a demanda base (baseline).**<br/><br/>É preenchido automaticamente pela intensidade, mas você pode ajustar para o valor específico deste driver.<br/><br/>_Ex:_ uplift de +15% significa que a demanda esperada é 15% maior que seria sem este driver.<br/><br/>Adimensional — funciona igual para qualquer SKU, independente do volume.                                                                                                        |
| T13 | Verba (L1517)       | **Valor total investido (opcional).**<br/><br/>Útil para modelos de Marketing Mix Modeling (MMM).<br/>Para eventos não financeiros deixe em branco.                                                                                                                                                                                                                                                                                                                                 |
| T14 | Observações (L1521) | **Campo livre para contexto adicional.**<br/><br/>• Lag estimado: "efeito esperado ~3 semanas após veiculação"<br/>• Antecipação: "distribuidores devem antecipar pedidos antes do reajuste"<br/>• Ressalvas: "campanha cancelada na semana 2"                                                                                                                                                                                                                                      |

### 3.10 Estados

| Estado         | Quando                                      | Visual                                                                                                                                            |
| -------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| carregando     | lookups (e driver em view/edit)             | `loading.tsx` / `DriverFormSkeleton`: header + 2 cards com blocos `bg-apsen-bg` nas posições dos campos, `role="status"` "Carregando formulário…" |
| erro           | falha nos lookups ou no driver (exceto 404) | `ErrorState` com a mensagem de `errorMessage(error)` e "Tentar novamente" (refaz as queries)                                                      |
| não encontrado | `NotFoundError`                             | `notFound()` → `not-found.tsx`                                                                                                                    |
| dados          | —                                           | Cards conforme o modo                                                                                                                             |

### 3.11 Textos (toasts, pt-BR, exatos)

| Situação                                              | Toast                                                  | Erro no campo (`FormField error`, foco)                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| modo SKU sem SKU                                      | ⚠️ Selecione um Produto / SKU.                         | Produto / SKU: "Selecione um Produto / SKU."                                                                                            |
| modo Família sem família                              | ⚠️ Selecione a Família / Molécula.                     | Família / Molécula                                                                                                                      |
| modo Franquia sem franquia                            | ⚠️ Selecione a Franquia / Linha Terapêutica.           | Franquia / Linha Terapêutica                                                                                                            |
| sem tipo                                              | ⚠️ Selecione o tipo de driver.                         | Tipo específico (ou Categoria, se vazia)                                                                                                |
| Data Fim vazia [derivado, decisão 10]                 | ⚠️ Informe a data fim.                                 | Data Fim: "Informe a data fim."                                                                                                         |
| período inválido                                      | ⚠️ Verifique a data fim (máximo 1 ano da data início). | Data Fim marcada inválida + caixa do período                                                                                            |
| campo obrigatório do tipo vazio [derivado, RN-FRM-03] | ⚠️ Preencha o campo obrigatório: {label}.              | o campo: "Preencha o campo obrigatório."                                                                                                |
| criado                                                | ✅ Driver registrado com sucesso!                      | —                                                                                                                                       |
| atualizado                                            | ✅ Driver atualizado com sucesso!                      | —                                                                                                                                       |
| falha da API [derivado]                               | ⚠️ Não foi possível salvar o driver. Tente novamente.  | —                                                                                                                                       |
| sair com alterações [derivado]                        | —                                                      | `Modal` "Sair sem salvar?" / "As alterações deste driver serão perdidas." com "Continuar editando" (ghost) e "Sair sem salvar" (danger) |

## 4. Contratos de API consumidos

Base `{NEXT_PUBLIC_API_URL}` (padrão `http://localhost:3001`). Todo payload passa por schema zod em `src/infrastructure/drivers/schemas.ts` ou `src/infrastructure/catalogo/schemas.ts`; falha → `InvalidResponseError`. `HttpError` 404 em recurso por id → `NotFoundError`; 5xx, `NetworkError` e timeout sobem como estão (tela de erro / toast).

### 4.1 Drivers

`GET /drivers/{id}` — 200:

```json
{
  "id": 3,
  "modo": "sku",
  "produto": "LEVOXIN 500MG - 7 COMP. (2300)",
  "molecula": "LEVOXIN",
  "codigo": "2300",
  "skus_afetados_ia": [],
  "titulo": "Ajuste de preço Levoxin 500mg Jul/2026",
  "periodo": { "inicio": "2026-07-15", "fim": "2027-01-15" },
  "tipo": "preco",
  "cobertura": { "regioes": ["sudeste", "sul"], "canais": ["farmacias"] },
  "intensidade_esperada": 3,
  "uplift_pct": 11,
  "verba_rs": null,
  "observacoes": "Reajuste CMED aplicado à apresentação de 7 comprimidos.",
  "parametros": { "preco_novo": "42.90", "variacao_pct": "6.5" }
}
```

`POST /drivers` (201, devolve o registro) e `PUT /drivers/{id}` (200) — corpo no mesmo formato, com `id` UUID no novo:

```json
{
  "id": "6f1c2a9e-3b7d-4e0a-9f51-2d8c7b4a1e03",
  "modo": "familia",
  "produto": "LEVOXIN (Família)",
  "molecula": "LEVOXIN",
  "codigo": "",
  "skus_afetados_ia": ["2298", "2299", "2300", "2310", "2376"],
  "titulo": "Campanha Inverno Globo Jul/26",
  "periodo": { "inicio": "2026-07-01", "fim": "2026-08-31" },
  "tipo": "concorrente",
  "cobertura": { "regioes": ["nacional"], "canais": ["farmacias"] },
  "intensidade_esperada": 1,
  "uplift_pct": 2,
  "verba_rs": null,
  "observacoes": "",
  "parametros": {
    "lab_conc": "EMS",
    "tipo_conc": "Genérico",
    "mol_conc": "LEVOXIN",
    "evento_conc": "Campanha de mídia"
  }
}
```

```ts
const driverDtoSchema = z.object({
  id: z.union([z.string().min(1), z.number().int().positive()]),
  modo: z.enum(['franquia', 'familia', 'sku']),
  produto: z.string(),
  molecula: z.string(),
  codigo: z.string(),
  skus_afetados_ia: z.array(z.string()),
  titulo: z.string(),
  periodo: z.object({ inicio: z.string(), fim: z.string() }),
  tipo: z.string().min(1),
  cobertura: z.object({ regioes: z.array(z.string()), canais: z.array(z.string()) }),
  intensidade_esperada: z.number().int().min(1).max(5),
  uplift_pct: z.number().nullable(),
  verba_rs: z.number().nullable(),
  observacoes: z.string(),
  parametros: z.record(z.string(), z.union([z.string(), z.number()])),
});
```

Mapper: `id` → `String(id)`; `parametros` → valores com `String(v)`; snake_case → camelCase do domínio; volta (`toDriverDto`) na ordem de chaves acima.

### 4.2 Lookups do formulário (catálogos estáticos, `staleTime` 5 min)

| Endpoint            | Uso                     | Schema (campos validados)                                                                                                                                 |
| ------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /categorias`   | cascata                 | `{ id: number int 0–9, label, slug, tipos: { slug, label }[] }[]`                                                                                         |
| `GET /tipos`        | filtro de ativos        | `{ id, slug, ativo: boolean }[]` (demais campos ignorados)                                                                                                |
| `GET /camposTipo`   | Card 03 (47 configs)    | ver abaixo                                                                                                                                                |
| `GET /intensidades` | slider/legenda          | `{ id: 1–5, label, faixa, default: number, desc }[]`, exatamente 5                                                                                        |
| `GET /config`       | rótulos curtos e chips  | `{ LABEL: Record<string,string>, opcoes: { regioes: {value,label}[], canais: {value,label}[], canaisDefault: string[] } }` (o resto do objeto é ignorado) |
| `GET /franquias`    | select do modo Franquia | `{ id, familias: string[] }[]`                                                                                                                            |

```ts
const campoOptionSchema = z.union([z.string(), z.object({ label: z.string(), group: z.string() })]);
const campoSchema = z
  .object({
    label: z.string().min(1),
    required: z.boolean(),
    id: z.string().startsWith('d_'),
    param: z.string().min(1),
    type: z.enum(['text', 'number', 'date', 'select', 'autocomplete']),
    options: z.array(campoOptionSchema).min(1).optional(),
    placeholder: z.string().optional(),
    step: z.string().optional(),
    readonly: z.boolean().optional(),
    autocomplete: z.enum(['labs', 'marcas']).optional(),
    labelHint: z.string().optional(),
  })
  .refine((c) => c.type !== 'select' || c.options !== undefined)
  .refine((c) => c.type !== 'autocomplete' || c.autocomplete !== undefined);
const camposTipoSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  layout: z.enum(['g2', 'g3']),
  campos: z.array(campoSchema).min(1),
});
```

Exemplo (`GET /camposTipo` → item `preco`): `{"id":"preco","title":"💲 Mudança de Preço","layout":"g3","campos":[{"label":"Tipo","required":false,"id":"d_tipo_preco","param":"tipo_preco","type":"select","options":["Reajuste preço fábrica","Reajuste PMVG (CMED)"]},{"label":"Variação (%)","required":false,"id":"d_var_preco","param":"var_preco","type":"number","placeholder":"Auto","step":"0.01","readonly":true}]}`.

### 4.3 Catálogo de produtos (sob demanda)

| Endpoint                                                                            | Uso                                                                    | Resposta                                                                                                                                                             |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /skus?q={termo}&_sort=familia,id&_order=asc,asc&_limit=20`                     | autocomplete de SKU (termo vazio: sem `q`)                             | `{ id, label, familia, franquia }[]` ex. `[{"id":"LEVOXIN 500MG - 7 COMP. (2300)","label":"LEVOXIN 500MG - 7 COMP. (2300)","familia":"LEVOXIN","franquia":"ASTER"}]` |
| `GET /skus/{encodeURIComponent(id)}`                                                | pré-preencher SKU (view/edit); 404 → `null`                            | um SKU                                                                                                                                                               |
| `GET /skus?q={codigo}&_limit=1`                                                     | segunda tentativa quando o `produto` não é um id de SKU                | `[]` ou 1 SKU                                                                                                                                                        |
| `GET /familias?id_like={regex escapado}&_sort=franquia,id&_order=asc,asc&_limit=20` | autocomplete de família                                                | `{ id, franquia, skus: string[] }[]`                                                                                                                                 |
| `GET /familias/{encodeURIComponent(id)}`                                            | SKUs da família, `?familia=`, pré-preenchimento; 404 → `NotFoundError` | uma família                                                                                                                                                          |
| `GET /familias?franquia={f}`                                                        | caixa de SKUs da franquia e `skus_afetados_ia` (≤ 18 famílias)         | `{ id, franquia, skus }[]`                                                                                                                                           |

`id_like` usa regex no json-server: o termo passa por `escapeRegex` (`[.*+?^${}()|[\]\\]` → `\\$&`), ex. `MOTILEX HA + MSM`.

### 4.4 Concorrentes (decisão 20)

| Endpoint                                                                                                          | Uso                                                                 | Resposta                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `GET /concorrentes?laboratorio_like={regex escapado}&_limit=20` (termo vazio: `_limit=12`, fiel ao `slice(0,12)`) | laboratórios                                                        | `{ id, laboratorio, marcas: string[] }[]` → `laboratorio[]` na ordem da API |
| `GET /concorrentes/{encodeURIComponent(lab)}`                                                                     | marcas do laboratório; 404 → `[]` (laboratório digitado livremente) | um concorrente; marcas filtradas no domínio por RN-11                       |

## 5. Domínio (`src/domain`)

TypeScript puro, sem React/Zod/IO.

### 5.1 `src/domain/drivers/Driver.ts`

```ts
export type Granularidade = 'franquia' | 'familia' | 'sku';
export type Intensidade = 1 | 2 | 3 | 4 | 5;
export interface Driver {
  readonly id: string;
  readonly modo: Granularidade;
  readonly produto: string;
  readonly molecula: string;
  readonly codigo: string;
  readonly skusAfetadosIa: readonly string[];
  readonly titulo: string;
  readonly periodo: { readonly inicio: string; readonly fim: string };
  readonly tipo: string;
  readonly cobertura: { readonly regioes: readonly string[]; readonly canais: readonly string[] };
  readonly intensidadeEsperada: Intensidade;
  readonly upliftPct: number | null;
  readonly verbaRs: number | null;
  readonly observacoes: string;
  readonly parametros: Readonly<Record<string, string>>;
}
```

### 5.2 Lookups (`src/domain/drivers/lookups.ts`)

`Categoria { id: number; label; slug; tipos: { slug; label }[] }`, `TipoStatus { slug; ativo }`, `CampoTipo` (campos do schema com `options?: (string | { label; group })[]`), `CamposTipo { id; title; layout: 'g2'|'g3'; campos }`, `IntensidadeInfo { id: Intensidade; label; faixa; default: number; desc }`, `ChipOpcao { value; label }`, `DriverFormConfig { labels: Record<string,string>; regioes; canais; canaisDefault }`.

### 5.3 Portas

```ts
export interface DriverRepository {
  get(id: string): Promise<Driver>;
  create(driver: Driver): Promise<Driver>;
  update(driver: Driver): Promise<Driver>;
}
export interface DriverLookupRepository {
  listCategorias(): Promise<Categoria[]>;
  listTipos(): Promise<TipoStatus[]>;
  listCamposTipo(): Promise<CamposTipo[]>;
  listIntensidades(): Promise<IntensidadeInfo[]>;
  getFormConfig(): Promise<DriverFormConfig>;
  searchLaboratorios(termo: string, limit: number): Promise<string[]>;
  getMarcas(laboratorio: string): Promise<string[]>;
}
export interface IdGenerator {
  next(): string;
}
```

`src/domain/catalogo/`: `Sku { id; label; familia; franquia }`, `Familia { id; franquia; skus: readonly string[] }`, `Franquia { id; familias: readonly string[] }` e

```ts
export interface ProductCatalogRepository {
  searchSkus(termo: string, limit: number): Promise<Sku[]>;
  findSku(produto: string, codigo: string): Promise<Sku | null>;
  searchFamilias(termo: string, limit: number): Promise<Familia[]>;
  getFamilia(id: string): Promise<Familia>;
  listFamiliasDaFranquia(franquia: string): Promise<Familia[]>;
  listFranquias(): Promise<Franquia[]>;
}
```

### 5.4 Regras puras

| Arquivo                      | Exporta                                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `drivers/periodo.ts`         | `dataFimMaxima(inicio)`; `validarPeriodo(inicio, fim): 'ok' \| 'anterior' \| 'excede'` (RN-04, RN-05)                                                             |
| `drivers/intensidade.ts`     | `upliftSugerido(n, intensidades)`, `legendaIntensidade(n, intensidades)`, `dicaUplift(manual, info)` (RN-12)                                                      |
| `drivers/variacaoPreco.ts`   | `variacaoPreco(ant, novo): string \| null` (RN-10)                                                                                                                |
| `drivers/draft.ts`           | `DriverDraft`, `draftInicial(ctx)`, `trocarModo`, `trocarCategoria`, `trocarTipo`, `definirIntensidade`, `editarUplift`, `limpar`, `draftDeDriver`, `isDraftSujo` |
| `drivers/camposDinamicos.ts` | `valoresIniciais(campos)`, `moleculaHerdada(draft)`, `montarParametros(campos, valores, preservar?)`, `tiposDisponiveis(categoria, tipos, tipoAtual?)`            |
| `drivers/validarDraft.ts`    | `validarDraft(draft, campos): DraftErro \| null` (RN-03)                                                                                                          |
| `drivers/montarDriver.ts`    | `codigoSku(nome)`, `montarDriver(draft, contexto, id)` (RN-06)                                                                                                    |
| `drivers/concorrentes.ts`    | `filtrarSugestoes(lista, termo)` (RN-11)                                                                                                                          |
| `drivers/errors.ts`          | `DriverValidationError extends DomainError { field: DraftCampo }`                                                                                                 |
| `catalogo/skuLabel.ts`       | `tagDoSku(sku)` → "{familia} ({franquia})"                                                                                                                        |

`DriverDraft`:

```ts
export type DraftCampo =
  'sku' | 'familia' | 'franquia' | 'categoria' | 'tipo' | 'fim' | `param:${string}`;
export interface DriverDraft {
  modo: Granularidade;
  franquia: string;
  familia: string;
  sku: Sku | null;
  titulo: string;
  inicio: string;
  fim: string;
  categoriaId: number | null;
  tipo: string;
  parametros: Record<string, string>;
  herdado: string | null;
  regioes: string[];
  canais: string[];
  intensidade: Intensidade;
  uplift: string;
  upliftManual: boolean;
  verba: string;
  observacoes: string;
}
```

## 6. Aplicação (`src/application`)

Casos de uso com portas no construtor; DTOs simples em `src/application/drivers/dto.ts`.

| Caso de uso            | Construtor                                                    | `execute`                           | Saída                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GetDriverFormLookups` | `DriverLookupRepository`, `ProductCatalogRepository`          | `()`                                | `DriverFormLookupsDto { categorias, tiposAtivos: string[], camposPorTipo: Record<string, CamposTipo>, intensidades, config, franquias }` (chamadas em paralelo)              |
| `GetDriverForForm`     | `DriverRepository`, `ProductCatalogRepository`                | `(id)`                              | `{ driver, sku: Sku \| null, familia: Familia \| null }` (resolve o SKU por `findSku(produto, codigo)`; família por `getFamilia(molecula)` só no modo família, 404 → `null`) |
| `CreateDriver`         | `DriverRepository`, `ProductCatalogRepository`, `IdGenerator` | `({ draft, campos })`               | `Driver`; lança `DriverValidationError`                                                                                                                                      |
| `UpdateDriver`         | `DriverRepository`, `ProductCatalogRepository`                | `({ id, draft, campos, original })` | `Driver` (mesmo `id`, parâmetros preservados por RN-08)                                                                                                                      |
| `SearchSkus`           | `ProductCatalogRepository`                                    | `(termo)`                           | `Sku[]` (limite 20)                                                                                                                                                          |
| `SearchFamilias`       | `ProductCatalogRepository`                                    | `(termo)`                           | `Familia[]` (limite 20)                                                                                                                                                      |
| `GetFamiliaSkus`       | `ProductCatalogRepository`                                    | `(familia)`                         | `string[]` (404 → `[]`)                                                                                                                                                      |
| `GetFranquiaSkus`      | `ProductCatalogRepository`                                    | `(franquia)`                        | `{ familia, skus }[]` na ordem de `franquias[f].familias`                                                                                                                    |
| `SearchLaboratorios`   | `DriverLookupRepository`                                      | `(termo)`                           | `string[]` (vazio → 12, senão 20)                                                                                                                                            |
| `SearchMarcas`         | `DriverLookupRepository`                                      | `({ laboratorio, termo })`          | `string[]` (`filtrarSugestoes`)                                                                                                                                              |

`CreateDriver`/`UpdateDriver` resolvem o contexto antes de montar: SKU escolhido (já no draft), `getFamilia(draft.familia).skus` no modo família, `listFamiliasDaFranquia(draft.franquia)` ordenado por `franquias[f].familias` no modo franquia.

## 7. Infraestrutura (`src/infrastructure`)

- `drivers/schemas.ts`: `driverDtoSchema`, `categoriaSchema`, `tipoStatusSchema`, `camposTipoSchema`, `intensidadeSchema`, `driverConfigSchema`, `concorrenteSchema`.
- `drivers/driverMapper.ts`: `toDriver(dto)`, `toDriverDto(driver)`.
- `drivers/HttpDriverRepository.ts` (`get`, `create` → `POST`, `update` → `PUT /drivers/{encodeURIComponent(id)}`; 404 → `NotFoundError('Driver', id)`).
- `drivers/HttpDriverLookupRepository.ts` (rotas do §4.2 e §4.4; `getMarcas` com 404 → `[]`).
- `drivers/CryptoIdGenerator.ts` (`crypto.randomUUID()`).
- `catalogo/schemas.ts` (`skuSchema`, `familiaSchema`, `franquiaSchema`), `catalogo/HttpProductCatalogRepository.ts` (rotas do §4.3), `shared/escapeRegex.ts`.
- Todos sobre o `HttpClient` existente; respostas validadas com `safeParse` → `InvalidResponseError` com o caminho do erro.

## 8. Apresentação (`src/presentation`)

### 8.1 Composição

- `UseCases.drivers`: `formLookups`, `getForForm`, `create`, `update`, `searchLaboratorios`, `searchMarcas`; `UseCases.catalogo`: `searchSkus`, `searchFamilias`, `familiaSkus`, `franquiaSkus` (cada um `Pick<…, 'execute'>`). `createContainer` instancia os repositórios HTTP com o `FetchHttpClient` compartilhado e `CryptoIdGenerator`. `createFakeUseCases` ganha stubs dos dois módulos.
- `queryKeys.drivers = { all: ['drivers'], detail: (id) => ['drivers','detail',id], forForm: (id) => ['drivers','form',id], lookups: ['drivers','lookups'] }`; `queryKeys.catalogo = { all: ['catalogo'], familiaSkus: (f) => ['catalogo','familia-skus',f], franquiaSkus: (f) => ['catalogo','franquia-skus',f] }`.
- Hooks (`src/presentation/hooks/`): `useDriverFormLookups` (`staleTime` 5 min), `useDriverForForm(id)`, `useFamiliaSkus(familia)`, `useFranquiaSkus(franquia)` (`enabled` com valor), `useCreateDriverMutation`, `useUpdateDriverMutation` (invalidam `['drivers']` e `['catalogo']`, o que atualiza o badge "Meus Registros"), `useUnsavedChangesGuard(dirty)` (`beforeunload` + interceptação de cliques em `a[href]` internos abrindo o modal do §3.11; reutilizar se outra spec já criou). Buscas dos autocompletes usam `queryClient.fetchQuery` com chaves `['catalogo','skus',termo]`, `['catalogo','familias',termo]`, `['drivers','labs',termo]`, `['drivers','marcas',lab,termo]` (`staleTime` 5 min).

### 8.2 Componentes (`src/presentation/features/drivers/form/`)

| Componente                                                                                                | Responsabilidade                                                                                        |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `DriverFormScreen` (`'use client'`)                                                                       | queries, `useReducer` do draft (funções de `draft.ts`), modo, guarda de saída, envio, toasts, navegação |
| `DriverFormHeader`                                                                                        | `PageHeader` + banner + ações (§3.2)                                                                    |
| `IdentificacaoCard`                                                                                       | Card 01: título, datas, `DataFimMessage`, `ModeSelector`, campos do modo                                |
| `FranquiaFields` + `FranquiaSkusBox` · `FamiliaFields` + `FamiliaSkusBox` · `SkuFields` + `SkuAutoFields` | §3.3 itens 4–6                                                                                          |
| `TipoDriverCard` + `SelectedTipoBadge`                                                                    | Card 02                                                                                                 |
| `DynamicFieldsCard` + `DynamicField`                                                                      | Card 03 (`next/dynamic`, só monta com tipo)                                                             |
| `ConcorrenteAutocomplete`                                                                                 | §3.6                                                                                                    |
| `CoberturaCard` + `IntensidadeLegenda` + `UpliftField`                                                    | Card 04                                                                                                 |
| `DriverFormSkeleton`                                                                                      | carregando                                                                                              |
| `driverFormTooltips.tsx`                                                                                  | conteúdos T1–T14                                                                                        |

Foco no primeiro inválido: cada controle registra um `ref` por `DraftCampo`; após `DriverValidationError`, `focus()` no ref do campo e `scrollIntoView({ block: 'center' })` (respeitando `prefers-reduced-motion`).

### 8.3 Navegação pós-envio

new: `familia` válida → `catalogoFamiliaRoute(familia)`, senão `DRIVERS_ROUTE`. edit: `familia` → `catalogoFamiliaRoute(familia)`, senão `DRIVERS_ROUTE`. O guarda de alterações é desligado antes do `router.push`.

## 9. Arquivos

### Novos

- `src/domain/drivers/{Driver,lookups,DriverRepository,DriverLookupRepository,IdGenerator,periodo,intensidade,variacaoPreco,draft,camposDinamicos,validarDraft,montarDriver,concorrentes,errors}.ts`
- `src/domain/drivers/__tests__/{periodo,intensidade,variacaoPreco,draft,camposDinamicos,validarDraft,montarDriver,concorrentes}.test.ts`
- `src/domain/catalogo/{Produto,ProductCatalogRepository,skuLabel}.ts`, `src/domain/catalogo/__tests__/skuLabel.test.ts`
- `src/application/drivers/{dto,GetDriverFormLookups,GetDriverForForm,CreateDriver,UpdateDriver,SearchLaboratorios,SearchMarcas}.ts` + `__tests__/` de cada um
- `src/application/catalogo/{SearchSkus,SearchFamilias,GetFamiliaSkus,GetFranquiaSkus}.ts` + `__tests__/`
- `src/infrastructure/drivers/{schemas,driverMapper,HttpDriverRepository,HttpDriverLookupRepository,CryptoIdGenerator}.ts` + `__tests__/`
- `src/infrastructure/catalogo/{schemas,HttpProductCatalogRepository}.ts` + `__tests__/`; `src/infrastructure/shared/escapeRegex.ts` + teste
- `src/presentation/features/drivers/form/` (componentes do §8.2) + `__tests__/`
- `src/presentation/hooks/{useDriverFormLookups,useDriverForForm,useFamiliaSkus,useFranquiaSkus,useDriverMutations,useUnsavedChangesGuard}.ts` + `__tests__/`
- `src/app/drivers/novo/page.tsx`, `src/app/drivers/[id]/page.tsx`, `src/app/drivers/[id]/editar/page.tsx`, `src/app/drivers/loading.tsx`, `src/app/drivers/error.tsx`, `src/app/drivers/[id]/not-found.tsx` + `src/app/__tests__/driversRoutes.test.tsx`
- `test/factories/drivers.ts` (`makeDriver`, `makeDraft`, `makeCamposTipo`, `makeLookups`, `makeSku`, `makeFamilia`)

### Modificados

- `src/presentation/providers/UseCasesContext.tsx` — módulos `drivers` e `catalogo`.
- `src/main/container.ts` (+ teste) — repositórios e casos de uso.
- `test/renderWithProviders.tsx` — stubs dos módulos.
- `src/presentation/hooks/queryKeys.ts` — chaves do §8.1.
- `src/presentation/navigation/routes.ts` (+ teste) — helpers do §3.1.
- `src/presentation/navigation/screens.ts` — conferir os três padrões da tela `form` (onda 0).
- `src/presentation/components/ui/icons.tsx` + `index.ts` (+ teste do índice) — `CheckIcon`.
- `src/presentation/components/ui/TextInput.tsx` — prop `invalid?: boolean` (põe `aria-invalid="true"` fora de `FormField error`) e `aria-describedby?: string`, se a onda 1 não tiver.
- `src/app/globals.css` (+ `src/app/__tests__/globals.test.ts`) — tokens `--color-apsen-teal-soft` (claro `#f0fdfa`, escuro `#10302c`) e `--color-apsen-red-soft-b` (claro `#fca5a5`, escuro `#7f2d2d`); se outra spec já criou token com o mesmo valor, reutilizar.
- `docs/design/DESIGN_SPEC.md` — seção §4 "Registrar Driver" (tabelas do §3) e os tokens no §1.

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Modo padrão `sku`. `trocarModo` limpa `franquia`, `familia` e `sku` dos modos inativos (L4808–4833); não mexe no resto.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| RN-02 | `codigoSku(nome)`: grupo de `/\((\d+)\)\s*$/` ou o nome sem espaços nas pontas. `montarDriver` (decisão 6): franquia → `produto "{F} (Franquia)"`, `molecula F`, `codigo ''`, `skusAfetadosIa` = `codigoSku` de todos os SKUs das famílias da franquia, na ordem família → SKU; família → `"{FAM} (Família)"`, `molecula FAM`, `codigo ''`, SKUs da família; SKU → `produto = sku.label`, `molecula = sku.familia`, `codigo = codigoSku(sku.label)`, `skusAfetadosIa = []`. Também: `titulo`/`observacoes` com `trim`, `periodo {inicio, fim}`, `cobertura` na ordem das opções, `intensidadeEsperada`, `upliftPct = uplift.trim() ? Number(uplift) : null`, `verbaRs` idem, `parametros` por RN-08. |
| RN-03 | `validarDraft` devolve o **primeiro** erro na ordem: produto do modo (`sku`/`familia`/`franquia`) → `tipo` → `fim` vazio → `validarPeriodo !== 'ok'` com `inicio` e `fim` preenchidos → campos `required` do tipo vazios (ordem do array). Textos no §3.11. Título e Data Início não são obrigatórios (decisão 10; divergência com RN-DRV-01 registrada).                                                                                                                                                                                                                                                                                                                                            |
| RN-04 | `dataFimMaxima(inicio)` = mesma data no ano seguinte, com a regra do `Date.setFullYear` (29/02 → 01/03); sem `inicio`, Data Fim sem `min`/`max`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| RN-05 | `validarPeriodo`: qualquer data vazia → `ok`; `fim < inicio` → `anterior`; `fim > dataFimMaxima(inicio)` → `excede`; senão `ok` (início = fim é válido). Comparação de strings `YYYY-MM-DD`. RN-DRV-04.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| RN-06 | `skusAfetadosIa` nunca usa `moleculaSkus` (corrige L6099/L6103).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| RN-07 | `tiposDisponiveis(categoria, tipos, tipoAtual)`: tipos da categoria cujo `slug` está ativo em `/tipos` (slug ausente em `/tipos` conta como ativo), mais `tipoAtual` se for da categoria. A categoria do tipo vem de `categorias[].tipos` (corrige o `TIPO_CAT` falsy da categoria 0, L7775).                                                                                                                                                                                                                                                                                                                                                                                                        |
| RN-08 | `montarParametros(campos, valores, preservar)`: para cada campo do tipo, `valores[param].trim()` não vazio entra com chave `param` (decisão 7). `preservar` = `original.parametros` só na edição com `tipo === original.tipo`: chaves que não são `param` de nenhum campo entram antes das novas.                                                                                                                                                                                                                                                                                                                                                                                                    |
| RN-09 | Molécula herdada: ao escolher `concorrente` ou `conc_lanc`, se `mol_conc`/`cl_molecula` está vazio, recebe `sku.familia` (modo SKU), `familia` (modo Família) ou nada (Franquia); `herdado` guarda o valor e zera ao trocar de tipo.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| RN-10 | `variacaoPreco(ant, novo)`: ambos preenchidos, numéricos e `ant !== 0` → `((novo − ant) / ant × 100).toFixed(2)`; senão `null` → campo vazio (placeholder "Auto"). Recalcula a cada mudança.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| RN-11 | `filtrarSugestoes(lista, termo)`: termo `trim().toLowerCase()`; vazio → 12 primeiros; senão `includes` sem diferenciar caixa, na ordem original. Marca exige laboratório (RN-DRV-08). Escolher `lab_conc` zera `conc_nome`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| RN-12 | Intensidade inicial 1; `definirIntensidade(n)` → `uplift = String(default)`, `upliftManual = false`; `editarUplift(v)` → `upliftManual = true`. Dica: manual → "Valor ajustado manualmente."; senão "Sugerido pela intensidade ({faixa}) — ajuste se necessário.". Uplift opcional (RN-DRV-07).                                                                                                                                                                                                                                                                                                                                                                                                      |
| RN-13 | `limpar` (L6176, decisão 10): mantém `modo`; zera produto, título, datas, categoria, tipo, parâmetros, regiões, verba, observações; canais = `canaisDefault`; intensidade 1 com uplift sugerido.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| RN-14 | `draftDeDriver(driver, { sku, familia, categorias, camposPorTipo })`: modo; franquia = `molecula` (modo franquia); família = `familia?.id ?? ''`; SKU resolvido ou `null`; categoria pelo tipo; `parametros` = valores iniciais do tipo sobrescritos pelos salvos; intensidade salva; `uplift` salvo (`upliftManual = true`) ou sugerido; chips, verba (`String` ou `''`), observações.                                                                                                                                                                                                                                                                                                              |
| RN-15 | Novo driver: `id = IdGenerator.next()` (UUID, RN-SEG-03), `POST`. Edição: `PUT` com o mesmo `id` (RN-DRV-10).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| RN-16 | `?familia=X`: se `GET /familias/X` existe, modo Família com X; senão ignora (sem "Voltar aos drivers").                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| RN-17 | `isDraftSujo(draft, inicial)`: comparação estrutural; liga a guarda de saída (§7.4). Desligada no modo view e após salvar.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## 11. Requisitos não funcionais

| Item (ARQUITETURA §7)       | Como se aplica                                                                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 listas sob demanda      | SKU, Família e Laboratório com busca no servidor e `_limit` (20; 12 para laboratório sem termo); debounce 300 ms; nenhum download de `skus`/`familias` inteiros. Paginação de tabela: não se aplica.                                                                                  |
| 7.2 roteamento/carregamento | três rotas reais; `loading.tsx` com skeleton, `error.tsx` com "Tentar novamente", `not-found.tsx`; `DynamicFieldsCard` e o modal de saída por `next/dynamic`; guarda de perfil antes das queries (onda 0).                                                                            |
| 7.3 cache e envio           | lookups `staleTime` 5 min; mutações invalidam só `['drivers']` e `['catalogo']`; botão de envio desabilitado com "Salvando…"; sem atualização otimista (formulário longo navega após o sucesso).                                                                                      |
| 7.4 formulários             | validação no domínio (`validarDraft`) com os textos do protótipo + RN-DRV/RN-FRM; erro no `FormField` e foco no primeiro inválido; aviso de alterações não salvas; datas com `min`/`max`, números com `step`.                                                                         |
| 7.5 a11y/responsivo         | todos os controles com rótulo; tooltips focáveis; `DataFimMessage` `role="alert"`; legenda e dica de uplift `aria-live="polite"`; `ModeSelector` operável por teclado; grades colapsam até 360 px (`FormGrid`, `SkuAutoFields`, cascata); `prefers-reduced-motion` no scroll ao erro. |
| 7.6 segurança               | nenhum `console.*`; requisições só pelo `HttpClient` (timeout e headers centralizados); termos de busca escapados (`escapeRegex`, `encodeURIComponent`).                                                                                                                              |

## 12. BDD — Cenários de teste unitário

| Cenário                                                                                                                                                             | Arquivo de teste                                                                                                             | Asserção                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 Dado lookups carregados, quando abre `/drivers/novo`, então mostra header, ScreenDesc, Cards 01/02 e esconde 03/04                                            | `src/presentation/features/drivers/form/__tests__/DriverFormScreen.test.tsx`                                                 | `heading` "Registrar Driver de Demanda"; texto do subtítulo; `queryByText(/Parâmetros:/)` nulo; "Cobertura, Canal & Impacto" ausente                                                                                                                                                                                    |
| CA-01 Dado lookups pendentes / com erro, quando renderiza, então skeleton e depois erro com retry                                                                   | `DriverFormScreen.test.tsx`                                                                                                  | `role="status"` "Carregando formulário…"; `ErrorState`; clicar "Tentar novamente" chama `formLookups.execute` de novo                                                                                                                                                                                                   |
| CA-02 / RN-04 / RN-05 Dado início 2026-07-01, quando digita fim 2026-06-30 e depois 2027-07-02, então mostra as duas mensagens e `max="2027-07-01"`                 | `IdentificacaoCard.test.tsx`, `src/domain/drivers/__tests__/periodo.test.ts`                                                 | `role="alert"` com cada texto; Data Fim `aria-invalid="true"`; fim 2027-07-01 limpa; `dataFimMaxima('2024-02-29')` = `2025-03-01`; vazio → `ok`                                                                                                                                                                         |
| CA-03 / RN-01 Dado SKU escolhido, quando troca para Família e volta, então o SKU foi limpo                                                                          | `IdentificacaoCard.test.tsx`, `draft.test.ts`                                                                                | `radio`/botão "SKU" ativo por padrão; após trocar, Autocomplete de SKU vazio; `trocarModo` zera os 3 campos                                                                                                                                                                                                             |
| CA-04 Dado franquia ASTER, quando seleciona, então lista famílias e SKUs da franquia                                                                                | `FranquiaFields.test.tsx`                                                                                                    | título "SKUs da franquia — somente leitura"; nomes de família e SKUs; vazio "Nenhum SKU encontrado."                                                                                                                                                                                                                    |
| CA-04 Dado família com 3 SKUs, quando seleciona no autocomplete, então textarea com 3 linhas e `rows=4`                                                             | `FamiliaFields.test.tsx`                                                                                                     | `searchFamilias.execute` chamado com o termo após 300 ms (fake timers); `textbox` "SKUs identificados pela IA" `readonly` com o valor e `rows="4"`                                                                                                                                                                      |
| CA-04 Dado SKU escolhido, quando seleciona, então grade com nome, família e franquia                                                                                | `SkuFields.test.tsx`                                                                                                         | 3 valores; tag "LEVOXIN (ASTER)" no item                                                                                                                                                                                                                                                                                |
| CA-05 / RN-07 Dado categoria Comercial com `fv` inativo, quando escolhe a categoria, então `fv` não aparece; abrindo driver `fv`, aparece                           | `TipoDriverCard.test.tsx`, `camposDinamicos.test.ts`                                                                         | tipo desabilitado sem categoria; opções sem "👥 Força de Vendas"; `tiposDisponiveis(..., 'fv')` inclui `fv`; badge "● 💲 Preço selecionado"; trocar categoria some badge e Cards 03/04                                                                                                                                  |
| CA-06 Dado `camposTipo` com cada `type`, quando renderiza, então controles certos                                                                                   | `DynamicFieldsCard.test.tsx`                                                                                                 | `spinbutton` com `step`; `combobox` com primeira opção selecionada; `optgroup` "Sanitário"; `readonly` em Variação; `*` no Laboratório; `labelHint` "(do concorrente)"; `g2` → 2 colunas                                                                                                                                |
| CA-07 / RN-09 Dado modo SKU LEVOXIN, quando escolhe `concorrente`, então Molécula = "LEVOXIN" com `bg-apsen-teal-soft` e placeholder herdado                        | `DynamicFieldsCard.test.tsx`, `camposDinamicos.test.ts`                                                                      | valor e classe; modo Franquia → vazio; campo já preenchido não muda                                                                                                                                                                                                                                                     |
| CA-07 / RN-10 Dado `preco`, quando digita 40 e 42.6, então Variação "6.50"; anterior 0 → vazio                                                                      | `DynamicFieldsCard.test.tsx`, `variacaoPreco.test.ts`                                                                        | `"6.50"`; `variacaoPreco('0','10')` `null`; `variacaoPreco('','1')` `null`                                                                                                                                                                                                                                              |
| CA-08 / RN-11 Dado `concorrente`, quando foca Marca sem laboratório, então mensagem e nenhuma busca; escolhendo "EMS", Marca limpa e placeholder novo               | `ConcorrenteAutocomplete.test.tsx`, `concorrentes.test.ts`                                                                   | "⚠️ Selecione primeiro o laboratório."; `searchMarcas` não chamado; placeholder "Digite para buscar a marca de EMS..."; "⟳ Consultando base de concorrentes..."; rodapé "2 resultado(s) · Fonte: API de Concorrentes (mock)"; vazio "Nenhum resultado. Você pode digitar um valor novo."; `filtrarSugestoes` vazio → 12 |
| CA-08 Dado laboratório desconhecido, quando busca marcas, então `[]`                                                                                                | `HttpDriverLookupRepository.test.ts`                                                                                         | `fakeFetch` 404 em `/concorrentes/X` → `[]`; `laboratorio_like` escapado                                                                                                                                                                                                                                                |
| CA-09 / RN-12 Dado o Card 04, quando move o slider para 4, então legenda "4 — Alto" e uplift 22; digitando, dica manual                                             | `CoberturaCard.test.tsx`, `intensidade.test.ts`                                                                              | inicial "1 — Marginal", uplift "2", dica "Sugerido pela intensidade (+1% a +3%) — ajuste se necessário."; Farmácias marcado; após digitar "Valor ajustado manualmente."                                                                                                                                                 |
| CA-10 / RN-03 Dado formulário sem SKU, quando envia, então toast, erro no campo e foco                                                                              | `DriverFormScreen.test.tsx`, `validarDraft.test.ts`                                                                          | `useToast().show` com "⚠️ Selecione um Produto / SKU."; campo `aria-invalid`; `document.activeElement` é o campo; ordem: sem SKU e sem tipo → erro do SKU; sem fim → "⚠️ Informe a data fim."; Laboratório vazio → "⚠️ Preencha o campo obrigatório: Laboratório."                                                      |
| CA-10 / RN-02 / RN-06 / RN-15 Dado formulário válido no modo Família, quando envia, então `create` com o payload e navega                                           | `DriverFormScreen.test.tsx`, `montarDriver.test.ts`, `CreateDriver.test.ts`                                                  | `create.execute` chamado; toast "✅ Driver registrado com sucesso!"; `routerMock.push('/drivers')`; `skusAfetadosIa` = códigos; franquia agrega famílias na ordem; SKU sem código → nome; `id` do `IdGenerator` falso                                                                                                   |
| CA-10 Dado envio pendente, quando renderiza, então botão "Salvando…" desabilitado                                                                                   | `DriverFormScreen.test.tsx`                                                                                                  | `button` "Salvando…" `disabled`; segundo clique não chama `create`                                                                                                                                                                                                                                                      |
| CA-11 / RN-13 Dado formulário preenchido em modo Família, quando clica "Limpar", então estado inicial mantendo Família                                              | `DriverFormScreen.test.tsx`, `draft.test.ts`                                                                                 | campos vazios; intensidade 1 e uplift "2"; Farmácias marcado; modo Família ativo                                                                                                                                                                                                                                        |
| CA-12 Dado `/drivers/3?familia=LEVOXIN`, quando abre em view, então título, banner, campos travados e ações                                                         | `DriverFormScreen.test.tsx`                                                                                                  | "Visualizar Driver"; "Somente leitura · LEVOXIN"; banner 👁️; todos os `textbox`/`combobox` `disabled`; sem "Adicionar Registro"/"Limpar"; link "Editar" → `/drivers/3/editar?familia=LEVOXIN`; "Voltar" → `/drivers/catalogo/LEVOXIN`                                                                                   |
| CA-13 / RN-14 / RN-08 Dado driver `tv` de categoria 0 com `emissora`, quando abre em edição e salva, então categoria/tipo carregados e `update` preserva `emissora` | `DriverFormScreen.test.tsx`, `draft.test.ts`, `camposDinamicos.test.ts`, `UpdateDriver.test.ts`                              | Categoria "📡 Mídia & Comunicação" selecionada; banner ✏️; botão "Salvar alterações"; uplift salvo com dica manual; `update.execute` com mesmo `id`; `parametros.emissora` mantido; trocando o tipo, chaves antigas somem; toast "✅ Driver atualizado com sucesso!"                                                    |
| CA-14 / RN-16 Dado `?familia=LEVOXIN`, quando abre novo, então Família pré-selecionada e "Voltar aos drivers"; família inexistente ignorada                         | `DriverFormScreen.test.tsx`                                                                                                  | modo Família ativo, caixa de SKUs; link "Voltar aos drivers"; após salvar `push('/drivers/catalogo/LEVOXIN')`; com 404 → modo SKU e sem o link                                                                                                                                                                          |
| CA-14 Dado `id` inexistente, quando abre, então `notFound()`                                                                                                        | `DriverFormScreen.test.tsx`, `HttpDriverRepository.test.ts`                                                                  | `notFound` mockado chamado; 404 → `NotFoundError`                                                                                                                                                                                                                                                                       |
| CA-15 / RN-17 Dado formulário sujo, quando clica num link interno, então modal "Sair sem salvar?"                                                                   | `useUnsavedChangesGuard.test.tsx`                                                                                            | modal aberto; "Continuar editando" mantém; "Sair sem salvar" navega; `beforeunload` com `preventDefault` só se sujo                                                                                                                                                                                                     |
| CA-15 Dado `create` rejeitado, quando envia, então toast de erro e dados mantidos                                                                                   | `DriverFormScreen.test.tsx`                                                                                                  | "⚠️ Não foi possível salvar o driver. Tente novamente."; título continua preenchido; sem navegação                                                                                                                                                                                                                      |
| Contrato Dado payload inválido de `/drivers/{id}`, `/camposTipo` ou `/config`, quando lê, então `InvalidResponseError`                                              | `src/infrastructure/drivers/__tests__/HttpDriverRepository.test.ts`, `HttpDriverLookupRepository.test.ts`, `schemas.test.ts` | `intensidade_esperada: 7` falha; `select` sem `options` falha; `id` numérico vira `"3"`; `parametros` numérico vira texto; `PUT` em `/drivers/3`                                                                                                                                                                        |
| Contrato Dado buscas do catálogo, quando chama, então URLs com limite e regex escapado                                                                              | `src/infrastructure/catalogo/__tests__/HttpProductCatalogRepository.test.ts`, `escapeRegex.test.ts`                          | `/skus?q=lev&_sort=familia,id&_order=asc,asc&_limit=20`; `id_like=MOTILEX%20HA%20%5C%2B%20MSM`; `findSku` tenta id e depois `q=codigo`                                                                                                                                                                                  |
| Rotas Dado as páginas, quando renderiza com `params`/`searchParams` Promise, então passam modo, id e família                                                        | `src/app/__tests__/driversRoutes.test.tsx`                                                                                   | `metadata.title` de cada rota; `familia` em array usa o primeiro                                                                                                                                                                                                                                                        |
| Tokens Dado `globals.css`, quando lê, então tokens novos nos dois temas                                                                                             | `src/app/__tests__/globals.test.ts`                                                                                          | `--color-apsen-teal-soft: #f0fdfa;` no `@theme` e valor escuro em `html.dark`; idem `red-soft-b`                                                                                                                                                                                                                        |
