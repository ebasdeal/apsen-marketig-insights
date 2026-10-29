import { navigationState } from '@test/nextNavigation';
import {
  createTestQueryClient,
  createWrapper,
  createFakeUseCases,
} from '@test/renderWithProviders';
import { useQuery, type QueryClient } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { RouteProgress } from '../RouteProgress';
import { PROGRESS_CAP, isInternalNavigation, nextProgress } from '../progressMath';

const LINKS: readonly [string, Record<string, string>][] = [
  ['drivers', { href: '/drivers' }],
  ['mesma', { href: '/' }],
  ['externo', { href: 'https://externo.com/x' }],
  ['nova aba', { href: '/planos', target: '_blank' }],
];

function Links() {
  return <>{LINKS.map(([texto, props]) => createElement('a', { key: texto, ...props }, texto))}</>;
}

function Pending() {
  useQuery({ queryKey: ['pendente'], queryFn: () => new Promise(() => undefined) });
  return null;
}

function renderProgress(
  extra: ReactNode = null,
  queryClient: QueryClient = createTestQueryClient(),
) {
  const Wrapper = createWrapper(createFakeUseCases(), queryClient);
  const ui = () => (
    <Wrapper>
      <RouteProgress />
      <Links />
      {extra}
    </Wrapper>
  );
  const result = render(ui());
  return { ...result, rerenderSame: () => result.rerender(ui()) };
}

const preventNavigation = (event: Event) => event.preventDefault();

describe('RouteProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.addEventListener('click', preventNavigation);
  });

  afterEach(() => {
    window.removeEventListener('click', preventNavigation);
    vi.useRealTimers();
  });

  it('só aparece após 120 ms, avança até ~85 % e completa na troca de rota', () => {
    const { rerenderSame } = renderProgress();
    fireEvent.click(screen.getByText('drivers'));
    act(() => vi.advanceTimersByTime(119));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    const bar = screen.getByRole('progressbar', { name: 'Carregando página' });
    expect(bar).toHaveAttribute('aria-valuenow', '10');
    expect(bar).toHaveAttribute('data-mode', 'determinate');
    expect(bar).toHaveClass('fixed', 'top-0', 'h-[3px]', 'z-[70]');
    expect(screen.getByTestId('route-progress-bar')).toHaveClass('bg-apsen-blue');
    act(() => vi.advanceTimersByTime(10_000));
    expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(80);
    expect(Number(bar.getAttribute('aria-valuenow'))).toBeLessThanOrEqual(PROGRESS_CAP);
    navigationState.pathname = '/drivers';
    rerenderSame();
    act(() => vi.advanceTimersByTime(0));
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar).toHaveClass('opacity-0');
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('não pisca em navegação instantânea', () => {
    const { rerenderSame } = renderProgress();
    fireEvent.click(screen.getByText('drivers'));
    act(() => vi.advanceTimersByTime(50));
    navigationState.pathname = '/drivers';
    rerenderSame();
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it.each(['mesma', 'externo', 'nova aba'])('link %s não inicia a barra', (texto) => {
    renderProgress();
    fireEvent.click(screen.getByText(texto));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('ignora clique com modificador', () => {
    renderProgress();
    fireEvent.click(screen.getByText('drivers'), { ctrlKey: true });
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('modo indeterminado enquanto uma query busca pela primeira vez', () => {
    renderProgress(<Pending />);
    act(() => vi.advanceTimersByTime(60));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(300));
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('data-mode', 'indeterminate');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(screen.getByTestId('route-progress-bar')).toHaveClass(
      'motion-safe:animate-[apsen-progress-indeterminate_1.1s_ease-in-out_infinite]',
    );
  });

  it('não aparece em refetch de fundo', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['pendente'], 'dados');
    renderProgress(<Pending />, queryClient);
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});

describe('progressMath', () => {
  it('nextProgress avança em passos sem passar de 85', () => {
    expect(nextProgress(10)).toBe(29);
    expect(nextProgress(84)).toBe(84);
    expect(nextProgress(85)).toBe(85);
  });

  it('isInternalNavigation ignora download', () => {
    const anchor = document.createElement('a');
    anchor.href = '/x';
    anchor.setAttribute('download', '');
    expect(isInternalNavigation(anchor, new URL('http://localhost/'))).toBe(false);
  });
});
