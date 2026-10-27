import type { DeleteUsuario } from './DeleteUsuario';
import type { GetUsuarioForm } from './GetUsuarioForm';
import type { ListUsuarios } from './ListUsuarios';
import type { SaveUsuario } from './SaveUsuario';
import type { ToggleUsuarioAtivo } from './ToggleUsuarioAtivo';

export interface UsuariosUseCases {
  list: Pick<ListUsuarios, 'execute'>;
  getForm: Pick<GetUsuarioForm, 'execute'>;
  save: Pick<SaveUsuario, 'execute'>;
  toggle: Pick<ToggleUsuarioAtivo, 'execute'>;
  remove: Pick<DeleteUsuario, 'execute'>;
}
