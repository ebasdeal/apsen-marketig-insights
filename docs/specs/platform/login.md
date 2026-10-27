---
status: REVIEW
fase: 9
area: platform
work item: 39027 (perfis/guarda) · prepara 39032 (SSO Entra ID)
---

# Autenticação por SSO com redirecionamento (sem tela de login)

## 1. Overview

Decisões do usuário em 27/10/2026:

1. A role bar "Simular perfil" do protótipo **sai do app**. O acesso vem do perfil do usuário autenticado (`usuarios[].perfil` → `perfis`).
2. **Não existe tela de login no app.** Confirmado pela Apsen e pelos documentos: RN-ACS-01 ("A autenticação (entrada) é feita via SSO … Microsoft Entra ID. A aplicação não mantém senhas próprias."), RN-SEG-01, C4 ("acessam via navegador, autenticados por SSO") e F5/39032 (CA-01 "sem sessão, qualquer rota leva ao login e depois volta à rota pedida"; CA-04 "login real redireciona ao Entra ID e volta autenticado"). Sem sessão, a pessoa é **redirecionada direto** para o provedor de identidade.

Fora de produção (F5 CA-03, login simulado), o provedor de identidade é **simulado pela API local** (`mock-api/server.mjs`), com o mesmo fluxo de redirecionamento: o app nunca mostra formulário de login. Em produção, o provedor é o Microsoft Entra ID (implementação real na PBI 39032).

Substitui na spec `prototipo-plataforma.md` a role bar, o `RoleSwitcher`, `NEXT_PUBLIC_ROLE_SIMULATOR` (RN-13) e a store de perfil simulado. Todo o resto daquela spec continua, lendo o perfil da **sessão**.

### 1.1 Quem pode entrar (decisões de 27/10/2026 — substituem o provisionamento automático)

- O AD/Entra ID **só autentica**. Quem é e o que acessa fica no sistema.
- **Só entra quem o Administrador cadastrou** (pré-cadastro na tela de Usuários, com nome, e-mail corporativo, perfil e área). Os primeiros admins são cadastrados direto no banco (no mock: Ana Admin).
- Conta que autentica no Entra ID mas **não está cadastrada**: `POST /auth/token` → 403 `{ codigo: "nao_cadastrado" }`. O app mostra em tela cheia (sem shell e sem formulário) "Seu acesso ao Demand Intelligence ainda não foi liberado. Solicite o cadastro ao administrador." com "Tentar novamente" (volta ao provedor). A pessoa fica nesse ciclo até ser cadastrada — não existe tela de login nem auto-cadastro.
- **Usuário inativo** entra, mas **só visualiza**: o app mostra um aviso fixo "Seu usuário está inativo: acesso somente para visualização.", esconde/desabilita as ações de escrita, e a API recusa qualquer escrita com 403 `{ codigo: "somente_leitura" }` (o app mostra o toast de erro). `usuario.ativo` vem na sessão.
- **Admin pode tudo.** Os demais perfis seguem as Regras de Negócio. Cadastrar, editar, inativar e **excluir** usuários: Administrador (Planejador por enquanto também pode excluir — a confirmar, PRG-ACS-01). Usuário excluído, ao entrar de novo, cai no caso "não cadastrado".
- Inativar e excluir sempre pedem confirmação ("Tem certeza?"). Mudanças de perfil e status registram quem alterou e quando, visíveis na tela de Usuários (PRG-ACS-09).
- Pode registrar / pode validar / admin são sempre consequência do perfil (não se ajustam por pessoa).

## 2. Fluxo

```
rota do app sem sessão
  └─► AuthGate: SsoProvider.redirecionarParaLogin(rotaAtual)
        └─► provedor de identidade (simulado: {API}/sso/authorize · produção: Entra ID)
              └─► {app}/auth/callback?code=…&state={rotaAtual}
                    └─► POST {API}/auth/token {code} → { token, usuario }
                          └─► sessão salva → router.replace(state validado)
Sair (menu do usuário)
  └─► POST {API}/auth/logout → limpa sessão e cache → SsoProvider.redirecionarParaLogout()
        └─► simulado: {API}/sso/logout?post_logout_redirect_uri={app}/ · produção: logout do Entra ID
```

