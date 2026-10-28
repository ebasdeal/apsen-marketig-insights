import { NotFoundError } from '@domain/shared/DomainError';
import { TipoValidationError } from '@domain/tipos/errors';
import { routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import { Component, type ReactNode } from 'react';
import { TipoFormScreen } from '../TipoFormScreen';

class Captura extends Component<{ children: ReactNode }, { erro: string | null }> {
  override state = { erro: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { erro: error.message };
  }
  override render() {
    return this.state.erro === null ? this.props.children : <p>capturado: {this.state.erro}</p>;
  }
}

function novo(overrides: Parameters<typeof createFakeUseCases>[0] = {}) {
  const useCases = createFakeUseCases(overrides);
  return { useCases, ...renderWithProviders(<TipoFormScreen />, useCases) };
}

describe('TipoFormScreen — novo (CA-07)', () => {
  it('mostra breadcrumb, voltar, cards e padrões', async () => {
    novo();
    expect(await screen.findByText('Identificação do Tipo')).toBeInTheDocument();
    const trilha = screen.getByRole('navigation', { name: 'Trilha da página' });
    expect(within(trilha).getByRole('link', { name: 'Catálogo' })).toHaveAttribute(
      'href',
      '/admin/tipos',
    );
    expect(within(trilha).getByText('Configurar Tipo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Voltar ao Catálogo' })).toHaveAttribute(
      'href',
      '/admin/tipos',
    );
    const lag = screen.getByRole('spinbutton', { name: 'Lag padrão (meses)' });
    expect(lag).toHaveValue(0);
    expect(lag).toHaveAttribute('min', '-3');
    expect(lag).toHaveAttribute('max', '6');
    expect(screen.getByRole('switch', { name: 'Ativo no Driver Form' })).toBeChecked();
    expect(screen.getByRole('alert')).toHaveTextContent('FeatureEngineer');
    expect(screen.getByText('Feature Engineering · ApsenPLPEngine')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Opções do campo 1' })).toHaveValue(
      'Epidemia|Alta sazonal|Pandemia',
    );
    expect(screen.getByRole('combobox', { name: /Categoria/ })).toHaveDisplayValue('Selecione...');
    expect(
      screen.getByRole('option', { name: '🌡️ Sazonalidade & Calendário' }),
    ).toBeInTheDocument();
  });
});

describe('TipoFormScreen — salvar (CA-09)', () => {
  it('erro de validação marca o campo, foca e mostra o toast', async () => {
    const erro = new TipoValidationError(
      { fields: { slug: '⚠️ Informe o slug.' }, rows: {} },
      '⚠️ Informe o slug.',
    );
    const { user } = novo({ tipos: { save: { execute: vi.fn().mockRejectedValue(erro) } } });
    await user.click(await screen.findByRole('button', { name: 'Salvar Tipo' }));
    const slug = await screen.findByRole('textbox', { name: /Chave interna/ });
    await waitFor(() => expect(slug).toHaveAttribute('aria-invalid', 'true'));
    expect(slug).toHaveFocus();
    expect(screen.getAllByText('Informe o slug.', { exact: false }).length).toBeGreaterThan(0);
    await user.type(slug, 'a');
    expect(slug).not.toHaveAttribute('aria-invalid');
  });

  it('erro de linha aparece na célula com o controle inválido', async () => {
    const erro = new TipoValidationError(
      { fields: {}, rows: { 'row-1': '⚠️ Campo 1: informe o nome e o label.' } },
      '⚠️ Campo 1: informe o nome e o label.',
    );
    const { user } = novo({ tipos: { save: { execute: vi.fn().mockRejectedValue(erro) } } });
    await user.click(await screen.findByRole('button', { name: 'Salvar Tipo' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Nome do campo 1' })).toHaveAttribute(
        'aria-invalid',
        'true',
      ),
    );
  });

  it('válido salva, mostra o toast e volta ao catálogo', async () => {
    let resolver: (value: { toast: string }) => void = () => undefined;
    const save = vi.fn(() => new Promise<{ toast: string }>((resolve) => (resolver = resolve)));
    const { user } = novo({ tipos: { save: { execute: save } } });
    await user.type(await screen.findByRole('textbox', { name: /Chave interna/ }), 'novo_tipo');
    await user.click(screen.getByRole('button', { name: 'Salvar Tipo' }));
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
    expect(save).toHaveBeenCalledWith({
      modo: 'novo',
      draft: expect.objectContaining({ slug: 'novo_tipo' }) as unknown,
      por: expect.any(String) as unknown,
    });
    resolver({ toast: '✅ Tipo salvo!' });
    expect(await screen.findByText('Tipo salvo!', { exact: false })).toBeInTheDocument();
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/admin/tipos'));
  });
});

describe('TipoFormScreen — guarda (CA-11)', () => {
  it('Cancelar limpo navega direto; sujo pede "Descartar alterações?"', async () => {
    const { user } = novo();
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(routerMock.push).toHaveBeenCalledWith('/admin/tipos');
    routerMock.push.mockClear();
    await user.type(screen.getByRole('textbox', { name: /Label no Driver Form/ }), 'X');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    const dialog = screen.getByRole('dialog', { name: 'Descartar alterações?' });
    expect(routerMock.push).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Descartar' }));
    expect(routerMock.push).toHaveBeenCalledWith('/admin/tipos');
  });

  it('clicar no breadcrumb com alterações também confirma', async () => {
    const { user } = novo();
    await user.type(await screen.findByRole('textbox', { name: /Label no Driver Form/ }), 'X');
    await user.click(screen.getByRole('link', { name: 'Catálogo' }));
    expect(screen.getByRole('dialog', { name: 'Descartar alterações?' })).toBeInTheDocument();
  });
});

describe('TipoFormScreen — editar (CA-10, CA-12)', () => {
  it('pré-preenche com slug somente leitura e feature legada', async () => {
    const useCases = createFakeUseCases();
    const { user } = renderWithProviders(<TipoFormScreen id="tv" />, useCases);
    const slug = await screen.findByRole('textbox', { name: /Chave interna/ });
    expect(slug).toHaveValue('tv');
    expect(slug).toHaveAttribute('readonly');
    expect(screen.getByRole('combobox', { name: /Tipo de feature gerada/ })).toHaveDisplayValue(
      'continua_grp',
    );
    expect(screen.getByRole('combobox', { name: /Categoria/ })).toHaveValue('midia');
    expect(screen.getByRole('textbox', { name: 'Nome do campo 6' })).toHaveValue('praca');
    await user.click(screen.getByRole('button', { name: 'Salvar Tipo' }));
    expect(useCases.tipos.save.execute).toHaveBeenCalledWith(
      expect.objectContaining({ modo: 'editar', id: 'tv' }),
    );
  });

  it('id inexistente chama notFound', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const getForm = vi.fn().mockRejectedValue(new NotFoundError('Tipo', 'x'));
    renderWithProviders(
      <Captura>
        <TipoFormScreen id="x" />
      </Captura>,
      createFakeUseCases({ tipos: { getForm: { execute: getForm } } }),
    );
    expect(await screen.findByText('capturado: NEXT_NOT_FOUND')).toBeInTheDocument();
    vi.mocked(console.error).mockRestore();
  });

  it('carregando e erro com Tentar novamente', async () => {
    const categorias = vi.fn().mockRejectedValueOnce(new Error('500')).mockResolvedValue([]);
    const { user } = novo({ tipos: { categorias: { execute: categorias } } });
    expect(screen.getByRole('status', { name: 'Carregando tipo…' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Identificação do Tipo')).toBeInTheDocument();
  });
});
