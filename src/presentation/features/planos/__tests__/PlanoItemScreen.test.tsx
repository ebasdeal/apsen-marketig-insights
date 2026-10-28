import { NotFoundError } from '@domain/shared/DomainError';
import { createFakePlanosUseCases, planoItemDetailFixture } from '@test/fakes/planos';
import { routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { loginAs } from '@test/resetStores';
import { screen, within } from '@testing-library/react';
import { Component, type ReactNode } from 'react';
import { PlanoItemScreen } from '../PlanoItemScreen';

class Boundary extends Component<{ children: ReactNode }, { erro: string | null }> {
  override state = { erro: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { erro: error.message };
  }

  override render() {
    return this.state.erro === null ? this.props.children : <p>{this.state.erro}</p>;
  }
}

function setup(planos = {}) {
  const useCases = createFakeUseCases({ planos: createFakePlanosUseCases(planos) });
  const ui = (
    <Boundary>
      <PlanoItemScreen id="PLP-2026-07-005" />
    </Boundary>
  );
  return { ...renderWithProviders(ui, useCases), useCases };
}

describe('PlanoItemScreen', () => {
  it('CA-08 / RN-06: breadcrumb, campos preenchidos, salva, mostra o toast e volta', async () => {
    const { user, useCases } = setup();
    await screen.findByRole('button', { name: 'Salvar Alterações' }, { timeout: 5000 });
    const trilha = screen.getByRole('navigation', { name: 'Trilha da página' });
    expect(within(trilha).getByRole('link', { name: 'Planos de Produção' })).toHaveAttribute(
      'href',
      '/planos',
    );
    expect(within(trilha).getByText('PLP-2026-07-005')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Produto / SKU' })).toHaveValue(
      'Baricitinibe 2mg · Blister 28cp · SKU-00312',
    );
    const qtd = screen.getByRole('spinbutton', { name: 'Qtd. Planejada' });
    expect(qtd).toHaveValue(42500);
    await user.clear(qtd);
    await user.type(qtd, '45000');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'revisao');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Linha de Produção' }),
      'Linha 3',
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Semana de Produção' }),
      'S29 (14–20/07)',
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Responsável' }), 'Carlos Lima');
    await user.type(screen.getByRole('textbox', { name: 'Justificativa / Observação' }), 'Ajuste');
    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));
    expect(useCases.planos.atualizar.execute).toHaveBeenCalledWith(
      'PLP-2026-07-005',
      expect.objectContaining({
        qtd: '45000',
        status: 'revisao',
        linha: 'Linha 3',
        semana: 'S29 (14–20/07)',
        resp: 'Carlos Lima',
        obs: 'Ajuste',
      }),
    );
    expect(await screen.findByText('Item PLP-2026-07-005 atualizado.')).toBeInTheDocument();
    expect(routerMock.push).toHaveBeenCalledWith('/planos');
  }, 15_000);

  it('CA-08: quantidade "0" mostra o erro e foca o campo', async () => {
    const { user, useCases } = setup();
    await screen.findByRole('button', { name: 'Salvar Alterações' }, { timeout: 5000 });
    const qtd = screen.getByRole('spinbutton', { name: 'Qtd. Planejada' });
    await user.clear(qtd);
    await user.type(qtd, '0');
    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));
    expect(qtd).toHaveFocus();
    expect(screen.getAllByText('Informe a quantidade.').length).toBeGreaterThanOrEqual(2);
    expect(useCases.planos.atualizar.execute).not.toHaveBeenCalled();
  });

  it('CA-09: item aprovado abre em modo leitura', async () => {
    setup({
      get: { execute: vi.fn().mockResolvedValue(planoItemDetailFixture({ somenteLeitura: true })) },
    });
    expect(await screen.findByRole('spinbutton', { name: 'Qtd. Planejada' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Salvar Alterações' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('perfis Área/Visualizador veem o detalhe só para leitura', async () => {
    loginAs('viewer');
    setup();
    expect(await screen.findByRole('spinbutton', { name: 'Qtd. Planejada' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Salvar Alterações' })).not.toBeInTheDocument();
  });

  it('CA-11: "Salvando…" durante o envio; sair sujo pede confirmação', async () => {
    const { user } = setup({ atualizar: { execute: vi.fn(() => new Promise(() => undefined)) } });
    await screen.findByRole('button', { name: 'Salvar Alterações' }, { timeout: 5000 });
    const qtd = screen.getByRole('spinbutton', { name: 'Qtd. Planejada' });
    await user.type(qtd, '1');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(
      screen.getByText('Há alterações não salvas. Deseja sair mesmo assim?'),
    ).toBeInTheDocument();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    expect(routerMock.push).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Salvar Alterações' }));
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
  });

  it('cancelar sem alterações volta para a lista', async () => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(routerMock.push).toHaveBeenCalledWith('/planos');
  });

  it('erro HTTP ao salvar mostra o toast', async () => {
    const { user } = setup({ atualizar: { execute: vi.fn().mockRejectedValue(new Error('500')) } });
    await user.click(await screen.findByRole('button', { name: 'Salvar Alterações' }));
    expect(
      await screen.findByText('Não foi possível salvar as alterações. Tente novamente.'),
    ).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('CA-10: NotFoundError chama notFound()', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    setup({ get: { execute: vi.fn().mockRejectedValue(new NotFoundError('Item do plano', 'x')) } });
    expect(await screen.findByText(/NEXT_NOT_FOUND/)).toBeInTheDocument();
    vi.mocked(console.error).mockRestore();
  });

  it('CA-12: carregando e erro com "Tentar novamente"', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('500'))
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValue(planoItemDetailFixture());
    const { user } = setup({ get: { execute } });
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    const alerta = await screen.findByRole('alert');
    await user.click(within(alerta).getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('spinbutton', { name: 'Qtd. Planejada' })).toBeInTheDocument();
  });
});
