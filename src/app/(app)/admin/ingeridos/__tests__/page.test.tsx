import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import ErrorPage from '../error';
import Loading from '../loading';
import IngeridosPage, { metadata } from '../page';

describe('app/admin/ingeridos', () => {
  it('define o título e renderiza a tela', async () => {
    expect(metadata.title).toBe('Drivers Ingeridos');
    renderWithProviders(<IngeridosPage />);
    expect(await screen.findByRole('heading', { name: 'Drivers Ingeridos' })).toBeInTheDocument();
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
