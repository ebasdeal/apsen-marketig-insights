import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Autocomplete } from '../Autocomplete';
import type { AutocompleteItem } from '../useAutocomplete';

const SOURCE = 'API de Concorrentes (mock)';
const ITEMS: readonly AutocompleteItem[] = [{ value: 'EMS' }, { value: 'Eurofarma', tag: 'Grupo' }];

function Harness({
  search,
  disabledMessage,
  allowFreeText,
  onValue = vi.fn(),
}: {
  search: (term: string) => Promise<readonly AutocompleteItem[]>;
  disabledMessage?: string;
  allowFreeText?: boolean;
  onValue?: (value: string) => void;
}) {
  const [value, setValue] = useState('');
  return (
    <div>
      <Autocomplete
        aria-label="Laboratório concorrente"
        value={value}
        onChange={(next) => {
          setValue(next);
          onValue(next);
        }}
        search={search}
        sourceLabel={SOURCE}
        itemTag="Laboratório"
        loadingText="Consultando base de concorrentes..."
        placeholder="Digite para buscar"
        {...(disabledMessage === undefined ? {} : { disabledMessage })}
        {...(allowFreeText === undefined ? {} : { allowFreeText })}
      />
      <button type="button">fora</button>
    </div>
  );
}

async function flush(ms = 300) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

describe('Autocomplete', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('abre no foco, consulta após 300 ms e lista com etiqueta e fonte', async () => {
    const search = vi.fn().mockResolvedValue(ITEMS);
    render(<Harness search={search} />);
    const input = screen.getByRole('combobox', { name: 'Laboratório concorrente' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('autocomplete', 'off');
    fireEvent.focus(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(screen.getByText('⟳ Consultando base de concorrentes...')).toBeInTheDocument();
    await flush(299);
    expect(search).not.toHaveBeenCalled();
    await flush(1);
    expect(search).toHaveBeenCalledWith('');
    const listbox = screen.getByRole('listbox', { name: 'Laboratório concorrente' });
    expect(input).toHaveAttribute('aria-controls', listbox.id);
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getAllByText('Laboratório')[0]).toHaveClass('ml-auto', 'text-[10px]');
    expect(screen.getByText('Grupo')).toBeInTheDocument();
    expect(screen.getByText(`2 resultado(s) · Fonte: ${SOURCE}`)).toHaveClass('text-[10.5px]');
  });

  it('navega por setas, escolhe com Enter e fecha', async () => {
    const onValue = vi.fn();
    render(<Harness search={vi.fn().mockResolvedValue(ITEMS)} onValue={onValue} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await flush();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const first = screen.getByRole('option', { name: /EMS/ });
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', first.id);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(first).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onValue).toHaveBeenLastCalledWith('Eurofarma');
    expect(input).toHaveValue('Eurofarma');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('seta para cima sem destaque vai ao último e clique escolhe', async () => {
    const onValue = vi.fn();
    render(<Harness search={vi.fn().mockResolvedValue(ITEMS)} onValue={onValue} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await flush();
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByRole('option', { name: /Eurofarma/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.focus(input);
    await flush();
    fireEvent.mouseDown(screen.getByRole('option', { name: /EMS/ }));
    fireEvent.click(screen.getByRole('option', { name: /EMS/ }));
    expect(onValue).toHaveBeenLastCalledWith('EMS');
  });

  it('mostra vazio com a fonte e aceita texto livre', async () => {
    const search = vi.fn().mockResolvedValue([]);
    const onValue = vi.fn();
    render(<Harness search={search} onValue={onValue} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: ' Novo Lab ' } });
    await flush();
    expect(search).toHaveBeenLastCalledWith('Novo Lab');
    expect(
      screen.getByText('Nenhum resultado. Você pode digitar um valor novo.'),
    ).toBeInTheDocument();
    expect(screen.getByText(`Fonte: ${SOURCE}`)).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onValue).toHaveBeenLastCalledWith(' Novo Lab ');
  });

  it('com bloqueio mostra só a mensagem e não consulta', async () => {
    const search = vi.fn().mockResolvedValue(ITEMS);
    render(<Harness search={search} disabledMessage="⚠️ Selecione primeiro o laboratório." />);
    fireEvent.focus(screen.getByRole('combobox'));
    await flush();
    expect(screen.getByText('⚠️ Selecione primeiro o laboratório.')).toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();
    expect(screen.queryByText(/Consultando/)).toBeNull();
  });

  it('fecha no clique fora e limpa texto livre quando não permitido', async () => {
    const onValue = vi.fn();
    render(
      <Harness search={vi.fn().mockResolvedValue(ITEMS)} allowFreeText={false} onValue={onValue} />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'xyz' } });
    await flush();
    fireEvent.mouseDown(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'fora' }));
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onValue).toHaveBeenLastCalledWith('');
  });

  it('descarta resposta antiga e trata falha como vazio', async () => {
    let resolveOld: (items: readonly AutocompleteItem[]) => void = () => undefined;
    const search = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<readonly AutocompleteItem[]>((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValueOnce([{ value: 'Novo' }])
      .mockRejectedValueOnce(new Error('falha'));
    render(<Harness search={search} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });
    await flush();
    fireEvent.change(input, { target: { value: 'ab' } });
    await flush();
    await act(async () => {
      resolveOld([{ value: 'Antigo' }]);
    });
    expect(screen.getByRole('option', { name: /Novo/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Antigo/ })).toBeNull();
    fireEvent.change(input, { target: { value: 'abc' } });
    await flush();
    expect(
      screen.getByText('Nenhum resultado. Você pode digitar um valor novo.'),
    ).toBeInTheDocument();
  });
});
