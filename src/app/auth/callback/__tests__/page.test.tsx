import { navigationState } from '@test/nextNavigation';
import { renderWithProviders } from '@test/renderWithProviders';
import { logout } from '@test/resetStores';
import { screen } from '@testing-library/react';
import AuthCallbackPage, { metadata } from '../page';

describe('app/auth/callback', () => {
  it('define o título e renderiza a conclusão do login fora do shell', () => {
    expect(metadata.title).toBe('Entrando…');
    logout();
    navigationState.search = 'code=x';
    renderWithProviders(<AuthCallbackPage />);
    expect(screen.getByRole('main')).toHaveClass('min-h-dvh');
    expect(screen.queryByRole('complementary', { name: 'Menu lateral' })).not.toBeInTheDocument();
  });
});
