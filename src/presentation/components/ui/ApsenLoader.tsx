import Image from 'next/image';

export type ApsenLoaderVariant = 'fullscreen' | 'content' | 'inline';

interface ApsenLoaderProps {
  variant?: ApsenLoaderVariant;
  label?: string;
}

interface VariantStyle {
  container: string;
  logo: string;
  spinner: string;
  label: string;
}

const VARIANTS: Record<ApsenLoaderVariant, VariantStyle> = {
  fullscreen: {
    container:
      'fixed inset-0 z-[9000] flex flex-col items-center justify-center gap-[18px] bg-apsen-bg',
    logo: 'h-[56px]',
    spinner: 'size-[28px] border-[3px]',
    label: 'text-[13px]',
  },
  content: {
    container: 'flex min-h-[60vh] w-full flex-col items-center justify-center gap-[16px]',
    logo: 'h-[48px]',
    spinner: 'size-[26px] border-[3px]',
    label: 'text-[13px]',
  },
  inline: {
    container: 'flex w-full items-center justify-center gap-[10px] py-[12px]',
    logo: 'h-[24px]',
    spinner: 'size-[18px] border-2',
    label: 'text-[12px]',
  },
};

export function ApsenLoader({ variant = 'content', label = 'Carregando…' }: ApsenLoaderProps) {
  const style = VARIANTS[variant];
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      data-variant={variant}
      className={style.container}
    >
      <Image
        src="/brand/apsen-logo.png"
        alt=""
        aria-hidden
        width={124}
        height={96}
        preload={variant === 'fullscreen'}
        data-testid="loader-logo"
        className={`${style.logo} w-auto motion-safe:animate-pulse dark:brightness-0 dark:invert`}
      />
      <span
        aria-hidden
        data-testid="loader-spinner"
        className={`${style.spinner} shrink-0 rounded-full border-apsen-blue-light border-t-apsen-blue motion-safe:animate-spin`}
      />
      <p className={`${style.label} font-medium text-apsen-muted`}>{label}</p>
    </div>
  );
}
