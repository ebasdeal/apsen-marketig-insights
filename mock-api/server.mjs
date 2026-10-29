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

// token -> id do usuário · código -> { email, expiraEm }
const sessions = new Map();
const codes = new Map();

function publicUser(usuario) {
  const { id, nome, email, perfil, perfilLabel, area, ativo } = usuario;
  return { id, nome, email, perfil, perfilLabel, area, ativo };
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
  return findUser({ id: userId });
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
  <p class="dica">Ou entre com outra conta corporativa. Quem não foi cadastrado pelo administrador autentica, mas não tem acesso liberado:</p>
  <label class="campo" for="outro-email">Outro e-mail</label>
  <input id="outro-email" name="outro_email" type="email" autocomplete="username" placeholder="nome.sobrenome@apsen.com.br">
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
  const render = (status, erro) =>
    res.status(status).send(authorizePage({ redirectUri: redirect.href, state, email, erro }));

  // O AD autentica qualquer conta corporativa; quem é e o que acessa fica no sistema.
  // Simulado sem senha: basta escolher a conta.
  if (!corporateEmail.test(email)) {
    render(400, 'Escolha uma conta ou informe um e-mail @apsen.com.br.');
    return;
  }

  const code = randomUUID();
  codes.set(code, { email, expiraEm: Date.now() + codeTtlMs });
  redirect.searchParams.set('code', code);
  redirect.searchParams.set('state', state);
  res.redirect(302, redirect.href);
});

server.get('/sso/logout', (req, res) => {
  const back = safeAppUrl(req.query.post_logout_redirect_uri);
  // Com retorno válido, volta direto para a tela de entrada do app; sem retorno, mostra a página de saída.
  if (back !== undefined) {
    res.redirect(302, back.href);
    return;
  }
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
  // Só entra quem o administrador cadastrou. Inativo entra, mas só visualiza.
  const usuario = findUser((u) => u.email.toLowerCase() === entry.email);
  if (usuario === undefined) {
    res.status(403).json({
      codigo: 'nao_cadastrado',
      message:
        'Seu acesso ao Demand Intelligence ainda não foi liberado. Solicite o cadastro ao administrador.',
    });
    return;
  }
  const token = randomUUID();
  sessions.set(token, usuario.id);
  const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  router.db
    .get('usuarios')
    .find({ id: usuario.id })
    .assign({ ultimoAcesso: `Hoje ${agora}` })
    .write();
  res.json({ token, usuario: publicUser(usuario) });
});

server.post('/auth/logout', (req, res) => {
  sessions.delete(bearerToken(req));
  res.status(204).end();
});

// Autorização por perfil nas escritas (matriz de permissões): nível mínimo por recurso.
// admin 4 · planejador 3 · área 2 · visualizador 1. Recurso fora da tabela exige nível 2.
const NIVEL_PERFIL = { admin: 4, planejador: 3, area: 2, viewer: 1 };
const NIVEL_ESCRITA = {
  usuarios: 4,
  agentes: 4,
  tipos: 3,
  camposTipo: 3,
  categorias: 3,
  ciclos: 3,
  fontes: 3,
  ingeridos: 3,
  restricoes: 3,
  planoItens: 3,
  perfis: 3,
  permissoes: 4,
  config: 3,
  intensidades: 3,
};

function nivelDoPerfil(perfil) {
  return NIVEL_PERFIL[perfil] ?? 1;
}

function nivelMinimoEscrita(req) {
  const [recurso] = req.path.split('/').filter(Boolean);
  // Decidir (aprovar, rejeitar, reabrir) é do Planejador em diante; registrar cria a pendência.
  if (recurso === 'aprovacoes') {
    return req.method === 'POST' || req.method === 'DELETE' ? 2 : 3;
  }
  return NIVEL_ESCRITA[recurso] ?? 2;
}

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
  if (!usuario.ativo && req.method !== 'GET') {
    res.status(403).json({
      codigo: 'somente_leitura',
      message: 'Seu usuário está inativo: o acesso é somente para visualização.',
    });
    return;
  }
  req.usuario = usuario;
  const minimo = nivelMinimoEscrita(req);
  if (req.method !== 'GET' && nivelDoPerfil(usuario.perfil) < minimo) {
    res.status(403).json({
      codigo: 'sem_permissao',
      message: 'Seu perfil não tem permissão para esta ação.',
    });
    return;
  }
  next();
});

server.get('/auth/me', (req, res) => {
  res.json({ usuario: publicUser(req.usuario) });
});

// Agregado do Dashboard (no real: endpoint do BFF), para a tela não baixar coleções inteiras.
// Os números de plano, pipeline de drivers e análises são do CICLO ATIVO (sem ciclo ativo, zerados):
// - item do plano pertence ao ciclo pelo prefixo do código (PLP-2026-07-001 -> PLP-2026-07);
// - driver do pipeline pertence ao ciclo cuja janela se sobrepõe ao período do driver;
// - análise pertence ao ciclo gravado nela. Restrições não têm ciclo: contam as ativas.
function noCiclo(periodo, ciclo) {
  return periodo.ini <= ciclo.fim && periodo.fim >= ciclo.inicio;
}

