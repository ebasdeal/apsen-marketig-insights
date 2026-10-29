import { RecursoNaoEncontrado } from '@presentation/features/usuarios/RecursoNaoEncontrado';
import { AGENTES_ROUTE } from '@presentation/navigation/routes';

export default function AgenteNotFound() {
  return (
    <RecursoNaoEncontrado
      title="Agente não encontrado"
      message="O agente não existe ou foi removido."
      backHref={AGENTES_ROUTE}
    />
  );
}
