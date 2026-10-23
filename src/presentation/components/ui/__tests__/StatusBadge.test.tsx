import { render, screen } from '@testing-library/react';
import { Badge, type BadgeTone } from '../Badge';
import { StatusBadge } from '../StatusBadge';

const TONE_CASES: readonly (readonly [BadgeTone, string])[] = [
  ['blue', 'bg-apsen-blue-bg'],
  ['green', 'bg-apsen-green-bg'],
  ['yellow', 'bg-apsen-yellow-bg'],
  ['red', 'bg-apsen-red-bg'],
  ['gray', 'before:bg-apsen-muted-2'],
  ['teal', 'bg-apsen-teal-bg'],
  ['purple', 'bg-apsen-purple-bg'],
  ['orange', 'bg-apsen-orange-bg'],
];

describe('StatusBadge', () => {
  it.each([
    ['ativa', 'Ativa', 'bg-apsen-green-bg'],
    ['pausada', 'Pausada', 'bg-apsen-orange-bg'],
    ['encerrada', 'Encerrada', 'bg-apsen-bg'],
  ] as const)('exibe %s com rótulo e cor próprios', (status, label, color) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByText(label);
    expect(badge).toHaveAttribute('data-status', status);
    expect(badge).toHaveClass(color, 'text-[11.5px]', 'px-[9px]', "before:content-['']");
    expect(badge).not.toHaveClass('border');
  });

  it.each([
    ['ativa', 'Ativa', 'border-apsen-green-b'],
    ['pausada', 'Pausada', 'border-apsen-orange-b'],
    ['encerrada', 'Encerrada', 'border-apsen-border'],
  ] as const)('usa o badge com borda e sem ponto do cabeçalho para %s', (status, label, border) => {
    render(<StatusBadge status={status} size="lg" />);
    const badge = screen.getByText(label);
    expect(badge).toHaveClass(
      'border',
      border,
      'px-[12px]',
      'py-[4px]',
      'text-[12px]',
      'font-semibold',
    );
    expect(badge).not.toHaveClass("before:content-['']");
  });
});

describe('Badge', () => {
  it.each(TONE_CASES)('aplica o tom %s', (tone, expected) => {
    render(<Badge tone={tone}>Rótulo</Badge>);
    const badge = screen.getByText('Rótulo');
    expect(badge).toHaveClass(expected);
    expect(badge).not.toHaveAttribute('data-status');
  });
});
