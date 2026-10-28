import { createFakeRestricoesUseCases, restricaoItemFixture } from '@test/fakes/restricoes';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { fireEvent, screen, within } from '@testing-library/react';
import RestricaoModal from '../components/RestricaoModal';

function setup(item = null as ReturnType<typeof restricaoItemFixture> | null, restricoes = {}) {
  const useCases = createFakeUseCases({ restricoes: createFakeRestricoesUseCases(restricoes) });
  const onClose = vi.fn();
  const view = renderWithProviders(<RestricaoModal item={item} onClose={onClose} />, useCases);
  const dialog = () => screen.getAllByRole('dialog')[0] as HTMLElement;
  return { ...view, useCases, onClose, dialog };
}

describe('RestricaoModal', () => {
  it('CA-07 / RN-04: sem tipo e depois sem descrição mostra toast, erro no campo e foco', async () => {
    const { user, dialog, useCases } = setup();
    expect(within(dialog()).getByRole('combobox', { name: 'Severidade' })).toHaveDisplayValue(
      '🔴 Crítica — bloqueio total',
    );
    expect(within(dialog()).getByRole('combobox', { name: 'Responsável' })).toHaveDisplayValue(
      'Ana Planejadora',
    );
    await user.click(within(dialog()).getByRole('button', { name: 'Registrar Restrição' }));
    const tipo = within(dialog()).getByRole('combobox', { name: 'Tipo' });
    expect(tipo).toHaveAttribute('aria-invalid', 'true');
    expect(tipo).toHaveFocus();
    expect(screen.getAllByText('Selecione o tipo.').length).toBeGreaterThanOrEqual(2);

    await user.selectOptions(tipo, 'mp');
    await user.click(within(dialog()).getByRole('button', { name: 'Registrar Restrição' }));
    const desc = within(dialog()).getByRole('textbox', { name: 'Descrição' });
    expect(desc).toHaveFocus();
    expect(desc).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByText('Informe a descrição.').length).toBeGreaterThanOrEqual(2);
    expect(useCases.restricoes.registrar.execute).not.toHaveBeenCalled();
    expect(dialog()).toBeInTheDocument();
  });

  it('CA-07: preenchido registra, fecha e mostra o toast', async () => {
    const { user, dialog, useCases, onClose } = setup();
    await user.selectOptions(
      within(dialog()).getByRole('combobox', { name: 'Tipo' }),
      'capacidade',
    );
    await user.type(
      within(dialog()).getByRole('textbox', { name: 'Descrição' }),
      'Parada da Linha 4',
    );
    const corpo = within(dialog());
    await user.selectOptions(corpo.getByRole('combobox', { name: 'Severidade' }), 'atencao');
    await user.type(corpo.getByRole('textbox', { name: 'Produto / Linha Afetada' }), 'Linha 4');
    fireEvent.change(corpo.getByLabelText('Prazo'), { target: { value: '2026-08-15' } });
    await user.selectOptions(corpo.getByRole('combobox', { name: 'Responsável' }), 'Carlos Lima');
    await user.type(corpo.getByRole('textbox', { name: 'Observações' }), 'Obs');
    await user.click(within(dialog()).getByRole('button', { name: 'Registrar Restrição' }));
    expect(useCases.restricoes.registrar.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'capacidade',
        desc: 'Parada da Linha 4',
        sev: 'atencao',
        produto: 'Linha 4',
        prazoIso: '2026-08-15',
        resp: 'Carlos Lima',
        obs: 'Obs',
      }),
    );
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByText('Restrição registrada!')).toBeInTheDocument();
  });

  it('CA-08 / RN-06: edição pré-preenche e atualiza o mesmo item', async () => {
    const item = restricaoItemFixture();
    const { user, dialog, useCases } = setup(item);
    const corpo = within(dialog());
    expect(corpo.getByRole('combobox', { name: 'Tipo' })).toHaveValue('mp');
    expect(corpo.getByRole('textbox', { name: 'Descrição' })).toHaveValue(item.desc);
    expect(corpo.getByRole('textbox', { name: 'Produto / Linha Afetada' })).toHaveValue(
      item.produto,
    );
    expect(corpo.getByRole('textbox', { name: 'Impacto' })).toHaveValue('Bloqueio total');
    expect(corpo.getByLabelText('Prazo')).toHaveValue('2026-07-05');
    expect(corpo.getByRole('textbox', { name: 'Observações' })).toHaveValue(item.form.obs);
    await user.click(corpo.getByRole('button', { name: 'Registrar Restrição' }));
    expect(useCases.restricoes.atualizar.execute).toHaveBeenCalledWith(item, item.form);
    expect(useCases.restricoes.registrar.execute).not.toHaveBeenCalled();
  });

  it('CA-10: durante o envio mostra "Salvando…" desabilitado', async () => {
    const { user, dialog } = setup(restricaoItemFixture(), {
      atualizar: { execute: vi.fn(() => new Promise<void>(() => undefined)) },
    });
    await user.click(within(dialog()).getByRole('button', { name: 'Registrar Restrição' }));
    expect(within(dialog()).getByRole('button', { name: 'Salvando…' })).toBeDisabled();
    await user.click(within(dialog()).getByRole('button', { name: 'Fechar' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('CA-10: fechar com alterações pede confirmação; sem alterações fecha direto', async () => {
    const { user, dialog, onClose } = setup();
    await user.click(within(dialog()).getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.type(within(dialog()).getByRole('textbox', { name: 'Impacto' }), 'x');
    await user.click(within(dialog()).getByRole('button', { name: 'Fechar' }));
    expect(
      screen.getByText('Há alterações não salvas. Deseja sair mesmo assim?'),
    ).toBeInTheDocument();
    const confirmacao = screen.getAllByRole('dialog')[1] as HTMLElement;
    await user.click(within(confirmacao).getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(within(dialog()).getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('erro HTTP mantém o modal e mostra o toast de erro', async () => {
    const { user, dialog, onClose } = setup(restricaoItemFixture(), {
      atualizar: { execute: vi.fn().mockRejectedValue(new Error('500')) },
    });
    await user.click(within(dialog()).getByRole('button', { name: 'Registrar Restrição' }));
    expect(
      await screen.findByText('Não foi possível salvar. Tente novamente.'),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
