# DESIGN_SPEC — Marketing Insights no visual Apsen

Documento único para aplicar o visual do protótipo **Apsen Demand Intelligence** (`C:/Users/erik.santos/Downloads/di-drivers-v2_84.html`) no `marketing-insights-web`. O domínio não muda: continuam as mesmas telas (Dashboard, Lista de campanhas, Detalhe da campanha), os mesmos dados e os mesmos casos de uso. Muda só a camada visual.

Fontes consolidadas: `part-tokens-shell.md`, `part-components.md`, `part-screens.md` (mesma pasta). Quando este documento diverge deles, **vale este**. As divergências foram conferidas direto no protótipo (ver §0.2).

Convenções deste documento:

- `L123` = linha no arquivo do protótipo.
- **[derivado]** = não existe no protótipo; é a extensão coerente proposta aqui (ex.: dark mode, mobile).
- **[mapeamento]** = decisão de como encaixar um padrão do protótipo no nosso domínio.
- "não existe no protótipo" = não inventar.
- Todas as cores passam por tokens `apsen-*` (regra do `AGENTS.md`: sem hex solto nos componentes). Medidas em px usam valores arbitrários (`text-[12.5px]`, `px-[18px]`), porque o protótipo não usa escala nomeada e as escalas do Tailwind (`text-sm` etc.) embutem line-height e quebram a fidelidade.

---

## 0. Decisões globais

### 0.1 O que NÃO portar

- **Role bar** (`.role-bar`, 34px, "Simular perfil… Apenas para validação do protótipo", L37-55): é uma ferramenta do protótipo. Fica fora do app. Por isso `--rolebar-h` vira `0` em todas as fórmulas: sidebar `top:0; height:100vh`, topbar `top:0`, main `margin-top:64px; height:calc(100vh - 64px)`.
- Banner de perfil do dashboard (`#dash-perfil-banner`), perfis e permissões: o app não tem perfis.
- Coluna lateral sticky de 360px da análise (é um chat de IA): não tem equivalente.

### 0.2 Correções conferidas no protótipo

| Ponto                       | Relatório parcial                                               | Protótipo (verdade)                                                                                                                                                                                                                                 |
| --------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Item raiz "Dashboard" ativo | `part-tokens-shell` §3.2.2 dizia fundo `--blue-bg` e texto azul | `L491-492`: `#ni-dashboard{font-weight:600}` `#ni-dashboard.active{background:var(--blue);color:#fff !important}` → **pílula azul sólida, texto branco**. A especificidade (1,1,0) vence o `.nav-item:hover`, então ele **continua azul no hover**. |
| Nomes de tokens             | `part-components` usava `ink`/`canvas`/`ds`                     | Padronizado aqui com prefixo **`apsen-`** (não colide com `slate`/`blue`/`red`/`shadow-sm`/`rounded-lg` do Tailwind).                                                                                                                               |
| `@media`                    | —                                                               | Só existem `max-width` 800/560 (`.fg-*`, L162-163), 720/480 (`.g2/.g3`, L306-307) e 800 (`.aprov-grid`, L454). Nenhum para shell nem grids do dashboard. Dark mode e `prefers-color-scheme` não existem.                                            |

### 0.3 Armadilhas Tailwind 4 x protótipo (resolvidas no bloco base, §1)

1. O preflight define `line-height:1.5` no `html`; o protótipo não define (fica `normal`). → `body{line-height:normal}`.
2. O preflight define `svg{display:block}`; o protótipo usa `svg{display:inline-block;vertical-align:middle}` (L35).
3. A easing padrão do Tailwind é `cubic-bezier(.4,0,.2,1)` com 150ms; o protótipo usa `ease` (default CSS) com `.14s` na maioria. → `--default-transition-timing-function: ease` e `--default-transition-duration: 140ms` no `@theme`. Com isso, `transition-all` sozinho já é `all .14s`.
4. `antialiased` não existe no protótipo. Remover do body.
5. Fonte: o protótipo importa Inter **400/500/600/700** (L8) e usa `font-weight:800` só em `.dash-card-val`; o navegador cai para 700. Para reproduzir à risca, carregar o `next/font` com `weight: ['400','500','600','700']` (sem 800). Sem `weight`, o `next/font` usa a Inter variável e o 800 sai mais grosso que no protótipo.

---

## 1. `src/app/globals.css` — bloco pronto para colar

Substitui integralmente o arquivo atual. Os tokens `brand-*` (`#3b6ef5` etc.) não existem no protótipo e saem. As utilities `focus-ring` e `surface`, citadas no `AGENTS.md`, continuam a existir com o visual novo.

```css
@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  --color-apsen-blue: #0a13b6;
  --color-apsen-blue-d: #070d81;
  --color-apsen-blue-bg: #eef1fc;
  --color-apsen-blue-light: #ccdaf2;
  --color-apsen-teal: #0077be;
  --color-apsen-teal-bg: #e6f2fa;
  --color-apsen-teal-light: #99cde8;
  --color-apsen-slate: #141414;
  --color-apsen-slate-2: #1d1d1d;
  --color-apsen-slate-3: #404040;
  --color-apsen-muted: #6f6f6f;
  --color-apsen-muted-2: #8a8a8a;
  --color-apsen-border: #e1e1e1;
  --color-apsen-bg: #fafafa;
  --color-apsen-white: #ffffff;
  --color-apsen-green: #18a957;
  --color-apsen-green-bg: #e7f1ea;
  --color-apsen-green-b: #81c17e;
  --color-apsen-yellow: #f4cf3d;
  --color-apsen-yellow-bg: #fdf4de;
  --color-apsen-yellow-b: #f4cf3d;
  --color-apsen-red: #d63434;
  --color-apsen-red-bg: #fae9e9;
  --color-apsen-red-b: #d63434;
  --color-apsen-orange: #dd7443;
  --color-apsen-orange-bg: #fff1ea;
  --color-apsen-orange-soft: #fff7ed;
  --color-apsen-orange-b: #fed7aa;
  --color-apsen-purple: #7c3aed;
  --color-apsen-purple-bg: #f5f3ff;
  --color-apsen-purple-b: #c4b5fd;

  --color-apsen-hover: #f8fafc;
  --color-apsen-row-hover: #fafbfc;
  --color-apsen-cyan: #0891b2;
  --color-apsen-teal-hover: #0d6b63;
  --color-apsen-purple-hover: #6d28d9;
  --color-apsen-overlay: rgba(15, 23, 42, 0.42);
  --color-apsen-warning-fg: #92400e;
  --color-apsen-success-fg: #14532d;
  --color-apsen-danger-fg: #991b1b;
  --color-apsen-tip-bg: #1e293b;
  --color-apsen-tip-fg: #cbd5e1;
  --color-apsen-tip-strong: #f8fafc;
  --color-apsen-tip-em: #7dd3fc;

  --color-apsen-kpi-blue: #eef3ff;
  --color-apsen-kpi-red: #fef2f2;
  --color-apsen-kpi-green: #f0fdf4;
  --color-apsen-kpi-orange: #fff7ed;

  --color-apsen-ch-google: #3b82f6;
  --color-apsen-ch-meta: #6366f1;
  --color-apsen-ch-linkedin: #8b5cf6;
  --color-apsen-ch-email: #f59e0b;
  --color-apsen-ch-tiktok: #10b981;
  --color-apsen-ch-extra: #ef4444;

  --color-apsen-cat-tv-bg: #eef2ff;
  --color-apsen-cat-tv-b: #a5b4fc;
  --color-apsen-cat-tv-fg: #4338ca;
  --color-apsen-cat-digital-bg: #f0fdf4;
  --color-apsen-cat-digital-b: #86efac;
  --color-apsen-cat-digital-fg: #166534;
  --color-apsen-cat-pdv-bg: #fffbeb;
  --color-apsen-cat-pdv-b: #fcd34d;
  --color-apsen-cat-pdv-fg: #92400e;
  --color-apsen-cat-conc-bg: #ecfeff;
  --color-apsen-cat-conc-b: #67e8f9;
  --color-apsen-cat-conc-fg: #0e7490;
  --color-apsen-cat-sazo-bg: #f0fdf4;
  --color-apsen-cat-sazo-b: #6ee7b7;
  --color-apsen-cat-sazo-fg: #065f46;
  --color-apsen-cat-viral-bg: #fdf2f8;
  --color-apsen-cat-viral-b: #f0abfc;
  --color-apsen-cat-viral-fg: #86198f;
  --color-apsen-danger-b-soft: #fca5a5;
  --color-apsen-danger-ink: #7f1d1d;
  --color-apsen-attention: #b45309;
  --color-apsen-row-active: #fffbf5;
  --color-apsen-pal-blue: #2563eb;
  --color-apsen-pal-purple: #7c3aed;
  --color-apsen-pal-cyan: #0891b2;
  --color-apsen-pal-amber: #d97706;
  --color-apsen-pal-emerald: #059669;
  --color-apsen-pal-red: #dc2626;
  --color-apsen-pal-lime: #65a30d;
  --color-apsen-pal-slate: #64748b;
  --color-apsen-purple-soft: #f3e8ff;
  --color-apsen-purple-soft-b: #ddd6fe;
  --color-apsen-blue-soft-b: #c7d7fa;
  --color-apsen-teal-soft: #f0fdfa;
  --color-apsen-teal-soft-b: #99f6e4;
  --color-apsen-cyan-bg: #e0f2fe;
  --color-apsen-cyan-b: #bae6fd;
  --color-apsen-yellow-soft: #fff8ec;
  --color-apsen-code-bg: #141414;
  --color-apsen-code-fg: #7dd3fc;
  --color-apsen-chart-fill: rgba(27, 78, 201, 0.08);
  --color-apsen-chart-grid: rgba(0, 0, 0, 0.04);

  --spacing-sidebar: 252px;
  --spacing-topbar: 64px;

  --radius-apsen: 8px;
  --radius-apsen-lg: 16px;
  --radius-apsen-pill: 24px;

  --shadow-apsen-sm: 0 2px 4px 0 rgba(20, 20, 20, 0.08);
  --shadow-apsen: 0 4px 4px 0 rgba(20, 20, 20, 0.08);
  --shadow-apsen-md: 0 6px 10px 0 rgba(20, 20, 20, 0.08);
  --shadow-apsen-hover: 0 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-apsen-tab: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-apsen-focus: 0 0 0 3px rgba(27, 78, 201, 0.1);
  --shadow-apsen-dropdown: 0 6px 24px rgba(0, 0, 0, 0.12);
  --shadow-apsen-modal: 0 20px 40px rgba(0, 0, 0, 0.18);
  --shadow-apsen-tip: 0 8px 28px rgba(0, 0, 0, 0.28);

  --default-transition-duration: 140ms;
  --default-transition-timing-function: ease;
}

html {
  color-scheme: light;
}

html.dark {
  color-scheme: dark;
  --color-apsen-blue: #7c87f5;
  --color-apsen-blue-d: #5a66e8;
  --color-apsen-blue-bg: #1b2050;
  --color-apsen-blue-light: #2e3680;
  --color-apsen-teal: #4fb3e8;
  --color-apsen-teal-bg: #0e2a3b;
  --color-apsen-teal-light: #1f5675;
  --color-apsen-slate: #f2f2f2;
  --color-apsen-slate-2: #e6e6e6;
  --color-apsen-slate-3: #c7c7c7;
  --color-apsen-muted: #a3a3a3;
  --color-apsen-muted-2: #8a8a8a;
  --color-apsen-border: #2c2e33;
  --color-apsen-bg: #111214;
  --color-apsen-white: #1a1b1f;
  --color-apsen-green: #3dd68c;
  --color-apsen-green-bg: #12301f;
  --color-apsen-green-b: #2e7d4f;
  --color-apsen-yellow: #f4cf3d;
  --color-apsen-yellow-bg: #3a3115;
  --color-apsen-yellow-b: #8a7420;
  --color-apsen-red: #f06565;
  --color-apsen-red-bg: #3a1717;
  --color-apsen-red-b: #a33a3a;
  --color-apsen-orange: #f08f5e;
  --color-apsen-orange-bg: #3a2216;
  --color-apsen-orange-soft: #2e1c12;
  --color-apsen-orange-b: #7a4426;
  --color-apsen-purple: #a78bfa;
  --color-apsen-purple-bg: #2a1f4a;
  --color-apsen-purple-b: #5b45a8;
  --color-apsen-hover: #22242a;
  --color-apsen-row-hover: #202126;
  --color-apsen-cyan: #22b8d6;
  --color-apsen-teal-hover: #3a9bcf;
  --color-apsen-purple-hover: #8f6ef5;
  --color-apsen-overlay: rgba(0, 0, 0, 0.6);
  --color-apsen-warning-fg: #fcd34d;
  --color-apsen-success-fg: #86efac;
  --color-apsen-danger-fg: #fca5a5;
  --color-apsen-tip-bg: #2b3446;
  --color-apsen-tip-fg: #d5dbe5;
  --color-apsen-tip-strong: #f8fafc;
  --color-apsen-tip-em: #7dd3fc;
  --color-apsen-kpi-blue: #1b2050;
  --color-apsen-kpi-red: #3a1717;
  --color-apsen-kpi-green: #12301f;
  --color-apsen-kpi-orange: #3a2216;
  --color-apsen-cat-tv-bg: #1e2148;
  --color-apsen-cat-tv-b: #4b53a8;
  --color-apsen-cat-tv-fg: #a5b4fc;
  --color-apsen-cat-digital-bg: #12301f;
  --color-apsen-cat-digital-b: #2e7d4f;
  --color-apsen-cat-digital-fg: #86efac;
  --color-apsen-cat-pdv-bg: #3a3115;
  --color-apsen-cat-pdv-b: #8a7420;
  --color-apsen-cat-pdv-fg: #fcd34d;
  --color-apsen-cat-conc-bg: #0e2e36;
  --color-apsen-cat-conc-b: #1f6b7a;
  --color-apsen-cat-conc-fg: #67e8f9;
  --color-apsen-cat-sazo-bg: #10302a;
  --color-apsen-cat-sazo-b: #2a7a62;
  --color-apsen-cat-sazo-fg: #6ee7b7;
  --color-apsen-cat-viral-bg: #3a1630;
  --color-apsen-cat-viral-b: #8a3f8f;
  --color-apsen-cat-viral-fg: #f0abfc;
  --color-apsen-danger-b-soft: #a33a3a;
  --color-apsen-danger-ink: #fecaca;
  --color-apsen-attention: #f59e0b;
  --color-apsen-row-active: #241c14;
  --color-apsen-pal-blue: #5b8def;
  --color-apsen-pal-purple: #a78bfa;
  --color-apsen-pal-cyan: #22b8d6;
  --color-apsen-pal-amber: #f0a43a;
  --color-apsen-pal-emerald: #34c08f;
  --color-apsen-pal-red: #f06565;
  --color-apsen-pal-lime: #8fc93a;
  --color-apsen-pal-slate: #94a3b8;
  --color-apsen-purple-soft: #2a1f4a;
  --color-apsen-purple-soft-b: #5b45a8;
  --color-apsen-blue-soft-b: #2e3680;
  --color-apsen-teal-soft: #0e2a2a;
  --color-apsen-teal-soft-b: #1f6b5e;
  --color-apsen-cyan-bg: #0e2a3b;
  --color-apsen-cyan-b: #1f5675;
  --color-apsen-yellow-soft: #3a3115;
  --color-apsen-code-bg: #0b0c0e;
  --color-apsen-code-fg: #7dd3fc;
  --color-apsen-chart-fill: rgba(124, 135, 245, 0.16);
  --color-apsen-chart-grid: rgba(255, 255, 255, 0.06);
  --shadow-apsen-sm: 0 2px 4px 0 rgba(0, 0, 0, 0.4);
  --shadow-apsen: 0 4px 4px 0 rgba(0, 0, 0, 0.4);
  --shadow-apsen-md: 0 6px 10px 0 rgba(0, 0, 0, 0.4);
  --shadow-apsen-hover: 0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-apsen-tab: 0 1px 3px rgba(0, 0, 0, 0.5);
  --shadow-apsen-focus: 0 0 0 3px rgba(124, 135, 245, 0.25);
  --shadow-apsen-dropdown: 0 6px 24px rgba(0, 0, 0, 0.5);
  --shadow-apsen-modal: 0 20px 40px rgba(0, 0, 0, 0.6);
  --shadow-apsen-tip: 0 8px 28px rgba(0, 0, 0, 0.6);
}

@layer base {
  body {
    @apply h-screen overflow-hidden bg-apsen-bg font-sans text-[14px] text-apsen-slate;
    line-height: normal;
  }

  svg {
    display: inline-block;
    vertical-align: middle;
  }
}

@utility focus-ring {
  @apply focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apsen-blue;
}

@utility surface {
  @apply mb-[16px] rounded-apsen-lg border border-apsen-border bg-apsen-white px-[22px] py-[20px] shadow-apsen-sm;
}

@utility field-focus {
  @apply outline-none focus:border-apsen-blue focus:shadow-apsen-focus;
}
```

