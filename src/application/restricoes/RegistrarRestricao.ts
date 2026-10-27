import type { RestricaoForm } from '@domain/restricoes/Restricao';
import type { RestricaoRepository } from '@domain/restricoes/RestricaoRepository';
import {
  novaRestricao,
  proximoCodigoRestricao,
  validarRestricao,
} from '@domain/restricoes/restricaoRules';
import type { RestricaoRegistradaOutput } from './dto';

export class RegistrarRestricao {
  constructor(
    private readonly repository: RestricaoRepository,
    private readonly gerarId: () => string,
  ) {}

  async execute(form: RestricaoForm): Promise<RestricaoRegistradaOutput> {
    validarRestricao(form);
    const codigo = proximoCodigoRestricao(await this.repository.maiorCodigo());
    const criada = await this.repository.create(novaRestricao(form, this.gerarId(), codigo));
    return { id: criada.id, codigo: criada.codigo };
  }
}
