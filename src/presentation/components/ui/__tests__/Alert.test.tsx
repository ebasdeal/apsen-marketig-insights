import { render, screen } from '@testing-library/react';
import { Alert, type AlertTone } from '../Alert';

const CASES: readonly [AlertTone, 'status' | 'alert', string][] = [
  ['info', 'status', 'bg-apsen-blue-bg'],
  ['success', 'status', 'bg-apsen-green-bg'],
  ['warning', 'alert', 'bg-apsen-yellow-bg'],
  ['error', 'alert', 'bg-apsen-red-bg'],
];

describe('Alert', () => {
  it.each(CASES)('aplica o tom %s com o papel %s', (tone, role, background) => {
    render(<Alert tone={tone}>Mensagem {tone}</Alert>);
    const alert = screen.getByRole(role);
    expect(alert).toHaveTextContent(`Mensagem ${tone}`);
    expect(alert).toHaveAttribute('data-tone', tone);
    expect(alert).toHaveClass(background, 'rounded-apsen', 'text-[12.5px]');
  });

  it('usa info por padrão, com ícone decorativo e título em destaque', () => {
    const { container } = render(
      <Alert title="Apsen PLP Agent:" className="mb-[12px]">
        recall e ruptura logística = demanda censurada.
      </Alert>,
    );
    const alert = screen.getByRole('status');
    expect(alert).toHaveAttribute('data-tone', 'info');
    expect(alert).toHaveClass('mb-[12px]');
    expect(screen.getByText('Apsen PLP Agent:').tagName).toBe('STRONG');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
