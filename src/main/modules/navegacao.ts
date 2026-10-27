import { GetNavBadges } from '@application/navegacao/GetNavBadges';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { HttpContagemRepository } from '@infrastructure/navegacao/HttpContagemRepository';
import type { UseCases } from '@presentation/providers/UseCasesContext';

export function createNavegacaoModule(http: HttpClient): UseCases['navegacao'] {
  return { badges: new GetNavBadges(new HttpContagemRepository(http)) };
}
