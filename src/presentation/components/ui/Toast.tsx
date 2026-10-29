import type { ReactNode } from 'react';

export type ToastVisualTone = 'success' | 'error' | 'warning' | 'info';

const TONE: Record<ToastVisualTone, { stripe: string; icon: string; glyph: string }> = {
  success: {
    stripe: 'border-l-apsen-green bg-apsen-green',
    icon: 'bg-apsen-green-bg text-apsen-success-fg',
    glyph: '✓',
  },
  error: {
    stripe: 'border-l-apsen-red bg-apsen-red',
    icon: 'bg-apsen-red-bg text-apsen-danger-fg',
    glyph: '✕',
  },
  warning: {
    stripe: 'border-l-apsen-orange bg-apsen-orange',
    icon: 'bg-apsen-orange-bg text-apsen-warning-fg',
    glyph: '!',
  },
  info: {
    stripe: 'border-l-apsen-blue bg-apsen-blue',
    icon: 'bg-apsen-blue-bg text-apsen-blue',
    glyph: 'i',
  },
};

export function ToastRegion({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Notificações"
      className="pointer-events-none fixed top-[calc(var(--spacing-topbar)+60px)] right-[22px] z-[9500] flex w-[380px] max-w-[calc(100vw-32px)] flex-col items-end gap-[10px] max-[560px]:top-[calc(var(--spacing-topbar)+8px)] max-[560px]:right-[16px] max-[560px]:left-[16px] max-[560px]:w-auto max-[560px]:max-w-none"
    >
      {children}
    </section>
  );
}

interface ToastProps {
  tone: ToastVisualTone;
  title: string;
  message: string;
  durationMs: number;
  paused: boolean;
  leaving: boolean;
  onClose: () => void;
  onPause: () => void;
  onResume: () => void;
}

export function Toast({
  tone,
  title,
  message,
  durationMs,
  paused,
  leaving,
  onClose,
  onPause,
  onResume,
}: ToastProps) {
  const style = TONE[tone];
  const [stripeBorder, stripeBg] = style.stripe.split(' ');
  const live =
    tone === 'error' ? { role: 'alert' } : { role: 'status', 'aria-live': 'polite' as const };
  return (
    <div
      {...live}
      aria-atomic="true"
      data-tone={tone}
      data-state={leaving ? 'leaving' : 'visible'}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onFocus={onPause}
      onBlur={onResume}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
      className={`pointer-events-auto relative flex w-[380px] min-w-[320px] max-w-[calc(100vw-32px)] items-start gap-[12px] overflow-hidden rounded-apsen-lg border border-l-[4px] border-apsen-border ${stripeBorder} bg-apsen-white px-[18px] py-[16px] shadow-apsen-dropdown transition-opacity duration-200 motion-safe:animate-[apsen-toast-in_200ms_ease-out] motion-reduce:transition-none max-[560px]:w-full max-[560px]:min-w-0 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <span
        aria-hidden="true"
        className={`flex size-[32px] shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${style.icon}`}
      >
        {style.glyph}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold text-apsen-slate">{title}</p>
        <p className="mt-[2px] line-clamp-3 text-[13px] text-apsen-slate-3">{message}</p>
      </div>
      <button
        type="button"
        aria-label="Fechar notificação"
        onClick={onClose}
        className="-mt-[4px] -mr-[6px] flex size-[28px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[14px] text-apsen-muted hover:bg-apsen-hover hover:text-apsen-slate focus-ring"
      >
        ✕
      </button>
      <span
        aria-hidden="true"
        data-testid="toast-progress"
        style={{ animationDuration: `${durationMs}ms` }}
        className={`absolute bottom-0 left-0 h-[3px] w-full origin-left animate-[apsen-toast-progress_linear_forwards] motion-reduce:animate-none ${stripeBg} ${paused ? '[animation-play-state:paused]' : ''}`}
      />
    </div>
  );
}
