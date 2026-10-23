# Catálogo de Componentes — protótipo `di-drivers-v2_84.html`

Fonte da verdade: `C:/Users/erik.santos/Downloads/di-drivers-v2_84.html` (CSS no `<style>` das linhas 7–511; markup 513–3590; JS 3608–7952).
Todos os valores abaixo foram copiados do CSS original. Quando algo **não existe no protótipo**, isso é dito explicitamente — não invente.

> Linhas citadas como `L123` referem-se ao arquivo do protótipo.

---

## 0. Premissas para a tradução em Tailwind 4

### 0.1 Tokens assumidos no `@theme` (nomes usados nas classes deste documento)

O protótipo usa variáveis CSS em `:root` (L17–33). Para as classes Tailwind deste catálogo, assume-se este `@theme` (o nome `--slate` do protótipo foi mapeado para `ink` para não colidir com a escala `slate-*` nativa do Tailwind; `--bg` virou `canvas`):

```css
@theme {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  --color-blue: #0a13b6;
  --color-blue-d: #070d81;
  --color-blue-bg: #eef1fc;
  --color-blue-light: #ccdaf2;
  --color-teal: #0077be;
  --color-teal-bg: #e6f2fa;
  --color-teal-light: #99cde8;
  --color-ink: #141414;
  --color-ink-2: #1d1d1d;
  --color-ink-3: #404040; /* --slate, --slate-2, --slate-3 */
  --color-muted: #6f6f6f;
  --color-muted-2: #8a8a8a;
  --color-border: #e1e1e1;
  --color-canvas: #fafafa;
  --color-white: #ffffff; /* --border, --bg, --white */
  --color-green: #18a957;
  --color-green-bg: #e7f1ea;
  --color-green-b: #81c17e;
  --color-yellow: #f4cf3d;
  --color-yellow-bg: #fdf4de;
  --color-yellow-b: #f4cf3d;
  --color-red: #d63434;
  --color-red-bg: #fae9e9;
  --color-red-b: #d63434;
  --color-orange: #dd7443;
  --color-orange-bg: #fff1ea;
  --color-purple: #7c3aed;
  --color-purple-bg: #f5f3ff;
  --color-purple-b: #c4b5fd;

  --radius-ds: 8px; /* --radius */
  --radius-ds-lg: 16px; /* --radius-lg */
  --radius-ds-pill: 24px; /* --radius-pill */

  --shadow-ds-sm: 0 2px 4px 0 rgba(20, 20, 20, 0.08); /* --shadow-sm */
  --shadow-ds: 0 4px 4px 0 rgba(20, 20, 20, 0.08); /* --shadow */
  --shadow-ds-md: 0 6px 10px 0 rgba(20, 20, 20, 0.08); /* --shadow-md */
}
```

Layout: `--sidebar-w:252px; --topbar-h:64px; --rolebar-h:34px` (L28).

### 0.2 Armadilhas de fidelidade (Tailwind x protótipo)

1. **line-height**: o protótipo **não** define `line-height` no `body` (fica `normal` do browser). O preflight do Tailwind 4 põe `line-height:1.5` no `html`. Para ficar à risca, aplicar `leading-normal` no body **não resolve** (`leading-normal` = 1.5). Use `body{line-height:normal}` (ou `leading-[normal]`). `text-[13px]` arbitrário do Tailwind 4 **não** seta line-height.
2. **font-size base**: `body{font-size:14px}` (L35) → `text-[14px]` no body.
3. **Easing**: `transition:all .14s` do protótipo usa `ease` (default CSS). `transition-all` do Tailwind usa `cubic-bezier(0.4,0,0.2,1)`. Para ficar idêntico: `transition-all duration-[140ms] ease-[ease]`. Neste documento a abreviação **`T140`** = `transition-all duration-[140ms] ease-[ease]` (e `T130` = `…duration-[130ms]…`).
4. **Ring de foco**: o protótipo usa `box-shadow:0 0 0 3px rgba(27,78,201,.1)` — note que `rgba(27,78,201)` = `#1B4EC9`, **não** é o `--blue` (#0A13B6). Copiar literalmente: `focus:shadow-[0_0_0_3px_rgba(27,78,201,.1)]`.
5. **Fonte**: Inter 400/500/600/700 via Google Fonts (L8). `font-weight:800` é usado em `.dash-card-val` mas o peso 800 **não** é importado (o browser sintetiza/usa 700).
6. `*{box-sizing:border-box;margin:0;padding:0}` (L16) — equivalente ao preflight.
7. `svg{display:inline-block;vertical-align:middle}` (L37) — o preflight do Tailwind faz `svg{display:block;vertical-align:middle}`. Para fidelidade adicionar `svg{display:inline-block}` na base.

---

## 1. Ranking de uso (contagem de ocorrências)

Contagem de tokens de classe em `class="…"` no markup (L513–3590) + templates JS (L3608–7952). Ordenado pelo total.

| #   | Classe                                            | Markup | JS                  | Total                                                      |
| --- | ------------------------------------------------- | ------ | ------------------- | ---------------------------------------------------------- |
| 1   | `.field` (form do driver dinâmico)                | 0      | 268                 | **268**                                                    |
| 2   | `.form-group`                                     | 91     | 0                   | **91**                                                     |
| 3   | `.form-label`                                     | 91     | 3                   | **94**                                                     |
| 4   | `.btn`                                            | 60     | 11                  | **71**                                                     |
| 5   | `.btn-sm`                                         | 50     | 11                  | **61**                                                     |
| 6   | `.form-input`                                     | 43     | 8                   | **51**                                                     |
| 7   | `.form-select`                                    | 47     | 3                   | **50**                                                     |
| 8   | `.g3`                                             | 0      | 46                  | **46**                                                     |
| 9   | `.req`                                            | 44     | 1                   | **45**                                                     |
| 10  | `.btn-ghost`                                      | 33     | 7                   | **40** (42 no arquivo todo)                                |
| 11  | `.chip`                                           | 33     | 0                   | **33**                                                     |
| 12  | `.action-btn`                                     | 20     | 10                  | **30**                                                     |
| 13  | `.tip-wrap` / `.tip-icon` / `.tip-box`            | 29     | 0                   | **29** cada                                                |
| 14  | `.card`                                           | 26     | 4                   | **30**                                                     |
| 15  | `.screen`                                         | 25     | 0                   | 25                                                         |
| 16  | `.card-title`                                     | 21     | 1                   | 22                                                         |
| 17  | `.screen-desc` / `.screen-desc-icon`              | 19     | 0                   | 19                                                         |
| 18  | `.page-hdr` / `.page-title` / `.page-sub`         | 18–19  | 0                   | 19                                                         |
| 19  | `.nav-item`                                       | 18     | 0                   | 18                                                         |
| 20  | `.form-grid`                                      | 17     | 0                   | 17                                                         |
| 21  | `.fg-2`                                           | 16     | 0                   | 16                                                         |
| 22  | `.action-grp`                                     | 11     | 4                   | 15                                                         |
| 23  | `.form-hint`                                      | 15     | 0                   | 15                                                         |
| 24  | `.page-hdr-actions`                               | 13     | 0                   | 13                                                         |
| 25  | `.toggle` / `.toggle-track`                       | 9      | 2                   | 11                                                         |
| 26  | `.modal*` (overlay/modal/head/body/foot/x)        | 9      | 0                   | 9                                                          |
| 27  | `.badge`                                          | 7      | 3                   | 10 (+ variantes dinâmicas via `STATUS_CFG`)                |
| 28  | `.alert`                                          | 7      | 0                   | 7 (info 5, warning 3, success 2, danger 1 no arquivo todo) |
| 29  | `.table-wrap`                                     | 7      | 1                   | 8                                                          |
| 30  | `.form-textarea`                                  | 8      | 0                   | 8                                                          |
| 31  | `.empty` / `.empty-icon`                          | 1      | 5                   | 6                                                          |
| 32  | `.search-wrap` / `.search-input` / `.search-icon` | 6      | 0                   | 6                                                          |
| 33  | `.form-actions`                                   | 6      | 0                   | 6                                                          |
| 34  | `.drv-badge`                                      | 4      | 2                   | 6                                                          |
| 35  | `.pag-btn`                                        | 0      | 4                   | 4                                                          |
| 36  | `.aprov-card` (+ `aprov-label/val/field`)         | 0      | 1 (×4 campos)       | —                                                          |
| 37  | `.dash-card` (+ icon/val/lbl)                     | 0      | 1 template ×4 cards | —                                                          |

Variantes de botão no arquivo todo: `btn-ghost` 42, `btn-outline` 7, `btn-teal` 5, `btn-danger` 5, `btn-purple` 4, `btn-primary` 3, `btn-success` 3, `btn-outline-teal` 2.
Variantes de badge no arquivo todo: `badge-gray` 5 (−1 da def. CSS), `badge-blue/green/yellow/purple` 4, `badge-red/teal` 3, `badge-orange` 2 (≈ só a definição CSS + JS).

**Definidos no CSS mas sem uso no markup/JS** (só existem na folha de estilo): `.tabs-pill`/`.tab-pill`, `.tabs-line`/`.tab-line`, `.progress-track`/`.progress-fill`, `.btn-primary` tem só 3 usos. As abas reais da tela de Restrições são feitas com **estilo inline** (ver §14).

---

## 2. Botões `.btn*` (L180–199)

### CSS original

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.14s;
  border: 1px solid transparent;
  white-space: nowrap;
  font-family: inherit;
  line-height: 1;
}
.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
}
.btn-primary {
  background: var(--blue);
  color: #fff;
  border-color: var(--blue);
}
.btn-primary:hover {
  background: var(--blue-d);
}
.btn-teal {
  background: var(--teal);
  color: #fff;
  border-color: var(--teal);
}
.btn-teal:hover {
  background: #0d6b63;
}
.btn-purple {
  background: var(--purple);
  color: #fff;
  border-color: var(--purple);
}
.btn-purple:hover {
  background: #6d28d9;
}
.btn-outline {
  background: var(--white);
  color: var(--blue);
  border-color: var(--blue);
}
.btn-outline:hover {
  background: var(--blue-bg);
}
.btn-outline-teal {
  background: var(--white);
  color: var(--teal);
  border-color: var(--teal);
}
.btn-outline-teal:hover {
  background: var(--teal-bg);
}
.btn-ghost {
  background: transparent;
  color: var(--muted);
  border-color: var(--border);
}
.btn-ghost:hover {
  background: var(--bg);
  color: var(--slate);
}
.btn-danger {
  background: var(--white);
  color: var(--red);
  border-color: var(--red-b);
}
.btn-danger:hover {
  background: var(--red-bg);
}
.btn-success {
  background: var(--white);
  color: var(--green);
  border-color: var(--green-b);
}
.btn-success:hover {
  background: var(--green-bg);
}
```

Observações:

- Hover do `.btn-teal` é `#0D6B63` (verde-petróleo, **não** derivado do `--teal` #0077BE) — copiar literal.
- `.btn-sm` altera só padding e font-size (mantém radius 24px, gap 6px, weight 600).
- **focus / active / disabled de botão: não existe no protótipo.** Única ocorrência de "disabled" visual é inline `opacity:.35` nos botões de paginação (§16).
- Variação inline recorrente: `style="font-size:11.5px;border-style:dashed"` em `btn-ghost btn-sm` ("✏️ Alterar decisão", L~4185).

