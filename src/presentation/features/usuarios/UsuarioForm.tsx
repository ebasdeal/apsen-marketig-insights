'use client';

import { UsuarioValidationError } from '@domain/usuarios/errors';
import type { UsuarioDraft } from '@domain/usuarios/Usuario';
import {
  areaOptions,
  validateUsuarioDraft,
  type UsuarioErros,
} from '@domain/usuarios/usuarioRules';
import {
  Breadcrumb,
  Button,
  Card,
  CardTitle,
  FormActions,
  ScreenDesc,
  StatusField,
  useUnsavedChangesGuard,
} from '@presentation/components/ui';
import { USUARIOS_ROUTE } from '@presentation/navigation/routes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FALHA_SALVAR } from '../../hooks/mutationFeedback';
import { useCategorias } from '../../hooks/tipos/useTipos';
import { usePerfis } from '../../hooks/usePerfis';
import { useSaveUsuarioMutation } from '../../hooks/usuarios/useUsuarioMutations';
import { useToast } from '../../providers/ToastProvider';
import { CategoriasAutorizadas } from './components/CategoriasAutorizadas';
import { UsuarioDadosCard } from './components/UsuarioDadosCard';
import { sameDraft, useFocusOnErrors } from './useFocusOnErrors';

interface UsuarioFormProps {
  id?: string;
  initial: UsuarioDraft;
  areaExtra: string | null;
}

export function UsuarioForm({ id, initial, areaExtra }: UsuarioFormProps) {
  const router = useRouter();
  const { show } = useToast();
  const save = useSaveUsuarioMutation();
  const perfis = usePerfis();
  const categorias = useCategorias();
  const [draft, setDraft] = useState(initial);
  const [erros, setErros] = useState<UsuarioErros>({});
  const { ref, focusErrors } = useFocusOnErrors<HTMLFormElement>();
  const guard = useUnsavedChangesGuard(!save.isSuccess && !sameDraft(draft, initial), {
    title: 'Descartar alterações?',
    message: 'As alterações feitas neste formulário serão perdidas.',
    confirmLabel: 'Descartar',
  });

  const change = (patch: Partial<UsuarioDraft>) => setDraft((atual) => ({ ...atual, ...patch }));
  const falhar = (novos: UsuarioErros) => {
    setErros(novos);
    show(Object.values(novos)[0] ?? FALHA_SALVAR);
    focusErrors();
  };

  const submit = async () => {
    const locais = validateUsuarioDraft(draft, { emailEmUso: false });
    if (Object.keys(locais).length > 0) {
      falhar(locais);
      return;
    }
    try {
      const result = await save.mutateAsync({ ...(id === undefined ? {} : { id }), draft });
      show(result.toast);
      router.push(USUARIOS_ROUTE);
    } catch (error) {
      if (error instanceof UsuarioValidationError) {
        falhar(error.erros);
      } else {
        show(FALHA_SALVAR);
      }
    }
  };

  const hint = perfis.data?.find((perfil) => perfil.id === draft.perfil)?.hint;
  const chips = (categorias.data ?? []).map((cat) => ({ value: cat.slug, label: cat.label }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Usuários', href: USUARIOS_ROUTE },
          { label: id === undefined ? 'Cadastrar Usuário' : 'Editar Usuário' },
        ]}
        backHref={USUARIOS_ROUTE}
      />
      <ScreenDesc icon="👤">
        <strong>Cria ou edita um usuário do módulo Demand Intelligence.</strong> O <em>perfil</em>{' '}
        define o nível de acesso. Para usuários de área, configure também as{' '}
        <em>categorias de driver autorizadas</em> — eles só verão os tipos das categorias liberadas
        para o seu setor.
      </ScreenDesc>
      <form
        ref={ref}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Card>
          <CardTitle>Dados do Usuário</CardTitle>
          <UsuarioDadosCard
            draft={draft}
            erros={erros}
            areas={areaOptions(areaExtra ?? '')}
            perfilHint={hint}
            onChange={change}
          />
          {draft.perfil === 'area' ? (
            <CategoriasAutorizadas
              options={chips}
              selected={draft.categorias}
              onChange={(next) => change({ categorias: next })}
            />
          ) : null}
          <div className="mt-[16px]">
            <StatusField
              title="Ativo / Inativo"
              description="Usuários inativos não conseguem acessar o módulo."
              checked={draft.ativo}
              onChange={(ativo) => change({ ativo })}
            />
          </div>
          <FormActions className="mt-[14px]">
            <Button variant="ghost" onClick={() => guard.confirmLeave(USUARIOS_ROUTE)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="purple"
              loading={save.isPending}
              loadingLabel="Salvando…"
            >
              Salvar Usuário
            </Button>
          </FormActions>
        </Card>
      </form>
      {guard.dialog}
    </>
  );
}
