import { renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import { EmptyState, ErrorState, InlineEmpty, LoadingState } from '../StateViews';

describe('LoadingState', () => {
  it('mostra o loader da Apsen de conteúdo com rótulo padrão', () => {
    render(<LoadingState />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Carregando…');
    expect(status).toHaveAttribute('data-variant', 'content');
    expect(screen.getByTestId('loader-logo')).toBeInTheDocument();
    expect(screen.queryByText('⟳')).not.toBeInTheDocument();
  });

  it('mostra rótulo customizado', () => {
    render(<LoadingState label="Buscando" />);
    expect(screen.getByRole('status')).toHaveTextContent('Buscando');
  });
});

describe('ErrorState', () => {
  it('exibe título padrão, mensagem e chama retry', async () => {
    const onRetry = vi.fn();
    const { user } = renderWithProviders(<ErrorState message="Falhou" onRetry={onRetry} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Falhou');
    expect(alert).toHaveClass('h-[60vh]');
    expect(
      screen.getByRole('heading', { level: 3, name: 'Não foi possível carregar os dados' }),
    ).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toHaveAttribute('aria-hidden', 'true');
    const retry = screen.getByRole('button', { name: 'Tentar novamente' });
    expect(retry).toHaveClass('text-apsen-blue', 'mt-[16px]');
    await user.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('oculta botão sem handler', () => {
    render(<ErrorState message="Falhou" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('aceita título, ícone e ação customizados sem mensagem', () => {
    render(
      <ErrorState
        icon="🔍"
        title="Página não encontrada"
        action={<button type="button">← Voltar ao Dashboard</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Voltar ao Dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('exibe ícone padrão, descrição e ação opcionais', async () => {
    const onAction = vi.fn();
    const { user } = renderWithProviders(
      <EmptyState title="Vazio" description="Nada aqui" actionLabel="Limpar" onAction={onAction} />,
    );
    expect(screen.getByText('Vazio')).toHaveClass('text-[13.5px]', 'font-medium');
    expect(screen.getByText('Vazio').parentElement).toHaveClass('state-block');
    expect(screen.getByText('Nada aqui').tagName).toBe('SMALL');
    expect(screen.getByText('📣')).toHaveAttribute('aria-hidden', 'true');
    const action = screen.getByRole('button', { name: 'Limpar' });
    expect(action).toHaveClass('px-[12px]', 'text-apsen-blue');
    await user.click(action);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('exibe apenas o título e o ícone customizado sem opcionais', () => {
    render(<EmptyState title="Vazio" icon="🔍" />);
    expect(screen.getByText('Vazio')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.queryByText('Nada aqui')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('oculta ação quando falta o rótulo ou o handler', () => {
    const { rerender } = render(<EmptyState title="Vazio" actionLabel="Limpar" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<EmptyState title="Vazio" onAction={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('InlineEmpty', () => {
  it('exibe texto de vazio dentro de painel', () => {
    render(<InlineEmpty>Nenhuma campanha com ROAS no período</InlineEmpty>);
    expect(screen.getByText('Nenhuma campanha com ROAS no período')).toHaveClass(
      'p-[20px]',
      'text-[13px]',
    );
  });
});
