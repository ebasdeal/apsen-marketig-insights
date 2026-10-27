import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('aplica o tamanho xl com ponto e sem borda', () => {
    render(
      <Badge tone="yellow" size="xl">
        2 pendentes
      </Badge>,
    );
    const badge = screen.getByText('2 pendentes');
    expect(badge).toHaveClass(
      'gap-[5px]',
      'px-[13px]',
      'py-[5px]',
      'text-[12.5px]',
      'font-medium',
      'before:size-[5px]',
      'bg-apsen-yellow-bg',
    );
    expect(badge).not.toHaveClass('border');
  });

  it('mantém o lg com borda e sem ponto e o md com ponto', () => {
    render(
      <>
        <Badge tone="green" size="lg">
          Concluída
        </Badge>
        <Badge tone="blue" data-status="ok">
          Ativo
        </Badge>
      </>,
    );
    const lg = screen.getByText('Concluída');
    expect(lg).toHaveClass('border', 'px-[12px]', 'py-[4px]', 'border-apsen-green-b');
    expect(lg).not.toHaveClass('before:size-[5px]');
    const md = screen.getByText('Ativo');
    expect(md).toHaveClass('px-[9px]', 'before:size-[5px]');
    expect(md).toHaveAttribute('data-status', 'ok');
  });
});
