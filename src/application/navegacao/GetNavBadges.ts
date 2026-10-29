import type { ContagemRepository } from '@domain/navegacao/ContagemRepository';
import { NAV_BADGE_CONTAGENS, type NavBadgeKey, type NavBadges } from '@domain/navegacao/NavBadges';

export class GetNavBadges {
  constructor(private readonly repository: ContagemRepository) {}

  async execute(): Promise<NavBadges> {
    const keys = Object.keys(NAV_BADGE_CONTAGENS) as NavBadgeKey[];
    const results = await Promise.allSettled(
      keys.map((key) => {
        const { colecao, filtro } = NAV_BADGE_CONTAGENS[key];
        return filtro === undefined
          ? this.repository.contar(colecao)
          : this.repository.contar(colecao, filtro);
      }),
    );
    return Object.fromEntries(
      keys.map((key, index) => {
        const result = results[index];
        return [key, result?.status === 'fulfilled' ? result.value : null];
      }),
    ) as NavBadges;
  }
}