server.get('/dashboard', (_req, res) => {
  const db = router.db;
  const config = db.get('config').value();
  const ciclo = db.get('ciclos').find({ status: 'ativo' }).value();
  const aprovacoes = db
    .get('aprovacoes')
    .value()
    .filter((a) => ciclo !== undefined && noCiclo(a.periodo, ciclo));
  const restricoes = db.get('restricoes').value();
  const itens = db
    .get('planoItens')
    .value()
    .filter((i) => ciclo !== undefined && i.codigo.startsWith(`${ciclo.id}-`));
  const analises = db
    .get('analises')
    .value()
    .filter((a) => ciclo !== undefined && a.ciclo === ciclo.id);
  const count = (list, predicate) => list.filter(predicate).length;
  const ativas = restricoes.filter((r) => r.status === 'ativa');
  const pendentes = aprovacoes.filter((a) => a.status === 'pendente');
  const planoPorStatus = Object.fromEntries(
    ['aprovado', 'revisao', 'bloqueado', 'pendente'].map((s) => [
      s,
      count(itens, (i) => i.status === s),
    ]),
  );

  res.json({
    atualizadoEm: new Date().toISOString(),
    cicloAtivo: ciclo === undefined ? null : { id: ciclo.id, descricao: ciclo.descricao },
    pipeline: { total: aprovacoes.length, pendentes: pendentes.length },
    restricoes: {
      ativas: ativas.length,
      criticas: count(ativas, (r) => r.sev === 'critica'),
      porTipo: config.dashboardRestricaoTipos
        .map(({ t, lbl }) => ({ tipo: t, label: lbl, n: count(ativas, (r) => r.tipo === t) }))
        .filter((linha) => linha.n > 0),
    },
    plano: { total: itens.length, aprovados: planoPorStatus.aprovado, porStatus: planoPorStatus },
    analises: {
      total: analises.length,
      salvas: count(analises, (a) => a.status === 'salva' || a.status === 'relatorio'),
    },
    driversPorCategoria: config.dashboardCategorias.map(({ slug, lbl }) => ({
      categoria: slug,
      label: lbl,
      n: count(aprovacoes, (a) => a.cat === slug),
    })),
    aguardandoAprovacao: {
      total: pendentes.length,
      itens: pendentes.slice(0, 4).map(({ id, produto, tipo }) => ({ id, produto, tipo })),
    },
  });
});

// Aprovado vira driver ingerido (pipeline do Data Lake simulado); rejeitar, reabrir ou apagar tira.
function semEmoji(texto) {
  return String(texto ?? '')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .trim();
}

function dataCurta(iso) {
  const [ano, mes, dia] = String(iso).split('-');
  return `${dia}/${mes}/${ano}`;
}

function ingeridoDaAprovacao(aprovacao) {
  const db = router.db;
  const tipo = db.get('tipos').find({ label: aprovacao.tipo }).value();
  const driver =
    aprovacao.driver_id === undefined
      ? undefined
      : db.get('drivers').find({ id: aprovacao.driver_id }).value();
  const badges = ['tv', 'digital', 'pdv', 'campo', 'medico', 'preco', 'conc', 'sazo', 'supply'];
  return {
    id: aprovacao.id,
    produto: aprovacao.produto,
    sku: driver?.codigo ?? '—',
    tipo: aprovacao.tipo,
    badge: `db-${badges.includes(tipo?.slug) ? tipo.slug : 'outro'}`,
    periodo: `${dataCurta(aprovacao.periodo.ini)} → ${dataCurta(aprovacao.periodo.fim)}`,
    feature: tipo?.feature ?? '—',
    featureCor: 'var(--blue)',
    area: tipo?.dono ?? '—',
    validadoPor: aprovacao.aprovado_por ?? '—',
    categoria: semEmoji(tipo?.catL) || aprovacao.cat,
    idCor: 'var(--blue)',
  };
}

function sincronizarIngeridos(req, res) {
  const [recurso, id] = req.path.split('/').filter(Boolean);
  const ok = res.statusCode >= 200 && res.statusCode < 300;
  if (recurso !== 'aprovacoes' || id === undefined || !ok) {
    return;
  }
  const ingeridos = router.db.get('ingeridos');
  const aprovacao = router.db.get('aprovacoes').find({ id }).value();
  const atual = ingeridos.find({ id }).value();
  if (aprovacao?.status === 'aprovado' && atual === undefined) {
    ingeridos.push(ingeridoDaAprovacao(aprovacao)).write();
  } else if (aprovacao?.status !== 'aprovado' && atual !== undefined) {
    ingeridos.remove({ id }).write();
  }
}

server.use((req, res, next) => {
  if (['PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    res.on('finish', () => sincronizarIngeridos(req, res));
  }
  next();
});

server.use(router);

server.listen(port, () => {
  console.log(`Mock API do Demand Intelligence em http://localhost:${port} (atraso ${delayMs}ms)`);
});
