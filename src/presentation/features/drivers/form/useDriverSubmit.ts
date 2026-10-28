'use client';

import type { DriverFormLookupsDto } from '@application/drivers/dto';
import type { UsuarioSessao } from '@domain/auth/Sessao';
import type { Driver } from '@domain/drivers/Driver';
import type { DriverDraft } from '@domain/drivers/draft';
import { DriverValidationError } from '@domain/drivers/errors';
import type { CampoTipo } from '@domain/drivers/lookups';
import { validarDraft, type DraftErro } from '@domain/drivers/validarDraft';
import {
  useCreateDriverMutation,
  useUpdateDriverMutation,
} from '@presentation/hooks/drivers/useDriverMutations';
import { useSessao } from '@presentation/hooks/useSessao';
import { useToast } from '@presentation/providers/ToastProvider';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import type { FormMode } from './formTypes';

export const MSG_CRIADO = '✅ Driver registrado com sucesso!';
export const MSG_ATUALIZADO = '✅ Driver atualizado com sucesso!';
export const MSG_FALHA = '⚠️ Não foi possível salvar o driver. Tente novamente.';

function contextoDoRegistro(
  draft: DriverDraft,
  lookups: DriverFormLookupsDto,
  usuario: UsuarioSessao | undefined,
) {
  const categoria = lookups.categorias.find((item) => item.id === draft.categoriaId);
  const tipo = categoria?.tipos.find((item) => item.slug === draft.tipo);
  return {
    registrante: { nome: usuario?.nome ?? '', perfil: usuario?.perfil ?? ('area' as const) },
    tipoLabel: tipo?.label ?? draft.tipo,
    categoria: categoria?.slug ?? '',
  };
}

interface SubmitOptions {
  lookups: DriverFormLookupsDto;
  mode: FormMode;
  original: Driver | undefined;
  destino: Route;
  onInvalid: (erro: DraftErro) => void;
  onSaved: () => void;
}

export function useDriverSubmit({
  mode,
  lookups,
  original,
  destino,
  onInvalid,
  onSaved,
}: SubmitOptions) {
  const { usuario } = useSessao();
  const create = useCreateDriverMutation();
  const updateMutation = useUpdateDriverMutation();
  const toast = useToast();
  const router = useRouter();

  async function submit(draft: DriverDraft, campos: readonly CampoTipo[]) {
    const erro = validarDraft(draft, campos);
    if (erro !== null) {
      toast.show(erro.toast);
      onInvalid(erro);
      return;
    }
    try {
      if (mode === 'edit' && original !== undefined) {
        await updateMutation.mutateAsync({ id: original.id, draft, campos, original });
      } else {
        await create.mutateAsync({
          draft,
          campos,
          registro: contextoDoRegistro(draft, lookups, usuario),
        });
      }
      onSaved();
      toast.show(mode === 'edit' ? MSG_ATUALIZADO : MSG_CRIADO);
      router.push(destino);
    } catch (error) {
      if (error instanceof DriverValidationError) {
        toast.show(error.message);
        onInvalid({ campo: error.field, toast: error.message, mensagem: error.fieldMessage });
        return;
      }
      toast.show(MSG_FALHA);
    }
  }

  return { submit, pending: create.isPending || updateMutation.isPending };
}