### Tailwind 4

| Classe              | Utilitários                                                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| base `.btn`         | `inline-flex items-center gap-[6px] px-[20px] py-[9px] rounded-ds-pill text-[13px] font-semibold cursor-pointer T140 border border-transparent whitespace-nowrap font-[inherit] leading-none` |
| `.btn-sm`           | `px-[12px] py-[5px] text-[12px]`                                                                                                                                                              |
| `.btn-primary`      | `bg-blue text-white border-blue hover:bg-blue-d`                                                                                                                                              |
| `.btn-teal`         | `bg-teal text-white border-teal hover:bg-[#0D6B63]`                                                                                                                                           |
| `.btn-purple`       | `bg-purple text-white border-purple hover:bg-[#6D28D9]`                                                                                                                                       |
| `.btn-outline`      | `bg-white text-blue border-blue hover:bg-blue-bg`                                                                                                                                             |
| `.btn-outline-teal` | `bg-white text-teal border-teal hover:bg-teal-bg`                                                                                                                                             |
| `.btn-ghost`        | `bg-transparent text-muted border-border hover:bg-canvas hover:text-ink`                                                                                                                      |
| `.btn-danger`       | `bg-white text-red border-red-b hover:bg-red-bg`                                                                                                                                              |
| `.btn-success`      | `bg-white text-green border-green-b hover:bg-green-bg`                                                                                                                                        |

### Markup de exemplo (L1543, L1601, L1799)

```html
<button class="btn btn-outline btn-sm">+ Novo Driver</button>
<button class="btn btn-ghost btn-sm">Importar JSON</button>
<button class="btn btn-teal btn-sm">+ Novo Tipo</button>
<div class="form-actions">
  <button class="btn btn-ghost">Cancelar</button><button class="btn btn-teal">Salvar Tipo</button>
</div>
<button class="btn btn-success btn-sm"><svg width="14" height="14">…</svg> Aprovar</button>
<button class="btn btn-danger btn-sm"><svg … /> Rejeitar</button>
```

### Botões auxiliares

**`.action-btn` (ícone em tabela, L234–240)**

```css
.action-btn {
  cursor: pointer;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 5px;
  transition: all 0.13s;
  border: none;
  background: transparent;
}
.action-btn:hover {
  background: var(--blue-bg);
  color: var(--blue);
}
.action-btn.red:hover {
  background: var(--red-bg);
  color: var(--red);
}
.action-btn.teal:hover {
  background: var(--teal-bg);
  color: var(--teal);
}
.action-grp {
  display: flex;
  gap: 2px;
  align-items: center;
}
```

Tailwind: `inline-flex items-center justify-center size-[28px] rounded-[5px] cursor-pointer text-muted bg-transparent border-0 T130 hover:bg-blue-bg hover:text-blue` · `.red` → `hover:bg-red-bg hover:text-red` · `.teal` → `hover:bg-teal-bg hover:text-teal` · `.action-grp` → `flex gap-[2px] items-center`. Ícones SVG 14×14 `stroke-width="2"`. Variante inline: botão "resolver" com `style="color:var(--green)"`.

**`.del-btn` (L376–378)**: `background:none;border:none;cursor:pointer;color:var(--muted-2);font-size:15px;line-height:1;padding:1px 5px;border-radius:3px;transition:color .13s` · hover `color:var(--red)` → `bg-transparent border-0 cursor-pointer text-muted-2 text-[15px] leading-none px-[5px] py-[1px] rounded-[3px] transition-colors duration-[130ms] ease-[ease] hover:text-red`.

**`.modal-x`** ver §17. **`.topbar-burger`** ver §21.

**`.tbl-link` (L241–242)**: `color:var(--blue);cursor:pointer;font-weight:500` · hover `text-decoration:underline` → `text-blue cursor-pointer font-medium hover:underline`.

**Link-ação "Ver todos →"** (dashboard, inline): `color:var(--blue);font-size:12px;cursor:pointer` → `text-blue text-[12px] cursor-pointer` (sem hover no protótipo).

---

## 3. Badges / pills / status chips

### 3.1 `.badge` (L202–212)

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 500;
  white-space: nowrap;
}
.badge::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.badge-blue {
  background: var(--blue-bg);
  color: var(--blue);
}
.badge-blue::before {
  background: var(--blue);
}
.badge-green {
  background: var(--green-bg);
  color: var(--green);
}
.badge-green::before {
  background: var(--green);
}
.badge-yellow {
  background: var(--yellow-bg);
  color: var(--yellow);
}
.badge-yellow::before {
  background: var(--yellow);
}
.badge-red {
  background: var(--red-bg);
  color: var(--red);
}
.badge-red::before {
  background: var(--red);
}
.badge-gray {
  background: var(--bg);
  color: var(--muted);
}
.badge-gray::before {
  background: var(--muted-2);
}
.badge-teal {
  background: var(--teal-bg);
  color: var(--teal);
}
.badge-teal::before {
  background: var(--teal);
}
.badge-purple {
  background: var(--purple-bg);
  color: var(--purple);
}
.badge-purple::before {
  background: var(--purple);
}
.badge-orange {
  background: var(--orange-bg);
  color: var(--orange);
}
.badge-orange::before {
  background: var(--orange);
}
```

Sem borda, sem hover. Atenção: `badge-yellow` usa texto `#F4CF3D` sobre `#FDF4DE` (contraste baixo) — é o que está no protótipo.

Tailwind (base): `inline-flex items-center gap-[5px] px-[9px] py-[3px] rounded-[20px] text-[11.5px] font-medium whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:shrink-0`

| Variante | Tailwind                                    |
| -------- | ------------------------------------------- |
| blue     | `bg-blue-bg text-blue before:bg-blue`       |
| green    | `bg-green-bg text-green before:bg-green`    |
| yellow   | `bg-yellow-bg text-yellow before:bg-yellow` |
| red      | `bg-red-bg text-red before:bg-red`          |
| gray     | `bg-canvas text-muted before:bg-muted-2`    |
| teal     | `bg-teal-bg text-teal before:bg-teal`       |
| purple   | `bg-purple-bg text-purple before:bg-purple` |
| orange   | `bg-orange-bg text-orange before:bg-orange` |

Mapeamentos de status do protótipo (para reusar semântica):

- `STATUS_CFG` (L4095): `pendente` → `badge-yellow` "⏳ Pendente"; `aprovado` → `badge-green` "✅ Aprovado"; `rejeitado` → `badge-red` "❌ Rejeitado".
- Perfis (tabela de usuários L2014–2067): Admin `badge-purple`, Planejador `badge-blue`, Área `badge-teal`, Visualizador `badge-gray`. Ciclo "Encerrado" → `badge-gray`.
- Modo (L4197): Molécula `badge-purple`, SKU `badge-blue` (com `style="font-size:11px"`).
- `ST_PLANO` (L6636): aprovado `--green`, revisão `--orange`, bloqueado `--red`, pendente `--muted` (usado como cor de texto/ponto, não como `.badge`).
- `INT_COR` intensidade 1–5 (L4102): `green, green, blue, orange, red`.

Variante "header" (L1818): `<span class="badge badge-yellow" style="font-size:12.5px;padding:5px 13px">2 pendentes</span>` → adicionar `text-[12.5px] px-[13px] py-[5px]`.

### 3.2 Pill de severidade (inline, `SEV_CFG` L6412)

Markup gerado: `font-size:11.5px;font-weight:600;padding:3px 10px;border-radius:20px;background:<bg>;color:<cor>;border:1px solid <bdr>` com texto `● <label>`.

| Severidade           | bg               | cor                  | borda               |
| -------------------- | ---------------- | -------------------- | ------------------- |
| critica "Crítica"    | `#FEF2F2`        | `var(--red)` #D63434 | `#FCA5A5`           |
| atencao "Atenção"    | `#FFFBEB`        | `#B45309`            | `#FCD34D`           |
| analise "Em análise" | `var(--blue-bg)` | `var(--blue)`        | `var(--blue-light)` |

