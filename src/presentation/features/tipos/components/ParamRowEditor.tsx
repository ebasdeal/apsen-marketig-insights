'use client';

import type { ParamOrigem, ParamRow, ParamTipo } from '@domain/tipos/Tipo';
import { EXEMPLO_ROW, PARAM_ORIGENS, PARAM_TIPOS } from '@domain/tipos/vocabulario';
import {
  FormSelect,
  STACK_ROW,
  StackedCell,
  TextInput,
  type SelectOption,
} from '@presentation/components/ui';
import { FieldControlContext } from '@presentation/components/ui/FormField';
import type { ReactNode } from 'react';
import type { TipoFormAction } from './tipoFormReducer';

interface ParamRowEditorProps {
  row: ParamRow;
  numero: number;
  erro: string | undefined;
  fontes: readonly SelectOption<string>[];
  dispatch: (action: TipoFormAction) => void;
}

type ErroAlvo = 'nome' | 'opcoes' | 'fonte';

const TD = 'border-b border-apsen-inline-border px-[11px] py-[8px] align-middle';

function alvoDoErro(erro: string | undefined): ErroAlvo | null {
  if (erro === undefined) return null;
  if (erro.includes('fonte de dados')) return 'fonte';
  if (erro.includes('opções')) return 'opcoes';
  return 'nome';
}

function tiposDaLinha(row: ParamRow): SelectOption<ParamTipo>[] {
  const tipos: ParamTipo[] =
    row.original?.type === 'autocomplete' ? [...PARAM_TIPOS, 'autocomplete'] : [...PARAM_TIPOS];
  return tipos.map((tipo) => ({ value: tipo, label: tipo }));
}

function Invalido({ ativo, children }: { ativo: boolean; children: ReactNode }) {
  if (!ativo) return children;
  return (
    <FieldControlContext value={{ id: '', describedBy: undefined, invalid: true, required: false }}>
      {children}
    </FieldControlContext>
  );
}

export function ParamRowEditor({ row, numero, erro, fontes, dispatch }: ParamRowEditorProps) {
  const exemplo = row.key === EXEMPLO_ROW.key && row.original === undefined;
  const alvo = alvoDoErro(erro);
  const update = (patch: Partial<Omit<ParamRow, 'key' | 'original'>>) =>
    dispatch({ type: 'updateRow', key: row.key, patch });
  return (
    <tr className={`[&:last-child>td]:border-b-0 ${STACK_ROW}`}>
      <StackedCell kind="form" label="Nome (slug)" className={TD}>
        <TextInput
          value={row.nome}
          onChange={(nome) => update({ nome })}
          placeholder={exemplo ? 'ex: tipo_epi' : 'nome_campo'}
          aria-label={`Nome do campo ${numero}`}
          aria-invalid={alvo === 'nome' ? true : undefined}
          className="font-mono text-[11.5px]!"
        />
        {erro === undefined ? null : (
          <span role="alert" className="mt-[2px] block text-[11px] text-apsen-red">
            {erro}
          </span>
        )}
      </StackedCell>
      <StackedCell kind="form" label="Label exibido" className={TD}>
        <TextInput
          value={row.label}
          onChange={(label) => update({ label })}
          placeholder={exemplo ? 'Tipo epidemiológico' : 'Label do campo'}
          aria-label={`Label do campo ${numero}`}
          className="text-[12px]!"
        />
      </StackedCell>
      <StackedCell kind="form" label="Tipo" className={TD}>
        <FormSelect<ParamTipo>
          value={row.tipo}
          onChange={(tipo) => {
            if (tipo !== '') update({ tipo });
          }}
          options={tiposDaLinha(row)}
          aria-label={`Tipo do campo ${numero}`}
          className="w-full text-[12px]!"
        />
      </StackedCell>
      <StackedCell kind="form" label="Obrigatório" className={`${TD} text-center`}>
        <input
          type="checkbox"
          checked={row.obrigatorio}
          onChange={(event) => update({ obrigatorio: event.target.checked })}
          aria-label={`Campo ${numero} obrigatório`}
          className="accent-apsen-blue"
        />
      </StackedCell>
      <StackedCell kind="form" label="Opções (select)" className={TD}>
        {row.tipo === 'select' ? (
          <div className="flex flex-col gap-[4px]">
            <FormSelect<ParamOrigem>
              value={row.origem}
              onChange={(origem) => {
                if (origem !== '') update({ origem });
              }}
              options={PARAM_ORIGENS}
              aria-label={`Origem das opções do campo ${numero}`}
              className="w-full px-[6px]! py-[4px]! text-[10.5px]!"
            />
            {row.origem === 'fixas' ? (
              <TextInput
                value={row.opcoes}
                onChange={(opcoes) => update({ opcoes })}
                placeholder="Opção 1|Opção 2|..."
                aria-label={`Opções do campo ${numero}`}
                aria-invalid={alvo === 'opcoes' ? true : undefined}
                className="text-[11px]!"
              />
            ) : (
              <Invalido ativo={alvo === 'fonte'}>
                <FormSelect
                  value={row.fonte}
                  onChange={(fonte) => update({ fonte })}
                  placeholder="— Selecione a fonte —"
                  options={fontes}
                  aria-label={`Fonte de dados do campo ${numero}`}
                  className="w-full text-[11px]!"
                />
              </Invalido>
            )}
          </div>
        ) : null}
      </StackedCell>
      <StackedCell kind="actions" className={TD}>
        <button
          type="button"
          aria-label={`Remover campo ${numero}`}
          onClick={() => dispatch({ type: 'removeRow', key: row.key })}
          className="cursor-pointer rounded-[3px] border-0 bg-transparent px-[5px] py-[1px] text-[15px] max-md:min-h-[44px] max-md:min-w-[44px] leading-none text-apsen-muted-2 transition-colors hover:text-apsen-red focus-ring"
        >
          ×
        </button>
      </StackedCell>
    </tr>
  );
}
