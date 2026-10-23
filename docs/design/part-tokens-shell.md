# Design Apsen — Parte 1: Tokens + Shell (sidebar, topbar, main)

Fonte da verdade: `C:/Users/erik.santos/Downloads/di-drivers-v2_84.html` (CSS em `<style>` linhas 7-511, markup do shell 513-687, JS de navegação 3700-3870, init em 7951 `setRole('admin')`).
Os números de linha citados abaixo como `L##` são do arquivo do protótipo.

Regra: valores copiados literalmente do CSS. Quando algo não está no protótipo, está escrito **"não existe no protótipo"**. Quando é consequência derivada (ex.: remover a role-bar), está marcado como **[derivado]**.

---

## 1. Tokens

### 1.1 `:root` original (L17-32, literal)

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
:root {
  --blue: #0a13b6;
  --blue-d: #070d81;
  --blue-bg: #eef1fc;
  --blue-light: #ccdaf2;
  --teal: #0077be;
  --teal-bg: #e6f2fa;
  --teal-light: #99cde8;
  --slate: #141414;
  --slate-2: #1d1d1d;
  --slate-3: #404040;
  --muted: #6f6f6f;
  --muted-2: #8a8a8a;
  --border: #e1e1e1;
  --bg: #fafafa;
  --white: #ffffff;
  --green: #18a957;
  --green-bg: #e7f1ea;
  --green-b: #81c17e;
  --yellow: #f4cf3d;
  --yellow-bg: #fdf4de;
  --yellow-b: #f4cf3d;
  --red: #d63434;
  --red-bg: #fae9e9;
  --red-b: #d63434;
  --orange: #dd7443;
  --orange-bg: #fff1ea;
  --purple: #7c3aed;
  --purple-bg: #f5f3ff;
  --purple-b: #c4b5fd;
  --sidebar-w: 252px;
  --topbar-h: 64px;
  --rolebar-h: 34px;
  --radius: 8px;
  --radius-lg: 16px;
  --radius-pill: 24px;
  --shadow-sm: 0 2px 4px 0 rgba(20, 20, 20, 0.08);
  --shadow: 0 4px 4px 0 rgba(20, 20, 20, 0.08);
  --shadow-md: 0 6px 10px 0 rgba(20, 20, 20, 0.08);
}
```

### 1.2 Tabela de tokens -> nome Tailwind 4 proposto

| Token protótipo | Valor                             | Token `@theme` proposto    | Utilitário exemplo                        |
| --------------- | --------------------------------- | -------------------------- | ----------------------------------------- |
| `--blue`        | `#0A13B6`                         | `--color-apsen-blue`       | `bg-apsen-blue`, `text-apsen-blue`        |
| `--blue-d`      | `#070D81`                         | `--color-apsen-blue-d`     | `hover:bg-apsen-blue-d`                   |
| `--blue-bg`     | `#EEF1FC`                         | `--color-apsen-blue-bg`    | `bg-apsen-blue-bg`                        |
| `--blue-light`  | `#CCDAF2`                         | `--color-apsen-blue-light` |                                           |
| `--teal`        | `#0077BE`                         | `--color-apsen-teal`       |                                           |
| `--teal-bg`     | `#E6F2FA`                         | `--color-apsen-teal-bg`    |                                           |
| `--teal-light`  | `#99CDE8`                         | `--color-apsen-teal-light` |                                           |
| `--slate`       | `#141414`                         | `--color-apsen-slate`      | `text-apsen-slate`                        |
| `--slate-2`     | `#1D1D1D`                         | `--color-apsen-slate-2`    |                                           |
| `--slate-3`     | `#404040`                         | `--color-apsen-slate-3`    |                                           |
| `--muted`       | `#6F6F6F`                         | `--color-apsen-muted`      | `text-apsen-muted`                        |
| `--muted-2`     | `#8A8A8A`                         | `--color-apsen-muted-2`    |                                           |
| `--border`      | `#E1E1E1`                         | `--color-apsen-border`     | `border-apsen-border`                     |
| `--bg`          | `#FAFAFA`                         | `--color-apsen-bg`         | `bg-apsen-bg`                             |
| `--white`       | `#FFFFFF`                         | `--color-apsen-white`      | `bg-apsen-white` (ou `bg-white`)          |
| `--green`       | `#18A957`                         | `--color-apsen-green`      |                                           |
| `--green-bg`    | `#E7F1EA`                         | `--color-apsen-green-bg`   |                                           |
| `--green-b`     | `#81C17E`                         | `--color-apsen-green-b`    |                                           |
| `--yellow`      | `#F4CF3D`                         | `--color-apsen-yellow`     |                                           |
| `--yellow-bg`   | `#FDF4DE`                         | `--color-apsen-yellow-bg`  |                                           |
| `--yellow-b`    | `#F4CF3D`                         | `--color-apsen-yellow-b`   |                                           |
| `--red`         | `#D63434`                         | `--color-apsen-red`        |                                           |
| `--red-bg`      | `#FAE9E9`                         | `--color-apsen-red-bg`     |                                           |
| `--red-b`       | `#D63434`                         | `--color-apsen-red-b`      |                                           |
| `--orange`      | `#DD7443`                         | `--color-apsen-orange`     |                                           |
| `--orange-bg`   | `#FFF1EA`                         | `--color-apsen-orange-bg`  |                                           |
| `--purple`      | `#7C3AED`                         | `--color-apsen-purple`     |                                           |
| `--purple-bg`   | `#F5F3FF`                         | `--color-apsen-purple-bg`  |                                           |
| `--purple-b`    | `#C4B5FD`                         | `--color-apsen-purple-b`   |                                           |
| `--sidebar-w`   | `252px`                           | `--spacing-sidebar`        | `w-sidebar`, `ml-sidebar`, `left-sidebar` |
| `--topbar-h`    | `64px`                            | `--spacing-topbar`         | `h-topbar`, `mt-topbar`                   |
| `--rolebar-h`   | `34px`                            | não aplicar (ver 2.5)      |                                           |
| `--radius`      | `8px`                             | `--radius-apsen`           | `rounded-apsen`                           |
| `--radius-lg`   | `16px`                            | `--radius-apsen-lg`        | `rounded-apsen-lg`                        |
| `--radius-pill` | `24px`                            | `--radius-apsen-pill`      | `rounded-apsen-pill`                      |
| `--shadow-sm`   | `0 2px 4px 0 rgba(20,20,20,.08)`  | `--shadow-apsen-sm`        | `shadow-apsen-sm`                         |
| `--shadow`      | `0 4px 4px 0 rgba(20,20,20,.08)`  | `--shadow-apsen`           | `shadow-apsen`                            |
| `--shadow-md`   | `0 6px 10px 0 rgba(20,20,20,.08)` | `--shadow-apsen-md`        | `shadow-apsen-md`                         |

