'use client';

import { FIELD_CONTROL } from './fieldClasses';
import { useFieldControl } from './FormField';

const INPUT = `${FIELD_CONTROL} w-full read-only:bg-apsen-bg read-only:text-apsen-muted aria-[invalid=true]:border-apsen-red-b`;

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'number' | 'date' | 'password' | 'tel' | 'url';
  placeholder?: string;
  name?: string;
  readOnly?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

interface TextAreaProps extends Omit<TextInputProps, 'type'> {
  rows?: number;
}

function useControlAttributes(label: string | undefined) {
  const field = useFieldControl();
  return {
    id: field?.id,
    'aria-label': label,
    'aria-describedby': field?.describedBy,
    'aria-invalid': field?.invalid === true ? true : undefined,
    required: field?.required === true ? true : undefined,
  };
}

export function TextInput({
  value,
  onChange,
  type = 'text',
  className = '',
  'aria-label': label,
  ...rest
}: TextInputProps) {
  const attributes = useControlAttributes(label);
  return (
    <input
      {...attributes}
      {...rest}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${INPUT} ${className}`.trim()}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  className = '',
  'aria-label': label,
  ...rest
}: TextAreaProps) {
  const attributes = useControlAttributes(label);
  return (
    <textarea
      {...attributes}
      {...rest}
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${INPUT} min-h-[72px] resize-y ${className}`.trim()}
    />
  );
}
