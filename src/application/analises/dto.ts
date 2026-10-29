import type {
  AnaliseStatus,
  Comparacao,
  ConfigModelo,
  DriverImpacto,
  InteracaoIa,
  MensagemChat,
  ModeloGuiado,
  NivelEstoque,
  SegmentoTexto,
} from '@domain/analises/Analise';

export type Esperar = (ms: number) => Promise<void>;

export interface ListAnalisesInput {
  busca: string;
  status: AnaliseStatus | '';
  pagina: number;
  criadoPor?: string;
}

export interface AnaliseCardOutput {
  id: string;
  titulo: string;
  status: AnaliseStatus;
  statusLabel: string;
  ciclo: string;
  skusCount: number;
  modelo: string;
  criada: string;
}

export interface ListAnalisesOutput {
  itens: AnaliseCardOutput[];
  total: number;
  pagina: number;
  tamanho: number;
}

export interface ImpactoOutput extends DriverImpacto {
  largura: number;
  sinal: '+' | '';
}

export interface AnaliseDetailOutput {
  id: string;
  codigo: string;
  titulo: string;
  ciclo: string;
  tipo: string;
  skus: string[];
  modelo: string;
  status: AnaliseStatus;
  statusLabel: string;
  criada: string;
  comentarios: string;
  drivers: string[];
  configModelo: ConfigModelo | null;
  sumario: string;
  justificativas: string[];
  modeloInfo: string;
  salvoEm: string | null;
  metaSkus: string;
  podeExportarPdf: boolean;
  sumarioSegmentos: SegmentoTexto[];
  impactos: ImpactoOutput[];
  comparacao: Comparacao;
  historico: InteracaoIa[];
  mensagensChat: MensagemChat[];
}

export interface OpcaoSelect {
  value: string;
  label: string;
}

export interface NovaAnaliseOpcoesOutput {
  ciclos: OpcaoSelect[];
  cicloAtivoId: string | null;
  modelosGuiados: ModeloGuiado[];
}

export interface SkuCicloOutput {
  codigo: string;
  nome: string;
  dias: number;
  nivelEstoque: NivelEstoque | null;
}

export interface SkuGrupoOutput {
  familia: string;
  skus: SkuCicloOutput[];
}

export interface DriverSugeridoOutput {
  id: string;
  tipo: string;
  produto: string;
  params: string;
  intensidade: number;
}

export interface DriversSugeridosOutput {
  itens: DriverSugeridoOutput[];
  total: number;
}

export interface ExecutarAnaliseOutput {
  id: string;
}

export interface DocumentarInteracaoInput {
  id: string;
  pergunta: string;
  resposta: string;
}

export interface ResponderChatInput {
  pergunta: string;
  ciclo: string;
  modelo: string;
}

export interface ResumoAnalisesOutput {
  total: number;
  salvas: number;
}
