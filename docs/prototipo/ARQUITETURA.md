# Componentização do protótipo — decisões transversais

Vale para todas as specs e implementações que portam `docs/Negócio/di-drivers-v2_84.html` (ver [INVENTARIO.md](INVENTARIO.md)).
Regra geral: **visual fiel ao protótipo, dados funcionando de verdade via API local**.

## 1. Backend simulado (json-server)

- `npm run api` sobe `mock-api/server.mjs` (json-server 0.17.4) em `http://localhost:3001`, com 300 ms de atraso. `npm run dev:full` sobe a API e o Next juntos.
- Os dados ficam em memória: cada start parte de `mock-api/db.json` e **nunca altera o arquivo**. Mutações valem até reiniciar a API.
- REST padrão do json-server: `GET /colecao`, `GET /colecao/:id`, `POST`, `PUT`, `PATCH`, `DELETE`, filtros `?campo=valor`, `q=`, `_sort/_order`, `_page/_limit`. `config` é um recurso singular (`GET /config`).
- O app sempre integra por HTTP (`NEXT_PUBLIC_API_URL`, padrão `http://localhost:3001`). **Não há repositório em memória no app.** Testes usam `fetchFn` falso, `HttpClient` falso ou casos de uso falsos.
- **Paginação, busca, filtros e ordenação no servidor** (ver §7.1), mesmo onde o protótipo carrega tudo e fatia no navegador.
- **IDs técnicos não sequenciais** (RN-SEG-03): registro novo recebe `id` UUID (`crypto.randomUUID()`). O código de negócio exibido (`DRV-2026-nnn`, `RST-nnn`, `PLP-2026-07-nnn`) é um campo separado, calculado a partir do maior existente (nunca `length + 1`). Rotas de detalhe usam o `id`.

## 2. Padrão de módulo (Clean Architecture)

Para cada módulo `{mod}` (ex.: `drivers`, `tipos`, `aprovacoes`):