Observação: usei o prefixo `apsen-` nos raios/sombras para não colidir com os defaults do Tailwind 4 (`--radius-lg` do Tailwind é `0.5rem`; `--shadow-sm`/`--shadow-md` também existem). Cores com prefixo `apsen-` para não colidir com `slate`/`blue`/`red` da paleta padrão do Tailwind.

Cores literais usadas no shell que NÃO são tokens no protótipo:

- `#F8FAFC` — fundo do `.nav-item:hover` (L87).
- `#0891B2` — fundo inline do badge "em breve" (L663).
- `#7C3AED` — fundo inline do badge de "Agentes Cadastrados" (L616); é igual a `--purple`.

Sugestão de nome (opcional): `--color-apsen-hover: #F8FAFC`, `--color-apsen-cyan: #0891B2`. Ou usar valor arbitrário `bg-[#F8FAFC]`.

### 1.3 Bloco `@theme` pronto para colar em `src/app/globals.css`

```css
@theme {
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
  --color-apsen-purple: #7c3aed;
  --color-apsen-purple-bg: #f5f3ff;
  --color-apsen-purple-b: #c4b5fd;
  --color-apsen-hover: #f8fafc;
  --color-apsen-cyan: #0891b2;

  --spacing-sidebar: 252px;
  --spacing-topbar: 64px;

  --radius-apsen: 8px;
  --radius-apsen-lg: 16px;
  --radius-apsen-pill: 24px;

  --shadow-apsen-sm: 0 2px 4px 0 rgba(20, 20, 20, 0.08);
  --shadow-apsen: 0 4px 4px 0 rgba(20, 20, 20, 0.08);
  --shadow-apsen-md: 0 6px 10px 0 rgba(20, 20, 20, 0.08);

  --font-sans: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

Os tokens `brand-*` atuais do projeto (`#3b6ef5` etc.) não existem no protótipo; devem ser substituídos pelos `apsen-*`.

### 1.4 Dark mode

Não existe no protótipo. Nenhum `prefers-color-scheme` nem classe `.dark`. O protótipo é só tema claro.

---

## 2. Base / tipografia

