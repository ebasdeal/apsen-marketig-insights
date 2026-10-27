import { NotFoundError } from '@domain/shared/DomainError';
import { LEVOXIN_SKUS, makeFamilia } from '@test/factories/catalogo';
import { makeDriver, makeSku } from '@test/factories/drivers';
import { navigationState, routerMock } from '@test/nextNavigation';
import {
  createFakeUseCases,
  renderWithProviders,
  type FakeUseCasesOverrides,
} from '@test/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { Component, type ReactNode } from 'react';
import { DriverFormScreen } from '../DriverFormScreen';

class Boundary extends Component<{ children: ReactNode }, { erro: string | null }> {
  override state = { erro: null };
  static getDerivedStateFromError(error: Error) {
    return { erro: error.message };
  }
  override render() {
    return this.state.erro === null ? this.props.children : <p>{this.state.erro}</p>;
  }
}

function renderForm(
  props: Parameters<typeof DriverFormScreen>[0],
  overrides: FakeUseCasesOverrides = {},
) {
  const useCases = createFakeUseCases(overrides);
  return {
    useCases,
    ...renderWithProviders(
      <Boundary>
        <DriverFormScreen {...props} />
      </Boundary>,
      useCases,
    ),
  };
}

async function escolherTipo(
  user: ReturnType<typeof renderForm>['user'],
  categoria: string,
  tipo: string,
) {
  await user.selectOptions(screen.getByRole('combobox', { name: /Categoria/ }), categoria);
  await user.selectOptions(screen.getByRole('combobox', { name: /Tipo específico/ }), tipo);
}