| Camada                             | Conteúdo                                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/domain/{mod}/`                | entidades/value objects puros, regras do protótipo (validações, cálculos), interface `{Mod}Repository`                                                 |
| `src/application/{mod}/`           | casos de uso (`List…`, `Get…`, `Create…`, `Update…`, `Delete…`, ações de negócio), DTOs de saída prontos para a tela                                   |
| `src/infrastructure/{mod}/`        | `Http{Mod}Repository` sobre `HttpClient`, schema zod do DTO da API (campos com os nomes do `db.json`), mapper DTO → domínio                            |
| `src/presentation/features/{mod}/` | telas (`…Screen.tsx`) e componentes específicos do módulo                                                                                              |
| `src/presentation/hooks/`          | hooks TanStack Query (`use…` para leitura, `use…Mutation` para escrita, invalidando as chaves afetadas); chaves em `queryKeys.ts` agrupadas por módulo |
| `src/main/container.ts`            | registra o repositório HTTP e os casos de uso do módulo                                                                                                |
| `src/app/(rota)/page.tsx`          | página fina: `metadata` + a `Screen`                                                                                                                   |

- `UseCases` (em `presentation/providers/UseCasesContext.tsx`) é agrupado por módulo: `useCases.drivers.list.execute(...)`. `test/renderWithProviders.tsx` expõe `createFakeUseCases(overrides)` com stubs de todos os módulos.
- Estado só de UI (filtros, aba, perfil simulado, sidebar aberta) fica em stores zustand em `presentation/stores/`.
- Toda escrita mostra o toast com o **texto exato** do protótipo.

## 3. Visual

- Cores só por tokens `apsen-*` (`src/app/globals.css`, com par no `html.dark`). Cor do protótipo sem token → criar o token (claro e escuro) e documentar em `docs/design/DESIGN_SPEC.md`. O teste `designTokensSource` proíbe hex/rgba e paleta Tailwind em `src/`.
- Componente reutilizável vai para `src/presentation/components/ui` (exportado em `index.ts`, com teste). Componente específico fica na feature.
- Medidas, textos, ícones/emoji, ordem dos blocos e estados (vazio, carregando, erro) iguais ao protótipo. Sempre abrir as linhas citadas no inventário.
- Gráfico: `chart.js` 4.5.1 + `react-chartjs-2`, cores lidas dos tokens CSS em runtime (dark mode).

## 4. Rotas, perfis e navegação

- Tabela de rotas do inventário (§0) é a fonte. Registro único em `src/presentation/navigation/screens.ts`: `id` da tela, padrão de rota, crumb (`crumbMap`), nível mínimo (`SCREEN_ROLES`), módulo da sidebar.
- **Login por usuário** (decisão de 27/10/2026, spec `docs/specs/platform/login.md`): a role bar do protótipo foi **removida**. Cada usuário entra com e-mail e senha no `/login` (meio a meio: marca + formulário) e o perfil dele (`usuarios[].perfil` → `GET /perfis`) define o acesso. A API simulada exige token em todas as rotas (`POST /auth/login`, `GET /auth/me`, `POST /auth/logout`). O SSO Entra ID (PBI 39032) substitui depois só o provedor de sessão.
- Guarda: tela com nível maior que o do perfil renderiza Acesso Negado (`/acesso-negado` também existe como rota). Visibilidade dos módulos na sidebar segue `setRole` do protótipo (L3716–3753).
- Accordion corrigido: abrir um módulo fecha todos os outros; a tela atual abre o seu módulo.
- Badges da nav calculados dos dados (pendentes, ativas, totais), inclusive os que no protótipo são fixos (tipos 40, usuários 4, agentes 5).

## 5. Decisões sobre as lacunas do inventário (§6)

| #    | Decisão                                                                                                                                                                                                                                                           |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Manter as duas massas de produto como estão no `db.json` (fiel). Fonte de verdade fica para o PO.                                                                                                                                                                 |
| 2    | Salvar driver grava em `/drivers` e não cria aprovação (fiel). Registrar como pergunta ao PO.                                                                                                                                                                     |
| 3, 5 | Dados como estão; contadores e textos de totais calculados dos dados.                                                                                                                                                                                             |
| 6    | Corrigir: modo Franquia usa os SKUs das famílias da franquia; modo SKU grava código e nome do SKU; modo Família usa os SKUs da família.                                                                                                                           |
| 7    | Salvar **todos** os campos do tipo (a partir de `camposTipo`), não só `DYN_IDS`.                                                                                                                                                                                  |
| 8    | Cor do badge do tipo pela categoria (`db-*` do CSS), mapeada em tokens.                                                                                                                                                                                           |
| 9    | Implementar os modos novo/visualizar/editar como o código pretende (título, banner, botões).                                                                                                                                                                      |
| 10   | Obrigatório = campo com `*` no protótipo; Data Início ≤ Data Fim. Reset volta intensidade para 1.                                                                                                                                                                 |
| 11   | `SCREEN_ROLES` manda no acesso às telas; visibilidade do menu segue `setRole`. Botões de escrita seguem o protótipo (sem checagem extra), anotado como pergunta ao PO.                                                                                            |
| 12   | Accordion corrigido (ver §4).                                                                                                                                                                                                                                     |
| 13   | Tudo persiste via API: tipo-form, user-form, agente-form, ciclo (criar e editar pré-preenchido), importar tipos (parse do JSON com validação), excluir tipo/usuário/ingerido; filtros de usuários e ingeridos funcionam. `modal-cat-drivers` órfão não é portado. |
| 14   | Editar restrição atualiza o registro e pré-preenche todos os campos; contadores das abas dinâmicos; vazio correto.                                                                                                                                                |
| 15   | Rejeição grava motivo e justificativa.                                                                                                                                                                                                                            |
| 16   | Busca por ciclo sem diferenciar caixa; resultado da análise segue o mock do protótipo (sem modelo real); `analiseSalvar` não rebaixa status.                                                                                                                      |
| 17   | ID novo = maior + 1; "selecionar todos" mantido sem ação em lote (fiel); ordenação por código numérica-aware. Itens aprovados: detalhe em modo leitura.                                                                                                           |
| 18   | Textos do alerta de agentes calculados dos dados; teste de conexão determinístico (sucesso) para ser testável.                                                                                                                                                    |
| 19   | Sem números aleatórios; "Atualizado em" = horário da última carga dos dados.                                                                                                                                                                                      |
| 20   | Fontes: gravar todos os campos do modal (exceto o token, que no real fica no backend). Autocomplete de concorrentes consulta `/concorrentes`.                                                                                                                     |
| 21   | Ciclo ativo = ciclo com status ativo em `/ciclos`; textos "PLP-2026-07" vêm dele.                                                                                                                                                                                 |
| 22   | Role bar removida; login por usuário (ver §4).                                                                                                                                                                                                                    |

## 6. Ondas

| Onda | Escopo                                                                                                                                     | PBI                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| 0    | Plataforma: módulo `perfis`, login e sessão, toast no topo, sidebar/topbar fiéis, registro de telas, guarda + Acesso Negado, ToastProvider | 39022, 39027        |
| 1    | UI kit: componentes NOVO e extensões do inventário §4                                                                                      | 39014 (complemento) |
| 2    | Drivers: form, lista, catálogo, drivers da família, exportar                                                                               | 39038 (catálogo)    |
| 3    | Administração DI: ciclos, tipos, tipo-form, aprovações, ingeridos, fontes                                                                  | —                   |
| 4    | Controle de Acesso + Agentes: usuários, perfis, user-form, agentes, agente-form                                                            | —                   |
| 5    | Análises, Restrições, Planos, Relatórios, Dashboard                                                                                        | —                   |

Cada onda: spec (spec-writer) → implementação (spec-developer) → validação (spec-qa) → gates → validação em tela.

## 7. Qualidade além do protótipo

O protótipo é um HTML único que carrega tudo de uma vez. O app precisa tratar o que ele ignora. Toda spec tem uma seção "Requisitos não funcionais" cobrindo os itens que se aplicam.

### 7.1 Paginação, busca e filtros

- Toda lista/tabela é **paginada no servidor** com `_page`/`_limit` do json-server, lendo o total do header `X-Total-Count` (`HttpClient.getPage` devolve `{ data, total }`). Tamanho padrão 10, com seletor 10/25/50 onde a lista passar de 50 registros (SKUs 274, itens do plano 247, famílias 92, tipos 47).
- Busca textual com **debounce de 300 ms** (`q=` ou filtro por campo) e filtros enviados à API. Mudar busca ou filtro volta para a página 1.
- **Estado na URL**: página, tamanho, busca, filtros, ordenação e aba ficam em `searchParams` (link compartilhável, voltar do navegador funciona, F5 mantém a tela).
- Ordenação por coluna no servidor (`_sort`/`_order`) onde o protótipo ordena.
- Listas usadas em selects e autocompletes (SKUs, famílias, concorrentes) buscam sob demanda com limite (ex.: 20 resultados), sem baixar a coleção inteira.
- Paginação mantém os dados anteriores na tela enquanto carrega a próxima página (`placeholderData: keepPreviousData`), sem pular o layout.

### 7.2 Roteamento e carregamento

- Cada tela é uma rota do App Router (code splitting por rota automático). **Nada de "uma página que troca de tela"** como o `goScreen` do protótipo.
- `loading.tsx` por segmento com skeleton fiel ao layout da tela; `error.tsx` por segmento com "Tentar novamente"; `not-found` para id inexistente (detalhe e edição).
- **Lazy loading** com `next/dynamic` para o que é pesado ou só aparece sob ação: gráfico (chart.js, `ssr: false`), modais, chat da análise e editor de importação JSON.
- Prefetch dos links da sidebar (padrão do `<Link>`) e prefetch da próxima página nas listas paginadas.
- Rotas protegidas por perfil não carregam dados de uma tela que o perfil não pode ver (a guarda roda antes das queries).

### 7.3 Dados e cache

- TanStack Query: `staleTime` de 30 s para listas e 5 min para catálogos estáticos (tipos, categorias, perfis, config). Mutação invalida só as chaves afetadas e atualiza os badges da sidebar.
- Ações rápidas (aprovar, rejeitar, toggle de status, excluir) com **atualização otimista** e rollback com toast de erro se a API falhar.
- Botões de salvar desabilitados durante o envio (sem duplo envio) e com estado "Salvando…".
- Excluir sempre pede confirmação (modal), mesmo onde o protótipo não pede.

### 7.4 Formulários

- Validação com zod no domínio/aplicação, mensagens do protótipo e as regras RN-* do documento de negócio (`analise/texto/20260824_Regras_de_Negocio_Apsen_PLP_Agent.txt`). Erro aparece no campo (`FormField error`) e o foco vai para o primeiro campo inválido.
- Aviso de alterações não salvas ao sair de um formulário sujo.
- Datas validadas (início ≤ fim) e números com min/max/step.

### 7.5 Acessibilidade e responsividade

- Navegação completa por teclado, foco visível, `aria-*` corretos, modais com focus trap (já no UI kit), tabelas com `caption`/`scope`, anúncio de toast em `role="status"`.
- Layout utilizável até 360 px: sidebar vira gaveta, tabelas com scroll horizontal no contêiner, grids de formulário colapsam (FormGrid já tem breakpoints).
- Respeitar `prefers-reduced-motion` nas transições.

### 7.6 Segurança e observabilidade (preparação)

- Sem dados pessoais em logs/console (LGPD); nenhum `console.*` no código.
- Security headers no `next.config.ts` (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`).
- O cliente HTTP centraliza headers, timeout (15 s, com `AbortController`) e tratamento de erro, para receber o token do SSO (PBI 39032) num ponto só.

## 8. Fontes documentais

Além do protótipo, consultar e citar quando a regra vier deles:

- `analise/texto/20260824_Regras_de_Negocio_Apsen_PLP_Agent.txt`: regras RN-* (drivers, tipos, formulários, análises, planos, restrições, fontes, agentes, acesso, segurança). Quando a RN e o protótipo divergirem, seguir o protótipo no visual, citar a RN e registrar a divergência em "Perguntas em aberto".
- `analise/00-ANALISE-PROJETO.md` e `analise/01-VISAO-PRODUTO-E-REFINAMENTO.md`: escopo, stack, decisões pendentes (D-xx).
- `docs/Sprint-1-Historias/*.md`: critérios das histórias da Sprint 1 (F3 shell, F4 acesso negado, F6 catálogo).
- `analise/texto/Guia_Feature_Engineering_Drivers.txt`, `c4-apsen-plp-agent_1.txt`, `fluxo-analise-sarimax.txt`: contexto de drivers, arquitetura e análise.

(Caminhos relativos a `C:\Users\marcus.cruz\Documents\Projetos\Apsen-PLP\`.)
