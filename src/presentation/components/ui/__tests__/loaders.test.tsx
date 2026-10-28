import { render, screen } from '@testing-library/react';
import { ApsenLoader } from '../ApsenLoader';
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

describe('ApsenLoader', () => {
  it('usa a variante de conteúdo e o rótulo padrão', () => {
    render(<ApsenLoader />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Carregando…');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('data-variant', 'content');
    expect(status).toHaveClass('min-h-[60vh]', 'items-center', 'justify-center');
    expect(status).not.toHaveClass('fixed');
    expect(screen.getByTestId('loader-logo')).toHaveClass(
      'h-[48px]',
      'motion-safe:animate-pulse',
      'dark:brightness-0',
      'dark:invert',
    );
    expect(screen.getByTestId('loader-logo')).toHaveAttribute('src');
    expect(screen.getByTestId('loader-spinner')).toHaveClass(
      'border-apsen-blue-light',
      'border-t-apsen-blue',
    );
  });

  it('variante inline é compacta e horizontal', () => {
    render(<ApsenLoader variant="inline" label="Carregando SKUs…" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Carregando SKUs…');
    expect(status).not.toHaveClass('min-h-[60vh]', 'flex-col');
    expect(screen.getByTestId('loader-logo')).toHaveClass('h-[24px]');
    expect(screen.getByTestId('loader-spinner')).toHaveClass('size-[18px]');
    expect(screen.getByText('Carregando SKUs…')).toHaveClass('text-[12px]', 'text-apsen-muted');
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