Tailwind base: `text-[11.5px] font-semibold px-[10px] py-[3px] rounded-[20px] border` + `bg-[#FEF2F2] text-red border-[#FCA5A5]` / `bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]` / `bg-blue-bg text-blue border-blue-light`.

### 3.3 Tag neutra (inline, L6466 e L~4183)

`font-size:11.5px;font-weight:600;padding:2px 9px;border-radius:10px;background:var(--bg);border:1px solid var(--border);white-space:nowrap` → `text-[11.5px] font-semibold px-[9px] py-[2px] rounded-[10px] bg-canvas border border-border whitespace-nowrap` (a de "🔒 Em uso no Data Lake" usa `font-size:11px`, `color:var(--muted)`, `inline-flex items-center gap-[4px]`).

### 3.4 `.drv-badge` + categorias `.db-*` (L345–346, L410–423)

```css
.drv-badge {
  display: inline-block;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 10.5px;
  font-weight: 700;
  margin-bottom: 5px;
  border: 1px solid;
}
```

Tailwind: `inline-block rounded-[4px] px-[8px] py-[2px] text-[10.5px] font-bold mb-[5px] border`

| Classe        | bg        | borda      | texto     |
| ------------- | --------- | ---------- | --------- |
| `.db-tv`      | `#EEF2FF` | `#A5B4FC`  | `#4338CA` |
| `.db-digital` | `#F0FDF4` | `#86EFAC`  | `#166534` |
| `.db-pdv`     | `#FFFBEB` | `#FCD34D`  | `#92400E` |
| `.db-campo`   | blue-bg   | blue-light | blue      |
| `.db-medico`  | purple-bg | purple-b   | purple    |
| `.db-preco`   | red-bg    | red-b      | red       |
| `.db-conc`    | `#ECFEFF` | `#67E8F9`  | `#0E7490` |
| `.db-sazo`    | `#F0FDF4` | `#6EE7B7`  | `#065F46` |
| `.db-supply`  | orange-bg | `#FED7AA`  | orange    |
| `.db-canal`   | purple-bg | purple-b   | purple    |
| `.db-reg`     | teal-bg   | teal-light | teal      |
| `.db-viral`   | `#FDF2F8` | `#F0ABFC`  | `#86198F` |
| `.db-macro`   | purple-bg | purple-b   | purple    |
| `.db-outro`   | canvas    | border     | muted     |

Útil para mapear **canais de campanha** (TV/digital/PDV/campo etc.) no domínio de marketing.

### 3.5 `.tipo-badge` (L326–329)

`display:inline-flex;align-items:center;gap:6px;background:var(--blue-bg);border:1px solid var(--blue-light);border-radius:20px;padding:4px 13px;font-size:12.5px;font-weight:600;color:var(--blue);margin-top:6px` · `.dot{width:6px;height:6px;border-radius:50%;background:var(--blue)}`
→ `inline-flex items-center gap-[6px] bg-blue-bg border border-blue-light rounded-[20px] px-[13px] py-[4px] text-[12.5px] font-semibold text-blue mt-[6px]` · dot `size-[6px] rounded-full bg-blue`.

### 3.6 `.nav-badge` (contador da sidebar, L92–96)

`border-radius:20px;font-size:10px;padding:1px 7px;margin-left:auto;font-weight:700;color:#fff;white-space:nowrap` · cores `.nb-blue/.nb-teal/.nb-red/.nb-purple/.nb-orange/.nb-gray` = bg blue/teal/red/purple/orange/muted. Uso real costuma ser inline `style="background:var(--red)"`; variante "em breve": `background:#0891B2;font-size:9px`.
→ `rounded-[20px] text-[10px] px-[7px] py-[1px] ml-auto font-bold text-white whitespace-nowrap bg-red`.

### 3.7 `.ac-item-tag` (L505–506)

`font-size:10px;font-weight:600;padding:1px 7px;border-radius:8px;background:var(--bg);color:var(--muted);margin-left:auto;flex-shrink:0` → `text-[10px] font-semibold px-[7px] py-[1px] rounded-[8px] bg-canvas text-muted ml-auto shrink-0`.

### 3.8 Ponto de status (dashboard, inline L5005)

`width:9px;height:9px;border-radius:50%;background:<cor>;flex-shrink:0` → `size-[9px] rounded-full shrink-0`.

---

## 4. Chips / filtros / segmented

### `.chip` (L215–221)

```css
.chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 4px;
}
.chip {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 3px 10px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.13s;
  user-select: none;
  display: inline-flex;
  align-items: center;
}
.chip:hover {
  border-color: var(--blue);
  color: var(--blue);
}
.chip.sel {
  background: var(--blue-bg);
  border-color: var(--blue);
  color: var(--blue);
  font-weight: 600;
}
.chip.sel.teal {
  background: var(--teal-bg);
  border-color: var(--teal);
  color: var(--teal);
}
```

Tailwind:

- `.chips-wrap` → `flex flex-wrap gap-[5px] mt-[4px]`
- `.chip` → `inline-flex items-center bg-canvas border border-border rounded-[14px] px-[10px] py-[3px] text-[12px] text-muted cursor-pointer select-none T130 hover:border-blue hover:text-blue`
- `.sel` → `bg-blue-bg border-blue text-blue font-semibold` (usar `data-[selected=true]:` ou `aria-pressed:`)
- `.sel.teal` → `bg-teal-bg border-teal text-teal`

Barra de filtros por categoria (L1617): container inline `display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px` → `flex gap-[5px] flex-wrap mb-[14px]`.

```html
<div class="flex gap-[5px] flex-wrap mb-[14px]">
  <span class="chip sel">Todos</span><span class="chip">📡 Mídia</span
  ><span class="chip">🛒 Comercial</span>
</div>
```

### Segmented control

O equivalente no protótipo é `.tabs-pill` (§14) — definido no CSS, **sem uso** no markup. Segmented control como componente separado: **não existe no protótipo**.

### Botões de perfil `.rb-btn` (role bar, L43–49) — pill segmentado escuro

