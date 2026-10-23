# Padrões de Tela — mapeamento do protótipo para o Marketing Insights

Fonte da verdade: `C:/Users/erik.santos/Downloads/di-drivers-v2_84.html` (CSS linhas 7–511, markup 513–3590, JS 3608–7952).
Todas as medidas abaixo são copiadas literalmente do CSS/inline style do protótipo. Quando algo não existe no protótipo, está marcado como **"não existe no protótipo"**. Quando é uma decisão de mapeamento nossa (sem equivalente 1:1), está marcado como **[mapeamento]**.

Tokens referenciados (`:root`, linhas 17–32): `--blue:#0A13B6`, `--blue-d:#070D81`, `--blue-bg:#EEF1FC`, `--blue-light:#CCDAF2`, `--teal:#0077BE`, `--teal-bg:#E6F2FA`, `--teal-light:#99CDE8`, `--slate:#141414`, `--slate-2:#1D1D1D`, `--slate-3:#404040`, `--muted:#6F6F6F`, `--muted-2:#8A8A8A`, `--border:#E1E1E1`, `--bg:#FAFAFA`, `--white:#FFFFFF`, `--green:#18A957`, `--green-bg:#E7F1EA`, `--green-b:#81C17E`, `--yellow:#F4CF3D`, `--yellow-bg:#FDF4DE`, `--red:#D63434`, `--red-bg:#FAE9E9`, `--orange:#DD7443`, `--orange-bg:#FFF1EA`, `--purple:#7C3AED`, `--purple-bg:#F5F3FF`, `--purple-b:#C4B5FD`, `--sidebar-w:252px`, `--topbar-h:64px`, `--rolebar-h:34px`, `--radius:8px`, `--radius-lg:16px`, `--radius-pill:24px`, `--shadow-sm:0 2px 4px 0 rgba(20,20,20,.08)`, `--shadow:0 4px 4px 0 rgba(20,20,20,.08)`, `--shadow-md:0 6px 10px 0 rgba(20,20,20,.08)`.

Fonte: `Inter` 400/500/600/700 (Google Fonts), fallback `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif`; `body` 14px, `color:var(--slate)`, `background:var(--bg)`.

---

## 0. Esqueleto comum a todas as telas (shell)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ROLE BAR (34px, #141414)  — SÓ DO PROTÓTIPO, NÃO PORTAR (ver nota)           │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ SIDEBAR 252px │ TOPBAR 64px  ☰  Marketing Insights › <Página>     (A) Nome   │
│ logo 64px     ├──────────────────────────────────────────────────────────────┤
│ [Dashboard]   │ MAIN  padding 22px 24px, overflow-y:auto                     │
│ ▌CAMPANHAS ▼  │  .page-hdr (título + sub | ações)                            │
│   Lista       │  .screen-desc (opcional)                                     │
│   ...         │  conteúdo da tela                                            │
│ footer        │                                                              │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

- **Role bar** (`.role-bar`, 34px, `background:var(--slate)`) traz o texto "Apenas para validação do protótipo" (`.rb-hint`). É um artefato de protótipo para simular perfis — **não deve ir para o app**. Consequência [mapeamento]: no app, `.sidebar{top:0;height:100vh}`, `.topbar{top:0}` e `.main{margin-top:var(--topbar-h);height:calc(100vh - var(--topbar-h))}` (o protótipo soma `--rolebar-h` nesses três lugares).
- **Sidebar** `.sidebar`: `width:252px; background:#FFFFFF; border-right:1px solid #E1E1E1; position:fixed; left:0; display:flex; flex-direction:column; z-index:30; overflow-y:auto; transition:transform .2s`.
- **Topbar** `.topbar`: `position:fixed; left:252px; right:0; height:64px; background:#FFFFFF; border-bottom:1px solid #E1E1E1; display:flex; align-items:center; padding:0 22px; gap:14px; z-index:20; transition:left .2s`.
- **Main** `.main`: `margin-left:252px; padding:22px 24px; overflow-y:auto; transition:margin-left .2s`. Ao trocar de tela o protótipo faz `document.querySelector('.main').scrollTop = 0`.
- **Colapsar sidebar**: o burger (`☰`) alterna `body.nav-closed` → `.sidebar{transform:translateX(-100%)}` e `.topbar,.main{left:0}`. Observação literal: o CSS zera `left` em `.main`, mas `.main` usa `margin-left`, então no protótipo o conteúdo não se desloca de fato. [mapeamento] no app, aplicar `margin-left:0` no `.main` quando fechado.
- **Breakpoints do shell**: não existe no protótipo. Os únicos `@media` são de grids de formulário (`max-width:800px`, `560px`, `720px`, `480px`) e `.aprov-grid` (`800px`). Sidebar/topbar não têm comportamento responsivo no protótipo.

### 0.1 Topbar / breadcrumb

Markup do protótipo (linhas 674–684):

```html
<header class="topbar">
  <span class="topbar-burger">☰</span>
  <div class="topbar-crumb">
    <span>Demand Intelligence</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
    <strong id="crumb-page">Registrar Driver</strong>
  </div>
  <div class="topbar-spacer"></div>
  <div class="topbar-avatar" style="background:var(--purple)">A</div>
  <span class="topbar-name">Admin</span>
</header>
```

- `.topbar-burger`: `cursor:pointer; color:#6F6F6F; font-size:17px; padding:4px; border-radius:4px; transition:background .14s; line-height:1` · hover `background:#FAFAFA; color:#141414`.
- `.topbar-crumb`: `font-size:12.5px; color:#6F6F6F; display:flex; align-items:center; gap:5px` · `strong{color:#141414; font-weight:500}` · `svg{width:12px; height:12px; opacity:.4}`.
- `.topbar-spacer{flex:1}`.
- `.topbar-avatar`: `30×30px; border-radius:50%; font-size:11.5px; font-weight:700; color:#fff; flex-shrink:0` (cor de fundo vem do perfil; Admin = `var(--purple)`).
- `.topbar-name`: `font-size:13px; font-weight:600; color:#141414`.
- O crumb tem **sempre 2 níveis** (raiz do produto › página). O texto da página vem de um `crumbMap` por tela (ex.: `dashboard:'Dashboard'`, `planos:'Planos de Produção'`, `'plano-item':'Detalhe do Item'`, `'analise-view':'Análise'`).

**Equivalente no nosso app [mapeamento]** — raiz: `Marketing Insights` (substitui "Demand Intelligence"):

| Rota              | Crumb                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `/`               | `Marketing Insights › Dashboard`                                                                       |
| `/campaigns`      | `Marketing Insights › Campanhas`                                                                       |
| `/campaigns/[id]` | `Marketing Insights › Detalhe da Campanha` (mesmo padrão de `'plano-item':'Detalhe do Item'`)          |
| `not-found`       | `Marketing Insights › Página não encontrada` [mapeamento; o protótipo só tem `denied:'Acesso Negado'`] |

### 0.2 Page header (comum)

