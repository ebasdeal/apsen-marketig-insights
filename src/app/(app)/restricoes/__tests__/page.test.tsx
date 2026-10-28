import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RestricoesError from '../error';
import RestricoesLoading from '../loading';
import RestricoesPage, { metadata } from '../page';

describe('app/(app)/restricoes', () => {
  it('define o título e renderiza a tela', async () => {
    expect(metadata.title).toBe('Restrições & Alertas');
    renderWithProviders(<RestricoesPage />, createFakeUseCases());
    expect(
      await screen.findByRole('heading', { name: 'Restrições & Alertas' }),
    ).toBeInTheDocument();
  });

  it('CA-11: loading renderiza o skeleton da tela', () => {
    render(<RestricoesLoading />);
    expect(screen.getByRole('status', { name: 'Carregando restrições…' })).toBeInTheDocument();
    expect(screen.getByRole('note')).toBeInTheDocument();
  });

  it('CA-11: error chama reset em "Tentar novamente"', async () => {
    const reset = vi.fn();
    render(<RestricoesError error={new Error('x')} reset={reset} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reset).toHaveBeenCalled();
  });
});