Notas do bloco:

- **Não usar `@theme inline`.** Sem `inline`, os utilitários apontam para `var(--color-apsen-*)`, então a troca das variáveis em `html.dark` já muda o tema sem `dark:` em cada classe. O `dark:` fica só para exceções.
- **Dark mode = [derivado].** O protótipo só tem tema claro. A paleta escura acima mantém o mesmo papel de cada token: `apsen-white` = superfície (card, sidebar, topbar), `apsen-bg` = fundo da página, `apsen-slate` = texto principal, e as cores de status ficam mais claras para manter contraste sobre fundo escuro. Os tokens `ch-*` (canais) não mudam.
- Por isso **`bg-apsen-white` só serve para superfícies**. Texto branco sobre fundo colorido (botões sólidos, avatar, `nav-badge`, Dashboard ativo) usa `text-white`, que não inverte no escuro.
- `focus-ring` **[derivado]**: o protótipo não tem foco em botão ou link. É um contorno `outline` só em `:focus-visible`, que aparece apenas na navegação por teclado e não altera a comparação visual com o mouse. Em campos (`input`/`select`) vale o foco do protótipo, `field-focus` (borda azul + `0 0 0 3px rgba(27,78,201,.1)`, L172-173).
- `surface` = `.card` do protótipo (L145-147).
- O token `--spacing-sidebar` gera `w-sidebar`, `ml-sidebar`, `left-sidebar`, e `--spacing-topbar` gera `h-topbar`, `mt-topbar`.

### 1.0 Conferência dos tokens com o protótipo (PBI 39010, 27/10/2026)

Comparação automática das 38 variáveis do `:root` do protótipo (L17-33) com o `@theme` acima.

| Protótipo                                                | Token                                        | Situação                                                                         |
| -------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| 29 cores (`--blue` … `--purple-b`)                       | `--color-apsen-*` de mesmo nome              | igual                                                                            |
| `--sidebar-w: 252px`, `--topbar-h: 64px`                 | `--spacing-sidebar`, `--spacing-topbar`      | igual                                                                            |
| `--radius`, `--radius-lg`, `--radius-pill` (8, 16, 24px) | `--radius-apsen`, `-lg`, `-pill`             | igual                                                                            |
| `--shadow-sm`, `--shadow`, `--shadow-md`                 | `--shadow-apsen-sm`, `--shadow-apsen`, `-md` | igual                                                                            |
| `--rolebar-h: 34px`                                      | —                                            | descartado (barra "Simular perfil", §0.1)                                        |
| Fonte `'Inter', -apple-system, …`                        | `--font-sans` com `var(--font-inter)`        | igual (Inter via `next/font`)                                                    |
| Tema escuro                                              | `html.dark`                                  | ajustado: `--shadow-apsen-dropdown` e `--shadow-apsen-modal` ganharam par escuro |

Hex fora do `:root` do protótipo que ainda não são tokens ficam para as histórias que os usam: categorias de driver `.db-*` (Registrar Driver, Sprint 2), tooltip `#1e293b`/`#cbd5e1`/`#f8fafc`/`#7dd3fc` (PBI 39014) e role bar `#64748b`/`#334155` (descartada). Os tokens `ch-*` são categóricos e valem nos dois temas. Nenhum componente em `src/` usa hex ou paleta padrão do Tailwind (teste `designTokensSource.test.ts`).

**Tokens do protótipo fora do `:root` (onda 1, [prototipo-ui-kit](../specs/platform/prototipo-ui-kit.md) RN-06).** Pares escuros [derivado], todos no `@theme` e em `html.dark`:

| Grupo                | Tokens                                                                                                        | Uso                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Categorias de driver | `cat-{tv,digital,pdv,conc,sazo,viral}-{bg,b,fg}`                                                              | `CategoryTag` (`.db-*`, L410-423)                                         |
| Restrições           | `danger-b-soft`, `danger-ink`, `attention`, `row-active`                                                      | borda/texto do banner, severidade "atenção", linha do ciclo ativo         |
| Paleta categórica    | `pal-{blue,purple,cyan,amber,emerald,red,lime,slate}`                                                         | `ColorPill` (franquias, famílias, provedores; fallback `pal-slate`)       |
| Banners e pills      | `purple-soft`, `purple-soft-b`, `blue-soft-b`, `teal-soft`, `teal-soft-b`, `cyan-bg`, `cyan-b`, `yellow-soft` | banners de perfil, pill de nível Franquia, relatórios, provedor anthropic |
| Código               | `code-bg`, `code-fg`                                                                                          | `CodeBlock` (`.export-box`, L351-353)                                     |
| Gráfico              | `chart-fill`, `chart-grid` (rgba)                                                                             | Chart.js lê do CSS em runtime para seguir o tema                          |

O link "Plano MVP" (`#DCFCE7`) não é portado e não ganha token.

### 1.1 `src/app/layout.tsx` (único ajuste fora do CSS)

```tsx
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter', display: 'swap' });
...
<body className="font-sans">
```

`min-h-dvh` sai do body, porque quem define altura e scroll é a base (`h-screen overflow-hidden`) e o `.main` (§2.4).

### 1.2 Escala tipográfica de referência (px exatos do CSS)

| Uso                                                                 | Tamanho/peso            |
| ------------------------------------------------------------------- | ----------------------- |
| `nav-module`, `nav-badge`, `sidebar-footer`                         | 10px / 700 (footer 400) |
| `card-section-label`, rótulos de grid de valores                    | 10.5px / 700            |
| `form-hint`, `card-title small`, rótulo de painel do dashboard      | 11px                    |
| `th`, `.badge`, `form-label`, avatar, sub do KPI                    | 11.5px                  |
| `.btn-sm`, `.chip`, `td-mono`, "Ver todos →"                        | 12px                    |
| `page-sub`, `topbar-crumb`, `screen-desc`, `dash-card-lbl`, `alert` | 12.5px                  |
| `nav-item`, `.btn`, `td`, `topbar-name`, contador da lista          | 13px                    |
| `card-title`, `form-input`, `.empty p`                              | 13.5px                  |
| `body`                                                              | 14px                    |
| `page-title`                                                        | 18px / 700 / lh 1.2     |
| `dash-card-val`                                                     | 26px / 800 / lh 1.1     |

---

## 2. Shell (`components/layout`)

### 2.1 Anatomia

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ SIDEBAR 252px │ TOPBAR 64px:  ☰  Marketing Insights › Dashboard    [tema] (A) Apsen Marketing │
│ [logo]│Marketing├──────────────────────────────────────────────────────────────┤
│       │Insights │ MAIN  ml 252 · mt 64 · h calc(100vh-64px) · overflow-y auto  │
│ ┌───────────┐ │       padding 22px 24px                                      │
│ │▦ Dashboard│ │   page-hdr                                                   │
│ └───────────┘ │   (screen-desc)                                              │
│ CAMPANHAS   ▼ │   conteúdo                                                   │
│     Todas as  │                                                              │
│     Campanhas │                                                              │
│ ───────────── │                                                              │
│ Apsen Farmac. │                                                              │
│ Marketing Ins.│                                                              │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

Arquivos: `AppShell.tsx` (Server Component que monta a estrutura), `Sidebar.tsx`, `Topbar.tsx` e `NavLinks.tsx` (client), `navItems.ts` (estrutura), `navStore` ou estado local `navOpen` (client). `ThemeToggle.tsx` é mantido e restilizado.

### 2.2 Sidebar

**Container** (L56-59):

```
fixed top-0 left-0 z-30 flex h-screen w-sidebar flex-col overflow-y-auto
border-r border-apsen-border bg-apsen-white transition-transform duration-200
```

Fechada: `-translate-x-full`. Scrollbar customizada não existe no protótipo.

**Logo** (L60-64 + inline L544-551). O asset está em `public/brand/apsen-logo.png` (124x96 px, renderizado com 34px de altura):

```tsx
<div className="flex h-topbar shrink-0 items-center gap-[10px] border-b border-apsen-border px-[18px]">
  <Image
    src="/brand/apsen-logo.png"
    alt="Apsen"
    width={124}
    height={96}
    priority
    className="h-[34px] w-auto shrink-0"
  />
  <div className="ml-[2px] border-l border-apsen-border pl-[10px]">
    <strong className="block text-[12px] font-bold leading-[1.2] text-apsen-slate">
      Marketing
    </strong>
    <span className="text-[10.5px] text-apsen-muted">Insights</span>
  </div>
</div>
```

O texto "Demand / Intelligence" vira "Marketing / Insights" **[mapeamento]**, com a mesma tipografia: o `strong` em 12px/700 e o `span` em 10.5px, que é o valor inline e vence os 10px do CSS. No modo escuro **[derivado]** o PNG fica sobre `#1A1B1F`. Se faltar contraste, aplicar `dark:brightness-0 dark:invert` só na imagem.

**Item raiz "Dashboard"** (`.nav-item` + inline L555 + L491-492):

```
base:     mx-[8px] mt-[8px] mb-[4px] flex select-none items-center gap-[8px] rounded-apsen
          border-l-[3px] border-transparent py-[8px] pr-[18px] pl-[13px] text-[13px] font-semibold transition-all
inativo:  text-apsen-muted hover:bg-apsen-hover hover:text-apsen-slate
ativo:    bg-apsen-blue text-white            (sem classes de hover: continua azul no hover)
```

