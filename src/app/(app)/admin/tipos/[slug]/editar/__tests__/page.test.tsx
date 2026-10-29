import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import Loading from '../loading';
import TipoNotFound from '../not-found';
import EditarTipoPage, { metadata } from '../page';

describe('app/admin/tipos/[slug]/editar', () => {
  it('aguarda params e passa o id decodificado', async () => {
    expect(metadata.title).toBe('Editar Tipo');
    const page = await EditarTipoPage({ params: Promise.resolve({ slug: 'tv%20x' }) });
    expect(page.props).toEqual({ id: 'tv x' });
  });

  it('not-found e loading', () => {
    const { unmount } = renderWithProviders(<TipoNotFound />);
    expect(screen.getByRole('heading', { name: 'Tipo não encontrado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Voltar ao Catálogo' })).toHaveAttribute(
      'href',
      '/admin/tipos',
    );
    unmount();
    renderWithProviders(<Loading />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });
});
