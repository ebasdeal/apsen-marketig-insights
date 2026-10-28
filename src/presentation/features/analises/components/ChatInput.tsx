'use client';

import { useRef, useState, type KeyboardEvent } from 'react';

const ALTURA_MAX = 100;

interface ChatInputProps {
  disabled: boolean;
  onEnviar: (texto: string) => void;
}

export function ChatInput({ disabled, onEnviar }: ChatInputProps) {
  const [texto, setTexto] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  function ajustarAltura() {
    const campo = ref.current;
    if (campo === null) return;
    campo.style.height = 'auto';
    campo.style.height = `${Math.min(campo.scrollHeight, ALTURA_MAX)}px`;
  }

  function enviar() {
    const limpo = texto.trim();
    if (limpo === '' || disabled) return;
    onEnviar(limpo);
    setTexto('');
    if (ref.current !== null) ref.current.style.height = 'auto';
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      enviar();
    }
  }

  return (
    <div className="flex items-end gap-[8px] border-t border-apsen-border p-[10px]">
      <textarea
        ref={ref}
        rows={1}
        value={texto}
        disabled={disabled}
        aria-label="Pergunte à IA"
        placeholder="Pergunte à IA..."
        onChange={(event) => {
          setTexto(event.target.value);
          ajustarAltura();
        }}
        onKeyDown={onKeyDown}
        className="flex-1 resize-none rounded-apsen border border-apsen-border bg-apsen-white px-[11px] py-[8px] text-[13px] leading-[1.5] text-apsen-slate field-focus"
      />
      <button
        type="button"
        aria-label="Enviar"
        disabled={disabled}
        onClick={enviar}
        className="flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-apsen border-0 bg-apsen-blue text-white focus-ring disabled:cursor-default disabled:opacity-[.6]"
      >
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
