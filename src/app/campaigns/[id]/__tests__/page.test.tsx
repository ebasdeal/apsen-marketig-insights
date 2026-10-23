import { buildDetails } from '@test/factories';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import Page, { metadata } from '../page';

describe('app/campaigns/[id]/page', () => {
  it('define o título da página', () => {
    expect(metadata.title).toBe('Detalhe da campanha');
  });

  it('renderiza o detalhe da campanha com o id da rota', async () => {
    const execute = vi.fn().mockResolvedValue(buildDetails({ name: 'Campanha Rota' }));
    const element = await Page({ params: Promise.resolve({ id: 'cmp-9' }) });
    renderWithProviders(element, createFakeUseCases({ getCampaignDetails: { execute } }));
    expect(await screen.findByRole('heading', { name: 'Campanha Rota' })).toBeInTheDocument();
    expect(execute).toHaveBeenCalledWith('cmp-9');
  });
});
