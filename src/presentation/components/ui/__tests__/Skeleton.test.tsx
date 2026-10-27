import { render, screen } from '@testing-library/react';
import { CardSkeleton, PageSkeleton, Skeleton, SkeletonText } from '../Skeleton';
import { TableSkeleton } from '../TableSkeleton';

describe('Skeleton', () => {
  it('PageSkeleton anuncia um só status com blocos ocultos e animação segura', () => {
    const { container } = render(<PageSkeleton />);
    const statuses = screen.getAllByRole('status');
    expect(statuses).toHaveLength(1);
    const status = screen.getByRole('status', { name: 'Carregando…' });
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent('Carregando…');
    const blocks = container.querySelectorAll('[data-skeleton="block"]');
    expect(blocks.length).toBeGreaterThan(4);
    blocks.forEach((block) => {
      expect(block).toHaveAttribute('aria-hidden', 'true');
      expect(block).toHaveClass('motion-safe:animate-pulse', 'bg-apsen-border');
      expect(block.className).not.toMatch(/(^|\s)animate-pulse/);
    });
    expect(container.querySelector('.h-\\[58px\\]')).not.toBeNull();
    expect(container.querySelector('.surface')).not.toBeNull();
  });

  it('TableSkeleton gera linhas × colunas e aceita rótulo e cabeçalho', () => {
    const { container } = render(
      <TableSkeleton
        rows={3}
        columns={4}
        label="Carregando catálogo…"
        headers={['Família', 'SKU']}
      />,
    );
    expect(screen.getByRole('status', { name: 'Carregando catálogo…' })).toHaveClass(
      'overflow-x-auto',
      'rounded-apsen-lg',
      'shadow-apsen-sm',
    );
    const rows = container.querySelectorAll('[data-skeleton="row"]');
    expect(rows).toHaveLength(3);
    rows.forEach((row) => {
      expect(row).toHaveClass('h-[45px]');
      expect(row.querySelectorAll('[data-skeleton="block"]')).toHaveLength(4);
    });
    expect(screen.getByText('Família')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.h-\\[38px\\]')).toHaveClass('bg-apsen-bg');
  });

  it('TableSkeleton usa 10 linhas por padrão', () => {
    const { container } = render(<TableSkeleton columns={2} />);
    expect(container.querySelectorAll('[data-skeleton="row"]')).toHaveLength(10);
  });

  it('CardSkeleton e SkeletonText', () => {
    const { container } = render(<CardSkeleton lines={2} label="Carregando formulário…" />);
    const status = screen.getByRole('status', { name: 'Carregando formulário…' });
    expect(status).toHaveClass('surface');
    const bars = container.querySelectorAll('.h-\\[12px\\]');
    expect(bars).toHaveLength(2);
    expect(bars[1]).toHaveClass('w-3/5');
    expect(container.querySelector('.w-\\[180px\\]')).not.toBeNull();
  });

  it('Skeleton aceita tamanho e SkeletonText usa 3 linhas', () => {
    const { container } = render(
      <>
        <Skeleton className="h-[20px] w-[40px]" />
        <SkeletonText />
      </>,
    );
    expect(container.firstChild).toHaveClass('h-[20px]', 'w-[40px]', 'rounded-[6px]');
    expect(container.querySelectorAll('.h-\\[12px\\]')).toHaveLength(3);
  });
});
