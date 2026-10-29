---
status: REVIEW
fase: 7
area: platform
feature: prototipo-plataforma
azure-devops-work-item: 39022, 39027
---

# Plataforma do Demand Intelligence (onda 0)

## 1. Overview

Primeira onda do porte do protótipo `docs/Negócio/di-drivers-v2_84.html` (inventário em `docs/prototipo/INVENTARIO.md`, decisões finais em `docs/prototipo/ARQUITETURA.md`). Troca o shell "Marketing Insights" pelo shell do **Demand Intelligence**, com fidelidade visual ao protótipo e dados vindos da API local (`mock-api`, json-server):

- módulo `perfis` de ponta a ponta (`GET /perfis`) e store do perfil simulado, que começa em `admin`;
- role bar "Simular perfil" (L516–539) atrás de `NEXT_PUBLIC_ROLE_SIMULATOR` (ausente = ligado fora de produção, desligado em produção), sem o link "📋 Plano MVP";
- sidebar com o Dashboard raiz e os 8 módulos, accents, badges calculados dos dados, visibilidade por perfil (`setRole`, L3716–3753) e accordion corrigido;
- topbar com burger, trilha a partir do registro de telas e avatar/nome do perfil;
- registro único de telas `src/presentation/navigation/screens.ts` com as 25 telas do inventário §0 (crumb, nível mínimo, módulo);
- guarda de acesso (RN-ACS-04) que mostra "Acesso Restrito" no lugar da tela e a rota `/acesso-negado` (L3153–3161);
- `ToastProvider`/`useToast` fiéis a L3587/L3993;
- formato modular de `UseCases`, `createContainer` e `queryKeys` (ARQUITETURA §2), helpers de teste;
- fundações de qualidade de ARQUITETURA §7 que todas as ondas usam: `HttpClient.getPage` (`{ data, total }` via `X-Total-Count`), timeout de 15 s, estado na URL, debounce, convenções de `loading.tsx`/`error.tsx`, security headers e sidebar como gaveta abaixo de 800 px.

Rotas sem tela ainda (todas exceto `/` e `/acesso-negado`) ficam registradas em `screens.ts`: menu, trilha e guarda funcionam, e o `not-found` mostra "Em breve" dentro do shell (história F3, CA-03). As telas chegam nas ondas 2–5.

Esta fase substitui o shell e a composição das fases 1, 5 e 6 ([app-shell-and-theme](app-shell-and-theme.md), [apsen-visual-identity](apsen-visual-identity.md), [ui-kit-base](ui-kit-base.md)), que não são editadas. O módulo de campanhas já foi removido de `src`; os restos que ainda o referenciam são reescritos ou apagados aqui (§9).

Linhas `Lnnnn` referem-se ao protótipo. Hex do protótipo aparece só para descrever o visual; o código usa tokens.

**Perguntas em aberto** (não bloqueiam; seguir o que está especificado e levar ao PO):

