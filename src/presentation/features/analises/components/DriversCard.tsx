'use client';

import type { DriversSugeridosOutput } from '@application/analises/dto';
import { Alert, Button, Card, CardTitle, CheckboxCard } from '@presentation/components/ui';

interface DriversCardProps {
  dados: DriversSugeridosOutput | undefined;
  carregando: boolean;
  falhou: boolean;
  desmarcados: readonly string[];
  onToggle: (id: string, marcado: boolean) => void;
  onRetry: () => void;
}

function DriversLista({
  dados,
  carregando,
  falhou,
  desmarcados,
  onToggle,
  onRetry,
}: DriversCardProps) {
  if (carregando)
    return <p className="p-[10px] text-[13px] text-apsen-muted">Carregando drivers…</p>;
  if (falhou || dados === undefined) {
    return (
      <Alert tone="error">
        Não foi possível carregar os drivers.{' '}
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      </Alert>
    );
  }
  if (dados.itens.length === 0) {
    return (
      <p className="p-[10px] text-[13px] text-apsen-muted">Nenhum driver aprovado encontrado.</p>
    );
  }
  const ocultos = dados.total - dados.itens.length;
  return (
    <>
      {dados.itens.map((driver) => (
        <CheckboxCard
          key={driver.id}
          variant="muted"
          checked={!desmarcados.includes(driver.id)}
          onChange={(marcado) => onToggle(driver.id, marcado)}
          title={
            <>
              {driver.tipo}{' '}
              <span className="text-[11.5px] font-normal text-apsen-muted">{driver.produto}</span>
            </>
          }
          subtitle={driver.params}
          aside={
            <span className="text-[11px] font-semibold text-apsen-orange">
              {`⚡ ${driver.intensidade}`}
            </span>
          }
        />
      ))}
      {ocultos > 0 ? (
        <p className="p-[6px] text-center text-[12px] text-apsen-muted">
          {`+${ocultos} drivers aprovados não exibidos`}
        </p>
      ) : null}
    </>
  );
}

export function DriversCard(props: DriversCardProps) {
  return (
    <Card as="section">
      <CardTitle
        step="03"
        stepTone="orange"
        small="Pré-selecionados pela IA · desmarque se não aplicável"
      >
        Drivers Identificados
      </CardTitle>
      <Alert tone="info" className="mb-[12px]">
        Drivers aprovados relevantes para os SKUs selecionados. Desmarque os que não devem
        influenciar esta análise.
      </Alert>
      <DriversLista {...props} />
    </Card>
  );
}
