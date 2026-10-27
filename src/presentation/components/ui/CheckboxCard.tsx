'use client';

import { useId, type ReactNode } from 'react';

interface CheckboxCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
  variant?: 'plain' | 'muted';
  disabled?: boolean;
}

const VARIANTS = {
  plain: { card: 'mb-[5px] rounded-[6px] bg-apsen-white px-[12px] py-[9px]', subtitle: '' },
  muted: { card: 'mb-[6px] rounded-apsen bg-apsen-bg px-[12px] py-[10px]', subtitle: 'mt-[2px]' },
};

export function CheckboxCard({
  checked,
  onChange,
  title,
  subtitle,
  aside,
  variant = 'plain',
  disabled = false,
}: CheckboxCardProps) {
  const style = VARIANTS[variant];
  const id = useId();
  return (
    <label
      className={`flex cursor-pointer items-center gap-[10px] border border-apsen-border has-[:disabled]:cursor-default has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-apsen-blue ${style.card}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-labelledby={`${id}-title`}
        aria-describedby={subtitle === undefined ? undefined : `${id}-subtitle`}
        onChange={(event) => onChange(event.target.checked)}
        className="size-[15px] shrink-0 accent-apsen-orange"
      />
      <span className="min-w-0 flex-1">
        <span id={`${id}-title`} className="block text-[13px] font-medium">
          {title}
        </span>
        {subtitle === undefined ? null : (
          <span
            id={`${id}-subtitle`}
            className={`block text-[11.5px] text-apsen-muted ${style.subtitle}`.trim()}
          >
            {subtitle}
          </span>
        )}
      </span>
      {aside === undefined ? null : <span className="shrink-0">{aside}</span>}
    </label>
  );
}
