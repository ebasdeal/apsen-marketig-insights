import { camposToRows } from '@domain/tipos/tipoRules';
import type { ParamRow } from '@domain/tipos/Tipo';
import { draftNovo } from '@domain/tipos/vocabulario';
import { FONTE_OPTIONS_FIXTURE } from '@test/fixtures/fontes';
import { camposFixture } from '@test/fixtures/tipos';
import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { useReducer } from 'react';
import { TipoParamsCard } from '../components/TipoParamsCard';
import { draftSujo, nextRowKey, tipoFormReducer } from '../components/tipoFormReducer';

function Harness({ rows, errors = {} }: { rows: ParamRow[]; errors?: Record<string, string> }) {
  const [draft, dispatch] = useReducer(tipoFormReducer, { ...draftNovo(), rows });
  return (
    <TipoParamsCard
      rows={draft.rows}
      errors={errors}
      fontes={FONTE_OPTIONS_FIXTURE}
      dispatch={dispatch}
    />
  );
}

describe('EditableParamsTable — CA-08', () => {
  it('linha exemplo, adicionar, trocar tipo/origem e remover', async () => {
    const { user } = renderWithProviders(<Harness rows={draftNovo().rows} />);
    expect(screen.getByRole('textbox', { name: 'Nome do campo 1' })).toHaveAttribute(
      'placeholder',
      'ex: tipo_epi',
    );
    expect(screen.getByRole('checkbox', { name: 'Campo 1 obrigatório' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: '+ Adicionar campo' }));
    expect(screen.getByRole('textbox', { name: 'Nome do campo 2' })).toHaveAttribute(
      'placeholder',
      'nome_campo',
    );
    expect(screen.getByRole('combobox', { name: 'Tipo do campo 2' })).toHaveValue('text');
    expect(screen.queryByRole('combobox', { name: 'Origem das opções do campo 2' })).toBeNull();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Tipo do campo 2' }), 'select');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Origem das opções do campo 2' }),
      'api',
    );
    const fonte = screen.getByRole('combobox', { name: 'Fonte de dados do campo 2' });
    expect(fonte).toHaveDisplayValue('— Selecione a fonte —');
    expect(
      screen.getByRole('option', { name: '🏁 Concorrentes / Marcas (mock)' }),
    ).toBeInTheDocument();
    await user.selectOptions(fonte, 'moleculas');
    expect(fonte).toHaveValue('moleculas');
    await user.click(screen.getByRole('checkbox', { name: 'Campo 2 obrigatório' }));
    expect(screen.getByRole('checkbox', { name: 'Campo 2 obrigatório' })).toBeChecked();
    await user.type(screen.getByRole('textbox', { name: 'Label do campo 2' }), 'Fonte');
    await user.type(screen.getByRole('textbox', { name: 'Opções do campo 1' }), '|Outra');
    expect(screen.getByRole('textbox', { name: 'Opções do campo 1' })).toHaveValue(
      'Epidemia|Alta sazonal|Pandemia|Outra',
    );
    await user.click(screen.getByRole('button', { name: 'Remover campo 1' }));
    expect(screen.getByRole('textbox', { name: 'Label do campo 1' })).toHaveValue('Fonte');
  });

  it('autocomplete só aparece em campo original autocomplete; erro de fonte marca o select', () => {
    const autocomplete = camposToRows(
      camposFixture('concorrente').campos.filter((campo) => campo.type === 'autocomplete'),
    );
    const api: ParamRow = { ...draftNovo().rows[0]!, key: 'row-9', origem: 'api', fonte: '' };
    renderWithProviders(
      <Harness
        rows={[...autocomplete.slice(0, 1), api]}
        errors={{ 'row-9': '⚠️ Campo 2: selecione a fonte de dados.' }}
      />,
    );
    expect(screen.getByRole('option', { name: 'autocomplete' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Fonte de dados do campo 2' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('selecione a fonte de dados');
  });

  it('erro de opções marca o input de opções', () => {
    renderWithProviders(
      <Harness
        rows={draftNovo().rows}
        errors={{ 'row-1': '⚠️ Campo 1: informe as opções separadas por |.' }}
      />,
    );
    expect(screen.getByRole('textbox', { name: 'Opções do campo 1' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByRole('textbox', { name: 'Nome do campo 1' })).not.toHaveAttribute(
      'aria-invalid',
    );
  });
});

describe('tipoFormReducer', () => {
  it('gera chaves sem colisão e detecta rascunho sujo', () => {
    expect(nextRowKey([])).toBe('row-1');
    expect(
      nextRowKey([
        { ...draftNovo().rows[0]!, key: 'row-7' },
        { ...draftNovo().rows[0]!, key: 'x' },
      ]),
    ).toBe('row-8');
    const inicial = draftNovo();
    const editado = tipoFormReducer(inicial, { type: 'set', field: 'label', value: 'X' });
    expect(draftSujo(editado, inicial)).toBe(true);
    expect(draftSujo(inicial, draftNovo())).toBe(false);
  });
});
