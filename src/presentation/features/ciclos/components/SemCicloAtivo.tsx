'use client';

import { podeAcessar } from '@domain/perfis/acesso';
import { Alert } from '@presentation/components/ui';
import { usePerfilAtual } from '@presentation/hooks/usePerfilAtual';
import Link from 'next/link';
import { CICLOS_ROUTE } from '../../../navigation/routes';

const NIVEL_PLANEJADOR = 3;

export function SemCicloAtivo({ contexto }: { contexto: string }) {
  const { perfil } = usePerfilAtual();
  const podeAtivar = perfil !== undefined && podeAcessar(perfil.nivel, NIVEL_PLANEJADOR);
  return (
    <Alert tone="warning" title="Nenhum ciclo ativo.">
      {contexto} {podeAtivar ? 'Ative um ciclo para começar o planejamento. ' : null}
      <Link href={CICLOS_ROUTE} className="font-semibold underline">
        Ver ciclos de planejamento
      </Link>
    </Alert>
  );
}
