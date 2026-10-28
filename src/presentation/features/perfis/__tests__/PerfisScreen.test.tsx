import { createFakePermissoesUseCases } from '@test/fakes/usuarios';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { PerfisScreen } from '../PerfisScreen';

function setup(execute = createFakePermissoesUseCases().list.execute) {
  return renderWithProviders(
    <PerfisScreen />,
    createFakeUseCases({ permissoes: createFakePermissoesUseCases({ list: { execute } }) }),
  );
}

describe('PerfisScreen', () => {
  it('CA-10 RN-07 grupos, cabeçalhos coloridos e células', async () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Perfis de Acesso' })).toBeInTheDocument();
    expect(await screen.findAllByRole('columnheader', { name: /Área/ })).toHaveLength(1);
    expect(screen.getByRole('columnheader', { name: '🏢 Área' })).toHaveClass('text-apsen-teal');
    expect(screen.getAllByRole('rowheader').length).toBeGreaterThan(10);
    expect(
      screen.getAllByRole('columnheader').filter((th) => th.getAttribute('scope') === 'colgroup'),
    ).toHaveLength(3);
    expect(screen.getByText('(só suas cat.)')).toHaveClass('text-[11px]');
    expect(screen.getAllByText('—')[0]).toHaveClass('text-apsen-muted-2');
  });

  it('CA-11 carregando, erro e vazio', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce({ grupos: [] });
    const { user } = setup(execute);
    expect(screen.getByRole('status', { name: 'Carregando permissões…' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Nenhuma permissão cadastrada.')).toBeInTheDocument();
  });
});
