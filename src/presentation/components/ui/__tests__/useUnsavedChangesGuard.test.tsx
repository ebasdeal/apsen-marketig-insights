import { renderWithProviders } from '@test/renderWithProviders';
import { routerMock } from '@test/nextNavigation';
import { fireEvent, screen } from '@testing-library/react';
import Link from 'next/link';
import { useUnsavedChangesGuard } from '../useUnsavedChangesGuard';

function Harness({ dirty, title }: { dirty: boolean; title?: string }) {
  const guard = useUnsavedChangesGuard(dirty, title === undefined ? {} : { title });
  return (
    <div>
      <Link href="/drivers">Meus registros</Link>
      <Link href="/drivers" target="_blank">
        Nova aba
      </Link>
      <a href="https://example.com/x">Externo</a>
      <Link href="/">Aqui</Link>
      <button type="button" onClick={() => guard.confirmLeave('/admin/tipos')}>
        ← Voltar
      </button>
      {guard.dialog}
    </div>
  );
}

function beforeUnload(): Event {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe('useUnsavedChangesGuard', () => {
  it('avisa no beforeunload e intercepta link interno', async () => {
    const { user } = renderWithProviders(<Harness dirty />);
    expect(beforeUnload().defaultPrevented).toBe(true);
    await user.click(screen.getByRole('link', { name: 'Meus registros' }));
    expect(screen.getByRole('dialog', { name: 'Sair sem salvar?' })).toBeInTheDocument();
    expect(
      screen.getByText('Há alterações não salvas. Deseja sair mesmo assim?'),
    ).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(routerMock.push).toHaveBeenCalledWith('/drivers');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('fecha no Cancelar sem navegar', async () => {
    const { user } = renderWithProviders(<Harness dirty title="Descartar alterações?" />);
    await user.click(screen.getByRole('button', { name: '← Voltar' }));
    expect(screen.getByRole('dialog', { name: 'Descartar alterações?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('não intercepta nova aba, externo, mesma página nem modificadores', () => {
    renderWithProviders(<Harness dirty />);
    const blank = new MouseEvent('click', { bubbles: true, cancelable: true });
    screen.getByRole('link', { name: 'Nova aba' }).dispatchEvent(blank);
    fireEvent.click(screen.getByRole('link', { name: 'Externo' }));
    fireEvent.click(screen.getByRole('link', { name: 'Aqui' }));
    fireEvent.click(screen.getByRole('link', { name: 'Meus registros' }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('link', { name: 'Meus registros' }), { button: 1 });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('não intercepta quando limpo e navega direto pelo confirmLeave', async () => {
    const { user } = renderWithProviders(<Harness dirty={false} />);
    expect(beforeUnload().defaultPrevented).toBe(false);
    fireEvent.click(screen.getByRole('link', { name: 'Meus registros' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: '← Voltar' }));
    expect(routerMock.push).toHaveBeenCalledWith('/admin/tipos');
  });

  it('remove os listeners no unmount', () => {
    const removeWindow = vi.spyOn(window, 'removeEventListener');
    const removeDocument = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderWithProviders(<Harness dirty />);
    unmount();
    expect(removeWindow).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(removeDocument).toHaveBeenCalledWith('click', expect.any(Function), true);
    expect(beforeUnload().defaultPrevented).toBe(false);
    removeWindow.mockRestore();
    removeDocument.mockRestore();
  });
});