```html
<div class="page-hdr">
  <div class="page-hdr-left">
    <div class="page-title">…</div>
    <div class="page-sub">…</div>
  </div>
  <div class="page-hdr-actions">…</div>
</div>
```

- `.page-hdr`: `display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:18px; flex-wrap:wrap`.
- `.page-title`: `font-size:18px; font-weight:700; color:#141414; line-height:1.2`.
- `.page-sub`: `font-size:12.5px; color:#6F6F6F; margin-top:3px`.
- `.page-hdr-actions`: `display:flex; gap:8px; flex-wrap:wrap; align-items:center`.
- Tom do `page-sub` no protótipo: frases curtas, segmentos separados por `·` (ex.: "Visão geral do ciclo ativo · PLP-2026-07", "Data Lake · status Validado · alimentam o ApsenPLPEngine").

### 0.3 Screen description (bloco explicativo, opcional)

Presente em Lista/Ingeridos/Planos/Análises/Catálogo; **ausente** no Dashboard e nas telas de detalhe.

```html
<div class="screen-desc">
  <span class="screen-desc-icon">📋</span>
  <div><strong>Frase-resumo.</strong> Texto explicativo com <em>destaque</em>.</div>
</div>
```

- `.screen-desc`: `display:flex; gap:9px; padding:11px 15px; background:#FAFAFA; border:1px solid #E1E1E1; border-radius:8px; margin-bottom:18px; font-size:12.5px; color:#404040; line-height:1.65`.
- `.screen-desc-icon`: `font-size:15px; flex-shrink:0; margin-top:1px` (emoji).
- `strong{color:#141414; font-weight:600}` · `em{color:#0A13B6; font-style:normal; font-weight:500}`.

### 0.4 Estados vazio / carregando / erro (como o protótipo faz)

| Estado                                  | No protótipo                                                                                                                                                                                                                                                    | Medidas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vazio (lista em cards)**              | `.empty` com emoji + `p` + `small` (ex.: "📋 Nenhum registro ainda / Vá para **Registrar Driver** e adicione o primeiro driver."; "🔬 Nenhuma análise encontrada")                                                                                              | `.empty{text-align:center; padding:48px 24px; color:#6F6F6F}` · `.empty-icon{font-size:36px; margin-bottom:10px}` · `.empty p{font-size:13.5px; font-weight:500; color:#141414; margin-bottom:4px}` · `.empty small{font-size:12px}`                                                                                                                                                                                                                                                                           |
| **Vazio (tabela)**                      | linha única `<tr><td colspan="N">` "Nenhuma família encontrada com os filtros atuais."                                                                                                                                                                          | `padding:30px; text-align:center; color:var(--muted)`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Vazio (dentro de card do dashboard)** | "✅ Nenhuma restrição ativa" / "✅ Nenhum driver pendente"                                                                                                                                                                                                      | `text-align:center; padding:20px; color:var(--muted); font-size:13px`                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Carregando**                          | Não existe tela/skeleton/spinner de carregamento no protótipo (nenhum `@keyframes`, nenhuma classe skeleton). Os únicos indicadores são textuais: `.ac-loading` "⟳ Consultando base de concorrentes..." e toast "⟳ Executando análise com o ApsenPLPEngine...". | `.ac-loading{padding:12px; text-align:center; color:var(--muted); font-size:12.5px}`                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Erro**                                | Não existe tela de erro no protótipo. Erros aparecem como toast com prefixo "❌" (ex.: "❌ Falha ao conectar — …") ou banner `.alert-danger`. A tela mais próxima é `#screen-denied` (`.access-denied`).                                                        | `.alert{display:flex; align-items:flex-start; gap:9px; padding:10px 14px; border-radius:8px; margin-bottom:14px; font-size:12.5px; line-height:1.6}` · `.alert-danger{background:#FAE9E9; border:1px solid #D63434; color:#991B1B}` · `.access-denied{display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; gap:10px; text-align:center; color:var(--muted)}` · `.lock{font-size:44px; margin-bottom:8px}` · `h3{font-size:16px; font-weight:600; color:var(--slate)}` |
| **Toast**                               | `.toast` fixo canto inferior direito, some em 3000ms                                                                                                                                                                                                            | `bottom:22px; right:22px; background:#fff; border:1px solid #E1E1E1; border-radius:8px; padding:11px 15px; box-shadow:var(--shadow-md); gap:9px; font-size:13px; z-index:99999; transform:translateY(12px); opacity:0; transition:all .22s` · `.show{transform:translateY(0); opacity:1}`                                                                                                                                                                                                                      |

**Proposta para nossos `loading.tsx` / `error.tsx` / `not-found.tsx` / `StateViews` [mapeamento]:**

- Carregando: reutilizar o layout `.empty` com ícone `⟳` e texto "Carregando campanhas..." (o protótipo usa a mesma tipografia do `.ac-loading`: 12.5px, `--muted`). Sem animação (não existe no protótipo).
- Erro: layout `.access-denied` (60vh centralizado, ícone 44px, `h3` 16px/600) com ícone `⚠️`, `h3` "Não foi possível carregar os dados", `p` com a mensagem e botão `.btn.btn-outline` "Tentar novamente" (o denied usa `.btn.btn-outline` "← Voltar ao Dashboard", `margin-top:16px`).
- Not found: mesmo layout, ícone `🔍`, `h3` "Página não encontrada", botão `.btn.btn-outline` "← Voltar ao Dashboard".
- Vazio da lista com filtros: dentro da tabela, linha `colspan` "Nenhuma campanha encontrada com os filtros atuais." (texto no mesmo molde do catálogo).

---

## 1. Sidebar do nosso app

### 1.1 Anatomia no protótipo (linhas 541–671)

```
┌─────────────────────────────┐
│ [logo img] │ Demand          │  .sidebar-logo  h 64px, padding 0 18px, gap 10px, border-bottom
│            │ Intelligence    │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │  #ni-dashboard (item raiz, pílula)
│ │ ▦ Dashboard             │ │  margin 8px 8px 4px; radius 8px; padding-left 13px; fw 600
│ └─────────────────────────┘ │  ativo: background #0A13B6, color #fff
│ DRIVERS DE DEMANDA        ▼ │  .nav-module (10px, 700, uppercase, .12em)
│       Registrar Driver      │  .nav-item (padding 8px 18px 8px 44px)
│ ▌     Meus Registros   (0)  │  .nav-item.active (border-left 3px #0A13B6, bg #EEF1FC)
│       Catálogo de Produtos  │
│ AGENTES DE IA             ▼ │
│ ...                         │
├─────────────────────────────┤
│ Apsen Farmacêutica          │  .sidebar-footer
│ PLP Agent · Demand Intel... │
└─────────────────────────────┘
```