Ícone: `LayoutGrid` do lucide ou o SVG do protótipo (4 `rect` 7x7 em 3,3 / 14,3 / 3,14 / 14,14), `size-[13px] shrink-0`, `strokeWidth={2}`. Ativo quando `pathname === '/'`, com `aria-current="page"`.

**Cabeçalho de módulo** `.nav-module` (L66-77). No protótipo é uma `div` clicável; aqui vira `<button type="button" aria-expanded>`:

```
relative mt-[6px] flex w-full cursor-pointer select-none items-center gap-[8px]
border-l-[3px] border-transparent pt-[10px] pr-[18px] pb-[6px] pl-[18px] text-left
text-[10px] font-bold uppercase tracking-[.12em] text-apsen-muted-2 transition-all
```

- Hover: não existe no protótipo. Estado `.active-mod`: definido no CSS, mas nunca aplicado. Não usar nenhum dos dois.
- Seta: `<span aria-hidden className="ml-auto text-[9px] text-apsen-muted-2 transition-transform duration-[180ms]">▼</span>`, com `rotate-180` quando aberto.
- `.mod-accent` (3x22px, radius 2px, cor do módulo, L76-79) existe no CSS, mas não aparece no markup do protótipo. Decisão da onda 0 (`prototipo-plataforma.md`, pergunta 4): **renderizar** só nos 3 módulos com cor no CSS — Drivers `bg-apsen-blue`, Administração DI `bg-apsen-teal`, Controle de Acesso `bg-apsen-purple`.

**Filhos** `.nav-children` (L80-81): abre e fecha sem animação (`max-height` sem transição). Renderizar condicionalmente: `{open ? <ul>…</ul> : null}`. O módulo que contém a rota atual começa aberto; o clique alterna.

**Item** `.nav-item` (L83-91), com `<Link>`:

```
base:     flex select-none items-center gap-[8px] border-l-[3px] py-[8px] pr-[18px] pl-[44px] text-[13px] transition-all
inativo:  border-transparent text-apsen-muted hover:bg-apsen-hover hover:text-apsen-slate
ativo:    border-apsen-blue bg-apsen-blue-bg font-medium text-apsen-blue   (aria-current="page")
```

Os itens filhos não têm ícone; o recuo de 44px faz o alinhamento.

**Badge** `.nav-badge` (L92-96), componente `NavBadge`:

```
ml-auto whitespace-nowrap rounded-[20px] px-[7px] py-[1px] text-[10px] font-bold text-white
tons: blue → bg-apsen-blue · teal → bg-apsen-teal · red → bg-apsen-red · purple → bg-apsen-purple
      orange → bg-apsen-orange · gray → bg-apsen-muted · soon → bg-apsen-cyan text-[9px]
```

**Footer** `.sidebar-footer` (L97-99):

```tsx
<div className="mt-auto shrink-0 border-t border-apsen-border px-[18px] py-[12px] text-[10px] leading-[1.8] text-apsen-muted-2">
  Apsen Farmacêutica
  <br />
  Marketing Insights · Campanhas
</div>
```

**Estrutura de navegação** (`navItems.ts`) **[mapeamento]**:

```ts
export interface NavLeaf {
  href: Route;
  label: string;
  badge?: { value: number; tone: NavBadgeTone };
}
export interface NavModule {
  key: string;
  label: string;
  items: readonly NavLeaf[];
}
export const NAV_ROOT: NavLeaf = { href: '/', label: 'Dashboard' };
export const NAV_MODULES: readonly NavModule[] = [
  {
    key: 'campanhas',
    label: 'Campanhas',
    items: [{ href: CAMPAIGNS_ROUTE, label: 'Todas as Campanhas' }],
  },
];
```

- `/campaigns/[id]` não tem item próprio. "Todas as Campanhas" fica ativo (`isActiveRoute` por prefixo) e o módulo, aberto.
- Item "Ativas" não entra: os filtros ficam no store (`campaignFiltersStore`), não na URL. Um módulo com um único item é um padrão que existe no protótipo ("Análises › Minhas Análises").
- O badge é opcional e fica sem valor por padrão. A sidebar não busca dados. Se um dia houver contagem disponível, usar o tom `blue` (padrão de "Meus Registros", `nb-blue`).

### 2.3 Topbar (L102-114, markup L674-684)

```tsx
<header className="fixed top-0 right-0 z-20 flex h-topbar items-center gap-[14px] border-b border-apsen-border bg-apsen-white px-[22px] transition-[left] duration-200 {navOpen ? 'left-sidebar max-[800px]:left-0' : 'left-0'}">
  <button
    type="button"
    aria-label="Alternar menu"
    aria-expanded={navOpen}
    onClick={toggle}
    className="cursor-pointer select-none rounded-[4px] p-[4px] text-[17px] leading-none text-apsen-muted transition-[background-color] hover:bg-apsen-bg hover:text-apsen-slate focus-ring"
  >
    ☰
  </button>
  <nav aria-label="Trilha" className="flex items-center gap-[5px] text-[12.5px] text-apsen-muted">
    <span>Marketing Insights</span>
    <ChevronRight aria-hidden className="size-[12px] opacity-40" strokeWidth={2} />
    <strong className="font-medium text-apsen-slate">{crumb}</strong>
  </nav>
  <div className="flex-1" />
  <ThemeToggle />
  <div
    aria-hidden
    className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-apsen-purple text-[11.5px] font-bold text-white"
  >
    A
  </div>
  <span className="text-[13px] font-semibold text-apsen-slate max-[560px]:hidden">
    Apsen Marketing
  </span>
</header>
```

- Burger: o caractere "☰" com 17px. Só o `background` tem transição; a cor troca na hora.
- Separador da trilha: o SVG do protótipo é `<polyline points="9 18 15 12 9 6"/>`, equivalente ao `ChevronRight` do lucide. Se o lucide não estiver instalado, usar o SVG inline (não adicionar dependência).
- Crumb por rota **[mapeamento]**: `/` → "Dashboard" · `/campaigns` → "Campanhas" · `/campaigns/[id]` → "Detalhe da Campanha" · not-found → "Página não encontrada". A função pura `crumbFor(pathname)` fica em `components/layout`.
- Avatar: fundo `bg-apsen-purple`, literal do `#topbar-av` (L682, `style="background:var(--purple)"`). Nome **[mapeamento]**: o app não tem autenticação, então usa a inicial "A" e o nome "Apsen Marketing". Trocar pelo usuário real quando houver.
- `ThemeToggle` **[mapeamento]**: não existe no protótipo. Fica antes do avatar, com o estilo `btn btn-ghost btn-sm` (§3.1).
- Dropdown do avatar, notificações e busca global: não existem no protótipo.

### 2.4 Main (L116-119)

```tsx
<main className="mt-topbar h-[calc(100vh-var(--spacing-topbar))] overflow-y-auto px-[24px] py-[22px] transition-[margin-left] duration-200 {navOpen ? 'ml-sidebar max-[800px]:ml-0' : 'ml-0'}">
```

- `max-width` do conteúdo não existe no protótipo: o conteúdo ocupa toda a largura. O `max-w-6xl` atual sai.
- O `main` é o único container de scroll. Ao trocar de rota, zerar o `scrollTop` (o protótipo faz isso em `goScreen`).
- O `body` não rola (`h-screen overflow-hidden`, vem da base).

### 2.5 Colapsado e mobile

- **Desktop (literal do protótipo):** o burger alterna o estado aberto/fechado. Fechado, a sidebar ganha `-translate-x-full` (.2s) e a topbar anima `left` de 252px para 0 (.2s). O protótipo tem um bug: o `.main` continua com `margin-left` de 252px. A `transition:margin-left .2s` do CSS deixa clara a intenção, então aqui o `main` vai para `ml-0` **[derivado da intenção]**. O estado inicial é aberto. Persistência não existe no protótipo.
- **Mobile, abaixo de 800px [derivado]** (800px é o maior breakpoint do protótipo):
  - O estado inicial é fechado (no mount, `matchMedia('(max-width: 800px)')`).
  - Aberta, a sidebar fica **por cima** do conteúdo. A topbar e o `main` ficam em `left-0`/`ml-0` (classes `max-[800px]:` acima).
  - Backdrop: `<div aria-hidden onClick={close} className="fixed inset-0 z-[25] hidden bg-apsen-overlay max-[800px]:block" />`, renderizado só quando aberto. A cor é a do `.modal-overlay` (L255).
  - A sidebar fecha ao navegar.
  - O nome ao lado do avatar some abaixo de 560px.
- Nos dois casos, o grid interno responde com os breakpoints do protótipo (§4).

---

### 2.6 Onda 0 — shell do Demand Intelligence (`prototipo-plataforma.md`, `login.md`)

- **Textos**: logo "Demand / Intelligence"; rodapé "Apsen Farmacêutica / PLP Agent · Demand Intelligence"; trilha "Demand Intelligence › {crumb}" com o crumb de `navigation/screens.ts` ("Acesso Negado" quando a guarda bloqueia, "Página não encontrada" fora do registro).
- **Módulos**: Dashboard + 8 módulos na ordem do protótipo (L542-681), visíveis pelo nível do perfil da sessão (`setRole`, L3716-3753). "Exportar JSON" exige nível 3 e "Novo Usuário" nível 4.
- **Badges** calculados da API (`X-Total-Count`), inclusive os fixos do protótipo; contagem indisponível oculta só aquele badge; "A definir" mostra "em breve" (tom `soon`).
- **Item ativo** decidido pela tela atual (`ni-{id}`), não por prefixo de rota. **Accordion**: um módulo aberto por vez; a tela atual abre o seu; Drivers começa aberto.
- **Gaveta < 800 px**: começa fechada, overlay, Esc fecha e devolve o foco ao burger, abrir foca o primeiro link; `motion-reduce:transition-none`.
- **Role bar**: continua fora do app (§0.1). O perfil vem do usuário autenticado por SSO.
- **Menu do usuário** (topbar): avatar 30 px com a letra e a cor do perfil (`purple`/`blue`/`teal`/`avatar-muted`) + nome; menu com nome, e-mail, perfil e "Sair".
- **Acesso Restrito** (L3153-3161): 🔒, `h1` "Acesso Restrito", "Seu perfil ({label}) não tem acesso a esta funcionalidade.", texto de upgrade por nível com `<strong>` e botão outline "← Voltar ao Dashboard".
- **Toast** (substitui o do protótipo, §13.2): canto superior direito abaixo da topbar, 380 px, faixa de 4 px na cor do tom, ícone em círculo, título por tom, ✕, barra de progresso; 4 s (erro 6 s), pausa no hover/foco, pilha de 3.
- **Carregamento** (§13.3): `RouteProgress` de 3 px `apsen-blue` no topo (após 120 ms; indeterminado em buscas iniciais), `BusyRegion` (opacidade 60 % + `aria-busy`) e `FullScreenLoader` com o logo pulsando ("Verificando sua sessão…", "Redirecionando para o login…", "Entrando…").
- **Token novo**: `--color-apsen-avatar-muted` `#6f6f6f` / escuro `#5c5c5c` (avatar do Visualizador; o `muted` clareia no escuro e o texto branco ficaria ilegível).

## 3. UI kit (`src/presentation/components/ui`)

Cada componente tem sua tabela de classes e um markup de referência. Classes base reaproveitáveis ficam como constantes no próprio arquivo (sem comentários, conforme o `AGENTS.md`).

### 3.1 `Button` (novo) — `.btn*` (L180-199)

```tsx
type ButtonVariant =
  'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'teal' | 'purple' | 'outline-teal';
type ButtonSize = 'md' | 'sm';
```

| Parte        | Classes                                                                                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| base         | `inline-flex cursor-pointer items-center gap-[6px] whitespace-nowrap rounded-apsen-pill border border-transparent font-semibold leading-none transition-all focus-ring disabled:cursor-default disabled:opacity-[.35]` |
| `md`         | `px-[20px] py-[9px] text-[13px]`                                                                                                                                                                                       |
| `sm`         | `px-[12px] py-[5px] text-[12px]`                                                                                                                                                                                       |
| primary      | `border-apsen-blue bg-apsen-blue text-white hover:bg-apsen-blue-d`                                                                                                                                                     |
| outline      | `border-apsen-blue bg-apsen-white text-apsen-blue hover:bg-apsen-blue-bg`                                                                                                                                              |
| ghost        | `border-apsen-border bg-transparent text-apsen-muted hover:bg-apsen-bg hover:text-apsen-slate`                                                                                                                         |
| danger       | `border-apsen-red-b bg-apsen-white text-apsen-red hover:bg-apsen-red-bg`                                                                                                                                               |
| success      | `border-apsen-green-b bg-apsen-white text-apsen-green hover:bg-apsen-green-bg`                                                                                                                                         |
| teal         | `border-apsen-teal bg-apsen-teal text-white hover:bg-apsen-teal-hover`                                                                                                                                                 |
| purple       | `border-apsen-purple bg-apsen-purple text-white hover:bg-apsen-purple-hover`                                                                                                                                           |
| outline-teal | `border-apsen-teal bg-apsen-white text-apsen-teal hover:bg-apsen-teal-bg`                                                                                                                                              |

