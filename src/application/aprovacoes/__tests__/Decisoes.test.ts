import { AprovacaoEmUsoError, RejeicaoValidationError } from '@domain/aprovacoes/errors';
import { createFakeAprovacaoRepository } from '@test/fakes/aprovacaoRepository';
import { AprovarAprovacao } from '../AprovarAprovacao';
import { ReabrirAprovacao } from '../ReabrirAprovacao';
import { RejeitarAprovacao } from '../RejeitarAprovacao';

describe('AprovarAprovacao (RN-04, CA-05)', () => {
  it('grava aprovado e devolve o toast', async () => {
    const repository = createFakeAprovacaoRepository();
    await expect(new AprovarAprovacao(repository).execute('DRV-2026-034')).resolves.toEqual({
      toast: '✅ DRV-2026-034 aprovado e enviado para ingestão!',
    });
    expect(repository.update).toHaveBeenCalledWith('DRV-2026-034', { status: 'aprovado' });
  });
});

describe('RejeitarAprovacao (RN-05, CA-06)', () => {
  it('grava motivo e justificativa', async () => {
    const repository = createFakeAprovacaoRepository();
    await expect(
      new RejeitarAprovacao(repository).execute({
        id: 'DRV-2026-034',
        motivo: 'Produto / molécula incorreto',
        justificativa: ' SKU informado é de outra molécula. ',
      }),
    ).resolves.toEqual({ toast: '❌ DRV-2026-034 rejeitado. Registrante notificado.' });
    expect(repository.update).toHaveBeenCalledWith('DRV-2026-034', {
      status: 'rejeitado',
      motivoRejeicao: 'Produto / molécula incorreto',
      justificativaRejeicao: 'SKU informado é de outra molécula.',
    });
  });

  it.each([
    [{ motivo: '', justificativa: 'x' }, '⚠️ Selecione o motivo da rejeição.', 'motivo'],
    [{ motivo: 'Outro', justificativa: '  ' }, '⚠️ Informe a justificativa.', 'justificativa'],
  ])('inválido lança RejeicaoValidationError sem gravar', async (input, mensagem, campo) => {
    const repository = createFakeAprovacaoRepository();
    const erro = await new RejeitarAprovacao(repository)
      .execute({ id: 'DRV-2026-034', ...input })
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
    await expect(new ReabrirAprovacao(repository).execute('DRV-2026-026')).resolves.toEqual({
      toast: '↩️ Decisão reaberta — driver voltou para pendente.',
    });
    expect(repository.update).toHaveBeenCalledWith('DRV-2026-026', {
      status: 'pendente',
      motivoRejeicao: '',
      justificativaRejeicao: '',
    });
  });

  it('em uso no Data Lake recusa sem gravar', async () => {
    const repository = createFakeAprovacaoRepository();
    await expect(new ReabrirAprovacao(repository).execute('DRV-2026-028')).rejects.toBeInstanceOf(
      AprovacaoEmUsoError,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });
});
