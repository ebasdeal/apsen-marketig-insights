import type { ContarAnalises } from './ContarAnalises';
import type { DocumentarInteracao } from './DocumentarInteracao';
import type { ExecutarAnalise } from './ExecutarAnalise';
import type { ExportarPdfAnalise } from './ExportarPdfAnalise';
import type { GetAnalise } from './GetAnalise';
import type { GetNovaAnaliseOpcoes } from './GetNovaAnaliseOpcoes';
import type { GetResumoAnalises } from './GetResumoAnalises';
import type { ListAnalises } from './ListAnalises';
import type { ListDriversSugeridos } from './ListDriversSugeridos';
import type { ListSkusDoCiclo } from './ListSkusDoCiclo';
import type { ResponderChat } from './ResponderChat';
import type { SalvarAnalise } from './SalvarAnalise';

export interface AnalisesUseCases {
  list: Pick<ListAnalises, 'execute'>;
  contar: Pick<ContarAnalises, 'execute'>;
  resumo: Pick<GetResumoAnalises, 'execute'>;
  get: Pick<GetAnalise, 'execute'>;
  opcoes: Pick<GetNovaAnaliseOpcoes, 'execute'>;
  skusDoCiclo: Pick<ListSkusDoCiclo, 'execute'>;
  driversSugeridos: Pick<ListDriversSugeridos, 'execute'>;
  executar: Pick<ExecutarAnalise, 'execute'>;
  salvar: Pick<SalvarAnalise, 'execute'>;
  exportarPdf: Pick<ExportarPdfAnalise, 'execute'>;
  documentarInteracao: Pick<DocumentarInteracao, 'execute'>;
  responderChat: Pick<ResponderChat, 'execute'>;
}
