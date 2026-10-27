import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { RejeicaoModal } from '../components/RejeicaoModal';

describe('RejeicaoModal — CA-06', () => {
  it('sem motivo marca e foca o select; sem justificativa marca o textarea; válido rejeita e fecha', async () => {
    const useCases = createFakeUseCases();
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <RejeicaoModal id="DRV-2026-034" onClose={onClose} />,
      useCases,
    );
    expect(screen.getByRole('dialog', { name: 'Rejeitar Item' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirmar Rejeição' }));
    const motivo = screen.getByRole('combobox', { name: /Motivo/ });
    expect(motivo).toHaveAttribute('aria-invalid', 'true');
    await waitFor(() => expect(motivo).toHaveFocus());
    expect(
      screen.getAllByText('Selecione o motivo da rejeição.', { exact: false }).length,
    ).toBeGreaterThan(1);
    await user.selectOptions(motivo, 'Produto / molécula incorreto');
    await user.click(screen.getByRole('button', { name: 'Confirmar Rejeição' }));
    const justificativa = screen.getByRole('textbox', { name: /Justificativa detalhada/ });
    expect(justificativa).toHaveAttribute('aria-invalid', 'true');
    expect(justificativa).toHaveAttribute('placeholder', 'Descreva o motivo da rejeição...');
    await user.type(justificativa, 'SKU de outra molécula.');
    await user.click(screen.getByRole('button', { name: 'Confirmar Rejeição' }));
    expect(useCases.aprovacoes.rejeitar.execute).toHaveBeenCalledWith({
      id: 'DRV-2026-034',
      motivo: 'Produto / molécula incorreto',
      justificativa: 'SKU de outra molécula.',
    });
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByText('DRV-2026-034 rejeitado', { exact: false })).toBeInTheDocument();
  });

  it('Cancelar fecha sem rejeitar', async () => {
    const useCases = createFakeUseCases();
    const onClose = vi.fn();
    const { user } = renderWithProviders(<RejeicaoModal id="X" onClose={onClose} />, useCases);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
    expect(useCases.aprovacoes.rejeitar.execute).not.toHaveBeenCalled();
  });
});
