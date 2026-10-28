import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH ?? 'playwright-core');

const APP = process.env.APP_URL ?? 'http://localhost:3421';
const API = process.env.API_URL ?? 'http://localhost:3422';
const OUT = process.env.SHOTS_DIR ?? join(process.cwd(), 'responsive-shots');
const USER = 'ana.admin@apsen.com.br';

const ROUTES = [
  '/',
  '/drivers',
  '/drivers/novo',
  '/drivers/1',
  '/drivers/exportar',
  '/drivers/catalogo',
  '/drivers/catalogo/ENIAGOR',
  '/admin/ciclos',
  '/admin/tipos',
  '/admin/tipos/novo',
  '/admin/aprovacoes',
  '/admin/ingeridos',
  '/admin/fontes',
  '/acesso/usuarios',
  '/acesso/usuarios/novo',
  '/acesso/perfis',
  '/agentes',
  '/agentes/novo',
  '/analises',
  '/analises/nova',
  '/analises/ANL-001',
  '/restricoes',
  '/planos',
  '/planos/PLP-2026-07-001',
  '/relatorios',
  '/acesso-negado',
];

const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

async function launch() {
  try {
    return await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    return chromium.launch({ channel: 'msedge', headless: true, args: ['--headless=new'] });
  }
}

async function login(page) {
  await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForURL(`${API}/sso/authorize**`, { timeout: 30000 });
  await page.check(`input[name="email"][value="${USER}"]`);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${APP}/**`, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

function slug(route, viewport) {
  const name = route === '/' ? 'home' : route.slice(1).replaceAll('/', '_');
  return `${name}-${viewport.width}.png`;
}

async function measure(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const main = document.querySelector('main');
    const offenders = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 3)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)}`);
    const scrollers = [...document.querySelectorAll('main *')]
      .filter((el) => {
        const overflowX = getComputedStyle(el).overflowX;
        return (
          (overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1
        );
      })
      .map((el) => `scroll:${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
    return {
      page: root.scrollWidth <= window.innerWidth,
      main: main === null || main.scrollWidth <= main.clientWidth + 1,
      inner: window.innerWidth >= 768 || scrollers.length === 0,
      offenders: [...offenders, ...scrollers.slice(0, 2)],
    };
  });
}

const WIDTHS = process.env.WIDTHS?.split(',').map(Number);
const viewports =
  WIDTHS === undefined ? VIEWPORTS : VIEWPORTS.filter((v) => WIDTHS.includes(v.width));

const browser = await launch();
mkdirSync(OUT, { recursive: true });
const context = await browser.newContext({ viewport: VIEWPORTS[3] });
const page = await context.newPage();
await login(page);

let failures = 0;
for (const viewport of viewports) {
  await page.setViewportSize(viewport);
  for (const route of ROUTES) {
    await page.goto(`${APP}${route}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.waitForTimeout(500);
    const result = await measure(page);
    const ok = result.page && result.main && result.inner;
    if (!ok) failures += 1;
    await page.screenshot({ path: join(OUT, slug(route, viewport)), fullPage: false });
    console.log(
      `${ok ? 'OK  ' : 'FAIL'} ${String(viewport.width).padStart(4)} ${route}${ok ? '' : ` ${result.offenders.join(' | ')}`}`,
    );
  }
}
await browser.close();
console.log(failures === 0 ? 'Todas as rotas sem rolagem horizontal.' : `${failures} falha(s).`);
process.exit(failures === 0 ? 0 : 1);
