'use client';

const INPUT =
  'w-full rounded-[6px] border border-apsen-border bg-apsen-white py-[7px] pr-[11px] pl-[30px] text-[13px] text-apsen-slate field-focus';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  'aria-label': string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className = 'min-w-[260px]',
  'aria-label': label,
}: SearchInputProps) {
  return (
    <div className={`relative max-w-[360px] flex-1 ${className}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute top-1/2 left-[9px] size-[14px] -translate-y-1/2 text-apsen-muted-2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT}
      />
    </div>
  );
}
