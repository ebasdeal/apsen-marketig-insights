import type { PerfilRepository } from '@domain/perfis/PerfilRepository';
import { InvalidValueError } from '@domain/shared/DomainError';
import { UsuarioValidationError } from '@domain/usuarios/errors';
import type { PerfilId, UsuarioDraft, UsuarioPatch } from '@domain/usuarios/Usuario';
import type { UsuarioRepository } from '@domain/usuarios/UsuarioRepository';
import {
  capacidades,
  categoriasDoPerfil,
  emailValido,
  normalizarEmail,
  validateUsuarioDraft,
} from '@domain/usuarios/usuarioRules';
import { USUARIO_SALVO_TOAST, type SaveUsuarioInput, type UsuarioToastDto } from './dto';

export const USUARIO_ULTIMO_ACESSO_NOVO = '—';

export class SaveUsuario {
  constructor(
    private readonly repository: UsuarioRepository,
    private readonly perfis: PerfilRepository,
    private readonly newId: () => string,
    private readonly now: () => Date,
  ) {}

  async execute({ id, draft, alteradoPor }: SaveUsuarioInput): Promise<UsuarioToastDto> {
    const email = normalizarEmail(draft.email);
    const emailEmUso = emailValido(email) && (await this.emailEmUso(email, id));
    const erros = validateUsuarioDraft(draft, { emailEmUso });
    if (Object.keys(erros).length > 0) {
      throw new UsuarioValidationError(erros);
    }
    const campos = {
      ...(await this.campos(draft, email, draft.perfil as PerfilId)),
      alteradoPor,
      alteradoEm: this.now().toISOString(),
    };
    if (id === undefined) {
      await this.repository.create({
        id: this.newId(),
        ...campos,
        ultimoAcesso: USUARIO_ULTIMO_ACESSO_NOVO,
        removivel: true,
      });
    } else {
      await this.repository.update(id, campos);
    }
    return { toast: USUARIO_SALVO_TOAST };
  }

  private async emailEmUso(email: string, id: string | undefined): Promise<boolean> {
    const encontrados = await this.repository.findByEmail(email);
    return encontrados.some((usuario) => usuario.id !== id);
  }

  private async campos(
    draft: UsuarioDraft,
    email: string,
    perfilId: PerfilId,
  ): Promise<Required<Omit<UsuarioPatch, 'alteradoPor' | 'alteradoEm'>>> {
    const perfil = (await this.perfis.list()).find((candidate) => candidate.id === perfilId);
    if (perfil === undefined) {
      throw new InvalidValueError('Perfil de acesso desconhecido');
    }
    return {
      nome: draft.nome.trim(),
      email,
      perfil: perfilId,
      perfilLabel: perfil.label,
      area: draft.area,
      ...capacidades(perfil.nivel),
      ativo: draft.ativo,
      categorias: categoriasDoPerfil(perfilId, draft.categorias),
    };
  }
}
