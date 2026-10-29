import { comparacaoComVsSemDrivers } from '@domain/analises/comparacao';
import { buildAnalise } from '@test/fixtures/analises';
import { act, render, screen } from '@testing-library/react';
import ComparacaoChart from '../chart/ComparacaoChart';

const linhas: { borderColor: unknown }[][] = [];

vi.mock('react-chartjs-2', () => ({
  Line: (props: { 'aria-label': string; data: { datasets: { borderColor: unknown }[] } }) => {
    linhas.push(props.data.datasets);
    return <canvas role="img" aria-label={props['aria-label']} />;
  },
}));

describe('ComparacaoChart (CA-11)', () => {
  it('usa as cores dos tokens e redesenha ao trocar o tema', async () => {
    const style = document.documentElement.style;
    style.setProperty('--color-apsen-blue', '#0a13b6');
    render(<ComparacaoChart comparacao={comparacaoComVsSemDrivers(buildAnalise())} />);
    expect(
      screen.getByRole('img', { name: /Gráfico de previsão com e sem drivers/ }),
    ).toBeInTheDocument();
    expect(linhas.at(-1)?.[0]?.borderColor).toBe('#0a13b6');
    await act(async () => {
      style.setProperty('--color-apsen-blue', '#7c87f5');
      document.documentElement.classList.add('dark');
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(linhas.at(-1)?.[0]?.borderColor).toBe('#7c87f5');
    style.removeProperty('--color-apsen-blue');
  });
});
