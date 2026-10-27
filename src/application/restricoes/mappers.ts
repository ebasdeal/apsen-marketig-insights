import type { Restricao } from '@domain/restricoes/Restricao';
import { SEVERIDADE_LABEL } from '@domain/restricoes/restricaoConstants';
import { formularioDe, resumoResolucao } from '@domain/restricoes/restricaoRules';
import type { RestricaoItemOutput } from './dto';

export function toRestricaoItemOutput(restricao: Restricao): RestricaoItemOutput {
  return {
    id: restricao.id,
    codigo: restricao.codigo,
    tipo: restricao.tipo,
    label: restricao.label,
    desc: restricao.desc,
    det: restricao.det,
    produto: restricao.produto,
    impacto: restricao.impacto,
    impCor: restricao.impCor,
    prazo: restricao.prazo,
    resp: restricao.resp,
    sev: restricao.sev,
    sevLabel: SEVERIDADE_LABEL[restricao.sev],
    status: restricao.status,
    resolucaoResumo: resumoResolucao(restricao),
    form: formularioDe(restricao),
  };
}
