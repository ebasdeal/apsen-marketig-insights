import { readLoginConfig } from '../loginConfig';

describe('readLoginConfig', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('usa Desenvolvimento e sem URL de suporte por padrão', () => {
    delete process.env.NEXT_PUBLIC_AMBIENTE;
    delete process.env.NEXT_PUBLIC_SUPORTE_URL;
    expect(readLoginConfig()).toEqual({ ambiente: 'Desenvolvimento', suporteUrl: undefined });
  });

  it('lê as variáveis públicas', () => {
    process.env.NEXT_PUBLIC_AMBIENTE = 'Produção';
    process.env.NEXT_PUBLIC_SUPORTE_URL = 'https://suporte.exemplo.com';
    expect(readLoginConfig()).toEqual({
      ambiente: 'Produção',
      suporteUrl: 'https://suporte.exemplo.com',
    });
  });
});
