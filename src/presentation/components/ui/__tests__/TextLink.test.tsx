import { render, screen } from '@testing-library/react';
import { campaignDetailsRoute } from '@presentation/navigation/routes';
import { TextLink } from '../TextLink';

describe('TextLink', () => {
  it('usa a variante de tabela por padrão', () => {
    render(<TextLink href="/campaigns">CMP-01</TextLink>);
    const link = screen.getByRole('link', { name: 'CMP-01' });
    expect(link).toHaveAttribute('href', '/campaigns');
    expect(link).toHaveClass('font-medium', 'hover:underline');
  });

  it.each([
    ['more', 'text-[12px]'],
    ['crumb', 'text-apsen-blue'],
  ] as const)('aplica a variante %s', (variant, expected) => {
    render(
      <TextLink href="/" variant={variant} aria-label="Ver todas as campanhas" className="x">
        Ver todas →
      </TextLink>,
    );
    const link = screen.getByRole('link', { name: 'Ver todas as campanhas' });
    expect(link).toHaveClass(expected, 'x');
    expect(link).not.toHaveClass('hover:underline');
  });

  it('aplica a variante de código em mono azul', () => {
    render(
      <TextLink href="/campaigns" variant="code">
        CMP-01
      </TextLink>,
    );
    expect(screen.getByRole('link', { name: 'CMP-01' })).toHaveClass(
      'font-mono',
      'text-[12px]',
      'font-semibold',
      'text-apsen-blue',
    );
  });

  it('aceita rota tipada dinâmica', () => {
    render(<TextLink href={campaignDetailsRoute('cmp 1')}>cmp 1</TextLink>);
    expect(screen.getByRole('link', { name: 'cmp 1' })).toHaveAttribute(
      'href',
      '/campaigns/cmp%201',
    );
  });
});
