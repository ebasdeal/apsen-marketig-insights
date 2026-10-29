import type { FonteCardDto, FonteOptionDto, FontesPageDto } from '@application/fontes/dto';
import type { Fonte } from '@domain/fontes/Fonte';

export const FONTE_DTOS_FIXTURE = [
  {
    id: 'concorrentes',
    nome: 'Concorrentes / Marcas',
    icon: '🏁',
    desc: 'Alimenta o autocomplete "Nome do concorrente" no registro de drivers.',
    modo: 'mock',
    url: '',
    auth: 'none',
    cache: 60,
    campos: 'MARCAS_CONC',
  },
  {
    id: 'laboratorios',
    nome: 'Laboratórios Farmacêuticos',
    icon: '🏭',
    desc: 'Alimenta o autocomplete "Laboratório" nos drivers de concorrência.',
    modo: 'mock',
    url: '',
    auth: 'none',
    cache: 60,
    campos: 'LABORATORIOS_CONC',
  },
  {
    id: 'moleculas',
    nome: 'Moléculas / Princípios Ativos (CMED)',
    icon: '💊',
    desc: 'Base de moléculas para preenchimento e validação. Fonte sugerida: CMED/ANVISA.',
    modo: 'mock',
    url: '',
    auth: 'none',
    cache: 1440,
    campos: 'APSEN_DB',
  },
  {
    id: 'precos',
    nome: 'Preços de Mercado (IQVIA / Close-Up)',
    icon: '💲',
    desc: 'Preços de concorrentes para o campo "Preço do concorrente". Requer contrato com provedor.',
    modo: 'mock',
    url: '',
    auth: 'none',
    cache: 1440,
    campos: '—',
  },
] as const;

export const FONTES_FIXTURE: readonly Fonte[] = FONTE_DTOS_FIXTURE.map((dto) => ({
  ...dto,
  mapValor: 'nome',
  mapLabel: 'razao_social',
  custom: false,
}));

export const FONTE_CUSTOM: Fonte = {
  id: '9b2f6a1e-1c2d-4e5f-8a9b-0c1d2e3f4a5b',
  nome: 'Distribuidores',
  icon: '🚚',
  desc: 'Fonte de dados personalizada.',
  modo: 'api',
  url: 'https://api.apsen.com.br/v1/distribuidores',
  auth: 'bearer',
  cache: 60,
  campos: '—',
  mapValor: 'nome',
  mapLabel: 'razao_social',
  custom: true,
};

export function fonteCard(fonte: Fonte): FonteCardDto {
  const api = fonte.modo === 'api';
  return {
    id: fonte.id,
    nome: fonte.nome,
    icon: fonte.icon,
    desc: fonte.desc,
    isApi: api,
    statusLabel: api ? '🔌 API externa ativa' : '📦 Lista interna (mock)',
    apiLine: api
      ? `GET ${fonte.url || '(sem URL)'} · auth: ${fonte.auth} · cache: ${fonte.cache}min`
      : null,
    removivel: fonte.custom,
    config: {
      modo: fonte.modo,
      url: fonte.url,
      auth: fonte.auth,
      cache: fonte.cache,
      mapValor: fonte.mapValor,
      mapLabel: fonte.mapLabel,
    },
  };
}

export const FONTES_PAGE_FIXTURE: FontesPageDto = {
  items: [...FONTES_FIXTURE, FONTE_CUSTOM].map(fonteCard),
  total: 5,
  totalPages: 1,
};

export const FONTE_OPTIONS_FIXTURE: FonteOptionDto[] = FONTES_FIXTURE.map((fonte) => ({
  value: fonte.id,
  label: `${fonte.icon} ${fonte.nome} (mock)`,
}));
