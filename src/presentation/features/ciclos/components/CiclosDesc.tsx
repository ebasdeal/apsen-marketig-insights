import { ScreenDesc } from '@presentation/components/ui';

export function CiclosDesc() {
  return (
    <ScreenDesc icon="🗓️">
      <strong>
        Define os períodos de planejamento de produção que organizam o registro de drivers.
      </strong>{' '}
      Cada ciclo representa um mês de produção. Drivers registrados são vinculados ao ciclo ativo,
      permitindo rastrear quais eventos externos foram considerados em cada rodada de planejamento.
      Um ciclo <em>Ativo</em> por vez — ao ativar um novo, o anterior é encerrado automaticamente.
    </ScreenDesc>
  );
}
