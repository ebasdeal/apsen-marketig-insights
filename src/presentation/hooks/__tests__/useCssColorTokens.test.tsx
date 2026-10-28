import { act, renderHook } from '@testing-library/react';
import { useCssColorTokens } from '../useCssColorTokens';

describe('useCssColorTokens (CA-11)', () => {
  it('lê os tokens e relê quando a classe do html muda', async () => {
    const style = document.documentElement.style;
    style.setProperty('--color-apsen-blue', '#0a13b6');
    const { result, unmount } = renderHook(() =>
      useCssColorTokens(['--color-apsen-blue', '--color-apsen-inexistente']),
    );
    expect(result.current).toEqual({
      '--color-apsen-blue': '#0a13b6',
      '--color-apsen-inexistente': '',
    });
    await act(async () => {
      style.setProperty('--color-apsen-blue', '#7c87f5');
      document.documentElement.classList.add('dark');
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(result.current['--color-apsen-blue']).toBe('#7c87f5');
    unmount();
    style.removeProperty('--color-apsen-blue');
  });
});