- **Logo**: `.sidebar-logo{height:64px; padding:0 18px; display:flex; align-items:center; gap:10px; border-bottom:1px solid #E1E1E1; flex-shrink:0}`. Contém `<img>` base64 (logo Apsen) + `.logo-txt` com inline `border-left:1px solid var(--border); padding-left:10px; margin-left:2px`; `strong` "Demand" `font-weight:700; font-size:12px; color:var(--slate); display:block; line-height:1.2`; `span` "Intelligence" `font-size:10.5px; color:var(--muted)`. (O CSS de `.logo-txt span` diz 10px, mas o inline sobrescreve para 10.5px.) `.logo-icon` (28×28, radius 6px, bg `--blue`) existe no CSS mas não é usado no markup.
- **Item raiz Dashboard** (`#ni-dashboard`): classe `.nav-item` + inline `margin:8px 8px 4px; border-radius:8px; font-weight:600; padding-left:13px`; ícone SVG 13×13 (4 quadrados: `rect 3,3,7,7` / `14,3` / `3,14` / `14,14`), `stroke-width:2`, `flex-shrink:0`. Ativo: `#ni-dashboard.active{background:var(--blue); color:#fff !important}` (pílula azul sólida, não a variante com borda).
- **Cabeçalho de módulo** `.nav-module`: `display:flex; align-items:center; gap:8px; padding:10px 18px 6px; font-size:10px; font-weight:700; color:#8A8A8A; letter-spacing:.12em; text-transform:uppercase; margin-top:6px; cursor:pointer; border-left:3px solid transparent; transition:all .14s; user-select:none; position:relative` · `:first-of-type{margin-top:2px}` · `.active-mod{color:#404040; font-weight:700}` · seta `.mod-arrow{margin-left:auto; font-size:9px; transition:transform .18s; color:#8A8A8A}` caractere `▼`, `.open{transform:rotate(180deg)}`.
- **Indicador colorido de módulo**: `.mod-accent{width:3px; height:22px; border-radius:2px; flex-shrink:0}` com cores por módulo `.mod-drivers .mod-accent{background:var(--blue)}`, `.mod-admin …{background:var(--teal)}`, `.mod-acesso …{background:var(--purple)}`. **Atenção (literal do protótipo):** o CSS existe, mas nenhum `<span class="mod-accent">` está no markup desta versão; o indicador colorido visível na prática é a borda esquerda de 3px do `.nav-item.active` (azul/teal/purple). [mapeamento] Como o pedido é "manter o visual de módulo com indicador colorido", renderizar `<span class="mod-accent"/>` como primeiro filho do `.nav-module` (o `gap:8px` já está previsto) com a cor do módulo.
- **Filhos** `.nav-children{overflow:hidden; max-height:0}` · `.open{max-height:9999px}` (acordeão, só um aberto por vez; abre automaticamente o módulo da tela atual).
- **Item** `.nav-item`: `display:flex; align-items:center; gap:8px; padding:8px 18px 8px 44px; cursor:pointer; color:#6F6F6F; font-size:13px; transition:all .14s; border-left:3px solid transparent; user-select:none` · hover `background:#F8FAFC; color:#141414` · `.active{border-left-color:#0A13B6; background:#EEF1FC; color:#0A13B6; font-weight:500}` · variantes `.active.teal{border-left-color:#0077BE; background:#E6F2FA; color:#0077BE}`, `.active.purple{border-left-color:#7C3AED; background:#F5F3FF; color:#7C3AED}`.
- **Badge de contagem** `.nav-badge{border-radius:20px; font-size:10px; padding:1px 7px; margin-left:auto; font-weight:700; color:#fff; white-space:nowrap}` + `.nb-blue` / `.nb-teal` / `.nb-red` / `.nb-purple` / `.nb-orange` / `.nb-gray` (fundo = token correspondente; gray = `--muted`).
- **Footer** `.sidebar-footer{padding:12px 18px; border-top:1px solid #E1E1E1; font-size:10px; color:#8A8A8A; line-height:1.8; margin-top:auto; flex-shrink:0}` — duas linhas separadas por `<br>`.

### 1.2 Conteúdo proposto para o nosso app [mapeamento]

```
[logo Apsen] │ Marketing
             │ Insights
──────────────────────────────
[▦ Dashboard]                       → /            (#ni-dashboard, pílula)
▌ CAMPANHAS                     ▼   (.nav-module.mod-campanhas, accent var(--blue))
      Todas as Campanhas   (N)      → /campaigns   (.nav-badge.nb-blue = total)
      Ativas               (n)      → /campaigns?status=ativa   (.nav-badge.nb-teal)
──────────────────────────────
Apsen Farmacêutica
Marketing Insights · Campanhas
```

- O detalhe `/campaigns/[id]` não tem item próprio; mantém "Todas as Campanhas" ativo e o módulo "Campanhas" aberto (no protótipo, `plano-item` e `analise-view` também não têm item próprio e mantêm o módulo pai aberto — o item ativo é limpo porque não existe `ni-plano-item`; [mapeamento] manter o pai ativo é a leitura mais útil).
- Item "Ativas" é opcional: só faz sentido se a rota aceitar o filtro por query. Se não houver, o módulo fica com um único item "Todas as Campanhas" (o protótipo tem vários módulos de 1 item: "Análises › Minhas Análises", "Planos de Produção › PLP Ativo").
- Cor do módulo: `--blue` (é o módulo principal, como "Drivers de Demanda").
- Hoje `navItems.ts` tem `[{'/','Dashboard'},{CAMPAIGNS_ROUTE,'Campanhas'}]`; a estrutura precisa passar a suportar `{ root: Dashboard, modules: [{ key:'campanhas', label:'Campanhas', accent:'blue', items:[...] }] }`.
- `ThemeToggle` atual: não existe no protótipo (o protótipo não tem dark mode). Se mantido, o lugar coerente é a topbar, antes do avatar [mapeamento].

---

## 2. Dashboard (`/`) ← `#screen-dashboard`

### 2.1 Estrutura no protótipo (linhas 2808–2849)

```
┌ page-hdr ───────────────────────────────────────────────────────────────┐
│ Dashboard — Demand Intelligence                 Atualizado em 22/10, …  │
│ Visão geral do ciclo ativo · PLP-2026-07                                │
└─────────────────────────────────────────────────────────────────────────┘
[ banner de perfil (opcional) ]
┌ KPI ─────┐┌ KPI ─────┐┌ KPI ─────┐┌ KPI ─────┐   grid repeat(4,1fr) gap 14px mb 20px
│ [📥]     ││ [⚠️]     ││ [📋]     ││ [🔬]     │
│ 12       ││ 8        ││ 247      ││ 3        │
│ label    ││ label    ││ label    ││ label    │
│ sub      ││ sub      ││ sub      ││ sub      │
└──────────┘└──────────┘└──────────┘└──────────┘
┌ card: DRIVERS POR CATEGORIA ───┐┌ card: RESTRIÇÕES ATIVAS POR TIPO ┐  grid 1fr 1fr gap 16px mb 16px
│ Mídia / Digital  ███████░░  6  ││ Matéria-Prima   █████░░░░░   3   │
│ Comercial        ████░░░░░  4  ││ ...                              │
└────────────────────────────────┘└──────────────────────────────────┘
┌ card: AGUARDANDO APROVAÇÃO  Ver todos → ┐┌ card: PLANO — STATUS  Ver plano → ┐  grid 1fr 1fr gap 16px
│ DRV-2026-031  Produto          [Revisar]││ ● Aprovado   12  ▬▬▬░░  48%        │
│               tipo                      ││ ● Em Revisão  …                    │
│ ...                                     ││ ─────────────────────────          │
│                                         ││ 25 itens · PLP-2026-07             │
└─────────────────────────────────────────┘└────────────────────────────────────┘
```

