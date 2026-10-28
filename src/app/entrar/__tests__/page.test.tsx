import { renderWithProviders } from '@test/renderWithProviders';
import { logout } from '@test/resetStores';
import { screen } from '@testing-library/react';
import EntrarPage, { metadata } from '../page';

describe('app/entrar', () => {
  it('define o título e renderiza o login fora do shell autenticado', () => {
    expect(metadata.title).toBe('Entrar');
    logout();
    renderWithProviders(<EntrarPage />);
    expect(screen.getByRole('main')).toHaveClass('min-h-dvh');
    expect(screen.getByText('Desenvolvimento')).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: 'Menu lateral' })).not.toBeInTheDocument();
  });
});
