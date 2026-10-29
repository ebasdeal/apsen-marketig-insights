import type { Ciclo } from '@domain/ciclos/Ciclo';
import type { CicloRepository } from '@domain/ciclos/CicloRepository';
import { metaEncerrado } from '@domain/ciclos/cicloRules';

export async function encerrarCiclo(
  repository: CicloRepository,
  ciclo: Ciclo,
  today: Date,
): Promise<void> {
  await repository.update(ciclo.id, {
    status: 'encerrado',
    meta: metaEncerrado(today, ciclo.versao),
  });
}

export async function encerrarAtivoExceto(
  repository: CicloRepository,
  ativo: Ciclo | null,
  id: string | undefined,
  today: Date,
): Promise<string | null> {
  if (ativo === null || ativo.id === id) {
    return null;
  }
  await encerrarCiclo(repository, ativo, today);
  return ativo.id;
}
