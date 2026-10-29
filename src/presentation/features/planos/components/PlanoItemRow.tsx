import type { PlanoItemRowOutput } from '@application/planos/dto';
import {
  ActionGroup,
  ColorPill,
  EyeIcon,
  IconButton,
  IconLink,
  STACK_ROW,
  StackedCell,
} from '@presentation/components/ui';
import { PencilIcon, TrashIcon } from '@presentation/components/ui/rowActionIcons';
import { formatInteger } from '@presentation/format/formatters';
import { planoItemRoute } from '../planoRoutes';
import { STATUS_COR, tomDaFamilia } from '../planoStyles';

interface PlanoItemRowProps {
  item: PlanoItemRowOutput;
  selecionado: boolean;
  podeEditar: boolean;
  onSelecionar: () => void;
  onExcluir: () => void;
}

const TD = 'border-b border-apsen-bg px-[10px] py-[12px] align-middle text-[13px]';
const TD_CURTO = `${TD} whitespace-nowrap`;

export function PlanoItemRow({
  item,
  selecionado,
  podeEditar,
  onSelecionar,
  onExcluir,
}: PlanoItemRowProps) {
  const href = planoItemRoute(item.id);
  const editavel = podeEditar && item.editavel;
  return (
    <tr className={`hover:bg-apsen-row-hover [&:last-child>td]:border-b-0 ${STACK_ROW}`}>
      <StackedCell label="Selecionar" className={TD}>
        <input
          type="checkbox"
          aria-label={`Selecionar ${item.codigo}`}
          className="accent-apsen-blue"
          checked={selecionado}
          onChange={onSelecionar}
        />
      </StackedCell>
      <StackedCell label="Código" kind="title" className={TD_CURTO}>
        <span className="font-mono text-[12px] font-semibold text-apsen-blue">{item.codigo}</span>
      </StackedCell>
      <StackedCell label="Produto" className={TD}>
        <div className="text-[13px] font-medium">{item.nome}</div>
        <div className="text-[11.5px] text-apsen-muted">
          {item.apres} · SKU {item.skuCurto}
        </div>
      </StackedCell>
      <StackedCell label="Família" className={TD_CURTO}>
        <ColorPill color={tomDaFamilia(item.familia)}>● {item.familia}</ColorPill>
      </StackedCell>
      <StackedCell label="Qtd. planejada" className={`${TD_CURTO} font-semibold`}>
        {formatInteger(item.qtd)}
        <span className="text-[11px] font-normal text-apsen-muted"> cp</span>
      </StackedCell>
      <StackedCell label="Linha" className={`${TD_CURTO} text-[12.5px]`}>
        {item.linha}
      </StackedCell>
      <StackedCell label="Semana prod." className={`${TD_CURTO} text-[12.5px]`}>
        {item.semana}
      </StackedCell>
      <StackedCell label="Status" className={TD_CURTO}>
        <span className={`text-[12px] font-semibold ${STATUS_COR[item.status]}`}>
          ● {item.statusLabel}
        </span>
      </StackedCell>
      <StackedCell kind="actions" className={TD_CURTO}>
        <ActionGroup>
          <IconLink href={href} aria-label={`Visualizar ${item.codigo}`}>
            <EyeIcon />
          </IconLink>
          {editavel ? (
            <>
              <IconLink href={href} aria-label={`Editar ${item.codigo}`}>
                <PencilIcon />
              </IconLink>
              <IconButton tone="red" aria-label={`Excluir ${item.codigo}`} onClick={onExcluir}>
                <TrashIcon />
              </IconButton>
            </>
          ) : null}
        </ActionGroup>
      </StackedCell>
    </tr>
  );
}
