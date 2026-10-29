import { NotFoundError } from '@domain/shared/DomainError';
import { AnaliseInvalidaError } from '@domain/analises/AnaliseInvalidaError';
import { buildAnaliseDetail } from '@test/fixtures/analises';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import { AnaliseViewScreen } from '../AnaliseViewScreen';

vi.mock('react-chartjs-2', () => ({
  Line: (props: { 'aria-label': string }) => <canvas role="img" aria-label={props['aria-label']} />,
}));

const RELATORIO = buildAnaliseDetail({
  id: 'ANL-002',
  codigo: 'ANL-002',
  titulo: 'Comparativo Cardio — Mai vs Jun/2026',
  ciclo: 'PLP-2026-06',
  modelo: 'Prophet',
  status: 'relatorio',
  sumario: 'Cresceu <strong>+12%</strong><script>alert(1)</script>.',
  historicoIa: [
    { pergunta: 'Por que Anlodipino não foi afetado?', resposta: 'Concorrência madura.', ts: null },
  ],
});

function setup(detail = RELATORIO, extra: Parameters<typeof createFakeUseCases>[0] = {}) {
  const useCases = createFakeUseCases({
    analises: { get: { execute: vi.fn().mockResolvedValue(detail) }, ...extra.analises },
  });
  return { useCases, ...renderWithProviders(<AnaliseViewScreen id={detail.id} />, useCases) };
}

describe('AnaliseViewScreen', () => {
  it('CA-09: trilha, cabeçalho, meta, pill e PDF habilitado', async () => {
    setup();
    expect(
      await screen.findByRole('heading', { level: 1, name: RELATORIO.titulo }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Trilha da página' })).toHaveTextContent(
      'Análises',
    );
    expect(screen.getByText('PLP-2026-06', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('Prophet', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('📄 Relatório')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar PDF' })).toBeEnabled();
  });

  it('CA-09: rascunho desabilita o PDF', async () => {
    setup(buildAnaliseDetail({ status: 'rascunho' }));
    expect(await screen.findByRole('button', { name: 'Exportar PDF' })).toBeDisabled();
  });

  it('CA-10 / RN-12: seções em ordem, interações e só <strong> interpretado', async () => {
    const { container } = setup();
    await screen.findByRole('heading', { level: 1 });
    const titulos = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titulos).toEqual([
      '📄 Sumário Executivo',
      '📊 Impacto por Driver',
      '📈 Previsão: com vs. sem drivers',
      '📋 Justificativas',
      '⚙️ Modelo Utilizado',
      '💬 Interações com IA Documentadas',
    ]);
    expect(screen.getByText('+12%', { selector: 'strong' })).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText('Pergunta 1')).toBeInTheDocument();
    expect(screen.getByText('"Por que Anlodipino não foi afetado?"')).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Previsão mês a mês com e sem drivers' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Intervalo (80%)' })).toBeInTheDocument();
    expect(screen.getByText(/intervalo de 80% da previsão/)).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: /Gráfico de previsão/ })).toBeInTheDocument();
    expect(await screen.findByRole('log', { name: 'Conversa com a IA' })).toHaveTextContent(
      'Concorrência madura.',
    );
  });

  it('sem histórico não mostra a seção 6; textos vazios viram —', async () => {
    setup(buildAnaliseDetail({ sumario: '', modeloInfo: '' }));
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByText('💬 Interações com IA Documentadas')).not.toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('CA-12: salvar mostra o toast; exportar abre o modal e Baixar PDF fecha', async () => {
    const { user, useCases } = setup(buildAnaliseDetail({ status: 'salva' }));
    await user.click(await screen.findByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Análise salva! PDF disponível.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Exportar PDF' }));
    expect(useCases.analises.exportarPdf.execute).not.toHaveBeenCalled();
    const dialog = await screen.findByRole('dialog', { name: 'Exportar Relatório PDF' });
    expect(within(dialog).getByRole('checkbox', { name: 'Interações com IA' })).not.toBeChecked();
    expect(
      within(dialog)
        .getAllByRole('checkbox')
        .filter((c) => (c as HTMLInputElement).checked),
    ).toHaveLength(4);
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(useCases.analises.exportarPdf.execute).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Exportar PDF' }));
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Exportar Relatório PDF' })).getByRole(
        'button',
        { name: 'Baixar PDF' },
      ),
    );
    expect(useCases.analises.exportarPdf.execute).toHaveBeenCalledWith('ANL-001');
    expect(await screen.findByText('📄 Relatório PDF gerado!')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('erros de escrita mostram toast', async () => {
    const { user } = setup(buildAnaliseDetail({ status: 'salva' }), {
      analises: {
        salvar: { execute: vi.fn().mockRejectedValue(new Error('500')) },
        exportarPdf: {
          execute: vi
            .fn()
            .mockRejectedValue(new AnaliseInvalidaError('⚠️ Salve antes de emitir o relatório.')),
        },
      },
    });
    await user.click(await screen.findByRole('button', { name: 'Salvar' }));
    expect(
      await screen.findByText('Não foi possível salvar. Tente novamente.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Exportar PDF' }));
    await user.click(await screen.findByRole('button', { name: 'Baixar PDF' }));
    expect(await screen.findByText('Salve antes de emitir o relatório.')).toBeInTheDocument();
  });

  it('CA-14: carregando, não encontrada e erro com Tentar novamente', async () => {
    const { unmount } = setup(RELATORIO, {
      analises: { get: { execute: vi.fn().mockRejectedValue(new NotFoundError('Análise', 'x')) } },
    });
    expect(screen.getByText('Carregando análise…')).toBeInTheDocument();
    expect(await screen.findByText('Análise não encontrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Voltar para Análises' })).toHaveAttribute(
      'href',
      '/analises',
    );
    unmount();
    const get = vi
      .fn()
      .mockRejectedValueOnce(new Error('500'))
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValue(RELATORIO);
    const { user } = setup(RELATORIO, { analises: { get: { execute: get } } });
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(get).toHaveBeenCalledTimes(3));
    expect(
      await screen.findByRole('heading', { level: 1, name: RELATORIO.titulo }),
    ).toBeInTheDocument();
  });
});
