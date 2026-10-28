import type { AnalisesUseCases } from '@application/analises/analisesUseCases';
import { AnaliseInvalidaError } from '@domain/analises/AnaliseInvalidaError';
import { routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import { NovaAnaliseScreen } from '../NovaAnaliseScreen';

const OPCOES = {
  ciclos: [
    { value: 'PLP-2026-07', label: 'PLP-2026-07 · Julho 2026 (ativo)' },
    { value: 'PLP-2026-06', label: 'PLP-2026-06 · Junho 2026' },
  ],
  cicloAtivoId: 'PLP-2026-07',
  modelosGuiados: [
    { id: 'sarimax', nome: 'SARIMAX', icon: '📊', desc: 'Sazonalidade', tag: 'Recomendado' },
    { id: 'prophet', nome: 'Prophet', icon: '🔮', desc: 'Eventos', tag: 'Fácil interpretar' },
  ],
};

const GRUPOS = [
  {
    familia: 'Imunologia',
    skus: [
      { codigo: 'SKU-00312', nome: 'Baricitinibe 2mg', dias: 18, nivelEstoque: 'critico' as const },
      { codigo: 'SKU-00313', nome: 'Baricitinibe 4mg', dias: 0, nivelEstoque: null },
    ],
  },
  {
    familia: 'Cardio',
    skus: [
      { codigo: 'SKU-00058', nome: 'Apixabana 5mg', dias: 45, nivelEstoque: 'atencao' as const },
      { codigo: 'SKU-00091', nome: 'Anlodipino 5mg', dias: 90, nivelEstoque: 'ok' as const },
    ],
  },
];

const DRIVERS = {
  itens: [
    { id: 'DRV-1', tipo: '📺 TV', produto: 'Baricitinibe', params: 'Canal: Globo', intensidade: 4 },
    { id: 'DRV-2', tipo: '🛒 PDV', produto: 'Apixabana', params: 'Desconto 12%', intensidade: 3 },
  ],
  total: 52,
};

function setup(overrides: Partial<AnalisesUseCases> = {}) {
  const useCases = createFakeUseCases({
    analises: {
      opcoes: { execute: vi.fn().mockResolvedValue(OPCOES) },
      skusDoCiclo: { execute: vi.fn().mockResolvedValue(GRUPOS) },
      driversSugeridos: { execute: vi.fn().mockResolvedValue(DRIVERS) },
      executar: { execute: vi.fn().mockResolvedValue({ id: 'uuid-9' }) },
      ...overrides,
    },
  });
  return { useCases, ...renderWithProviders(<NovaAnaliseScreen />, useCases) };
}

describe('NovaAnaliseScreen', () => {
  it('CA-04: trilha, descrição, cards 01–04 e ciclos com (ativo)', async () => {
    setup();
    expect(screen.getByRole('navigation', { name: 'Trilha da página' })).toHaveTextContent(
      'Análises',
    );
    expect(screen.getByRole('link', { name: '← Voltar' })).toHaveAttribute('href', '/analises');
    expect(
      await screen.findByRole('option', { name: 'PLP-2026-07 · Julho 2026 (ativo)' }),
    ).toBeInTheDocument();
    ['01', '02', '04'].forEach((step) =>
      expect(screen.getByText(step)).toHaveClass('text-apsen-orange'),
    );
    expect(screen.getByText('Selecione um ciclo para carregar os SKUs.')).toBeInTheDocument();
  });

  it('CA-05/CA-06: SKUs por família, cores, selecionar/limpar e drivers', async () => {
    const { user } = setup();
    await user.selectOptions(await screen.findByLabelText(/Ciclo/), 'PLP-2026-07');
    expect(await screen.findByText('Imunologia (2 SKUs)')).toHaveClass('text-apsen-pal-purple');
    expect(screen.getByText('18d estoque')).toHaveClass('text-apsen-red');
    expect(screen.getByText('45d estoque')).toHaveClass('text-apsen-yellow-fg');
    expect(screen.getByText('90d estoque')).toHaveClass('text-apsen-green-fg');
    expect(screen.queryByText('0d estoque')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '✓ Selecionar todos' }));
    expect(
      screen
        .getAllByRole('group')
        .flatMap((g) => within(g).getAllByRole('checkbox'))
        .every((c) => (c as HTMLInputElement).checked),
    ).toBe(true);
    expect(await screen.findByText('Drivers Identificados')).toBeInTheDocument();
    expect(await screen.findByText('Canal: Globo')).toBeInTheDocument();
    expect(screen.getByText('+50 drivers aprovados não exibidos')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '✗ Limpar' }));
    expect(screen.queryByText('Drivers Identificados')).not.toBeInTheDocument();
  });

  it('CA-05: ciclo sem SKUs', async () => {
    const { user } = setup({ skusDoCiclo: { execute: vi.fn().mockResolvedValue([]) } });
    await user.selectOptions(await screen.findByLabelText(/Ciclo/), 'PLP-2026-06');
    expect(await screen.findByText('Nenhum SKU para este ciclo.')).toBeInTheDocument();
  });

  it('CA-07: modos Automático, Guiado e Avançado', async () => {
    const { user } = setup();
    await screen.findByRole('option', { name: 'PLP-2026-07 · Julho 2026 (ativo)' });
    expect(screen.getByRole('radio', { name: /Automático/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByText(/A IA selecionará automaticamente/)).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Guiado/ }));
    const guiado = screen.getByRole('radiogroup', { name: 'Modelo guiado' });
    expect(within(guiado).getByRole('radio', { name: /SARIMAX/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.click(within(guiado).getByRole('radio', { name: /Prophet/ }));
    expect(within(guiado).getByRole('radio', { name: /Prophet/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.click(screen.getByRole('radio', { name: /Avançado/ }));
    expect(screen.getByLabelText('Horizonte (meses)')).toHaveValue(3);
    expect(screen.getAllByRole('spinbutton', { name: /Parâmetro/ })).toHaveLength(7);
    await user.selectOptions(screen.getByLabelText(/Modelo/), 'prophet');
    expect(screen.getByRole('checkbox', { name: 'Feriados BR' })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: 'Semanal' }));
    await user.selectOptions(screen.getByLabelText(/Modelo/), 'ensemble');
    expect(screen.getByRole('checkbox', { name: 'Reg. Causal' })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: 'Prophet' }));
    await user.selectOptions(screen.getByLabelText(/Modelo/), 'holt_winters');
    expect(screen.queryByRole('checkbox', { name: 'Anual' })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/Modelo/), 'sarimax');
    const [p] = screen.getAllByRole('spinbutton', { name: /Parâmetro/ });
    await user.clear(p!);
    await user.type(p!, '2');
    expect(p).toHaveValue(2);
  });

  it('CA-08 / RN-04: validações em ordem com toast, erro no campo e foco', async () => {
    const { user, useCases } = setup();
    await screen.findByRole('option', { name: 'PLP-2026-07 · Julho 2026 (ativo)' });
    await user.click(screen.getByRole('button', { name: 'Executar Análise' }));
    expect(await screen.findByText('Informe o título.', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: Impacto campanha/)).toHaveFocus();
    await user.type(screen.getByPlaceholderText(/Ex: Impacto campanha/), 'Teste');
    await user.click(screen.getByRole('button', { name: 'Executar Análise' }));
    expect(await screen.findByText('Selecione o ciclo.', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Ciclo/)).toHaveFocus();
    await user.selectOptions(screen.getByLabelText(/Ciclo/), 'PLP-2026-07');
    await screen.findByText('Imunologia (2 SKUs)');
    await user.click(screen.getByRole('button', { name: 'Executar Análise' }));
    expect(await screen.findByRole('alert', { name: '' })).toHaveTextContent(
      'Selecione ao menos um SKU.',
    );
    await waitFor(() => expect(screen.getAllByRole('checkbox')[0]).toHaveFocus());
    expect(useCases.analises.executar.execute).not.toHaveBeenCalled();
  });

  it('CA-08: horizonte inválido no avançado', async () => {
    const { user } = setup();
    await user.type(await screen.findByPlaceholderText(/Ex: Impacto campanha/), 'Teste');
    await user.selectOptions(screen.getByLabelText(/Ciclo/), 'PLP-2026-07');
    await user.click(await screen.findByText('Baricitinibe 2mg'));
    await user.click(screen.getByRole('radio', { name: /Avançado/ }));
    await user.clear(screen.getByLabelText('Horizonte (meses)'));
    await user.type(screen.getByLabelText('Horizonte (meses)'), '30');
    await user.click(screen.getByRole('button', { name: 'Executar Análise' }));
    expect(
      await screen.findByText('Informe um horizonte entre 1 e 24 meses.', { selector: 'span' }),
    ).toBeInTheDocument();
  });

  it('CA-08 / RN-05: válido executa com drivers marcados e navega', async () => {
    const { user, useCases } = setup();
    await user.type(await screen.findByPlaceholderText(/Ex: Impacto campanha/), 'Teste Cardio');
    await user.selectOptions(screen.getByLabelText(/Ciclo/), 'PLP-2026-07');
    await user.click(await screen.findByText('Baricitinibe 2mg'));
    await screen.findByText('Canal: Globo');
    await user.click(screen.getByRole('checkbox', { name: /PDV/ }));
    await user.click(screen.getByRole('button', { name: 'Executar Análise' }));
    expect(
      await screen.findByText('⟳ Executando análise com o ApsenPLPEngine...'),
    ).toBeInTheDocument();
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/analises/uuid-9'));
    expect(useCases.analises.executar.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Teste Cardio',
        ciclo: 'PLP-2026-07',
        skus: ['SKU-00312'],
        drivers: ['DRV-1'],
        configModelo: { modo: 'auto' },
      }),
    );
    expect(
      await screen.findByText('Análise executada! Salve para emitir o relatório.'),
    ).toBeInTheDocument();
  });

  it('falha de rede e recusa do caso de uso mostram toast', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('500'))
      .mockRejectedValueOnce(new AnaliseInvalidaError('⚠️ Selecione o ciclo.', 'ciclo'));
    const { user } = setup({ executar: { execute } });
    await user.type(await screen.findByPlaceholderText(/Ex: Impacto campanha/), 'T');
    await user.selectOptions(screen.getByLabelText(/Ciclo/), 'PLP-2026-07');
    await user.click(await screen.findByText('Baricitinibe 2mg'));
    await user.click(screen.getByRole('button', { name: 'Executar Análise' }));
    expect(
      await screen.findByText('Não foi possível salvar. Tente novamente.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Executar Análise' }));
    expect(await screen.findByText('Selecione o ciclo.', { selector: 'span' })).toBeInTheDocument();
  });

  it('Cancelar com alterações pede confirmação; estados de erro', async () => {
    const { user } = setup({
      driversSugeridos: { execute: vi.fn().mockRejectedValue(new Error('x')) },
      skusDoCiclo: {
        execute: vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue(GRUPOS),
      },
    });
    await user.type(await screen.findByPlaceholderText(/Ex: Impacto campanha/), 'T');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(await screen.findByRole('dialog', { name: 'Sair sem salvar?' })).toBeInTheDocument();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    await user.selectOptions(screen.getByLabelText(/Ciclo/), 'PLP-2026-07');
    expect(await screen.findByText('Não foi possível carregar os SKUs.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await user.click(await screen.findByText('Baricitinibe 2mg'));
    expect(await screen.findByText('Não foi possível carregar os drivers.')).toBeInTheDocument();
  });

  it('CA-14: opções carregando e com erro', async () => {
    const execute = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue(OPCOES);
    const { user } = setup({ opcoes: { execute } });
    expect(screen.getByText('Carregando ciclos…')).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(
      await screen.findByRole('option', { name: 'PLP-2026-06 · Junho 2026' }),
    ).toBeInTheDocument();
  });
});
