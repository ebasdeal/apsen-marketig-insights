import type { IdGenerator } from '@domain/shared/IdGenerator';
import { TipoValidationError } from '@domain/tipos/errors';
import type { CategoriaSlug, Tipo, TipoDraft } from '@domain/tipos/Tipo';
import type { TipoRepository } from '@domain/tipos/TipoRepository';
import {
  autoria,
  catLabelCurto,
  parseLag,
  primeiraMensagem,
  rowsToCampos,
  validateTipoDraft,
} from '@domain/tipos/tipoRules';
import { sincronizarCategorias } from './categoriaSync';
import type { SaveTipoInput, ToastDto } from './dto';

export const TIPO_SALVO = '✅ Tipo salvo!';

type TipoDados = Omit<Tipo, 'id' | 'slug'>;
type Autoria = Pick<Tipo, 'alteradoPor' | 'alteradoEm'>;

function dadosDoDraft(draft: TipoDraft, params: number, quem: Autoria): TipoDados {
  const cat = draft.cat as CategoriaSlug;
  return {
    label: draft.label.trim(),
    cat,
    catL: catLabelCurto(cat),
    dono: draft.dono.trim(),
    feature: draft.feature,
    lag: parseLag(draft.lag) ?? 0,
    params,
    ativo: draft.ativo,
    desc: draft.desc.trim(),
    impacto: draft.impacto,
    perm: draft.perm,
    nota: draft.nota.trim(),
    ...quem,
  };
}

export class SaveTipo {
  constructor(
    private readonly repository: TipoRepository,
    private readonly ids: IdGenerator,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute(input: SaveTipoInput): Promise<ToastDto> {
    if (input.modo === 'novo') {
      await this.criar(input.draft, autoria(input.por, this.clock()));
    } else {
      await this.editar(input.id, input.draft, autoria(input.por, this.clock()));
    }
    return { toast: TIPO_SALVO };
  }

  private async validar(draft: TipoDraft, modo: SaveTipoInput['modo']): Promise<void> {
    const slug = draft.slug.trim();
    const slugExiste =
      modo === 'novo' && slug !== '' && (await this.repository.findBySlug(slug)) !== null;
    const validation = validateTipoDraft(draft, { modo, slugExiste });
    const mensagem = primeiraMensagem(validation);
    if (mensagem !== null) {
      throw new TipoValidationError(validation, mensagem);
    }
  }

  private async criar(draft: TipoDraft, quem: Autoria): Promise<void> {
    await this.validar(draft, 'novo');
    const campos = rowsToCampos(draft.rows);
    const tipo: Tipo = {
      id: this.ids.next(),
      slug: draft.slug.trim(),
      ...dadosDoDraft(draft, campos.length, quem),
    };
    await this.repository.create(tipo);
    await this.repository.saveCampos(
      { id: tipo.id, title: tipo.label, layout: 'g2', campos },
      false,
    );
    await sincronizarCategorias(this.repository, await this.repository.listCategorias(), {
      slug: tipo.slug,
      label: tipo.label,
      catAnterior: null,
      catNova: tipo.cat,
    });
  }

  private async editar(id: string, draft: TipoDraft, quem: Autoria): Promise<void> {
    const [atual, camposAtuais] = await Promise.all([
      this.repository.get(id),
      this.repository.getCampos(id),
    ]);
    await this.validar(draft, 'editar');
    const campos = rowsToCampos(draft.rows);
    const dados = dadosDoDraft(draft, campos.length, quem);
    await this.repository.update(id, dados);
    await this.repository.saveCampos(
      { id, title: dados.label, layout: camposAtuais?.layout ?? 'g2', campos },
      camposAtuais !== null,
    );
    await sincronizarCategorias(this.repository, await this.repository.listCategorias(), {
      slug: atual.slug,
      label: dados.label,
      catAnterior: atual.cat,
      catNova: dados.cat,
    });
  }
}