### 2.1 CSS original

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); /* L8 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
} /* L16 */
body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  background: var(--bg);
  color: var(--slate);
  font-size: 14px;
  height: 100vh;
  overflow: hidden;
} /* L33-34 */
svg {
  display: inline-block;
  vertical-align: middle;
} /* L35 */
```

- Fonte: Inter, pesos carregados 400/500/600/700. O CSS também usa `font-weight:800` (`.dash-card-val`, fora do shell), que não está no `@import` (o navegador sintetiza). No Next, usar `next/font/google` `Inter({ weight: ['400','500','600','700'] })` para reproduzir à risca, ou incluir `'800'` se quiser o peso real.
- `line-height` do body: não definido no protótipo (fica `normal` do navegador). Atenção: o preflight do Tailwind 4 define `line-height: 1.5` no `html`; para ficar idêntico ao protótipo, setar `body { line-height: normal }`.
- `letter-spacing` do body: não definido.
- `-webkit-font-smoothing`/`antialiased`: não existe no protótipo (o projeto atual usa `antialiased`; remover para seguir à risca).
- `body` tem `height:100vh; overflow:hidden` — a página não rola; quem rola é `.main`.

### 2.2 Tradução Tailwind

```css
body {
  @apply h-screen overflow-hidden bg-apsen-bg font-sans text-[14px] text-apsen-slate;
  line-height: normal;
}
svg {
  display: inline-block;
  vertical-align: middle;
}
```

### 2.3 Escala tipográfica real (contagem de ocorrências de `font-size` no CSS L7-511)

| font-size | ocorrências | onde aparece (exemplos)                                                                              |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| 9px       | 1           | `.mod-arrow` (também inline 9px no badge "em breve")                                                 |
| 10px      | 7           | `.nav-module`, `.nav-badge`, `.sidebar-footer`, `.logo-txt span` (CSS; inline sobrescreve p/ 10.5px) |
| 10.5px    | 9           | `.rb-label`, `.card-section-label`, labels de campo/aprovação                                        |
| 11px      | 4           | `.rb-btn`, `.card-title small`, `.form-hint`                                                         |
| 11.5px    | 6           | `.topbar-avatar`, `.form-label`, `th`, `.badge`                                                      |
| 12px      | 9           | `.logo-txt strong`, `.btn-sm`, `.chip`, `.td-mono`                                                   |
| 12.5px    | 13          | `.topbar-crumb`, `.page-sub`, `.screen-desc`                                                         |
| 13px      | 16          | `.nav-item`, `.topbar-name`, `.btn`, `td`                                                            |
| 13.5px    | 3           | `.card-title`, `.form-input`                                                                         |
| 14px      | 2           | `body`, `.pag-btn.nav`                                                                               |
| 14.5px    | 1           | `.modal-head h3`                                                                                     |
| 15px      | 3           | `.screen-desc-icon`, `.range-val`                                                                    |
| 16px      | 1           | `.access-denied h3`                                                                                  |
| 17px      | 2           | `.topbar-burger`, `.modal-x`                                                                         |
| 18px      | 2           | `.page-title`, `.dash-card-icon`                                                                     |
| 26px      | 1           | `.dash-card-val`                                                                                     |
| 36px      | 1           | `.empty-icon`                                                                                        |
| 44px      | 1           | `.access-denied .lock`                                                                               |

Pesos: 400 (2x), 500 (14x), 600 (14x), 700 (15x), 800 (1x).

O protótipo não define uma escala nomeada; são valores px avulsos. Recomendação: usar valores arbitrários (`text-[12.5px]`) em vez de mapear para `text-sm`/`text-xs` do Tailwind (que têm line-height embutido e quebrariam o "à risca"). Se quiser tokens:

```css
@theme {
  --text-apsen-9: 9px;
  --text-apsen-10: 10px;
  --text-apsen-10_5: 10.5px;
  --text-apsen-11: 11px;
  --text-apsen-11_5: 11.5px;
  --text-apsen-12: 12px;
  --text-apsen-12_5: 12.5px;
  --text-apsen-13: 13px;
  --text-apsen-13_5: 13.5px;
  --text-apsen-14: 14px;
  --text-apsen-18: 18px;
}
```

Atenção: tokens `--text-*` sem `--text-*--line-height` não injetam line-height, o que é o comportamento correto aqui.

### 2.4 Transições usadas no shell

| Elemento                                                               | transição                              |
| ---------------------------------------------------------------------- | -------------------------------------- |
| `.nav-module`, `.nav-item`, `.topbar-burger` (`background`), `.rb-btn` | `all .14s` (burger: `background .14s`) |
| `.mod-arrow`                                                           | `transform .18s`                       |
| `.sidebar`                                                             | `transform .2s`                        |
| `.topbar`                                                              | `left .2s`                             |
| `.main`                                                                | `margin-left .2s`                      |

Timing function: não definida (default `ease`). Tailwind: `transition-all duration-[140ms]`, `transition-transform duration-[180ms]`, `transition-[left] duration-200`, `transition-[margin-left] duration-200`, `transition-transform duration-200`. Use `ease-[ease]` se quiser neutralizar o default do Tailwind (`cubic-bezier(0.4,0,0.2,1)`).

### 2.5 z-index

| Elemento         | z-index              |
| ---------------- | -------------------- |
| `.role-bar`      | 60                   |
| `.sidebar`       | 30                   |
| `.topbar`        | 20                   |
| `.modal-overlay` | 9000 (fora do shell) |

---

## 3. SHELL

### 3.0 Layout geral

```
┌──────────── role-bar 34px (só protótipo, NÃO aplicar) ────────────┐
├───────────┬───────────────────────────────────────────────────────┤
│ sidebar   │ topbar 64px (fixed, left: 252px)                      │
│ 252px     ├───────────────────────────────────────────────────────┤
│ fixed     │ main (margin-left 252px, padding 22px 24px,           │
│ branca    │       overflow-y:auto, altura = 100vh - barras)       │
└───────────┴───────────────────────────────────────────────────────┘
```

Sem a role-bar **[derivado]**: substituir `var(--rolebar-h)` por `0` em todas as fórmulas:

- `.sidebar`: `top:0; height:100vh`
- `.topbar`: `top:0`
- `.main`: `margin-top:64px; height:calc(100vh - 64px)`

---

### 3.1 `.role-bar` — NÃO APLICAR (apenas validação do protótipo)

Documentado só para referência. Não implementar no app.

```css
.role-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--rolebar-h);
  background: var(--slate);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  z-index: 60;
}
.rb-label {
  font-size: 10.5px;
  color: #8a8a8a;
  letter-spacing: 0.05em;
  white-space: nowrap;
  margin-right: 4px;
}
.rb-btns {
  display: flex;
  gap: 3px;
}
.rb-btn {
  padding: 3px 12px;
  border-radius: 20px;
  border: 1px solid transparent;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.14s;
  font-weight: 500;
  background: transparent;
  color: #64748b;
}
.rb-btn:hover {
  color: #cbd5e1;
  background: var(--slate-2);
}
.rb-btn.active[data-role='admin'] {
  background: var(--purple);
  color: #fff;
  border-color: var(--purple);
}
.rb-btn.active[data-role='planejador'] {
  background: var(--blue);
  color: #fff;
  border-color: var(--blue);
}
.rb-btn.active[data-role='area'] {
  background: var(--teal);
  color: #fff;
  border-color: var(--teal);
}
.rb-btn.active[data-role='viewer'] {
  background: var(--slate-3);
  color: #fff;
  border-color: var(--slate-3);
}
.rb-sep {
  width: 1px;
  height: 16px;
  background: var(--slate-2);
  margin: 0 6px;
}
.rb-who {
  font-size: 10.5px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 4px;
}
.rb-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.rb-hint {
  margin-left: auto;
  font-size: 10px;
  color: #334155;
  font-style: italic;
}
```

Conteúdo: "Simular perfil:" + botões Admin / Planejador / Área (usuário) / Visualizador, separador, link "Plano MVP" (inline: 12px/600, padding 4px 12px, radius 6px, bg `#F0FDF4`, cor `--green`, borda `1px solid #86EFAC`, hover bg `#DCFCE7`), separador, bolinha + rótulo do perfil, e "Apenas para validação do protótipo".

