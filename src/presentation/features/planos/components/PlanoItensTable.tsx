'use client';

import type { PlanoItemRowOutput } from '@application/planos/dto';
import type { PlanoOrdem, PlanoOrdemCampo } from '@domain/planos/PlanoItem';
import { useState } from 'react';
import { STACK_BODY, STACK_HEAD, STACK_TABLE, STACK_WRAP } from '@presentation/components/ui';
import { PlanoItemRow } from './PlanoItemRow';

interface PlanoItensTableProps {
  itens: readonly PlanoItemRowOutput[];
  ordem: PlanoOrdem;
  podeEditar: boolean;
  onOrdenar: (campo: PlanoOrdemCampo) => void;
  onExcluir: (item: PlanoItemRowOutput) => void;
}

const TH =
  'whitespace-nowrap px-[14px] py-[10px] text-left text-[11.5px] font-semibold tracking-[.02em] text-apsen-muted';
const SORT = 'cursor-pointer border-0 bg-transparent p-0 font-semibold focus-ring';
const HEADERS = ['Produto / Apresentação', 'Família'];
const TRAILING = ['Linha', 'Semana Prod.', 'Status', 'Ações'];

function ariaSort(ordem: PlanoOrdem, campo: PlanoOrdemCampo) {
  if (ordem?.campo !== campo) return 'none';
  return ordem.direcao === 'asc' ? 'ascending' : 'descending';
}

export function PlanoItensTable({
  itens,
  ordem,
  podeEditar,
  onOrdenar,
  onExcluir,
}: PlanoItensTableProps) {
  const [selecionados, setSelecionados] = useState<ReadonlySet<string>>(new Set());
  const todos = itens.length > 0 && itens.every((item) => selecionados.has(item.id));

  const alternar = (id: string) =>
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });

  return (
    <div
      className={`relative overflow-x-auto rounded-apsen-lg border border-apsen-border bg-apsen-white shadow-apsen-sm ${STACK_WRAP}`}
    >
      <table className={`w-full min-w-[560px] border-collapse ${STACK_TABLE}`}>
        <caption className="sr-only">Itens do plano de produção</caption>
        <thead className={STACK_HEAD}>
          <tr className="border-b border-apsen-border bg-apsen-bg">
            <th scope="col" className={`${TH} w-[32px]`}>
              <input
                type="checkbox"
                aria-label="Selecionar itens da página"
                className="accent-apsen-blue"
                checked={todos}
                onChange={() =>
                  setSelecionados(todos ? new Set() : new Set(itens.map((item) => item.id)))
                }
              />
            </th>
            <th scope="col" aria-sort={ariaSort(ordem, 'codigo')} className={TH}>
              <button
                type="button"
                className={`${SORT} text-apsen-blue`}
                onClick={() => onOrdenar('codigo')}
              >
                Código
              </button>
            </th>
            {HEADERS.map((header) => (
              <th key={header} scope="col" className={TH}>
                {header}
              </th>
            ))}
            <th scope="col" aria-sort={ariaSort(ordem, 'qtd')} className={TH}>
              <button
                type="button"
                className={`${SORT} text-apsen-muted`}
                onClick={() => onOrdenar('qtd')}
              >
                Qtd. Planejada
              </button>
            </th>
            {TRAILING.map((header) => (
              <th key={header} scope="col" className={TH}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={STACK_BODY}>
          {itens.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-[30px] text-center text-[13px] text-apsen-muted">
                Nenhum item encontrado com os filtros atuais.
              </td>
            </tr>
          ) : (
            itens.map((item) => (
              <PlanoItemRow
                key={item.id}
                item={item}
                selecionado={selecionados.has(item.id)}
                podeEditar={podeEditar}
                onSelecionar={() => alternar(item.id)}
                onExcluir={() => onExcluir(item)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
