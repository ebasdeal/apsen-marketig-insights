import { GetCiclosResumo } from '@application/ciclos/GetCiclosResumo';
import { ListCiclos } from '@application/ciclos/ListCiclos';
import { SaveCiclo } from '@application/ciclos/SaveCiclo';
import { ToggleCiclo } from '@application/ciclos/ToggleCiclo';
import type { CiclosUseCases } from '@application/ciclos/ciclosUseCases';
import { HttpCicloRepository } from '@infrastructure/ciclos/HttpCicloRepository';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { CryptoIdGenerator } from '@infrastructure/shared/CryptoIdGenerator';

export function createCiclosModule(
  http: HttpClient,
  now: () => Date = () => new Date(),
): CiclosUseCases {
  const repository = new HttpCicloRepository(http);
  return {
    list: new ListCiclos(repository),
    resumo: new GetCiclosResumo(repository, now),
    save: new SaveCiclo(repository, new CryptoIdGenerator(), now),
    toggle: new ToggleCiclo(repository, now),
  };
}