Única parte útil para o app: a cor do avatar por perfil (ver 3.4), que é setada por `setRole()`.

---

### 3.2 `.sidebar`

#### CSS original (L56-100)

```css
.sidebar {
  width: var(--sidebar-w);
  background: var(--white);
  border-right: 1px solid var(--border);
  position: fixed;
  left: 0;
  top: var(--rolebar-h);
  height: calc(100vh - var(--rolebar-h));
  display: flex;
  flex-direction: column;
  z-index: 30;
  overflow-y: auto;
  transition: transform 0.2s;
}
```

Tailwind (sem role-bar):

```
fixed left-0 top-0 z-30 flex h-screen w-sidebar flex-col overflow-y-auto
border-r border-apsen-border bg-apsen-white transition-transform duration-200
```

Estado fechado: `-translate-x-full`.

Scrollbar customizada: não existe no protótipo (usa a nativa).

#### 3.2.1 `.sidebar-logo`

```css
.sidebar-logo {
  height: var(--topbar-h);
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.logo-txt strong {
  font-size: 12px;
  font-weight: 700;
  color: var(--slate);
  display: block;
  line-height: 1.2;
}
.logo-txt span {
  font-size: 10px;
  color: var(--muted);
}
```

Markup real (L544-551) com estilos inline que **sobrescrevem** o CSS:

```html
<div class="sidebar-logo">
  <img src="/brand/apsen-logo.png" alt="Apsen" style="height:34px;width:auto;flex-shrink:0" />
  <div
    class="logo-txt"
    style="border-left:1px solid var(--border);padding-left:10px;margin-left:2px"
  >
    <strong style="font-weight:700;font-size:12px;color:var(--slate)">Demand</strong>
    <span style="font-size:10.5px;color:var(--muted)">Intelligence</span>
  </div>
</div>
```

- O `<span>` usa **10.5px** (inline) e não 10px (CSS). `span` não tem `display:block`, mas cai na linha de baixo porque o `strong` é `block`.
- Logo: `height:34px; width:auto`. Arquivo extraído: `public/brand/apsen-logo.png`, PNG intrínseco **124 x 96 px**, renderizado a **34px de altura x ~43.92px de largura** (34 x 124/96).
- No app, o texto "Demand / Intelligence" é o nome do produto do protótipo; trocar pelo nome do produto do domínio (ex.: "Marketing / Insights") é decisão de conteúdo, o visual é o mesmo.

Tailwind:

```html
<div class="flex h-topbar shrink-0 items-center gap-[10px] border-b border-apsen-border px-[18px]">
  <img src="/brand/apsen-logo.png" alt="Apsen" class="h-[34px] w-auto shrink-0" />
  <div class="ml-[2px] border-l border-apsen-border pl-[10px]">
    <strong class="block text-[12px] font-bold leading-[1.2] text-apsen-slate">Demand</strong>
    <span class="text-[10.5px] text-apsen-muted">Intelligence</span>
  </div>
</div>
```

Com `next/image`: `<Image src="/brand/apsen-logo.png" alt="Apsen" width={124} height={96} className="h-[34px] w-auto shrink-0" priority />`.

`.logo-icon` (`width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--blue)`) está definido no CSS mas **não é usado no markup**.

Observação de markup: após o `.sidebar-logo` existe um `</div>` sobrando (L552) — o parser ignora; não tem efeito visual.

#### 3.2.2 Item raiz "Dashboard" (`.nav-item` com estilo inline, L555-563)

