import { useCampaignFiltersStore } from '@presentation/stores/campaignFiltersStore';
import { buildListItem } from '@test/factories';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import type { Mock } from 'vitest';
import { CampaignListScreen } from '../CampaignListScreen';

const items = [
  buildListItem({ id: 'a', name: 'Alfa' }),
  buildListItem({ id: 'b', name: 'Beta', channel: 'meta' }),
];

const many = Array.from({ length: 19 }, (_, index) =>
  buildListItem({ id: `c-${index + 1}`, name: `Campanha ${index + 1}` }),
);

function setup(execute: Mock) {
  return renderWithProviders(
    <CampaignListScreen />,
    createFakeUseCases({ listCampaigns: { execute } }),
  );
}

function bodyRows() {
  const [, body] = within(screen.getByRole('table', { name: 'Campanhas' })).getAllByRole(
    'rowgroup',
  );
  return within(body as HTMLElement).getAllByRole('row');
}

describe('CampaignListScreen', () => {
  it('mostra cabeçalho, filtros, loading e depois tabela, contador e paginação', async () => {
    setup(vi.fn().mockResolvedValue(items));
    expect(screen.getByRole('heading', { level: 1, name: 'Campanhas' })).toBeInTheDocument();
    expect(screen.getByText('Acompanhe o desempenho das suas campanhas.')).toBeInTheDocument();
    expect(screen.getByText('detalhe de métricas e orçamento').tagName).toBe('EM');
    expect(screen.getByRole('search', { name: 'Filtros' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Carregando campanhas…');
    await screen.findByRole('table', { name: 'Campanhas' });
    expect(bodyRows()).toHaveLength(2);
    expect(screen.getByText(/campanhas ·/)).toHaveTextContent('2 campanhas · Todo o período');
    expect(screen.getByText('Mostrando 1–2 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument();
  });

  it('aplica filtros por select via store e reconsulta', async () => {
    const execute = vi.fn().mockResolvedValue(items);
    const { user } = setup(execute);
    await screen.findByText('Alfa');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Canal' }), 'Meta Ads');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), '● Pausada');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Período' }), 'Ano atual');

    expect(useCampaignFiltersStore.getState()).toMatchObject({
      channel: 'meta',
      status: 'pausada',
      period: 'ytd',
    });
    await waitFor(() =>
      expect(execute).toHaveBeenLastCalledWith({
        channel: 'meta',
        status: 'pausada',
        period: { start: expect.any(String), end: expect.any(String) },
      }),
    );

    await user.click(await screen.findByRole('button', { name: 'Limpar filtros' }));
    expect(useCampaignFiltersStore.getState()).toMatchObject({ channel: null, status: null });
    await waitFor(() => expect(execute).toHaveBeenLastCalledWith({}));
  });

  it('busca pelo nome sem reconsultar, ignorando caixa e acento', async () => {
    const execute = vi
      .fn()
      .mockResolvedValue([
        buildListItem({ id: 'p', name: 'Promoção Inverno' }),
        buildListItem({ id: 'q', name: 'Black Friday' }),
      ]);
    const { user } = setup(execute);
    await screen.findByText('Black Friday');

    await user.type(screen.getByRole('textbox', { name: 'Buscar campanha' }), 'PROMOCAO');

    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByText('Promoção Inverno')).toBeInTheDocument();
    expect(screen.queryByText('Black Friday')).not.toBeInTheDocument();
    expect(screen.getByText(/campanha ·/)).toHaveTextContent('1 campanha · Todo o período');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('pagina 8 itens por página e volta para a página 1 ao filtrar', async () => {
    const { user } = setup(vi.fn().mockResolvedValue(many));
    await screen.findByText('Campanha 1');
    expect(bodyRows()).toHaveLength(8);
    expect(screen.getByText('Mostrando 1–8 de 19')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Página 3' }));
    expect(screen.getByText('Mostrando 17–19 de 19')).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await user.type(screen.getByRole('textbox', { name: 'Buscar campanha' }), 'campanha');
    expect(useCampaignFiltersStore.getState().page).toBe(1);
    expect(screen.getByText('Mostrando 1–8 de 19')).toBeInTheDocument();
  });

  it('mostra a linha de vazio e permite limpar quando há filtros', async () => {
    useCampaignFiltersStore.getState().setChannel('email');
    const { user } = setup(vi.fn().mockResolvedValue([]));
    expect(
      await screen.findByRole('cell', {
        name: 'Nenhuma campanha encontrada com os filtros atuais.',
      }),
    ).toHaveAttribute('colspan', '7');
    expect(screen.getByText(/campanhas ·/)).toHaveTextContent('0 campanhas');
    expect(screen.getByText('Mostrando 0–0 de 0')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(useCampaignFiltersStore.getState().channel).toBeNull();
  });

  it('mostra a linha de vazio sem filtros', async () => {
    setup(vi.fn().mockResolvedValue([]));
    expect(
      await screen.findByRole('cell', { name: 'Nenhuma campanha cadastrada.' }),
    ).toHaveAttribute('colspan', '7');
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument();
  });

  it('mostra erro e tenta novamente', async () => {
    const execute = vi.fn().mockRejectedValueOnce(new Error('rede')).mockResolvedValue(items);
    const { user } = setup(execute);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Alfa')).toBeInTheDocument();
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('aponta cada linha para o detalhe da campanha', async () => {
    setup(vi.fn().mockResolvedValue(items));
    expect(await screen.findByRole('link', { name: 'Abrir campanha Beta' })).toHaveAttribute(
      'href',
      '/campaigns/b',
    );
    expect(screen.getByRole('link', { name: 'a' })).toHaveAttribute('href', '/campaigns/a');
  });
});
