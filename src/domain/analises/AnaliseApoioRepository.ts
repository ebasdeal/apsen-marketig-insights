import type { Page } from '../shared/Page';
import type {
  CicloResumo,
  DriverAprovado,
  ModeloGuiado,
  RegraChat,
  ResultadoMock,
  SkuCiclo,
} from './Analise';

export interface AnaliseConfiguracao {
  resultado: ResultadoMock;
  regrasChat: RegraChat[];
}

export interface AnaliseApoioRepository {
  skusDoCiclo(ciclo: string): Promise<SkuCiclo[]>;
  modelosGuiados(): Promise<ModeloGuiado[]>;
  configuracao(): Promise<AnaliseConfiguracao>;
}

export interface CicloFonte {
  listCiclos(): Promise<CicloResumo[]>;
}

export interface DriverAprovadoFonte {
  listAprovados(limite: number): Promise<Page<DriverAprovado>>;
}
