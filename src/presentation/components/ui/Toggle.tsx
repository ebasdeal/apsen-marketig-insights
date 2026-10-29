'use client';

import { usePodeEscrever } from '../../hooks/usePodeEscrever';

const TRACK =
  "absolute inset-0 cursor-pointer rounded-[20px] bg-apsen-border transition-all duration-[180ms] peer-checked:bg-apsen-green peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-apsen-blue peer-disabled:cursor-default peer-disabled:opacity-[.35] before:absolute before:top-[3px] before:left-[3px] before:size-[15px] before:rounded-full before:bg-white before:transition-all before:duration-[180ms] before:content-[''] peer-checked:before:translate-x-[17px]";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  'aria-label': string;
  disabled?: boolean;
  escrita?: boolean;
  'aria-describedby'?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  escrita = false,
  'aria-label': label,
  'aria-describedby': describedBy,
}: ToggleProps) {
  const podeEscrever = usePodeEscrever();
  return (
    <label className="relative inline-block h-[21px] w-[38px] shrink-0">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        aria-checked={checked}
        disabled={disabled || (escrita && !podeEscrever)}
        aria-label={label}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.checked)}
        className="peer absolute size-0 opacity-0"
      />
      <span aria-hidden="true" className={TRACK} />
    </label>
  );
}
