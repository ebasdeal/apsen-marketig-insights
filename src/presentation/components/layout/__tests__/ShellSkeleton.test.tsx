import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShellSkeleton } from '../ShellSkeleton';

describe('ShellSkeleton', () => {
  it('mostra a moldura do shell com a região de carregamento rotulada', () => {
    render(<ShellSkeleton label="Verificando sua sessão…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Verificando sua sessão…');
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