- `:focus`, `:active` e `:disabled` não existem no protótipo. O `disabled:opacity-[.35]` vem do único "desabilitado" visual que existe, a paginação (inline `opacity:.35`). O foco é o `focus-ring` [derivado].
- O componente aceita `as="link"` (`next/link`) para links com cara de botão, ou exporta `buttonClasses(variant,size)` para usar em `<Link>`.
- Variantes usadas nas telas: `ghost sm` ("Atualizar", "← Voltar", "Limpar filtros", tema), `outline md` ("Tentar novamente", "← Voltar ao Dashboard").
- **Onda 1** ([prototipo-ui-kit](../specs/platform/prototipo-ui-kit.md)): variantes sólidas sem hover `orange` (`border-apsen-orange bg-apsen-orange text-white`, inline L2249) e `red` (`border-apsen-red bg-apsen-red text-white`, L2564); tamanho `xs` (`px-[8px] py-[2px] text-[11px]`, ação do `PendingItemRow`); `dashed` → `border-dashed` em `Button` e `ButtonLink`; `loading` → `disabled`, `aria-busy="true"` e o texto `loadingLabel` (padrão "Salvando…"), sem duplo envio (ARQUITETURA §7.3).
- `IconButton`/`IconLink` `tone` (`.action-btn`, `.red`, `.teal`, L234-240): `blue` (padrão) `text-apsen-muted hover:bg-apsen-blue-bg hover:text-apsen-blue`; `red` `hover:bg-apsen-red-bg hover:text-apsen-red`; `teal` `hover:bg-apsen-teal-bg hover:text-apsen-teal`; `green` `text-apsen-green hover:bg-apsen-blue-bg` (L6464); todos `disabled:cursor-default disabled:opacity-[.3] disabled:hover:bg-transparent`.

```tsx
<Button variant="ghost" size="sm" onClick={refetch}>
  Atualizar
</Button>
```

**Botões auxiliares:**

- `IconButton` (`.action-btn`, L234-240): `inline-flex size-[28px] cursor-pointer items-center justify-center rounded-[5px] border-0 bg-transparent text-apsen-muted transition-all duration-[130ms] hover:bg-apsen-blue-bg hover:text-apsen-blue focus-ring`. Ícone SVG 14x14 com `stroke-width 2`. O grupo (`.action-grp`) usa `flex items-center gap-[2px]`.
- Link de tabela (`.tbl-link`, L241-242): `cursor-pointer font-medium text-apsen-blue hover:underline focus-ring`.
- Link "Ver todos →" (inline no dashboard): `cursor-pointer text-[12px] text-apsen-blue focus-ring`. Hover não existe no protótipo.
- `TextLink`, `IconLink` e `ButtonLink` são genéricos na rota: `<T extends string>(props: { href: Route<T> })`. Aceitam rotas estáticas (`CAMPAIGNS_ROUTE`) e dinâmicas tipadas (`campaignDetailsRoute(id)`), sem `<Link>` ad hoc nas features.

### 3.2 `StatusBadge` — `.badge` (L202-212)

`Badge size`: `md` (padrão, com ponto), `lg` (borda, sem ponto) e, na onda 1, `xl` (L1818, "{n} pendentes" do cabeçalho de aprovações): `gap-[5px] px-[13px] py-[5px] text-[12.5px] font-medium` + o ponto do `md`, sem borda.

| Status      | Variante do protótipo                                    | Classes                                                       |
| ----------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| `ativa`     | `badge-green`                                            | `bg-apsen-green-bg text-apsen-green before:bg-apsen-green`    |
| `pausada`   | `badge-orange`                                           | `bg-apsen-orange-bg text-apsen-orange before:bg-apsen-orange` |
| `encerrada` | `badge-gray` (o mesmo de "Ciclo Encerrado" no protótipo) | `bg-apsen-bg text-apsen-muted before:bg-apsen-muted-2`        |

Por que essa escolha: o trio verde / laranja / muted é o mesmo do `ST_PLANO` (L6636: aprovado `--green`, revisão `--orange`, pendente `--muted`). O amarelo (`badge-yellow`) ficou de fora porque o protótipo usa texto `#F4CF3D` sobre `#FDF4DE`, que é quase ilegível.

Base:

```
inline-flex w-fit items-center gap-[5px] whitespace-nowrap rounded-[20px] px-[9px] py-[3px] text-[11.5px] font-medium
before:size-[5px] before:shrink-0 before:rounded-full before:content-['']
```

O tamanho `lg` é o badge de status do cabeçalho de `#screen-analise-view` (`#av-status-badge`, L5258): `border px-[12px] py-[4px] text-[12px] font-semibold`, sem o ponto, com o fundo e o texto do tom e a borda do tom (`ANALISE_STATUS.bdr`, L5045-5049): ativa `border-apsen-green-b`, pausada `border-apsen-orange-b` (`#FED7AA`, borda laranja do protótipo em L418), encerrada `border-apsen-border` (igual ao "Rascunho"). É usado só no cabeçalho do Detalhe.

```tsx
<span
  data-status="ativa"
  className="{BASE} bg-apsen-green-bg text-apsen-green before:bg-apsen-green"
>
  Ativa
</span>
```

Sem borda e sem hover.

### 3.3 `ChannelPill` (novo) — pill de categoria da tabela de planos (inline, `#screen-planos`)

No protótipo: `font-size:11.5px; font-weight:600; padding:2px 9px; border-radius:10px; background:<cor>18; color:<cor>; border:1px solid <cor>30`, com o texto "● Nome". O sufixo `18` em hex equivale a 9.4% de alfa e o `30`, a 18.8%.

```tsx
const CHANNEL_COLOR: Record<Channel, string> = {
  google: 'text-apsen-ch-google bg-apsen-ch-google/[9.4%] border-apsen-ch-google/[18.8%]',
  meta: 'text-apsen-ch-meta bg-apsen-ch-meta/[9.4%] border-apsen-ch-meta/[18.8%]',
  linkedin: 'text-apsen-ch-linkedin bg-apsen-ch-linkedin/[9.4%] border-apsen-ch-linkedin/[18.8%]',
  email: 'text-apsen-ch-email bg-apsen-ch-email/[9.4%] border-apsen-ch-email/[18.8%]',
  tiktok: 'text-apsen-ch-tiktok bg-apsen-ch-tiktok/[9.4%] border-apsen-ch-tiktok/[18.8%]',
};
base: inline-flex w-fit items-center whitespace-nowrap rounded-[10px] border px-[9px] py-[2px] text-[11.5px] font-semibold
<span className={`${BASE} ${CHANNEL_COLOR[c]}`}>● {CHANNEL_LABELS[c]}</span>
```

As cores vêm da paleta de categorias do dashboard (L4952-4957) **[mapeamento de atribuição]**. As mesmas cores pintam as barras por canal (§3.10).

### 3.4 `ChipGroup` — `.chip` (L215-221) + rótulo `.form-label` (L166-167)

```
grupo:        flex flex-col gap-[5px]
rótulo:       text-[11.5px] font-semibold uppercase tracking-[.04em] text-apsen-muted     (sr-only quando hideLabel)
lista:        flex flex-wrap gap-[5px]                                                      (.chips-wrap sem o mt-[4px], porque o gap do grupo já separa)
chip base:    inline-flex cursor-pointer select-none items-center rounded-[14px] border px-[10px] py-[3px] text-[12px] transition-all duration-[130ms] focus-ring
chip off:     border-apsen-border bg-apsen-bg text-apsen-muted hover:border-apsen-blue hover:text-apsen-blue
chip on:      border-apsen-blue bg-apsen-blue-bg font-semibold text-apsen-blue      (aria-checked=true)
```

A API atual (`label`, `options`, `selected`, `onSelect`, `role="radiogroup"`/`radio`) não muda. Entra a prop nova `hideLabel?: boolean`, que deixa o rótulo só para leitores de tela (usada no cabeçalho do Dashboard).

```html
<div class="flex flex-col gap-[5px]">
  <span aria-hidden class="text-[11.5px] font-semibold uppercase tracking-[.04em] text-apsen-muted"
    >Canal</span
  >
  <div role="radiogroup" aria-label="Canal" class="flex flex-wrap gap-[5px]">
    <button
      role="radio"
      aria-checked="true"
      class="… border-apsen-blue bg-apsen-blue-bg font-semibold text-apsen-blue"
    >
      Todos
    </button>
    <button
      role="radio"
      aria-checked="false"
      class="… border-apsen-border bg-apsen-bg text-apsen-muted …"
    >
      Google Ads
    </button>
  </div>
</div>
```

Fica de fora: o segmented `.tabs-pill` (L391-396) existe só no CSS, sem uso no markup do protótipo. O chip é o padrão realmente renderizado.

### 3.5 `Card` — `.card` (L145-154)

```
surface   (= mb-[16px] rounded-apsen-lg border border-apsen-border bg-apsen-white px-[22px] py-[20px] shadow-apsen-sm)
```

`CardTitle` (opcional, `.card-title`):

```
mb-[16px] flex items-center gap-[8px] border-b border-apsen-border pb-[12px] text-[13.5px] font-semibold text-apsen-slate
small: ml-auto text-[11px] font-normal text-apsen-muted
```

`CardTitle step` (onda 1, L709, L2898): pílula antes do título `rounded-[6px] px-[10px] py-[2px] text-[11px] font-bold` + `stepTone` `blue` (`bg-apsen-blue-bg text-apsen-blue`, padrão) ou `orange` (`bg-apsen-orange-soft text-apsen-orange`).

O `.card` não tem hover. O `mb-[16px]` faz parte do componente e **não é removido** dentro de grids. No protótipo, os grids de cards (`1fr 1fr; gap:16px`) somam o `gap` com o `margin-bottom` do `.card`. Para ficar à risca, o grid de cards usa só `gap-x-[16px]` e o espaçamento vertical vem do `mb-[16px]` (ver §4.1).

### 3.6 `Section` — painéis com rótulo

Duas variantes, porque o protótipo tem dois padrões:

| `variant`        | Origem                                 | Container                                                                                | Título                                                                                                                      |
| ---------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `panel` (padrão) | card do dashboard, inline L2823        | `surface px-[18px] py-[16px]`                                                            | `text-[11px] font-bold uppercase tracking-[.06em] text-apsen-muted`                                                         |
| `detail`         | `.analise-section` (L465-466), literal | `mb-[12px] rounded-[10px] border border-apsen-border bg-apsen-white px-[18px] py-[16px]` | `mb-[10px] border-b-2 border-apsen-orange-soft pb-[8px] text-[11px] font-bold uppercase tracking-[.07em] text-apsen-orange` |

Cabeçalho com ação (variante `panel`): `mb-[12px] flex items-center justify-between`. O título fica sem margem própria e a ação é o link "Ver todos →". Sem ação, o título leva `mb-[12px]`.

```tsx
<section aria-labelledby={id} className="surface px-[18px] py-[16px]">
  <div className="mb-[12px] flex items-center justify-between">
    <h2 id={id} className="text-[11px] font-bold uppercase tracking-[.06em] text-apsen-muted">
      Top campanhas por ROAS
    </h2>
    <Link
      href={CAMPAIGNS_ROUTE}
      aria-label="Ver todas as campanhas"
      className="text-[12px] text-apsen-blue focus-ring"
    >
      Ver todas →
    </Link>
  </div>
  …
</section>
```

O `h2` é mantido (semântica e testes), só com o visual novo.

`tone` (onda 1): `muted` (padrão do `panel`) ou `orange` (padrão do `detail`); a prop explícita troca só a cor do título.

### 3.7 `PageHeader` — `.page-hdr` (L127-133)

```
header:   mb-[18px] flex flex-wrap items-start justify-between gap-[12px]
h1:       text-[18px] font-bold leading-[1.2] text-apsen-slate
sub (p):  mt-[3px] text-[12.5px] text-apsen-muted
ações:    flex flex-wrap items-center gap-[8px]
```

A API não muda (`title`, `description`, `actions`). Prop nova: `meta?: ReactNode`, que substitui a `description` quando o subtítulo tem `<strong>` (Detalhe). No subtítulo, `strong` usa `font-semibold text-apsen-slate` **[mapeamento]**, porque o `page-sub` do protótipo não estiliza `strong` e ele herda o peso bold do navegador. Para ficar literal, usar só `<strong>` sem classe, que sai em bold e na cor muted. **Adotar o literal.**

### 3.8 `ScreenDesc` (novo) — `.screen-desc` (L137-142)

```tsx
<div className="mb-[18px] flex gap-[9px] rounded-apsen border border-apsen-border bg-apsen-bg px-[15px] py-[11px] text-[12.5px] leading-[1.65] text-apsen-slate-3 [&_em]:font-medium [&_em]:not-italic [&_em]:text-apsen-blue [&_strong]:font-semibold [&_strong]:text-apsen-slate">
  <span aria-hidden className="mt-[1px] shrink-0 text-[15px]">
    📣
  </span>
  <div>{children}</div>
</div>
```

Props: `icon: string` (emoji), `children`. Fica logo abaixo do `PageHeader`. Aparece só na Lista: o Dashboard e o Detalhe do protótipo não têm esse bloco.

### 3.9 `KpiCard` — `.dash-card` (L479-483)

```tsx
type KpiTone = 'blue' | 'green' | 'orange' | 'red';
interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: string;
  tone?: KpiTone;
  href?: Route;
  className?: string;
}
```

