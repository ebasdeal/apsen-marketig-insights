import { aprovacoesResponseSchema } from '../aprovacaoSchema';
import { toAprovacao, toAprovacaoPatchDto } from '../aprovacaoMapper';
import { APROVACOES_API } from '@test/fixtures/aprovacoes';

describe('aprovacaoMapper — autoria da decisão', () => {
  const base = APROVACOES_API[0]!;

  it('lê aprovado_por/aprovado_em, rejeitado_* e reaberto_*', () => {
    const [aprovado, rejeitado, reaberto] = aprovacoesResponseSchema
      .parse([
        {
          ...base,
          status: 'aprovado',
          aprovado_por: 'Ana',
          aprovado_em: '2026-10-28T10:00:00.000Z',
        },
        {
          ...base,
          status: 'rejeitado',
          rejeitado_por: 'Carlos',
          rejeitado_em: '2026-10-28T11:00:00.000Z',
        },
        {
          ...base,
          status: 'pendente',
          reaberto_por: 'Ana',
          reaberto_em: '2026-10-28T12:00:00.000Z',
        },
      ])
      .map(toAprovacao);
    expect(aprovado?.decisao).toEqual({
      tipo: 'aprovado',
      por: 'Ana',
      em: '2026-10-28T10:00:00.000Z',
    });
    expect(rejeitado?.decisao).toMatchObject({ tipo: 'rejeitado', por: 'Carlos' });
    expect(reaberto?.decisao).toMatchObject({ tipo: 'reaberto', por: 'Ana' });
  });

  it('sem autoria gravada a decisão é nula', () => {
    expect(toAprovacao({ ...base, status: 'aprovado' }).decisao).toBeNull();
  });

  it('o patch grava quem decidiu e limpa as outras decisões', () => {
    expect(
      toAprovacaoPatchDto({
        status: 'aprovado',
        decisao: { tipo: 'aprovado', por: 'Ana', em: '2026-10-28T10:00:00.000Z' },
      }),
    ).toMatchObject({
      aprovado_por: 'Ana',
      aprovado_em: '2026-10-28T10:00:00.000Z',
      rejeitado_por: '',
      reaberto_por: '',
    });
  });
});
