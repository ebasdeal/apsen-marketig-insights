import { useUseCases, type UseCases } from '@presentation/providers/UseCasesContext';
import { createFakeUseCases } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import { AppRoot } from '../AppRoot';
import type { Container } from '../container';

function UseCasesProbe({ onUseCases }: { onUseCases: (value: UseCases) => void }) {
  onUseCases(useUseCases());
  return <p>raiz pronta</p>;
}

describe('AppRoot', () => {
  it('usa o container injetado', () => {
    const container: Container = { dataSource: 'mock', useCases: createFakeUseCases() };
    const onUseCases = vi.fn();
    render(
      <AppRoot container={container}>
        <UseCasesProbe onUseCases={onUseCases} />
      </AppRoot>,
    );
    expect(screen.getByText('raiz pronta')).toBeInTheDocument();
    expect(onUseCases).toHaveBeenCalledWith(container.useCases);
  });

  it('cria o container a partir do ambiente quando não injetado', () => {
    const onUseCases = vi.fn();
    render(
      <AppRoot>
        <UseCasesProbe onUseCases={onUseCases} />
      </AppRoot>,
    );
    expect(screen.getByText('raiz pronta')).toBeInTheDocument();
    expect(onUseCases.mock.calls[0]?.[0]).toMatchObject({
      listCampaigns: expect.any(Object),
      getCampaignDetails: expect.any(Object),
      getDashboardSummary: expect.any(Object),
    });
  });
});
