import { renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CiclosError from '../error';
import CiclosLoading from '../loading';
import CiclosPage, { metadata } from '../page';

describe('app/(app)/admin/ciclos', () => {
  it('exporta metadata e renderiza a tela', async () => {
    expect(metadata.title).toBe('Ciclos de Planejamento');
    renderWithProviders(<CiclosPage />);
    expect(screen.getByRole('heading', { name: 'Ciclos de Planejamento' })).toBeInTheDocument();
    expect(await screen.findByText('3 ciclos')).toBeInTheDocument();
  });

  it('loading mostra o skeleton com os cabeçalhos da tabela', () => {
    render(<CiclosLoading />);
    expect(screen.getByRole('status', { name: 'Carregando ciclos…' })).toBeInTheDocument();
    expect(screen.getByText('Responsável')).toBeInTheDocument();
  });

  it('error mostra "Tentar novamente" e chama reset', async () => {
    const reset = vi.fn();
    render(<CiclosError error={new Error('boom')} reset={reset} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
