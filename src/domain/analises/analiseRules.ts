import type {
  Analise,
  AnaliseStatus,
  CicloResumo,
  ConfigModelo,
  NivelEstoque,
  NovaAnaliseForm,
  ResultadoMock,
  SegmentoTexto,
  SkuCiclo,
} from './Analise';
import { dataBr } from './analiseDatas';
import { HORIZONTE_MAX, HORIZONTE_MIN, TIPO_ANALISE_PADRAO } from './analiseConstants';
import { AnaliseInvalidaError } from './AnaliseInvalidaError';

const CODIGO_ANALISE = /^ANL-(\d+)$/;

export function proximoCodigoAnalise(maiorCodigo: string | null): string {
  const match = maiorCodigo === null ? null : CODIGO_ANALISE.exec(maiorCodigo);
  const atual = match === null ? 0 : Number(match[1]);
  return `ANL-${String(atual + 1).padStart(3, '0')}`;
}

function horizonteValido(texto: string): boolean {
  const valor = Number(texto);
  return (
    texto.trim() !== '' &&
    Number.isInteger(valor) &&
    valor >= HORIZONTE_MIN &&
    valor <= HORIZONTE_MAX
  );
}

export function validarNovaAnalise(form: NovaAnaliseForm): void {
  if (form.titulo.trim() === '') {
    throw new AnaliseInvalidaError('⚠️ Informe o título.', 'titulo');
  }
  if (form.ciclo === '') {
    throw new AnaliseInvalidaError('⚠️ Selecione o ciclo.', 'ciclo');
  }
  if (form.skus.length === 0) {
    throw new AnaliseInvalidaError('⚠️ Selecione ao menos um SKU.', 'skus');
  }
  if (form.configModelo.modo === 'avancado' && !horizonteValido(form.horizonteTexto)) {
    throw new AnaliseInvalidaError('⚠️ Informe um horizonte entre 1 e 24 meses.', 'horizonte');
  }
}

function configDoForm(form: NovaAnaliseForm): ConfigModelo {
  if (form.configModelo.modo !== 'avancado') {
    return form.configModelo;
  }
  return { ...form.configModelo, horizonte: Number(form.horizonteTexto) };
}

export function novaAnalise(
  form: NovaAnaliseForm,
  resultado: ResultadoMock,
  id: string,
  codigo: string,
  hoje: Date,
): Analise {
  return {
    id,
    codigo,
    titulo: form.titulo.trim(),
    ciclo: form.ciclo,
    tipo: form.tipo === '' ? TIPO_ANALISE_PADRAO : form.tipo,
    skus: [...form.skus],
    modelo: resultado.modelo,
    status: 'rascunho',
    criada: dataBr(hoje),
    comentarios: form.comentarios,
    drivers: [...form.drivers],
    configModelo: configDoForm(form),
    sumario: resultado.sumario,
    driversImpacto: resultado.driversImpacto.map((driver) => ({ ...driver })),
    justificativas: [...resultado.justificativas],
    modeloInfo: resultado.modeloInfo,
    historicoIa: [],
    salvoEm: null,
  };
}

export function statusAoSalvar(status: AnaliseStatus): AnaliseStatus {
  return status === 'relatorio' ? 'relatorio' : 'salva';
}

export function podeExportarPdf(status: AnaliseStatus): boolean {
  return status !== 'rascunho';
}

export function exportarPdf(status: AnaliseStatus): AnaliseStatus {
  if (!podeExportarPdf(status)) {
    throw new AnaliseInvalidaError('⚠️ Salve antes de emitir o relatório.');
  }
  return 'relatorio';
}

export interface GrupoFamilia<T extends SkuCiclo> {
  familia: string;
  skus: T[];
}

export function agruparPorFamilia<T extends SkuCiclo>(skus: readonly T[]): GrupoFamilia<T>[] {
  const grupos = new Map<string, T[]>();
  skus.forEach((sku) => {
    const grupo = grupos.get(sku.familia) ?? [];
    grupo.push(sku);
    grupos.set(sku.familia, grupo);
  });
  return Array.from(grupos, ([familia, itens]) => ({ familia, skus: itens }));
}

export function nivelEstoque(dias: number): NivelEstoque | null {
  if (dias === 0) {
    return null;
  }
  if (dias < 30) {
    return 'critico';
  }
  return dias < 60 ? 'atencao' : 'ok';
}

export function cicloAtivo(ciclos: readonly CicloResumo[]): CicloResumo | null {
  return ciclos.find((ciclo) => ciclo.status === 'ativo') ?? null;
}

export function rotuloCiclo(
  ciclo: Pick<CicloResumo, 'id' | 'descricao'>,
  ativoId: string | null,
): string {
  const descricao = ciclo.descricao.replace(/^Planejamento /, '');
  const sufixo = ciclo.id === ativoId ? ' (ativo)' : '';
  return `${ciclo.id} · ${descricao}${sufixo}`;
}

export function larguraBarraImpacto(impacto: number): number {
  return Math.min(Math.abs(impacto) * 5, 120);
}

function semTags(texto: string): string {
  return texto.replace(/<[^>]*>/g, '');
}

export function segmentosRichText(html: string): SegmentoTexto[] {
  return html
    .split(/<strong>([\s\S]*?)<\/strong>/i)
    .map((parte, index) => ({ texto: semTags(parte), forte: index % 2 === 1 }))
    .filter((segmento) => segmento.texto !== '');
}