1. História F4 (39027, CA-04) diz "mock de perfil só em desenvolvimento e ambiente Deal, nunca em produção" e "a barra simular perfil não entra no produto"; ARQUITETURA §4 manda manter a role bar com `NEXT_PUBLIC_ROLE_SIMULATOR` **padrão ligado**. **Resolvido pelo orquestrador:** ausente = `true` quando `NODE_ENV !== 'production'` e `false` em produção; o valor explícito sempre vence. Atende a F4 sem configuração extra.
2. História F3 (39022) diz que os números dos badges "são demonstração e não entram"; ARQUITETURA §4 manda calcular os badges dos dados. Seguimos a ARQUITETURA.
3. RN-ACS-05 e o quadro de perfis das regras de negócio (§3) dão "gestão de perfis" ao Planejador; no protótipo o módulo Controle de Acesso só aparece para Admin, embora `SCREEN_ROLES.perfis = 3`. Seguimos o protótipo (ARQUITETURA §5 #11): Planejador acessa `/acesso/perfis` pela URL, mas não vê o item no menu.
4. O accent lateral de módulo (`.mod-accent`, L76–79) existe no CSS, mas não é renderizado no markup do protótipo; o `DESIGN_SPEC.md` §2.2 dizia "não renderizar". O pedido da onda e o inventário §4 ("adicionar cor de accent por módulo") mandam renderizar. Renderizamos só nos 3 módulos com cor no CSS (Drivers azul, Administração teal, Controle de Acesso roxo) e atualizamos o `DESIGN_SPEC.md`.

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `GET {NEXT_PUBLIC_API_URL}/perfis` é consumido por `HttpPerfilRepository`; o caso de uso `ListPerfis` devolve os 4 perfis ordenados por nível decrescente (Admin, Planejador, Área, Visualizador) como `PerfilDto`, com a cor `var(--x)` do `db.json` convertida em `tone` (`purple`/`blue`/`teal`/`muted`). Payload fora do schema lança `InvalidResponseError`.                                                                                                                                                                                                                                                                                     |
| CA-02 | A store `perfilStore` começa em `admin`, não persiste entre recargas (como `setRole('admin')` no load, L7951) e expõe `setPerfil(id)`. `usePerfilAtual()` devolve o perfil da store cruzado com a lista.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CA-03 | Com `NEXT_PUBLIC_ROLE_SIMULATOR` ausente ou `true`, a role bar de 34 px fica fixa no topo com "Simular perfil:", os botões **Admin**, **Planejador**, **Área (usuário)**, **Visualizador** (o ativo com fundo roxo/azul/teal/slate-3), um separador, o ponto colorido + rótulo do perfil ("Admin") e o texto itálico "Apenas para validação do protótipo". Sem link "📋 Plano MVP". Clicar num botão troca o perfil e navega para `/` (L3700–3757). Com `false`, a role bar não é renderizada e sidebar, topbar e main sobem 34 px.                                                                                                                   |
| CA-04 | A sidebar mostra logo + "Demand / Intelligence", o item raiz **Dashboard** e os módulos na ordem Drivers de Demanda, Administração DI, Controle de Acesso, Agentes de IA, Análises, Restrições & Alertas, Planos de Produção, Relatórios, com os itens, rótulos e rotas do §3.3 e o rodapé "Apsen Farmacêutica / PLP Agent · Demand Intelligence". Drivers, Administração DI e Controle de Acesso têm o accent lateral (azul, teal, roxo).                                                                                                                                                                                                            |
| CA-05 | Visibilidade por nível (L3716–3753): Visualizador vê Dashboard, Planos de Produção e Relatórios; Área vê também Drivers (sem "Exportar JSON") e Análises; Planejador vê também "Exportar JSON", Administração DI e Restrições & Alertas; Admin vê também Controle de Acesso (inclusive "Novo Usuário") e Agentes de IA.                                                                                                                                                                                                                                                                                                                               |
| CA-06 | Accordion corrigido: só um módulo aberto por vez; clicar no cabeçalho aberto fecha; clicar em outro abre esse e fecha os demais (todos os 8, não só os 5 de `toggleMod`); navegar para uma tela de módulo abre o módulo dela; Drivers começa aberto. A seta `▼` gira 180° no aberto. Cabeçalho é `button` com `aria-expanded`/`aria-controls`.                                                                                                                                                                                                                                                                                                        |
| CA-07 | Item ativo = item cuja tela é a tela atual (`ni-{id}`, L3803–3805): `/drivers/ABC` e `/drivers/ABC/editar` ativam "Registrar Driver"; `/drivers/catalogo/X`, `/admin/tipos/novo` e `/planos/1` não ativam nenhum item; Dashboard usa a pílula azul sólida. Item ativo tem `aria-current="page"`.                                                                                                                                                                                                                                                                                                                                                      |
| CA-08 | Badges calculados da API: Meus Registros = total de `drivers` (azul), Ciclos = total de `ciclos` (laranja), Catálogo de Tipos = total de `tipos` (teal), Fila de Aprovação = `aprovacoes` com `status=pendente` (vermelho), Usuários = total de `usuarios` (roxo), Agentes Cadastrados = total de `agentes` (roxo), Minhas Análises = total de `analises` (laranja), Restrições Ativas = `restricoes` com `status=ativa` (vermelho), PLP Ativo = total de `planoItens` (azul); "A definir" mostra "em breve" (tom `soon`). Com a massa atual: 4, 3, 47, 2, 4, 5, 2, 8, 247. Contagem que falha ou ainda carrega não mostra badge; as demais aparecem. |
| CA-09 | Topbar: burger "☰" (`aria-label="Alternar menu"`) recolhe e expande a sidebar; trilha "Demand Intelligence › {crumb}" com o crumb do registro (`config.crumbMap`), "Acesso Negado" quando a guarda bloqueia e "Página não encontrada" fora do registro; avatar de 30 px com a letra (`av`) e a cor do perfil e o nome do usuário (`user`, ex.: "Ana Admin"). O `ThemeToggle` continua antes do avatar.                                                                                                                                                                                                                                               |
| CA-10 | `screens.ts` registra as 25 telas do inventário §0 com `id`, padrões de rota, crumb igual ao `config.crumbMap`, nível mínimo igual ao `config.SCREEN_ROLES` (denied sem nível) e módulo; `matchScreen(pathname)` resolve qualquer rota do §0, com segmento estático vencendo dinâmico (`/drivers/catalogo` é `catalogo`, não `form`).                                                                                                                                                                                                                                                                                                                 |
| CA-11 | Guarda: numa tela com nível mínimo maior que o do perfil, o conteúdo da página **não é montado** (nenhuma query dela roda) e aparece "Acesso Restrito" com "Seu perfil ({label}) não tem acesso a esta funcionalidade.", o texto de upgrade do nível (`config.deniedUpgrade`, com `<strong>`) e o botão outline "← Voltar ao Dashboard" (`/`). Em telas de nível 1 o conteúdo renderiza sem esperar os perfis. Enquanto os perfis carregam numa tela de nível ≥ 2 aparece o skeleton de carregamento; em erro, `ErrorState` com "Tentar novamente".                                                                                                   |
| CA-12 | A rota `/acesso-negado` existe (`metadata.title` "Acesso Negado"), mostra a mesma tela para o perfil atual e, sem perfil carregado, o texto inicial "Você não tem permissão para acessar esta funcionalidade com o perfil atual." (L3157).                                                                                                                                                                                                                                                                                                                                                                                                            |
| CA-13 | `useToast().show(msg)` mostra o toast no canto inferior direito (L362–367): branco, borda, sombra, entra com `translateY(12px→0)` + fade em 220 ms, some após 3 s; nova mensagem substitui a anterior e reinicia o tempo. É uma região `role="status"` `aria-live="polite"`.                                                                                                                                                                                                                                                                                                                                                                          |
| CA-14 | `UseCases` é agrupado por módulo (`useCases.perfis.list`, `useCases.navegacao.badges`); `createContainer(env, overrides)` monta o `FetchHttpClient` e registra cada módulo por uma factory em `src/main/modules/`; `createFakeUseCases(overrides)` tem stubs de todos os módulos; `queryKeys` é agrupado por módulo. Nada de campanhas sobra em `src/`, `test/` ou `vitest.setup.ts`.                                                                                                                                                                                                                                                                 |
| CA-15 | `HttpClient.getPage(path, options)` devolve `{ data, total }` lendo `X-Total-Count`; header ausente ou não inteiro lança `InvalidResponseError`. Toda requisição do `FetchHttpClient` aborta em 15 s (configurável) com `TimeoutError`, respeitando também o `signal` externo.                                                                                                                                                                                                                                                                                                                                                                        |
| CA-16 | `useUrlState(spec)` lê e grava página, tamanho, busca, filtros, ordenação e aba em `searchParams` (valores padrão fora da URL, `router.replace` sem rolar); mudar qualquer chave que não seja `page` volta a página para 1. `useDebouncedValue(value, 300)` atrasa a busca.                                                                                                                                                                                                                                                                                                                                                                           |
| CA-17 | `next.config.ts` envia em todas as rotas CSP (com `frame-ancestors 'none'` e `connect-src` liberando a origem da API), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` e `Permissions-Policy`.                                                                                                                                                                                                                                                                                                                                                                                         |
| CA-18 | Abaixo de 800 px a sidebar é uma gaveta: começa fechada, abre por cima do conteúdo com overlay, fecha ao navegar, no overlay e com Esc; ao abrir o foco vai para o primeiro link e ao fechar volta ao burger. Transições respeitam `prefers-reduced-motion`.                                                                                                                                                                                                                                                                                                                                                                                          |
| CA-19 | Rota registrada sem página (ex.: `/drivers`) mostra, dentro do shell, `EmptyState` 🔜 "Em breve" / "Esta tela será disponibilizada em uma próxima entrega.", com a trilha e o item do menu corretos e a guarda aplicada antes. Rota fora do registro continua com "Página não encontrada".                                                                                                                                                                                                                                                                                                                                                            |

## 3. UX / Fluxo de tela

Referências: `docs/design/DESIGN_SPEC.md` §1 (tokens), §2 (shell) e §3.12 (estados), atualizados por esta spec (§9). Textos em pt-BR, exatamente os do protótipo.

### 3.1 Anatomia

```
┌──────────────────────────── ROLE BAR 34px (fixa, z-60, só com o simulador) ─────────────────────────────┐
├───────────────┬──────────────────────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR 252px │ TOPBAR 64px:  ☰  Demand Intelligence › Dashboard          [tema] (A) Ana Admin       │
│ [logo]│Demand ├──────────────────────────────────────────────────────────────────────────────────────────┤
│       │Intell.│ MAIN  ml 252 · mt 34+64 · h calc(100vh-34-64) · overflow-y auto · padding 22/24           │
│ ▦ Dashboard   │   <AccessGuard> conteúdo da rota | Acesso Restrito | Em breve                          │
│ ▍DRIVERS DE ▼ │                                                                                          │
│ …             │                                                         [toast canto inferior direito]  │
└───────────────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

Altura da role bar vira o token `--spacing-rolebar: 34px` (`@theme`). Sidebar `top-rolebar h-[calc(100vh-var(--spacing-rolebar))]`; topbar `top-rolebar`; main `mt-[calc(var(--spacing-rolebar)+var(--spacing-topbar))] h-[calc(100vh-var(--spacing-rolebar)-var(--spacing-topbar))]`. Com o simulador desligado, o `AppShell` envolve tudo num `div` `contents [--spacing-rolebar:0px]` e as mesmas classes resolvem para 0 (sem condicional espalhada).

`src/app/layout.tsx`: `metadata.title = { default: 'Demand Intelligence', template: '%s · Demand Intelligence' }`, `description: 'Apsen · Demand Intelligence — Drivers de Demanda.'` (título do protótipo, L6). Resto do layout não muda.

### 3.2 Role bar (`RoleBar` + `RoleSwitcher`) — L516–539, CSS L38–53

| Parte                                    | Classes                                                                                                                                                                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| barra                                    | `fixed top-0 right-0 left-0 z-[60] flex h-rolebar items-center gap-[10px] overflow-x-auto bg-apsen-rolebar-bg px-[16px]`                                                                                                                            |
| rótulo "Simular perfil:"                 | `mr-[4px] whitespace-nowrap text-[10.5px] tracking-[.05em] text-apsen-rolebar-label`                                                                                                                                                                |
| grupo                                    | `role="group" aria-label="Simular perfil"`, `flex gap-[3px]`                                                                                                                                                                                        |
| botão base                               | `cursor-pointer whitespace-nowrap rounded-[20px] border px-[12px] py-[3px] text-[11px] font-medium transition-all focus-ring`                                                                                                                       |
| botão inativo                            | `border-transparent bg-transparent text-apsen-rolebar-fg hover:bg-apsen-rolebar-hover-bg hover:text-apsen-rolebar-hover-fg`, `aria-pressed="false"`                                                                                                 |
| ativo admin / planejador / area / viewer | `border-apsen-purple bg-apsen-purple text-white` / `border-apsen-blue bg-apsen-blue text-white` / `border-apsen-teal bg-apsen-teal text-white` / `border-apsen-rolebar-viewer bg-apsen-rolebar-viewer text-white`, `aria-pressed="true"`, sem hover |
| separador                                | `mx-[6px] h-[16px] w-px shrink-0 bg-apsen-rolebar-sep` (um só: o link "Plano MVP" e o 2º separador saem)                                                                                                                                            |
| quem                                     | `ml-[4px] flex items-center gap-[5px] whitespace-nowrap text-[10.5px] text-apsen-rolebar-fg`; ponto `size-[6px] rounded-full` na cor do perfil (§3.5) com `aria-hidden`; texto = `perfil.label`                                                     |
| dica                                     | `ml-auto whitespace-nowrap text-[10px] italic text-apsen-rolebar-hint max-[800px]:hidden` "Apenas para validação do protótipo"                                                                                                                      |

- Rótulos dos botões (`ROLE_BUTTON_LABEL`): `admin` "Admin", `planejador` "Planejador", `area` "Área (usuário)", `viewer` "Visualizador". Ordem = perfis por nível decrescente, vindos de `GET /perfis`.
- Clique: `setPerfil(id)` e `router.push('/')` (o protótipo sempre volta ao Dashboard). Clicar no ativo também navega para `/`.
- Carregando: rótulo e dica aparecem, grupo vazio. Erro: no lugar do grupo, `text-[10.5px] text-apsen-rolebar-fg` "Perfis indisponíveis".
- Mobile [derivado]: a barra rola na horizontal; a dica some abaixo de 800 px.

### 3.3 Sidebar — L542–681, CSS L55–99, L491–492

Container, logo, item raiz, cabeçalho de módulo, item, badge e rodapé seguem o `DESIGN_SPEC.md` §2.2 (classes atuais de `Sidebar`, `NavLinks`, `NavModuleGroup`, `NavBadge`), com estas mudanças:

- Logo: `strong` "Demand" e `span` "Intelligence" (L546–547). Rodapé: "Apsen Farmacêutica" `<br/>` "PLP Agent · Demand Intelligence" (L668–669).
- Accent (`.mod-accent`, L76–79): `<span aria-hidden className="h-[22px] w-[3px] shrink-0 rounded-[2px] {cor}" />` antes do rótulo do cabeçalho, com `bg-apsen-blue` (drivers), `bg-apsen-teal` (admin), `bg-apsen-purple` (acesso). Os outros 5 módulos não têm accent.
- Badge com valor textual: `NavBadge value="em breve" tone="soon"`.

Estrutura (`navItems.ts`, rótulos e rotas exatos):

| Módulo (`ModuloId`, rótulo do cabeçalho) | Itens (`screenId` → `href`, badge)                                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| raiz                                     | Dashboard (`dashboard` → `/`)                                                                                                                                                                                                                                                                                             |
| `drivers` "Drivers de Demanda"           | Registrar Driver (`form` → `/drivers/novo`) · Meus Registros (`lista` → `/drivers`, `lista` blue) · Catálogo de Produtos (`catalogo` → `/drivers/catalogo`) · Exportar JSON (`export` → `/drivers/exportar`)                                                                                                              |
| `admin` "Administração DI"               | Ciclos de Planejamento (`ciclos` → `/admin/ciclos`, `ciclos` orange) · Catálogo de Tipos (`tipos` → `/admin/tipos`, `tipos` teal) · Fila de Aprovação (`aprovacoes` → `/admin/aprovacoes`, `aprovacoes` red) · Drivers Ingeridos (`ingeridos` → `/admin/ingeridos`) · Fontes de Dados / APIs (`fontes` → `/admin/fontes`) |
| `acesso` "Controle de Acesso"            | Usuários (`usuarios` → `/acesso/usuarios`, `usuarios` purple) · Perfis de Acesso (`perfis` → `/acesso/perfis`) · Novo Usuário (`user-form` → `/acesso/usuarios/novo`)                                                                                                                                                     |
| `agentes` "Agentes de IA"                | Agentes Cadastrados (`agentes` → `/agentes`, `agentes` purple)                                                                                                                                                                                                                                                            |
| `analises` "Análises"                    | Minhas Análises (`analises` → `/analises`, `analises` orange)                                                                                                                                                                                                                                                             |
| `restricoes` "Restrições & Alertas"      | Restrições Ativas (`restricoes` → `/restricoes`, `restricoes` red)                                                                                                                                                                                                                                                        |
| `planos` "Planos de Produção"            | PLP Ativo (`planos` → `/planos`, `planos` blue)                                                                                                                                                                                                                                                                           |
| `relatorios` "Relatórios"                | A definir (`relatorios` → `/relatorios`, "em breve" soon)                                                                                                                                                                                                                                                                 |

`href` é `string` no registro e vira `Route` com `item.href as Route` no `<Link>` (as páginas ainda não existem; cast de `string` para `Route` é permitido pelo `typedRoutes`). Prefetch padrão do `<Link>`.

### 3.4 Topbar — L674–684, CSS L101–118

Classes do `DESIGN_SPEC.md` §2.3 com `top-rolebar`. Trilha: `<span>Demand Intelligence</span>` + `CrumbChevronIcon` + `<strong aria-current="page">{crumb}</strong>`. Avatar: `size-[30px] rounded-full text-[11.5px] font-bold text-white` + cor do perfil (§3.5), conteúdo `perfil.avatar`, `aria-hidden`; nome `text-[13px] font-semibold text-apsen-slate max-[560px]:hidden` = `perfil.usuario`. Enquanto os perfis carregam ou em erro, avatar e nome não são renderizados.

### 3.5 Cor por perfil

| `tone` (de `color` do `db.json`) | avatar e ponto da role bar                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `purple` (`var(--purple)`)       | `bg-apsen-purple`                                                                                |
| `blue` (`var(--blue)`)           | `bg-apsen-blue`                                                                                  |
| `teal` (`var(--teal)`)           | `bg-apsen-teal`                                                                                  |
| `muted` (`var(--muted)`)         | `bg-apsen-avatar-muted` (token novo: no escuro o `muted` clareia e o texto branco fica ilegível) |

### 3.6 Acesso Negado (`AccessDenied`) — L3153–3161, CSS L404–407

```tsx
<section
  aria-labelledby={id}
  className="flex h-[60vh] flex-col items-center justify-center gap-[10px] text-center text-apsen-muted"
>
  <div aria-hidden="true" className="mb-[8px] text-[44px]">
    🔒
  </div>
  <h1 id={id} className="text-[16px] font-semibold text-apsen-slate">
    Acesso Restrito
  </h1>
  <p>{mensagem}</p>
  {detalhe ? (
    <div className="mt-[8px] text-[12.5px] leading-[1.6] text-apsen-muted">{detalhe}</div>
  ) : null}
  <ButtonLink href="/" variant="outline" className="mt-[16px]">
    ← Voltar ao Dashboard
  </ButtonLink>
</section>
```

- `mensagem`: "Seu perfil ({perfil.label}) não tem acesso a esta funcionalidade." ou, sem perfil, "Você não tem permissão para acessar esta funcionalidade com o perfil atual.".
- `detalhe` por nível (`config.deniedUpgrade`, L3793–3798), como JSX com `<strong>` (sem `dangerouslySetInnerHTML`):
  - 1: "Solicite acesso de **Área** para registrar drivers e análises, ou **Planejador** para acesso operacional completo."
  - 2: "Solicite acesso de **Planejador** para acessar ciclos, restrições, aprovações e exportações."
  - 3: "Solicite acesso de **Admin** para gerenciar agentes de IA e controle de acesso."
  - 4: nada (o bloco não é renderizado).
- O `h1` é [derivado] (o protótipo usa `h3`): é o título principal da página.

### 3.7 Guarda (`AccessGuard`) e estados do `main`

`AccessGuard` envolve os `children` dentro de `ShellMain`:

| Situação                                                               | Renderiza                                                                                                                                                  |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pathname fora do registro, tela sem nível (`denied`) ou nível mínimo 1 | `children`                                                                                                                                                 |
| perfis carregando (nível ≥ 2)                                          | `PageSkeleton` da onda 1; até ela existir, `LoadingState` (`role="status"` "Carregando…")                                                                  |
| erro ao carregar perfis                                                | `ErrorState` "Não foi possível carregar os perfis de acesso" / "Verifique se a API local está no ar e tente novamente." com "Tentar novamente" → `refetch` |
| perfil da store ausente na lista                                       | o mesmo `ErrorState`                                                                                                                                       |
| `perfil.nivel < tela.nivelMinimo`                                      | `AccessDenied` (não monta `children`)                                                                                                                      |
| senão                                                                  | `children`                                                                                                                                                 |

### 3.8 "Em breve" (`ComingSoon`)

`src/app/not-found.tsx` passa a renderizar `NotFoundScreen` (client): se `matchScreen(pathname)` encontra a tela, mostra `EmptyState icon="🔜" title="Em breve" description="Esta tela será disponibilizada em uma próxima entrega."` [derivado, história F3]; senão, o `ErrorState` 🔍 "Página não encontrada" atual. Como o `not-found` é renderizado dentro do layout, a guarda roda antes (CA-19).

### 3.9 Toast — L3587, CSS L362–367, `showToast` L3993

| Parte            | Classes                                                                                                                                                                                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| região           | `role="status" aria-live="polite" aria-atomic="true"`, sempre no DOM, `data-state="visible                                                                                                                                                                                          | hidden"` |
| caixa            | `pointer-events-none fixed right-[22px] bottom-[22px] z-[99999] flex items-center gap-[9px] rounded-apsen border border-apsen-border bg-apsen-white px-[15px] py-[11px] text-[13px] text-apsen-slate shadow-apsen-md transition-all duration-[220ms] motion-reduce:transition-none` |
| oculto / visível | `translate-y-[12px] opacity-0` / `translate-y-0 opacity-100`                                                                                                                                                                                                                        |

Mensagem em `<span>`; texto inicial vazio (o "Ação realizada." do HTML nunca aparece). O texto permanece durante o fade-out.

### 3.10 Gaveta abaixo de 800 px [derivado, ARQUITETURA §7.5]

Mantém o `NavContext` atual (fechada no mobile, overlay `bg-apsen-overlay` z-25, fecha ao navegar) e acrescenta: Esc fecha; ao abrir no mobile, foco no primeiro link da sidebar; ao fechar, foco no burger; `motion-reduce:transition-none` em sidebar, topbar e main.

### 3.11 Telas desta onda

| Rota             | Arquivo                          | Tela                                                                                                       | `metadata.title` |
| ---------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------- |
| `/`              | `src/app/page.tsx`               | `DashboardScreen` provisório: só `PageHeader` "Dashboard — Demand Intelligence" (o conteúdo vem na onda 5) | "Dashboard"      |
| `/acesso-negado` | `src/app/acesso-negado/page.tsx` | `AccessDeniedScreen`                                                                                       | "Acesso Negado"  |

Estados das telas desta onda: o Dashboard provisório não busca dados; a tela de acesso negado cobre carregando/erro com o texto de fallback (CA-12). Carregando/erro/vazio do shell estão nas §3.2, §3.3 (badges), §3.4 e §3.7.

## 4. Contratos de API consumidos

Base `NEXT_PUBLIC_API_URL` (padrão `http://localhost:3001`). Erros: `HttpError` (4xx/5xx), `NetworkError`, `TimeoutError` (novo, 15 s), `InvalidResponseError` (payload fora do schema ou `X-Total-Count` inválido).

### 4.1 `GET /perfis`

```json
[
  {
    "id": "admin",
    "level": 4,
    "label": "Admin",
    "color": "var(--purple)",
    "av": "A",
    "user": "Ana Admin",
    "dot": "var(--purple)",
    "hint": "Acesso total: configura tipos, usuários e exporta dados para o modelo."
  },
  {
    "id": "viewer",
    "level": 1,
    "label": "Visualizador",
    "color": "var(--muted)",
    "av": "P",
    "user": "Pedro Viewer",
    "dot": "var(--muted)",
    "hint": "Somente visualiza drivers ingeridos e a lista de tipos. Sem edição ou registro."
  }
]
```

```ts
const cor = z.string().regex(/^var\(--(purple|blue|teal|muted)\)$/);
const perfilDtoSchema = z.object({
  id: z.enum(['admin', 'planejador', 'area', 'viewer']),
  level: z.number().int().min(1).max(4),
  label: z.string().min(1),
  color: cor,
  av: z.string().min(1).max(2),
  user: z.string().min(1),
  dot: cor,
  hint: z.string(),
});
const perfisResponseSchema = z.array(perfilDtoSchema);
```

Mapper: `level → nivel`, `color → tone` (nome dentro do `var()`), `av → avatar`, `user → usuario`; `dot` é validado e descartado (igual a `color` na massa). Lista vazia é válida (a guarda mostra o erro "perfil ausente"). 404/5xx propagam `HttpError`.

### 4.2 Contagens dos badges — `GET /{colecao}?_page=1&_limit=1[&status=…]`

Uma chamada `getPage` por badge, lendo só `X-Total-Count` (o corpo é ignorado):

| Badge        | Requisição                                     |
| ------------ | ---------------------------------------------- |
| `lista`      | `/drivers?_page=1&_limit=1`                    |
| `ciclos`     | `/ciclos?_page=1&_limit=1`                     |
| `tipos`      | `/tipos?_page=1&_limit=1`                      |
| `aprovacoes` | `/aprovacoes?status=pendente&_page=1&_limit=1` |
| `usuarios`   | `/usuarios?_page=1&_limit=1`                   |
| `agentes`    | `/agentes?_page=1&_limit=1`                    |
| `analises`   | `/analises?_page=1&_limit=1`                   |
| `restricoes` | `/restricoes?status=ativa&_page=1&_limit=1`    |
| `planos`     | `/planoItens?_page=1&_limit=1`                 |

Resposta: `200`, header `X-Total-Count: 47`, corpo `[ {...} ]`. Sem o header ou com valor não inteiro ≥ 0 → `InvalidResponseError` naquela contagem (o badge fica oculto). O json-server 0.17 envia `X-Total-Count` e `Access-Control-Expose-Headers` quando há `_page`.

### 4.3 `HttpClient.getPage`

```ts
interface PageResult { data: unknown; total: number }
getPage(path: string, options?: HttpRequestOptions): Promise<PageResult>;
```

Mesmo fluxo do `get`; depois lê `response.headers.get('X-Total-Count')`. Helper `toPageQuery({ page, limit, sort?, order?, search?, filters? })` → `QueryParams` (`_page`, `_limit`, `_sort`, `_order`, `q`, demais filtros), em `src/infrastructure/http/pageQuery.ts`, para os módulos das próximas ondas.

## 5. Domínio (`src/domain`)

TypeScript puro.

- `shared/Page.ts`: `interface PageRequest { page: number; limit: number; sort?: string; order?: 'asc' | 'desc'; search?: string; filters?: Readonly<Record<string, string>> }`, `interface Page<T> { items: readonly T[]; total: number; page: number; limit: number }`, `pageCountOf(total, limit)` (mínimo 1), `PAGE_SIZES = [10, 25, 50] as const`, `DEFAULT_PAGE_SIZE = 10`.
- `perfis/Perfil.ts`: `type PerfilId = 'admin' | 'planejador' | 'area' | 'viewer'`; `type NivelAcesso = 1 | 2 | 3 | 4`; `type PerfilTone = 'purple' | 'blue' | 'teal' | 'muted'`; `interface Perfil { id; nivel; label; tone; avatar; usuario; hint }`; `PERFIL_INICIAL: PerfilId = 'admin'`; `ordenarPorNivel(perfis)` (decrescente, estável).
- `perfis/PerfilRepository.ts`: `interface PerfilRepository { list(): Promise<readonly Perfil[]> }`.
- `perfis/acesso.ts`:
  - `podeAcessar(nivel: NivelAcesso, minimo: NivelAcesso | null): boolean` (`minimo === null` → `true`).
  - `type ModuloId = 'drivers' | 'admin' | 'acesso' | 'agentes' | 'analises' | 'restricoes' | 'planos' | 'relatorios'`.
  - `NIVEL_MINIMO_MODULO: Record<ModuloId, NivelAcesso>` = drivers 2, admin 3, acesso 4, agentes 4, analises 2, restricoes 3, planos 1, relatorios 1 (L3716–3753).
  - `NIVEL_MINIMO_ITEM: Partial<Record<string, NivelAcesso>>` = `{ export: 3, 'user-form': 4 }` (itens escondidos dentro de módulo visível, L3721–3723, L3748–3749).
  - `moduloVisivel(nivel, modulo)`, `itemVisivel(nivel, screenId)`.
  - `upgradeNivel(nivel): 'area-ou-planejador' | 'planejador' | 'admin' | null` (1, 2, 3, 4 → null).
- `navegacao/NavBadges.ts`: `type NavBadgeKey = 'lista' | 'ciclos' | 'tipos' | 'aprovacoes' | 'usuarios' | 'agentes' | 'analises' | 'restricoes' | 'planos'`; `NAV_BADGE_CONTAGENS: Record<NavBadgeKey, { colecao: string; filtro?: Readonly<Record<string, string>> }>` (tabela do §4.2); `type NavBadges = Record<NavBadgeKey, number | null>`.
- `navegacao/ContagemRepository.ts`: `interface ContagemRepository { contar(colecao: string, filtro?: Readonly<Record<string, string>>): Promise<number> }`.

## 6. Aplicação (`src/application`)

- `perfis/dto.ts`: `interface PerfilDto { id: PerfilId; nivel: NivelAcesso; label: string; tone: PerfilTone; avatar: string; usuario: string; hint: string }`.
- `perfis/ListPerfis.ts`: `constructor(private readonly repository: PerfilRepository)`; `execute(): Promise<PerfilDto[]>` = `ordenarPorNivel(await repository.list())` mapeado para DTO.
- `navegacao/GetNavBadges.ts`: `constructor(private readonly repository: ContagemRepository)`; `execute(): Promise<NavBadges>` faz `Promise.allSettled` das 9 contagens de `NAV_BADGE_CONTAGENS`; rejeitada vira `null`.

## 7. Infraestrutura (`src/infrastructure`)

- `config/env.ts`: schema ganha `NEXT_PUBLIC_ROLE_SIMULATOR: z.preprocess(blankToUndefined, z.enum(['true', 'false']).optional())`; `roleSimulator = valor === undefined ? NODE_ENV !== 'production' : valor === 'true'` (`readProcessEnv` também lê `NODE_ENV`); `AppEnv = { apiUrl: string; roleSimulator: boolean }`; `readProcessEnv()` lê as duas variáveis (literais `process.env.NEXT_PUBLIC_*`, para o Next embutir). Valor diferente de `true`/`false` → `InvalidEnvError` citando a variável.
- `http/HttpClient.ts`: `getPage` na interface, `PageResult`, `TimeoutError extends Error` (`name = 'TimeoutError'`, mensagem "Tempo de resposta esgotado ao acessar {url}", `readonly url`).
- `http/FetchHttpClient.ts`: opção `timeoutMs` (padrão `DEFAULT_TIMEOUT_MS = 15_000`); cada requisição cria um `AbortController`, arma `setTimeout` e encadeia o `signal` externo (abort externo aborta; timeout lança `TimeoutError`; o timer é limpo no `finally`). `getPage` usa o mesmo `request` e devolve `{ data, total }`. Ponto único para headers (o token do SSO entra aqui depois).
- `http/pageQuery.ts`: `toPageQuery(request: PageRequest): QueryParams`.
- `perfis/perfilSchema.ts`, `perfis/perfilMapper.ts`, `perfis/HttpPerfilRepository.ts` (`GET /perfis`, `safeParse`; falha → `InvalidResponseError("Resposta de /perfis fora do contrato: …")`).
- `navegacao/HttpContagemRepository.ts`: `contar(colecao, filtro)` = `(await http.getPage(`/${colecao}`, { query: { ...filtro, _page: '1', _limit: '1' } })).total`.

Sem repositório em memória (ARQUITETURA §1).

## 8. Apresentação (`src/presentation`)

### 8.1 Composição

- `providers/UseCasesContext.tsx`:
  ```ts
  export interface UseCases {
    perfis: { list: Pick<ListPerfis, 'execute'> };
    navegacao: { badges: Pick<GetNavBadges, 'execute'> };
  }
  ```
  Cada onda acrescenta o seu grupo (`drivers`, `tipos`…). `useUseCases()` mantém a mensagem de erro atual.
- `providers/AppConfigContext.tsx`: `interface AppConfig { roleSimulator: boolean }`, `AppConfigProvider`, `useAppConfig()` (fora do provider lança "useAppConfig deve ser usado dentro de <AppConfigProvider>").
- `providers/AppProviders.tsx`: props `useCases`, `queryClient`, `config`; ordem `QueryClientProvider` → `AppConfigProvider` → `UseCasesProvider` → `ToastProvider` → `ThemeSync` + `children`.
- `providers/queryClient.ts`: `staleTime` padrão **30 000 ms** (listas, §7.3), `retry: 1`; exporta `CATALOG_STALE_TIME = 300_000` para catálogos (perfis, tipos, categorias, config).
- `providers/ToastProvider.tsx`: contexto `{ show(message: string): void }`, `useToast()` (fora do provider lança "useToast deve ser usado dentro de <ToastProvider>"); estado `{ message, visible, key }`; `show` troca a mensagem, `visible = true` e reinicia um timer de `TOAST_DURATION_MS = 3000`; desmontar limpa o timer. Renderiza `<Toast message visible />` (`components/ui/Toast.tsx`, só visual).
- `src/main/container.ts`:
  ```ts
  export interface Container {
    useCases: UseCases;
    config: AppConfig;
  }
  export interface ContainerOverrides {
    fetchFn?: FetchFn;
    timeoutMs?: number;
  }
  export function createContainer(env: AppEnv, overrides?: ContainerOverrides): Container;
  export function createContainerFromProcessEnv(): Container;
  ```
  Cria um `FetchHttpClient({ baseUrl: env.apiUrl, fetchFn, timeoutMs })` e monta `useCases` com `createPerfisModule(http)` e `createNavegacaoModule(http)` (`src/main/modules/perfis.ts`, `src/main/modules/navegacao.ts`); cada onda cria o seu arquivo em `src/main/modules/` e só acrescenta uma linha no `container.ts`. `dataSource` sai (sempre HTTP).
- `src/main/AppRoot.tsx`: passa `resolved.config` para `AppProviders`.
- `hooks/queryKeys.ts`:
  ```ts
  export const queryKeys = {
    perfis: { all: ['perfis'] as const, list: () => ['perfis', 'list'] as const },
    navegacao: { badges: () => ['navegacao', 'badges'] as const },
  };
  ```
  Contrato para as próximas ondas: grupo por módulo; toda mutação que cria, apaga ou muda o `status` de `drivers`, `ciclos`, `tipos`, `aprovacoes`, `usuarios`, `agentes`, `analises`, `restricoes` ou `planoItens` invalida também `queryKeys.navegacao.badges()`.

### 8.2 Hooks e stores

- `hooks/usePerfis.ts`: `useQuery({ queryKey: queryKeys.perfis.list(), queryFn: () => useCases.perfis.list.execute(), staleTime: CATALOG_STALE_TIME })`.
- `hooks/usePerfilAtual.ts`: `{ perfil: PerfilDto | undefined; perfis: PerfilDto[]; status: 'loading' | 'error' | 'missing' | 'ready'; refetch }`.
- `hooks/useNavBadges.ts`: `useQuery(queryKeys.navegacao.badges(), useCases.navegacao.badges.execute)`.
- `hooks/useDebouncedValue.ts`: `useDebouncedValue<T>(value: T, delayMs = 300): T`.
- `stores/perfilStore.ts`: `usePerfilStore` (zustand, sem `persist`) `{ perfilId: PerfilId; setPerfil(id) }`, `INITIAL_PERFIL_STATE = { perfilId: PERFIL_INICIAL }`.
- `stores/sidebarStore.ts`: `{ openChoice: boolean | null; accordion: { module: ModuloId | null; atPath: string } | null; setOpenChoice(open); setAccordion(module, atPath) }`, `INITIAL_SIDEBAR_STATE`. O `NavContext` passa a ler `openChoice` daqui (API de `useNav()` igual: `open`, `toggle`, `close`, `closeOnMobile`).

### 8.3 Navegação

- `navigation/screens.ts`:

  ```ts
  export type ScreenId =
    | 'dashboard'
    | 'form'
    | 'lista'
    | 'catalogo'
    | 'catalogo-drivers'
    | 'export'
    | 'ciclos'
    | 'tipos'
    | 'tipo-form'
    | 'aprovacoes'
    | 'ingeridos'
    | 'fontes'
    | 'usuarios'
    | 'user-form'
    | 'perfis'
    | 'agentes'
    | 'agente-form'
    | 'analises'
    | 'analise-form'
    | 'analise-view'
    | 'restricoes'
    | 'planos'
    | 'plano-item'
    | 'relatorios'
    | 'denied';
  export interface ScreenDef {
    id: ScreenId;
    patterns: readonly string[];
    crumb: string;
    nivelMinimo: NivelAcesso | null;
    modulo: ModuloId | null;
  }
  export const SCREENS: readonly ScreenDef[];
  export function matchScreen(pathname: string): ScreenDef | null;
  export function screenHref(id: ScreenId, params?: Record<string, string>): string;
  ```

  Conteúdo (crumb = `config.crumbMap`, nível = `config.SCREEN_ROLES`):

  | id               | patterns                                                 | crumb                  | nível | módulo     |
  | ---------------- | -------------------------------------------------------- | ---------------------- | ----- | ---------- |
  | dashboard        | `/`                                                      | Dashboard              | 1     | null       |
  | form             | `/drivers/novo`, `/drivers/[id]`, `/drivers/[id]/editar` | Registrar Driver       | 2     | drivers    |
  | lista            | `/drivers`                                               | Meus Registros         | 2     | drivers    |
  | catalogo         | `/drivers/catalogo`                                      | Catálogo de Produtos   | 2     | drivers    |
  | catalogo-drivers | `/drivers/catalogo/[familia]`                            | Drivers da Família     | 2     | drivers    |
  | export           | `/drivers/exportar`                                      | Exportar JSON          | 3     | drivers    |
  | ciclos           | `/admin/ciclos`                                          | Ciclos de Planejamento | 3     | admin      |
  | tipos            | `/admin/tipos`                                           | Catálogo de Tipos      | 3     | admin      |
  | tipo-form        | `/admin/tipos/novo`, `/admin/tipos/[slug]/editar`        | Novo Tipo              | 3     | admin      |
  | aprovacoes       | `/admin/aprovacoes`                                      | Fila de Aprovação      | 3     | admin      |
  | ingeridos        | `/admin/ingeridos`                                       | Drivers Ingeridos      | 3     | admin      |
  | fontes           | `/admin/fontes`                                          | Fontes de Dados / APIs | 3     | admin      |
  | usuarios         | `/acesso/usuarios`                                       | Usuários               | 4     | acesso     |
  | user-form        | `/acesso/usuarios/novo`, `/acesso/usuarios/[id]/editar`  | Novo Usuário           | 4     | acesso     |
  | perfis           | `/acesso/perfis`                                         | Perfis de Acesso       | 3     | acesso     |
  | agentes          | `/agentes`                                               | Agentes de IA          | 4     | agentes    |
  | agente-form      | `/agentes/novo`, `/agentes/[id]/editar`                  | Novo Agente            | 4     | agentes    |
  | analises         | `/analises`                                              | Minhas Análises        | 2     | analises   |
  | analise-form     | `/analises/nova`                                         | Nova Análise           | 2     | analises   |
  | analise-view     | `/analises/[id]`                                         | Análise                | 2     | analises   |
  | restricoes       | `/restricoes`                                            | Restrições & Alertas   | 3     | restricoes |
  | planos           | `/planos`                                                | Planos de Produção     | 1     | planos     |
  | plano-item       | `/planos/[id]`                                           | Detalhe do Item        | 1     | planos     |
  | relatorios       | `/relatorios`                                            | Relatórios             | 1     | relatorios |
  | denied           | `/acesso-negado`                                         | Acesso Negado          | null  | null       |

- `navigation/useCurrentScreen.ts`: `{ screen: ScreenDef | null; blocked: boolean; crumb: string }` a partir de `usePathname()` e `usePerfilAtual()`; `crumb` = "Acesso Negado" se bloqueado, `screen.crumb`, ou "Página não encontrada".
- `navigation/resolveOpenModule.ts` (pura): `resolveOpenModule(screenModule, pathname, accordion)` → `accordion.atPath === pathname ? accordion.module : screenModule ?? accordion?.module ?? 'drivers'`; `nextAccordion(current, clicked)` → `current === clicked ? null : clicked`.
- `navigation/urlState.ts` (pura) + `navigation/useUrlState.ts`:
  ```ts
  type UrlField =
    | { kind: 'int'; default: number; min?: number }
    | { kind: 'string'; default: string }
    | { kind: 'enum'; default: string; values: readonly string[] };
  type UrlStateSpec = Record<string, UrlField>;
  function parseUrlState<S extends UrlStateSpec>(params: URLSearchParams, spec: S): UrlValues<S>;
  function buildUrlSearch<S extends UrlStateSpec>(
    current: URLSearchParams,
    spec: S,
    patch: Partial<UrlValues<S>>,
  ): string;
  function useUrlState<S extends UrlStateSpec>(
    spec: S,
  ): [UrlValues<S>, (patch: Partial<UrlValues<S>>) => void];
  ```
  Inválido ou ausente → padrão; padrão não vai para a URL; patch sem `page` zera `page` para o padrão quando a spec tem `page`; parâmetros fora da spec são preservados. O setter faz `router.replace(`${pathname}${search}`, { scroll: false })`. Telas que usam o hook ficam dentro de `<Suspense>` na `page.tsx` (exigência do `useSearchParams` no Next 16), com o skeleton da tela como fallback.
- `navigation/routes.ts`: reescrito com `HOME_ROUTE = '/' satisfies Route` e `ACCESS_DENIED_ROUTE = '/acesso-negado'` (as demais rotas saem de `screenHref`).

### 8.4 Componentes de layout (`components/layout`)

| Arquivo                                             | Responsabilidade                                                                                                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppShell.tsx`                                      | `NavProvider` → `RoleBar` (se `useAppConfig().roleSimulator`) → `Sidebar` → `Topbar` → `ShellMain` com `AccessGuard`; wrapper `contents` com `[--spacing-rolebar:0px]` sem simulador              |
| `RoleBar.tsx`                                       | container: `usePerfis`, `usePerfilStore`, `useRouter`; estados carregando/erro                                                                                                                    |
| `RoleSwitcher.tsx`                                  | visual: `roles: { id: PerfilId; label: string; tone: PerfilTone }[]`, `value`, `onChange(id)`                                                                                                     |
| `Sidebar.tsx`                                       | logo/rodapé novos; gaveta (§3.10)                                                                                                                                                                 |
| `NavLinks.tsx`                                      | raiz + módulos visíveis (`moduloVisivel`), accordion via `resolveOpenModule`                                                                                                                      |
| `NavModuleGroup.tsx`                                | props `module`, `open`, `onToggle`, `activeScreenId`, `badges`, `nivel`; accent; sem estado próprio                                                                                               |
| `NavBadge.tsx`                                      | sem mudança de API                                                                                                                                                                                |
| `navItems.ts`                                       | `NavLeaf { screenId: ScreenId; href: string; label: string; badge?: { key: NavBadgeKey                                                                                                            | 'soon'; tone: NavBadgeTone } }`, `NavModule { id: ModuloId; label; accent?: 'blue' | 'teal' | 'purple'; items }`, `NAV_ROOT`, `NAV_MODULES` (§3.3) |
| `Topbar.tsx`                                        | crumb de `useCurrentScreen`, avatar/nome de `usePerfilAtual`                                                                                                                                      |
| `ShellMain.tsx`                                     | `top`/altura com `--spacing-rolebar`; zera o scroll ao trocar de rota (igual)                                                                                                                     |
| `AccessGuard.tsx`                                   | tabela da §3.7                                                                                                                                                                                    |
| `AccessDenied.tsx`                                  | §3.6; props `perfil?: { label: string; nivel: NivelAcesso }`                                                                                                                                      |
| `deniedUpgradeText.tsx`                             | `upgradeNivel` → JSX com `<strong>`                                                                                                                                                               |
| `NotFoundScreen.tsx`                                | §3.8                                                                                                                                                                                              |
| `RouteError.tsx`                                    | `'use client'`; props `{ error: Error; reset: () => void }`; `ErrorState` "Algo deu errado" / "Não foi possível exibir esta página. Tente novamente em instantes." + "Tentar novamente" → `reset` |
| `ThemeToggle.tsx`, `NavIcons.tsx`, `NavContext.tsx` | `NavContext` lê a store e ganha Esc/foco (§3.10)                                                                                                                                                  |

Removidos: `crumbFor.ts`, `isActiveRoute.ts` (substituídos por `matchScreen`/`activeScreenId`).

### 8.5 Features

- `features/perfis/AccessDeniedScreen.tsx`: `usePerfilAtual` → `AccessDenied` (sem perfil: mensagem de fallback, sem detalhe).
- `features/perfis/roleLabels.ts`: `ROLE_BUTTON_LABEL: Record<PerfilId, string>`, `PERFIL_TONE_BG: Record<PerfilTone, string>`, `ROLE_ACTIVE_CLASS: Record<PerfilId, string>`.
- `features/dashboard/DashboardScreen.tsx`: provisório (§3.11).

### 8.6 Convenção de rota (todas as ondas)

- `page.tsx`: Server Component fino, `export const metadata = { title: crumb }`, `params: Promise<{…}>` com `await params` e repasse para a `Screen`.
- `loading.tsx` por segmento de tela: renderiza o skeleton da tela (componentes da onda 1). `src/app/loading.tsx` continua com `LoadingState` nesta onda.
- `error.tsx` por segmento: `'use client'`, `export default function Error(props) { return <RouteError {...props} /> }`. `src/app/error.tsx` passa a usar `RouteError`.
- `not-found.tsx` por segmento de detalhe/edição (onda do módulo), chamado com `notFound()` quando o repositório lança `NotFoundError`.

### 8.7 Testes (`test/`)

- `test/renderWithProviders.tsx`: `createFakeUseCases(overrides?: FakeUseCasesOverrides)` com `type FakeUseCasesOverrides = { [K in keyof UseCases]?: Partial<UseCases[K]> }` (mescla por módulo); padrão `perfis.list` resolve `PERFIS_FIXTURE`, `navegacao.badges` resolve `NAV_BADGES_FIXTURE`, e cada onda acrescenta stubs que rejeitam com "não configurado". `renderWithProviders(ui, useCases?, options?: { config?: Partial<AppConfig> })` (padrão `roleSimulator: true`). `createWrapper(useCases, queryClient?, config?)`.
- `test/fixtures/perfis.ts`: `PERFIS_FIXTURE` (os 4 do `db.json` como `PerfilDto`), `buildPerfil(overrides)`; `test/fixtures/navBadges.ts`: `NAV_BADGES_FIXTURE` (4, 3, 47, 2, 4, 5, 2, 8, 247).
- `test/fakeFetch.ts`: rota aceita `headers?: Record<string, string>` e a chave pode incluir query (`'/aprovacoes?status=pendente'` casa antes de `'/aprovacoes'`); `fakeResponse` devolve `headers: new Headers(...)`.
- `test/fakeHttpClient.ts`: `createFakeHttpClient({ get?, getPage?, post?, … })` implementando `HttpClient` com `vi.fn`.
- `test/nextNavigation.ts`: `navigationState.search` (string) e `resetNavigationMock()` o zera.
- `test/resetStores.ts`: `resetStores()` aplica `INITIAL_PERFIL_STATE`, `INITIAL_SIDEBAR_STATE` e `{ preference: 'system' }`.
- `vitest.setup.ts`: sem `campaignFiltersStore`; `useSearchParams: () => new URLSearchParams(navigationState.search)`; `beforeEach` chama `resetStores()`.

## 9. Arquivos

### Novos

- `src/domain/shared/Page.ts`
- `src/domain/perfis/{Perfil,PerfilRepository,acesso}.ts`
- `src/domain/navegacao/{NavBadges,ContagemRepository}.ts`
- `src/application/perfis/{dto,ListPerfis}.ts`, `src/application/navegacao/GetNavBadges.ts`
- `src/infrastructure/http/pageQuery.ts`
- `src/infrastructure/perfis/{perfilSchema,perfilMapper,HttpPerfilRepository}.ts`
- `src/infrastructure/navegacao/HttpContagemRepository.ts`
- `src/main/modules/{perfis,navegacao}.ts`, `src/main/securityHeaders.ts`
- `src/presentation/providers/{AppConfigContext,ToastProvider}.tsx`
- `src/presentation/components/ui/Toast.tsx`
- `src/presentation/hooks/{usePerfis,usePerfilAtual,useNavBadges,useDebouncedValue}.ts`
- `src/presentation/stores/{perfilStore,sidebarStore}.ts`
- `src/presentation/navigation/{screens,useCurrentScreen,resolveOpenModule,urlState,useUrlState}.ts`
- `src/presentation/components/layout/{RoleBar,RoleSwitcher,AccessGuard,AccessDenied,deniedUpgradeText,NotFoundScreen,RouteError}.tsx`
- `src/presentation/features/perfis/{AccessDeniedScreen.tsx,roleLabels.ts}`
- `src/presentation/features/dashboard/DashboardScreen.tsx`
- `src/app/acesso-negado/page.tsx`
- `test/fixtures/{perfis,navBadges}.ts`, `test/fakeHttpClient.ts`, `test/resetStores.ts`
- Testes listados no §11

### Modificados

- `src/infrastructure/config/env.ts` — `NEXT_PUBLIC_ROLE_SIMULATOR`, `roleSimulator`.
- `src/infrastructure/http/{HttpClient,FetchHttpClient}.ts` — `getPage`, `PageResult`, `TimeoutError`, `timeoutMs`.
- `src/main/{container.ts,AppRoot.tsx}` — formato modular e `config`.
- `src/presentation/providers/{UseCasesContext,AppProviders,queryClient}.ts(x)` — §8.1.
- `src/presentation/hooks/queryKeys.ts` — agrupado por módulo.
- `src/presentation/navigation/routes.ts` — §8.3.
- `src/presentation/components/layout/{AppShell,Sidebar,NavLinks,NavModuleGroup,navItems,Topbar,ShellMain,NavContext}.ts(x)` — §8.4.
- `src/presentation/components/ui/index.ts` — remove `ChannelPill`, `CHANNEL_FILL_COLORS`, `CHANNEL_PILL_COLORS`, `StatusBadge` (arquivos já não existem); exporta `Toast`.
- `src/presentation/format/errorMessage.ts` — mensagem genérica mantida; `TimeoutError` não é importado (presentation não importa infrastructure): o texto atual cobre.
- `src/app/{layout,page,not-found,error}.tsx` — metadata, Dashboard provisório, `NotFoundScreen`, `RouteError`.
- `src/app/globals.css` — tokens da §10 (RN-14) no `@theme` e no `html.dark`, `--spacing-rolebar`.
- `next.config.ts` — `async headers()` com `buildSecurityHeaders({ apiUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL, dev: process.env.NODE_ENV !== 'production' })`.
- `.env.example` — `NEXT_PUBLIC_ROLE_SIMULATOR=true`.
- `vitest.setup.ts`, `test/{renderWithProviders.tsx,fakeFetch.ts,nextNavigation.ts}` — §8.7.
- `docs/design/DESIGN_SPEC.md` — §0.1 (role bar, perfis e banner passam a ser portados), §1 (tokens novos), §1.0 (role bar deixa de ser descartada), §2 (anatomia com role bar, textos "Demand Intelligence", accent, itens do DI, badges calculados, item ativo por tela, accordion, gaveta, toast, acesso negado).
- `README.md` — seções de rotas, mock x API (só HTTP, `NEXT_PUBLIC_ROLE_SIMULATOR`), estrutura de pastas sem campanhas.
- Testes existentes que mudam: `src/main/__tests__/{container.test.ts,AppRoot.test.tsx}`, `src/infrastructure/config/__tests__/env.test.ts`, `src/infrastructure/http/__tests__/FetchHttpClient.test.ts`, `src/presentation/components/layout/__tests__/{AppShell,NavLinks,NavModuleGroup,NavContext,Topbar}.test.tsx`, `src/presentation/hooks/__tests__/hooks.test.tsx`, `src/presentation/stores/__tests__/stores.test.ts`, `src/presentation/navigation/__tests__/routes.test.ts`, `src/presentation/providers/__tests__/providers.test.tsx`, `src/presentation/components/ui/__tests__/index.test.ts`, `src/app/__tests__/{layout,page,not-found,error,globals}.test.ts(x)`.

### Removidos

- `src/presentation/components/layout/{crumbFor,isActiveRoute}.ts` e `__tests__/{crumbFor,isActiveRoute}.test.ts`.
- `src/presentation/components/ui/__tests__/StatusBadge.test.tsx`.
- Trechos de campanha nos testes de `Button`, `ChipGroup`, `IconButton`, `KpiCard`, `TextLink` (trocar exemplos de rota `/campaigns…` por rotas do DI; asserções de classe iguais).

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Hierarquia cumulativa de perfis (regras de negócio §3): Visualizador 1, Área 2, Planejador 3, Admin 4; o perfil acessa a tela quando `nivel ≥ nivelMinimo` (`SCREEN_ROLES`, ARQUITETURA §5 #11). Tela sem nível (`denied`) é sempre acessível.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| RN-02 | Tela não permitida não é acessível e mostra o bloqueio (RN-ACS-04); o conteúdo não é montado, então nenhuma query dela roda (ARQUITETURA §7.2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| RN-03 | Visibilidade do menu segue `setRole` (L3716–3753): módulo visível se `nivel ≥ NIVEL_MINIMO_MODULO`; "Exportar JSON" exige 3 e "Novo Usuário" exige 4. Dashboard sempre visível.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| RN-04 | Perfil inicial `admin`, sem persistência; trocar o perfil leva ao Dashboard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| RN-05 | Accordion: um módulo aberto por vez; clique no aberto fecha; a tela atual abre o seu módulo; telas sem módulo (Dashboard, denied, fora do registro) mantêm a última escolha manual ou, sem ela, Drivers (aberto por padrão, L568).                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| RN-06 | Item ativo é decidido pelo `id` da tela, não por prefixo de rota; com a guarda bloqueando, nenhum item fica ativo e o crumb é "Acesso Negado".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| RN-07 | Badges: totais das coleções e, para Fila de Aprovação e Restrições Ativas, só `status=pendente` e `status=ativa` (como o protótipo recalcula `badge-aprovacoes` e `badge-restricoes`); valor 0 aparece como "0"; contagem indisponível oculta só aquele badge.                                                                                                                                                                                                                                                                                                                                                                                                      |
| RN-08 | Matching de rota: segmentos comparados um a um; `[param]` casa um segmento não vazio; entre padrões que casam, vence o que tem segmento estático na primeira posição em que diferem; barra final e query são ignoradas.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| RN-09 | Texto de upgrade por nível: 1 → Área ou Planejador; 2 → Planejador; 3 → Admin; 4 → nenhum.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| RN-10 | Toast: uma mensagem por vez, 3000 ms desde o último `show`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| RN-11 | Estado na URL: valor inválido vira padrão; padrão não é escrito; mudar busca, filtro, tamanho, ordenação ou aba volta à página 1 (ARQUITETURA §7.1).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| RN-12 | Toda requisição HTTP aborta em 15 s; `X-Total-Count` ausente ou inválido é erro de contrato.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| RN-13 | `NEXT_PUBLIC_ROLE_SIMULATOR`: ausente/vazio = `true` fora de produção e `false` com `NODE_ENV=production`; só `true`/`false` são aceitos.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| RN-14 | Cores só por token. Tokens novos desta onda (claro / escuro [derivado]): `--color-apsen-rolebar-bg` `#141414` / `#0b0c0e`; `--color-apsen-rolebar-fg` `#64748b` / `#7c8aa0`; `--color-apsen-rolebar-hover-fg` `#cbd5e1` / `#d5dbe5`; `--color-apsen-rolebar-hover-bg` `#1d1d1d` / `#1f2026`; `--color-apsen-rolebar-sep` `#1d1d1d` / `#2c2e33`; `--color-apsen-rolebar-label` `#8a8a8a` / `#8a8a8a`; `--color-apsen-rolebar-hint` `#334155` / `#5b6b82`; `--color-apsen-rolebar-viewer` `#404040` / `#404040`; `--color-apsen-avatar-muted` `#6f6f6f` / `#5c5c5c`; `--spacing-rolebar: 34px`. A role bar não usa `apsen-slate` porque esse token clareia no escuro. |
| RN-15 | Sem `console.*` e sem dados pessoais em mensagens de erro (RN-SEG-04): o erro de contrato cita o caminho e o campo, nunca o valor.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## 11. BDD — Cenários de teste unitário

| Cenário                                                                       | Arquivo de teste                                                                                                                                         | Asserção                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 Dado `/perfis` com os 4 perfis, quando lista, então mapeia e ordena     | `src/infrastructure/perfis/__tests__/HttpPerfilRepository.test.ts`, `src/application/perfis/__tests__/ListPerfis.test.ts`                                | `fakeFetch` com o JSON do §4.1: `tone` `purple`/`blue`/`teal`/`muted`, `avatar`, `usuario`; ordem `admin, planejador, area, viewer` mesmo com a resposta embaralhada.                                                                                                                                                                                                                                               |
| CA-01 Dado payload inválido, quando lista, então lança `InvalidResponseError` | `HttpPerfilRepository.test.ts`                                                                                                                           | `level: 5`, `color: '#7c3aed'`, `id: 'x'` e corpo não-array rejeitam com `InvalidResponseError`; 500 propaga `HttpError`; a mensagem não contém o valor inválido (RN-15).                                                                                                                                                                                                                                           |
| RN-01/RN-03/RN-09 regras de acesso                                            | `src/domain/perfis/__tests__/acesso.test.ts`                                                                                                             | Tabela `podeAcessar` (1×2 false, 3×3 true, qualquer×null true); `moduloVisivel` para os 4 níveis × 8 módulos; `itemVisivel(2,'export')` false, `(3,'export')` true, `(3,'user-form')` false; `upgradeNivel` 1–4.                                                                                                                                                                                                    |
| CA-02/RN-04 store do perfil                                                   | `src/presentation/stores/__tests__/stores.test.ts`, `hooks/__tests__/usePerfilAtual.test.tsx`                                                            | Estado inicial `admin`; `setPerfil('viewer')`; nada em `localStorage`; `usePerfilAtual` devolve `loading`, `ready` com "Ana Admin", `missing` quando a lista não tem o id e `error`.                                                                                                                                                                                                                                |
| CA-03 role bar ligada                                                         | `src/presentation/components/layout/__tests__/RoleBar.test.tsx`                                                                                          | "Simular perfil:", `group` "Simular perfil" com 4 botões na ordem e rótulos do §3.2; "Admin" `aria-pressed="true"` com `bg-apsen-purple`; texto "Apenas para validação do protótipo"; nenhum link "Plano MVP"; um único separador.                                                                                                                                                                                  |
| CA-03/RN-04 trocar perfil                                                     | `RoleBar.test.tsx`                                                                                                                                       | Clicar "Área (usuário)" → store `area`, `routerMock.push('/')`, rótulo "Área" e botão com `bg-apsen-teal`; "Visualizador" ativo usa `bg-apsen-rolebar-viewer`; inativo tem as classes de hover, ativo não. Carregando: sem botões; erro: "Perfis indisponíveis".                                                                                                                                                    |
| CA-03/RN-13 simulador desligado                                               | `AppShell.test.tsx`, `src/infrastructure/config/__tests__/env.test.ts`                                                                                   | `config.roleSimulator=false` → sem `group` "Simular perfil" e wrapper com `[--spacing-rolebar:0px]`; `parseEnv({})` → `roleSimulator: true`; `'false'` → false; `'sim'` → `InvalidEnvError` com o nome da variável.                                                                                                                                                                                                 |
| CA-04 sidebar completa (Admin)                                                | `NavLinks.test.tsx`, `Sidebar.test.tsx`                                                                                                                  | "Demand"/"Intelligence"; rodapé "PLP Agent · Demand Intelligence"; cabeçalhos dos 8 módulos na ordem; accent `bg-apsen-blue`/`bg-apsen-teal`/`bg-apsen-purple` só nos 3 primeiros; ao abrir cada módulo, links com rótulos e `href` do §3.3.                                                                                                                                                                        |
| CA-05/RN-03 visibilidade por perfil                                           | `NavLinks.test.tsx`                                                                                                                                      | Para cada perfil, cabeçalhos visíveis exatamente como no CA-05; Área com Drivers aberto não tem "Exportar JSON"; Admin com Controle de Acesso aberto tem "Novo Usuário".                                                                                                                                                                                                                                            |
| CA-06/RN-05 accordion                                                         | `NavLinks.test.tsx`, `src/presentation/navigation/__tests__/resolveOpenModule.test.ts`                                                                   | Em `/`, Drivers `aria-expanded="true"`; clicar "Análises" abre e fecha Drivers; clicar de novo fecha todos; em `/admin/ciclos` Administração aberta; seta com `rotate-180` só no aberto; tabela de `resolveOpenModule`/`nextAccordion`.                                                                                                                                                                             |
| CA-07/RN-06 item ativo                                                        | `NavLinks.test.tsx`                                                                                                                                      | `/drivers/ABC/editar` → "Registrar Driver" com `aria-current="page"`; `/drivers/catalogo/X` e `/planos/1` → nenhum link com `aria-current`; `/` → Dashboard `bg-apsen-blue text-white`; bloqueado → nenhum ativo.                                                                                                                                                                                                   |
| CA-08/RN-07 badges                                                            | `src/application/navegacao/__tests__/GetNavBadges.test.ts`, `src/infrastructure/navegacao/__tests__/HttpContagemRepository.test.ts`, `NavLinks.test.tsx` | Fake com 9 rotas e `X-Total-Count`: resultado do §4.2 com query `status=pendente`/`status=ativa` e `_limit=1`; uma contagem rejeitada → `null` só nela; na sidebar "47" com `bg-apsen-teal`, "0" exibido, badge `null` ausente, "em breve" com `text-[9px]`.                                                                                                                                                        |
| CA-09 topbar                                                                  | `Topbar.test.tsx`                                                                                                                                        | Trilha "Demand Intelligence" + crumb por rota (`/admin/aprovacoes` → "Fila de Aprovação", `/xyz` → "Página não encontrada", bloqueado → "Acesso Negado"); avatar "A" `bg-apsen-purple` e "Ana Admin"; com viewer, "P" `bg-apsen-avatar-muted` e "Pedro Viewer"; carregando sem avatar; burger alterna `aria-expanded`.                                                                                              |
| CA-10/RN-08 registro de telas                                                 | `src/presentation/navigation/__tests__/screens.test.ts`                                                                                                  | 25 telas; crumbs e níveis iguais a `config.crumbMap`/`config.SCREEN_ROLES` lidos de `mock-api/db.json`; `matchScreen` para todas as rotas do §0 (incluindo `/drivers/catalogo` → catalogo, `/drivers/exportar` → export, `/drivers/novo` → form, `/analises/nova` → analise-form, `/drivers/` com barra, `?familia=X`); `/nada` → null; `screenHref('catalogo-drivers', { familia: 'MOTILEX HA + MSM' })` codifica. |
| CA-11/RN-02 guarda bloqueia                                                   | `AccessGuard.test.tsx`                                                                                                                                   | Viewer em `/admin/ciclos`: "Acesso Restrito", "Seu perfil (Visualizador) não tem acesso a esta funcionalidade.", detalhe com `<strong>Área</strong>`; filho com `useEffect` espião nunca monta; link "← Voltar ao Dashboard" → `/`. Admin: filho renderiza.                                                                                                                                                         |
| CA-11 estados da guarda                                                       | `AccessGuard.test.tsx`                                                                                                                                   | Nível 1 (`/planos`) renderiza o filho com perfis pendentes; nível 2 com perfis pendentes → `role="status"`; erro → `ErrorState` e "Tentar novamente" chama `perfis.list` de novo; perfil ausente → mesmo erro.                                                                                                                                                                                                      |
| RN-09 detalhe por nível                                                       | `AccessDenied.test.tsx`                                                                                                                                  | Níveis 1, 2, 3 com os textos do §3.6; nível 4 sem bloco de detalhe; `h1` "Acesso Restrito"; botão outline.                                                                                                                                                                                                                                                                                                          |
| CA-12 rota de acesso negado                                                   | `src/app/acesso-negado/__tests__/page.test.tsx`, `features/perfis/__tests__/AccessDeniedScreen.test.tsx`                                                 | `metadata.title` "Acesso Negado"; com Planejador: mensagem com "(Planejador)" e texto do nível 3; perfis pendentes: "Você não tem permissão para acessar esta funcionalidade com o perfil atual.".                                                                                                                                                                                                                  |
| CA-13/RN-10 toast                                                             | `src/presentation/providers/__tests__/ToastProvider.test.tsx`, `components/ui/__tests__/Toast.test.tsx`                                                  | Fake timers: `show('✅ Ciclo criado!')` → `role="status"` com o texto e `data-state="visible"` (`translate-y-0 opacity-100`); após 3000 ms `hidden`; segundo `show` aos 2000 ms troca o texto e só esconde 3000 ms depois dele; `useToast` fora do provider lança; classes `bottom-[22px] right-[22px] z-[99999]`.                                                                                                  |
| CA-14 composição modular                                                      | `src/main/__tests__/container.test.ts`, `AppRoot.test.tsx`, `providers/__tests__/providers.test.tsx`                                                     | `createContainer` com `fetchFn` falso: `useCases.perfis.list.execute()` chama `http://localhost:3001/perfis`; `config.roleSimulator`; `createContainerFromProcessEnv` lê o env; `AppRoot` disponibiliza `useAppConfig` e `useToast`; `useAppConfig` fora do provider lança; `createFakeUseCases({ perfis: { list } })` mantém `navegacao.badges`.                                                                   |
| CA-14 sem campanhas                                                           | `src/app/__tests__/designTokensSource.test.ts` (novo caso)                                                                                               | Nenhum arquivo de `src/`, `test/` ou `vitest.setup.ts` contém `campaign`/`Campaign`.                                                                                                                                                                                                                                                                                                                                |
| CA-15/RN-12 HTTP                                                              | `src/infrastructure/http/__tests__/FetchHttpClient.test.ts`, `pageQuery.test.ts`                                                                         | `getPage` devolve `{ data, total: 47 }`; sem header ou `"abc"` → `InvalidResponseError`; fetch que nunca resolve com `timeoutMs: 50` → `TimeoutError`; abort externo propaga `AbortError`; timer limpo após sucesso (`vi.getTimerCount() === 0`); `toPageQuery` gera `_page`, `_limit`, `_sort`, `_order`, `q` e filtros, sem vazios.                                                                               |
| CA-16/RN-11 estado na URL                                                     | `src/presentation/navigation/__tests__/{urlState.test.ts,useUrlState.test.tsx}`, `hooks/__tests__/useDebouncedValue.test.tsx`                            | `parseUrlState` com `page=abc` → 1 e enum fora da lista → padrão; `buildUrlSearch` omite padrões, preserva chaves alheias e zera `page` quando muda `q`; o setter chama `routerMock.replace('/drivers?q=x', { scroll: false })`; debounce entrega o valor só após 300 ms.                                                                                                                                           |
| CA-17 security headers                                                        | `src/main/__tests__/securityHeaders.test.ts`                                                                                                             | `buildSecurityHeaders({ apiUrl: 'http://localhost:3001', dev: false })` tem as 5 chaves; CSP contém `frame-ancestors 'none'`, `object-src 'none'`, `connect-src 'self' http://localhost:3001`, `script-src 'self' 'unsafe-inline'` sem `'unsafe-eval'`; com `dev: true` inclui `'unsafe-eval'` e `ws:`.                                                                                                             |
| CA-18 gaveta mobile                                                           | `NavContext.test.tsx`, `Sidebar.test.tsx`                                                                                                                | `matchMedia` móvel: começa fechada (`inert`); burger abre, foco no link "Dashboard"; Esc fecha e foco volta ao burger; overlay fecha; clicar num link fecha; classes `motion-reduce:transition-none`.                                                                                                                                                                                                               |
| CA-19 em breve                                                                | `src/app/__tests__/not-found.test.tsx`, `layout/__tests__/NotFoundScreen.test.tsx`                                                                       | Em `/drivers`: "Em breve" e a descrição; em `/nada`: "Página não encontrada" e "← Voltar ao Dashboard".                                                                                                                                                                                                                                                                                                             |
| RN-14 tokens                                                                  | `src/app/__tests__/globals.test.ts`                                                                                                                      | Cada token do RN-14 no `@theme` e em `html.dark` com os valores da tabela; `--spacing-rolebar: 34px`.                                                                                                                                                                                                                                                                                                               |
| Rotas e páginas                                                               | `src/app/__tests__/{page,layout,error}.test.tsx`                                                                                                         | `/` renderiza "Dashboard — Demand Intelligence"; `metadata.title.default` "Demand Intelligence"; `error.tsx` usa `RouteError` e "Tentar novamente" chama `reset`.                                                                                                                                                                                                                                                   |
| QA visual                                                                     | navegador (1440×900 e 390×844, claro e escuro)                                                                                                           | Role bar, sidebar e topbar comparadas com o protótipo por `getComputedStyle`; gaveta em 390 px sem scroll horizontal da página; toast visível.                                                                                                                                                                                                                                                                      |

## 12. Requisitos não funcionais

| Item (ARQUITETURA §7)               | Nesta onda                                                                                                                                                                                                                                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 Paginação no servidor           | `HttpClient.getPage`, `toPageQuery`, `Page<T>`/`PageRequest`, `PAGE_SIZES`; badges usam `_limit=1` + `X-Total-Count` em vez de baixar coleções.                                                                                                                                                                       |
| 7.1 Debounce e estado na URL        | `useDebouncedValue` (300 ms) e `useUrlState`/`parseUrlState`/`buildUrlSearch`, com volta à página 1.                                                                                                                                                                                                                  |
| 7.2 Roteamento e carregamento       | Rotas por segmento, convenção de `loading.tsx`/`error.tsx`/`not-found.tsx` (§8.6), `RouteError`; guarda antes das queries; prefetch padrão dos links da sidebar.                                                                                                                                                      |
| 7.3 Cache                           | `staleTime` 30 s padrão e `CATALOG_STALE_TIME` 5 min para perfis; contrato de invalidação dos badges.                                                                                                                                                                                                                 |
| 7.5 Acessibilidade e responsividade | Cabeçalhos de módulo com `aria-expanded`/`aria-controls`, `aria-current`, `aria-pressed` na role bar, toast `role="status"`, gaveta com Esc e foco, `motion-reduce`, layout até 360 px.                                                                                                                               |
| 7.6 Segurança                       | Security headers (`src/main/securityHeaders.ts` + `next.config.ts`), timeout de 15 s e headers centralizados no `FetchHttpClient`, sem `console.*` e sem valores do payload nas mensagens (RN-SEG-04). IDs: perfis usam slugs do `db.json` e esta onda não cria registros, então RN-SEG-03 (UUID) não se aplica aqui. |
| Dependências                        | Nenhuma nova.                                                                                                                                                                                                                                                                                                         |

## 13. Alterações pedidas pelo usuário (27/10/2026) — prevalecem sobre as seções acima

### 13.1 Role bar removida

Ver [login.md](login.md): a role bar sai do app; o perfil vem da sessão do usuário logado.

### 13.2 Toast maior, no topo à direita (substitui CA-13, §3.9 e RN-10)

O toast do protótipo (pequeno, canto inferior direito) foi considerado discreto demais. Novo comportamento:

| Item           | Regra                                                                                                                                                                                                                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Posição        | Canto **superior direito**, abaixo da topbar: `top: calc(var(--spacing-topbar) + 16px)`, `right: 24px`, `z-index` acima de modais. Abaixo de 560 px: largura total com 16 px de margem, `top: 16px`.                                                                                                                                                         |
| Tamanho        | Largura 380 px (mín. 320, máx. `calc(100vw - 32px)`), padding 16×18 px, `rounded-apsen-lg`, `shadow-apsen-dropdown`, fundo `apsen-white`, borda `apsen-border` com **faixa de 4 px à esquerda** na cor do tom.                                                                                                                                               |
| Conteúdo       | Ícone em círculo de 32 px (fundo `*-bg`, ícone na cor do tom) + título em 13.5 px/700 + mensagem em 13 px/`apsen-slate-3`, até 3 linhas. Títulos por tom: sucesso "Tudo certo", erro "Não foi possível concluir", atenção "Atenção", info "Aviso". Botão ✕ `aria-label="Fechar notificação"`. Barra de progresso de 3 px na base indicando o tempo restante. |
| Tom            | `show(message, { tone? })`. Sem `tone`, inferido do prefixo do texto do protótipo: `✅` sucesso (verde), `❌` erro (vermelho), `⚠️` atenção (laranja), demais info (azul). O emoji do prefixo é removido do texto (o ícone o substitui). Textos do protótipo continuam idênticos.                                                                            |
| Tempo          | 4 s (erro: 6 s). Pausa com hover ou foco dentro do toast; retoma ao sair.                                                                                                                                                                                                                                                                                    |
| Pilha          | Até 3 toasts empilhados (mais novo no topo, 10 px de espaço); o 4º remove o mais antigo. Mensagem idêntica à que está visível reinicia o tempo em vez de duplicar.                                                                                                                                                                                           |
| Animação       | Entra deslizando da direita (`translateX(16px)` → 0, fade, 200 ms) e sai com fade; sem movimento com `prefers-reduced-motion`.                                                                                                                                                                                                                               |
| Acessibilidade | Região `aria-label="Notificações"`; sucesso/info/atenção com `role="status"` `aria-live="polite"`, erro com `role="alert"`. Não rouba o foco. Esc com foco no toast fecha. Contraste AA nos dois temas.                                                                                                                                                      |
| Testes         | Fake timers: tom inferido de cada prefixo, emoji removido, tempos 4 s/6 s, pausa no hover, pilha máx. 3, dedupe, fechar pelo ✕ e Esc, `role` por tom, classes de posição topo-direita.                                                                                                                                                                       |

### 13.3 Loading entre as telas (pedido do usuário)

Além do `loading.tsx` com skeleton por segmento (§7.2 da ARQUITETURA):

| Item               | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RouteProgress`    | Barra de 3 px fixa no topo da viewport (`z-index` acima da topbar), cor `apsen-blue`, com brilho na ponta. Começa ao clicar num link interno ou em `router.push/replace` e completa (100 % + fade 200 ms) quando o `pathname`/`searchParams` muda. Avança em passos até ~85 % enquanto espera; só aparece se a troca levar mais de 120 ms (sem piscar em navegação instantânea). `role="progressbar"`, `aria-label="Carregando página"`, `aria-valuenow`. |
| Atividade de dados | A mesma barra aparece (modo indeterminado) enquanto houver query do TanStack Query buscando pela primeira vez ou mutação em andamento (`useIsFetching` / `useIsMutating`), sem disparar em refetch de fundo.                                                                                                                                                                                                                                              |
| Conteúdo           | Ao navegar, o `main` mostra o skeleton do `loading.tsx` da rota destino; os dados anteriores ficam na tela durante paginação/filtros (`keepPreviousData`) com opacidade 60 % e `aria-busy="true"` no contêiner da lista.                                                                                                                                                                                                                                  |
| Tela cheia         | Na validação da sessão (`AuthGate`), no redirecionamento para o login e no `/auth/callback`: loader em tela cheia com o símbolo da Apsen (`public/brand/apsen-logo.png`) pulsando suavemente, spinner circular `apsen-blue` e o texto do estado ("Verificando sua sessão…", "Redirecionando para o login…", "Entrando…"), `role="status"`.                                                                                                                |
| Movimento          | Sem animação com `prefers-reduced-motion` (barra aparece estática, logo sem pulso).                                                                                                                                                                                                                                                                                                                                                                       |
| Testes             | Barra só aparece após 120 ms, completa na troca de rota, modo indeterminado com `useIsFetching`, `aria-*` corretos; loader de tela cheia por estado.                                                                                                                                                                                                                                                                                                      |
