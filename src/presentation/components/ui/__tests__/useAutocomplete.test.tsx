import { act, renderHook } from '@testing-library/react';
import { useAutocomplete } from '../useAutocomplete';

describe('useAutocomplete', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('busca após o debounce e marca pronto', async () => {
    const search = vi.fn().mockResolvedValue([{ value: 'A' }]);
    const { result } = renderHook(() =>
      useAutocomplete({ search, debounceMs: 300, disabledMessage: undefined }),
    );
    expect(result.current.status).toBe('idle');
    act(() => result.current.trigger(' a '));
    expect(result.current.open).toBe(true);
    expect(result.current.status).toBe('loading');
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(search).toHaveBeenCalledWith('a');
    expect(result.current.status).toBe('ready');
    expect(result.current.items).toEqual([{ value: 'A' }]);
    act(() => result.current.move(1));
    expect(result.current.activeIndex).toBe(0);
    act(() => result.current.close());
    expect(result.current.open).toBe(false);
    expect(result.current.activeIndex).toBe(-1);
  });

  it('bloqueia sem buscar e ignora setas sem itens', async () => {
    const search = vi.fn().mockResolvedValue([]);
    const { result } = renderHook(() =>
      useAutocomplete({ search, debounceMs: 300, disabledMessage: 'Selecione' }),
    );
    act(() => result.current.trigger(''));
    expect(result.current.status).toBe('blocked');
    act(() => result.current.move(1));
    expect(result.current.activeIndex).toBe(-1);
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(search).not.toHaveBeenCalled();
  });

  it('descarta a resposta depois de fechar', async () => {
    let resolve: (value: readonly { value: string }[]) => void = () => undefined;
    const search = vi.fn(
      () =>
        new Promise<readonly { value: string }[]>((done) => {
          resolve = done;
        }),
    );
    const { result } = renderHook(() =>
      useAutocomplete({ search, debounceMs: 300, disabledMessage: undefined }),
    );
    act(() => result.current.trigger('x'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    act(() => result.current.close());
    await act(async () => {
      resolve([{ value: 'tarde' }]);
    });
    expect(result.current.items).toEqual([]);
  });
});
