export type ButtonVariant =
  'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'teal' | 'purple' | 'outline-teal';

export type ButtonSize = 'md' | 'sm';

const BASE =
  'inline-flex cursor-pointer items-center gap-[6px] whitespace-nowrap rounded-apsen-pill border font-semibold leading-none transition-all focus-ring disabled:cursor-default disabled:opacity-[.35]';

const SIZES: Record<ButtonSize, string> = {
  md: 'px-[20px] py-[9px] text-[13px]',
  sm: 'px-[12px] py-[5px] text-[12px]',
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'border-apsen-blue bg-apsen-blue text-white hover:bg-apsen-blue-d',
  outline: 'border-apsen-blue bg-apsen-white text-apsen-blue hover:bg-apsen-blue-bg',
  ghost:
    'border-apsen-border bg-transparent text-apsen-muted hover:bg-apsen-bg hover:text-apsen-slate',
  danger: 'border-apsen-red-b bg-apsen-white text-apsen-red hover:bg-apsen-red-bg',
  success: 'border-apsen-green-b bg-apsen-white text-apsen-green hover:bg-apsen-green-bg',
  teal: 'border-apsen-teal bg-apsen-teal text-white hover:bg-apsen-teal-hover',
  purple: 'border-apsen-purple bg-apsen-purple text-white hover:bg-apsen-purple-hover',
  'outline-teal': 'border-apsen-teal bg-apsen-white text-apsen-teal hover:bg-apsen-teal-bg',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = '',
): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`.trim();
}
