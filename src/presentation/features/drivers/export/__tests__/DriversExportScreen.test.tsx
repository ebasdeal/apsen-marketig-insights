import { makeDriversExport } from '@test/factories/drivers';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { CopyJsonButton } from '../CopyJsonButton';
import { downloadText } from '../downloadText';
import { DriversExportScreen } from '../DriversExportScreen';

describe('DriversExportScreen (CA-05, CA-06)', () => {
  it('mostra header, alerta e JSON; baixar regera e baixa', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(
        makeDriversExport({ texto: '{"schema": "drivers-demanda-farma-v2.1"}' }),
      )
      .mockResolvedValue(makeDriversExport({ texto: '{"novo": 1}' }));
    const create = vi.fn(() => 'blob:x');
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const useCases = createFakeUseCases({ drivers: { export: { execute } } });
    const { user } = renderWithProviders(<DriversExportScreen />, useCases);
    expect(screen.getByRole('heading', { name: 'Exportar JSON' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Gerando JSON…' })).toBeInTheDocument();
    expect(await screen.findByText(/drivers-demanda-farma-v2.1/)).toBeInTheDocument();
    expect(screen.getByText('Apsen PLP Agent:', { selector: 'strong' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '💾 Baixar .json' }));
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(execute).toHaveBeenCalledTimes(2);
    expect(revoke).toHaveBeenCalledWith('blob:x');
    expect(await screen.findByText('{"novo": 1}')).toBeInTheDocument();
    click.mockRestore();
  });

  it('erro com Tentar novamente', async () => {
    const execute = vi.fn().mockRejectedValue(new Error('x'));
    const useCases = createFakeUseCases({ drivers: { export: { execute } } });
    const { user } = renderWithProviders(<DriversExportScreen />, useCases);
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
  });
});

describe('CopyJsonButton (RN-06)', () => {
  afterEach(() => vi.useRealTimers());

  it('copia e mostra "✅ Copiado!" por 1600 ms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(<CopyJsonButton gerar={async () => 'texto'} />);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    vi.useFakeTimers();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '📋 Copiar JSON' }));
    });
    expect(writeText).toHaveBeenCalledWith('texto');
    expect(screen.getByRole('button', { name: '✅ Copiado!' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1600));
    expect(screen.getByRole('button', { name: '📋 Copiar JSON' })).toBeInTheDocument();
  });

  it('falha ao copiar mostra toast', async () => {
    const { user } = renderWithProviders(<CopyJsonButton gerar={async () => 'texto'} />);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('x')) },
      configurable: true,
    });
    await user.click(screen.getByRole('button', { name: '📋 Copiar JSON' }));
    expect(await screen.findByText('Não foi possível copiar o JSON.')).toBeInTheDocument();
  });
});

describe('downloadText', () => {
  it('cria Blob application/json com o nome do arquivo', () => {
    let blob: Blob | undefined;
    Object.assign(URL, {
      createObjectURL: vi.fn((value: Blob) => {
        blob = value;
        return 'blob:y';
      }),
      revokeObjectURL: vi.fn(),
    });
    let nome = '';
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      nome = this.download;
    });
    downloadText('drivers_demanda_v2_2026-10-27.json', '{}');
    expect(nome).toBe('drivers_demanda_v2_2026-10-27.json');
    expect(blob?.type).toBe('application/json');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:y');
    click.mockRestore();
  });
});
