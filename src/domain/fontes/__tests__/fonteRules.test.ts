import { FonteProtegidaError, FonteValidationError } from '../errors';
import type { Fonte } from '../Fonte';
import {
  TESTE_DELAY_MS,
  TESTE_OK,
  apiLine,
  firstFonteError,
  optionLabel,
  parseCache,
  slugFonte,
  statusLabel,
  testeConexao,
  validateFonteDraft,
} from '../fonteRules';

const CONCORRENTES: Pick<Fonte, 'icon' | 'nome' | 'modo' | 'url' | 'auth' | 'cache'> = {
  icon: '🏁',
  nome: 'Concorrentes / Marcas',
  modo: 'mock',
  url: '',
  auth: 'none',
  cache: 60,
};

const NOVA = { nome: 'Distribuidores', modo: 'mock' as const, url: '' };

describe('slugFonte (RN-03)', () => {
  it('gera o slug do protótipo', () => {
    expect(slugFonte('Distribuidores / Redes de Farmácia')).toBe(
      'distribuidores_redes_de_farmacia',
    );
    expect(slugFonte('  __Preços (IQVIA)__ ')).toBe('precos_iqvia');
  });

  it('detecta nome repetido com outra caixa ou acento', () => {
    expect(
      validateFonteDraft(
        { ...NOVA, nome: 'LABORATORIOS farmaceuticos' },
        { nova: true, nomesExistentes: ['Concorrentes', 'Laboratórios Farmacêuticos'] },
      ),
    ).toEqual({ nome: '⚠️ Já existe uma fonte com este nome.' });
  });
});

describe('validateFonteDraft (RN-03)', () => {
  it('nova sem nome e em modo API sem URL', () => {
    const errors = validateFonteDraft(
      { nome: '  ', modo: 'api', url: ' ' },
      { nova: true, nomesExistentes: [] },
    );
    expect(errors).toEqual({
      nome: '⚠️ Informe o nome da fonte.',
      url: '⚠️ Informe a URL do endpoint para o modo API.',
    });
    expect(firstFonteError(errors)).toBe('⚠️ Informe o nome da fonte.');
    expect(firstFonteError({})).toBeUndefined();
  });

  it('nova válida e existente sem URL são válidas', () => {
    expect(validateFonteDraft(NOVA, { nova: true, nomesExistentes: ['Outra'] })).toEqual({});
    expect(
      validateFonteDraft({ nome: '', modo: 'api', url: '' }, { nova: false, nomesExistentes: [] }),
    ).toEqual({});
  });
});

describe('formatação (RN-01, RN-05)', () => {
  it('pill, linha API e opção', () => {
    expect(statusLabel(CONCORRENTES)).toBe('📦 Lista interna (mock)');
    expect(statusLabel({ modo: 'api' })).toBe('🔌 API externa ativa');
    expect(apiLine(CONCORRENTES)).toBe('GET (sem URL) · auth: none · cache: 60min');
    expect(apiLine({ url: 'https://x', auth: 'bearer', cache: 15 })).toBe(
      'GET https://x · auth: bearer · cache: 15min',
    );
    expect(optionLabel(CONCORRENTES)).toBe('🏁 Concorrentes / Marcas (mock)');
    expect(optionLabel({ ...CONCORRENTES, modo: 'api' })).toBe(
      '🏁 Concorrentes / Marcas (API ativa)',
    );
  });

  it('cache vazio, zero ou inválido vira 60', () => {
    expect(parseCache('0')).toBe(60);
    expect(parseCache('')).toBe(60);
    expect(parseCache('abc')).toBe(60);
    expect(parseCache('-5')).toBe(60);
    expect(parseCache('15')).toBe(15);
  });
});

describe('testeConexao (RN-07)', () => {
  it('erro sem URL e carregando com URL', () => {
    expect(testeConexao('  ')).toEqual({
      tone: 'error',
      texto: '⚠️ Informe a URL do endpoint antes de testar.',
    });
    expect(testeConexao(' https://x ')).toEqual({
      tone: 'loading',
      texto: '⟳ Testando conexão com https://x...',
    });
  });

  it('sucesso simulado após 1,2 s', () => {
    expect(TESTE_DELAY_MS).toBe(1200);
    expect(TESTE_OK).toEqual({
      tone: 'success',
      texto: '✅ Conexão simulada com sucesso — 3 registros retornados em 142ms.',
      nota: '(Mockup: no sistema real, este teste faz uma chamada HTTP verdadeira ao endpoint.)',
    });
  });
});

describe('erros', () => {
  it('FonteValidationError e FonteProtegidaError', () => {
    expect(new FonteValidationError({ url: 'u', nome: 'n' }).message).toBe('n');
    expect(new FonteValidationError({}).message).toBe('Fonte inválida.');
    const protegida = new FonteProtegidaError('concorrentes');
    expect(protegida.message).toBe('Fonte do sistema não pode ser removida.');
    expect(protegida.fonteId).toBe('concorrentes');
  });
});
