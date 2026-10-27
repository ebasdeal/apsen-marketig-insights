import {
  FONTE_FIELDS,
  type Fonte,
  type FonteDraft,
  type FonteErrors,
  type FonteField,
} from './Fonte';
import { CACHE_PADRAO } from './vocabulario';

export const FONTE_MESSAGES = {
  nome: '⚠️ Informe o nome da fonte.',
  url: '⚠️ Informe a URL do endpoint para o modo API.',
  nomeRepetido: '⚠️ Já existe uma fonte com este nome.',
} as const;

export const STATUS_API = '🔌 API externa ativa';

export const STATUS_MOCK = '📦 Lista interna (mock)';

export type TesteConexaoTone = 'error' | 'loading' | 'success';

export interface TesteConexao {
  tone: TesteConexaoTone;
  texto: string;
  nota?: string;
}

export const TESTE_DELAY_MS = 1200;

export const TESTE_OK: TesteConexao = {
  tone: 'success',
  texto: '✅ Conexão simulada com sucesso — 3 registros retornados em 142ms.',
  nota: '(Mockup: no sistema real, este teste faz uma chamada HTTP verdadeira ao endpoint.)',
};

export function slugFonte(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function parseCache(valor: string): number {
  const cache = Number(valor);
  return Number.isFinite(cache) && cache > 0 ? cache : CACHE_PADRAO;
}

export function isApi(fonte: Pick<Fonte, 'modo'>): boolean {
  return fonte.modo === 'api';
}

export function statusLabel(fonte: Pick<Fonte, 'modo'>): string {
  return isApi(fonte) ? STATUS_API : STATUS_MOCK;
}

export function apiLine(fonte: Pick<Fonte, 'url' | 'auth' | 'cache'>): string {
  return `GET ${fonte.url || '(sem URL)'} · auth: ${fonte.auth} · cache: ${fonte.cache}min`;
}

export function optionLabel(fonte: Pick<Fonte, 'icon' | 'nome' | 'modo'>): string {
  return `${fonte.icon} ${fonte.nome} ${isApi(fonte) ? '(API ativa)' : '(mock)'}`;
}

export function validateFonteDraft(
  draft: Pick<FonteDraft, 'nome' | 'modo' | 'url'>,
  context: { nova: boolean; nomesExistentes: readonly string[] },
): FonteErrors {
  if (!context.nova) {
    return {};
  }
  const errors: FonteErrors = {};
  const nome = draft.nome.trim();
  if (nome === '') {
    errors.nome = FONTE_MESSAGES.nome;
  } else if (
    context.nomesExistentes.some((existente) => slugFonte(existente) === slugFonte(nome))
  ) {
    errors.nome = FONTE_MESSAGES.nomeRepetido;
  }
  if (draft.modo === 'api' && draft.url.trim() === '') {
    errors.url = FONTE_MESSAGES.url;
  }
  return errors;
}

export function firstFonteError(
  errors: FonteErrors,
  order: readonly FonteField[] = FONTE_FIELDS,
): string | undefined {
  const field = order.find((key) => errors[key] !== undefined);
  return field === undefined ? undefined : errors[field];
}

export function testeConexao(url: string): TesteConexao {
  const alvo = url.trim();
  if (alvo === '') {
    return { tone: 'error', texto: '⚠️ Informe a URL do endpoint antes de testar.' };
  }
  return { tone: 'loading', texto: `⟳ Testando conexão com ${alvo}...` };
}
