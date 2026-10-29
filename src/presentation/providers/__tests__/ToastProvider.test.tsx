import { useEffect } from 'react';
import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { ToastProvider, useToast, type ToastOptions } from '../ToastProvider';

const holder: { api: { show: (message: string, options?: ToastOptions) => void } | null } = {
  api: null,
};

function Capture() {
  const toast = useToast();
  useEffect(() => {
    holder.api = toast;
  }, [toast]);
  return null;
}

function renderToasts() {
  render(
    <ToastProvider>
      <Capture />
    </ToastProvider>,
  );
  return (message: string, options?: ToastOptions) => act(() => holder.api?.show(message, options));
}

function region() {
  return screen.getByRole('region', { name: 'Notificações' });
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fica no canto superior direito, abaixo da linha de título e dos botões da página', () => {
    renderToasts();
    expect(region()).toHaveClass(
      'fixed',
      'pointer-events-none',
      'top-[calc(var(--spacing-topbar)+60px)]',
      'right-[22px]',
      'w-[380px]',
      'flex-col',
      'max-[560px]:right-[16px]',
      'max-[560px]:left-[16px]',
    );
    expect(region()).not.toHaveClass('bottom-[22px]', 'left-1/2');
  });

  it('infere o tom pelo prefixo, remove o emoji e some após 4 s', () => {
    const show = renderToasts();
    show('✅ Ciclo criado!');
    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('data-tone', 'success');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(within(toast).getByText('Tudo certo')).toBeInTheDocument();
    expect(within(toast).getByText('Ciclo criado!')).toBeInTheDocument();
    expect(toast).not.toHaveTextContent('✅');
    act(() => vi.advanceTimersByTime(3999));
    expect(toast).toHaveAttribute('data-state', 'visible');
    act(() => vi.advanceTimersByTime(1));
    expect(toast).toHaveAttribute('data-state', 'leaving');
    act(() => vi.advanceTimersByTime(200));
    expect(region()).toBeEmptyDOMElement();
  });

  it('erro usa role alert e dura 6 s', () => {
    const show = renderToasts();
    show('❌ Não foi possível salvar.');
    const toast = screen.getByRole('alert');
    expect(within(toast).getByText('Não foi possível concluir')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5999));
    expect(toast).toHaveAttribute('data-state', 'visible');
    act(() => vi.advanceTimersByTime(1));
    expect(toast).toHaveAttribute('data-state', 'leaving');
  });

  it('atenção e info com títulos e tom explícito', () => {
    const show = renderToasts();
    show('⚠️ Preencha os campos.');
    show('Copiado.');
    show('Forçado', { tone: 'error' });
    expect(screen.getByText('Atenção')).toBeInTheDocument();
    expect(screen.getByText('Aviso')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Forçado');
  });

  it('pausa com hover e retoma ao sair', () => {
    const show = renderToasts();
    show('Mensagem');
    const toast = screen.getByRole('status');
    act(() => vi.advanceTimersByTime(3000));
    fireEvent.mouseEnter(toast);
    expect(screen.getByTestId('toast-progress')).toHaveClass('[animation-play-state:paused]');
    act(() => vi.advanceTimersByTime(10_000));
    expect(toast).toHaveAttribute('data-state', 'visible');
    fireEvent.mouseLeave(toast);
    act(() => vi.advanceTimersByTime(999));
    expect(toast).toHaveAttribute('data-state', 'visible');
    act(() => vi.advanceTimersByTime(1));
    expect(toast).toHaveAttribute('data-state', 'leaving');
  });

  it('pausa com foco dentro do toast', () => {
    const show = renderToasts();
    show('Mensagem');
    fireEvent.focus(screen.getByRole('button', { name: 'Fechar notificação' }));
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole('status')).toHaveAttribute('data-state', 'visible');
    fireEvent.blur(screen.getByRole('button', { name: 'Fechar notificação' }));
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByRole('status')).toHaveAttribute('data-state', 'leaving');
  });

  it('empilha no máximo 3, mais novo no topo, e não duplica mensagem igual', () => {
    const show = renderToasts();
    ['um', 'dois', 'três', 'quatro'].forEach((text) => show(text));
    const toasts = screen.getAllByRole('status');
    expect(toasts.map((toast) => toast.textContent)).toEqual([
      expect.stringContaining('quatro'),
      expect.stringContaining('três'),
      expect.stringContaining('dois'),
    ]);
    act(() => vi.advanceTimersByTime(3000));
    show('quatro');
    expect(screen.getAllByRole('status')).toHaveLength(3);
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('quatro').closest('[data-state]')).toHaveAttribute(
      'data-state',
      'visible',
    );
  });

  it('fecha pelo ✕ e pelo Esc', () => {
    const show = renderToasts();
    show('primeiro');
    act(() => screen.getByRole('button', { name: 'Fechar notificação' }).click());
    expect(screen.getByRole('status')).toHaveAttribute('data-state', 'leaving');
    act(() => vi.advanceTimersByTime(200));
    show('segundo');
    fireEvent.keyDown(screen.getByRole('status'), { key: 'Enter' });
    expect(screen.getByRole('status')).toHaveAttribute('data-state', 'visible');
    fireEvent.keyDown(screen.getByRole('status'), { key: 'Escape' });
    expect(screen.getByRole('status')).toHaveAttribute('data-state', 'leaving');
  });

  it('limpa os timers ao desmontar', () => {
    const { unmount } = render(
      <ToastProvider>
        <Capture />
      </ToastProvider>,
    );
    act(() => holder.api?.show('x'));
    act(() => screen.getByRole('button', { name: 'Fechar notificação' }).click());
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('useToast fora do provider lança', () => {
    vi.useRealTimers();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useToast())).toThrow(
      'useToast deve ser usado dentro de <ToastProvider>',
    );
    consoleError.mockRestore();
  });
});
