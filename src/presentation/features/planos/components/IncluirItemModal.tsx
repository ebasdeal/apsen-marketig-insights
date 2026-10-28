'use client';

import { PlanoInvalidoError } from '@domain/planos/PlanoErrors';
import type { InclusaoForm } from '@domain/planos/PlanoItem';
import {
  formularioAlterado,
  formularioInclusaoVazio,
  validarInclusao,
} from '@domain/planos/planoRules';
import { Button, ConfirmDialog, focusFirstInvalid, Modal } from '@presentation/components/ui';
import { useIncluirPlanoItemMutation } from '@presentation/hooks/planos/usePlanoMutations';
import { useSkusInclusao } from '@presentation/hooks/planos/usePlanos';
import { mensagemDeFalha } from '@presentation/hooks/mutationFeedback';
import { useToast } from '@presentation/providers/ToastProvider';
import { useEffect, useRef, useState } from 'react';
import { erroDoCampo, type PlanoCampoErro } from '../planoErro';
import { IncluirItemFields } from './IncluirItemFields';

export default function IncluirItemModal({ onClose }: { onClose: () => void }) {
  const [inicial] = useState<InclusaoForm>(formularioInclusaoVazio);
  const [form, setForm] = useState(inicial);
  const [erro, setErro] = useState<PlanoCampoErro | null>(null);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const skus = useSkusInclusao(true);
  const incluir = useIncluirPlanoItemMutation();

  useEffect(() => {
    if (erro !== null) focusFirstInvalid(corpo.current);
  }, [erro]);

  const salvar = async () => {
    try {
      validarInclusao(form);
      setErro(null);
      const { codigo } = await incluir.mutateAsync(form);
      toast.show(`✅ Item ${codigo} incluído no plano.`);
      onClose();
    } catch (error) {
      if (error instanceof PlanoInvalidoError) {
        toast.show(error.message);
        setErro(erroDoCampo(error));
        return;
      }
      toast.show(mensagemDeFalha(error));
    }
  };

  const fechar = () => {
    if (incluir.isPending) return;
    if (formularioAlterado(form, inicial)) setConfirmarSaida(true);
    else onClose();
  };

  return (
    <>
      <Modal
        open
        size="lg"
        title="Incluir Item no Plano"
        onClose={fechar}
        footer={
          <>
            <Button variant="ghost" size="sm" disabled={incluir.isPending} onClick={fechar}>
              Cancelar
            </Button>
            <Button size="sm" loading={incluir.isPending} onClick={() => void salvar()}>
              Incluir Item
            </Button>
          </>
        }
      >
        <div ref={corpo} className="flex flex-col gap-[13px]">
          <IncluirItemFields
            form={form}
            erro={erro}
            skus={{ opcoes: skus.data, erro: skus.isError, onRetry: () => void skus.refetch() }}
            onChange={(patch) => setForm((atual) => ({ ...atual, ...patch }))}
          />
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmarSaida}
        title="Sair sem salvar?"
        message="Há alterações não salvas. Deseja sair mesmo assim?"
        confirmLabel="Sair"
        onCancel={() => setConfirmarSaida(false)}
        onConfirm={() => {
          setConfirmarSaida(false);
          onClose();
        }}
      />
    </>
  );
}
