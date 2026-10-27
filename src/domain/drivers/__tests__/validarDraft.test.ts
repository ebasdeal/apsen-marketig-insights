import { makeCamposTipo, makeDraft } from '@test/factories/drivers';
import { DriverValidationError } from '../errors';
import { validarDraft } from '../validarDraft';

const CAMPOS = makeCamposTipo().campos;

describe('validarDraft (RN-03, CA-10)', () => {
  it('formulário válido não tem erro', () => {
    expect(validarDraft(makeDraft(), CAMPOS)).toBeNull();
  });

  it('produto do modo vem primeiro, mesmo sem tipo', () => {
    expect(validarDraft(makeDraft({ sku: null, tipo: '' }), CAMPOS)).toEqual({
      campo: 'sku',
      toast: '⚠️ Selecione um Produto / SKU.',
      mensagem: 'Selecione um Produto / SKU.',
    });
    expect(validarDraft(makeDraft({ modo: 'familia', familia: ' ' }), CAMPOS)?.toast).toBe(
      '⚠️ Selecione a Família / Molécula.',
    );
    expect(validarDraft(makeDraft({ modo: 'franquia' }), CAMPOS)).toMatchObject({
      campo: 'franquia',
      toast: '⚠️ Selecione a Franquia / Linha Terapêutica.',
    });
  });

  it('sem tipo marca Tipo, ou Categoria quando ela também está vazia', () => {
    expect(validarDraft(makeDraft({ tipo: '' }), CAMPOS)).toMatchObject({
      campo: 'tipo',
      toast: '⚠️ Selecione o tipo de driver.',
    });
    expect(validarDraft(makeDraft({ tipo: '', categoriaId: null }), CAMPOS)?.campo).toBe(
      'categoria',
    );
  });

  it('Data Fim obrigatória e período dentro de 1 ano', () => {
    expect(validarDraft(makeDraft({ fim: '' }), CAMPOS)).toEqual({
      campo: 'fim',
      toast: '⚠️ Informe a data fim.',
      mensagem: 'Informe a data fim.',
    });
    expect(validarDraft(makeDraft({ fim: '2027-07-02' }), CAMPOS)).toEqual({
      campo: 'fim',
      toast: '⚠️ Verifique a data fim (máximo 1 ano da data início).',
      mensagem: '⚠️ A data fim não pode ultrapassar 1 ano a partir da data início.',
    });
    expect(validarDraft(makeDraft({ fim: '2026-06-01' }), CAMPOS)?.mensagem).toBe(
      '⚠️ A data fim não pode ser anterior à data início.',
    );
    expect(validarDraft(makeDraft({ inicio: '' }), CAMPOS)).toBeNull();
  });

  it('campo obrigatório do tipo vazio', () => {
    const draft = makeDraft({ parametros: { lab_conc: '  ' } });
    expect(validarDraft(draft, CAMPOS)).toEqual({
      campo: 'param:lab_conc',
      toast: '⚠️ Preencha o campo obrigatório: Laboratório.',
      mensagem: 'Preencha o campo obrigatório.',
    });
    expect(validarDraft(makeDraft({ parametros: {} }), CAMPOS)?.campo).toBe('param:lab_conc');
  });

  it('DriverValidationError carrega campo e mensagens', () => {
    const erro = new DriverValidationError({
      campo: 'sku',
      toast: '⚠️ Selecione um Produto / SKU.',
      mensagem: 'Selecione um Produto / SKU.',
    });
    expect(erro).toMatchObject({
      name: 'DriverValidationError',
      message: '⚠️ Selecione um Produto / SKU.',
      field: 'sku',
      fieldMessage: 'Selecione um Produto / SKU.',
    });
  });
});