| Parte               | Classes                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| card                | `flex flex-col gap-[5px] rounded-[10px] border border-apsen-border bg-apsen-white px-[20px] py-[18px]`                     |
| com `href` (navega) | `+ cursor-pointer transition-shadow hover:shadow-apsen-hover focus-ring`. Renderiza um `<Link>` que envolve o `<article>`. |
| ícone               | `mb-[4px] flex size-[36px] items-center justify-center rounded-[9px] text-[18px]` + fundo do tom                           |
| valor               | `text-[26px] font-extrabold leading-[1.1]` + cor do tom                                                                    |
| rótulo              | `text-[12.5px] font-medium text-apsen-muted`                                                                               |
| hint                | `mt-[2px] text-[11.5px]` com `<span className="font-semibold {cor do tom}">`                                               |

| Tom    | Fundo do ícone        | Cor do valor e do hint |
| ------ | --------------------- | ---------------------- |
| blue   | `bg-apsen-kpi-blue`   | `text-apsen-blue`      |
| green  | `bg-apsen-kpi-green`  | `text-apsen-green`     |
| orange | `bg-apsen-kpi-orange` | `text-apsen-orange`    |
| red    | `bg-apsen-kpi-red`    | `text-apsen-red`       |

- O card não tem sombra em repouso e não usa `--radius-lg`: o raio é **10px**.
- O rótulo vem **depois** do valor (ordem do protótipo). O `h3` do rótulo continua `h3`, por acessibilidade, só reposicionado. O `aria-label` do `article` não muda.
- Tendência (setas, delta) e sparkline não existem no protótipo.

```html
<article
  aria-label="Investimento: R$ 120.000,00"
  class="flex flex-col gap-[5px] rounded-[10px] border border-apsen-border bg-apsen-white px-[20px] py-[18px]"
>
  <div
    aria-hidden
    class="mb-[4px] flex size-[36px] items-center justify-center rounded-[9px] bg-apsen-kpi-blue text-[18px]"
  >
    💰
  </div>
  <p class="text-[26px] font-extrabold leading-[1.1] text-apsen-blue">R$ 120.000,00</p>
  <h3 class="text-[12.5px] font-medium text-apsen-muted">Investimento</h3>
  <p class="mt-[2px] text-[11.5px]">
    <span class="font-semibold text-apsen-blue">8 de 15 campanhas ativas</span>
  </p>
</article>
```

### 3.10 `BarRow` (novo) — `.dash-bar-*` (L484-487)

```
linha:  mb-[9px] flex items-center gap-[10px] text-[12.5px]
rótulo: w-[110px] shrink-0 truncate font-medium text-apsen-slate
trilho: h-[7px] flex-1 overflow-hidden rounded-[4px] bg-apsen-bg
fill:   h-full rounded-[4px] {bg-apsen-ch-*}   style={{ width: `${Math.round(v / max * 100)}%` }}
valor:  min-w-[72px] text-right text-[12px] text-apsen-muted
```

No protótipo o valor tem `width:24px`, pensado para inteiros de 1 ou 2 dígitos. Valores em reais não cabem nisso, por isso `min-w-[72px]` **[mapeamento]**. A largura do fill é relativa ao **maior** valor, não ao total.

### 3.11 `ProgressBar` — `.progress-track` / `.progress-fill` (L299-300)

```
trilho:  h-[7px] w-full overflow-hidden rounded-[4px] bg-apsen-border
fill:    h-full rounded-[4px] transition-[width] duration-[400ms]   + bg-apsen-blue (normal) | bg-apsen-red (data-exceeded=true)
```

A API e o ARIA atuais não mudam. A semântica de cor (vermelho acima de 100%) é **[mapeamento]**: o protótipo não tem barra de orçamento.

### 3.12 `StateViews`

O protótipo não tem skeleton, spinner nem `@keyframes`. **Remover o `animate-spin`.**

| Estado                                 | Origem                      | Markup                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LoadingState`                         | `.empty` + `.ac-loading`    | `<div role="status" class="px-[24px] py-[48px] text-center text-apsen-muted"><div aria-hidden class="mb-[10px] text-[36px]">⟳</div><p class="text-[12.5px]">{label}</p></div>`                                                                                                                                                                                                                              |
| `ErrorState`                           | `.access-denied` (L404-407) | `<div role="alert" class="flex h-[60vh] flex-col items-center justify-center gap-[10px] text-center text-apsen-muted"><div aria-hidden class="mb-[8px] text-[44px]">⚠️</div><h3 class="text-[16px] font-semibold text-apsen-slate">Não foi possível carregar os dados</h3><p class="text-[13px]">{message}</p>{onRetry && <Button variant="outline" className="mt-[16px]">Tentar novamente</Button>}</div>` |
| `EmptyState`                           | `.empty` (L356-359)         | `<div class="px-[24px] py-[48px] text-center text-apsen-muted"><div aria-hidden class="mb-[10px] text-[36px]">{icon ?? '📣'}</div><p class="mb-[4px] text-[13.5px] font-medium text-apsen-slate">{title}</p><small class="text-[12px]">{description}</small>{action && <Button variant="outline" size="sm" className="mt-[16px]">{actionLabel}</Button>}</div>`                                             |
| `InlineEmpty` (novo, dentro de painel) | vazio do dashboard          | `<p class="p-[20px] text-center text-[13px] text-apsen-muted">{text}</p>`                                                                                                                                                                                                                                                                                                                                   |

- No `ErrorState`, o texto "Tentar novamente" e o `role="alert"` são mantidos (os testes dependem deles). O `h3` com o título e o `p` com a mensagem saem do layout do protótipo (`access-denied`), que tem `h3` 16px/600.
- No `EmptyState`, a prop nova é `icon?: string`.
- `app/loading.tsx`, `app/error.tsx` e `app/not-found.tsx` usam esses mesmos componentes. O not-found usa ícone 🔍, `h3` "Página não encontrada" e `Button outline` "← Voltar ao Dashboard".

### 3.13 Tabela da lista — `table` + `.table-wrap` (L224-233)

A tabela fica na feature (`CampaignTable` + `CampaignRow`), porque o `th` "Código" é azul e os demais muted, como em `#screen-planos`.

| Parte    | Classes                                                                                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| wrapper  | `overflow-x-auto rounded-apsen-lg border border-apsen-border bg-apsen-white shadow-apsen-sm`                                                                      |
| table    | `w-full min-w-[560px] border-collapse` + `<caption className="sr-only">`                                                                                          |
| thead tr | `border-b border-apsen-border bg-apsen-bg`                                                                                                                        |
| th       | `whitespace-nowrap px-[14px] py-[10px] text-left text-[11.5px] font-semibold tracking-[.02em]` + `text-apsen-blue` (Código) ou `text-apsen-muted` (sem uppercase) |
| tbody tr | `hover:bg-apsen-row-hover [&:last-child>td]:border-b-0` (sem transição)                                                                                           |
| td       | `border-b border-apsen-bg px-[14px] py-[12px] align-middle text-[13px]` (todas alinhadas à esquerda, como no protótipo)                                           |
| vazio    | `<tr><td colSpan={7} className="p-[30px] text-center text-[13px] text-apsen-muted">{emptyText}</td></tr>`                                                         |

Padrões de célula do protótipo:

- Código: `TextLink variant="code"` (`font-mono text-[12px] font-semibold text-apsen-blue`).
- Título com subtítulo: `<div className="text-[13px] font-medium">` + `<div className="text-[11.5px] text-apsen-muted">`.
- Status: `CampaignStatusText`, texto "● {status}" em `text-[12px] font-semibold` verde, laranja ou muted, sem pílula.
- Número: `text-[13px] font-semibold`.
- Ação: `IconLink` com `EyeIcon` dentro de `ActionGroup`.

### 3.14 Filtros, contador e paginação — `.search-*` (L247-252), `.form-select` (L168-170) e paginação inline de planos

- Barra de filtros (inline de planos): `mb-[12px] flex flex-wrap items-center gap-[10px]`, `role="search"`.
- `SearchInput`: wrapper `relative max-w-[360px] flex-1` + largura mínima (padrão `min-w-[260px]`, a lista usa `min-w-[220px]`); lupa de 14px em `left-[9px]` `text-apsen-muted-2`; input `w-full rounded-[6px] border border-apsen-border bg-apsen-white py-[7px] pr-[11px] pl-[30px] text-[13px] text-apsen-slate field-focus`.
- `FormSelect`: `rounded-[6px] border border-apsen-border bg-apsen-white px-[11px] py-[8px] font-[inherit] text-[13.5px] text-apsen-slate transition-[border,box-shadow] duration-[140ms] field-focus` + largura (padrão `w-full`).
- `ResultSummary`: `mb-[12px] flex items-center justify-between`, com o contador em `text-[13px] text-apsen-muted` (`aria-live="polite"`, número em `<strong>`) e, à direita, a ação opcional.
- `Pagination`: `nav` "Paginação" com `mt-[4px] flex items-center justify-between border-t border-apsen-border py-[14px]`; info "Mostrando a–b de n" em `text-[13px] text-apsen-muted`; botões `size-[28px] rounded-full border text-[13px] focus-ring`, normal `border-apsen-border bg-apsen-white text-apsen-slate`, atual `border-apsen-blue bg-apsen-blue font-semibold text-white` com `aria-current="page"`, desabilitado `opacity-[.35]`; reticências `px-[4px] text-apsen-muted`. Os números vêm de `pageRange.ts`.
- `Pagination` (onda 1): `info` opcional; seletor "Itens por página" (`FormSelect` `w-auto`, opções `pageSizeOptions`, padrão `PAGE_SIZES` 10/25/50) só com `onPageSizeChange`, à esquerda dos botões; mudar o tamanho chama só `onPageSizeChange` (a volta à página 1 é do `useUrlState`). `variant="centered"` (alias `layout="centered"`, `.pag` L381-388, L4219-4227): `nav` `flex flex-wrap items-center justify-center gap-[5px] pt-[16px] pb-[2px]`; info "Página X de Y" `mr-[6px] text-[12px] text-apsen-muted`; números `h-[30px] min-w-[30px] rounded-full border-0 bg-transparent text-[13px] text-apsen-muted hover:bg-apsen-blue-bg hover:text-apsen-blue`, atual `bg-apsen-blue font-semibold text-white`; ‹ › `rounded-[6px] px-[8px] text-[14px]`, desabilitados `opacity-[.35]`; reticências sem hover; com 1 página não renderiza (L4217).

Seções §3.15 a §3.21: componentes base do Demand Intelligence (spec [ui-kit-base](../specs/platform/ui-kit-base.md), fase 6). Tons marcados [derivado] não existem no protótipo.

### 3.15 `FormField`, `TextInput`, `TextArea` e `FormGrid` — `.form-*` (L157-175)

| Parte                 | Classes                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| grupo (`.form-group`) | `flex flex-col gap-[5px]`; com `full`, `+ col-span-full`                                                                                                         |
| rótulo                | `text-[11.5px] font-semibold uppercase tracking-[.04em] text-apsen-muted`, ligado ao controle por `htmlFor`                                                      |
| obrigatório (`.req`)  | `<span aria-hidden="true" className="text-apsen-red"> *</span>` e `required` no controle                                                                         |
| controle              | `FIELD_CONTROL` (`fieldClasses.ts`), o mesmo do `FormSelect`                                                                                                     |
| input                 | `FIELD_CONTROL + w-full read-only:bg-apsen-bg read-only:text-apsen-muted aria-[invalid=true]:border-apsen-red-b`                                                 |
| textarea              | input `+ min-h-[72px] resize-y`                                                                                                                                  |
| dica                  | `mt-[2px] text-[11px] text-apsen-muted-2`, no `aria-describedby`                                                                                                 |
| erro [derivado]       | `mt-[2px] text-[11px] text-apsen-red`, no `aria-describedby` e com `aria-invalid="true"`                                                                         |
| grade                 | `mb-[16px] grid gap-[13px]` + `1`: `grid-cols-1`; `2`: `grid-cols-2 max-[560px]:grid-cols-1`; `3`: `grid-cols-3 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1` |

Onda 1: `FormGrid columns={4}` (`.fg-4`) `grid-cols-4 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1`. `FormField` aceita `label: ReactNode` (ex.: `small` "(máx. 1 ano da data início)" `text-[11px] font-normal normal-case text-apsen-muted`, L733), `labelClassName` e `tip` (numa linha `flex items-center` ao lado do `<label>`, fora dele, para não entrar no nome acessível). `TextInput` repassa `min`, `max`, `step`, `inputMode`, `ref` e atributos nativos (`role`, `aria-*`, `onFocus`, `onKeyDown`, `autoComplete`). `FormSelect` aceita `groups` (`optgroup`, depois das opções soltas), `placeholder` (`<option value="">` no topo, emite `''`), `disabled` (`disabled:cursor-default disabled:bg-apsen-bg disabled:text-apsen-muted`), usa `id`/`aria-describedby`/`required`/`aria-invalid` do `FormField` e, fora dele, exige `aria-label`.

### 3.16 `Modal` — `.modal-*` (L255-269)

