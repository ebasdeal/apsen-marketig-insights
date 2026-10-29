import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, ToastRegion, type ToastVisualTone } from '../Toast';

function renderToast(tone: ToastVisualTone, extra: { paused?: boolean; leaving?: boolean } = {}) {
  render(
    <ToastRegion>
      <Toast
        tone={tone}
        title="Título"
        message="Mensagem"
        durationMs={4000}
        paused={extra.paused ?? false}
        leaving={extra.leaving ?? false}
        onClose={vi.fn()}
        onPause={vi.fn()}
        onResume={vi.fn()}
      />
    </ToastRegion>,
  );
}

describe('Toast', () => {
  it.each([
    ['success', 'border-l-apsen-green', 'bg-apsen-green-bg', 'status'],
    ['error', 'border-l-apsen-red', 'bg-apsen-red-bg', 'alert'],
    ['warning', 'border-l-apsen-orange', 'bg-apsen-orange-bg', 'status'],
    ['info', 'border-l-apsen-blue', 'bg-apsen-blue-bg', 'status'],
  ] as const)('tom %s tem faixa, ícone e role', (tone, stripe, iconBg, role) => {
    renderToast(tone);
    const toast = screen.getByRole(role);
    expect(toast).toHaveClass(
      stripe,
      'border-l-[4px]',
      'w-[380px]',
      'min-w-[320px]',
      'max-w-[calc(100vw-32px)]',
      'rounded-apsen-lg',
      'shadow-apsen-dropdown',
      'bg-apsen-white',
      'px-[18px]',
      'py-[16px]',
      'motion-safe:animate-[apsen-toast-in_200ms_ease-out]',
    );
    expect(toast.querySelector('.size-\\[32px\\]')).toHaveClass(iconBg, 'rounded-full');
    expect(screen.getByText('Título')).toHaveClass('text-[13.5px]', 'font-bold');
    expect(screen.getByText('Mensagem')).toHaveClass(
      'text-[13px]',
      'text-apsen-slate-3',
      'line-clamp-3',
    );
    expect(screen.getByTestId('toast-progress')).toHaveClass('h-[3px]', 'origin-left');
    expect(screen.getByTestId('toast-progress')).toHaveStyle({ animationDuration: '4000ms' });
  });

  it('pausado congela a barra e saindo fica transparente', () => {
    renderToast('info', { paused: true, leaving: true });
    expect(screen.getByTestId('toast-progress')).toHaveClass('[animation-play-state:paused]');
    expect(screen.getByRole('status')).toHaveClass('opacity-0');
    expect(screen.getByRole('status')).toHaveAttribute('data-state', 'leaving');
  });

  it('a região ignora cliques e só o cartão recebe eventos, no canto superior direito', () => {
    renderToast('success');
    expect(screen.getByRole('region', { name: 'Notificações' })).toHaveClass(
      'pointer-events-none',
      'fixed',
      'top-[calc(var(--spacing-topbar)+60px)]',
      'right-[22px]',
      'w-[380px]',
    );
    expect(screen.getByRole('status')).toHaveClass('pointer-events-auto');
  });

  it('o botão fechar dispara onClose', async () => {
    const onClose = vi.fn();
    render(
      <ToastRegion>
        <Toast
          tone="info"
          title="T"
          message="M"
          durationMs={4000}
          paused={false}
          leaving={false}
          onClose={onClose}
          onPause={vi.fn()}
          onResume={vi.fn()}
        />
      </ToastRegion>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Fechar notificação' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
