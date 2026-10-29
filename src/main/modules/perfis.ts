import { ListPerfis } from '@application/perfis/ListPerfis';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { HttpPerfilRepository } from '@infrastructure/perfis/HttpPerfilRepository';
import type { UseCases } from '@presentation/providers/UseCasesContext';

export function createPerfisModule(http: HttpClient): UseCases['perfis'] {
  return { list: new ListPerfis(new HttpPerfilRepository(http)) };
}
