import { useCampaignFiltersStore } from '@presentation/stores/campaignFiltersStore';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignFilters } from '../CampaignFilters';

describe('CampaignFilters', () => {
  it('renderiza busca e selects de canal, status e período na ordem do protótipo', () => {
    render(<CampaignFilters />);
    const toolbar = screen.getByRole('search', { name: 'Filtros' });
    expect(toolbar).toHaveClass('flex', 'gap-[10px]', 'mb-[12px]', 'flex-wrap', 'items-center');
    const search = screen.getByRole('textbox', { name: 'Buscar campanha' });
    expect(search).toHaveAttribute('placeholder', 'Buscar campanha pelo nome...');
    expect(search.parentElement).toHaveClass('min-w-[220px]', 'flex-1');
    const selects = screen.getAllByRole('combobox');
    expect(selects.map((select) => select.getAttribute('aria-label'))).toEqual([
      'Canal',
      'Status',
      'Período',
    ]);
    expect(screen.getByRole('combobox', { name: 'Canal' })).toHaveClass('w-[180px]');
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveClass('w-[170px]');
    expect(screen.getByRole('combobox', { name: 'Período' })).toHaveClass('w-[170px]');
    expect(screen.getByRole('combobox', { name: 'Canal' })).toHaveDisplayValue('Todos os canais');
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveDisplayValue('Todos os status');
    expect(screen.getByRole('combobox', { name: 'Período' })).toHaveDisplayValue('Todo o período');
  });

  it('atualiza a store ao buscar e selecionar e volta para a página 1', async () => {
    useCampaignFiltersStore.setState({ page: 3 });
    const user = userEvent.setup();
    render(<CampaignFilters />);

    await user.type(screen.getByRole('textbox', { name: 'Buscar campanha' }), 'Black');
    expect(useCampaignFiltersStore.getState()).toMatchObject({ search: 'Black', page: 1 });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Canal' }), 'Meta Ads');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), '● Pausada');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Período' }), 'Ano atual');

    expect(useCampaignFiltersStore.getState()).toMatchObject({
      channel: 'meta',
      status: 'pausada',
      period: 'ytd',
    });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Canal' }), 'Todos os canais');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'Todos os status');
    expect(useCampaignFiltersStore.getState()).toMatchObject({ channel: null, status: null });
  });
});
