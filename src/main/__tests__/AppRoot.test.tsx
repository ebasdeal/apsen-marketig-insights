import { useToast } from '@presentation/providers/ToastProvider';
import { useUseCases, type UseCases } from '@presentation/providers/UseCasesContext';
import { createFakeUseCases } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import { AppRoot } from '../AppRoot';
import type { Container } from '../container';

interface Seen {
  useCases: UseCases;
  show: (message: string) => void;
}

function Probe({ onSeen }: { onSeen: (value: Seen) => void }) {
  const useCases = useUseCases();
  const { show } = useToast();
  onSeen({ useCases, show });
  return <p>raiz pronta</p>;
}

describe('AppRoot', () => {
  it('usa o container injetado e expõe o toast', () => {
    const container: Container = { useCases: createFakeUseCases() };
    const onSeen = vi.fn();
    render(
      <AppRoot container={container}>
        <Probe onSeen={onSeen} />
      </AppRoot>,
    );
    expect(screen.getByText('raiz pronta')).toBeInTheDocument();
    expect(onSeen.mock.calls[0]?.[0]).toMatchObject({
      useCases: container.useCases,
      show: expect.any(Function),
    });
  });

  it('cria o container a partir do ambiente quando não injetado', () => {
    const onSeen = vi.fn();
    render(
      <AppRoot>
        <Probe onSeen={onSeen} />
      </AppRoot>,
    );
    expect(onSeen.mock.calls[0]?.[0]).toMatchObject({
      useCases: {
        auth: expect.objectContaining({ concluirLogin: expect.any(Object) }),
        perfis: { list: expect.any(Object) },
        navegacao: { badges: expect.any(Object) },
      },
    });
  });
});