`padding:3px 12px;border-radius:20px;border:1px solid transparent;font-size:11px;cursor:pointer;transition:all .14s;font-weight:500;background:transparent;color:#64748B` · hover `color:#CBD5E1;background:var(--slate-2)` · active por papel: admin purple, planejador blue, area teal, viewer slate-3 (bg+border, texto #fff). Container `.rb-btns{display:flex;gap:3px}`.
→ `px-[12px] py-[3px] rounded-[20px] border border-transparent text-[11px] font-medium bg-transparent text-[#64748B] cursor-pointer T140 hover:text-[#CBD5E1] hover:bg-ink-2` · ativo `bg-blue border-blue text-white` (ou purple/teal/ink-3).

### Barra de filtros em card (Fila de Aprovação, inline L1830)

`display:grid;grid-template-columns:1fr auto auto auto auto;gap:10px;align-items:end;padding:14px 16px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-lg);margin-bottom:16px`
→ `grid grid-cols-[1fr_auto_auto_auto_auto] gap-[10px] items-end px-[16px] py-[14px] bg-white border border-border rounded-ds-lg mb-[16px]`. Cada filtro é `.form-group` com `margin:0`, label com `margin-bottom:4px`, `min-width` 130/130/160/140px. Abaixo: linha `flex items-center justify-between mb-[12px]` com contador (`text-[13px] text-muted`) e `btn btn-ghost btn-sm` "Limpar filtros". **Esse é o padrão mais próximo dos filtros canal/status/período da lista de campanhas.**

---

## 5. Formulários: inputs / selects / labels / form-grid / hints / erros

### CSS original (L157–177)

```css
.form-grid {
  display: grid;
  gap: 13px;
  margin-bottom: 16px;
}
.fg-2 {
  grid-template-columns: 1fr 1fr;
}
.fg-3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.fg-4 {
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
.fg-full {
  grid-column: 1/-1;
}
@media (max-width: 800px) {
  .fg-3,
  .fg-4 {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 560px) {
  .fg-2,
  .fg-3,
  .fg-4 {
    grid-template-columns: 1fr;
  }
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.req {
  color: var(--red);
}
.form-input,
.form-select,
.form-textarea {
  padding: 8px 11px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13.5px;
  outline: none;
  background: var(--white);
  font-family: inherit;
  color: var(--slate);
  transition:
    border 0.14s,
    box-shadow 0.14s;
  width: 100%;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(27, 78, 201, 0.1);
}
.form-textarea {
  resize: vertical;
  min-height: 72px;
}
.form-input[readonly] {
  background: var(--bg);
  color: var(--muted);
}
.form-hint {
  font-size: 11px;
  color: var(--muted-2);
  margin-top: 2px;
}
.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
```

### Tailwind 4

Breakpoints do protótipo são **max-width** (desktop-first): 800px e 560px. Em Tailwind 4 use `max-[800px]:` e `max-[560px]:`.

| Classe                                    | Tailwind                                                                                                                                                                                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.form-grid`                              | `grid gap-[13px] mb-[16px]`                                                                                                                                                                                                                          |
| `.fg-2`                                   | `grid-cols-2 max-[560px]:grid-cols-1`                                                                                                                                                                                                                |
| `.fg-3`                                   | `grid-cols-3 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1`                                                                                                                                                                                        |
| `.fg-4`                                   | `grid-cols-4 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1`                                                                                                                                                                                        |
| `.fg-full`                                | `col-span-full`                                                                                                                                                                                                                                      |
| `.form-group`                             | `flex flex-col gap-[5px]`                                                                                                                                                                                                                            |
| `.form-label`                             | `text-[11.5px] font-semibold text-muted uppercase tracking-[.04em]`                                                                                                                                                                                  |
| `.req`                                    | `text-red`                                                                                                                                                                                                                                           |
| `.form-input/.form-select/.form-textarea` | `w-full px-[11px] py-[8px] border border-border rounded-[6px] text-[13.5px] outline-none bg-white font-[inherit] text-ink transition-[border,box-shadow] duration-[140ms] ease-[ease] focus:border-blue focus:shadow-[0_0_0_3px_rgba(27,78,201,.1)]` |
| `.form-textarea` extra                    | `resize-y min-h-[72px]`                                                                                                                                                                                                                              |
| `[readonly]`                              | `read-only:bg-canvas read-only:text-muted`                                                                                                                                                                                                           |
| `.form-hint`                              | `text-[11px] text-muted-2 mt-[2px]`                                                                                                                                                                                                                  |
| `.form-actions`                           | `flex gap-[8px] justify-end pt-[14px] border-t border-border`                                                                                                                                                                                        |

Estados:

- **hover** de input: não existe no protótipo.
- **disabled**: não há estilo no CSS (o `<select id="sel-tipo" disabled>` usa o default do browser).
- **erro de validação** (borda vermelha, mensagem de erro): **não existe no protótipo**. O único elemento "vermelho" de formulário é o asterisco `.req`. Validações no JS usam `showToast(...)`.

Rótulo complementar inline (L733): `<span style="font-weight:400;color:var(--muted);font-size:11px">(máx. 1 ano…)</span>` → `font-normal text-muted text-[11px] normal-case`. Variante `(opcional)`: `<small style="font-weight:400;color:var(--muted)">`.

Input com sufixo (L1507): `flex items-center gap-[8px] max-w-[220px]` + input `text-right` + `<span class="text-[14px] font-semibold text-muted">%</span>`.

### Markup de exemplo

```html
<div class="form-grid fg-2">
  <div class="form-group">
    <label class="form-label"
      >Data Início <span class="req">*</span><span class="tip-wrap">…</span></label
    >
    <input class="form-input" type="date" />
    <span class="form-hint">Texto de ajuda</span>
  </div>
  <div class="form-group fg-full">
    <label class="form-label">Observações / contexto</label>
    <textarea class="form-textarea"></textarea>
  </div>
</div>
```

### Variante `.field` (form dinâmico, L308–320) — classe mais usada do arquivo (268 via JS)

```css
.g2,
.g3 {
  display: grid;
  gap: 14px;
}
.g2 {
  grid-template-columns: 1fr 1fr;
}
.g3 {
  grid-template-columns: 1fr 1fr 1fr;
}
@media (max-width: 720px) {
  .g3 {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 480px) {
  .g2,
  .g3 {
    grid-template-columns: 1fr;
  }
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field label {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.field input,
.field select,
.field textarea {
  display: block;
  width: 100%;
  padding: 8px 11px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: var(--white);
  font-family: inherit;
  color: var(--slate);
  transition:
    border 0.14s,
    box-shadow 0.14s;
}
.field input:focus,
… {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(27, 78, 201, 0.1);
}
.field input[readonly] {
  background: var(--bg);
  color: var(--muted);
  cursor: default;
}
.field select {
  cursor: pointer;
}
.field textarea {
  resize: vertical;
  min-height: 60px;
}
.card .g3 + .g3,
.card .g2 + .g3,
.card .g3 + .g2 {
  margin-top: 12px;
}
```

Diferenças vs. `.form-*`: label **10.5px / 700 / .06em** (vs 11.5px/600/.04em), input **13px** (vs 13.5px), textarea min-h **60px** (vs 72px), grid gap **14px** (vs 13px), breakpoints **720/480** (vs 800/560).
Tailwind: `.g3` → `grid gap-[14px] grid-cols-3 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1`; label → `block text-[10.5px] font-bold text-muted uppercase tracking-[.06em]`; input → igual ao `.form-input` mas `text-[13px]`, `read-only:cursor-default`.

### Busca `.search-*` (L247–252) + `.toolbar` (L245–246)

```css
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 13px;
  flex-wrap: wrap;
}
.toolbar-right {
  margin-left: auto;
  display: flex;
  gap: 6px;
}
.search-wrap {
  position: relative;
  min-width: 260px;
  max-width: 360px;
  flex: 1;
}
.search-icon {
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: var(--muted-2);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 7px 11px 7px 30px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: var(--white);
}
.search-input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(27, 78, 201, 0.1);
}
```

Tailwind: toolbar `flex items-center gap-[8px] mb-[13px] flex-wrap` · toolbar-right `ml-auto flex gap-[6px]` · wrap `relative min-w-[260px] max-w-[360px] flex-1` · ícone `absolute left-[9px] top-1/2 -translate-y-1/2 size-[14px] text-muted-2 pointer-events-none` · input `w-full pl-[30px] pr-[11px] py-[7px] border border-border rounded-[6px] text-[13px] outline-none bg-white focus:border-blue focus:shadow-[0_0_0_3px_rgba(27,78,201,.1)]` (sem transition no protótipo).
Select ao lado da busca: `class="form-select" style="width:auto;font-size:13px"` → `w-auto text-[13px]`.

```html
<div class="toolbar">
  <div class="search-wrap">
    <svg class="search-icon">…</svg
    ><input class="search-input" placeholder="Buscar produto, tipo, origem..." />
  </div>
  <select class="form-select" style="width:auto;font-size:13px">
    <option>Todas as categorias</option>
  </select>
</div>
<p style="font-size:13px;color:var(--muted);margin-bottom:12px">
  <strong>4 drivers</strong> ingeridos no Data Lake
</p>
```

### Toggle (L272–279)

```css
.toggle {
  position: relative;
  width: 38px;
  height: 21px;
  flex-shrink: 0;
}
.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.toggle-track {
  position: absolute;
  inset: 0;
  background: var(--border);
  border-radius: 20px;
  cursor: pointer;
  transition: 0.18s;
}
.toggle-track:before {
  content: '';
  position: absolute;
  width: 15px;
  height: 15px;
  left: 3px;
  top: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.18s;
}
.toggle input:checked + .toggle-track {
  background: var(--green);
}
.toggle input:checked + .toggle-track:before {
  transform: translateX(17px);
}
```

Tailwind: label `relative w-[38px] h-[21px] shrink-0` · input `peer absolute opacity-0 size-0` · track `absolute inset-0 bg-border rounded-[20px] cursor-pointer transition-all duration-[180ms] ease-[ease] peer-checked:bg-green before:content-[''] before:absolute before:size-[15px] before:left-[3px] before:top-[3px] before:bg-white before:rounded-full before:transition-all before:duration-[180ms] peer-checked:before:translate-x-[17px]`. Focus: não existe no protótipo.
Rótulo ao lado (tabela): `text-[12px] font-medium text-green` "Ativo" / `text-muted` "Inativo".

### Status field (L282–288)

`.status-field{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;background:var(--bg);border:1px solid var(--border);border-radius:8px;gap:14px}` · `.sf-info strong{font-size:13px;font-weight:500;color:var(--slate)}` · `.sf-info span{font-size:11.5px;color:var(--muted);display:block;margin-top:2px}` · `.sf-ctrl{display:flex;align-items:center;gap:9px;flex-shrink:0}` · `.sf-tag{font-size:12px;font-weight:500}`
→ `flex items-center justify-between px-[14px] py-[11px] bg-canvas border border-border rounded-ds gap-[14px]`; strong `text-[13px] font-medium text-ink`; span `block text-[11.5px] text-muted mt-[2px]`; ctrl `flex items-center gap-[9px] shrink-0`; tag `text-[12px] font-medium`.

### Range (L336–338)

`.range-row{display:flex;align-items:center;gap:10px;margin-top:3px}` · `input[type=range]{flex:1;accent-color:var(--blue)}` · `.range-val{min-width:18px;font-weight:700;color:var(--blue);font-size:15px}` → `flex items-center gap-[10px] mt-[3px]` · `flex-1 accent-blue` · `min-w-[18px] font-bold text-blue text-[15px]`.

### Autocomplete (L495–511)

```css
.ac-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-top: 2px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 50;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  display: none;
}
.ac-item {
  padding: 9px 12px;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 1px solid var(--bg);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.1s;
}
.ac-item:last-child {
  border-bottom: none;
}
.ac-item:hover,
.ac-item.active {
  background: var(--blue-bg);
}
.ac-loading,
.ac-empty {
  padding: 12px;
  text-align: center;
  color: var(--muted);
  font-size: 12.5px;
}
.ac-source {
  padding: 6px 12px;
  font-size: 10.5px;
  color: var(--muted);
  background: var(--bg);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 5px;
}
```

→ dropdown `absolute top-full inset-x-0 bg-white border border-border rounded-ds mt-[2px] max-h-[220px] overflow-y-auto z-50 shadow-[0_6px_24px_rgba(0,0,0,.12)]` · item `flex items-center gap-[8px] px-[12px] py-[9px] text-[13px] cursor-pointer border-b border-canvas last:border-b-0 transition-colors duration-100 ease-[ease] hover:bg-blue-bg data-[active=true]:bg-blue-bg` · loading/empty `p-[12px] text-center text-muted text-[12.5px]` · source `flex items-center gap-[5px] px-[12px] py-[6px] text-[10.5px] text-muted bg-canvas border-t border-border`.

---

## 6. Cards / painéis

### `.card` (L145–154)

```css
.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
}
.card-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--slate);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-title small {
  font-size: 11px;
  font-weight: 400;
  color: var(--muted);
  margin-left: auto;
}
.card-section-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--blue);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 12px 0 8px;
  border-bottom: 2px solid var(--blue-bg);
  margin-bottom: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}
