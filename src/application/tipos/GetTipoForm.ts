import type { CamposTipo, Tipo, TipoDraft } from '@domain/tipos/Tipo';
import type { TipoRepository } from '@domain/tipos/TipoRepository';
import { camposToRows, textoAlteracao } from '@domain/tipos/tipoRules';
import { FEATURE_TIPOS } from '@domain/tipos/vocabulario';
import type { TipoFormDto } from './dto';

export function tipoToDraft(tipo: Tipo, campos: CamposTipo | null): TipoDraft {
  return {
    slug: tipo.slug,
    label: tipo.label,
    cat: tipo.cat,
    dono: tipo.dono,
    desc: tipo.desc,
    feature: tipo.feature,
    lag: String(tipo.lag),
    impacto: tipo.impacto,
    perm: tipo.perm,
    nota: tipo.nota,
    ativo: tipo.ativo,
    rows: campos === null ? [] : camposToRows(campos.campos),
  };
}

export class GetTipoForm {
  constructor(private readonly repository: TipoRepository) {}

  async execute(id: string): Promise<TipoFormDto> {
    const [tipo, campos] = await Promise.all([
      this.repository.get(id),
      this.repository.getCampos(id),
    ]);
    const conhecida = FEATURE_TIPOS.some((opcao) => opcao.value === tipo.feature);
    return {
      draft: tipoToDraft(tipo, campos),
      campos,
      featureExtra: conhecida ? null : tipo.feature,
      alteracao: textoAlteracao(tipo),
    };
  }
}
