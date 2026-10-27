import type { PermissoesMatrizDto } from '@application/permissoes/ListPermissoes';
import { PERFIS_DA_MATRIZ } from '@domain/permissoes/Permissao';
import type { Celula } from '@domain/permissoes/permissaoRules';
import type { PerfilId } from '@domain/perfis/Perfil';
import { Fragment } from 'react';

const HEADERS: Record<PerfilId, { label: string; className: string }> = {
  viewer: { label: '👁 Visualizador', className: 'text-apsen-muted' },
  area: { label: '🏢 Área', className: 'text-apsen-teal' },
  planejador: { label: '📋 Planejador', className: 'text-apsen-blue' },
  admin: { label: '⚙️ Admin', className: 'text-apsen-purple' },
};

const TH =
  'whitespace-nowrap border-b border-apsen-border bg-apsen-bg px-[14px] py-[10px] text-[11.5px] font-semibold tracking-[.02em]';
const TD = 'border-b border-apsen-bg px-[14px] py-[12px] text-center text-[13px]';

function CelulaView({ celula }: { celula: Celula }) {
  if (celula.kind === 'nao') {
    return <td className={`${TD} text-apsen-muted-2`}>{celula.texto}</td>;
  }
  if (celula.kind === 'parcial') {
    return (
      <td className={`${TD} text-apsen-teal`}>
        {celula.texto} <span className="text-[11px]">{celula.detalhe}</span>
      </td>
    );
  }
  return <td className={TD}>{celula.texto}</td>;
}

export function PermissionMatrix({ matriz }: { matriz: PermissoesMatrizDto }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <caption className="sr-only">Matriz de permissões por perfil</caption>
        <thead>
          <tr>
            <th scope="col" className={`${TH} min-w-[200px] text-left text-apsen-muted`}>
              Funcionalidade
            </th>
            {PERFIS_DA_MATRIZ.map((perfil) => (
              <th
                key={perfil}
                scope="col"
                className={`${TH} text-center ${HEADERS[perfil].className}`}
              >
                {HEADERS[perfil].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matriz.grupos.map((grupo) => (
            <Fragment key={grupo.grupo}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={5}
                  className="bg-apsen-bg px-[14px] py-[8px] text-left text-[11px] font-bold uppercase tracking-[.06em] text-apsen-muted"
                >
                  {grupo.grupo}
                </th>
              </tr>
              {grupo.linhas.map((linha) => (
                <tr key={linha.id} className="hover:bg-apsen-row-hover">
                  <th
                    scope="row"
                    className="border-b border-apsen-bg px-[14px] py-[12px] text-left text-[13px] font-normal"
                  >
                    {linha.funcionalidade}
                  </th>
                  {PERFIS_DA_MATRIZ.map((perfil) => (
                    <CelulaView key={perfil} celula={linha.celulas[perfil]} />
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