Ordem das seções: page-hdr → banner de perfil → 4 KPI cards → 2 cards de barras horizontais → 2 cards de lista/destaque. Não há `screen-desc` no dashboard. Não existe filtro de período no dashboard do protótipo; à direita do header só há o timestamp.

**Header actions**: `<span style="font-size:12px;color:var(--muted)">Atualizado em <strong id="dash-ts"></strong></span>` — valor `new Date().toLocaleString('pt-BR')`.

**Banner de perfil** (`#dash-perfil-banner`): `margin-bottom:14px; padding:10px 16px; border-radius:8px; font-size:13px; line-height:1.5; border:1px solid`, cores por perfil (ex.: Planejador `bg:#EEF3FF; cor:var(--blue); bdr:#C7D7FA`), texto com prefixo "🔑 ". Depende de perfis; nosso app não tem perfis → **não portar** [mapeamento].

**KPI cards** (`#dash-cards`: inline `display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px`):

```html
<div class="dash-card" onclick="goScreen(dest)">
  <div class="dash-card-icon" style="background:#EEF3FF">📥</div>
  <div class="dash-card-val" style="color:var(--blue)">12</div>
  <div class="dash-card-lbl">Drivers no pipeline</div>
  <div style="font-size:11.5px;margin-top:2px">
    <span style="color:var(--yellow);font-weight:600">3 pendentes</span>
  </div>
</div>
```

- `.dash-card{background:#FFFFFF; border:1px solid #E1E1E1; border-radius:10px; padding:18px 20px; cursor:pointer; transition:box-shadow .14s; display:flex; flex-direction:column; gap:5px}` · hover `box-shadow:0 4px 16px rgba(0,0,0,.1)`. (Sem sombra em repouso; raio 10px, não `--radius-lg`.)
- `.dash-card-icon{width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:18px; margin-bottom:4px}` — emoji sobre fundo pastel.
- `.dash-card-val{font-size:26px; font-weight:800; line-height:1.1}` — cor = cor semântica do card.
- `.dash-card-lbl{font-size:12.5px; color:#6F6F6F; font-weight:500}`.
- Sub-linha: `font-size:11.5px; margin-top:2px`, com `<span>` colorido `font-weight:600`.
- Pares fundo/cor usados: `#EEF3FF` + `var(--blue)` · `#FEF2F2` + `var(--red)` · `#F0FDF4` + `var(--green)` · `#FFF7ED` + `var(--orange)`.
- Clique no card navega para a tela relacionada.

**Card de barras** (inline `class="card" style="padding:16px 18px"`):

- `.card{background:#FFFFFF; border:1px solid #E1E1E1; border-radius:16px; padding:20px 22px; margin-bottom:16px; box-shadow:var(--shadow-sm)}` (padding sobrescrito para `16px 18px`).
- Rótulo de seção (inline): `font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin-bottom:12px`.
- Linha `.dash-bar-row{display:flex; align-items:center; gap:10px; margin-bottom:9px; font-size:12.5px}`:
  - `.dash-bar-lbl{width:110px; color:#141414; font-weight:500; flex-shrink:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}`
  - `.dash-bar-track{flex:1; height:7px; background:#FAFAFA; border-radius:4px; overflow:hidden}`
  - `.dash-bar-fill{height:100%; border-radius:4px}` com `width = round(n/max*100)%` (relativo ao maior valor, não ao total) e `background` = cor da categoria.
  - Valor: `width:24px; text-align:right; font-size:12px; color:var(--muted)`.
- Cores de categoria usadas: `#3B82F6`, `#F59E0B`, `#EF4444`, `#8B5CF6`, `#10B981`, `#6366F1`.

**Card de lista com link** ("Aguardando Aprovação"):

- Cabeçalho inline: `display:flex; align-items:center; justify-content:space-between; margin-bottom:12px`; rótulo igual ao acima (sem `margin-bottom`); link `color:var(--blue); font-size:12px; cursor:pointer` com texto "Ver todos →".
- Item `.dash-pend-item{display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #FAFAFA; font-size:13px}` · `:last-child{border-bottom:none}`:
  - código: `font-family:monospace; font-size:11px; color:var(--blue); font-weight:600; min-width:95px`
  - bloco `flex:1`: título `font-size:12.5px; font-weight:500` + sub `font-size:11.5px; color:var(--muted)`
  - botão `.btn.btn-ghost.btn-sm` inline `font-size:11px; padding:2px 8px` "Revisar".
- Máximo 4 itens; excedente: `text-align:center; font-size:12px; color:var(--muted); padding:6px 0` "+mais N".

**Card de status com mini-barras** ("Plano de Produção — Status"), por linha: `display:flex; align-items:center; gap:10px; margin-bottom:10px` → bolinha `9×9px; border-radius:50%` → label `font-size:13px; flex:1` → número `font-size:13px; font-weight:600; color:<cor>` → trilho `width:70px; height:5px; background:var(--bg); border-radius:3px; overflow:hidden` com fill `<cor>` → % `font-size:11px; color:var(--muted); min-width:28px; text-align:right`. Rodapé: `padding-top:8px; border-top:1px solid var(--border); font-size:12px; color:var(--muted)` "25 itens · PLP-2026-07".

### 2.2 Mapeamento para o nosso Dashboard [mapeamento]

```
┌ page-hdr ───────────────────────────────────────────────────────────────┐
│ Dashboard — Marketing Insights           [Tudo|30 dias|90 dias|Ano]     │
│ Visão geral das campanhas · Últimos 30 dias      Atualizado em …        │
└─────────────────────────────────────────────────────────────────────────┘
┌ 💰 Investimento ┐┌ 📈 Receita ┐┌ 🎯 ROAS ┐┌ 📣 Campanhas ┐   .dash-card ×4, repeat(4,1fr) gap 14px mb 20px
└─────────────────┘└────────────┘└─────────┘└──────────────┘
┌ card: INVESTIMENTO POR CANAL ──┐┌ card: CONVERSÕES POR CANAL ──────┐   1fr 1fr gap 16px mb 16px
│ Google Ads  ███████░░  R$ …    ││ Google Ads  ██████░░░   …        │
└────────────────────────────────┘└──────────────────────────────────┘
┌ card: TOP CAMPANHAS POR ROAS   Ver todas → ┐┌ card: CAMPANHAS — STATUS  Ver lista → ┐   1fr 1fr gap 16px
│ CMP-001  Nome da campanha     4,2x [Ver]   ││ ● Ativa      8  ▬▬▬░░  53%             │
│          Google Ads                        ││ ● Pausada    4  ▬░░░░  27%             │
│ ...                                        ││ ● Encerrada  3  ▬░░░░  20%             │
│                                            ││ ─────────────────────                  │
│                                            ││ 15 campanhas · Últimos 30 dias         │
└────────────────────────────────────────────┘└────────────────────────────────────────┘
```

