import { render, screen } from '@testing-library/react';
import { RelatoriosScreen } from '../RelatoriosScreen';

describe('RelatoriosScreen', () => {
  it('CA-01: cabeçalho sem ações', () => {
    render(<RelatoriosScreen />);
    expect(screen.getByRole('heading', { level: 1, name: 'Relatórios' })).toBeInTheDocument();
    expect(
      screen.getByText('Central de relatórios do módulo Demand Intelligence'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('CA-02 / RN-01: card, candidatos e pill', () => {
    render(<RelatoriosScreen />);
    const card = screen.getByRole('region', { name: 'Relatórios — A definir' });
    expect(card).toHaveClass('max-w-[560px]');
    expect(screen.getByText('Possíveis candidatos:', { selector: 'strong' })).toBeInTheDocument();
    expect(card).toHaveTextContent(
      'Acurácia do forecast por ciclo · Histórico de drivers por SKU · Painel de restrições resolvidas · Aderência do plano de produção · Comparativo previsto vs. realizado.',
    );
    expect(screen.getByText('🔜 Em definição')).toHaveClass('bg-apsen-cyan-bg');
  });

  it('CA-03: nenhuma requisição e nenhum estado', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<RelatoriosScreen />);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fetchSpy.mockRestore();
  });
});
