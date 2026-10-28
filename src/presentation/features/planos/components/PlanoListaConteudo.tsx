'use client';

import type { PlanoItemRowOutput } from '@application/planos/dto';
import { TAMANHOS_PAGINA } from '@domain/planos/planoConstants';
import type { PlanoFiltro, PlanoOrdemCampo } from '@domain/planos/PlanoItem';
import { pageCountOf } from '@domain/shared/Page';
import { BusyRegion, ErrorState, LoadingState, Pagination } from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import type { usePlanoItens } from '@presentation/hooks/planos/usePlanos';
import { SemCicloAtivo } from '../../ciclos/components/SemCicloAtivo';
import { PlanoItensTable } from './PlanoItensTable';

interface PlanoListaConteudoProps {
  estado: ReturnType<typeof usePlanoItens>;
  filtro: PlanoFiltro;
  podeEditar: boolean;
  onOrdenar: (campo: PlanoOrdemCampo) => void;
  onPagina: (pagina: number) => void;
  onTamanho: (tamanho: number) => void;
  onExcluir: (item: PlanoItemRowOutput) => void;
}

export function intervaloPlano(pagina: number, tamanho: number, total: number): string {
  const inicio = (pagina - 1) * tamanho + 1;
  if (inicio > total) return `Mostrando 0–0 de ${total}`;
  return `Mostrando ${inicio}–${Math.min(pagina * tamanho, total)} de ${total}`;
}

export function PlanoListaConteudo({
  estado,
  filtro,
  podeEditar,
  onOrdenar,
  onPagina,
  onTamanho,
  onExcluir,
}: PlanoListaConteudoProps) {
  if (estado.isError && estado.data === undefined) {
    return (
      <ErrorState message={toUserMessage(estado.error)} onRetry={() => void estado.refetch()} />
    );
  }
  if (estado.data === undefined) {
    return <LoadingState label="Carregando itens do plano…" />;
  }
  const { itens, total, pagina, tamanho, ciclo } = estado.data;
  if (ciclo === null) {
    return <SemCicloAtivo contexto="O plano de produção é gerido por ciclo." />;
  }
  return (
    <>
      <p aria-live="polite" className="mb-[12px] text-[13px] text-apsen-muted">
        <strong>{total}</strong> itens no plano · Ciclo {ciclo}
      </p>
      <BusyRegion busy={estado.isPlaceholderData}>
        <PlanoItensTable
          key={JSON.stringify(filtro)}
          itens={itens}
          ordem={filtro.ordem}
          podeEditar={podeEditar}
          onOrdenar={onOrdenar}
          onExcluir={onExcluir}
        />
      </BusyRegion>
      <Pagination
        page={pagina}
        totalPages={pageCountOf(total, tamanho)}
        info={intervaloPlano(pagina, tamanho, total)}
        onPageChange={onPagina}
        pageSize={filtro.tamanho}
        pageSizeOptions={TAMANHOS_PAGINA}
        onPageSizeChange={onTamanho}
      />
    </>
  );
}
