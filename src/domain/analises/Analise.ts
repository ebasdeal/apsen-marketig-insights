export type AnaliseStatus = 'rascunho' | 'salva' | 'relatorio';

export interface DriverImpacto {
  id: string;
  tipo: string;
  impacto: number;
  dir: 'up' | 'down';
  conf: number;
}

export interface InteracaoIa {
  pergunta: string;
  resposta: string;
  ts: string | null;
}

export type ModoModelo = 'auto' | 'guiado' | 'avancado';

export interface ConfigModelo {
  modo: ModoModelo;
  modelo?: string;
  horizonte?: number;
  parametros?: Record<string, number | boolean>;
}

export interface Analise {
  id: string;
  codigo: string;
  titulo: string;
  ciclo: string;
  tipo: string;
  skus: string[];
  modelo: string;
  status: AnaliseStatus;
  criada: string;
  comentarios: string;
  drivers: string[];
  configModelo: ConfigModelo | null;
  sumario: string;
  driversImpacto: DriverImpacto[];
  justificativas: string[];
  modeloInfo: string;
  historicoIa: InteracaoIa[];
  salvoEm: string | null;
}

export type AnalisePatch = Partial<Pick<Analise, 'status' | 'salvoEm' | 'historicoIa'>>;

export interface SkuCiclo {
  codigo: string;
  nome: string;
  familia: string;
  dias: number;
}

export interface ModeloGuiado {
  id: string;
  nome: string;
  icon: string;
  desc: string;
  tag: string;
}

export interface ResultadoMock {
  modelo: string;
  sumario: string;
  driversImpacto: DriverImpacto[];
  justificativas: string[];
  modeloInfo: string;
}

export interface RegraChat {
  gatilhos: string[];
  resposta: string;
}

export interface MensagemChat {
  papel: 'usuario' | 'ia';
  texto: string;
}

export interface NovaAnaliseForm {
  titulo: string;
  ciclo: string;
  tipo: string;
  comentarios: string;
  skus: string[];
  drivers: string[];
  configModelo: ConfigModelo;
  horizonteTexto: string;
}

export interface CicloResumo {
  id: string;
  descricao: string;
  status: string;
}

export interface DriverAprovado {
  id: string;
  tipo: string;
  produto: string;
  params: string;
  intensidade: number;
}

export interface LinhaComparacao {
  mes: string;
  sem: number;
  com: number;
  deltaUn: number;
  deltaPct: number | null;
}

export interface FaixaIncerteza {
  min: number;
  max: number;
}

export interface Incerteza {
  nivel: number;
  linhas: FaixaIncerteza[];
  total: FaixaIncerteza;
}

export interface Comparacao {
  linhas: LinhaComparacao[];
  total: Omit<LinhaComparacao, 'mes'>;
  incerteza: Incerteza;
}

export interface SegmentoTexto {
  texto: string;
  forte: boolean;
}

export type NivelEstoque = 'critico' | 'atencao' | 'ok';
