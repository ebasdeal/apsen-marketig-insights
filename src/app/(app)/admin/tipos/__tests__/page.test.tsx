import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import ErrorPage from '../error';
import Loading from '../loading';
import TiposPage, { metadata } from '../page';

describe('app/admin/tipos', () => {
  it('define o título e renderiza a tela', async () => {
    expect(metadata.title).toBe('Catálogo de Tipos');
    renderWithProviders(<TiposPage />);
    expect(
      await screen.findByRole('heading', { name: 'Catálogo de Tipos de Driver' }),
    ).toBeInTheDocument();
  });

  it('loading mostra o skeleton e error oferece Tentar novamente', async () => {
    const { unmount } = renderWithProviders(<Loading />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    unmount();
    const reset = vi.fn();
    const { user } = renderWithProviders(<ErrorPage error={new Error('x')} reset={reset} />);
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reset).toHaveBeenCalled();
  });
});