describe('DriverFormScreen — novo (CA-01, CA-05, CA-10, CA-11, CA-15)', () => {
  beforeEach(() => {
    navigationState.pathname = '/drivers/novo';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('skeleton, depois header e Cards 01/02 sem 03/04', async () => {
    renderForm({ mode: 'new' });
    expect(screen.getByRole('status', { name: 'Carregando formulário…' })).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Registrar Driver de Demanda' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Cadastre variáveis externas para análise causal · Apsen PLP Agent Framework',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Identificação do Evento')).toBeInTheDocument();
    expect(screen.queryByText(/Parâmetros:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Cobertura, Canal & Impacto')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /SKU/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('combobox', { name: /Tipo específico/ })).toBeDisabled();
  });

  it('erro nos lookups com Tentar novamente', async () => {
    const execute = vi.fn().mockRejectedValue(new Error('x'));
    const { user } = renderForm({ mode: 'new' }, { drivers: { formLookups: { execute } } });
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
  });

  it('tipo mostra badge e Cards 03/04; trocar categoria esconde', async () => {
    const { user } = renderForm({ mode: 'new' });
    await screen.findByText('Identificação do Evento');
    await escolherTipo(user, '1', 'preco');
    expect(screen.getByText('💲 Preço selecionado')).toBeInTheDocument();
    expect(screen.getByText('Parâmetros: 💲 Mudança de Preço')).toBeInTheDocument();
    expect(screen.getByText('Cobertura, Canal & Impacto')).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '👥 Força de Vendas' })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: /Categoria/ }), '0');
    expect(screen.queryByText(/selecionado$/)).not.toBeInTheDocument();
    expect(screen.queryByText('Cobertura, Canal & Impacto')).not.toBeInTheDocument();
  });

  it('enviar sem SKU: toast, campo inválido e foco', async () => {
    const { user, useCases } = renderForm({ mode: 'new' });
    await screen.findByText('Identificação do Evento');
    await escolherTipo(user, '5', 'concorrente');
    await user.click(screen.getByRole('button', { name: /Adicionar Registro/ }));
    expect(await screen.findAllByText('Selecione um Produto / SKU.')).toHaveLength(2);
    const campo = screen.getByRole('combobox', { name: /Produto \/ SKU/ });
    await waitFor(() => expect(campo).toHaveFocus());
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(useCases.drivers.create.execute).not.toHaveBeenCalled();
  });

  it('?familia=LEVOXIN: Família pré-selecionada, salva e volta ao catálogo', async () => {
    const { user, useCases } = renderForm({ mode: 'new', familia: 'LEVOXIN' });
    expect(await screen.findByRole('link', { name: 'Voltar aos drivers' })).toHaveAttribute(
      'href',
      '/drivers/catalogo/LEVOXIN',
    );
    expect(screen.getByRole('radio', { name: /Família/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('textbox', { name: 'SKUs identificados pela IA' })).toHaveAttribute(
      'rows',
      '4',
    );
    await escolherTipo(user, '5', 'concorrente');
    await user.type(screen.getByRole('combobox', { name: /Laboratório/ }), 'EMS');
    await user.type(screen.getByLabelText(/^Data Fim/), '2026-08-31');
    await user.click(screen.getByRole('button', { name: /Adicionar Registro/ }));
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/drivers/catalogo/LEVOXIN'));
    expect(useCases.drivers.create.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        draft: expect.objectContaining({ modo: 'familia', familia: 'LEVOXIN' }),
      }),
    );
    expect(await screen.findByText('Driver registrado com sucesso!')).toBeInTheDocument();
  });

  it('família inexistente é ignorada; falha da API mantém dados; Limpar reinicia', async () => {
    const create = vi.fn().mockRejectedValue(new Error('500'));
    const { user } = renderForm(
      { mode: 'new', familia: 'X' },
      {
        catalogo: { familiaSkus: { execute: vi.fn().mockResolvedValue([]) } },
        drivers: { create: { execute: create } },
      },
    );
    expect(await screen.findByRole('radio', { name: /SKU/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.queryByRole('link', { name: 'Voltar aos drivers' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Família/ }));
    await escolherTipo(user, '1', 'pdv');
    await user.type(screen.getByRole('textbox', { name: /Título/ }), 'Meu driver');
    await user.click(screen.getByRole('button', { name: /Adicionar Registro/ }));
    expect(await screen.findAllByText('Selecione a Família / Molécula.')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Limpar' }));
    expect(screen.getByRole('textbox', { name: /Título/ })).toHaveValue('');
    expect(screen.getByRole('radio', { name: /Família/ })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('DriverFormScreen — visualizar e editar (CA-12, CA-13, CA-14)', () => {
  beforeEach(() => {
    navigationState.pathname = '/drivers/3';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('view: título, banner, campos travados e ações', async () => {
    renderForm({ mode: 'view', driverId: '3', familia: 'LEVOXIN' });
    expect(await screen.findByRole('heading', { name: 'Visualizar Driver' })).toBeInTheDocument();
    expect(screen.getByText('Somente leitura · LEVOXIN')).toBeInTheDocument();
    expect(screen.getByText(/👁️ Modo visualização/)).toBeInTheDocument();
    screen.getAllByRole('textbox').forEach((campo) => expect(campo).toBeDisabled());
    expect(screen.queryByRole('button', { name: /Adicionar Registro/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpar' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      '/drivers/3/editar?familia=LEVOXIN',
    );
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/drivers/catalogo/LEVOXIN',
    );
  });

  it('edit: categoria 0 carregada, salva com o mesmo id e preserva parâmetros', async () => {
    const tv = makeDriver({
      id: '2',
      tipo: 'tv',
      parametros: { emissora: 'Globo' },
      upliftPct: 38,
    });
    const update = vi.fn().mockResolvedValue(tv);
    const { user } = renderForm(
      { mode: 'edit', driverId: '2' },
      {
        drivers: {
          getForForm: {
            execute: vi.fn().mockResolvedValue({ driver: tv, sku: makeSku(), familia: null }),
          },
          update: { execute: update },
        },
      },
    );
    expect(await screen.findByRole('heading', { name: 'Editar Driver' })).toBeInTheDocument();
    expect(screen.getByText('Editando registro existente')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Categoria/ })).toHaveValue('0');
    expect(screen.getByText('Valor ajustado manualmente.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Salvar alterações/ }));
    await waitFor(() => expect(update).toHaveBeenCalled());
    expect(update.mock.calls[0]?.[0]).toMatchObject({ id: '2', original: tv });
    expect(await screen.findByText('Driver atualizado com sucesso!')).toBeInTheDocument();
    expect(routerMock.push).toHaveBeenCalledWith('/drivers');
  });

  it('id inexistente chama notFound', async () => {
    renderForm(
      { mode: 'view', driverId: '999' },
      {
        drivers: {
          getForForm: { execute: vi.fn().mockRejectedValue(new NotFoundError('Driver', '999')) },
        },
      },
    );
    expect(await screen.findByText('NEXT_NOT_FOUND')).toBeInTheDocument();
  });

  it('modo família carrega a caixa de SKUs', async () => {
    const driver = makeDriver({ modo: 'familia', molecula: 'LEVOXIN' });
    renderForm(
      { mode: 'view', driverId: '3' },
      {
        drivers: {
          getForForm: {
            execute: vi.fn().mockResolvedValue({ driver, sku: null, familia: makeFamilia() }),
          },
        },
      },
    );
    const box = await screen.findByRole('textbox', { name: 'SKUs identificados pela IA' });
    expect(box).toHaveValue(LEVOXIN_SKUS.join('\n'));
  });
});
