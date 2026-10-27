'use client';

import { createContext, useContext, useId, type ReactNode } from 'react';

interface FieldControl {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
}

export const FieldControlContext = createContext<FieldControl | null>(null);

export function useFieldControl(): FieldControl | null {
  return useContext(FieldControlContext);
}

const LABEL = 'text-[11.5px] font-semibold uppercase tracking-[.04em] text-apsen-muted';
const MESSAGE = 'mt-[2px] text-[11px]';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  full?: boolean;
}

export function FormField({
  label,
  children,
  hint,
  error,
  required = false,
  full = false,
}: FormFieldProps) {
  const id = useId();
  const hintId = hint === undefined ? undefined : `${id}-hint`;
  const errorId = error === undefined ? undefined : `${id}-error`;
  const describedBy = [hintId, errorId].filter((value) => value !== undefined).join(' ');
  const control: FieldControl = {
    id,
    describedBy: describedBy === '' ? undefined : describedBy,
    invalid: error !== undefined,
    required,
  };
  return (
    <FieldControlContext value={control}>
      <div className={full ? 'col-span-full flex flex-col gap-[5px]' : 'flex flex-col gap-[5px]'}>
        <label htmlFor={id} className={LABEL}>
          {label}
          {required ? (
            <span aria-hidden="true" className="text-apsen-red">
              {' *'}
            </span>
          ) : null}
        </label>
        {children}
        {hint === undefined ? null : (
          <span id={hintId} className={`${MESSAGE} text-apsen-muted-2`}>
            {hint}
          </span>
        )}
        {error === undefined ? null : (
          <span id={errorId} className={`${MESSAGE} text-apsen-red`}>
            {error}
          </span>
        )}
      </div>
    </FieldControlContext>
  );
}
