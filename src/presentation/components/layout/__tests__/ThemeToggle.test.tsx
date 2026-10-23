import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { useThemeStore } from '../../../stores/themeStore';
import { ThemeToggle } from '../ThemeToggle';

describe('ThemeToggle', () => {
  it('alterna a preferência de tema e aplica a classe dark', async () => {
    const { user } = renderWithProviders(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Alternar tema' });
    expect(button).toHaveTextContent('Tema: sistema');
    expect(button).toHaveClass('rounded-apsen-pill', 'border-apsen-border', 'text-[12px]');
    await user.click(button);
    expect(button).toHaveTextContent('Tema: claro');
    expect(document.documentElement).not.toHaveClass('dark');
    await user.click(button);
    expect(button).toHaveTextContent('Tema: escuro');
    expect(useThemeStore.getState().preference).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');
    await user.click(button);
    expect(button).toHaveTextContent('Tema: sistema');
  });
});
