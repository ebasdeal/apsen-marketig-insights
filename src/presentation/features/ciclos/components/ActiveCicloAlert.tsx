import type { CicloAtivoDto } from '@application/ciclos/dto';
import { Alert } from '@presentation/components/ui';

export function ActiveCicloAlert({ ativo }: { ativo: CicloAtivoDto | null }) {
  return (
    <Alert tone="info" className="mb-[16px]!">
      {ativo === null ? (
        'Nenhum ciclo ativo — ative um ciclo para vincular os drivers registrados nesta sessão.'
      ) : (
        <>
          Ciclo ativo:{' '}
          <strong>
            {ativo.codigo} · {ativo.mesAno}
          </strong>{' '}
          — drivers registrados nesta sessão serão vinculados a este ciclo.
        </>
      )}
    </Alert>
  );
}
