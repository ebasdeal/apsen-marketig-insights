'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { createElement, useEffect, useState, type ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface GuardOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface UnsavedChangesGuard {
  dialog: ReactNode;
  confirmLeave: (href: string) => void;
  confirmNavigation: (href: string) => void;
}

function currentLocation(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function guardedHref(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute('download')) return null;
  if (anchor.target !== '' && anchor.target !== '_self') return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  const href = `${url.pathname}${url.search}${url.hash}`;
  return href === currentLocation() ? null : href;
}

export function useUnsavedChangesGuard(
  dirty: boolean,
  options: GuardOptions = {},
): UnsavedChangesGuard {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    const onClick = (event: MouseEvent) => {
      const href = guardedHref(event);
      if (href === null) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);

  const confirmLeave = (href: string) => {
    if (dirty) setPendingHref(href);
    else router.push(href as Route);
  };

  const dialog = createElement(ConfirmDialog, {
    open: pendingHref !== null,
    title: options.title ?? 'Sair sem salvar?',
    message: options.message ?? 'Há alterações não salvas. Deseja sair mesmo assim?',
    confirmLabel: options.confirmLabel ?? 'Sair',
    cancelLabel: options.cancelLabel ?? 'Cancelar',
    tone: 'danger',
    onCancel: () => setPendingHref(null),
    onConfirm: () => {
      const href = pendingHref;
      setPendingHref(null);
      if (href !== null) router.push(href as Route);
    },
  });

  return { dialog, confirmLeave, confirmNavigation: confirmLeave };
}