- **Título**: "Dashboard — Marketing Insights" (mesmo molde de "Dashboard — Demand Intelligence").
- **Sub**: "Visão geral das campanhas · {rótulo do período}" (ex.: "· Últimos 30 dias", "· Ano atual", "· Todo o período").
- **Ações do header**: o filtro de período não existe no dashboard do protótipo. O componente de seleção segmentada que existe no protótipo é `.tabs-pill` → usar ele em `.page-hdr-actions`, seguido do timestamp `font-size:12px; color:var(--muted)` "Atualizado em **…**".
  - `.tabs-pill{display:flex; background:#E1E1E1; border-radius:6px; padding:3px; margin-bottom:18px; width:fit-content}` (no header, zerar o `margin-bottom`) · `.tab-pill{padding:6px 22px; border-radius:4px; cursor:pointer; font-size:13px; color:#6F6F6F; transition:all .14s}` · `.tab-pill.active{background:#FFFFFF; color:#141414; font-weight:500; box-shadow:0 1px 3px rgba(0,0,0,.1)}`.
  - Alternativa também presente no protótipo: `.chip` (`.chips-wrap{gap:5px}`; `.chip{background:#FAFAFA; border:1px solid #E1E1E1; border-radius:14px; padding:3px 10px; font-size:12px; color:#6F6F6F; transition:all .13s}` · hover `border-color:#0A13B6; color:#0A13B6` · `.sel{background:#EEF1FC; border-color:#0A13B6; color:#0A13B6; font-weight:600}`).
- **KPI cards** (4, ordem e cores):

| #   | Ícone | Fundo ícone | Cor valor       | Valor                   | Label                     | Sub (span colorido 600)           | Destino                   |
| --- | ----- | ----------- | --------------- | ----------------------- | ------------------------- | --------------------------------- | ------------------------- |
| 1   | 💰    | `#EEF3FF`   | `var(--blue)`   | Investimento total (R$) | "Investimento no período" | "CPC médio R$ x" em `var(--blue)` | `/campaigns`              |
| 2   | 📈    | `#F0FDF4`   | `var(--green)`  | Receita total (R$)      | "Receita atribuída"       | "N conversões" em `var(--green)`  | `/campaigns`              |
| 3   | 🎯    | `#FFF7ED`   | `var(--orange)` | ROAS (ex.: "4,2x")      | "ROAS consolidado"        | "CTR x%" em `var(--orange)`       | `/campaigns`              |
| 4   | 📣    | `#EEF3FF`   | `var(--blue)`   | Nº campanhas            | "Campanhas no período"    | "N ativas" em `var(--green)`      | `/campaigns?status=ativa` |

Nota: o protótipo só usa os 4 pares listados em 2.1 (azul, vermelho, verde, laranja). O vermelho (`#FEF2F2` + `var(--red)`) tem papel de alerta ("Restrições ativas"), por isso o 4º KPI repete o par azul em vez de usar uma cor nova. Se no futuro o 4º KPI for um alerta (ex.: "Acima do orçamento"), aí sim usar o par vermelho.
O `.dash-card-val` com `font-size:26px` comporta valores monetários curtos; formatar com abreviação (ex.: "R$ 1,2 mi") se necessário — abreviação não existe no protótipo (os valores lá são inteiros pequenos).

- **Breakdown por canal**: dois cards de barras (`.dash-bar-row`), lado a lado: "Investimento por Canal" e "Conversões por Canal" (ou "Receita por Canal"). Largura do fill relativa ao maior canal, como no protótipo. O valor à direita tem `width:24px` no protótipo (pensado para inteiros de 1–2 dígitos); para R$ é preciso alargar — [mapeamento] `min-width:72px; text-align:right; font-size:12px; color:var(--muted)`. Cores por canal: reaproveitar a paleta de categoria do protótipo na ordem dos nossos canais: Google `#3B82F6`, Meta `#6366F1`, LinkedIn `#8B5CF6`, E-mail `#F59E0B`, TikTok `#10B981` [mapeamento de atribuição; cores são do protótipo]. `.dash-bar-lbl` fixa em 110px.
- **Top campanhas por ROAS**: card no molde "Aguardando Aprovação": header com rótulo "Top Campanhas por ROAS" + link "Ver todas →" (`/campaigns`); cada linha `.dash-pend-item`: código mono azul (id da campanha, `min-width:95px`), bloco com nome (12.5px/500) e canal (11.5px muted), à direita o ROAS em `font-size:13px; font-weight:600; color:var(--green)` [mesmo estilo do número do card de status] e botão `.btn.btn-ghost.btn-sm` (`font-size:11px; padding:2px 8px`) "Ver" → `/campaigns/[id]`. Limite 4–5 itens; se houver mais: "+mais N". Vazio: "✅"/emoji + texto `text-align:center; padding:20px; color:var(--muted); font-size:13px` → "Nenhuma campanha com ROAS no período".
- **Campanhas — Status**: card no molde "Plano de Produção — Status" com 3 linhas: Ativa `var(--green)`, Pausada `var(--orange)`, Encerrada `var(--muted)` (o protótipo usa exatamente esse trio verde/laranja/muted para Aprovado/Em Revisão/Pendente). Rodapé "N campanhas · {período}". Link "Ver lista →".
- **Responsivo**: não existe no protótipo para estes grids (são inline sem media query). [mapeamento] para não quebrar em telas estreitas: KPIs `repeat(2,1fr)` abaixo de 800px e `1fr` abaixo de 560px; pares de cards `1fr` abaixo de 800px — usando os mesmos breakpoints que o protótipo usa em `.fg-*`.

---

## 3. Lista de Campanhas (`/campaigns`) ← `#screen-planos` (+ `#screen-ingeridos`, `#screen-catalogo`)

### 3.1 Tabela ou cards?

O protótipo usa **os dois**, com critério claro:

- **Tabela** (`.table-wrap` + `table`) para listas operacionais com muitos itens, colunas comparáveis, filtros e paginação: `#screen-planos` (Planos de Produção, 8 por página), `#screen-ingeridos`, `#screen-catalogo`, `#screen-usuarios`.
- **Cards** (`.drv-item`, `.analise-card`, `.aprov-card`) para registros ricos em texto com pouca quantidade: `#screen-lista` (Meus Registros), `#screen-analises`, fila de aprovação.

