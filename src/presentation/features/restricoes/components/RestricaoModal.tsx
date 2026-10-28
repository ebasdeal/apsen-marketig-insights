'use client';

import type { RestricaoItemOutput } from '@application/restricoes/dto';
import type { RestricaoForm } from '@domain/restricoes/Restricao';
import { RestricaoInvalidaError } from '@domain/restricoes/RestricaoInvalidaError';
import {
  formularioAlterado,
  formularioVazio,
  validarRestricao,
} from '@domain/restricoes/restricaoRules';
import { Button, ConfirmDialog, focusFirstInvalid, Modal } from '@presentation/components/ui';
import {
  ERRO_SALVAR_RESTRICAO,
  useAtualizarRestricaoMutation,
  useRegistrarRestricaoMutation,
} from '@presentation/hooks/restricoes/useRestricaoMutations';
import { useToast } from '@presentation/providers/ToastProvider';
import { useEffect, useRef, useState } from 'react';
import { RestricaoFormFields, type CampoErro } from './RestricaoFormFields';

export const RESTRICAO_REGISTRADA = '✅ Restrição registrada!';

interface RestricaoModalProps {
  item: RestricaoItemOutput | null;
  onClose: () => void;
}

function campoErro(error: RestricaoInvalidaError): CampoErro {
  return { campo: error.campo, mensagem: error.message.replace(/^⚠️\s*/, '') };
}

export default function RestricaoModal({ item, onClose }: RestricaoModalProps) {
  const [inicial] = useState<RestricaoForm>(() => item?.form ?? formularioVazio());
  const [form, setForm] = useState(inicial);
  const [erro, setErro] = useState<CampoErro | null>(null);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const registrar = useRegistrarRestricaoMutation();
  const atualizar = useAtualizarRestricaoMutation();
  const salvando = registrar.isPending || atualizar.isPending;

  useEffect(() => {
    if (erro !== null) focusFirstInvalid(corpo.current);
  }, [erro]);

  const falhar = (error: unknown) => {
    if (error instanceof RestricaoInvalidaError) {
      toast.show(error.message);
      setErro(campoErro(error));
      return;
    }
    toast.show(ERRO_SALVAR_RESTRICAO);
  };

  const salvar = async () => {
    try {
      validarRestricao(form);
      setErro(null);
      if (item === null) await registrar.mutateAsync(form);
      else await atualizar.mutateAsync({ original: item, form });
      toast.show(RESTRICAO_REGISTRADA);
      onClose();
    } catch (error) {
      falhar(error);
    }
  };

  const fechar = () => {
    if (salvando) return;
    if (formularioAlterado(form, inicial)) setConfirmarSaida(true);
    else onClose();
  };

  return (
    <>
      <Modal
        open
        size="lg"
        title="Registrar Restrição"
        onClose={fechar}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={fechar} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant="red" size="sm" loading={salvando} onClick={() => void salvar()}>
              Registrar Restrição
            </Button>
          </>
        }
      >
        <div ref={corpo} className="flex flex-col gap-[13px]">
          <RestricaoFormFields
            form={form}
            erro={erro}
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
