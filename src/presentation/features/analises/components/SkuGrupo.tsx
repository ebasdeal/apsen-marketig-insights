'use client';

import type { SkuGrupoOutput } from '@application/analises/dto';
import { CheckboxCard } from '@presentation/components/ui';
import { tomDaFamilia, tomEstoque } from '../familiaTom';

interface SkuGrupoProps {
  grupo: SkuGrupoOutput;
  selecionados: readonly string[];
  onToggle: (codigo: string, marcado: boolean) => void;
}

export function SkuGrupo({ grupo, selecionados, onToggle }: SkuGrupoProps) {
  const tom = tomDaFamilia(grupo.familia);
  return (
    <div role="group" aria-label={grupo.familia} className="mb-[14px]">
      <div
        className={`mb-[8px] border-b-2 pt-[6px] pb-[8px] text-[10.5px] font-bold uppercase tracking-[.07em] ${tom.texto} ${tom.borda}`}
      >
        {`${grupo.familia} (${grupo.skus.length} SKUs)`}
      </div>
      {grupo.skus.map((sku) => (
        <CheckboxCard
          key={sku.codigo}
          checked={selecionados.includes(sku.codigo)}
          onChange={(marcado) => onToggle(sku.codigo, marcado)}
          title={sku.nome}
          subtitle={sku.codigo}
          aside={
            sku.nivelEstoque === null ? undefined : (
              <span
                className={`whitespace-nowrap text-[11px] font-semibold ${tomEstoque(sku.nivelEstoque)}`}
              >
                {`${sku.dias}d estoque`}
              </span>
            )
          }
        />
      ))}
    </div>
  );
}