Campanhas têm colunas numéricas comparáveis (investimento, ROAS, CTR, conversões) e filtros canal/status/período → **seguir `#screen-planos` (tabela)**. `#screen-lista` (Meus Registros) usa cards `.drv-item` e não tem filtros nem busca, por isso não é o modelo.

### 3.2 Estrutura no protótipo (`#screen-planos`, linhas 2613–2692)

```
┌ page-hdr ───────────────────────────────────────────────────────────────┐
│ Planos de Produção — PLP-2026-07                        [+ Incluir Item]│
│ Lista e gerencia todos os itens programados…                            │
└─────────────────────────────────────────────────────────────────────────┘
┌ screen-desc ────────────────────────────────────────────────────────────┐
│ 📋 Lista e gerencia… (texto)                                            │
└─────────────────────────────────────────────────────────────────────────┘
[🔍 Buscar produto, código, linha...        ] [Todas as famílias ▾] [Todos os status ▾]
247 itens no plano · Ciclo PLP-2026-07
┌ table-wrap ─────────────────────────────────────────────────────────────┐
│ ☐ │ Código │ Produto / Apresentação │ Família │ Qtd. │ Linha │ … │ Ações │
│ ☐ │ PLP-01 │ Nome / sub             │ ● Fam   │ 50.000 cp │ … │ 👁 ✎ 🗑 │
└─────────────────────────────────────────────────────────────────────────┘
──────────────────────────────────────────────────────────────────────────
Mostrando 1–8 de 247                                      (‹) (1) 2 3 … (›)
```

**Toolbar de filtros** (inline): `display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap; align-items:center`.

- Busca: `.search-wrap` com inline `flex:1; min-width:220px` (CSS: `position:relative; min-width:260px; max-width:360px; flex:1`). Ícone `.search-icon{position:absolute; left:9px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:#8A8A8A; pointer-events:none}` (SVG lupa: `circle cx11 cy11 r8` + `line 21,21→16.65,16.65`). Input `.search-input{width:100%; padding:7px 11px 7px 30px; border:1px solid #E1E1E1; border-radius:6px; font-size:13px; outline:none; background:#FFFFFF}` · focus `border-color:#0A13B6; box-shadow:0 0 0 3px rgba(27,78,201,.1)`. Filtra `oninput` (sem botão "buscar").
- Selects: `.form-select` com largura fixa inline (`width:180px` família, `width:170px` status). `.form-select{padding:8px 11px; border:1px solid #E1E1E1; border-radius:6px; font-size:13.5px; outline:none; background:#FFFFFF; font-family:inherit; color:#141414; transition:border .14s, box-shadow .14s; width:100%}` · focus igual à busca. Primeira opção = "Todas as …"/"Todos os …"; opções de status prefixadas com "● ". Filtra `onchange`.
- Variante `#screen-ingeridos` usa a classe `.toolbar{display:flex; align-items:center; gap:8px; margin-bottom:13px; flex-wrap:wrap}` + `.toolbar-right{margin-left:auto; display:flex; gap:6px}` e select `style="width:auto;font-size:13px"`. `#screen-catalogo` força `height:38px` em busca e selects. Preferir a versão de `#screen-planos` (é a mais completa).

**Contador**: `<p style="font-size:13px;color:var(--muted);margin-bottom:12px"><strong>247</strong> itens no plano · Ciclo PLP-2026-07</p>` (número em `<strong>`, resto muted; pluralização manual, ex.: "análise"/"análises").

**Tabela**:

- `.table-wrap{background:#FFFFFF; border:1px solid #E1E1E1; border-radius:16px; overflow-x:auto; box-shadow:var(--shadow-sm)}`.
- `table{width:100%; border-collapse:collapse; min-width:560px}`.
- `thead tr{border-bottom:1px solid #E1E1E1; background:#FAFAFA}`.
- `th{padding:10px 14px; text-align:left; font-size:11.5px; font-weight:600; color:#6F6F6F; white-space:nowrap; letter-spacing:.02em}` (sem uppercase). Coluna ordenável: `cursor:pointer` (a coluna de ordenação principal fica `color:var(--blue)`). Indicador de direção de ordenação: não existe no protótipo.
- `td{padding:12px 14px; font-size:13px; border-bottom:1px solid #FAFAFA; vertical-align:middle}` · `tr:last-child td{border-bottom:none}` · `tbody tr:hover{background:#FAFBFC}`.
- Célula código: `font-family:monospace; font-size:12px; color:var(--blue); font-weight:600` (`.td-mono` = `font-family:monospace; font-size:12px`).
- Célula título+sub: `<div style="font-weight:500;font-size:13px">` + `<div style="font-size:11.5px;color:var(--muted)">`.
- Pill de categoria: `font-size:11.5px; font-weight:600; padding:2px 9px; border-radius:10px; background:<cor>18; color:<cor>; border:1px solid <cor>30` com texto "● Nome" (alfa hex `18`/`30` sobre a cor base).
- Número: `font-size:13px; font-weight:600` + unidade `<span style="font-size:11px;color:var(--muted);font-weight:400">cp</span>`; formatação `toLocaleString('pt-BR')`.
- Status em texto colorido (não badge): `font-size:12px; font-weight:600; color:<cor>` com "● Label".
- Ações `.action-grp{display:flex; gap:2px; align-items:center}`; `.action-btn{width:28px; height:28px; border-radius:5px; color:#6F6F6F; border:none; background:transparent; transition:all .13s}` · hover `background:#EEF1FC; color:#0A13B6` · `.red:hover{background:#FAE9E9; color:#D63434}`; ícones SVG 14×14 `stroke-width:2` (olho = Visualizar).
- Link em célula: `.tbl-link{color:#0A13B6; cursor:pointer; font-weight:500}` · hover `text-decoration:underline`.

**Paginação** (inline, `#screen-planos`): container `display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-top:1px solid var(--border); margin-top:4px`; info `font-size:13px; color:var(--muted)` "Mostrando 1–8 de 247"; botões `28×28px; border-radius:50%; border:1px solid var(--border); background:var(--white); font-size:13px`, ativo `border-color/background:var(--blue); color:#fff; font-weight:600`, desabilitado `opacity:.35`, setas `‹` `›`, reticências `<span style="padding:0 4px;color:var(--muted)">…</span>`. 8 itens por página. (Existe também a classe `.pag`/`.pag-btn` 30×30 sem borda, usada em outra tela; o padrão de planos é o inline acima.)

**Vazio**: `planoRender` não trata vazio (tbody fica vazio). O padrão de vazio em tabela do protótipo é o do catálogo: `<tr><td colspan="5" style="padding:30px;text-align:center;color:var(--muted)">Nenhuma família encontrada com os filtros atuais.</td></tr>`.

### 3.3 Mapeamento para a nossa Lista [mapeamento]

