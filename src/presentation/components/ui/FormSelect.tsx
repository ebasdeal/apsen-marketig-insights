'use client';

import { FIELD_CONTROL } from './fieldClasses';
import { useFieldControl } from './FormField';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectGroup<T extends string> {
  label: string;
  options: readonly SelectOption<T>[];
}

interface FormSelectProps<T extends string> {
  value: T | '';
  onChange: (value: T | '') => void;
  options?: readonly SelectOption<T>[];
  groups?: readonly SelectGroup<T>[];
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

const SELECT = `${FIELD_CONTROL} disabled:cursor-default disabled:bg-apsen-bg disabled:text-apsen-muted aria-[invalid=true]:border-apsen-red-b`;

function renderOptions<T extends string>(options: readonly SelectOption<T>[]) {
  return options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ));
}

export function FormSelect<T extends string>({
  value,
  onChange,
  options = [],
  groups = [],
  placeholder,
  disabled = false,
  className = 'w-full',
  'aria-label': label,
}: FormSelectProps<T>) {
  const field = useFieldControl();
  const all = [...options, ...groups.flatMap((group) => group.options)];
  return (
    <select
      id={field?.id}
      value={value}
      disabled={disabled}
      aria-label={label}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid === true ? true : undefined}
      required={field?.required === true ? true : undefined}
      onChange={(event) => {
        if (event.target.value === '' && placeholder !== undefined) {
          onChange('');
          return;
        }
        const selected = all.find((option) => option.value === event.target.value);
        if (selected !== undefined) {
          onChange(selected.value);
        }
      }}
      className={`${SELECT} ${className}`}
    >
      {placeholder === undefined ? null : <option value="">{placeholder}</option>}
      {renderOptions(options)}
      {groups.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {renderOptions(group.options)}
        </optgroup>
      ))}
    </select>
  );
}