```html
<div
  class="nav-item"
  id="ni-dashboard"
  style="margin:8px 8px 4px;border-radius:8px;font-weight:600;padding-left:13px"
>
  [ícone 13x13, stroke currentColor, stroke-width 2: grade de 4 quadrados 7x7 — equivalente ao
  "LayoutGrid" do lucide] Dashboard
</div>
```

Efeito combinado com `.nav-item`: `padding:8px 18px 8px 13px; margin:8px 8px 4px; border-radius:8px; font-weight:600; border-left:3px solid transparent`. Quando ativo: `border-left-color:--blue; background:--blue-bg; color:--blue` e `font-weight` continua 600 (inline vence o 500 do `.active`).

Tailwind:

```
mx-[8px] mt-[8px] mb-[4px] flex cursor-pointer select-none items-center gap-[8px]
rounded-apsen border-l-[3px] border-transparent py-[8px] pr-[18px] pl-[13px]
text-[13px] font-semibold text-apsen-muted transition-all duration-[140ms]
hover:bg-apsen-hover hover:text-apsen-slate
data-[active=true]:border-apsen-blue data-[active=true]:bg-apsen-blue-bg data-[active=true]:text-apsen-blue
```

Ícone: `size-[13px] shrink-0`.

#### 3.2.3 `.nav-module` (cabeçalho de grupo)

```css
.nav-module {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--muted-2);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-top: 6px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.14s;
  user-select: none;
  position: relative;
}
.nav-module:first-of-type {
  margin-top: 2px;
}
.nav-module.active-mod {
  color: var(--slate-3);
  font-weight: 700;
}
.nav-module .mod-arrow {
  margin-left: auto;
  font-size: 9px;
  transition: transform 0.18s;
  color: var(--muted-2);
}
.nav-module .mod-arrow.open {
  transform: rotate(180deg);
}
.mod-accent {
  width: 3px;
  height: 22px;
  border-radius: 2px;
  flex-shrink: 0;
}
.mod-drivers .mod-accent {
  background: var(--blue);
}
.mod-admin .mod-accent {
  background: var(--teal);
}
.mod-acesso .mod-accent {
  background: var(--purple);
}
```

Comportamento real no protótipo (importante para "à risca"):

- **Hover do `.nav-module`: não existe no protótipo** (tem `transition` mas nenhuma regra `:hover`).
- `.mod-accent` (indicador colorido de módulo): definido no CSS, mas **nenhum elemento `.mod-accent` existe no markup**. Portanto as classes `mod-drivers` / `mod-admin` / `mod-acesso` não produzem nenhum efeito visual. Mapeamento de cor previsto: drivers = `--blue`, admin = `--teal`, acesso = `--purple`; demais módulos (Agentes, Análises, Restrições, Planos, Relatórios) não têm cor definida.
- `border-left:3px solid transparent` nunca recebe cor.
- `.active-mod`: definido no CSS, **nunca aplicado** pelo JS. Visualmente todos os headers ficam `--muted-2`.
- `.nav-module:first-of-type`: `:first-of-type` conta `div`s irmãos; o primeiro `div` do `<nav>` é o `.sidebar-logo`, então a regra **nunca casa**. Todos os headers têm `margin-top:6px`.
- `.mod-arrow`: caractere "▼" (U+25BC) 9px, cor `--muted-2`. Aberto = `rotate(180deg)` (aponta para cima). Fechado = aponta para baixo.

Para seguir à risca o que é **renderizado**: header sem acento colorido, sem hover, sem estado ativo. Se quiserem ativar o indicador colorido (intenção do comentário "Assinatura: Barra lateral com indicador de módulo colorido", L14), usar `<span class="mod-accent">` 3x22px radius 2px como primeiro filho — isso é intenção do CSS, não o que o protótipo mostra.

Markup de referência:

```html
<div class="nav-module mod-drivers" onclick="toggleMod('drivers')">
  Drivers de Demanda
  <span class="mod-arrow open">▼</span>
</div>
```

Tailwind:

```
relative mt-[6px] flex cursor-pointer select-none items-center gap-[8px]
border-l-[3px] border-transparent pt-[10px] pr-[18px] pb-[6px] pl-[18px]
text-[10px] font-bold uppercase tracking-[.12em] text-apsen-muted-2 transition-all duration-[140ms]
```

Seta: `ml-auto text-[9px] text-apsen-muted-2 transition-transform duration-[180ms]` + aberto `rotate-180`.
Acento (opcional, se usado): `h-[22px] w-[3px] shrink-0 rounded-[2px] bg-apsen-blue|bg-apsen-teal|bg-apsen-purple`.
`.active-mod` (se usado): `text-apsen-slate-3 font-bold`.

Nota de padding: `padding:10px 18px 6px` = top 10, left/right 18, bottom 6; com o `border-left` de 3px, o texto começa em 21px da borda da sidebar.

#### 3.2.4 `.nav-children` (accordion)

```css
.nav-children {
  overflow: hidden;
  max-height: 0;
}
.nav-children.open {
  max-height: 9999px;
}
```

