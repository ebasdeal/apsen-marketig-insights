import { act, renderHook } from '@testing-library/react';
import { useDebouncedSearch } from '../useDebouncedSearch';

describe('useDebouncedSearch', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('mostra o texto na hora e só grava após 300 ms, com o último valor', () => {
    const commit = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch('', commit));
    act(() => result.current.change('ba'));
    act(() => result.current.change('bari'));
    expect(result.current.value).toBe('bari');
    act(() => vi.advanceTimersByTime(299));
    expect(commit).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith('bari');
  });

  it('reset cancela o envio pendente', () => {
    const commit = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedSearch('x', commit));
    expect(result.current.value).toBe('x');
    act(() => result.current.change('abc'));
    act(() => result.current.reset());
    act(() => vi.advanceTimersByTime(500));
    expect(commit).not.toHaveBeenCalled();
    expect(result.current.value).toBe('');
    act(() => result.current.change('z'));
    unmount();
    act(() => vi.advanceTimersByTime(500));
    expect(commit).not.toHaveBeenCalled();
  });
});
