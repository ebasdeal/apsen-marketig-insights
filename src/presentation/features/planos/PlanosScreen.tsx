'use client';

import type { PlanoItemRowOutput } from '@application/planos/dto';
import { alternarOrdem } from '@domain/planos/planoRules';
import { Button, ConfirmDialog, PageHeader, ScreenDesc } from '@presentation/components/ui';
import { useExcluirPlanoItemMutation } from '@presentation/hooks/planos/usePlanoMutations';
import { usePlanoItens } from '@presentation/hooks/planos/usePlanos';
import { useUrlState } from '@presentation/navigation/useUrlState';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { PlanoFiltros } from './components/PlanoFiltros';
import { PlanoListaConteudo } from './components/PlanoListaConteudo';
import { filtroDaUrl, PLANO_URL_SPEC, textoDeOrdem } from './planoUrl';
import { usePodeEditarPlano } from './usePodeEditarPlano';

const IncluirItemModal = dynamic(() => import('./components/IncluirItemModal'), { ssr: false });

export function PlanosScreen() {
  const [url, setUrl] = useUrlState(PLANO_URL_SPEC);
  const filtro = filtroDaUrl(url);
  const lista = usePlanoItens(filtro);
  const excluir = useExcluirPlanoItemMutation(filtro);
  const podeEditar = usePodeEditarPlano();
  const [incluindo, setIncluindo] = useState(false);
  const [excluindo, setExcluindo] = useState<PlanoItemRowOutput | null>(null);
  const ciclo = lista.data?.ciclo ?? null;

  const filtrar = useCallback(
    (patch: { busca?: string; familia?: string; status?: string }) =>
      setUrl({ ...patch, pagina: 1 }),
    [setUrl],
  );

  return (
    <>
      <PageHeader
        title={ciclo === null ? 'Planos de Produção' : `Planos de Produção — ${ciclo}`}
        description="Lista e gerencia todos os itens programados para produção no ciclo ativo"
        actions={
          podeEditar ? (
            <Button size="sm" onClick={() => setIncluindo(true)}>
              + Incluir Item
            </Button>
          ) : undefined
        }
      />
      <ScreenDesc icon="📋">
        <strong>Lista e gerencia todos os itens programados para produção no ciclo ativo.</strong> É
        a tela operacional central do PLP — onde o planejador inclui, ajusta e acompanha cada SKU do
        plano. A <em>acurácia deste plano</em> é o que reduz o gap entre previsão e produção real:
        itens mal dimensionados aqui geram ruptura de estoque ou excesso, impactando diretamente o
        nível de serviço e o capital de giro.
      </ScreenDesc>
      <PlanoFiltros
        busca={url.busca}
        familia={url.familia}
        status={url.status}
        onChange={filtrar}
      />
      <PlanoListaConteudo
        estado={lista}
        filtro={filtro}
        podeEditar={podeEditar}
        onOrdenar={(campo) => setUrl({ ordem: textoDeOrdem(alternarOrdem(filtro.ordem, campo)) })}
        onPagina={(pagina) => setUrl({ pagina })}
        onTamanho={(tamanho) => setUrl({ tamanho: String(tamanho), pagina: 1 })}
        onExcluir={setExcluindo}
      />
      {incluindo ? <IncluirItemModal onClose={() => setIncluindo(false)} /> : null}
      <ConfirmDialog
        open={excluindo !== null}
        title="Excluir item"
        message={`Excluir o item ${excluindo?.codigo ?? ''} do plano?`}
        confirmLabel="Excluir"
        onCancel={() => setExcluindo(null)}
        onConfirm={() => {
          if (excluindo !== null) excluir.mutate(excluindo.id);
          setExcluindo(null);
        }}
      />
    </>
  );
}
