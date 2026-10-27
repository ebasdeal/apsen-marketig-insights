'use client';

import { FormSelect } from './FormSelect';

interface PageSizeSelectProps {
  pageSize: number;
  options: readonly number[];
  onChange: (size: number) => void;
}

export function PageSizeSelect({ pageSize, options, onChange }: PageSizeSelectProps) {
  return (
    <FormSelect
      aria-label="Itens por página"
      className="mr-[8px] w-auto"
      value={String(pageSize)}
      options={options.map((size) => ({ value: String(size), label: String(size) }))}
      onChange={(value) => onChange(Number(value))}
    />
  );
}
