'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { PERFIL_TONE_BG } from '../../features/perfis/roleLabels';
import { useSessao } from '../../hooks/useSessao';

const ITEM =
  'flex w-full cursor-pointer items-center gap-[8px] rounded-[6px] px-[10px] py-[8px] text-left text-[13px] text-apsen-slate hover:bg-apsen-hover focus-ring';

function focusItem(menu: HTMLElement | null, delta: number): void {
  const items = Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  const index = items.indexOf(document.activeElement as HTMLElement);
  items[(index + delta + items.length) % items.length]?.focus();
}

// O protótipo tinha um usuário por perfil (letra fixa no perfil); com login real a letra é a do nome.
export function initialOf(nome: string, fallback: string): string {
  return nome.trim().charAt(0).toLocaleUpperCase('pt-BR') || fallback;
}

export function UserMenu() {
  const { usuario, perfil, sair } = useSessao();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !button.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  if (usuario === undefined || perfil === undefined) {
    return null;
  }

  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };
    if (event.key === 'Escape') {
      close();
    } else if (event.key in moves) {
      event.preventDefault();
      focusItem(menu.current, moves[event.key] ?? 0);
    }
  };

  const logout = async () => {
    setOpen(false);
    await sair().catch(() => undefined);
  };

  return (
    <div className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Menu do usuário ${usuario.nome}`}
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-[10px] rounded-apsen-pill p-[2px] pr-[8px] hover:bg-apsen-hover focus-ring"
      >
        <span
          aria-hidden
          data-testid="topbar-avatar"
          className={`flex size-[30px] shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold text-white ${PERFIL_TONE_BG[perfil.tone]}`}
        >
          {initialOf(usuario.nome, perfil.avatar)}
        </span>
        <span className="text-[13px] font-semibold text-apsen-slate max-[560px]:hidden">
          {usuario.nome}
        </span>
      </button>
      {open ? (
        <div
          ref={menu}
          id={menuId}
          role="menu"
          aria-label="Conta"
          onKeyDown={onMenuKey}
          className="absolute top-[calc(100%+8px)] right-0 z-40 w-[260px] rounded-apsen border border-apsen-border bg-apsen-white p-[6px] shadow-apsen-dropdown"
        >
          <div className="border-b border-apsen-border px-[10px] pt-[6px] pb-[10px]">
            <p className="text-[13px] font-semibold text-apsen-slate">{usuario.nome}</p>
            <p className="truncate text-[12px] text-apsen-muted">{usuario.email}</p>
            <p className="mt-[4px] text-[11.5px] text-apsen-muted">Perfil: {perfil.label}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => void logout()}
            className={`${ITEM} mt-[4px]`}
          >
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
