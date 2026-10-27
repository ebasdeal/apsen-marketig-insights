import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorPage from '../error';

describe('app/error', () => {
  it('delega para RouteError', () => {
    expect(readFileSync(resolve(__dirname, '../error.tsx'), 'utf-8')).toContain(
      '<RouteError {...props} />',
    );
  });

  it('exibe mensagem e chama reset ao tentar novamente', async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<ErrorPage error={new Error('boom')} reset={reset} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado');
    expect(screen.getByRole('heading', { name: 'Algo deu errado' })).toBeInTheDocument();
    expect(screen.getByText(/Tente novamente em instantes/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
