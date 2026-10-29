import { listIngeridosResult } from '@test/fakes/ingeridos';
import { renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { IngeridoDetailModal } from '../components/IngeridoDetailModal';

describe('IngeridoDetailModal — CA-04', () => {
  it('mostra os campos do registro e fecha', async () => {
    const onClose = vi.fn();
    const ingerido = listIngeridosResult().rows[0]!;
    const { user } = renderWithProviders(
      <IngeridoDetailModal ingerido={ingerido} onClose={onClose} />,
    );
    const dialog = screen.getByRole('dialog', { name: 'Driver DRV-2026-029' });
    for (const rotulo of [
      'Produto',
      'SKU',
      'Tipo',
      'Período',
      'Feature',
      'Categoria',
      'Área',
      'Validado por',
    ]) {
      expect(within(dialog).getByText(rotulo)).toHaveClass('uppercase');
    }
    expect(within(dialog).getByText('Baricitinibe 2mg')).toBeInTheDocument();
    expect(within(dialog).getByText('Ana P.')).toBeInTheDocument();
    expect(within(dialog).getByText('dummy_censored')).toHaveClass('text-apsen-red');
    const fechar = within(dialog).getAllByRole('button', { name: 'Fechar' });
    await user.click(fechar[fechar.length - 1]!);
    expect(onClose).toHaveBeenCalled();
  });
});
