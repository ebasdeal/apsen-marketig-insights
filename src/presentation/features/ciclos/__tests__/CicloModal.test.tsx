import { CicloValidationError } from '@domain/ciclos/CicloValidationError';
import { HttpError } from '@infrastructure/http/HttpClient';
import {
  CICLO_RASCUNHO,
  CICLOS_PAGE_FIXTURE,
  CICLOS_RESUMO_FIXTURE,
  cicloRow,
} from '@test/fixtures/ciclos';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import type { CicloModalMode } from '../cicloForm';
import { CicloModal } from '../components/CicloModal';

const FALHA = 'Não foi possível salvar as alterações. Tente novamente.';
const ATIVO = CICLOS_PAGE_FIXTURE.rows[0]!;

function render(
  mode: CicloModalMode = { modo: 'novo' },
  save = vi.fn().mockResolvedValue({ toast: '✅ Ciclo criado!' }),
  resumo = CICLOS_RESUMO_FIXTURE,
) {
  const onClose = vi.fn();
  const useCases = createFakeUseCases({ ciclos: { save: { execute: save } } });
  const result = renderWithProviders(
    <CicloModal mode={mode} resumo={resumo} onClose={onClose} />,
    useCases,
  );
  return { ...result, onClose, save };
}

const descricao = () => screen.getByRole('textbox', { name: 'Descrição' });