| Parte           | Classes                                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| overlay         | `fixed inset-0 z-[9000] flex items-center justify-center bg-apsen-overlay`; fecha com `mousedown` no próprio overlay                                                       |
| caixa           | `role="dialog" aria-modal="true"`, `flex max-h-[90vh] max-w-[95vw] flex-col rounded-apsen-lg bg-apsen-white shadow-apsen-modal` + `w-[500px]` (`md`) ou `w-[680px]` (`lg`) |
| cabeçalho       | `flex items-center justify-between border-b border-apsen-border px-[20px] pt-[16px] pb-[13px]`; `h3` `text-[14.5px] font-semibold`                                         |
| fechar          | botão "Fechar" (`✕`) `rounded-[4px] px-[6px] py-[2px] text-[17px] leading-none text-apsen-muted hover:bg-apsen-bg hover:text-apsen-slate`                                  |
| corpo           | `flex flex-col gap-[13px] overflow-y-auto px-[20px] py-[18px]`                                                                                                             |
| rodapé          | `flex justify-end gap-[8px] border-t border-apsen-border px-[20px] py-[12px]`                                                                                              |
| foco [derivado] | `useFocusTrap`: foca o primeiro focável, Tab e Shift+Tab circulam dentro, Esc fecha e o foco volta a quem abriu                                                            |

### 3.17 `Table` genérica — mesmas classes do §3.13

Recebe `columns` (`key`, `header`, `render`, `headerClassName?`, `className?`), `rows` já recortadas, `rowKey`, `emptyText` e `actions?` (coluna "Ações" com `ActionGroup`). Slots: `toolbar` (renderizado pelo `Toolbar`, §3.25, para o `SearchInput`) e `footer` (para a `Pagination`). Vazio: `td` com `colSpan` de todas as colunas. Não pagina nem filtra.

### 3.18 `Tooltip` — `.tip-*` (L426-444)

| Parte            | Classes                                                                                                                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| wrapper          | `relative ml-[4px] inline-flex items-center align-middle`                                                                                                                                                                                 |
| gatilho          | `button` com `aria-label`, `cursor-help text-apsen-muted-2 hover:text-apsen-blue focus-ring` e `InfoIcon` 14px                                                                                                                            |
| balão            | `role="tooltip"`, `w-[290px] rounded-apsen bg-apsen-tip-bg px-[14px] py-[11px] text-[12px] leading-[1.65] text-apsen-tip-fg shadow-apsen-tip`, seta `before:border-b-apsen-tip-bg`; `strong` e `em` com os tokens `tip-strong` e `tip-em` |
| abrir [derivado] | mouse e foco abrem; sair, blur e Esc fecham; o conteúdo é a descrição acessível do botão                                                                                                                                                  |

Conteúdo rico por `ReactNode` (`strong`, `em`, `br`), sem `dangerouslySetInnerHTML`; pode ficar dentro de `th` e na prop `tip` do `FormField`.

### 3.19 `Alert` — `.alert-*` (L291-296)

Base `mb-[14px] flex items-start gap-[9px] rounded-apsen border px-[14px] py-[10px] text-[12.5px] leading-[1.6]` + `AlertCircleIcon` 14px (`aria-hidden`) e título opcional em `<strong>`.

| Tom       | Classes                                                          | Papel    |
| --------- | ---------------------------------------------------------------- | -------- |
| `info`    | `border-apsen-blue-light bg-apsen-blue-bg text-apsen-blue`       | `status` |
| `success` | `border-apsen-green-b bg-apsen-green-bg text-apsen-success-fg`   | `status` |
| `warning` | `border-apsen-yellow-b bg-apsen-yellow-bg text-apsen-warning-fg` | `alert`  |
| `error`   | `border-apsen-red-b bg-apsen-red-bg text-apsen-danger-fg`        | `alert`  |

### 3.20 `Toggle` — `.toggle` (L272-279)

`label` `relative inline-block h-[21px] w-[38px]`; `input type="checkbox" role="switch"` `peer absolute size-0 opacity-0`; trilho `rounded-[20px] bg-apsen-border peer-checked:bg-apsen-green` com bolinha `before:size-[15px] before:bg-white peer-checked:before:translate-x-[17px]`, transição de 180ms. Foco visível e desabilitado (`opacity-[.35]`) são [derivado].

### 3.21 `Tabs` — `#tab-ativas`/`#tab-resolvidas` (L2590-2606)

| Parte    | Classes                                                                                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tablist  | `mb-[16px] flex border-b border-apsen-border`                                                                                                                                |
| aba      | `-mb-px border-b-2 px-[20px] py-[9px] text-[13px] focus-ring`; inativa `border-transparent text-apsen-muted`                                                                 |
| ativa    | `blue`: `border-apsen-blue font-medium text-apsen-blue`; `red`: `border-apsen-red font-medium text-apsen-red`                                                                |
| contador | `ml-[4px] rounded-[10px] px-[7px] py-[1px] text-[10px]`; ativo `bg-apsen-blue`/`bg-apsen-red font-bold text-white`; inativo `bg-apsen-border font-semibold text-apsen-muted` |
| teclado  | WAI-ARIA: tabindex móvel, setas circulares, Home e End (`nextTabIndex`), ativação automática                                                                                 |

Onda 1 (L2590-2606, L6418-6431): `TabItem.tone` vence o `tone` da lista; com `TabItem.countTone` o contador usa sempre esse tom (`red`/`blue`: `bg-apsen-{tom} font-bold text-white`; `gray`: `bg-apsen-border font-semibold text-apsen-muted`): Ativas vermelha com contador vermelho, Resolvidas azul com contador cinza.

Seções §3.22 a §3.45: componentes genéricos do protótipo Demand Intelligence (spec [prototipo-ui-kit](../specs/platform/prototipo-ui-kit.md), onda 1). Os marcados [derivado] cobrem ARQUITETURA §7.

### 3.22 `Breadcrumb` — inline L1644-1649, L2148-2153, L2885-2890

`nav aria-label="Trilha da página"` `mb-[10px] flex flex-wrap items-center gap-[5px] text-[12.5px] text-apsen-muted`. Item com `href` = `TextLink` `table` (padrão) ou `crumb` (`linkVariant`); separador `ChevronRightIcon` `size-[11px]`; item sem `href` = atual, `font-medium text-apsen-slate` com `aria-current="page"`. Com `backHref`: `ButtonLink ghost sm` `mb-[16px]` com `backLabel` (padrão "← Voltar").

### 3.23 `CardSectionLabel` — `.card-section-label` (L151-154)

`h3` `mb-[13px] flex items-center gap-[6px] border-b-2 border-apsen-blue-bg pt-[12px] pb-[8px] text-[10.5px] font-bold uppercase tracking-[.08em] text-apsen-blue`.

### 3.24 `FormActions` — `.form-actions` (L176-177)

`flex flex-wrap justify-end gap-[8px] border-t border-apsen-border pt-[14px]` + `className`.

### 3.25 `Toolbar` — `.toolbar` (L245-246)

`mb-[13px] flex flex-wrap items-center gap-[8px]`; slot `right` em `ml-auto flex gap-[6px]`. É o slot `toolbar` da `Table`.

### 3.26 `FilterBar` — inline L1830-1833

`role="search"` + `aria-label`; `mb-[16px] grid items-end gap-[10px] rounded-apsen-lg border border-apsen-border bg-apsen-white px-[16px] py-[14px]` + `columnsClassName` (padrão `grid-cols-[1fr_auto_auto_auto_auto]`) + `max-[800px]:grid-cols-2 max-[560px]:grid-cols-1` [derivado].

### 3.27 `StatusField` — `.status-field` (L282-288, L1789-1801)

| Parte     | Classes                                                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| caixa     | `flex items-center justify-between gap-[14px] rounded-apsen border border-apsen-border bg-apsen-bg px-[14px] py-[11px]`                                          |
| título    | `strong text-[13px] font-medium text-apsen-slate`                                                                                                                |
| descrição | `mt-[2px] block text-[11.5px] text-apsen-muted`                                                                                                                  |
| controle  | `flex shrink-0 items-center gap-[9px]`; etiqueta `text-[12px] font-medium` `text-apsen-green` (`onLabel`, "Ativo") ou `text-apsen-muted` (`offLabel`, "Inativo") |
| `Toggle`  | `aria-label` = título, `aria-describedby` = descrição; controlado                                                                                                |

### 3.28 `CodeBlock` — `.export-box` (L351-353)

`pre` `max-h-[360px]` (`maxHeightClassName`) `overflow-auto whitespace-pre rounded-apsen bg-apsen-code-bg p-[14px] font-mono text-[11.5px] leading-[1.5] text-apsen-code-fg focus-ring`, `tabIndex={0}` e `aria-label` (rolagem por teclado).

### 3.29 `NumberedList` — `.justif-item` (L470-471, L5268)

`ol role="list"`; item `border-b border-apsen-bg py-[7px] text-[13px] leading-[1.6] last:border-b-0`; número "{n}." `mr-[6px] font-bold text-apsen-orange` com `aria-hidden`.

### 3.30 `ChipMultiSelect` — `.chip` (L215-221, L1474-1492, L2201-2212)

Rótulo igual ao `ChipGroup` (`hideLabel`, `tip` ao lado); lista `role="group"` `mt-[4px] flex flex-wrap gap-[5px]`; chip = classes do `ChipGroup` (`chipClasses.ts`) em `button aria-pressed`. `onChange` recebe a seleção na ordem das opções, sem duplicar. `disabled`: botões desabilitados, `cursor-default` e sem hover (modo visualizar).

### 3.31 `ModeSelector` — botões-cartão L742-770 (`lg`), L2948-2955 (`md`), L3503-3511 (`sm`)

| Parte   | Classes                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| grupo   | `role="radiogroup"` `flex gap-[8px]`                                                                                                                                |
| opção   | `button role="radio"` `flex flex-1 cursor-pointer flex-col items-center gap-[3px] rounded-apsen border-2 font-[inherit] transition-all duration-[150ms] focus-ring` |
| estados | inativa `border-apsen-border bg-apsen-white text-apsen-muted`; ativa `border-apsen-{blue,orange} bg-apsen-{blue,orange} text-white` (`accent`)                      |
| `lg`    | `px-[16px] py-[12px] text-[13px] font-semibold`, ícone `text-[18px]`, descrição `text-[11px] font-normal opacity-[.85]`                                             |
| `md`    | `px-[8px] py-[11px]`, rótulo `text-[12px] font-semibold`, descrição `text-[10px] opacity-[.85]`                                                                     |
| `sm`    | `p-[10px] text-[12.5px] font-semibold`, ícone inline antes do rótulo, sem descrição                                                                                 |
| teclado | tabindex móvel; setas, Home e End movem e selecionam (`nextTabIndex`); `disabled` não emite                                                                         |

### 3.32 `RangeSlider` — `.range-row` (L336-338, L1498-1502, L2516-2520)

Linha `flex items-center` + `blue`: `mt-[3px] gap-[10px]` / `purple`: `mt-[4px] gap-[12px]`; `input type="range"` `min-w-0 flex-1 accent-apsen-{accent}` com `aria-valuetext = format(value)`; valor `text-[15px] font-bold text-apsen-{accent}` + `min-w-[18px]` (`blue`) ou `min-w-[44px]` (`purple`). Emite `Number(value)`.

### 3.33 `SelectableCard` — `.modelo-card` (L474-477, L5196-5202)

`button role="radio"` `relative cursor-pointer rounded-[10px] border-2 border-apsen-border bg-apsen-bg p-[14px] text-left transition-all hover:border-apsen-orange focus-ring`; selecionado `border-apsen-orange bg-apsen-orange-soft`. Check `absolute top-[10px] right-[10px] size-[18px] rounded-full border-2 border-apsen-border bg-apsen-white text-[10px]` → selecionado `border-apsen-orange bg-apsen-orange text-white` "✓". Ícone `mb-[5px] text-[20px]`; título `mb-[3px] text-[13px] font-semibold text-apsen-slate`; descrição `text-[12px] leading-[1.5] text-apsen-muted`; tag `mt-[5px] inline-block rounded-[8px] border border-apsen-orange-b bg-apsen-orange-soft px-[7px] py-[1px] text-[10.5px] font-semibold text-apsen-orange`. Quem usa envolve em `role="radiogroup"`.

### 3.34 `CheckboxCard` — L5152-5156 (`plain`), L5170-5175 (`muted`)

`label` `flex cursor-pointer items-center gap-[10px] border border-apsen-border` (foco visível no cartão via `has-[:focus-visible]`); `plain` `mb-[5px] rounded-[6px] bg-apsen-white px-[12px] py-[9px]`; `muted` `mb-[6px] rounded-apsen bg-apsen-bg px-[12px] py-[10px]`. Checkbox `size-[15px] shrink-0 accent-apsen-orange`, nomeado pelo título e descrito pelo subtítulo; título `text-[13px] font-medium`, subtítulo `text-[11.5px] text-apsen-muted` (+ `mt-[2px]` no `muted`); `aside` à direita.

### 3.35 `Autocomplete` — `.ac-*` (L495-510, L5726-5734, L7065-7149)