- Não há `transition` em `max-height`: **abre/fecha instantâneo**, sem animação. Só a seta anima (.18s).
- JS (`toggleMod`, L3760): fecha `drivers, admin, acesso, ciclos, agentes` e abre o clicado se estava fechado (clicar no aberto fecha). Os módulos `analises, restricoes, planos, relatorios` **não são fechados** por `toggleMod` (podem ficar vários abertos ao mesmo tempo via clique).
- `goScreen()` (L3815-3830) abre exclusivamente o módulo que contém a tela atual e fecha todos os outros (8 módulos).
- Estado inicial (após `setRole('admin')` → `goScreen('dashboard')`): "Drivers de Demanda" aberto (dashboard pertence a `driverScreens`), resto fechado.

Tailwind: `overflow-hidden max-h-0` / aberto `max-h-[9999px]` (ou simplesmente renderizar condicionalmente, já que não há animação).

#### 3.2.5 `.nav-item`

```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px 8px 44px;
  cursor: pointer;
  color: var(--muted);
  font-size: 13px;
  transition: all 0.14s;
  border-left: 3px solid transparent;
  user-select: none;
}
.nav-item:hover {
  background: #f8fafc;
  color: var(--slate);
}
.nav-item.active {
  border-left-color: var(--blue);
  background: var(--blue-bg);
  color: var(--blue);
  font-weight: 500;
}
.nav-item.active.teal {
  border-left-color: var(--teal);
  background: var(--teal-bg);
  color: var(--teal);
}
.nav-item.active.purple {
  border-left-color: var(--purple);
  background: var(--purple-bg);
  color: var(--purple);
}
```

- Estados: normal (`--muted`, 400), hover (`bg #F8FAFC`, `--slate`), active (borda esquerda 3px `--blue`, `bg --blue-bg`, `--blue`, 500).
- Variantes `.active.teal` e `.active.purple`: definidas, **não usadas** (JS só adiciona `active`). Todos os ativos ficam azuis.
- Active + hover: `.nav-item.active` tem especificidade maior que `:hover`? Não — ambos têm 2 (classe+classe vs classe+pseudo-classe), e `.active` vem depois no CSS, logo o ativo **mantém** fundo/cor azul no hover.
- Itens filhos não têm ícone; o recuo de 44px é o alinhamento.
- Focus visível: não existe no protótipo.

Markup:

```html
<div class="nav-item active">Registrar Driver</div>
<div class="nav-item">Meus Registros <span class="nav-badge nb-blue">0</span></div>
```

Tailwind:

```
flex cursor-pointer select-none items-center gap-[8px] border-l-[3px] border-transparent
py-[8px] pr-[18px] pl-[44px] text-[13px] text-apsen-muted transition-all duration-[140ms]
hover:bg-apsen-hover hover:text-apsen-slate
aria-[current=page]:border-apsen-blue aria-[current=page]:bg-apsen-blue-bg
aria-[current=page]:font-medium aria-[current=page]:text-apsen-blue
```

Variantes (se usadas): teal → `border-apsen-teal bg-apsen-teal-bg text-apsen-teal`; purple → `border-apsen-purple bg-apsen-purple-bg text-apsen-purple`.

#### 3.2.6 `.nav-badge` e `nb-*`

```css
.nav-badge {
  border-radius: 20px;
  font-size: 10px;
  padding: 1px 7px;
  margin-left: auto;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}
.nb-blue {
  background: var(--blue);
}
.nb-teal {
  background: var(--teal);
}
.nb-red {
  background: var(--red);
}
.nb-purple {
  background: var(--purple);
}
.nb-orange {
  background: var(--orange);
}
.nb-gray {
  background: var(--muted);
}
```

Usos reais no markup: `nb-blue` (Meus Registros "0"), `nb-teal` (Catálogo de Tipos "40"), `nb-red` (Fila de Aprovação "2"), `nb-purple` (Usuários "4"); inline `background:var(--orange)` (Ciclos "3", Minhas Análises "2"), `#7C3AED` (Agentes "5"), `var(--red)` (Restrições "8"), `var(--blue)` (PLP Ativo "247"), `#0891B2;font-size:9px` ("em breve"). `nb-orange` e `nb-gray` definidos mas não usados por classe.

Tailwind base:

```
ml-auto whitespace-nowrap rounded-[20px] px-[7px] py-[1px] text-[10px] font-bold text-white
```

- `bg-apsen-blue | bg-apsen-teal | bg-apsen-red | bg-apsen-purple | bg-apsen-orange | bg-apsen-muted`; "em breve": `bg-apsen-cyan text-[9px]`.

#### 3.2.7 Ordem dos grupos (estrutura de referência)

1. Dashboard (item raiz com ícone)
2. DRIVERS DE DEMANDA — Registrar Driver, Meus Registros [nb-blue], Catálogo de Produtos, Exportar JSON
3. ADMINISTRAÇÃO DI — Ciclos de Planejamento [orange], Catálogo de Tipos [nb-teal], Fila de Aprovação [nb-red], Drivers Ingeridos, Fontes de Dados / APIs
4. CONTROLE DE ACESSO — Usuários [nb-purple], Perfis de Acesso, (Novo Usuário oculto)
5. AGENTES DE IA — Agentes Cadastrados [purple]
6. ANÁLISES — Minhas Análises [orange]
7. RESTRIÇÕES & ALERTAS — Restrições Ativas [red]
8. PLANOS DE PRODUÇÃO — PLP Ativo [blue]
9. RELATÓRIOS — A definir [cyan 9px "em breve"]