```

Tailwind:

- `.card` → `bg-white border border-border rounded-ds-lg px-[22px] py-[20px] mb-[16px] shadow-ds-sm`
- `.card-title` → `flex items-center gap-[8px] text-[13.5px] font-semibold text-ink mb-[16px] pb-[12px] border-b border-border`
- `.card-title small` → `ml-auto text-[11px] font-normal text-muted`
- `.card-section-label` → `flex items-center gap-[6px] text-[10.5px] font-bold text-blue uppercase tracking-[.08em] pt-[12px] pb-[8px] border-b-2 border-blue-bg mb-[13px]`
- hover: **não existe** no `.card`.

Número de etapa no título (inline L707): `background:var(--blue-bg);color:var(--blue);border-radius:6px;padding:2px 10px;font-size:11px;font-weight:700` → `bg-blue-bg text-blue rounded-[6px] px-[10px] py-[2px] text-[11px] font-bold`.

```html
<div class="card">
  <div class="card-title">
    <span class="…step">01</span> Identificação do Evento <small>Selecione o nível…</small>
  </div>
  …
</div>
```

**Card de dashboard (painel com rótulo)** — inline L2823: `.card` com `padding:16px 18px` + rótulo `font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px`.
→ `card px-[18px] py-[16px]` + `text-[11px] font-bold text-muted uppercase tracking-[.06em] mb-[12px]`. Header com link: `flex items-center justify-between mb-[12px]`.

### Variações de card

| Classe                        | CSS                                                                                                                                                                                                                                                             | Tailwind                                                                                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.dyn-card` (L330–335)        | `bg white; border 1px border; radius 10px; padding 18px 20px; mb 14px; border-left 3px solid blue; shadow-sm`                                                                                                                                                   | `bg-white border border-border border-l-[3px] border-l-blue rounded-[10px] px-[20px] py-[18px] mb-[14px] shadow-ds-sm`                                                                       |
| `.dyn-title`                  | `10.5px/700 blue uppercase .08em; mb 14px; flex gap 6px; pb 10px; border-bottom 1px blue-bg`                                                                                                                                                                    | `flex items-center gap-[6px] text-[10.5px] font-bold text-blue uppercase tracking-[.08em] mb-[14px] pb-[10px] border-b border-blue-bg`                                                       |
| `.drv-item` (L341–348)        | `bg white; border; radius 8px; padding 13px 15px; flex between start; gap 10px; mb 8px; transition border .13s` · hover `border-color blue-light`                                                                                                               | `flex justify-between items-start gap-[10px] bg-white border border-border rounded-ds px-[15px] py-[13px] mb-[8px] transition-[border] duration-[130ms] hover:border-blue-light`             |
| `.drv-info`                   | `12.5px muted lh 1.65`; strong `slate`                                                                                                                                                                                                                          | `text-[12.5px] text-muted leading-[1.65] [&_strong]:text-ink`                                                                                                                                |
| `.aprov-card` (L447–462)      | `bg white; border; radius 16px; padding 18px 20px; mb 14px; transition border .14s` · hover `blue-light` · `.aprovado{opacity:.45;pointer-events:none}`                                                                                                         | `bg-white border border-border rounded-ds-lg px-[20px] py-[18px] mb-[14px] transition-[border] duration-[140ms] hover:border-blue-light`                                                     |
| `.analise-section` (L465–466) | `bg white; border; radius 10px; padding 16px 18px; mb 12px` · title `11px/700 orange uppercase .07em; mb 10px; pb 8px; border-bottom 2px #FFF7ED`                                                                                                               | `bg-white border border-border rounded-[10px] px-[18px] py-[16px] mb-[12px]` · `text-[11px] font-bold text-orange uppercase tracking-[.07em] mb-[10px] pb-[8px] border-b-2 border-[#FFF7ED]` |
| `.analise-card` (L472–473)    | `radius 10px; padding 14px 18px; mb 10px; cursor pointer` · hover `border orange`                                                                                                                                                                               | `… rounded-[10px] px-[18px] py-[14px] mb-[10px] cursor-pointer hover:border-orange`                                                                                                          |
| `.modelo-card` (L474–477)     | `bg bg; border 2px border; radius 10px; padding 14px; relative; transition all .14s` · hover border orange · `.selected{border orange;bg #FFF7ED}` · `.modelo-check` 18px circle border 2px, top/right 10px, font 10px; selected → bg/border orange, texto #fff | `relative bg-canvas border-2 border-border rounded-[10px] p-[14px] cursor-pointer T140 hover:border-orange data-[selected=true]:border-orange data-[selected=true]:bg-[#FFF7ED]`             |

Internos do `.aprov-card`:

- `.aprov-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap}` → `flex items-center gap-[10px] mb-[14px] flex-wrap`
- `.aprov-cod{font-family:monospace;font-size:12.5px;font-weight:700;color:var(--blue)}` → `font-mono text-[12.5px] font-bold text-blue`
- `.aprov-meta{font-size:12px;color:var(--muted);margin-left:auto}` → `text-[12px] text-muted ml-auto`
- `.aprov-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:16px;margin-bottom:12px}` + `@media(max-width:800px){1fr 1fr}` → `grid grid-cols-[2fr_1fr_1fr_1fr] gap-[16px] mb-[12px] max-[800px]:grid-cols-2`
- `.aprov-label{10.5px/700 muted uppercase .06em; mb 3px}` → `text-[10.5px] font-bold text-muted uppercase tracking-[.06em] mb-[3px]`
- `.aprov-val{13px slate 500 lh 1.5}` → `text-[13px] text-ink font-medium leading-[1.5]`
- `.aprov-justif{12.5px; padding 9px 13px; bg bg; border-left 3px border; radius 0 6px 6px 0; slate-3; lh 1.65; mb 13px}` → `text-[12.5px] px-[13px] py-[9px] bg-canvas border-l-[3px] border-border rounded-r-[6px] text-ink-3 leading-[1.65] mb-[13px]`
- `.aprov-actions{display:flex;gap:8px;align-items:center}`
- Card decidido (inline): `border-left:3px solid var(--green)` (aprovado) ou `var(--red)` (rejeitado).

**Este padrão é o mais indicado para o "Detalhe da campanha" (label/valor em grid 2fr 1fr 1fr 1fr).**

---

## 7. KPI / stat cards (`.dash-card`, L479–483)

```css
.dash-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 20px;
  cursor: pointer;
  transition: box-shadow 0.14s;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.dash-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.dash-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-bottom: 4px;
}
.dash-card-val {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
}
.dash-card-lbl {
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 500;
}
```

Grid dos KPIs (inline L2821): `display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px` → `grid grid-cols-4 gap-[14px] mb-[20px]` (sem breakpoint responsivo no protótipo).
Sub-linha (inline): `font-size:11.5px;margin-top:2px` com `<span style="color:<cor>;font-weight:600">`.

Tailwind:

- card → `flex flex-col gap-[5px] bg-white border border-border rounded-[10px] px-[20px] py-[18px] cursor-pointer transition-shadow duration-[140ms] ease-[ease] hover:shadow-[0_4px_16px_rgba(0,0,0,.1)]` (sem sombra em repouso)
- ícone → `size-[36px] rounded-[9px] flex items-center justify-center text-[18px] mb-[4px]`
- valor → `text-[26px] font-extrabold leading-[1.1]` + cor
- rótulo → `text-[12.5px] text-muted font-medium`
- sub → `text-[11.5px] mt-[2px]`

Paleta real dos 4 KPIs (L4936–4939):

| KPI                    | bg do ícone | cor do valor | cor da sub |
| ---------------------- | ----------- | ------------ | ---------- |
| 📥 Drivers no pipeline | `#EEF3FF`   | blue         | yellow     |
| ⚠️ Restrições ativas   | `#FEF2F2`   | red          | red        |
| 📋 Itens no plano      | `#F0FDF4`   | green        | green      |
| 🔬 Análises            | `#FFF7ED`   | orange       | green      |

```html
<div class="dash-card">
  <div class="dash-card-icon" style="background:#EEF3FF">📥</div>
  <div class="dash-card-val" style="color:var(--blue)">12</div>
  <div class="dash-card-lbl">Drivers no pipeline</div>
  <div style="font-size:11.5px;margin-top:2px">
    <span style="color:var(--yellow);font-weight:600">2 pendentes</span>
  </div>
</div>
```

Variação/tendência (setas ↑↓, delta %): **não existe no protótipo**. Sparkline: **não existe no protótipo**.

---

## 8. Tabelas (L224–242, `.inline-table` L370–378)

Não existe `.table` nem `.tbl` no protótipo — a tabela é estilizada por **seletores de elemento** (`table`, `thead tr`, `th`, `td`) dentro de `.table-wrap`.

```css
.table-wrap {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow-x: auto;
  box-shadow: var(--shadow-sm);
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
}
thead tr {
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}
th {
  padding: 10px 14px;
  text-align: left;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
  letter-spacing: 0.02em;
}
td {
  padding: 12px 14px;
  font-size: 13px;
  border-bottom: 1px solid var(--bg);
  vertical-align: middle;
}
tr:last-child td {
  border-bottom: none;
}
tbody tr:hover {
  background: #fafbfc;
}
.td-mono {
  font-family: monospace;
  font-size: 12px;
}
```

Tailwind:

