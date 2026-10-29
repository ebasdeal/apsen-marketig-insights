'use client';

import type { DriversExportDto } from '@application/drivers/dto';
import {
  Alert,
  ApsenLoader,
  Button,
  Card,
  CardTitle,
  CodeBlock,
  ErrorState,
  PageHeader,
  ScreenDesc,
} from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import { useDriversExport } from '@presentation/hooks/drivers/useDriversExport';
import { CopyJsonButton } from './CopyJsonButton';
import { downloadText } from './downloadText';

function ExportCard({
  data,
  regerar,
}: {
  data: DriversExportDto;
  regerar: () => Promise<DriversExportDto>;
}) {
  async function baixar() {
    const atual = await regerar();
    downloadText(atual.nomeArquivo, atual.texto);
  }

  return (
    <Card>
      <CardTitle>JSON para Análise Causal</CardTitle>
      <Alert tone="info" title="Apsen PLP Agent:" className="mb-[12px]">
        recall e ruptura logística = demanda censurada, não queda real. TV/digital → indicador ou
        variável numérica (GRP). Viral/off-label → indicador agudo + decaimento exponencial.
        Concorrente descontinuado → indicador permanente de ganho de share.
      </Alert>
      <div className="mb-[12px] flex gap-[8px]">
        <CopyJsonButton gerar={async () => (await regerar()).texto} />
        <Button variant="ghost" size="sm" onClick={() => void baixar()}>
          💾 Baixar .json
        </Button>
      </div>
      <div role="region" aria-label="JSON exportado">
        <CodeBlock aria-label="JSON exportado">{data.texto}</CodeBlock>
      </div>
    </Card>
  );
}

export function DriversExportScreen() {
  const query = useDriversExport();

  async function regerar(): Promise<DriversExportDto> {
    const result = await query.refetch();
    if (result.data === undefined) {
      throw result.error ?? new Error('Falha ao gerar o JSON');
    }
    return result.data;
  }

  return (
    <>
      <PageHeader
        title="Exportar JSON"
        description="Payload para ingestão no Data Lake · ApsenPLPEngine"
      />
      <ScreenDesc icon="📦">
        <strong>JSON estruturado para consumo pelo pipeline de Demand Intelligence.</strong> Cada
        driver inclui metadados de modelagem: tipo de feature engineering recomendado, instrução
        sobre demanda censurada e nota metodológica para o analista. <em>Correlação ≠ causa</em> —
        valide sempre com backtesting e contrafactual.
      </ScreenDesc>
      {query.isPending ? <ApsenLoader variant="content" label="Gerando JSON…" /> : null}
      {query.isError && query.data === undefined ? (
        <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : null}
      {query.data === undefined ? null : <ExportCard data={query.data} regerar={regerar} />}
    </>
  );
}
