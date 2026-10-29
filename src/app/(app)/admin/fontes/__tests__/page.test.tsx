import { renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FontesError from '../error';
import FontesLoading from '../loading';
import FontesPage, { metadata } from '../page';

describe('app/(app)/admin/fontes', () => {
  it('exporta metadata e renderiza a tela', async () => {
    expect(metadata.title).toBe('Fontes de Dados / APIs');
    renderWithProviders(<FontesPage />);
    expect(screen.getByRole('heading', { name: 'Fontes de Dados / APIs' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Distribuidores' })).toBeInTheDocument();
  });

  it('loading mostra o loader da Apsen', () => {
    render(<FontesLoading />);
    expect(screen.getByRole('status', { name: 'Carregando fontes…' })).toBeInTheDocument();
    expect(screen.getByTestId('loader-logo')).toBeInTheDocument();
  });

  it('error mostra "Tentar novamente" e chama reset', async () => {
    const reset = vi.fn();
    render(<FontesError error={new Error('boom')} reset={reset} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