| Parte                          | Classes / comportamento                                                                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| input                          | `TextInput` `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`, `autoComplete="off"`                                                                                      |
| lista                          | `absolute top-full right-0 left-0 z-50 mt-[2px] max-h-[220px] overflow-y-auto rounded-apsen border border-apsen-border bg-apsen-white shadow-apsen-dropdown`, `ul role="listbox"`                                               |
| item                           | `role="option"` `flex cursor-pointer items-center gap-[8px] border-b border-apsen-bg px-[12px] py-[9px] text-[13px] transition-[background] duration-100 last:border-b-0 hover:bg-apsen-blue-bg aria-selected:bg-apsen-blue-bg` |
| etiqueta                       | `ml-auto shrink-0 rounded-[8px] bg-apsen-bg px-[7px] py-[1px] text-[10px] font-semibold text-apsen-muted` (`itemTag` ou `item.tag`)                                                                                             |
| carregando / vazio / bloqueado | `p-[12px] text-center text-[12.5px] text-apsen-muted` em `role="status"`: "⟳ {loadingText}" (padrão "Consultando..."), "Nenhum resultado. Você pode digitar um valor novo.", `disabledMessage`                                  |
| fonte                          | `flex items-center gap-[5px] border-t border-apsen-border bg-apsen-bg px-[12px] py-[6px] text-[10.5px] text-apsen-muted` + `PulseIcon` 10px: "{n} resultado(s) · Fonte: {sourceLabel}" ou, no vazio, "Fonte: {sourceLabel}"     |

Abre no foco, ao digitar e com seta; com `disabledMessage` mostra só a mensagem e não busca. `search(term)` roda após `debounceMs` (padrão 300, ARQUITETURA §7.1; o protótipo usa 250), termo vazio também busca e respostas antigas são descartadas (`useAutocomplete`). Setas movem o destaque, Enter escolhe, Esc e clique fora fecham; o texto digitado é o valor (`allowFreeText`, padrão `true`; com `false`, sair sem escolher limpa).

### 3.36 `ColorPill` — pills por família/franquia/provedor

`outlined` (L6698-6699): `inline-flex w-fit items-center whitespace-nowrap rounded-[10px] border px-[9px] py-[2px] text-[11.5px] font-semibold` + `text-apsen-pal-{c} bg-apsen-pal-{c}/[9.4%] border-apsen-pal-{c}/[18.8%]` (os sufixos hex `18`/`30` do protótipo). `soft` (L7625): `rounded-[6px] px-[9px] py-[2px] text-[11px] font-bold` + `text-apsen-pal-{c} bg-apsen-pal-{c}/[8.2%]`. Cores `blue`, `purple`, `cyan`, `amber`, `emerald`, `red`, `lime`, `slate` (fallback).

### 3.37 `CategoryTag` — `.db-*` (L345-346, L410-423)

`inline-block rounded-[4px] border px-[8px] py-[2px] text-[10.5px] font-bold` + tom:

| Tom                                             | Classes                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `tv`, `digital`, `pdv`, `conc`, `sazo`, `viral` | `bg-apsen-cat-{tom}-bg border-apsen-cat-{tom}-b text-apsen-cat-{tom}-fg` |
| `campo`                                         | `bg-apsen-blue-bg border-apsen-blue-light text-apsen-blue`               |
| `medico`, `canal`, `macro`                      | `bg-apsen-purple-bg border-apsen-purple-b text-apsen-purple`             |
| `preco`                                         | `bg-apsen-red-bg border-apsen-red-b text-apsen-red`                      |
| `supply`                                        | `bg-apsen-orange-bg border-apsen-orange-b text-apsen-orange`             |
| `reg`                                           | `bg-apsen-teal-bg border-apsen-teal-light text-apsen-teal`               |
| `outro`                                         | `bg-apsen-bg border-apsen-border text-apsen-muted`                       |

### 3.38 `PendingItemRow` — `.dash-pend-item` (L4987-4992)

`flex items-center gap-[10px] border-b border-apsen-bg py-[8px] text-[13px] last:border-b-0`; código `min-w-[95px] font-mono text-[11px] font-semibold text-apsen-blue`; corpo `min-w-0 flex-1` com título `text-[12.5px] font-medium` e subtítulo `text-[11.5px] text-apsen-muted`; ação `ButtonLink ghost xs` (`px-[8px] py-[2px] text-[11px]`) com `actionLabel`/`actionHref`.

### 3.39 `StatusDistributionRow` — linhas de status do plano (L5005-5011)

`mb-[10px] flex items-center gap-[10px]`; bolinha `size-[9px] shrink-0 rounded-full`; rótulo `min-w-0 flex-1 text-[13px]`; contagem `text-[13px] font-semibold`; trilho `role="meter"` `h-[5px] w-[70px] overflow-hidden rounded-[3px] bg-apsen-bg` com fill `h-full` em `pct%` (limitado a 0–100); percentual `min-w-[28px] text-right text-[11px] text-apsen-muted`. Tom `green`/`orange`/`red`/`muted` pinta bolinha, contagem e fill.

### 3.40 Skeletons [derivado] — ARQUITETURA §7.2

| Componente      | Classes / comportamento                                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Skeleton`      | `max-w-full rounded-[6px] bg-apsen-border motion-safe:animate-pulse` + tamanho; `aria-hidden`                                                                                                             |
| `SkeletonText`  | `lines` (padrão 3) barras `h-[12px]` com `gap-[8px]`, a última `w-3/5`                                                                                                                                    |
| `TableSkeleton` | wrapper da `Table` (`overflow-x-auto rounded-apsen-lg border … shadow-apsen-sm`), cabeçalho `h-[38px] bg-apsen-bg` (barras ou `headers` reais), `rows` (padrão 10) linhas `h-[45px]` com `columns` barras |
| `CardSkeleton`  | `surface` + barra de título `h-[14px] w-[180px]` + `SkeletonText`                                                                                                                                         |
| `PageSkeleton`  | título `h-[22px] w-[260px]`, sub `h-[14px] w-[360px]`, bloco `ScreenDesc` `h-[58px]` e um card; usado em `src/app/loading.tsx`                                                                            |

Cada skeleton (exceto os blocos) é um único `div role="status" aria-label="{label}" aria-busy="true"` com o rótulo em `sr-only` (padrão "Carregando…"); sem animação com `prefers-reduced-motion`.

### 3.41 `ConfirmDialog` [derivado] — ARQUITETURA §7.3

`Modal size="md"` nomeado pelo título; `message` (ou `description`) em `p text-[13px] text-apsen-slate-3`; rodapé `Button ghost sm` `cancelLabel` (padrão "Cancelar", foco inicial) + `Button sm` da ação (`tone` `danger` → `red`, padrão; `primary` → `primary`) com `loading` durante `pending` ("Salvando…"). Esc, overlay e ✕ só cancelam quando não está enviando. O `Modal` ganhou `initialFocusRef` para isso.

### 3.42 `useUnsavedChangesGuard(dirty, options?)` [derivado] — ARQUITETURA §7.4

Com `dirty`: `beforeunload` com `preventDefault`; listener de `click` em captura no documento intercepta `a[href]` internos (sem `target`, sem `download`, botão esquerdo, sem Ctrl/Meta/Shift/Alt, `href` diferente do atual) e abre o `ConfirmDialog` "Sair sem salvar?" / "Há alterações não salvas. Deseja sair mesmo assim?" / "Sair" (`title`, `message`, `confirmLabel`, `cancelLabel` sobrescrevem); confirmar → `router.push(href)`. Devolve `{ dialog, confirmLeave(href), confirmNavigation(href) }` (o mesmo método, para "Cancelar"/"← Voltar"; limpo, navega direto). Listeners removidos no cleanup.

### 3.43 `focusFirstInvalid(container)` [derivado] — ARQUITETURA §7.4

Foca o primeiro `[aria-invalid="true"]` do contêiner em ordem de DOM e devolve `true`; sem inválidos (ou contêiner `null`), `false`.

### 3.44 `DetailField` — modais de detalhe (L4421-4441)

`div` (`col-span-full` com `full`) com rótulo `mb-[3px] text-[10.5px] font-bold uppercase tracking-[.05em] text-apsen-muted` e valor `text-[13px]`.

### 3.45 `CodeTag` — feature/slug/modelo em mono

`code` `rounded-[4px] bg-apsen-bg px-[7px] py-[2px] font-mono text-[11px]` + `tone` `slate` (padrão), `muted`, `blue`, `red`, `purple`, `orange`, `green`, `teal` (`text-apsen-{tom}`) ou `yellow` (`text-apsen-warning-fg`, legível sobre o fundo claro).

---

## 4. Telas

Responsivo dos grids **[derivado]**, com os breakpoints do protótipo: KPIs em `grid-cols-4`, `max-[800px]:grid-cols-2` e `max-[560px]:grid-cols-1`; pares de cards em `grid-cols-2` e `max-[800px]:grid-cols-1`. No protótipo esses grids são inline e não têm media query.

### 4.1 Dashboard (`/`) ← `#screen-dashboard` (L2808-2849)

```
┌ PageHeader ─────────────────────────────────────────────────────────────────────┐
│ Dashboard                                  [Todo|30 dias|90 dias|Ano] [Atualizar] │
│ Visão geral do desempenho das campanhas.                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
┌💰 Investimento┐┌📈 Receita ┐┌🎯 ROAS ┐┌🧾 CPA   ┐   grid-cols-4 gap-[14px] mb-[20px]
└───────────────┘└───────────┘└────────┘└─────────┘
┌👁️ Impressões ┐┌👆 Cliques ┐┌💲 CPC  ┐┌✅ Conv. ┐
└───────────────┘└───────────┘└────────┘└─────────┘
┌ INVESTIMENTO POR CANAL ────────┐┌ TOP CAMPANHAS POR ROAS   Ver todas → ┐  grid-cols-2 gap-x-[16px]
│ Google Ads ███████░░  R$ …     ││ CMP-01  Nome da campanha      4,2x   │
│ Meta Ads   ████░░░░░  R$ …     ││         Meta Ads                     │
└────────────────────────────────┘└──────────────────────────────────────┘
```

- **Header:** `PageHeader` com `title="Dashboard"` e a `description` atual. As `actions` são `ChipGroup` de período (`hideLabel`) e o `Button ghost sm` "Atualizar"/"Atualizando…". O protótipo tem só o timestamp à direita. O filtro de período não existe no dashboard dele e é colocado aqui com o chip do protótipo **[mapeamento]**. O `ChipGroup` solto que hoje fica abaixo do header sai.
- **KPIs** (`DashboardKpiGrid`): os 8 KPIs atuais continuam (o domínio não muda), em `grid grid-cols-4 gap-[14px] mb-[20px]`. São estáticos (sem `href`), porque não há destino específico por KPI. Tons e ícones **[mapeamento]**: Investimento blue 💰 · Receita green 📈 · ROAS orange 🎯 · CPA blue 🧾 · Impressões blue 👁️ · Cliques orange 👆 · CPC blue 💲 · Conversões green ✅. O vermelho fica reservado para alerta. Os `hint`s atuais continuam, com a cor do tom.
- **Breakdown por canal** (`ChannelBreakdownList`): `Section panel` "Investimento por canal" com um `BarRow` por canal (rótulo `CHANNEL_LABELS`, fill `bg-apsen-ch-{channel}`, valor `formatCurrency`).
- **Top campanhas** (`TopCampaignsList`): `Section panel` "Top campanhas por ROAS" com a ação "Ver todas →" (`aria-label="Ver todas as campanhas"`, para manter o nome acessível do link de hoje). Cada linha segue o `.dash-pend-item` (L488-489) e é um `<Link>` para o detalhe:
  ```
  li:      flex items-center gap-[10px] border-b border-apsen-bg py-[8px] text-[13px] last:border-b-0
  código:  min-w-[95px] font-mono text-[11px] font-semibold text-apsen-blue
  bloco:   flex-1 → nome text-[12.5px] font-medium · canal text-[11.5px] text-apsen-muted
  ROAS:    text-[13px] font-semibold text-apsen-green
  ```
  Vazio: `InlineEmpty` "Nenhuma campanha com ROAS no período".
- **Wrapper dos dois painéis:** `grid grid-cols-2 gap-x-[16px] max-[800px]:grid-cols-1`. O espaçamento vertical vem do `mb-[16px]` do `surface`.
- O link grande "Ver todas as campanhas" no rodapé da tela sai. Ele vira o "Ver todas →" do painel (padrão do protótipo).
- Estados: `LoadingState` "Carregando indicadores…", `ErrorState` e `EmptyState` (📣 "Sem campanhas no período"). Todos ficam abaixo do header.

### 4.2 Lista de campanhas (`/campaigns`) ← `#screen-planos` (L2613-2692)

```
┌ PageHeader ────────────────────────────────────────────────────────────────────┐
│ Campanhas                                                                       │
│ {descrição atual}                                                               │
└────────────────────────────────────────────────────────────────────────────────┘
┌ ScreenDesc ────────────────────────────────────────────────────────────────────┐
│ 📣 Acompanhe o desempenho das campanhas. Busque pelo nome, filtre por canal,    │
│    status ou período e abra uma campanha para ver o <em>detalhe de métricas e   │
│    orçamento</em>.                                                               │
└────────────────────────────────────────────────────────────────────────────────┘
[🔍 Buscar campanha pelo nome...] [Todos os canais ▾] [Todos os status ▾] [Todo o período ▾]
15 campanhas · Últimos 30 dias                                   [Limpar filtros]
┌ CampaignTable ─────────────────────────────────────────────────────────────────┐
│ Código │ Campanha / Período │ Canal │ Status │ Investimento │ ROAS │ Ações       │
│ CMP-01 │ Nome               │●Meta  │●Ativa  │ R$ 12.000    │ 4,2x │ 👁          │
│        │ 01/06 → 30/06/2026 │       │        │              │      │             │
└────────────────────────────────────────────────────────────────────────────────┘
Mostrando 1–8 de 15                                                   (‹)(1)(2)(›)
```

