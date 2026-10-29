import { CatalogoImportError } from '@domain/tipos/errors';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { ImportCatalogoModal } from '../components/ImportCatalogoModal';

describe('ImportCatalogoModal — CA-06', () => {
  it('JSON inválido marca o campo e mostra o toast; válido importa e fecha', async () => {
    const importar = vi
      .fn()
      .mockRejectedValueOnce(new CatalogoImportError('⚠️ JSON inválido — verifique a sintaxe.'))
      .mockResolvedValueOnce({ toast: '✅ Catálogo importado!', inseridos: 1, atualizados: 0 });
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <ImportCatalogoModal onClose={onClose} />,
      createFakeUseCases({ tipos: { importar: { execute: importar } } }),
    );
    const campo = screen.getByRole('textbox', { name: 'JSON do catálogo' });
    expect(campo).toHaveAttribute('placeholder', '{"schema":"drivers-catalogo-v1","tipos":[...]}');
    expect(campo).toHaveAttribute('rows', '6');
    await user.type(campo, 'x');
    await user.click(screen.getByRole('button', { name: 'Importar' }));
    expect(await screen.findByRole('textbox', { name: 'JSON do catálogo' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(
      screen.getAllByText('JSON inválido — verifique a sintaxe.', { exact: false }).length,
    ).toBeGreaterThan(0);
    expect(onClose).not.toHaveBeenCalled();
    await user.type(campo, 'y');
    expect(campo).not.toHaveAttribute('aria-invalid');
    await user.click(screen.getByRole('button', { name: 'Importar' }));
    expect(await screen.findByText('Catálogo importado!', { exact: false })).toBeInTheDocument();
    expect(importar).toHaveBeenLastCalledWith('xy', expect.any(String));
    expect(onClose).toHaveBeenCalled();
  });

  it('falha genérica não marca o campo', async () => {
    const importar = vi.fn().mockRejectedValue(new Error('500'));
    const { user } = renderWithProviders(
      <ImportCatalogoModal onClose={vi.fn()} />,
      createFakeUseCases({ tipos: { importar: { execute: importar } } }),
    );
    await user.click(screen.getByRole('button', { name: 'Importar' }));
    expect(
      await screen.findByText('Não foi possível salvar as alterações', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'JSON do catálogo' })).not.toHaveAttribute(
      'aria-invalid',
    );
  });
});
