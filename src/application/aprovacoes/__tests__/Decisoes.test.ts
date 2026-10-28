import { AprovacaoEmUsoError, RejeicaoValidationError } from '@domain/aprovacoes/errors';
import { textoDecisao } from '@domain/aprovacoes/aprovacaoRules';
import { createFakeAprovacaoRepository } from '@test/fakes/aprovacaoRepository';
import { AprovarAprovacao } from '../AprovarAprovacao';
import { ReabrirAprovacao } from '../ReabrirAprovacao';
import { RejeitarAprovacao } from '../RejeitarAprovacao';

const RELOGIO = () => new Date('2026-10-28T14:05:00.000Z');

describe('AprovarAprovacao (RN-04, CA-05)', () => {
  it('grava aprovado e devolve o toast', async () => {
    const repository = createFakeAprovacaoRepository();
    await expect(
      new AprovarAprovacao(repository, RELOGIO).execute({
        id: 'DRV-2026-034',
        por: 'Ana P.',
      }),
    ).resolves.toEqual({
      toast: '✅ DRV-2026-034 aprovado e enviado para ingestão!',
    });
    expect(repository.update).toHaveBeenCalledWith('DRV-2026-034', {
      status: 'aprovado',
      decisao: { tipo: 'aprovado', por: 'Ana P.', em: '2026-10-28T14:05:00.000Z' },
    });
    expect(textoDecisao({ tipo: 'aprovado', por: 'Ana P.', em: '2026-10-28T14:05:00.000Z' })).toBe(
      'Aprovado por Ana P. em 28/10/2026 14:05',
    );
  });
});

describe('RejeitarAprovacao (RN-05, CA-06)', () => {
  it('grava motivo e justificativa', async () => {
    const repository = createFakeAprovacaoRepository();
    await expect(
      new RejeitarAprovacao(repository, RELOGIO).execute({
        id: 'DRV-2026-034',
        por: 'Carlos L.',
        motivo: 'Produto / molécula incorreto',
        justificativa: ' SKU informado é de outra molécula. ',
      }),
    ).resolves.toEqual({ toast: '❌ DRV-2026-034 rejeitado. Registrante notificado.' });
    expect(repository.update).toHaveBeenCalledWith('DRV-2026-034', {
      status: 'rejeitado',
      motivoRejeicao: 'Produto / molécula incorreto',
      justificativaRejeicao: 'SKU informado é de outra molécula.',
      decisao: { tipo: 'rejeitado', por: 'Carlos L.', em: '2026-10-28T14:05:00.000Z' },
    });
  });

  it.each([
    [{ motivo: '', justificativa: 'x' }, '⚠️ Selecione o motivo da rejeição.', 'motivo'],
    [{ motivo: 'Outro', justificativa: '  ' }, '⚠️ Informe a justificativa.', 'justificativa'],
  ])('inválido lança RejeicaoValidationError sem gravar', async (input, mensagem, campo) => {
    const repository = createFakeAprovacaoRepository();
    const erro = await new RejeitarAprovacao(repository)
      .execute({ id: 'DRV-2026-034', por: 'x', ...input })
      .catch((error: unknown) => error);
    expect(erro).toBeInstanceOf(RejeicaoValidationError);
    expect((erro as RejeicaoValidationError).message).toBe(mensagem);
    expect((erro as RejeicaoValidationError).errors).toHaveProperty(campo, mensagem);
    expect(repository.update).not.toHaveBeenCalled();
  });
});

describe('ReabrirAprovacao (RN-06, CA-07)', () => {
  it('fora de uso volta para pendente limpando motivo e justificativa', async () => {
    const repository = createFakeAprovacaoRepository();
    await expect(
      new ReabrirAprovacao(repository, RELOGIO).execute({
        id: 'DRV-2026-026',
        por: 'Ana P.',
      }),
    ).resolves.toEqual({
      toast: '↩️ Decisão reaberta — driver voltou para pendente.',
    });
    expect(repository.update).toHaveBeenCalledWith('DRV-2026-026', {
      status: 'pendente',
      motivoRejeicao: '',
      justificativaRejeicao: '',
      decisao: { tipo: 'reaberto', por: 'Ana P.', em: '2026-10-28T14:05:00.000Z' },
    });
  });

  it('em uso no Data Lake recusa sem gravar', async () => {
    const repository = createFakeAprovacaoRepository();
    await expect(
      new ReabrirAprovacao(repository).execute({ id: 'DRV-2026-029', por: 'x' }),
    ).rejects.toBeInstanceOf(AprovacaoEmUsoError);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
