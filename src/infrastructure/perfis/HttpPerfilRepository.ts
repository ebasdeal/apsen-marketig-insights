import type { Perfil } from '@domain/perfis/Perfil';
import type { PerfilRepository } from '@domain/perfis/PerfilRepository';
import { InvalidResponseError, type HttpClient } from '../http/HttpClient';
import { toPerfil } from './perfilMapper';
import { perfisResponseSchema } from './perfilSchema';

export class HttpPerfilRepository implements PerfilRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<readonly Perfil[]> {
    const result = perfisResponseSchema.safeParse(await this.http.get('/perfis'));
    if (!result.success) {
      const campos = result.error.issues
        .map((issue) => (issue.path.length === 0 ? '(raiz)' : issue.path.join('.')))
        .join(', ');
      throw new InvalidResponseError(`Resposta de /perfis fora do contrato: ${campos}`);
    }
    return result.data.map(toPerfil);
  }
}