## 3. Critérios de aceite

| CA    | Critério                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-01 | Sem sessão válida, qualquer rota do app redireciona (`window.location.assign`) para o provedor de identidade, com `redirect_uri = {origin}/auth/callback` e `state = rota atual` (path + query). Não há rota `/login` nem formulário de login no app. Enquanto redireciona, o shell não é montado; aparece só o `LoadingState` "Redirecionando para o login…".                                                             |
| CA-02 | `/auth/callback?code&state`: troca o código em `POST /auth/token`, salva a sessão e faz `router.replace(state)` se `state` for rota interna segura (começa com `/` e não com `//`; senão `/`). O perfil do usuário define sidebar, guarda e badges (regras de `setRole` do protótipo).                                                                                                                                     |
| CA-03 | Erros no callback mostram `ErrorState` em tela cheia (sem shell), com botão "Tentar novamente" que reinicia o login: sem `code` ou código inválido/expirado (401) → "Não foi possível concluir o login. Tente novamente."; usuário inativo (403) → "Usuário inativo. Fale com o administrador do sistema."; rede/timeout → `toUserMessage`.                                                                                |
| CA-04 | Sessão persiste no F5 e acaba ao fechar a aba (`sessionStorage`). Ao carregar, `GET /auth/me` valida o token. 401 em qualquer chamada da API → limpa a sessão e reinicia o login com a rota atual como `state`.                                                                                                                                                                                                            |
| CA-05 | Topbar: avatar (letra e cor do perfil, como no protótipo) + nome; clicar abre menu com nome, e-mail, perfil e "Sair". Menu acessível: botão `aria-haspopup="menu"`, `aria-expanded`, setas navegam, Esc fecha e devolve o foco.                                                                                                                                                                                            |
| CA-06 | Sair: `POST /auth/logout`, limpa sessão e todo o cache do TanStack Query e chama `redirecionarParaLogout()`.                                                                                                                                                                                                                                                                                                               |
| CA-07 | `NEXT_PUBLIC_AUTH_MODE` = `simulado` \| `entra`. Ausente: `simulado` fora de produção, `entra` com `NODE_ENV=production`; em produção sempre `entra`. `simulado` usa `MockSsoProvider` (URLs da API local); `entra` usa `EntraSsoProvider`, que nesta onda lança `SsoNaoConfiguradoError` → `ErrorState` "Login Microsoft ainda não configurado (App Registration do Entra ID pendente)." A integração real é a PBI 39032. |
| CA-08 | Token nunca em log, URL do app (exceto o `code` de uso único no callback, removido do histórico com `router.replace`) ou `localStorage`.                                                                                                                                                                                                                                                                                   |

## 4. Contratos (mock-api/server.mjs — já implementado)

| Método | Rota                                   | Descrição                                                                                                                                                                                                              |
| ------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/sso/authorize?redirect_uri&state`    | Página do provedor simulado (fora do app): escolhe a conta (4 usuários do `db.json`, inativo marcado) (sem senha). `redirect_uri` só para `http://localhost`/`127.0.0.1` (ou `MOCK_SSO_ALLOWED_ORIGINS`); outro → 400. |
| POST   | `/sso/authorize`                       | Form. E-mail fora de `@apsen.com.br` → 400 na própria página. Sucesso → 302 para `redirect_uri?code&state`. Código de uso único, válido por 60 s.                                                                      |
| POST   | `/auth/token`                          | `{ code }` → 200 `{ token, usuario: { id, nome, email, perfil, perfilLabel, area } }` · 401 código inválido/expirado/reusado · 403 usuário inativo.                                                                    |
| GET    | `/auth/me`                             | `Authorization: Bearer` → `{ usuario }` · 401.                                                                                                                                                                         |
| POST   | `/auth/logout`                         | 204, invalida o token.                                                                                                                                                                                                 |
| GET    | `/sso/logout?post_logout_redirect_uri` | Página "Você saiu" com link "Entrar novamente".                                                                                                                                                                        |
| \*     | demais rotas                           | exigem `Authorization: Bearer {token}`; 401 sem token válido. `OPTIONS` livre.                                                                                                                                         |

## 5. Camadas

