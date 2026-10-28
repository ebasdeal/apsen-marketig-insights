import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanoItemError from '../[id]/error';
import PlanoItemLoading from '../[id]/loading';
import PlanoItemNotFoundPage from '../[id]/not-found';
import PlanoItemPage, { metadata as itemMetadata } from '../[id]/page';
import PlanosError from '../error';
import PlanosLoading from '../loading';
import PlanosPage, { metadata } from '../page';

describe('app/(app)/planos', () => {
  it('CA-12: título e tela da lista', async () => {
    expect(metadata.title).toBe('Planos de Produção');
    renderWithProviders(<PlanosPage />, createFakeUseCases());
    expect(await screen.findByRole('heading', { name: 'Planos de Produção' })).toBeInTheDocument();
  });

  it('loading da lista e do detalhe', () => {
    const { unmount } = render(<PlanosLoading />);
    expect(screen.getByRole('status', { name: 'Carregando itens do plano…' })).toBeInTheDocument();
    unmount();
    render(<PlanoItemLoading />);
    expect(screen.getByRole('status', { name: 'Carregando item do plano…' })).toBeInTheDocument();
  });

  it('erros chamam reset', async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    const { unmount } = render(<PlanosError error={new Error('x')} reset={reset} />);
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    unmount();
    render(<PlanoItemError error={new Error('x')} reset={reset} />);
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reset).toHaveBeenCalledTimes(2);
  });

  it('CA-12: [id]/page aguarda params e repassa o id', async () => {
    expect(itemMetadata.title).toBe('Detalhe do Item');
    const useCases = createFakeUseCases();
    const ui = await PlanoItemPage({ params: Promise.resolve({ id: 'PLP-2026-07-005' }) });
    renderWithProviders(ui, useCases);
    expect(await screen.findByRole('spinbutton', { name: 'Qtd. Planejada' })).toBeInTheDocument();
    expect(useCases.planos.get.execute).toHaveBeenCalledWith('PLP-2026-07-005');
  });

  it('CA-10: not-found mostra o texto e o link de volta', () => {
    render(<PlanoItemNotFoundPage />);
    expect(screen.getByText('Item não encontrado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Voltar para Planos' })).toHaveAttribute(
      'href',
      '/planos',
    );
  });
});
