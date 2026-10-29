import { AgenteValidationError } from '@domain/agentes/errors';
import { NotFoundError } from '@domain/shared/DomainError';
import { CatchBoundary } from '@test/CatchBoundary';
import { createFakeAgentesUseCases } from '@test/fakes/agentes';
import { AGENTE_FORM_FIXTURE } from '@test/fixtures/agentes';
import { routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { AgenteFormScreen } from '../AgenteFormScreen';

function setup(id?: string, overrides: Parameters<typeof createFakeAgentesUseCases>[0] = {}) {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const agentes = createFakeAgentesUseCases(overrides);
  const result = renderWithProviders(
    <CatchBoundary>
      <AgenteFormScreen {...(id === undefined ? {} : { id })} />
    </CatchBoundary>,
    createFakeUseCases({ agentes }),
  );
  return { ...result, agentes };
}

describe('AgenteFormScreen — novo', { timeout: 20000 }, () => {
  afterEach(() => vi.mocked(console.error).mockRestore());

  it('CA-07 cards, padrões e slider', () => {
    setup();
    expect(screen.getByRole('navigation', { name: 'Trilha da página' })).toHaveTextContent(
      'Novo Agente',
    );
    expect(screen.getByRole('combobox', { name: /Schedule/ })).toHaveValue('Diário · 03h00');
    expect(screen.getByRole('slider', { name: /Limiar/ })).toHaveValue('75');
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Ativo / Inativo' })).not.toBeChecked();
    expect(screen.getByRole('group', { name: 'Claude (Anthropic)' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'GPT (OpenAI)' })).toBeInTheDocument();
  });

  it('CA-08 "Testar Conexão" mostra os toasts sem gravar', async () => {
    const { user, agentes } = setup();
    await user.click(screen.getByRole('button', { name: 'Testar Conexão' }));
    expect(await screen.findByText('⟳ Testando conexão...')).toBeInTheDocument();
    expect(
      await screen.findByText('Conexão OK — Key Vault e endpoint acessíveis.', undefined, {
        timeout: 4000,
      }),
    ).toBeInTheDocument();
    expect(agentes.save.execute).not.toHaveBeenCalled();
  });

  it('CA-09 papel vazio: erro, foco e toast', async () => {
    const { user, agentes } = setup();
    await user.click(screen.getByRole('button', { name: 'Salvar Agente' }));
    const papel = screen.getByRole('combobox', { name: /Papel do Agente/ });
    expect(papel).toHaveAttribute('aria-invalid', 'true');
    await waitFor(() => expect(papel).toHaveFocus());
    expect(screen.getAllByText('⚠️ Selecione o papel do agente.').length).toBeGreaterThan(0);
    expect(agentes.save.execute).not.toHaveBeenCalled();
  });

  it('CA-09 válido grava, mostra "Agente salvo!" e volta', async () => {
    const { user, agentes } = setup();
    await user.selectOptions(
      screen.getByRole('combobox', { name: /Papel do Agente/ }),
      '➕ Agente customizado',
    );
    await user.type(screen.getByRole('textbox', { name: /Nome de exibição/ }), 'Agente X');
    await user.selectOptions(screen.getByRole('combobox', { name: /Provedor/ }), 'openai');
    await user.selectOptions(screen.getByRole('combobox', { name: /Ambiente/ }), 'Produção');
    await user.type(screen.getByRole('textbox', { name: /Endpoint/ }), 'https://api.openai.com');
    await user.type(screen.getByRole('textbox', { name: /Key Vault URI/ }), 'https://kv');
    await user.type(screen.getByRole('textbox', { name: /Secret Name/ }), 'segredo');
    await user.selectOptions(screen.getByRole('combobox', { name: /Modelo padrão/ }), 'gpt-4o');
    await user.click(screen.getByRole('button', { name: 'Salvar Agente' }));
    await waitFor(() => expect(agentes.save.execute).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Agente salvo!')).toBeInTheDocument();
    expect(routerMock.push).toHaveBeenCalledWith('/agentes');
  });

  it('erro de validação do servidor e falha genérica', async () => {
    const save = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(
          new AgenteValidationError({ nome: '⚠️ Informe o nome de exibição.' }),
        )
        .mockRejectedValueOnce(new Error('500')),
    };
    const { user } = setup('AG-005', {
      save,
      getForm: {
        execute: vi.fn().mockResolvedValue({
          ...AGENTE_FORM_FIXTURE,
          draft: { ...AGENTE_FORM_FIXTURE.draft, nome: 'Macro' },
        }),
      },
    });
    await user.click(await screen.findByRole('button', { name: 'Salvar Agente' }));
    expect((await screen.findAllByText('⚠️ Informe o nome de exibição.')).length).toBeGreaterThan(
      0,
    );
    await user.click(screen.getByRole('button', { name: 'Salvar Agente' }));
    expect(
      await screen.findByText('Não foi possível salvar as alterações. Tente novamente.'),
    ).toBeInTheDocument();
  });
});

describe('AgenteFormScreen — editar', { timeout: 20000 }, () => {
  afterEach(() => vi.mocked(console.error).mockRestore());

  it('CA-10 pré-preenche, ambiente Desenvolvimento e sujo confirma', async () => {
    const { user, agentes } = setup('AG-005');
    expect(await screen.findByDisplayValue('Desenvolvimento')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Trilha da página' })).toHaveTextContent(
      'Editar Agente',
    );
    expect(agentes.getForm.execute).toHaveBeenCalledWith('AG-005');
    await user.type(screen.getByRole('textbox', { name: /Nome de exibição/ }), 'X');
    await user.click(screen.getByRole('link', { name: '← Voltar' }));
    expect(screen.getByRole('dialog', { name: 'Descartar alterações?' })).toBeInTheDocument();
  });

  it('sem alterações, voltar não pede confirmação', async () => {
    const { user } = setup('AG-005');
    await screen.findByDisplayValue('Desenvolvimento');
    await user.click(screen.getByRole('link', { name: '← Voltar' }));
    expect(screen.queryByRole('dialog', { name: 'Descartar alterações?' })).not.toBeInTheDocument();
  });

  it('schedule e modelo extras viram opções', async () => {
    setup('AG-003', {
      getForm: {
        execute: vi.fn().mockResolvedValue({
          draft: { ...AGENTE_FORM_FIXTURE.draft, schedule: 'H24 · a cada 6h', modelo: 'gpt-5' },
          extras: { schedule: 'H24 · a cada 6h', modelo: 'gpt-5' },
        }),
      },
    });
    expect(await screen.findByDisplayValue('H24 · a cada 6h')).toBeInTheDocument();
    expect(screen.getByDisplayValue('gpt-5')).toBeInTheDocument();
  });

  it('CA-10 inexistente chama notFound; erro genérico tem "Tentar novamente"', async () => {
    setup('AG-9', {
      getForm: { execute: vi.fn().mockRejectedValue(new NotFoundError('Agente', 'AG-9')) },
    });
    expect(await screen.findByText('erro: NEXT_NOT_FOUND')).toBeInTheDocument();
  });

  it('erro genérico ao carregar', async () => {
    setup('AG-1', { getForm: { execute: vi.fn().mockRejectedValue(new Error('rede')) } });
    expect(await screen.findByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });
});