Visibilidade por perfil (via `setRole`): Drivers/Análises = Área+; Admin DI/Restrições/Exportar = Planejador+; Controle de Acesso/Agentes = Admin; Planos/Relatórios/Dashboard = todos. No app, os grupos serão os do domínio de campanhas (Dashboard, Campanhas, Detalhe); reproduzir apenas o padrão visual (item raiz com ícone + grupos em accordion).

#### 3.2.8 `.sidebar-footer`

```css
.sidebar-footer {
  padding: 12px 18px;
  border-top: 1px solid var(--border);
  font-size: 10px;
  color: var(--muted-2);
  line-height: 1.8;
  margin-top: auto;
  flex-shrink: 0;
}
```

Markup: `Apsen Farmacêutica<br>PLP Agent · Demand Intelligence`.

Tailwind:

```
mt-auto shrink-0 border-t border-apsen-border px-[18px] py-[12px]
text-[10px] leading-[1.8] text-apsen-muted-2
```

---

### 3.3 `.topbar`

#### CSS original (L102-114)

```css
.topbar {
  position: fixed;
  top: var(--rolebar-h);
  left: var(--sidebar-w);
  right: 0;
  height: var(--topbar-h);
  background: var(--white);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 22px;
  gap: 14px;
  z-index: 20;
  transition: left 0.2s;
}
.topbar-burger {
  cursor: pointer;
  color: var(--muted);
  font-size: 17px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.14s;
  user-select: none;
  line-height: 1;
}
.topbar-burger:hover {
  background: var(--bg);
  color: var(--slate);
}
.topbar-crumb {
  font-size: 12.5px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 5px;
}
.topbar-crumb strong {
  color: var(--slate);
  font-weight: 500;
}
.topbar-crumb svg {
  width: 12px;
  height: 12px;
  opacity: 0.4;
}
.topbar-spacer {
  flex: 1;
}
.topbar-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11.5px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
}
.topbar-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--slate);
}
```

#### Markup (L674-684)

```html
<header class="topbar">
  <span class="topbar-burger" onclick="document.body.classList.toggle('nav-closed')">☰</span>
  <div class="topbar-crumb">
    <span>Demand Intelligence</span>
    [ícone chevron-right 12x12, stroke-width 2, opacity .4]
    <strong id="crumb-page">Dashboard</strong>
  </div>
  <div class="topbar-spacer"></div>
  <div class="topbar-avatar" style="background:var(--purple)">A</div>
  <span class="topbar-name">Ana Admin</span>
</header>
```

- Burger: caractere "☰" (U+2630), 17px, `line-height:1`, padding 4px, radius 4px. Hover: bg `--bg`, cor `--slate`. A transição é só de `background` (cor muda instantânea).
- Crumb: raiz em `--muted` 400, separador chevron `opacity:.4` (herda `--muted`), página atual em `--slate` 500. O texto da página vem de `crumbMap[id]`.
- Avatar: círculo 30px, inicial branca 11.5px/700, fundo pela cor do perfil: admin `--purple`, planejador `--blue`, área `--teal`, viewer `--muted`. Iniciais/nomes do protótipo: A/Ana Admin, C/Carlos Planejador, F/Fernanda Marketing, P/Pedro Viewer. Valor inicial no HTML é "A"/"Admin", mas `setRole('admin')` no load troca para "Ana Admin".
- Menu dropdown do avatar, notificações, busca global na topbar: **não existe no protótipo**.
- Gap entre todos os filhos: 14px (avatar e nome também ficam a 14px um do outro).

Tailwind (sem role-bar):

```html
<header
  class="fixed top-0 right-0 left-sidebar z-20 flex h-topbar items-center gap-[14px]
               border-b border-apsen-border bg-apsen-white px-[22px] transition-[left] duration-200"
>
  <button
    class="cursor-pointer select-none rounded-[4px] p-[4px] text-[17px] leading-none text-apsen-muted
                 transition-[background-color] duration-[140ms] hover:bg-apsen-bg hover:text-apsen-slate"
  >
    ☰
  </button>
  <nav class="flex items-center gap-[5px] text-[12.5px] text-apsen-muted">
    <span>Demand Intelligence</span>
    <ChevronRight class="size-[12px] opacity-40" strokeWidth="{2}" />
    <strong class="font-medium text-apsen-slate">Dashboard</strong>
  </nav>
  <div class="flex-1"></div>
  <div
    class="flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full
              bg-apsen-purple text-[11.5px] font-bold text-white"
  >
    A
  </div>
  <span class="text-[13px] font-semibold text-apsen-slate">Ana Admin</span>
</header>
```

Fechado: `left-0`.

---

### 3.4 `.main`

```css
.main {
  margin-left: var(--sidebar-w);
  margin-top: calc(var(--rolebar-h) + var(--topbar-h));
  height: calc(100vh - var(--rolebar-h) - var(--topbar-h));
  overflow-y: auto;
  padding: 22px 24px;
  transition: margin-left 0.2s;
}
.screen {
  display: none;
}
.screen.active {
  display: block;
}
```