- Em vez de cards, a lista é **tabela** (`CampaignTable`, §3.13). O `CampaignCard` não é usado.
- Colunas **[mapeamento]**, só com campos que já existem no `CampaignListItemOutput`:
  - **Código** (`id`, `TextLink` `code` para o detalhe; `th` azul).
  - **Campanha** (nome 13px/500 + período 11.5px muted no formato "01/06 → 30/06/2026").
  - **Canal** (`ChannelPill`) e **Status** (texto colorido "● Ativa", 12px/600, sem pílula).
  - **Investimento** e **ROAS**: `font-semibold`, alinhados à esquerda como no protótipo.
  - **Ações**: `IconLink` olho, `aria-label="Abrir campanha {nome}"`.
- Filtros (§3.14): `SearchInput` "Buscar campanha" (`min-w-[220px]`) e os `FormSelect` "Canal" (`w-[180px]`, "Todos os canais"), "Status" (`w-[170px]`, "Todos os status", "● Ativa"…) e "Período" (`w-[170px]`). Sem `.form-label` visível, como em planos; o nome acessível vem do `aria-label`.
- Busca: no cliente, por nome, sem caixa nem acento (`filterCampaignsByName`), sem nova consulta.
- Contador: `<strong>{n}</strong> campanha(s) · {PERIOD_LABELS[period]}`. "Limpar filtros" (`Button ghost sm`, emprestado da aprovação) aparece só com filtro ou busca ativa **[mapeamento]**.
- Vazio: linha `colSpan` "Nenhuma campanha encontrada com os filtros atuais." com filtros, ou "Nenhuma campanha cadastrada." sem filtros; contador e paginação continuam visíveis.
- Paginação: 8 por página, "Mostrando a–b de n" (com zero itens, "Mostrando 0–0 de 0"), e mudar busca ou filtro volta para a página 1.

### 4.3 Detalhe da campanha (`/campaigns/[id]`) ← `#screen-analise-view` (L2988-3067) + o botão Voltar de `#screen-plano-item`

```
Campanhas › Black Friday Meta 2026                               crumb interno
[← Voltar]                                                       Button ghost sm, mb-[16px]
Black Friday Meta 2026                                 [● Ativa]  título + StatusBadge lg
Canal: **Meta Ads** · Período: **01/11/2026 – 30/11/2026** · 30 dias · CMP-014
┌ 💰 ORÇAMENTO ─────────────────────────────────────────────────────────────────┐ Section detail
│ R$ 9.400 de R$ 12.000                                                  78%   │
│ ████████████████████████████░░░░░░░░░  ProgressBar                           │
└──────────────────────────────────────────────────────────────────────────────┘
┌🎯 ROAS┐┌📈 Receita┐┌🧾 CPA┐┌👆 CTR┐                              KpiCard ×4 estáticos
┌ 📊 MÉTRICAS DA CAMPANHA ──────────────────────────────────────────────────────┐ Section detail
│ IMPRESSÕES   CLIQUES   CONVERSÕES   TAXA DE CONVERSÃO                        │
│ 1.240.000    26.040    812          3,1%                                      │
│ CPC                                                                          │
│ R$ 0,36                                                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Crumb interno** (inline L1612): `<nav aria-label="Trilha da campanha" className="mb-[10px] flex items-center gap-[5px] text-[12.5px] text-apsen-muted">`, com o `<Link className="cursor-pointer text-apsen-blue">Campanhas</Link>`, o chevron em `size-[11px]` e `<span className="font-medium text-apsen-slate">{nome}</span>`.
- **Voltar** (`BackToCampaignsLink`): `<Link>` com `buttonClasses('ghost','sm')` + `mb-[16px] w-fit`, texto "← Voltar".
- **Cabeçalho** (`CampaignHeader`): `mb-[16px] flex flex-wrap items-center justify-between gap-[10px]`. À esquerda, o `h1` `.page-title` e o `.page-sub` com a meta. A meta segue o formato do `#av-meta` (L5256, "Ciclo: **…** · Modelo: **…** · N SKU(s) · data"): `Canal: <strong>…</strong> · Período: <strong>…</strong> · N dias · código`, com `formatPeriod` e `<strong>` literal. À direita, o grupo `flex items-center gap-[8px]` com `StatusBadge size="lg"` (§3.2). Os botões "Salvar" e "Exportar PDF" não são portados, porque o domínio não tem essas ações.
- **Orçamento** (`BudgetUsage`): `Section detail` "💰 Orçamento".
  - Linha de valores: `mb-[8px] flex justify-between text-[13px]`, com o percentual em `font-bold`.
  - `ProgressBar` logo abaixo.
  - Texto auxiliar em `mt-[6px] text-[12px] text-apsen-muted`, ou `text-apsen-red` quando passa de 100%.
- **Métricas** (`MetricsGrid`) **[mapeamento]**:
  - 4 `KpiCard` estáticos em `grid grid-cols-4 gap-[14px] mb-[20px]`: ROAS orange 🎯, Receita green 📈, CPA blue 🧾, CTR blue 👆.
  - Depois, `Section detail` "📊 Métricas da campanha" com um grid de rótulo e valor (padrão `.aprov-grid`, L449-455), `grid grid-cols-4 gap-[16px] max-[800px]:grid-cols-2`. Usa colunas iguais no lugar de `2fr 1fr 1fr 1fr`, porque nenhum campo tem texto longo.
  - Rótulo: `mb-[3px] text-[10.5px] font-bold uppercase tracking-[.06em] text-apsen-muted`. Valor: `text-[13px] font-medium leading-[1.5] text-apsen-slate`.
  - Itens: Impressões, Cliques, Conversões, Taxa de conversão e CPC. Em markup, `<dl>`/`<dt>`/`<dd>`.
- **Não encontrada:** layout do `ErrorState` com o ícone 🔍, `h3` "Campanha não encontrada" e `Button outline` "← Voltar para Campanhas".
- A coluna sticky de 360px não é portada (§0.1).

---

## 5. Checklist de fidelidade

Abrir o protótipo e o app lado a lado em 1440x900, no tema claro. Cada item deve bater visualmente ou no DevTools (Computed).

**Base e tokens**

- [ ] O `body` computa `font-family: Inter…`, `font-size:14px`, `line-height:normal`, `color:#141414`, `background:#FAFAFA`, `overflow:hidden`.
- [ ] O `globals.css` não tem nenhum `brand-*`, e o `src/presentation` não tem `slate-`, `emerald-`, `amber-` nem hex solto (busca por grep).
- [ ] Transições: `transition-timing-function: ease` e `140ms` nos itens de navegação e nos botões.
- [ ] Ícones SVG computam `display:inline-block`.

**Shell**

- [ ] A sidebar tem 252px de largura, fundo branco e `border-right 1px #E1E1E1`, e vai do topo da janela até o fim (sem role bar).
- [ ] O bloco do logo tem 64px de altura e fica alinhado com a borda inferior da topbar. O logo tem 34px de altura. O divisor vertical está antes de "Marketing" (12px/700) e "Insights" (10.5px, `#6F6F6F`).
- [ ] O Dashboard ativo é uma pílula azul `#0A13B6` com texto branco 13px/600, radius 8px e margem de 8px nas laterais, e não muda no hover.
- [ ] O cabeçalho "CAMPANHAS" usa 10px/700, uppercase, letter-spacing `.12em`, cor `#8A8A8A`, com a seta ▼ de 9px que gira 180° em .18s ao abrir. Não tem hover.
- [ ] O item ativo tem borda esquerda de 3px `#0A13B6`, fundo `#EEF1FC`, texto `#0A13B6` em 500 e recuo do texto de 44px. Item inativo no hover: fundo `#F8FAFC` e texto `#141414`.
- [ ] O footer da sidebar tem 10px, cor `#8A8A8A`, line-height 1.8 e `border-top`, preso ao fim da sidebar.
- [ ] A topbar tem 64px, fundo branco, `border-bottom #E1E1E1`, padding lateral de 22px e gap de 14px.
- [ ] O burger ☰ tem 17px; no hover ganha fundo `#FAFAFA` e radius 4px.
- [ ] Breadcrumb: "Marketing Insights" em 12.5px muted, chevron de 12px com opacidade .4 e página atual em `#141414`/500.
- [ ] O avatar é um círculo roxo (`#7C3AED`) de 30px com inicial branca 11.5px/700. O nome ao lado tem 13px/600.
- [ ] O `main` tem padding de 22px/24px, só ele rola e não tem `max-width`.
- [ ] O burger recolhe a sidebar em .2s, a topbar desliza até `left:0` e o conteúdo ocupa a largura toda.
- [ ] Abaixo de 800px a sidebar começa fechada e abre por cima do conteúdo, com overlay escuro [derivado].

**Componentes**

- [ ] O `PageHeader` tem título 18px/700/1.2, subtítulo 12.5px muted a 3px do título e margem inferior de 18px.
- [ ] O card tem radius 16px, padding 20px/22px, sombra `0 2px 4px rgba(20,20,20,.08)` e borda `#E1E1E1`. O painel do dashboard tem padding 16px/18px e rótulo 11px/700 uppercase `.06em`.
- [ ] O KPI card tem radius 10px, padding 18px/20px, sem sombra em repouso e `0 4px 16px rgba(0,0,0,.1)` no hover (só se navegar). O ícone tem 36px com radius 9px. O valor tem 26px/800 (renderizado como 700) e line-height 1.1. O rótulo tem 12.5px/500 e fica abaixo do valor.
- [ ] Botões: pílula de 24px, 13px/600, padding 9px/20px. No `sm`, 12px com padding 5px/12px. O ghost tem borda `#E1E1E1` e texto `#6F6F6F`, e no hover fundo `#FAFAFA` e texto `#141414`.
- [ ] Chip: radius 14px, padding 3px/10px, 12px, fundo `#FAFAFA`. Selecionado: fundo `#EEF1FC`, borda e texto `#0A13B6`, peso 600. No hover, borda azul.
- [ ] `StatusBadge`: pílula com ponto de 5px, 11.5px/500, padding 3px/9px. Ativa verde (`#E7F1EA`/`#18A957`), Pausada laranja (`#FFF1EA`/`#DD7443`), Encerrada cinza (`#FAFAFA`/`#6F6F6F`, ponto `#8A8A8A`).
- [ ] A barra de canal tem trilho de 7px `#FAFAFA` e radius 4px. O rótulo tem 110px. A maior barra ocupa 100%.
- [ ] A barra de orçamento tem trilho de 7px `#E1E1E1`, fill azul e fica vermelha acima de 100%.
- [ ] Os estados de carregamento, erro e vazio não têm spinner nem animação. O vazio tem ícone de 36px, título 13.5px/500 e padding 48px/24px. O erro usa o layout centralizado de 60vh com `h3` 16px/600.

**Telas**

- [ ] Dashboard: KPIs em 4 colunas com gap de 14px e 20px até os painéis. Os painéis ficam lado a lado com gap de 16px. "Ver todas →" aparece em 12px azul no cabeçalho do painel de top campanhas.
- [ ] Lista: a ordem é header → screen-desc → busca e selects → contador e "Limpar filtros" → tabela → paginação.
- [ ] Selects com radius 6px, padding 8px/11px e 13.5px (Canal 180px, Status e Período 170px). Busca com lupa a 9px, padding 7px/11px/7px/30px e 13px.
- [ ] Tabela: wrapper com radius 16px e sombra-sm. `thead` com fundo `#FAFAFA`. `th` com 11.5px/600, `.02em` e sem uppercase; "Código" azul e os demais `#6F6F6F`. `td` com 13px e padding 12px/14px. Hover da linha em `#FAFBFC`. Código em mono 12px azul. Status em texto colorido 12px/600, sem pílula.
- [ ] Paginação: borda superior, padding 14px, botões redondos de 28px, atual azul com texto branco e pontas desabilitadas com opacity .35.
- [ ] `ScreenDesc`: fundo `#FAFAFA`, borda, radius 8px, padding 11px/15px, 12.5px, `#404040`, line-height 1.65, `em` azul sem itálico.
- [ ] Detalhe: a ordem é crumb interno (12.5px, "Campanhas" em azul) → "← Voltar" ghost sm → título com badge à direita → seção de orçamento → KPIs → seção de métricas.
- [ ] As seções do Detalhe têm radius 10px, padding 16px/18px e título 11px/700 uppercase `.07em` laranja (`#DD7443`) com `border-bottom 2px #FFF7ED`.
- [ ] O badge de status do Detalhe tem 12px/600, padding 4px/12px, borda de 1px no tom e não tem ponto.

**Dark [derivado]**

- [ ] Com `html.dark`, todas as superfícies, textos e bordas trocam só via tokens, as cores de canal continuam iguais e nenhum texto fica abaixo do contraste AA sobre `apsen-white`/`apsen-bg`.
