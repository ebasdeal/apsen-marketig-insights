import type { FontesUseCases } from '@application/fontes/fontesUseCases';
import { FonteValidationError } from '@domain/fontes/errors';
import type { Mock } from 'vitest';
import { FONTE_CUSTOM, FONTES_FIXTURE, fonteCard } from '@test/fixtures/fontes';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FonteModalMode } from '../fonteForm';
import { FonteModal } from '../components/FonteModal';

type CreateFn = FontesUseCases['create']['execute'];
type UpdateFn = FontesUseCases['update']['execute'];

function render(
  mode: FonteModalMode = { modo: 'nova' },
  overrides: { create?: Mock<CreateFn>; update?: Mock<UpdateFn> } = {},
) {
  const onClose = vi.fn();
  const create =
    overrides.create ??
    vi.fn<CreateFn>().mockResolvedValue({ toast: '✅ Nova fonte "Distribuidores" adicionada.' });
  const update =
    overrides.update ??
    vi.fn<UpdateFn>().mockResolvedValue({ toast: '✅ Fonte configurada para API externa.' });
  const useCases = createFakeUseCases({
    fontes: { create: { execute: create }, update: { execute: update } },
  });
  const result = renderWithProviders(<FonteModal mode={mode} onClose={onClose} />, useCases);
  return { ...result, onClose, create, update };
}

const nome = () => screen.getByRole('textbox', { name: 'Nome da fonte' });
const apiRadio = () => screen.getByRole('radio', { name: '🔌 API externa' });

describe('FonteModal — nova (CA-03)', () => {
  it('mostra identificação, modo e a caixa de API com token só com auth', async () => {
    const { user } = render();
    const dialog = screen.getByRole('dialog', { name: 'Nova Fonte de Dados' });
    expect(nome()).toHaveAttribute('placeholder', 'Ex: Distribuidores / Redes de Farmácia');
    expect(within(dialog).getByRole('combobox', { name: 'Ícone' })).toHaveValue('🔌');
    expect(within(dialog).getAllByRole('option')).toHaveLength(9);
    expect(within(dialog).getByRole('textbox', { name: 'Descrição' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '📦 Lista interna (mock)' })).toBeChecked();
    expect(
      screen.getByText('Usa a lista interna do sistema. Sem chamada de rede.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'URL do endpoint' })).toBeNull();
    await user.click(apiRadio());
    expect(
      screen.getByText('Consulta a API externa em tempo real a cada busca do usuário.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'URL do endpoint' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Cache (minutos)' })).toHaveValue(60);
    expect(screen.getByRole('textbox', { name: 'Campo de valor (JSON path)' })).toHaveValue('nome');
    expect(screen.getByRole('textbox', { name: 'Campo de rótulo (JSON path)' })).toHaveValue(
      'razao_social',
    );
    expect(screen.getByText('?busca=')).toBeInTheDocument();
    expect(screen.queryByLabelText('Token / Chave')).toBeNull();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Método de autenticação' }),
      'Bearer Token / OAuth2',
    );
    expect(screen.getByLabelText('Token / Chave')).toHaveAttribute('type', 'password');
  });

  it('CA-06 sem nome mostra erro, foca e avisa; válido cria e fecha', async () => {
    const { user, create, onClose } = render();
    await user.click(screen.getByRole('button', { name: 'Salvar configuração' }));
    expect(nome()).toHaveAttribute('aria-invalid', 'true');
    expect(nome()).toHaveFocus();
    expect(await screen.findByText('Informe o nome da fonte.')).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
    await user.type(nome(), 'Distribuidores');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Ícone' }),
      '🚚 Distribuidor / Logística',
    );
    await user.type(screen.getByRole('textbox', { name: 'Descrição' }), 'Uso interno');
    await user.click(screen.getByRole('button', { name: 'Salvar configuração' }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Distribuidores',
        icon: '🚚',
        desc: 'Uso interno',
        modo: 'mock',
      }),
    );
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByText('Nova fonte "Distribuidores" adicionada.')).toBeInTheDocument();
  });

  it('CA-06 API sem URL marca a URL; durante o envio mostra "Salvando…"', async () => {
    const { user, create } = render(
      { modo: 'nova' },
      { create: vi.fn(() => new Promise<never>(() => undefined)) },
    );
    await user.type(nome(), 'Distribuidores');
    await user.click(apiRadio());
    await user.click(screen.getByRole('button', { name: 'Salvar configuração' }));
    expect(screen.getByRole('textbox', { name: 'URL do endpoint' })).toHaveFocus();
    expect(
      await screen.findByText('Informe a URL do endpoint para o modo API.'),
    ).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'URL do endpoint' }), 'https://x');
    await user.click(screen.getByRole('button', { name: 'Salvar configuração' }));
    const salvando = screen.getByRole('button', { name: 'Salvando…' });
    expect(salvando).toBeDisabled();
    await user.click(salvando);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('nome repetido vindo do servidor marca o campo', async () => {
    const { user } = render(
      { modo: 'nova' },
      {
        create: vi
          .fn()
          .mockRejectedValue(
            new FonteValidationError({ nome: '⚠️ Já existe uma fonte com este nome.' }),
          ),
      },
    );
    await user.type(nome(), 'Concorrentes / Marcas');
    await user.click(screen.getByRole('button', { name: 'Salvar configuração' }));
    expect(await screen.findByText('⚠️ Já existe uma fonte com este nome.')).toBeInTheDocument();
    expect(nome()).toHaveAttribute('aria-invalid', 'true');
  });

  it('CA-09 RN-06 o token digitado não chega ao caso de uso', async () => {
    const { user, create } = render();
    await user.type(nome(), 'Distribuidores');
    await user.click(apiRadio());
    await user.type(screen.getByRole('textbox', { name: 'URL do endpoint' }), 'https://x');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Método de autenticação' }),
      'API Key (header)',
    );
    await user.type(screen.getByLabelText('Token / Chave'), 'segredo-123');
    await user.click(screen.getByRole('button', { name: 'Salvar configuração' }));
    expect(create).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(create.mock.calls)).not.toContain('segredo-123');
  });
});