```
┌ page-hdr ───────────────────────────────────────────────────────────────┐
│ Campanhas                                                               │
│ Campanhas de marketing por canal, status e período                      │
└─────────────────────────────────────────────────────────────────────────┘
┌ screen-desc ────────────────────────────────────────────────────────────┐
│ 📣 Acompanhe o desempenho de todas as campanhas de marketing. Use os    │
│    filtros para localizar por canal, status ou período e clique em uma  │
│    campanha para ver o <em>detalhe de métricas e orçamento</em>.         │
└─────────────────────────────────────────────────────────────────────────┘
[🔍 Buscar campanha ou código...  ] [Todos os canais ▾] [Todos os status ▾] [Todo o período ▾]
15 campanhas · Últimos 30 dias
┌ table-wrap ─────────────────────────────────────────────────────────────────────────┐
│ Código │ Campanha / Período │ Canal │ Status │ Investimento │ ROAS │ CTR │ Conv. │ Ações │
│ CMP-01 │ Nome               │ ● Meta│ ● Ativa│ R$ 12.000    │ 4,2x │ 2,1%│ 340   │  👁   │
│        │ 01/06 → 30/06/2026 │       │        │ 78% do orç.  │      │     │       │       │
└─────────────────────────────────────────────────────────────────────────────────────┘
──────────────────────────────────────────────────────────────────────────────────────
Mostrando 1–8 de 15                                                    (‹) (1) 2 (›)
```

- **page-title**: "Campanhas". **page-sub**: "Campanhas de marketing por canal, status e período".
- **page-hdr-actions**: o protótipo coloca a ação primária aqui ("+ Incluir Item"). Nosso app não cria campanhas → sem botão (não inventar ação).
- **Filtros** (implementado na fase 5 com `SearchInput` + `FormSelect`, ver `DESIGN_SPEC.md` §3.14/§4.2): o padrão de lista do protótipo é **toolbar com busca + `<select class="form-select">`**, e os chips só aparecem em formulários. Canal → select `width:180px` ("Todos os canais", "Google Ads", …); Status → select `width:170px` ("Todos os status", "● Ativa", "● Pausada", "● Encerrada"); Período → select `width:170px` ("Todo o período", "Últimos 30 dias", "Últimos 90 dias", "Ano atual"). Busca por nome: `.search-wrap` com `min-width:220px`, filtrando no cliente sem nova consulta.
- **Contador**: `<strong>N</strong> campanha(s) · {período}` no estilo `font-size:13px; color:var(--muted); margin-bottom:12px`.
- **Colunas**: Código (mono azul 12px/600, clicável → detalhe) · Campanha (nome 13px/500 + período 11.5px muted, formato do protótipo "01/06 → 30/06/2026") · Canal (pill `<cor>18/<cor>30`, "● Google Ads") · Status (texto "● Ativa" 12px/600: Ativa `var(--green)`, Pausada `var(--orange)`, Encerrada `var(--muted)`) · Investimento (13px/600, sub 11px muted "78% do orç."; se acima do orçamento, sub em `var(--red)`) · ROAS · CTR · Conversões · Ações (`.action-btn` olho "Visualizar"). Linha inteira clicável é opcional; no protótipo o clique é só no botão de ação.
- **Paginação**: padrão inline de `#screen-planos`, 8 por página, só se o volume justificar; senão omitir (não existe "mostrar tudo" no protótipo).
- **Vazio com filtros**: linha `colspan` "Nenhuma campanha encontrada com os filtros atuais." `padding:30px; text-align:center; color:var(--muted)`.
- **Vazio sem dados**: `.empty` com "📣" / "Nenhuma campanha cadastrada" / small "As campanhas aparecerão aqui assim que forem sincronizadas." [texto mapeado].

---

## 4. Detalhe da Campanha (`/campaigns/[id]`) ← `#screen-analise-view` + `#screen-plano-item`

### 4.1 Padrões de detalhe no protótipo

Ambas as telas de detalhe começam com um **breadcrumb interno** (além do da topbar) e não usam `.page-hdr`:

```html
<div
  style="font-size:12.5px;color:var(--muted);margin-bottom:10px;display:flex;align-items:center;gap:5px"
>
  <span style="color:var(--blue);cursor:pointer" onclick="goScreen('analises')">Análises</span>
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
  <span style="color:var(--slate);font-weight:500">Título do item</span>
</div>
```

**`#screen-plano-item`** (linhas 2695–2775): crumb → botão `.btn.btn-ghost.btn-sm` "← Voltar" com `margin-bottom:16px` → grid `1fr 1fr; gap:16px` de dois `.card` com `.card-title` ("Identificação do Item", "Programação") → `.card` largura total "Status & Justificativa" com `.form-actions` (Cancelar / Salvar). É uma tela de edição com inputs; não tem título grande.

**`#screen-analise-view`** (linhas 2988–3067): crumb → linha de cabeçalho inline `display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:10px` com, à esquerda, `.page-title` + `.page-sub` (meta: "Ciclo: **PLP-2026-07** · Modelo: **SARIMAX** · 2 SKU(s) · 20/06/2026") e, à direita, `display:flex; gap:8px; align-items:center` com **badge de status** + botões `.btn.btn-ghost.btn-sm` com ícone SVG 13×13. Corpo: grid `1fr 360px; gap:16px; align-items:start` — coluna principal com `.analise-section` empilhadas; coluna lateral `position:sticky; top:16px`.

É uma tela de leitura com status e metadados → **modelo principal para o nosso Detalhe é `#screen-analise-view`**, com o botão "← Voltar" de `#screen-plano-item`.

Medidas das peças:

- Badge de status do cabeçalho: `font-size:12px; font-weight:600; padding:4px 12px; border-radius:20px; background:<bg>; color:<cor>; border:1px solid <bdr>` (ex.: Salva `bg:var(--green-bg); cor:var(--green); bdr:var(--green-b)`; Rascunho `bg:var(--bg); cor:var(--muted); bdr:var(--border)`; Relatório `bg:var(--blue-bg); cor:var(--blue); bdr:var(--blue-light)`). Alternativa de classe: `.badge` (`padding:3px 9px; border-radius:20px; font-size:11.5px; font-weight:500; gap:5px; ::before 5×5 bolinha`) com variantes `.badge-green/.badge-yellow/.badge-red/.badge-gray/.badge-blue/.badge-teal/.badge-purple/.badge-orange`.
- `.analise-section{background:#FFFFFF; border:1px solid #E1E1E1; border-radius:10px; padding:16px 18px; margin-bottom:12px}` · `.analise-section-title{font-size:11px; font-weight:700; color:var(--orange); text-transform:uppercase; letter-spacing:.07em; margin-bottom:10px; padding-bottom:8px; border-bottom:2px solid #FFF7ED}` — título com emoji ("📄 Sumário Executivo", "📊 Impacto por Driver"). A cor laranja é a cor do módulo Análises; o equivalente genérico de cor do módulo azul é `.card-section-label{font-size:10.5px; font-weight:700; color:var(--blue); text-transform:uppercase; letter-spacing:.08em; padding:12px 0 8px; border-bottom:2px solid var(--blue-bg); margin-bottom:13px; display:flex; align-items:center; gap:6px}`.
- Linha de impacto `.impact-item{display:flex; align-items:center; gap:10px; padding:6px 0; border-bottom:1px solid #FAFAFA; font-size:13px}` + `.impact-bar{height:6px; border-radius:3px; flex-shrink:0}` (largura em px) + valor `min-width:44px; text-align:right; font-weight:700; color:<verde/vermelho>; font-size:13px`.
- Grid de rótulo/valor (de `.aprov-card`): `.aprov-grid{display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:16px; margin-bottom:12px}` (`@media(max-width:800px){grid-template-columns:1fr 1fr}`) · `.aprov-label{font-size:10.5px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin-bottom:3px}` · `.aprov-val{font-size:13px; color:var(--slate); font-weight:500; line-height:1.5}`.
- Barra de progresso: `.progress-track{background:#E1E1E1; border-radius:4px; height:7px; width:100%; overflow:hidden}` · `.progress-fill{height:100%; border-radius:4px; transition:width .4s}` (cor do fill inline).
- Tabela comparativa interna: `width:100%; border-collapse:collapse; font-size:12.5px`; `thead tr{border-bottom:2px solid var(--border)}`; `th{padding:8px 10px; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted)}` (numéricos `text-align:right`).

