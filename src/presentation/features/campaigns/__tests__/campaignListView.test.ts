import { buildListItem } from '@test/factories';
import {
  CAMPAIGNS_PER_PAGE,
  buildCampaignListView,
  campaignCountNoun,
  filterCampaignsByName,
  normalizeSearchText,
} from '../campaignListView';

const many = Array.from({ length: 19 }, (_, index) =>
  buildListItem({ id: `c-${index + 1}`, name: `Campanha ${index + 1}` }),
);

describe('campaignListView', () => {
  it('normaliza texto sem acento, caixa ou espaços nas pontas', () => {
    expect(normalizeSearchText('  Promoção ÉPICA ')).toBe('promocao epica');
  });

  it('filtra pelo nome ignorando caixa e acento', () => {
    const campaigns = [
      buildListItem({ id: 'a', name: 'Promoção de Inverno' }),
      buildListItem({ id: 'b', name: 'Black Friday' }),
    ];
    expect(filterCampaignsByName(campaigns, 'PROMOCAO').map((item) => item.id)).toEqual(['a']);
    expect(filterCampaignsByName(campaigns, 'invérno').map((item) => item.id)).toEqual(['a']);
    expect(filterCampaignsByName(campaigns, '   ')).toBe(campaigns);
    expect(filterCampaignsByName(campaigns, 'b')).toHaveLength(1);
    expect(filterCampaignsByName(campaigns, 'zzz')).toEqual([]);
  });

  it('pagina com 8 itens por página e monta o rótulo', () => {
    expect(CAMPAIGNS_PER_PAGE).toBe(8);
    const first = buildCampaignListView(many, '', 1);
    expect(first).toMatchObject({ total: 19, page: 1, totalPages: 3 });
    expect(first.rows).toHaveLength(8);
    expect(first.rangeLabel).toBe('Mostrando 1–8 de 19');

    const last = buildCampaignListView(many, '', 3);
    expect(last.rows.map((item) => item.id)).toEqual(['c-17', 'c-18', 'c-19']);
    expect(last.rangeLabel).toBe('Mostrando 17–19 de 19');
  });

  it('limita a página quando a busca reduz o total', () => {
    const view = buildCampaignListView(many, 'campanha 1', 3);
    expect(view).toMatchObject({ total: 11, page: 2, totalPages: 2 });
    expect(view.rows).toHaveLength(3);
  });

  it('retorna página única vazia sem resultados', () => {
    expect(buildCampaignListView([], '', 1)).toEqual({
      rows: [],
      total: 0,
      page: 1,
      totalPages: 1,
      rangeLabel: 'Mostrando 0–0 de 0',
    });
  });

  it('flexiona o substantivo do contador', () => {
    expect(campaignCountNoun(0)).toBe('campanhas');
    expect(campaignCountNoun(1)).toBe('campanha');
    expect(campaignCountNoun(2)).toBe('campanhas');
  });
});