describe('CicloModal — novo', () => {
  it('CA-07 abre com código, datas padrão e toggle desligado', () => {
    render();
    const dialog = screen.getByRole('dialog', { name: 'Novo Ciclo de Planejamento' });
    const codigo = within(dialog).getByRole('textbox', { name: 'Código' });
    expect(codigo).toHaveValue('PLP-2026-08');
    expect(codigo).toHaveAttribute('readonly');
    expect(within(dialog).getByLabelText(/^Data Início/)).toHaveValue('2026-08-01');
    expect(within(dialog).getByLabelText(/^Data Fim/)).toHaveValue('2026-08-31');
    expect(within(dialog).getByLabelText(/^Data Fim/)).toHaveAttribute('min', '2026-08-01');
    expect(within(dialog).getByRole('combobox', { name: 'Responsável' })).toHaveValue(
      'Ana Planejadora',
    );
    expect(within(dialog).getByText('Rascunho')).toBeInTheDocument();
    expect(
      within(dialog).getByText('Encerra o ciclo PLP-2026-07 e ativa este como ciclo corrente.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Criar Ciclo' })).toBeInTheDocument();
  });

  it('sem ativo a descrição do StatusField muda', () => {
    render({ modo: 'novo' }, undefined, { ...CICLOS_RESUMO_FIXTURE, ativo: null });
    expect(screen.getByText('Ativa este ciclo como ciclo corrente.')).toBeInTheDocument();
  });

  it('CA-08 descrição vazia mostra erro no campo, foca, avisa e mantém aberto', async () => {
    const { user, save } = render();
    await user.click(screen.getByRole('button', { name: 'Criar Ciclo' }));
    expect(descricao()).toHaveAttribute('aria-invalid', 'true');
    expect(descricao()).toHaveAccessibleDescription('⚠️ Informe a descrição.');
    expect(descricao()).toHaveFocus();
    expect(await screen.findByText('Informe a descrição.')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Novo Ciclo de Planejamento' })).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });

  it('CA-08 válido grava, com ativar e responsável, e fecha', async () => {
    const { user, save, onClose } = render();
    await user.type(descricao(), 'Planejamento Agosto 2026');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Responsável' }),
      'Carlos Planejador',
    );
    await user.click(screen.getByRole('switch', { name: 'Ativar imediatamente' }));
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Criar Ciclo' }));
    expect(save).toHaveBeenCalledWith({
      modo: 'novo',
      draft: {
        descricao: 'Planejamento Agosto 2026',
        inicio: '2026-08-01',
        fim: '2026-08-31',
        responsavel: 'Carlos Planejador',
        ativar: true,
      },
    });
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByText('Ciclo criado!')).toBeInTheDocument();
  });

  it('CA-08 durante o envio não reenvia', async () => {
    const { user, save } = render(
      { modo: 'novo' },
      vi.fn(() => new Promise<never>(() => undefined)),
    );
    await user.type(descricao(), 'Agosto');
    await user.click(screen.getByRole('button', { name: 'Criar Ciclo' }));
    const salvando = screen.getByRole('button', { name: 'Salvando…' });
    expect(salvando).toBeDisabled();
    await user.click(salvando);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('CA-10 falha HTTP mostra o toast e mantém o modal', async () => {
    const { user, onClose } = render(
      { modo: 'novo' },
      vi.fn().mockRejectedValue(new HttpError(500, '/ciclos', {})),
    );
    await user.type(descricao(), 'Agosto');
    await user.click(screen.getByRole('button', { name: 'Criar Ciclo' }));
    expect(await screen.findByText(FALHA)).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Novo Ciclo de Planejamento' })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('erro de validação do servidor marca o campo', async () => {
    const { user } = render(
      { modo: 'novo' },
      vi.fn().mockRejectedValue(new CicloValidationError({ fim: '⚠️ Informe a data fim.' })),
    );
    await user.type(descricao(), 'Agosto');
    await user.click(screen.getByRole('button', { name: 'Criar Ciclo' }));
    expect(await screen.findByText('⚠️ Informe a data fim.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Data Fim/)).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('CicloModal — editar', () => {
  it('CA-09 ativo vem pré-preenchido, sem StatusField, e salva com PATCH', async () => {
    const save = vi.fn().mockResolvedValue({ toast: '✅ Ciclo atualizado!' });
    const { user, onClose } = render({ modo: 'editar', ciclo: ATIVO }, save);
    const dialog = screen.getByRole('dialog', { name: 'Editar Ciclo de Planejamento' });
    expect(within(dialog).getByRole('textbox', { name: 'Código' })).toHaveValue('PLP-2026-07');
    expect(descricao()).toHaveValue('Planejamento Julho 2026');
    expect(within(dialog).getByLabelText(/^Data Início/)).toHaveValue('2026-07-01');
    expect(within(dialog).queryByRole('switch', { name: 'Ativar imediatamente' })).toBeNull();
    await user.clear(descricao());
    await user.type(descricao(), 'Julho revisado');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar alterações' }));
    expect(save).toHaveBeenCalledWith({
      modo: 'editar',
      id: 'PLP-2026-07',
      draft: expect.objectContaining({ descricao: 'Julho revisado', ativar: true }),
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('rascunho mostra o StatusField desligado', () => {
    render({ modo: 'editar', ciclo: cicloRow(CICLO_RASCUNHO) });
    expect(screen.getByRole('switch', { name: 'Ativar imediatamente' })).not.toBeChecked();
  });

  it('responsável fora da lista aparece como opção', () => {
    render({ modo: 'editar', ciclo: { ...ATIVO, responsavel: 'Bia Planejadora' } });
    expect(screen.getByRole('combobox', { name: 'Responsável' })).toHaveValue('Bia Planejadora');
  });
});

describe('CicloModal — descartar (CA-11)', () => {
  it('com alterações pede confirmação; Continuar editando mantém, Descartar fecha', async () => {
    const { user, onClose } = render();
    await user.type(descricao(), 'Agosto');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    const confirm = screen.getByRole('dialog', { name: 'Descartar alterações?' });
    expect(
      within(confirm).getByText('As alterações feitas neste formulário serão perdidas.'),
    ).toBeInTheDocument();
    await user.click(within(confirm).getByRole('button', { name: 'Continuar editando' }));
    expect(screen.queryByRole('dialog', { name: 'Descartar alterações?' })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await user.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sem alterações fecha direto', async () => {
    const { user, onClose } = render();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog', { name: 'Descartar alterações?' })).toBeNull();
  });

  it('durante o envio não fecha', async () => {
    const { user, onClose } = render(
      { modo: 'novo' },
      vi.fn(() => new Promise<never>(() => undefined)),
    );
    await user.type(descricao(), 'Agosto');
    await user.click(screen.getByRole('button', { name: 'Criar Ciclo' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