- wrapper → `bg-white border border-border rounded-ds-lg overflow-x-auto shadow-ds-sm`
- table → `w-full border-collapse min-w-[560px]`
- thead tr → `border-b border-border bg-canvas`
- th → `px-[14px] py-[10px] text-left text-[11.5px] font-semibold text-muted whitespace-nowrap tracking-[.02em]` (**não** é uppercase)
- td → `px-[14px] py-[12px] text-[13px] border-b border-canvas align-middle` · última linha `[&_tr:last-child_td]:border-b-0`
- tbody tr → `hover:bg-[#FAFBFC]` (sem transition)
- `.td-mono` → `font-mono text-[12px]` (código/ID usa ainda inline `color:var(--blue)`)
- **Zebra: não existe no protótipo.**
- **Células numéricas** (alinhamento à direita/tabular-nums): **não existe classe**; colunas booleanas usam inline `text-align:center` com `✓` (`color:var(--green);font-size:15px`) ou `—` (`color:var(--muted-2);font-size:13px`).
- Padrões inline de célula: célula dupla `<div style="font-weight:500">Nome</div><div style="font-size:11px;color:var(--muted)">SKU-00312</div>`; célula secundária `font-size:12px;color:var(--muted)`.
- Ordenação: o JS tem `planoSortCol`/`planoSortAsc` (L6633), estilo do cabeçalho ordenável inline nas linhas de render do plano.
- Ações: última coluna com `.action-grp` + `.action-btn` (§2).

```html
<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Produto</th>
        <th>Tipo</th>
        <th>Período</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="td-mono" style="color:var(--blue)">DRV-2026-029</td>
        <td>
          <div style="font-weight:500">Baricitinibe 2mg</div>
          <div style="font-size:11px;color:var(--muted)">SKU-00312</div>
        </td>
        <td><span class="drv-badge db-supply">⚗️ Falta MP</span></td>
        <td style="font-size:12px">…</td>
        <td>
          <div class="action-grp">
            <button class="action-btn" title="Editar"><svg width="14" height="14">…</svg></button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### `.inline-table` (tabela dentro de card)

`width:100%;border-collapse:collapse;font-size:12.5px` · th `padding:7px 11px;text-align:left;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--border);background:var(--bg)` · td `padding:8px 11px;border-bottom:1px solid #F1F5F9;vertical-align:middle` · última linha sem borda.
→ th `px-[11px] py-[7px] text-left text-[10.5px] font-bold text-muted uppercase tracking-[.04em] border-b border-border bg-canvas` · td `px-[11px] py-[8px] border-b border-[#F1F5F9] align-middle`.

Contador acima da tabela (padrão recorrente): `<p style="font-size:13px;color:var(--muted);margin-bottom:12px"><strong>4 usuários</strong> cadastrados</p>` → `text-[13px] text-muted mb-[12px]`.

---

## 9. Cabeçalho de página `.page-hdr` (L129–134)

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

Tailwind: `flex items-start justify-between gap-[12px] mb-[18px] flex-wrap` · título `text-[18px] font-bold text-ink leading-[1.2]` · sub `text-[12.5px] text-muted mt-[3px]` · ações `flex gap-[8px] flex-wrap items-center`. `.page-hdr-left` não tem estilo.

```html
<div class="page-hdr">
  <div class="page-hdr-left">
    <div class="page-title">Dashboard — Demand Intelligence</div>
    <div class="page-sub">Visão geral do ciclo ativo · PLP-2026-07</div>
  </div>
  <div class="page-hdr-actions">
    <span style="font-size:12px;color:var(--muted)">Atualizado em <strong>…</strong></span>
  </div>
</div>
```

Breadcrumb in-page (L1612): `display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--muted);margin-bottom:10px` com `.tbl-link` + chevron + `<span style="color:var(--slate);font-weight:500">` → `flex items-center gap-[5px] text-[12.5px] text-muted mb-[10px]`. Botão "← Voltar" = `btn btn-ghost btn-sm` com `margin-bottom:16px`.

---

## 10. `.screen-desc` — bloco explicativo com ícone (L137–142)

```css
.screen-desc {
  display: flex;
  gap: 9px;
  padding: 11px 15px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 18px;
  font-size: 12.5px;
  color: var(--slate-3);
  line-height: 1.65;
}
.screen-desc-icon {
  font-size: 15px;
  flex-shrink: 0;
  margin-top: 1px;
}
.screen-desc strong {
  color: var(--slate);
  font-weight: 600;
}
.screen-desc em {
  color: var(--blue);
  font-style: normal;
  font-weight: 500;
}
```

Tailwind: `flex gap-[9px] px-[15px] py-[11px] bg-canvas border border-border rounded-ds mb-[18px] text-[12.5px] text-ink-3 leading-[1.65] [&_strong]:text-ink [&_strong]:font-semibold [&_em]:text-blue [&_em]:not-italic [&_em]:font-medium` · ícone `text-[15px] shrink-0 mt-[1px]` (ícone é emoji: 📋 📦 📚 🔧 ✅…).

```html
<div class="screen-desc">
  <span class="screen-desc-icon">📋</span>
  <div>
    <strong>Frase principal em negrito.</strong> Texto explicativo… <em>termo destacado</em>.
  </div>
</div>
```

Presente em 19 telas — sempre logo após `.page-hdr`.

---

## 11. Alerts / banners (L291–297)

```css
.alert {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 14px;
  font-size: 12.5px;
  line-height: 1.6;
}
.alert-info {
  background: var(--blue-bg);
  border: 1px solid var(--blue-light);
  color: var(--blue);
}
.alert-warning {
  background: var(--yellow-bg);
  border: 1px solid var(--yellow-b);
  color: #92400e;
}
.alert-success {
  background: var(--green-bg);
  border: 1px solid var(--green-b);
  color: #14532d;
}
.alert-danger {
  background: var(--red-bg);
  border: 1px solid var(--red-b);
  color: #991b1b;
}
```

Tailwind base: `flex items-start gap-[9px] px-[14px] py-[10px] rounded-ds mb-[14px] text-[12.5px] leading-[1.6]`

- info `bg-blue-bg border border-blue-light text-blue`
- warning `bg-yellow-bg border border-yellow-b text-[#92400E]`
- success `bg-green-bg border border-green-b text-[#14532D]`
- danger `bg-red-bg border border-red-b text-[#991B1B]`

Ícone: SVG 14×14 `stroke="currentColor" stroke-width="2"`. Sem botão de fechar (dismiss): **não existe no protótipo**.

```html
<div class="alert alert-info" style="margin-bottom:12px">
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    …
  </svg>
  <span><strong>Apsen PLP Agent:</strong> texto…</span>
</div>
```

**Banner de perfil do dashboard** (inline L2819 + `BANNER_CFG` L4904): `margin-bottom:14px;padding:10px 16px;border-radius:8px;font-size:13px;line-height:1.5;border:1px solid` → `mb-[14px] px-[16px] py-[10px] rounded-ds text-[13px] leading-[1.5] border`. Cores: Planejador bg `#EEF3FF` / cor blue / borda `#C7D7FA`; Área bg `#F0FDFA` / `#0891B2` / `#99F6E4`; Visualizador bg canvas / muted / border; Admin `#F3E8FF`/`#7C3AED`/`#DDD6FE` (oculto). Prefixo "🔑 ".

**Caixa de legenda** (inline L1502): `font-size:11.5px;color:var(--muted);margin-top:6px;line-height:1.5;padding:7px 10px;background:var(--bg);border-radius:6px;border-left:3px solid var(--blue)` → `text-[11.5px] text-muted mt-[6px] leading-[1.5] px-[10px] py-[7px] bg-canvas rounded-[6px] border-l-[3px] border-blue`.

**Export box** (L351–353): `background:var(--slate);border-radius:8px;padding:14px;font-family:'Courier New',monospace;font-size:11.5px;color:#7DD3FC;max-height:360px;overflow-y:auto;white-space:pre;line-height:1.5` → `bg-ink rounded-ds p-[14px] font-['Courier_New',monospace] text-[11.5px] text-[#7DD3FC] max-h-[360px] overflow-y-auto whitespace-pre leading-[1.5]`.

---

## 12. Empty states (L356–359) e Acesso negado (L404–407)

```css
.empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--muted);
}
.empty-icon {
  font-size: 36px;
  margin-bottom: 10px;
}
.empty p {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--slate);
  margin-bottom: 4px;
}
.empty small {
  font-size: 12px;
}
.access-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 10px;
  text-align: center;
  color: var(--muted);
}
.access-denied .lock {
  font-size: 44px;
  margin-bottom: 8px;
}
.access-denied h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--slate);
}
```

Tailwind: `.empty` → `text-center px-[24px] py-[48px] text-muted` · ícone `text-[36px] mb-[10px]` · p `text-[13.5px] font-medium text-ink mb-[4px]` · small `text-[12px]`.
`.access-denied` → `flex flex-col items-center justify-center h-[60vh] gap-[10px] text-center text-muted` · lock `text-[44px] mb-[8px]` · h3 `text-[16px] font-semibold text-ink`.

```html
<div class="empty">
  <div class="empty-icon">📋</div>
  <p>Nenhum registro ainda</p>
  <small>Vá para <strong>Registrar Driver</strong> e adicione o primeiro driver.</small>
</div>
```

Empty inline em painel (dashboard): `text-align:center;padding:20px;color:var(--muted);font-size:13px` "✅ Nenhuma restrição ativa".

---

## 13. Loading / skeleton

- **Skeleton: não existe no protótipo.**
- **Spinner: não existe no protótipo.**
- Único estado de carregamento: `.ac-loading` do autocomplete — `padding:12px;text-align:center;color:var(--muted);font-size:12.5px` (texto, sem animação) → `p-[12px] text-center text-muted text-[12.5px]`.

---

## 14. Barras de progresso / medidores

### `.progress-*` (L299–300) — definido, **sem uso** no markup/JS

`.progress-track{background:var(--border);border-radius:4px;height:7px;width:100%;overflow:hidden}` · `.progress-fill{height:100%;border-radius:4px;transition:width .4s}`
→ `bg-border rounded-[4px] h-[7px] w-full overflow-hidden` · `h-full rounded-[4px] transition-[width] duration-[400ms] ease-[ease]`.

### Barras horizontais do dashboard `.dash-bar-*` (L484–487) — **em uso**

