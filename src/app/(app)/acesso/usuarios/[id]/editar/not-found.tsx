import { RecursoNaoEncontrado } from '@presentation/features/usuarios/RecursoNaoEncontrado';
import { USUARIOS_ROUTE } from '@presentation/navigation/routes';

export default function UsuarioNotFound() {
  return (
    <RecursoNaoEncontrado
      title="Usuário não encontrado"
      message="O usuário não existe ou foi removido."
      backHref={USUARIOS_ROUTE}
    />
  );
}
