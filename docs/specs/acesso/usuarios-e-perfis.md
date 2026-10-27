---
status: IN_PROGRESS
fase: 41
area: acesso
feature: usuarios-e-perfis
azure-devops-work-item:
---

# Usuários, Cadastro de Usuário e Perfis de Acesso

## 1. Overview

Porta o módulo Controle de Acesso do protótipo (`docs/Negócio/di-drivers-v2_84.html`): `usuarios` (L1980–2084, `toggleUserStatus` L3960), `user-form` (L2147–2236, `PERFIL_HINTS`/`ufPerfilChange` L3968–3979) e `perfis` (L2087–2144). O admin lista, busca e filtra usuários (filtros sem lógica no protótipo — ARQUITETURA #13), ativa/inativa, cria, edita e remove; o planejador e o admin consultam a matriz de permissões. Tudo persiste via API (`/usuarios`; `/permissoes` só leitura; `/perfis` e `/categorias` como apoio).

Regras de negócio: RN-ACS-01 (identidade via SSO/Entra ID — o formulário não tem senha), RN-ACS-04 (tela não permitida → acesso negado, guarda da onda 0), RN-ACS-05 (CRUD de usuários restrito ao Admin; perfis visíveis ao Planejador), RN-SEG-03 (IDs não sequenciais), RN-SEG-04 (sem dados pessoais em logs).

Onda 4, fase provisória 41 (onda 4 → 4x). Inventário §2.13–2.15.

**Dependências:** as da spec [ciclos](../admin/ciclos.md) §1 (plataforma, onda 1, `useListSearchParams`, `useDebouncedValue`, `IdGenerator`); `ConfirmDialog` ([fontes](../admin/fontes.md)); `useUnsavedChangesGuard` e `useCategorias`/`ListCategorias` ([tipos](../admin/tipos.md)); módulo `perfis` da onda 0 (`useCases.perfis.list`, hook `usePerfis`, entidade `Perfil { id; level; label; hint; … }`); da onda 1 `Breadcrumb`, `StatusField`, `FormActions`, `CardSectionLabel`, `ChipMultiSelect`, `Toolbar`, `Tooltip` com `ReactNode`.

**Decisões [derivado]:**

- `podeRegistrar`, `podeValidar`, `admin` e `perfilLabel` são derivados do perfil ao salvar (nível ≥ 2, ≥ 3, = 4; label de `/perfis`), como na massa do `db.json`.
- Categorias autorizadas (só perfil Área) são gravadas em `categorias` (slugs); outros perfis gravam `[]`.
- Usuário novo: `id` UUID, `ultimoAcesso: "—"`, `removivel: true`. IDs numéricos legados (1–4) são normalizados para string.
- Em edição, a área atual fora da lista (ex.: "S&OP") entra como opção extra; o breadcrumb diz "Editar Usuário".
- Status pelo toggle da tabela grava `ativo` (otimista) sem toast (o protótipo não tem toast).
- Exclusão confirma (`Remover o usuário "{nome}"?`).

**Perguntas em aberto:**

- PO: RN-ACS-02 prevê perfis/grupos e permissões configuráveis pela aplicação (ex.: Colaboradores, Gestores, Diretores, Admins); o protótipo tem 4 perfis fixos e matriz só leitura. Mantido o protótipo.
- PO: a matriz não cobre análises, restrições, ciclos, agentes e fontes, e contradiz `SCREEN_ROLES` em alguns pontos (INVENTARIO §6 #11); exibida como está nos dados.
- PO: `perfis` é nível 3 mas o menu só aparece para Admin (`setRole`); seguida a ARQUITETURA §4 (acesso por `SCREEN_ROLES`, menu por `setRole`).
- PO: usuários inativos "não conseguem acessar o módulo" — sem efeito real enquanto não há SSO (PBI 39032).

## 2. Critérios de aceite

| ID    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | `/acesso/usuarios` mostra o header "Usuários" / "Controle de acesso ao módulo Demand Intelligence" com "+ Novo Usuário" (purple sm → `/acesso/usuarios/novo`), o `ScreenDesc` 👥 (L1992–1995), a toolbar (busca "Buscar por nome, e-mail ou área..." e select "Todos os perfis", Admin, Planejador, Área (usuário), Visualizador), o resumo "**{n} usuários** cadastrados" ("1 usuário") e a tabela.                                                                                                                                                 |
| CA-02 | Busca (debounce 300 ms, servidor) e perfil (servidor, `perfil={id}`) filtram, ficam na URL (`q`, `perfil`, `page`) e voltam para a página 1. Tabela paginada no servidor (10 por página, ordem por nome).                                                                                                                                                                                                                                                                                                                                            |
| CA-03 | Colunas Nome · E-mail · Perfil · Área · Pode registrar · Pode validar · Admin · Último acesso · Status · Ações com o visual de L2011–2081: nome 500; e-mail 12px muted; Badge purple Admin / blue Planejador / teal Área / gray Visualizador; ✓ verde 15px ou — muted-2 13px centralizados; Toggle + "Ativo"/"Inativo"; ✏️ e 🗑 (sem 🗑 quando `removivel: false`).                                                                                                                                                                                    |
| CA-04 | O Toggle de status muda na hora (otimista) e grava `PATCH {ativo}`; falha restaura e mostra o toast de falha.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| CA-05 | 🗑 abre `Remover o usuário "{nome}"?`; confirmar remove a linha na hora, faz `DELETE` e mostra "🗑 Usuário removido."; falha restaura.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CA-06 | `/acesso/usuarios/novo` mostra o breadcrumb "Usuários › Cadastrar Usuário", "← Voltar", o `ScreenDesc` 👤 e o card "Dados do Usuário" com Nome completo `*`, E-mail corporativo `*`, Área / Departamento `*` (8 áreas) e Perfil de acesso `*` (⚙️ Admin, 📋 Planejador, 🏢 Área (usuário), 👁 Visualizador; tooltip de L2182); escolher o perfil mostra o hint do perfil (`/perfis[].hint`) e, só para Área, o bloco "Categorias de Driver Autorizadas" com o hint de L2197–2200 e os 10 chips multi-seleção; `StatusField` "Ativo / Inativo" ligado. |
| CA-07 | "Salvar Usuário" valida (RN-03) com erro no campo, foco no primeiro inválido e toast; válido grava (RN-04), mostra "✅ Usuário salvo!" e volta para `/acesso/usuarios`. "Salvando…" desabilitado durante o envio; "Cancelar" volta.                                                                                                                                                                                                                                                                                                                  |
| CA-08 | `/acesso/usuarios/{id}/editar` pré-preenche tudo (categorias marcadas para Área), breadcrumb "Usuários › Editar Usuário"; salvar faz `PATCH` e "✅ Usuário salvo!". Id inexistente → `not-found` ("Usuário não encontrado" + "← Voltar").                                                                                                                                                                                                                                                                                                            |
| CA-09 | Sair do formulário sujo pede "Descartar alterações?".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| CA-10 | `/acesso/perfis` mostra o header "Perfis de Acesso" / "Matriz de permissões por perfil", o `ScreenDesc` 🔐 (L2096–2098) e o card "Matriz de Permissões" com a tabela sem borda: Funcionalidade (min 200px) · 👁 Visualizador (muted) · 🏢 Área (teal) · 📋 Planejador (azul) · ⚙️ Admin (roxo); linhas-grupo na ordem dos dados (Drivers de Demanda, Administração DI, Controle de Acesso); células "✓", "—" (muted-2) e "✓ (só suas cat.)" (teal, parêntese 11px).                                                                                   |
| CA-11 | Estados em todas as telas: skeleton (`loading.tsx`), erro com "Tentar novamente", vazio ("Nenhum usuário encontrado." / "Nenhuma permissão cadastrada.") e dados.                                                                                                                                                                                                                                                                                                                                                                                    |

## 3. UX / Fluxo de tela

Rotas (Server Components finos; `params` é `Promise`):

- `src/app/acesso/usuarios/page.tsx` (`metadata.title = 'Usuários'`), `loading.tsx`, `error.tsx`.
- `src/app/acesso/usuarios/novo/page.tsx` (`'Novo Usuário'`).
- `src/app/acesso/usuarios/[id]/editar/page.tsx` (`'Editar Usuário'`; `const { id } = await params`), `loading.tsx`, `not-found.tsx`.
- `src/app/acesso/perfis/page.tsx` (`'Perfis de Acesso'`), `loading.tsx`, `error.tsx`.

Referências: `DESIGN_SPEC.md` §3.2 `Badge`, §3.4 chips, §3.14, §3.15, §3.17, §3.20; `Breadcrumb`, `StatusField`, `FormActions`, `CardSectionLabel`, `ChipMultiSelect`, `Toolbar` da onda 1.

### `usuarios`

| Bloco     | Componente                                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header    | `PageHeader` + `ButtonLink variant="purple" size="sm"` "+ Novo Usuário"                                                                                                                                                                                                                                                                                                                                 |
| Descrição | `ScreenDesc icon="👥"`                                                                                                                                                                                                                                                                                                                                                                                  |
| Toolbar   | `Toolbar`: `SearchInput aria-label="Buscar usuários"` + `FormSelect className="w-auto text-[13px]" aria-label="Perfil"`                                                                                                                                                                                                                                                                                 |
| Resumo    | `<p className="mb-[12px] text-[13px] text-apsen-muted"><strong>{n} usuários</strong> cadastrados</p>`                                                                                                                                                                                                                                                                                                   |
| Tabela    | `Table caption="Usuários do módulo Demand Intelligence"`; `UsuarioStatusCell` (`flex items-center gap-[7px]`, `Toggle aria-label="Usuário {nome} ativo"`, rótulo `text-[12px] font-medium` verde/muted); `PermissionCheck` (✓/—); ações `IconLink` lápis (`aria-label="Editar {nome}"`) e `IconButton tone="red"` lixeira (`aria-label="Remover {nome}"`); `footer` `Pagination` com mais de uma página |

### `user-form` (L2147–2236)

1. `Breadcrumb items={[{label:'Usuários', href:'/acesso/usuarios'}, {label: modo === 'novo' ? 'Cadastrar Usuário' : 'Editar Usuário'}]}` + `ButtonLink ghost sm` "← Voltar" `mb-[16px]`.
2. `ScreenDesc icon="👤"` (L2156–2158).
3. `Card` → `CardTitle` "Dados do Usuário" → `FormGrid columns={2}`: Nome completo `*` ("Ex: Ana Paula Ferreira") · E-mail corporativo `*` (`type="email"`, "usuario@apsen.com.br") · Área / Departamento `*` (`FormSelect` placeholder "Selecione...", `USUARIO_AREAS`) · Perfil de acesso `*` (tooltip L2182; `FormSelect` placeholder "Selecione...", `USUARIO_PERFIS`; `FormField hint` = hint do perfil).
4. Só perfil `area`: `CardSectionLabel` "Categorias de Driver Autorizadas" + hint (`mb-[10px]`, L2198–2199 com `<strong>Área</strong>`) + `ChipMultiSelect label="Categorias de driver autorizadas"` com `categorias[].label` por `slug`.
5. `StatusField title="Ativo / Inativo" description="Usuários inativos não conseguem acessar o módulo."` (`mt-[16px]`) + `FormActions className="mt-[14px]"`: `Button ghost` "Cancelar" · `Button purple` "Salvar Usuário".

### `perfis` (L2087–2144)

`PageHeader` (sem ações) · `ScreenDesc icon="🔐"` · `Card` → `CardTitle` "Matriz de Permissões" → `PermissionMatrix` (feature): `div` `overflow-x-auto` sem borda/sombra → `table` `w-full border-collapse` com `caption` sr-only "Matriz de permissões por perfil"; `th scope="col"` como §3.13 (Funcionalidade `min-w-[200px]`; demais `text-center` nas cores `text-apsen-muted|teal|blue|purple`); linha-grupo `<th scope="colgroup" colSpan={5} className="bg-apsen-bg px-[14px] py-[8px] text-left text-[11px] font-bold uppercase tracking-[.06em] text-apsen-muted">`; funcionalidade `text-[13px]` (`th scope="row"` sem negrito); células `text-center`: "✓" slate, "—" `text-apsen-muted-2`, "✓ (só suas cat.)" `text-apsen-teal` com `<span className="text-[11px]">(só suas cat.)</span>`.

### Textos

| Situação                  | Texto                                                              |
| ------------------------- | ------------------------------------------------------------------ |
| salvar                    | "✅ Usuário salvo!"                                                |
| remover                   | `Remover o usuário "{nome}"?` / "Remover" · "🗑 Usuário removido."  |
| validação [derivado]      | RN-03                                                              |
| falha                     | "⚠️ Não foi possível salvar as alterações. Tente novamente."       |
| não encontrado [derivado] | "Usuário não encontrado" / "O usuário não existe ou foi removido." |

## 4. Contratos de API consumidos

| Uso                               | Requisição                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| lista                             | `GET /usuarios?_page={p}&_limit=10&_sort=nome&_order=asc[&q=][&perfil=]` via `getPage` |
| usuário                           | `GET /usuarios/{id}` (404 → não encontrado)                                            |
| e-mail repetido                   | `GET /usuarios?email={email}`                                                          |
| criar / editar / status / remover | `POST /usuarios` · `PATCH /usuarios/{id}` · `DELETE /usuarios/{id}`                    |
| permissões                        | `GET /permissoes?_page=1&_limit=50` via `getPage` (11 linhas, `staleTime` 5 min)       |
| apoio                             | `GET /perfis` (onda 0) · `GET /categorias` (spec tipos)                                |

Usuário do `db.json` e `POST` de usuário de Área:

```json
{
  "id": 3,
  "nome": "Fernanda Marketing",
  "email": "fernanda.mkt@apsen.com.br",
  "perfil": "area",
  "perfilLabel": "Área",
  "area": "Marketing",
  "podeRegistrar": true,
  "podeValidar": false,
  "admin": false,
  "ultimoAcesso": "18/06/2026",
  "ativo": true,
  "removivel": true
}
```

```json
{
  "id": "c0a8…",
  "nome": "Ana Paula Ferreira",
  "email": "ana.ferreira@apsen.com.br",
  "perfil": "area",
  "perfilLabel": "Área",
  "area": "Marketing",
  "podeRegistrar": true,
  "podeValidar": false,
  "admin": false,
  "ultimoAcesso": "—",
  "ativo": true,
  "removivel": true,
  "categorias": ["midia", "comercial"]
}
```

Permissão: `{ "id": 2, "grupo": "Drivers de Demanda", "funcionalidade": "Registrar novo driver", "viewer": "—", "area": "✓ (só suas cat.)", "planejador": "✓", "admin": "✓" }`.

Schemas Zod:

```ts
const perfilId = z.enum(['admin', 'planejador', 'area', 'viewer']);
export const usuarioDtoSchema = z.object({
  id: z.union([z.string().min(1), z.number().int()]),
  nome: z.string(),
  email: z.string(),
  perfil: perfilId,
  perfilLabel: z.string(),
  area: z.string(),
  podeRegistrar: z.boolean(),
  podeValidar: z.boolean(),
  admin: z.boolean(),
  ultimoAcesso: z.string(),
  ativo: z.boolean(),
  removivel: z.boolean(),
  categorias: z.array(z.string()).optional(),
});
export const permissaoDtoSchema = z.object({
  id: z.union([z.string(), z.number()]),
  grupo: z.string(),
  funcionalidade: z.string(),
  viewer: z.string(),
  area: z.string(),
  planejador: z.string(),
  admin: z.string(),
});
```

Erros: inválido → `InvalidResponseError`; 404 → `NotFoundError('Usuário', id)` (a tela chama `notFound()`); 5xx/rede/timeout propagados.

## 5. Domínio (`src/domain`)

`src/domain/usuarios/`:

- `Usuario.ts` — `type PerfilId = 'admin' | 'planejador' | 'area' | 'viewer'`; `interface Usuario { id: string; nome; email; perfil; perfilLabel; area; podeRegistrar; podeValidar; admin; ultimoAcesso; ativo; removivel; categorias: string[] }`; `interface UsuarioDraft { nome; email; area; perfil: PerfilId | ''; categorias: string[]; ativo }`.
- `vocabulario.ts` — `USUARIO_AREAS` (8), `USUARIO_PERFIS` (value/label), `USUARIO_FILTRO_PERFIS` (`{ label: 'Área (usuário)', value: 'area' }`…), `PERFIL_BADGE_TONE` (`admin: purple, planejador: blue, area: teal, viewer: gray`) — espelham `config.opcoes`.
- `usuarioRules.ts` — `capacidades(level)` → `{ podeRegistrar: level >= 2, podeValidar: level >= 3, admin: level === 4 }`; `EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`; `validateUsuarioDraft(draft, { emailEmUso })` → erros por campo (RN-03); `resumoUsuarios(n)` → "{n} usuários" / "1 usuário"; `areaOptions(atual)` (lista + atual se ausente).
- `UsuarioRepository.ts` — `listPage({q, perfil}, {page,size})`, `get(id)`, `findByEmail(email)`, `create`, `update`, `delete`.
- `UsuarioValidationError`, `UsuarioProtegidoError` ("Este usuário não pode ser removido.").

`src/domain/permissoes/`: `Permissao.ts` (`{ id; grupo; funcionalidade; viewer; area; planejador; admin }`); `permissaoRules.ts` — `agruparPermissoes(list)` (ordem de aparição) e `celula(valor)` → `{ kind: 'sim' | 'nao' | 'parcial'; texto; detalhe?: string }` ("✓ (só suas cat.)" → parcial com detalhe "(só suas cat.)"); `PermissaoRepository.ts` (`list()`).

## 6. Aplicação (`src/application`)

- `src/application/usuarios/`: `ListUsuarios(repo)` → `{ rows: UsuarioRowDto[]; total; totalPages; resumo }`; `GetUsuarioForm(repo)` → `{ draft; areaExtra: string | null }` (`NotFoundError`); `SaveUsuario(repo, perfis: PerfilRepository, ids)` → `{ toast: '✅ Usuário salvo!' }` (RN-03/RN-04); `ToggleUsuarioAtivo(repo)`; `DeleteUsuario(repo)` → `{ toast: '🗑 Usuário removido.' }` (recusa `removivel: false`).
- `src/application/permissoes/ListPermissoes(repo)` → `{ grupos: { grupo; linhas: { id; funcionalidade; celulas: Record<PerfilId, Celula> }[] }[] }`.

## 7. Infraestrutura (`src/infrastructure`)

- `src/infrastructure/usuarios/{usuarioSchema,usuarioMapper,HttpUsuarioRepository}.ts` — `id` → `String(id)`, `categorias ?? []`; queries do §4.
- `src/infrastructure/permissoes/{permissaoSchema,HttpPermissaoRepository}.ts`.

## 8. Apresentação (`src/presentation`)

- `queryKeys.usuarios = { all: ['usuarios'], page: (f,p) => ['usuarios','page',f,p], form: (id) => ['usuarios','form',id] }`; `queryKeys.permissoes = { all: ['permissoes'] }`.
- Hooks: `useUsuariosPage` (`keepPreviousData`, 30 s), `useUsuarioForm(id)`, `useSaveUsuarioMutation` (invalida `usuarios.all`), `useToggleUsuarioMutation` e `useDeleteUsuarioMutation` (otimistas com rollback), `usePermissoes` (5 min).
- URL: `useListSearchParams` com `q` (debounce), `perfil`, `page`.
- Features: `src/presentation/features/usuarios/{UsuariosScreen,UsuarioFormScreen}.tsx` + `components/{UsuariosToolbar,UsuariosTable,UsuarioStatusCell,PermissionCheck,UsuarioDadosCard,CategoriasAutorizadas}.tsx`; `src/presentation/features/perfis/PerfisScreen.tsx` + `components/PermissionMatrix.tsx`. O formulário usa `useReducer`, `useUnsavedChangesGuard(dirty)` e foco no primeiro inválido.
- `UseCases.usuarios = { list; getForm; save; toggle; remove }`, `UseCases.permissoes = { list }`; `createContainer` registra os repositórios.

## 9. Arquivos

### Novos

- `src/domain/usuarios/{Usuario,vocabulario,usuarioRules,UsuarioRepository,errors}.ts` e `__tests__/{usuarioRules,vocabulario}.test.ts`
- `src/domain/permissoes/{Permissao,permissaoRules,PermissaoRepository}.ts` e `__tests__/permissaoRules.test.ts`
- `src/application/usuarios/{ListUsuarios,GetUsuarioForm,SaveUsuario,ToggleUsuarioAtivo,DeleteUsuario,dto}.ts` e `__tests__/*.test.ts`
- `src/application/permissoes/ListPermissoes.ts` e `__tests__/ListPermissoes.test.ts`
- `src/infrastructure/usuarios/*`, `src/infrastructure/permissoes/*` e `__tests__/Http*Repository.test.ts`
- `src/presentation/hooks/{useUsuarios,useUsuarioMutations,usePermissoes}.ts` e `__tests__/useUsuarioMutations.test.tsx`
- `src/presentation/features/usuarios/*`, `src/presentation/features/perfis/*` e `__tests__/{UsuariosScreen,UsuarioFormScreen,PerfisScreen}.test.tsx`
- `src/app/acesso/usuarios/{page,loading,error}.tsx`, `novo/page.tsx`, `[id]/editar/{page,loading,not-found}.tsx`, `src/app/acesso/perfis/{page,loading,error}.tsx` e `__tests__/page.test.tsx` em cada pasta

### Modificados

- `queryKeys.ts`, `UseCasesContext.tsx`, `container.ts` (+ teste), `test/renderWithProviders.tsx` — módulos `usuarios` e `permissoes`.
- `src/presentation/navigation/routes.ts` — `USUARIOS_ROUTE`, `USUARIO_NOVO_ROUTE`, `usuarioEditarRoute(id)`, `PERFIS_ROUTE` (se ausentes); `screens.ts` cobre `/acesso/usuarios/[id]/editar` (nível 4).
- Badge "Usuários" da sidebar: `total` de `useUsuariosPage({page:1,size:1})` sem filtros (deixa de ser o 4 fixo).

## 10. Regras de negócio

| RN    | Descrição                                                                                                                                                                                                                                                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | Filtros: `q` (texto, servidor) e `perfil` (id); o select mostra os labels do protótipo e envia o id; vazios omitidos; página 1 ao mudar (ARQUITETURA #13).                                                                                                                                                                                                                                              |
| RN-02 | Badge do perfil por `PERFIL_BADGE_TONE` com texto `perfilLabel`; ✓/— das capacidades vêm dos campos gravados.                                                                                                                                                                                                                                                                                           |
| RN-03 | Validação [derivado], ordem: nome vazio → "⚠️ Informe o nome completo."; e-mail vazio ou fora de `EMAIL_REGEX` → "⚠️ Informe um e-mail corporativo válido."; e-mail já usado por outro usuário → "⚠️ Já existe um usuário com este e-mail."; sem área → "⚠️ Selecione a área / departamento."; sem perfil → "⚠️ Selecione o perfil de acesso.". Categorias não são obrigatórias (sem `*` no protótipo). |
| RN-04 | Salvar: `nome`/`email` com `trim` (e-mail em minúsculas), `perfilLabel` e capacidades derivados do perfil (`capacidades(level)` com `level` de `/perfis`), `categorias` só para `area`, `ativo` do `StatusField`. Novo: `id` UUID (RN-SEG-03), `ultimoAcesso: "—"`, `removivel: true`. Edição: `PATCH` sem mudar `id`, `ultimoAcesso`, `removivel`.                                                     |
| RN-05 | Usuário com `removivel: false` não tem 🗑 e `DeleteUsuario` recusa.                                                                                                                                                                                                                                                                                                                                      |
| RN-06 | O hint do perfil é `perfis[].hint` (fonte `PERFIL_HINTS`); o bloco de categorias só aparece para `area`.                                                                                                                                                                                                                                                                                                |
| RN-07 | Matriz: grupos na ordem de aparição, células com o texto do dado; somente leitura (RN-ACS-05 — perfis visíveis ao Planejador).                                                                                                                                                                                                                                                                          |
| RN-08 | Acesso às telas por `SCREEN_ROLES` (usuários/user-form 4, perfis 3), botões de escrita sem checagem extra (ARQUITETURA #11, RN-ACS-04).                                                                                                                                                                                                                                                                 |

## 11. BDD — Cenários de teste unitário

| Cenário                                                                                                 | Arquivo de teste                                                                                                                                 | Asserção                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-04 Dado níveis 1–4, quando calcula capacidades, então batem com a massa                              | `src/domain/usuarios/__tests__/usuarioRules.test.ts`                                                                                             | as quatro combinações dos 4 usuários do db.json                                                                                               |
| RN-03 Dado rascunhos inválidos, quando valida, então mensagens na ordem                                 | `usuarioRules.test.ts`                                                                                                                           | as cinco mensagens; e-mail "a@b" inválido                                                                                                     |
| §5 Dado o db.json, quando compara o vocabulário, então áreas, perfis e filtros batem                    | `src/domain/usuarios/__tests__/vocabulario.test.ts`                                                                                              | `usuarioAreas`, `usuarioPerfis`, `usuarioFiltroPerfis`                                                                                        |
| RN-07 Dado as 11 permissões, quando agrupa, então 3 grupos e células                                    | `src/domain/permissoes/__tests__/permissaoRules.test.ts`                                                                                         | 4/5/2 linhas; `celula('✓ (só suas cat.)')` = parcial com detalhe                                                                              |
| RN-01 CA-02 Dado filtros, quando ListUsuarios executa, então repassa e monta resumo                     | `src/application/usuarios/__tests__/ListUsuarios.test.ts`                                                                                        | `{q:'mkt', perfil:'area'}`; "1 usuário"; ids string                                                                                           |
| RN-04 CA-07 Dado usuário de Área novo, quando SaveUsuario executa, então POST com UUID e derivados      | `SaveUsuario.test.ts`                                                                                                                            | corpo do §4; e-mail repetido → `UsuarioValidationError` sem gravar; perfil admin grava `categorias: []` e `admin: true`                       |
| CA-08 Dado edição, quando salva, então PATCH sem id/ultimoAcesso/removivel                              | `SaveUsuario.test.ts`                                                                                                                            | chaves do patch; e-mail do próprio usuário não conta como repetido                                                                            |
| RN-05 CA-05 Dado Ana Admin, quando DeleteUsuario executa, então recusa; outro remove                    | `DeleteUsuario.test.ts`                                                                                                                          | `UsuarioProtegidoError`; `delete('2')` + "🗑 Usuário removido."                                                                                |
| CA-04 Dado toggle, quando executa, então PATCH ativo                                                    | `ToggleUsuarioAtivo.test.ts`                                                                                                                     | `update('4',{ativo:true})`                                                                                                                    |
| CA-08 Dado área "S&OP", quando GetUsuarioForm executa, então `areaExtra`                                | `GetUsuarioForm.test.ts`                                                                                                                         | `areaExtra` "S&OP"; 404 → `NotFoundError`                                                                                                     |
| §4 Dado a API, quando os repositórios consultam, então queries e schemas                                | `src/infrastructure/usuarios/__tests__/HttpUsuarioRepository.test.ts`, `src/infrastructure/permissoes/__tests__/HttpPermissaoRepository.test.ts` | `_sort=nome`, `q`, `perfil`; id numérico vira string; `perfil:'x'` → `InvalidResponseError`                                                   |
| CA-01 CA-03 Dado a massa, quando renderiza, então toolbar, resumo e colunas                             | `src/presentation/features/usuarios/__tests__/UsuariosScreen.test.tsx`                                                                           | "4 usuários"; Badge "Admin" roxo; Ana Admin sem "Remover Ana Admin"; Pedro com switch desmarcado e "Inativo"                                  |
| CA-02 Dado busca e perfil, quando muda, então URL e página 1                                            | `UsuariosScreen.test.tsx`                                                                                                                        | fake timers 300 ms; `perfil=area` na URL                                                                                                      |
| CA-04 CA-05 Dado toggle e remoção, quando a API falha, então rollback                                   | `UsuariosScreen.test.tsx`                                                                                                                        | otimista e volta + toast de falha; `dialog` `Remover o usuário "Pedro Viewer"?`                                                               |
| CA-06 RN-06 Dado `/acesso/usuarios/novo`, quando escolhe Área, então hint e chips; outro perfil esconde | `UsuarioFormScreen.test.tsx`                                                                                                                     | breadcrumb "Cadastrar Usuário"; hint "Registra drivers apenas das categorias autorizadas…"; 10 chips; Admin → sem chips                       |
| CA-07 Dado nome vazio, quando salva, então erro, foco e toast; válido navega                            | `UsuarioFormScreen.test.tsx`                                                                                                                     | `aria-invalid` + foco; "⚠️ Informe o nome completo."; válido → toast "✅ Usuário salvo!" e `routerMock.push('/acesso/usuarios')`; "Salvando…" |
| CA-08 Dado `/acesso/usuarios/3/editar`, quando carrega, então pré-preenche; inexistente chama notFound  | `UsuarioFormScreen.test.tsx`                                                                                                                     | "Editar Usuário"; perfil Área com chips marcados; `notFound` chamado em 404                                                                   |
| CA-09 Dado formulário sujo, quando clica "← Voltar", então confirma                                     | `UsuarioFormScreen.test.tsx`                                                                                                                     | `dialog` "Descartar alterações?"                                                                                                              |
| CA-10 RN-07 Dado as permissões, quando renderiza, então grupos, cabeçalhos coloridos e células          | `src/presentation/features/perfis/__tests__/PerfisScreen.test.tsx`                                                                               | 3 `th scope="colgroup"`; cabeçalho "🏢 Área" `text-apsen-teal`; "(só suas cat.)" `text-[11px]`; "—" `text-apsen-muted-2`                      |
| CA-11 Dado carregando/erro/vazio, quando renderiza, então estados                                       | `UsuariosScreen.test.tsx`, `PerfisScreen.test.tsx`                                                                                               | "Carregando…"; "Tentar novamente"; "Nenhum usuário encontrado."/"Nenhuma permissão cadastrada."                                               |
| §3 Dado as rotas, quando renderiza, então metadata e `params` Promise                                   | `src/app/acesso/**/__tests__/page.test.tsx`                                                                                                      | títulos; edição `await params`                                                                                                                |

## 12. Requisitos não funcionais

| Item | Como atende                                                                                                                                                                                   |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §7.1 | Usuários paginados no servidor com busca (debounce) e filtro, estado na URL, `keepPreviousData`; permissões em uma consulta limitada (`_limit=50`).                                           |
| §7.2 | Rotas próprias, `loading.tsx`, `error.tsx`, `not-found.tsx` (edição); guarda antes das queries (usuários nível 4, perfis nível 3).                                                            |
| §7.3 | `staleTime` 30 s (usuários) e 5 min (permissões, perfis, categorias); toggle e exclusão otimistas com rollback e confirmação; "Salvando…".                                                    |
| §7.4 | Erros por campo, foco no primeiro inválido, toast; `type="email"`; aviso de alterações não salvas.                                                                                            |
| §7.5 | Matriz com `th` de grupo e de linha (`scope`); toggles e ações com nome do usuário; chips com `aria-pressed`/papel da onda 1; tabelas com scroll em 360 px; `FormGrid` colapsa.               |
| §7.6 | RN-SEG-04/LGPD: e-mails e nomes não vão para logs, URLs ou mensagens de erro (a busca usa `q` mas o valor não é logado); sem `console`; IDs UUID (RN-SEG-03); sem campo de senha (RN-ACS-01). |
