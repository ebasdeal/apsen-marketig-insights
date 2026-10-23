import { act, render } from '@testing-library/react';
import { THEME_STORAGE_KEY, useThemeStore } from '../../stores/themeStore';
import { ThemeSync } from '../ThemeSync';
import { stubMatchMedia } from './matchMediaStub';

describe('ThemeSync', () => {
  it('aplica o tema conforme a preferência', () => {
    stubMatchMedia(false);
    render(<ThemeSync />);
    expect(document.documentElement).not.toHaveClass('dark');
    act(() => useThemeStore.getState().setPreference('dark'));
    expect(document.documentElement).toHaveClass('dark');
    act(() => useThemeStore.getState().setPreference('light'));
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('reage à mudança do esquema do sistema quando a preferência é sistema', () => {
    const media = stubMatchMedia(false);
    render(<ThemeSync />);
    act(() => media.setMatches(true));
    expect(document.documentElement).toHaveClass('dark');
    act(() => media.setMatches(false));
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('ignora o sistema quando a preferência é explícita', () => {
    const media = stubMatchMedia(false);
    useThemeStore.setState({ preference: 'light' });
    render(<ThemeSync />);
    act(() => media.setMatches(true));
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('remove o listener ao desmontar', () => {
    const media = stubMatchMedia(false);
    const { unmount } = render(<ThemeSync />);
    expect(media.listenerCount()).toBe(1);
    unmount();
    expect(media.listenerCount()).toBe(0);
  });

  it('restaura a preferência salva ao montar', async () => {
    stubMatchMedia(false);
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ state: { preference: 'dark' }, version: 0 }),
    );
    render(<ThemeSync />);
    await vi.waitFor(() => expect(useThemeStore.getState().preference).toBe('dark'));
    await vi.waitFor(() => expect(document.documentElement).toHaveClass('dark'));
  });
});