- **domain/auth**: `Sessao`, `UsuarioSessao { id, nome, email, perfil, perfilLabel, area }`, erros `CodigoInvalidoError`, `UsuarioInativoError`, `SessaoExpiradaError`, `SsoNaoConfiguradoError`; portas `AuthRepository { trocarCodigo(code), me(), logout() }` e `SsoProvider { redirecionarParaLogin(state), redirecionarParaLogout() }`.
- **application/auth**: `ConcluirLogin` (troca o código), `ObterSessaoAtual`, `Sair`.
- **infrastructure/auth**: `HttpAuthRepository` (zod; 401/403 → erros de domínio); `MockSsoProvider` (monta as URLs `{apiUrl}/sso/authorize` e `/sso/logout` com o `origin` atual; navegação injetável para teste); `EntraSsoProvider` (lança `SsoNaoConfiguradoError`). `FetchHttpClient` com `getToken` (Bearer) e `onUnauthorized` (401 fora de `/auth/token`).
- **main/container**: escolhe o `SsoProvider` por `authMode`.
- **presentation**: `sessaoStore` (zustand + `persist` em `sessionStorage`, só token e usuário); `SessionProvider`/`useSessao()` (usuario, perfil de `GET /perfis`, nível, `sair`); `AuthGate` no layout `(app)`; `AuthCallbackScreen`; `UserMenu` na topbar.
- **app**: `src/app/(app)/…` com o shell e o `AuthGate`; `src/app/auth/callback/page.tsx` fora do shell (metadata "Entrando…").
- Remover a tela de login meio a meio (`LoginScreen`, `LoginForm`, `LoginBrandPanel`, `DemoAccessList`, `PasswordInput`, rota `(auth)/login`) e seus testes.

## 6. Regras de negócio

| RN    | Regra                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| RN-01 | Nível de acesso = `perfis[usuario.perfil].level`; `SCREEN_ROLES` e visibilidade da sidebar como no protótipo (`setRole`, L3716–3753).      |
| RN-02 | Só entra usuário cadastrado pelo admin (403 `nao_cadastrado`); inativo entra só para visualizar (escritas → 403 `somente_leitura`) (§1.1). |
| RN-03 | O app não mantém senha nem tela de login (RN-ACS-01).                                                                                      |
| RN-04 | Token só em `sessionStorage`; nunca em log ou `localStorage` (RN-SEG-04 / LGPD).                                                           |
| RN-05 | Logout invalida no servidor, limpa o cache e passa pelo logout do provedor.                                                                |
| RN-06 | `state` só redireciona para rota interna (sem open redirect).                                                                              |

## 7. BDD (resumo)

- Dado que não há sessão, quando acesso `/drivers?page=2`, então sou redirecionado ao provedor com `state=/drivers?page=2` e `redirect_uri={origin}/auth/callback`.
- Dado o callback com código válido do Carlos (planejador), então vou para `/drivers?page=2` e vejo Drivers, Administração DI, Restrições, Planos e Relatórios, sem Controle de Acesso e Agentes; `/agentes` mostra Acesso Negado.
- Dado o callback com código do Pedro (inativo), então entro com aviso de somente leitura e não vejo ações de escrita.
- Dado o callback de uma conta não cadastrada, então vejo "Seu acesso … ainda não foi liberado…" sem shell e "Tentar novamente" volta ao provedor.
- Dado o callback sem `code`, então vejo "Não foi possível concluir o login…" e "Tentar novamente" reinicia o login.
- Dado `state=//evil.com`, então vou para `/`.
- Dado que a API responde 401 numa lista, então a sessão é limpa e o login reinicia com a rota atual.
- Dado o menu do usuário aberto, quando pressiono Esc, ele fecha e o foco volta ao avatar.
- Dado `authMode=entra`, sem sessão, então vejo "Login Microsoft ainda não configurado…".

## 8. Requisitos não funcionais

- Acessibilidade: `ErrorState`/`LoadingState` do callback com `role="alert"`/`role="status"`, foco no título do erro, botão "Tentar novamente" alcançável por teclado; menu do usuário conforme CA-05.
- Segurança: sem senha no app, validação de `state`, `code` removido do histórico, token fora de log e `localStorage`.
- Performance: o callback não carrega o shell nem os módulos.
