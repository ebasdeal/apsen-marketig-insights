import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import AccessDeniedPage, { metadata } from '../page';

describe('app/acesso-negado', () => {
  it('define o título da rota', () => {
    expect(metadata.title).toBe('Acesso Negado');
  });

  it('renderiza a tela de acesso negado', async () => {
    renderWithProviders(<AccessDeniedPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Acesso Restrito' })).toBeInTheDocument();
    expect(
      await screen.findByText('Seu perfil (Admin) não tem acesso a esta funcionalidade.'),
    ).toBeInTheDocument();
  });
});