```css
.dash-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 9px;
  font-size: 12.5px;
}
.dash-bar-lbl {
  width: 110px;
  color: var(--slate);
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dash-bar-track {
  flex: 1;
  height: 7px;
  background: var(--bg);
  border-radius: 4px;
  overflow: hidden;
}
.dash-bar-fill {
  height: 100%;
  border-radius: 4px;
}
```

- valor à direita inline: `width:24px;text-align:right;font-size:12px;color:var(--muted)`.
  Tailwind: row `flex items-center gap-[10px] mb-[9px] text-[12.5px]` · lbl `w-[110px] text-ink font-medium shrink-0 truncate` · track `flex-1 h-[7px] bg-canvas rounded-[4px] overflow-hidden` · fill `h-full rounded-[4px]` (largura/cor inline) · valor `w-[24px] text-right text-[12px] text-muted`.
  Cores das barras (L4952–4957): `#3B82F6`, `#F59E0B`, `#EF4444`, `#8B5CF6`, `#10B981`, `#6366F1`.

### Mini-barra de status (dashboard "Plano — Status", L5004–5010)

Linha `display:flex;align-items:center;gap:10px;margin-bottom:10px` · ponto 9px · label `font-size:13px;flex:1` · número `font-size:13px;font-weight:600;color:<cor>` · trilho `width:70px;height:5px;background:var(--bg);border-radius:3px;overflow:hidden` · % `font-size:11px;color:var(--muted);min-width:28px;text-align:right` · rodapé `padding-top:8px;border-top:1px solid var(--border);font-size:12px;color:var(--muted)`.
→ trilho `w-[70px] h-[5px] bg-canvas rounded-[3px] overflow-hidden`.

### `.impact-bar` (L469): `height:6px;border-radius:3px;flex-shrink:0` · `.impact-item{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--bg);font-size:13px}` (última sem borda).

### Lista de pendências `.dash-pend-item` (L488–489)

`display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bg);font-size:13px` (última sem borda) → `flex items-center gap-[10px] py-[8px] border-b border-canvas text-[13px] last:border-b-0`. Código: `font-family:monospace;font-size:11px;color:var(--blue);font-weight:600;min-width:95px`.

Medidor circular / gauge: **não existe no protótipo**.

---

## 15. Tabs (L390–401)

```css
.tabs-pill {
  display: flex;
  background: var(--border);
  border-radius: 6px;
  padding: 3px;
  margin-bottom: 18px;
  width: fit-content;
}
.tab-pill {
  padding: 6px 22px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--muted);
  transition: all 0.14s;
}
.tab-pill.active {
  background: var(--white);
  color: var(--slate);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.tabs-line {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 18px;
}
.tab-line {
  padding: 9px 18px;
  cursor: pointer;
  font-size: 13px;
  color: var(--muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.14s;
  white-space: nowrap;
}
.tab-line.active {
  color: var(--blue);
  border-bottom-color: var(--blue);
  font-weight: 500;
}
.tab-content {
  display: none;
}
.tab-content.active {
  display: block;
}
```

Tailwind:

- `.tabs-pill` → `flex bg-border rounded-[6px] p-[3px] mb-[18px] w-fit` · `.tab-pill` → `px-[22px] py-[6px] rounded-[4px] cursor-pointer text-[13px] text-muted T140` · ativo `bg-white text-ink font-medium shadow-[0_1px_3px_rgba(0,0,0,.1)]`
- `.tabs-line` → `flex border-b border-border mb-[18px]` · `.tab-line` → `px-[18px] py-[9px] cursor-pointer text-[13px] text-muted border-b-2 border-transparent -mb-px T140 whitespace-nowrap` · ativo `text-blue border-blue font-medium`
- hover de aba: **não existe no protótipo**.

**Uso real (Restrições, inline L2590–2604)** — variante de `tabs-line` com contador e cor por aba:

- container `display:flex;border-bottom:1px solid var(--border);margin-bottom:16px`
- aba `padding:9px 20px;cursor:pointer;font-size:13px;border-bottom:2px solid transparent;margin-bottom:-1px`; ativa "Ativas" `font-weight:500;color:var(--red);border-bottom:2px solid var(--red)`; ativa "Resolvidas" usa `var(--blue)`; inativa `color:var(--muted)`.
- contador ativo `background:var(--red);color:#fff;border-radius:10px;font-size:10px;padding:1px 7px;font-weight:700;margin-left:4px`; inativo `background:var(--border);color:var(--muted);…;font-weight:600`.
  → aba `px-[20px] py-[9px] cursor-pointer text-[13px] border-b-2 border-transparent -mb-px` · contador `rounded-[10px] text-[10px] px-[7px] py-[1px] font-bold ml-[4px] bg-red text-white`.

---

## 16. Paginação (L381–388)

```css
.pag {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 0 2px;
  flex-wrap: wrap;
}
.pag-info {
  font-size: 12px;
  color: var(--muted);
  margin-right: 6px;
}
.pag-btn {
  min-width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}
.pag-btn:hover:not(.active) {
  background: var(--blue-bg);
  color: var(--blue);
}
.pag-btn.active {
  background: var(--blue);
  color: #fff;
  font-weight: 600;
}
.pag-btn.nav {
  border-radius: 6px;
  padding: 0 8px;
  font-size: 14px;
}
```

Tailwind: `.pag` → `flex items-center gap-[5px] pt-[12px] pb-[2px] flex-wrap` (uso real: `justify-center pt-[16px]`) · info `text-[12px] text-muted mr-[6px]` · btn `min-w-[30px] h-[30px] rounded-full border-0 bg-transparent text-[13px] cursor-pointer text-muted flex items-center justify-center font-[inherit] hover:bg-blue-bg hover:text-blue` · ativo `bg-blue text-white font-semibold hover:bg-blue hover:text-white` · nav (‹ ›) `rounded-[6px] px-[8px] text-[14px]` · disabled (inline) `disabled:opacity-[.35]` · reticências `<span class="pag-btn" style="cursor:default">…</span>`.
Lógica (L4218–4228): "Página X de Y", ‹, 1, …, p−1, p, p+1, …, último, ›; oculto se `totalPag<=1`.

---

