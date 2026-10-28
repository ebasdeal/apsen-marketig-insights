'use client';

import { Alert, Button, Card, CardTitle } from '@presentation/components/ui';
import type { Ref } from 'react';
import { useSkusDoCiclo } from '../../../hooks/analises/useAnalises';
import { SkuGrupo } from './SkuGrupo';

const AVISO = 'rounded-apsen bg-apsen-bg p-[18px] text-center text-[13px] text-apsen-muted';

interface SkusCardProps {
  ciclo: string;
  selecionados: readonly string[];
  erro: string | undefined;
  listaRef: Ref<HTMLDivElement>;
  onToggle: (codigo: string, marcado: boolean) => void;
  onSelecionar: (codigos: string[]) => void;
}

function SkusCorpo({
  ciclo,
  selecionados,
  onToggle,
}: Omit<SkusCardProps, 'erro' | 'listaRef' | 'onSelecionar'>) {
  const query = useSkusDoCiclo(ciclo);
  if (ciclo === '') return <div className={AVISO}>Selecione um ciclo para carregar os SKUs.</div>;
  if (query.isPending) return <div className={AVISO}>Carregando SKUs…</div>;
  if (query.isError) {
    return (
      <Alert tone="error">
        Não foi possível carregar os SKUs.{' '}
        <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
          Tentar novamente
        </Button>
      </Alert>
    );
  }
  if (query.data.length === 0) {
    return <div className="p-[16px] text-center text-apsen-muted">Nenhum SKU para este ciclo.</div>;
  }
  return query.data.map((grupo) => (
    <SkuGrupo key={grupo.familia} grupo={grupo} selecionados={selecionados} onToggle={onToggle} />
  ));
}

export function SkusCard({
  ciclo,
  selecionados,
  erro,
  listaRef,
  onToggle,
  onSelecionar,
}: SkusCardProps) {
  const query = useSkusDoCiclo(ciclo);
  const todos = (query.data ?? []).flatMap((grupo) => grupo.skus.map((sku) => sku.codigo));
  return (
    <Card as="section">
      <CardTitle step="02" stepTone="orange">
        SKUs a Analisar
      </CardTitle>
      <div className="mb-[12px] flex gap-[8px]">
        <Button variant="ghost" size="sm" dashed onClick={() => onSelecionar(todos)}>
          ✓ Selecionar todos
        </Button>
        <Button variant="ghost" size="sm" dashed onClick={() => onSelecionar([])}>
          ✗ Limpar
        </Button>
      </div>
      {erro === undefined ? null : (
        <p role="alert" className="mb-[10px] text-[11px] text-apsen-red">
          {erro}
        </p>
      )}
      <div ref={listaRef}>
        <SkusCorpo ciclo={ciclo} selecionados={selecionados} onToggle={onToggle} />
      </div>
    </Card>
  );
}
