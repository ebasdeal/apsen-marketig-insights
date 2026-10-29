import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import Loading from '../loading';
import NovoTipoPage, { metadata } from '../page';

describe('app/admin/tipos/novo', () => {
  it('define o título e renderiza o formulário vazio', async () => {
    expect(metadata.title).toBe('Novo Tipo');
    renderWithProviders(<NovoTipoPage />);
    expect(await screen.findByText('Identificação do Tipo')).toBeInTheDocument();
  });

  it('loading mostra o skeleton', () => {
    renderWithProviders(<Loading />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });
});
