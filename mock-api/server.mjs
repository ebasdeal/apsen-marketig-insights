// API local que simula o backend do Demand Intelligence a partir de mock-api/db.json.
// Os dados ficam em memória: cada start parte do db.json original e nunca o altera.
//
// Também simula o provedor de identidade (no real, Microsoft Entra ID): o app não tem tela
// de login; sem sessão ele redireciona para /sso/authorize, que devolve um código para
// /auth/callback no app, trocado por token em POST /auth/token.
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import jsonServer from 'json-server';

const dir = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.MOCK_API_PORT ?? 3001);
const delayMs = Number(process.env.MOCK_API_DELAY_MS ?? 300);
const allowedOrigins = (process.env.MOCK_SSO_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const codeTtlMs = 60_000;
const corporateEmail = /^[^\s@]+@apsen\.com\.br$/;

const data = JSON.parse(readFileSync(join(dir, 'db.json'), 'utf-8'));
const server = jsonServer.create();
const router = jsonServer.router(data);

// token -> id do usuário · código -> { email, nome, expiraEm }
const sessions = new Map();
const codes = new Map();

function publicUser(usuario) {
  const { id, nome, email, perfil, perfilLabel, area } = usuario;
  return { id, nome, email, perfil, perfilLabel, area };
}

function bearerToken(req) {
  const header = req.get('Authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : undefined;
}

function findUser(predicate) {
  return router.db.get('usuarios').find(predicate).value();
}

function sessionUser(req) {
  const userId = sessions.get(bearerToken(req));
  if (userId === undefined) {
    return undefined;
  }
  const usuario = findUser({ id: userId });
  return usuario?.ativo ? usuario : undefined;
}

// Primeiro acesso: cria o usuário com o perfil padrão; o admin eleva depois na tela de Usuários.
function provisionUser({ email, nome }) {
  const perfilId = router.db.get('config').value().perfilPadrao ?? 'viewer';
  const perfil = router.db.get('perfis').find({ id: perfilId }).value();
  const usuario = {
    id: randomUUID(),
    nome: nome || email.split('@')[0],
    email,
    perfil: perfilId,
    perfilLabel: perfil?.label ?? perfilId,
    area: '',
    podeRegistrar: false,
    podeValidar: false,
    admin: false,
    ultimoAcesso: 'Primeiro acesso',
    ativo: true,
    removivel: true,
    criadoNoPrimeiroAcesso: true,
  };
  router.db.get('usuarios').push(usuario).write();
  return usuario;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
}

// Só devolve para o próprio app rodando local (evita open redirect).
function safeAppUrl(value) {
  try {
    const url = new URL(String(value ?? ''));
    const local = ['localhost', '127.0.0.1'].includes(url.hostname) && url.protocol === 'http:';
    return local || allowedOrigins.includes(url.origin) ? url : undefined;
  } catch {
    return undefined;
  }
}

function page(title, body) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · Provedor de identidade simulado</title>
<style>
  :root { color-scheme: light dark; --bg:#f3f4f6; --card:#fff; --fg:#141414; --muted:#6f6f6f; --line:#e1e1e1; --accent:#0a13b6; --err:#991b1b; --err-bg:#fae9e9; }
  @media (prefers-color-scheme: dark) { :root { --bg:#111214; --card:#1a1b1f; --fg:#f2f2f2; --muted:#a3a3a3; --line:#2c2e33; --accent:#7c87f5; --err:#fca5a5; --err-bg:#3a1717; } }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100dvh; display:grid; place-items:center; padding:16px; background:var(--bg); color:var(--fg); font:14px/1.45 system-ui, -apple-system, 'Segoe UI', sans-serif; }
  main { width:100%; max-width:420px; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:28px 24px; }
  .tag { display:inline-block; font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); border:1px dashed var(--line); border-radius:6px; padding:2px 8px; }
  h1 { font-size:20px; margin:14px 0 4px; }
  p { margin:0 0 16px; color:var(--muted); }
  fieldset { border:0; margin:0 0 16px; padding:0; display:grid; gap:8px; }
  legend { font-weight:600; margin-bottom:8px; }
  .conta { display:flex; gap:10px; align-items:center; border:1px solid var(--line); border-radius:8px; padding:10px 12px; cursor:pointer; min-height:44px; }
  .conta:has(input:checked) { border-color:var(--accent); box-shadow:0 0 0 1px var(--accent); }
  .conta small { display:block; color:var(--muted); }
  label.campo { display:block; font-weight:600; margin-bottom:6px; }
  input[type=email], input[type=text] { width:100%; min-height:44px; padding:10px 12px; border:1px solid var(--line); border-radius:8px; background:transparent; color:inherit; font:inherit; }
  button, a.botao { display:block; width:100%; min-height:44px; margin-top:16px; border:0; border-radius:24px; background:var(--accent); color:#fff; font:600 14px system-ui, sans-serif; cursor:pointer; text-align:center; text-decoration:none; line-height:44px; }
  :focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
  .erro { background:var(--err-bg); color:var(--err); border-radius:8px; padding:10px 12px; margin-bottom:16px; }
  .dica { font-size:12px; margin-top:14px; }
</style>
</head>
<body><main>${body}</main></body>
</html>`;
}

function authorizePage({ redirectUri, state, email = '', erro }) {
  const contas = router.db
    .get('usuarios')
    .value()
    .map(
      (u) => `<label class="conta">
  <input type="radio" name="email" value="${escapeHtml(u.email)}" ${u.email === email ? 'checked' : ''}>
  <span><strong>${escapeHtml(u.nome)}</strong><small>${escapeHtml(u.email)} · ${escapeHtml(u.perfilLabel)}${u.ativo ? '' : ' · inativo'}</small></span>
</label>`,
    )
    .join('\n');
  return page(
    'Entrar',
    `<span class="tag">Ambiente de desenvolvimento</span>
<h1>Provedor de identidade simulado</h1>
<p>Substitui o login corporativo (Microsoft Entra ID) fora de produção. Escolha a conta para entrar (sem senha).</p>
${erro ? `<div class="erro" role="alert" id="erro">${escapeHtml(erro)}</div>` : ''}
<form method="post" action="/sso/authorize" ${erro ? 'aria-describedby="erro"' : ''}>
  <input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}">
  <input type="hidden" name="state" value="${escapeHtml(state)}">
  <fieldset><legend>Contas já cadastradas</legend>${contas}</fieldset>
  <p class="dica">Ou entre com outra conta corporativa (primeiro acesso cria o usuário com o perfil padrão):</p>
  <label class="campo" for="outro-email">Outro e-mail</label>
  <input id="outro-email" name="outro_email" type="email" autocomplete="username" placeholder="nome.sobrenome@apsen.com.br">
  <label class="campo" for="nome" style="margin-top:12px">Nome (só no primeiro acesso)</label>
  <input id="nome" name="nome" type="text" autocomplete="name">
  <button type="submit">Entrar</button>
</form>`,
  );
}

server.use(jsonServer.defaults({ static: join(dir, 'public') }));
server.use(jsonServer.bodyParser);
server.use((_req, _res, next) => setTimeout(next, delayMs));

server.get('/sso/authorize', (req, res) => {
  const redirect = safeAppUrl(req.query.redirect_uri);
  if (redirect === undefined) {
    res.status(400).send(page('Erro', '<h1>redirect_uri inválido</h1>'));
    return;
  }
  res.send(authorizePage({ redirectUri: redirect.href, state: String(req.query.state ?? '') }));
});

server.post('/sso/authorize', (req, res) => {
  const redirect = safeAppUrl(req.body?.redirect_uri);
  if (redirect === undefined) {
    res.status(400).send(page('Erro', '<h1>redirect_uri inválido</h1>'));
    return;
  }
  const state = String(req.body?.state ?? '');
  const email = String(req.body?.outro_email || req.body?.email || '')
    .trim()
    .toLowerCase();
  const nome = String(req.body?.nome ?? '').trim();
  const render = (status, erro) =>
    res.status(status).send(authorizePage({ redirectUri: redirect.href, state, email, erro }));

  // O AD autentica qualquer conta corporativa; quem é e o que acessa fica no sistema.
  // Simulado sem senha: basta escolher a conta.
  if (!corporateEmail.test(email)) {
    render(400, 'Escolha uma conta ou informe um e-mail @apsen.com.br.');
    return;
  }

  const code = randomUUID();
  codes.set(code, { email, nome, expiraEm: Date.now() + codeTtlMs });
  redirect.searchParams.set('code', code);
  redirect.searchParams.set('state', state);
  res.redirect(302, redirect.href);
});

server.get('/sso/logout', (req, res) => {
  const back = safeAppUrl(req.query.post_logout_redirect_uri);
  res.send(
    page(
      'Você saiu',
      `<span class="tag">Ambiente de desenvolvimento</span>
<h1>Você saiu</h1>
<p>Sua sessão foi encerrada no provedor de identidade simulado.</p>
${back ? `<a class="botao" href="${escapeHtml(back.href)}">Entrar novamente</a>` : ''}`,
    ),
  );
});

// Troca o código do provedor pela sessão da API (no real: token do Entra ID validado pelo BFF).
server.post('/auth/token', (req, res) => {
  const code = String(req.body?.code ?? '');
  const entry = codes.get(code);
  codes.delete(code);
  if (entry === undefined || entry.expiraEm < Date.now()) {
    res.status(401).json({ message: 'Código de autenticação inválido ou expirado.' });
    return;
  }
  const usuario = findUser((u) => u.email.toLowerCase() === entry.email) ?? provisionUser(entry);
  if (!usuario.ativo) {
    res.status(403).json({ message: 'Usuário inativo. Fale com o administrador do sistema.' });
    return;
  }
  const token = randomUUID();
  sessions.set(token, usuario.id);
  res.json({ token, usuario: publicUser(usuario) });
});

server.post('/auth/logout', (req, res) => {
  sessions.delete(bearerToken(req));
  res.status(204).end();
});

// Toda rota de dados exige sessão válida, como o backend real vai exigir.
server.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
    return;
  }
  const usuario = sessionUser(req);
  if (usuario === undefined) {
    res.status(401).json({ message: 'Sessão expirada. Entre novamente.' });
    return;
  }
  req.usuario = usuario;
  next();
});

server.get('/auth/me', (req, res) => {
  res.json({ usuario: publicUser(req.usuario) });
});

server.use(router);

server.listen(port, () => {
  console.log(`Mock API do Demand Intelligence em http://localhost:${port} (atraso ${delayMs}ms)`);
});
