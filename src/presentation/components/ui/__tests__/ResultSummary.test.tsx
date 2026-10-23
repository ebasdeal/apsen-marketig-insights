import { render, screen } from '@testing-library/react';
import { ResultSummary } from '../ResultSummary';

describe('ResultSummary', () => {
  it('exibe contador e ação', () => {
    render(
      <ResultSummary action={<button type="button">Limpar filtros</button>}>
        <strong>3</strong> campanhas
      </ResultSummary>,
    );
    const counter = screen.getByText('campanhas', { exact: false });
    expect(counter).toHaveClass('text-[13px]', 'text-apsen-muted');
    expect(counter).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument();
  });

  it('exibe só o contador sem ação', () => {
    render(<ResultSummary>0 campanhas</ResultSummary>);
    expect(screen.getByText('0 campanhas')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
