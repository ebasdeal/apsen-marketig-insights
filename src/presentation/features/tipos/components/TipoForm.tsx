'use client';

import type { SaveTipoInput, SemPor } from '@application/tipos/dto';
import { TipoValidationError, type TipoValidation } from '@domain/tipos/errors';
import type { Categoria, TipoDraft } from '@domain/tipos/Tipo';
import {
  Breadcrumb,
  focusFirstInvalid,
  ScreenDesc,
  useUnsavedChangesGuard,
  type SelectOption,
} from '@presentation/components/ui';
import { useSaveTipoMutation } from '@presentation/hooks/tipos/useTipoMutations';
import { TIPOS_ROUTE } from '@presentation/navigation/routes';
import { useRouter } from 'next/navigation';
import { useEffect, useReducer, useRef, useState } from 'react';
import { TipoFeatureCard } from './TipoFeatureCard';
import { draftSujo, tipoFormReducer, type DraftField } from './tipoFormReducer';
import { TipoIdentificacaoCard } from './TipoIdentificacaoCard';
import { TipoParamsCard } from './TipoParamsCard';
import { TipoStatusCard } from './TipoStatusCard';

interface TipoFormProps {
  id: string | undefined;
  inicial: TipoDraft;
  featureExtra: string | null;
  alteracao?: string | null;
  categorias: readonly Categoria[];
  fontes: readonly SelectOption<string>[];
}

const SEM_ERROS: TipoValidation = { fields: {}, rows: {} };

export function TipoForm({
  id,
  inicial,
  featureExtra,
  alteracao = null,
  categorias,
  fontes,
}: TipoFormProps) {
  const router = useRouter();
  const [draft, dispatch] = useReducer(tipoFormReducer, inicial);
  const [errors, setErrors] = useState<TipoValidation>(SEM_ERROS);
  const [salvo, setSalvo] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const save = useSaveTipoMutation();
  const guard = useUnsavedChangesGuard(!salvo && draftSujo(draft, inicial), {
    title: 'Descartar alterações?',
    message: 'As alterações feitas neste tipo serão perdidas.',
    confirmLabel: 'Descartar',
  });

  useEffect(() => {
    if (errors !== SEM_ERROS) focusFirstInvalid(container.current);
  }, [errors]);

  const set = <F extends DraftField>(field: F, value: TipoDraft[F]) => {
    dispatch({ type: 'set', field, value });
    if (field in errors.fields) {
      setErrors((atual) => ({
        ...atual,
        fields: Object.fromEntries(
          Object.entries(atual.fields).filter(([chave]) => chave !== field),
        ),
      }));
    }
  };

  const salvar = () => {
    const input: SemPor<SaveTipoInput> =
      id === undefined ? { modo: 'novo', draft } : { modo: 'editar', id, draft };
    save.mutate(input, {
      onSuccess: () => {
        setSalvo(true);
        router.push(TIPOS_ROUTE);
      },
      onError: (error) => {
        if (error instanceof TipoValidationError)
          setErrors({ fields: error.fields, rows: error.rows });
      },
    });
  };

  return (
    <div ref={container}>
      <Breadcrumb
        items={[{ label: 'Catálogo', href: TIPOS_ROUTE }, { label: 'Configurar Tipo' }]}
        backHref={TIPOS_ROUTE}
        backLabel="← Voltar ao Catálogo"
      />
      <ScreenDesc icon="🔧">
        <strong>
          Define como um tipo de driver é exibido no formulário e transformado pelo modelo.
        </strong>{' '}
        A seção de <em>Feature Engineering</em> é a mais crítica: define se o driver vira dummy 0/1,
        variável contínua (GRP, impressões), dummy com lag/decaimento ou flag de demanda censurada.
        Configuração errada aqui propaga erro para o forecast.
      </ScreenDesc>
      {alteracao === null ? null : (
        <p className="mb-[12px] text-[12px] text-apsen-muted">{alteracao}</p>
      )}
      <TipoIdentificacaoCard
        draft={draft}
        set={set}
        errors={errors.fields}
        editando={id !== undefined}
        categorias={categorias}
      />
      <TipoFeatureCard draft={draft} set={set} errors={errors.fields} featureExtra={featureExtra} />
      <TipoParamsCard rows={draft.rows} errors={errors.rows} fontes={fontes} dispatch={dispatch} />
      <TipoStatusCard
        ativo={draft.ativo}
        onAtivoChange={(ativo) => set('ativo', ativo)}
        salvando={save.isPending}
        onCancelar={() => guard.confirmLeave(TIPOS_ROUTE)}
        onSalvar={salvar}
      />
      {guard.dialog}
    </div>
  );
}
