import { DeleteUsuario } from '@application/usuarios/DeleteUsuario';
import { GetUsuarioForm } from '@application/usuarios/GetUsuarioForm';
import { ListUsuarios } from '@application/usuarios/ListUsuarios';
import { SaveUsuario } from '@application/usuarios/SaveUsuario';
import { ToggleUsuarioAtivo } from '@application/usuarios/ToggleUsuarioAtivo';
import type { UsuariosUseCases } from '@application/usuarios/usuariosUseCases';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { HttpPerfilRepository } from '@infrastructure/perfis/HttpPerfilRepository';
import { HttpUsuarioRepository } from '@infrastructure/usuarios/HttpUsuarioRepository';

export function createUsuariosModule(
  http: HttpClient,
  newId: () => string = () => crypto.randomUUID(),
): UsuariosUseCases {
  const repository = new HttpUsuarioRepository(http);
  return {
    list: new ListUsuarios(repository),
    getForm: new GetUsuarioForm(repository),
    save: new SaveUsuario(repository, new HttpPerfilRepository(http), newId),
    toggle: new ToggleUsuarioAtivo(repository),
    remove: new DeleteUsuario(repository),
  };
}
