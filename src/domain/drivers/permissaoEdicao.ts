import type { PerfilId } from '../perfis/Perfil';

// PRG-DRV-23: a Área edita os drivers da sua área; Planejador e Admin editam qualquer um.
export function podeEditarDriver(
  perfil: PerfilId,
  areaDoUsuario: string,
  donoDoTipo: string | undefined,
): boolean {
  if (perfil !== 'area') {
    return true;
  }
  return (
    donoDoTipo !== undefined &&
    donoDoTipo.trim().toLowerCase() === areaDoUsuario.trim().toLowerCase()
  );
}
