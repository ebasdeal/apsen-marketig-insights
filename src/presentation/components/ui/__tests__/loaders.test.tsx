import { render, screen } from '@testing-library/react';
import { BusyRegion } from '../BusyRegion';
import { FullScreenLoader } from '../FullScreenLoader';

describe('FullScreenLoader', () => {
  it('mostra logo pulsando, spinner e o texto do estado', () => {
    render(<FullScreenLoader label="Verificando sua sessão…" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Verificando sua sessão…');
    expect(status).toHaveClass('fixed', 'inset-0');
    expect(screen.getByTestId('loader-logo')).toHaveClass('motion-safe:animate-pulse');
    expect(screen.getByTestId('loader-spinner')).toHaveClass(
      'border-t-apsen-blue',
      'motion-safe:animate-spin',
    );
  });
});

describe('BusyRegion', () => {
  it('esmaece e marca aria-busy enquanto carrega', () => {
    const { rerender } = render(
      <BusyRegion busy className="extra">
        <p>lista</p>
      </BusyRegion>,
    );
    const region = screen.getByText('lista').parentElement;
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region).toHaveClass('opacity-60', 'extra', 'motion-reduce:transition-none');
    rerender(
      <BusyRegion busy={false}>
        <p>lista</p>
      </BusyRegion>,
    );
    expect(screen.getByText('lista').parentElement).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByText('lista').parentElement).toHaveClass('opacity-100');
  });
});
