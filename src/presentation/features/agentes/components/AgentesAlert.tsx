import type { AgentesResumoDto } from '@application/agentes/dto';
import { Alert } from '@presentation/components/ui';
import { LockIcon } from '../../usuarios/components/actionIcons';

export function AgentesAlert({ resumo }: { resumo: AgentesResumoDto }) {
  return (
    <Alert tone="info" className="mb-[16px]" icon={<LockIcon className="mt-[3px] shrink-0" />}>
      <strong>{resumo.resumoTexto}</strong>
      {resumo.proxima === null ? (
        ' — nenhuma execução agendada'
      ) : (
        <>
          {` — próxima execução: ${resumo.proxima.nome} em `}
          <strong>{resumo.proxima.hora}</strong>
        </>
      )}
    </Alert>
  );
}
