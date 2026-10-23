'use client';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

const SELECT =
  'rounded-[6px] border border-apsen-border bg-apsen-white px-[11px] py-[8px] font-[inherit] text-[13.5px] text-apsen-slate transition-[border,box-shadow] duration-[140ms] field-focus';

interface FormSelectProps<T extends string> {
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  'aria-label': string;
  className?: string;
}

export function FormSelect<T extends string>({
  value,
  options,
  onChange,
  className = 'w-full',
  'aria-label': label,
}: FormSelectProps<T>) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(event) => {
        const selected = options.find((option) => option.value === event.target.value);
        if (selected !== undefined) {
          onChange(selected.value);
        }
      }}
      className={`${SELECT} ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
