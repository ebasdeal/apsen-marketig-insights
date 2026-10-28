'use client';

import type { PlanoItemDetailOutput } from '@application/planos/dto';
import { PlanoInvalidoError } from '@domain/planos/PlanoErrors';
import { formularioAlterado, validarEdicao } from '@domain/planos/planoRules';
import {
  Breadcrumb,
  Button,
  focusFirstInvalid,
  FormActions,
  useUnsavedChangesGuard,
} from '@presentation/components/ui';
import { mensagemDeFalha } from '@presentation/hooks/mutationFeedback';
import { useAtualizarPlanoItemMutation } from '@presentation/hooks/planos/usePlanoMutations';
import { useToast } from '@presentation/providers/ToastProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { erroDoCampo, type PlanoCampoErro } from '../planoErro';
import { PLANOS_ROUTE } from '../planoRoutes';
import { usePodeEditarPlano } from '../usePodeEditarPlano';
import { PlanoItemCampos } from './PlanoItemCampos';

export function PlanoItemDetalhe({ item }: { item: PlanoItemDetailOutput }) {
  const [form, setForm] = useState(item.form);
  const [erro, setErro] = useState<PlanoCampoErro | null>(null);
  const [salvo, setSalvo] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const toast = useToast();
  const atualizar = useAtualizarPlanoItemMutation();
  const podeEditar = usePodeEditarPlano();
  const somenteLeitura = item.somenteLeitura || !podeEditar;
  const guard = useUnsavedChangesGuard(!salvo && formularioAlterado(form, item.form));

  useEffect(() => {
    if (erro !== null) focusFirstInvalid(corpo.current);
  }, [erro]);

  const salvar = async () => {
    try {
      validarEdicao(form);
      setErro(null);
      const { codigo } = await atualizar.mutateAsync({ id: item.id, form });
      setSalvo(true);
      toast.show(`✅ Item ${codigo} atualizado.`);
      router.push(PLANOS_ROUTE);
    } catch (error) {
      if (error instanceof PlanoInvalidoError) {
        toast.show(error.message);
        setErro(erroDoCampo(error));
        return;
      }
      toast.show(mensagemDeFalha(error));
    }
  };

  // PRG-PLN-11: só o Aprovado trava; Planejador e Admin reabrem o item para Em Revisão.
  const reabrir = async () => {
    try {
      const { codigo } = await atualizar.mutateAsync({
        id: item.id,
        form: { ...item.form, status: 'revisao' },
      });
      setSalvo(true);
      toast.show(`✅ Item ${codigo} reaberto para revisão.`);
      router.push(PLANOS_ROUTE);
    } catch (error) {
      toast.show(mensagemDeFalha(error));
    }
  };

  return (
    <div ref={corpo}>
      <Breadcrumb
        linkVariant="crumb"
        items={[{ label: 'Planos de Produção', href: PLANOS_ROUTE }, { label: item.codigo }]}
        backHref={PLANOS_ROUTE}
      />
      <PlanoItemCampos
        item={item}
        form={form}
        erro={erro}
        somenteLeitura={somenteLeitura}
        onChange={(patch) => setForm((atual) => ({ ...atual, ...patch }))}
        acoes={
          <FormActions>
            <Button variant="ghost" onClick={() => guard.confirmLeave(PLANOS_ROUTE)}>
              Cancelar
            </Button>
            {item.status === 'aprovado' && podeEditar ? (
              <Button
                variant="outline"
                size="sm"
                loading={atualizar.isPending}
                onClick={() => void reabrir()}
              >
                Reabrir para revisão
              </Button>
            ) : null}
            {somenteLeitura ? null : (
              <Button size="sm" loading={atualizar.isPending} onClick={() => void salvar()}>
                Salvar Alterações
              </Button>
            )}
          </FormActions>
        }
      />
      {guard.dialog}
    </div>
  );
}