- `.main` é o único container de scroll (body tem `overflow:hidden`). Ao trocar de tela o JS zera `scrollTop`.
- `max-width` do conteúdo: não existe no protótipo (conteúdo ocupa toda a largura).

Tailwind (sem role-bar):

```
ml-sidebar mt-topbar h-[calc(100vh-var(--spacing-topbar))] overflow-y-auto px-[24px] py-[22px]
transition-[margin-left] duration-200
```

Cabeçalho de página (primeiro filho de cada tela, L127-133), incluído aqui porque faz parte do frame:

```css
.page-hdr {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--slate);
  line-height: 1.2;
}
.page-sub {
  font-size: 12.5px;
  color: var(--muted);
  margin-top: 3px;
}
.page-hdr-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
```

Tailwind: `mb-[18px] flex flex-wrap items-start justify-between gap-[12px]`; título `text-[18px] font-bold leading-[1.2] text-apsen-slate`; sub `mt-[3px] text-[12.5px] text-apsen-muted`; ações `flex flex-wrap items-center gap-[8px]`.

---

### 3.5 Comportamento responsivo / `body.nav-closed`

```css
body.nav-closed .sidebar {
  transform: translateX(-100%);
}
body.nav-closed .topbar,
body.nav-closed .main {
  left: 0;
}
```

- O toggle é só o clique no burger (`document.body.classList.toggle('nav-closed')`). Estado inicial: aberto. Persistência do estado: não existe no protótipo.
- Sidebar sai com `translateX(-100%)` em .2s; topbar anima `left` 252px -> 0 em .2s.
- **Bug do protótipo**: `.main` não é posicionado e usa `margin-left`, então `left:0` não tem efeito. Com a sidebar fechada o conteúdo **continua deslocado 252px** (fica uma faixa vazia `--bg` à esquerda) e o `transition:margin-left .2s` nunca dispara. Literal = manter `ml-sidebar` mesmo fechado; intenção aparente = `ml-0`. Decisão a registrar na implementação (recomendação: aplicar `ml-0`, que é o que a `transition:margin-left` indica).
- Overlay/backdrop quando a sidebar está aberta sobre conteúdo: não existe no protótipo.
- **`@media` para o shell: não existe no protótipo.** A sidebar não fecha automaticamente em telas pequenas e não vira drawer. As únicas media queries do arquivo são de grids internos:
  - `@media(max-width:800px){.fg-3,.fg-4{grid-template-columns:1fr 1fr}}` (L162)
  - `@media(max-width:560px){.fg-2,.fg-3,.fg-4{grid-template-columns:1fr}}` (L163)
  - `@media(max-width:720px){.g3{grid-template-columns:1fr 1fr}}` (L306)
  - `@media(max-width:480px){.g2,.g3{grid-template-columns:1fr}}` (L307)
  - `@media(max-width:800px){.aprov-grid{grid-template-columns:1fr 1fr}}` (L454)
    Breakpoints usados: 480, 560, 720, 800px (todos `max-width`). Equivalentes Tailwind: `max-[480px]:`, `max-[560px]:`, `max-[720px]:`, `max-[800px]:`.

Tailwind (estado controlado em React, ex. `navOpen`):

```
sidebar:  navOpen ? "" : "-translate-x-full"
topbar:   navOpen ? "left-sidebar" : "left-0"
main:     navOpen ? "ml-sidebar" : "ml-0"   (ver nota do bug acima)
```

---

## 4. Resumo de estados interativos do shell

| Elemento         | normal                                  | hover                                         | active/aberto                                         | transição       |
| ---------------- | --------------------------------------- | --------------------------------------------- | ----------------------------------------------------- | --------------- |
| `.nav-item`      | `--muted`, 13px/400, bg transparente    | bg `#F8FAFC`, `--slate`                       | borda-esq 3px `--blue`, bg `--blue-bg`, `--blue`, 500 | all .14s        |
| Dashboard (raiz) | idem + 600, radius 8px, margin 8/8/4    | idem                                          | idem (mantém 600)                                     | all .14s        |
| `.nav-module`    | `--muted-2`, 10px/700, uppercase, .12em | não existe no protótipo                       | `.active-mod` (`--slate-3`) definido, não usado       | all .14s        |
| `.mod-arrow`     | ▼ 9px `--muted-2`                       | —                                             | `rotate(180deg)`                                      | transform .18s  |
| `.nav-children`  | `max-height:0`                          | —                                             | `max-height:9999px`                                   | sem transição   |
| `.topbar-burger` | `--muted` 17px                          | bg `--bg`, `--slate`                          | —                                                     | background .14s |
| `.topbar-avatar` | cor do perfil                           | não existe no protótipo (só `cursor:pointer`) | —                                                     | —               |
| `.sidebar`       | visível                                 | —                                             | `nav-closed` → `translateX(-100%)`                    | transform .2s   |

## 5. Arquivos gerados

- `C:/projects/euGenia/apsen/marketing-insights-web/public/brand/apsen-logo.png` — PNG 124x96 (10.858 bytes), decodificado do base64 da `.sidebar-logo` (L545). Renderizar com `height:34px; width:auto` (~43.92 x 34 px).