### 4.2 Mapeamento para o nosso Detalhe [mapeamento]

```
Campanhas › Black Friday Meta 2026                                   (crumb interno)
[← Voltar]                                                           (.btn-ghost.btn-sm, mb 16px)
┌──────────────────────────────────────────────────────────────────────────────┐
│ Black Friday Meta 2026                                      [● Ativa]        │  page-title + badge
│ Canal: **Meta Ads** · Período: **01/11 → 30/11/2026** · CMP-014             │  page-sub (meta)
└──────────────────────────────────────────────────────────────────────────────┘
┌ analise-section: 💰 ORÇAMENTO ───────────────────────────────────────────────┐
│ R$ 9.400 de R$ 12.000                                              78%       │
│ ████████████████████████████████░░░░░░░░░░  (progress-track 7px)            │
│ R$ 2.600 disponíveis                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
┌ 💰 Investimento ┐┌ 📈 Receita ┐┌ 🎯 ROAS ┐┌ 👆 CTR ┐        .dash-card ×4 (sem cursor/hover)
└─────────────────┘└────────────┘└─────────┘└────────┘
┌ analise-section: 📊 MÉTRICAS DA CAMPANHA ────────────────────────────────────┐
│ IMPRESSÕES     CLIQUES     CONVERSÕES     TAXA DE CONVERSÃO                   │  .aprov-label
│ 1.240.000      26.040      812            3,1%                                │  .aprov-val
│ CPC            CPA                                                            │
│ R$ 0,36        R$ 11,58                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Crumb interno**: "Campanhas" (azul, link para `/campaigns`) › nome da campanha (slate 500). Topbar: "Marketing Insights › Detalhe da Campanha".
- **Voltar**: `.btn.btn-ghost.btn-sm` "← Voltar" (`margin-bottom:16px`), exatamente como `#screen-plano-item`. `.btn{display:inline-flex; align-items:center; gap:6px; padding:9px 20px; border-radius:24px; font-size:13px; font-weight:600; transition:all .14s; border:1px solid transparent; white-space:nowrap; line-height:1}` · `.btn-sm{padding:5px 12px; font-size:12px}` · `.btn-ghost{background:transparent; color:#6F6F6F; border-color:#E1E1E1}` · hover `background:#FAFAFA; color:#141414`.
- **Cabeçalho**: linha flex do `#screen-analise-view` (`justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:10px`). Esquerda: `.page-title` = nome da campanha; `.page-sub` = "Canal: **{canal}** · Período: **{início → fim}** · {código}" (mesmo molde "Ciclo: **…** · Modelo: **…** · …"). Direita: badge de status no formato do cabeçalho de análise (`12px/600; padding 4px 12px; radius 20px; border 1px`): Ativa = `green-bg/green/green-b`; Pausada = `orange-bg/orange/orange` [o protótipo não tem token `--orange-b`; usar `.badge-orange` se preferir classe]; Encerrada = `bg/muted/border` (mesmo do "Rascunho"). Ações (botões) no header: o domínio não tem → nenhuma.
- **Orçamento**: `.analise-section` com título "💰 Orçamento" e `.progress-track`/`.progress-fill` (7px). Cor do fill: `var(--blue)` até 100%; acima de 100% `var(--red)` e texto auxiliar em `var(--red)` "Acima do orçamento em R$ x" [regras de cor mapeadas a partir da semântica do protótipo; o protótipo não tem barra de orçamento]. Linha de valores acima da barra: `display:flex; justify-content:space-between; font-size:13px` com o % em `font-weight:700` [mapeamento, no padrão do valor de `.impact-item`].
- **Grid de métricas**: 4 `.dash-card` em `repeat(4,1fr); gap:14px; margin-bottom:20px` para os KPIs principais (mesma linguagem do dashboard; sem `cursor:pointer` nem hover, pois não navegam) + `.analise-section` "📊 Métricas da Campanha" com grid `.aprov-grid`-like de rótulo/valor para as métricas brutas. [mapeamento] usar `grid-template-columns:repeat(4,1fr)` em vez de `2fr 1fr 1fr 1fr`, já que não há campo de texto longo.
- **Cor dos títulos de seção**: o `.analise-section-title` é laranja porque o módulo Análises é laranja. Como o nosso módulo "Campanhas" é azul, usar `color:var(--blue); border-bottom:2px solid var(--blue-bg)` (mesma combinação do `.card-section-label`) mantendo as demais medidas do `.analise-section-title` [mapeamento].
- **Coluna lateral sticky de 360px**: não há conteúdo equivalente (é o chat de IA) → não portar; o corpo fica em coluna única.
- **Campanha não encontrada**: usar o layout `.access-denied` com "🔍", `h3` "Campanha não encontrada", `p` "Ela pode ter sido removida ou o link está incorreto." e `.btn.btn-outline` "← Voltar para Campanhas" (`.btn-outline{background:#FFFFFF; color:#0A13B6; border-color:#0A13B6}` · hover `background:#EEF1FC`).

---

## 5. Resumo do que NÃO existe no protótipo (não inventar)

- Filtro de período no dashboard (usar `.tabs-pill`/`.chip`, que existem como componentes).
- Skeletons, spinners ou qualquer animação de carregamento (`@keyframes` não existe).
- Tela de erro genérica (só `#screen-denied` e toasts/alerts).
- Breakpoints para sidebar/topbar/main ou para os grids do dashboard.
- Dark mode.
- Indicador de direção de ordenação em `th`.
- Barra de orçamento (usa-se o `.progress-track` genérico).
- Uso real de `.mod-accent` no markup (só no CSS).
- Abreviação de valores monetários nos KPI cards.