## 17. Modais (L255–270)

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.42);
  z-index: 9000;
  display: none;
  align-items: center;
  justify-content: center;
}
.modal-overlay.open {
  display: flex;
}
.modal {
  background: var(--white);
  border-radius: var(--radius-lg);
  width: 500px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
}
.modal.modal-lg {
  width: 680px;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 13px;
  border-bottom: 1px solid var(--border);
}
.modal-head h3 {
  font-size: 14.5px;
  font-weight: 600;
}
.modal-x {
  cursor: pointer;
  color: var(--muted);
  font-size: 17px;
  background: none;
  border: none;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
}
.modal-x:hover {
  background: var(--bg);
  color: var(--slate);
}
.modal-body {
  padding: 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.modal-foot {
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
```

Tailwind:

- overlay → `fixed inset-0 bg-[rgba(15,23,42,.42)] z-[9000] hidden items-center justify-center data-[open=true]:flex`
- modal → `bg-white rounded-ds-lg w-[500px] max-w-[95vw] max-h-[90vh] flex flex-col shadow-[0_20px_40px_rgba(0,0,0,.18)]` · lg `w-[680px]` · variantes inline `max-width:620px` / `720px`
- head → `flex items-center justify-between px-[20px] pt-[16px] pb-[13px] border-b border-border` · h3 `text-[14.5px] font-semibold`
- x → `cursor-pointer text-muted text-[17px] bg-transparent border-0 px-[6px] py-[2px] rounded-[4px] leading-none hover:bg-canvas hover:text-ink` (caractere "✕")
- body → `px-[20px] py-[18px] overflow-y-auto flex flex-col gap-[13px]` · texto introdutório inline `font-size:13px;color:var(--muted);line-height:1.55`
- foot → `px-[20px] py-[12px] border-t border-border flex gap-[8px] justify-end` (botões `btn-sm`)
- Animação de entrada: **não existe no protótipo** (só display none/flex). Fecha clicando no overlay.

```html
<div class="modal-overlay open">
  <div class="modal">
    <div class="modal-head">
      <h3>Importar Catálogo de Tipos</h3>
      <button class="modal-x">✕</button>
    </div>
    <div class="modal-body">
      <p style="font-size:13px;color:var(--muted);line-height:1.55">…</p>
      <div class="form-group">
        <label class="form-label">JSON do catálogo</label
        ><textarea class="form-textarea" rows="6"></textarea>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost btn-sm">Cancelar</button>
      <button class="btn btn-teal btn-sm">Importar</button>
    </div>
  </div>
</div>
```

---

## 18. Toast (L362–367)

```css
.toast {
  position: fixed;
  bottom: 22px;
  right: 22px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 11px 15px;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  z-index: 99999;
  transform: translateY(12px);
  opacity: 0;
  transition: all 0.22s;
  pointer-events: none;
}
.toast.show {
  transform: translateY(0);
  opacity: 1;
}
```

Tailwind: `fixed bottom-[22px] right-[22px] bg-white border border-border rounded-ds px-[15px] py-[11px] shadow-ds-md flex items-center gap-[9px] text-[13px] z-[99999] translate-y-[12px] opacity-0 transition-all duration-[220ms] ease-[ease] pointer-events-none data-[show=true]:translate-y-0 data-[show=true]:opacity-100`.
Comportamento (L3993): um único toast, mensagem trocada, some após **3000ms**. Variantes de cor (sucesso/erro): **não existem** — o tipo é indicado por emoji no texto ("✅ Tipo salvo!").

```html
<div class="toast show"><span id="toast-msg">✅ Catálogo importado!</span></div>
```

---

## 19. Tooltip (L426–444) — 29 ocorrências

```css
.tip-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  vertical-align: middle;
  cursor: help;
}
.tip-icon {
  width: 14px;
  height: 14px;
  color: var(--muted-2);
  flex-shrink: 0;
  transition: color 0.14s;
  display: inline-block;
}
.tip-wrap:hover .tip-icon {
  color: var(--blue);
}
.tip-box {
  display: none;
  position: absolute;
  left: 50%;
  top: calc(100% + 8px);
  transform: translateX(-50%);
  width: 290px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.65;
  padding: 11px 14px;
  border-radius: 8px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
  z-index: 9000;
  pointer-events: none;
  font-style: normal;
  text-transform: none;
  letter-spacing: 0;
  white-space: normal;
}
.tip-box::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-bottom-color: #1e293b;
}
.tip-wrap:hover .tip-box {
  display: block;
}
.tip-box strong {
  color: #f8fafc;
  font-weight: 600;
}
.tip-box em {
  color: #7dd3fc;
  font-style: normal;
}
```

Tailwind:

- wrap → `group relative inline-flex items-center ml-[4px] align-middle cursor-help`
- ícone → `inline-block size-[14px] text-muted-2 shrink-0 transition-colors duration-[140ms] ease-[ease] group-hover:text-blue`
- box → `hidden group-hover:block absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 w-[290px] bg-[#1E293B] text-[#CBD5E1] text-[12px] font-normal leading-[1.65] px-[14px] py-[11px] rounded-ds shadow-[0_8px_28px_rgba(0,0,0,.28)] z-[9000] pointer-events-none not-italic normal-case tracking-normal whitespace-normal before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[5px] before:border-transparent before:border-b-[#1E293B] [&_strong]:text-[#F8FAFC] [&_strong]:font-semibold [&_em]:text-[#7DD3FC] [&_em]:not-italic`
- Sempre abre **abaixo**, centralizado; sem delay; sem foco por teclado (focus: não existe no protótipo).

Ícone SVG (exato):

```html
<span class="tip-wrap"
  ><svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8.5" />
    <line x1="12" y1="11" x2="12" y2="16" /></svg
  ><span class="tip-box"
    ><strong>Título.</strong><br /><br /><em>Boas práticas:</em><br />✓ …</span
  ></span
>
```

Também há tooltip nativo `title="Editar"` nos `.action-btn`.

---

## 20. Avatares

Só existe `.topbar-avatar` (L112–113):
`width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:700;color:#fff;cursor:pointer;flex-shrink:0` — cor de fundo inline por perfil (`var(--purple)` Admin; demais papéis seguem as cores do `.rb-btn.active`: blue/teal/slate-3).
→ `size-[30px] rounded-full flex items-center justify-center text-[11.5px] font-bold text-white cursor-pointer shrink-0 bg-purple`.
Nome ao lado: `.topbar-name{font-size:13px;font-weight:600;color:var(--slate)}` → `text-[13px] font-semibold text-ink`.
Ponto do usuário na role bar `.rb-dot{width:6px;height:6px;border-radius:50%}`.
Avatar com imagem, grupo de avatares, tamanhos alternativos: **não existem no protótipo**. Tabela de usuários não usa avatar (só nome em `font-weight:500`).

---

## 21. Shell: sidebar / topbar / role bar (referência rápida)

| Elemento                      | CSS-chave                                                                                                                         | Tailwind                                                                                                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.role-bar`                   | fixed top 0, h 34px, bg slate #141414, flex, px 16px, gap 10px, z 60                                                              | `fixed inset-x-0 top-0 h-[34px] bg-ink flex items-center px-[16px] gap-[10px] z-[60]`                                                                                                                                             |
| `.rb-label`                   | 10.5px #8A8A8A .05em, mr 4px                                                                                                      | `text-[10.5px] text-[#8A8A8A] tracking-[.05em] whitespace-nowrap mr-[4px]`                                                                                                                                                        |
| `.rb-sep`                     | 1×16px bg slate-2, mx 6px                                                                                                         | `w-px h-[16px] bg-ink-2 mx-[6px]`                                                                                                                                                                                                 |
| `.rb-hint`                    | ml auto, 10px #334155 italic                                                                                                      | `ml-auto text-[10px] text-[#334155] italic`                                                                                                                                                                                       |
| `.sidebar`                    | w 252px, bg white, border-r, fixed left 0 top 34px, h calc(100vh−34px), flex col, z 30, overflow-y auto, transition transform .2s | `fixed left-0 top-[34px] w-[252px] h-[calc(100vh-34px)] bg-white border-r border-border flex flex-col z-30 overflow-y-auto transition-transform duration-200 ease-[ease]`                                                         |
| `.sidebar-logo`               | h 64px, px 18px, flex, gap 10px, border-b                                                                                         | `h-[64px] px-[18px] flex items-center gap-[10px] border-b border-border shrink-0`                                                                                                                                                 |
| `.logo-icon`                  | 28px, radius 6px, bg blue                                                                                                         | `size-[28px] rounded-[6px] bg-blue flex items-center justify-center shrink-0`                                                                                                                                                     |
| `.logo-txt strong` / `span`   | 12px/700 slate lh 1.2 / 10px muted                                                                                                | `block text-[12px] font-bold text-ink leading-[1.2]` / `text-[10px] text-muted`                                                                                                                                                   |
| `.nav-module`                 | flex gap 8px, padding 10px 18px 6px, 10px/700 muted-2 .12em uppercase, mt 6px, border-l 3px transparent                           | `flex items-center gap-[8px] pt-[10px] px-[18px] pb-[6px] text-[10px] font-bold text-muted-2 tracking-[.12em] uppercase mt-[6px] cursor-pointer border-l-[3px] border-transparent T140 select-none relative` · ativo `text-ink-3` |
| `.mod-arrow`                  | ml auto, 9px, transition transform .18s; `.open` rotate 180°                                                                      | `ml-auto text-[9px] text-muted-2 transition-transform duration-[180ms] data-[open=true]:rotate-180`                                                                                                                               |
| `.mod-accent`                 | 3×22px radius 2px (blue/teal/purple por módulo)                                                                                   | `w-[3px] h-[22px] rounded-[2px] shrink-0`                                                                                                                                                                                         |
| `.nav-item`                   | flex gap 8px, padding 8px 18px 8px 44px, muted 13px, border-l 3px transparent                                                     | `flex items-center gap-[8px] py-[8px] pr-[18px] pl-[44px] cursor-pointer text-muted text-[13px] T140 border-l-[3px] border-transparent select-none hover:bg-[#F8FAFC] hover:text-ink`                                             |
| `.nav-item.active`            | border-l blue, bg blue-bg, color blue, 500                                                                                        | `border-l-blue bg-blue-bg text-blue font-medium` (`.teal`/`.purple` análogos)                                                                                                                                                     |
| `#ni-dashboard`               | 600; ativo bg blue, color #fff !important                                                                                         | `font-semibold` · ativo `bg-blue !text-white`                                                                                                                                                                                     |
| `.sidebar-footer`             | padding 12px 18px, border-t, 10px muted-2, lh 1.8, mt auto                                                                        | `px-[18px] py-[12px] border-t border-border text-[10px] text-muted-2 leading-[1.8] mt-auto shrink-0`                                                                                                                              |
| `.topbar`                     | fixed top 34px left 252px right 0, h 64px, bg white, border-b, px 22px, gap 14px, z 20, transition left .2s                       | `fixed top-[34px] left-[252px] right-0 h-[64px] bg-white border-b border-border flex items-center px-[22px] gap-[14px] z-20 transition-[left] duration-200`                                                                       |
| `.topbar-burger`              | muted 17px, p 4px, radius 4px, transition bg .14s; hover bg bg, color slate                                                       | `cursor-pointer text-muted text-[17px] p-[4px] rounded-[4px] leading-none select-none hover:bg-canvas hover:text-ink`                                                                                                             |
| `.topbar-crumb`               | 12.5px muted flex gap 5px; strong slate 500; svg 12px opacity .4                                                                  | `text-[12.5px] text-muted flex items-center gap-[5px] [&_strong]:text-ink [&_strong]:font-medium [&_svg]:size-[12px] [&_svg]:opacity-40`                                                                                          |
| `.main`                       | ml 252px, mt 98px, h calc(100vh−98px), overflow-y auto, padding 22px 24px                                                         | `ml-[252px] mt-[98px] h-[calc(100vh-98px)] overflow-y-auto px-[24px] py-[22px] transition-[margin-left] duration-200`                                                                                                             |
| colapsado (`body.nav-closed`) | sidebar translateX(−100%); topbar/main left 0                                                                                     | `-translate-x-full` / `left-0`                                                                                                                                                                                                    |

Observação: a role bar ("Simular perfil") é ferramenta de demonstração do protótipo; avaliar se entra no produto.

---

## 22. Resumo: o que NÃO existe no protótipo

- Estados `:focus`, `:active` e `:disabled` em botões (só hover).
- Estado de erro em campos (borda/mensagem vermelha).
- Hover em inputs; hover em abas.
- Skeleton e spinner de loading.
- Zebra em tabelas; classe para célula numérica.
- Classes `.table`, `.tbl`, `.panel`, `.kpi`, `.stat` (equivalentes são `table` + `.table-wrap`, `.card`, `.dash-card`).
- Segmented control distinto de `.tabs-pill`.
- Toast com variantes de cor; alert com botão fechar; animação de modal.
- Avatar com imagem / grupos; gauge circular; indicador de tendência em KPI.
- Dark mode (nenhuma regra `prefers-color-scheme` ou tema escuro).
- Breakpoints de layout geral (sidebar/topbar/KPIs não são responsivos); os únicos `@media` são `max-width` 800/560 (`.fg-*`), 720/480 (`.g2/.g3`) e 800 (`.aprov-grid`).
