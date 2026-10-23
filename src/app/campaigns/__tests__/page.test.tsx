import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import CampaignsPage, { metadata } from '../page';

describe('app/campaigns/page', () => {
  it('renderiza a tela de campanhas', async () => {
    renderWithProviders(<CampaignsPage />, createFakeUseCases());
    expect(screen.getByRole('heading', { level: 1, name: 'Campanhas' })).toBeInTheDocument();
    expect(await screen.findByText('Nenhuma campanha cadastrada.')).toBeInTheDocument();
  });

  it('define o título da página', () => {
    expect(metadata.title).toBe('Campanhas');
  });
});
