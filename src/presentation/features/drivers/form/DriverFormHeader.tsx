import { Alert, ButtonLink, PageHeader, ScreenDesc } from '@presentation/components/ui';
import { catalogoFamiliaRoute, editarDriverRoute, voltarRoute } from '../driverRoutes';
import type { FormMode } from './formTypes';

interface DriverFormHeaderProps {
  mode: FormMode;
  driverId: string | undefined;
  familia: string | undefined;
}

function comFamilia(texto: string, familia: string | undefined): string {
  return familia === undefined ? texto : `${texto} · ${familia}`;
}

function Actions({ mode, driverId, familia }: DriverFormHeaderProps) {
  if (mode === 'new') {
    return familia === undefined ? null : (
      <ButtonLink variant="ghost" size="sm" href={catalogoFamiliaRoute(familia)}>
        Voltar aos drivers
      </ButtonLink>
    );
  }
  return (
    <>
      <ButtonLink variant="ghost" size="sm" href={voltarRoute(familia)}>
        Voltar
      </ButtonLink>
      {mode === 'view' && driverId !== undefined ? (
        <ButtonLink variant="primary" size="sm" href={editarDriverRoute(driverId, familia)}>
          Editar
        </ButtonLink>
      ) : null}
    </>
  );
}

const TITULOS: Record<FormMode, { title: string; sub: (familia: string | undefined) => string }> = {
  new: {
    title: 'Registrar Driver de Demanda',
    sub: () => 'Cadastre variáveis externas para análise causal · Apsen PLP Agent Framework',
  },
  view: { title: 'Visualizar Driver', sub: (f) => comFamilia('Somente leitura', f) },
  edit: { title: 'Editar Driver', sub: (f) => comFamilia('Editando registro existente', f) },
};

export function DriverFormHeader(props: DriverFormHeaderProps) {
  const { mode, familia } = props;
  const actions = <Actions {...props} />;
  return (
    <>
      <PageHeader
        title={TITULOS[mode].title}
        description={TITULOS[mode].sub(familia)}
        actions={actions}
      />
      {mode === 'view' ? (
        <Alert tone="info">
          👁️ Modo visualização — os campos estão travados. Clique em Editar para modificar.
        </Alert>
      ) : null}
      {mode === 'edit' ? (
        <Alert tone="warning">
          ✏️ Modo edição — altere os campos e clique em Salvar alterações.
        </Alert>
      ) : null}
      <ScreenDesc icon="📋">
        <strong>
          Use este formulário para registrar eventos que afetam a demanda de produtos.
        </strong>{' '}
        Cada driver registrado vira variável exógena no modelo causal — quanto mais completo o
        registro, melhor a qualidade do forecast. Vincule ao produto correto, informe o período e
        escolha o tipo específico. <em>Correlação ≠ causa</em>: o analista validará o impacto no
        backtesting.
      </ScreenDesc>
    </>
  );
}
