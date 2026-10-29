import { navigationState, routerMock } from '@test/nextNavigation';
import { act, renderHook } from '@testing-library/react';
import type { UrlStateSpec } from '../urlState';
import { useUrlState } from '../useUrlState';

const SPEC = {
  page: { kind: 'int', default: 1, min: 1 },
  q: { kind: 'string', default: '' },
} satisfies UrlStateSpec;

describe('useUrlState', () => {
  it('lê os valores da URL e grava com router.replace sem rolar', () => {
    navigationState.pathname = '/drivers';
    navigationState.search = 'page=3';
    const { result } = renderHook(() => useUrlState(SPEC));
    expect(result.current[0]).toEqual({ page: 3, q: '' });
    act(() => result.current[1]({ q: 'x' }));
    expect(routerMock.replace).toHaveBeenCalledWith('/drivers?q=x', { scroll: false });
  });

  it('remove a query quando volta aos padrões', () => {
    navigationState.pathname = '/planos';
    navigationState.search = 'page=2';
    const { result } = renderHook(() => useUrlState(SPEC));
    act(() => result.current[1]({ page: 1 }));
    expect(routerMock.replace).toHaveBeenCalledWith('/planos', { scroll: false });
  });
});