describe('FonteModal — configurar (CA-04)', () => {
  it('sem identificação, pré-preenchido, salva a config sem token', async () => {
    const { user, update, onClose } = render({ modo: 'config', fonte: fonteCard(FONTE_CUSTOM) });
    expect(screen.getByRole('dialog', { name: 'Configurar: Distribuidores' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Nome da fonte' })).toBeNull();
    expect(apiRadio()).toBeChecked();
    expect(screen.getByRole('textbox', { name: 'URL do endpoint' })).toHaveValue(
      'https://api.apsen.com.br/v1/distribuidores',
    );
    expect(screen.getByRole('combobox', { name: 'Método de autenticação' })).toHaveValue('bearer');
    await user.type(screen.getByLabelText('Token / Chave'), 'segredo-xyz');
    await user.clear(screen.getByRole('spinbutton', { name: 'Cache (minutos)' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Cache (minutos)' }), '15');
    await user.click(screen.getByRole('button', { name: 'Salvar configuração' }));
    expect(update).toHaveBeenCalledWith({
      id: FONTE_CUSTOM.id,
      config: {
        modo: 'api',
        url: 'https://api.apsen.com.br/v1/distribuidores',
        auth: 'bearer',
        cache: '15',
        mapValor: 'nome',
        mapLabel: 'razao_social',
      },
    });
    expect(JSON.stringify(update.mock.calls)).not.toContain('segredo-xyz');
    expect(onClose).toHaveBeenCalled();
  });

  it('fonte mock salva sem validar URL', async () => {
    const { user, update } = render({ modo: 'config', fonte: fonteCard(FONTES_FIXTURE[0]!) });
    await user.click(screen.getByRole('button', { name: 'Salvar configuração' }));
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: 'concorrentes' }));
  });
});

describe('FonteModal — teste de conexão (CA-05)', () => {
  afterEach(() => vi.useRealTimers());

  it('sem URL mostra erro; com URL testa e conclui após 1,2 s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { create } = render();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(apiRadio());
    await user.click(screen.getByRole('button', { name: '🔍 Testar conexão' }));
    expect(screen.getByText('⚠️ Informe a URL do endpoint antes de testar.')).toHaveClass(
      'bg-apsen-kpi-red',
    );
    await user.type(screen.getByRole('textbox', { name: 'URL do endpoint' }), 'https://x');
    await user.click(screen.getByRole('button', { name: '🔍 Testar conexão' }));
    expect(screen.getByText('⟳ Testando conexão com https://x...')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1200));
    expect(
      screen.getByText(/Conexão simulada com sucesso — 3 registros retornados em 142ms\./),
    ).toHaveClass('bg-apsen-green-bg');
    expect(
      screen.getByText(
        '(Mockup: no sistema real, este teste faz uma chamada HTTP verdadeira ao endpoint.)',
      ),
    ).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });
});

describe('FonteModal — descartar', () => {
  it('token digitado conta como alteração; Descartar fecha', async () => {
    const { user, onClose } = render({ modo: 'config', fonte: fonteCard(FONTE_CUSTOM) });
    await user.type(screen.getByLabelText('Token / Chave'), 'x');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar editando' }));
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sem alterações fecha direto; enviando não fecha', async () => {
    const { user, onClose } = render(
      { modo: 'config', fonte: fonteCard(FONTES_FIXTURE[0]!) },
      { update: vi.fn(() => new Promise<never>(() => undefined)) },
    );
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Salvar configuração' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
