import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '../Breadcrumb';

describe('Breadcrumb', () => {
  it('mostra a trilha com link, separador, item atual e voltar', () => {
    render(
      <Breadcrumb
        items={[{ label: 'Catálogo', href: '/admin/tipos' }, { label: 'Configurar Tipo' }]}
        backHref="/admin/tipos"
        backLabel="← Voltar ao Catálogo"
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Trilha da página' });
    expect(nav).toHaveClass(
      'mb-[10px]',
      'flex',
      'items-center',
      'gap-[5px]',
      'text-[12.5px]',
      'text-apsen-muted',
    );
    const link = screen.getByRole('link', { name: 'Catálogo' });
    expect(link).toHaveAttribute('href', '/admin/tipos');
    expect(link).toHaveClass('font-medium', 'text-apsen-blue');
    expect(nav.querySelector('svg')).toHaveClass('size-[11px]');
    const current = screen.getByText('Configurar Tipo');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveClass('font-medium', 'text-apsen-slate');
    const back = screen.getByRole('link', { name: '← Voltar ao Catálogo' });
    expect(back).toHaveClass('mb-[16px]', 'border-apsen-blue', 'min-h-[32px]');
  });

  it('usa o rótulo padrão e a variante crumb', () => {
    render(
      <Breadcrumb
        items={[{ label: 'Análises', href: '/analises' }, { label: 'Nova Análise' }]}
        backHref="/analises"
        linkVariant="crumb"
      />,
    );
    const link = screen.getByRole('link', { name: 'Análises' });
    expect(link).toHaveClass('text-apsen-blue');
    expect(link).not.toHaveClass('font-medium');
    expect(screen.getByRole('link', { name: '← Voltar' })).toBeInTheDocument();
  });

  it('não mostra o voltar sem backHref', () => {
    render(<Breadcrumb items={[{ label: 'Usuários' }]} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByRole('navigation').querySelector('svg')).toBeNull();
  });
});
