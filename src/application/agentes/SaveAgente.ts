import {
  TESTE_PENDENTE,
  type AgenteDraft,
  type AgentePatch,
  type Provedor,
} from '@domain/agentes/Agente';
import type { AgenteRepository } from '@domain/agentes/AgenteRepository';
import { nextAgenteCodigo, papelDaOpcao, validateAgenteDraft } from '@domain/agentes/agenteRules';
import { AgenteValidationError } from '@domain/agentes/errors';
import { AGENTE_SALVO_TOAST, type AgenteToastDto, type SaveAgenteInput } from './dto';

type CamposAgente = Required<Omit<AgentePatch, 'ultimoTeste'>>;

function campos(draft: AgenteDraft): CamposAgente {
  return {
    papel: papelDaOpcao(draft.papelOpcao),
    nome: draft.nome.trim(),
    provedor: draft.provedor as Provedor,
    ambiente: draft.ambiente,
    endpoint: draft.endpoint.trim(),
    vault: draft.vault.trim(),
    secret: draft.secret.trim(),
    modelo: draft.modelo,
    schedule: draft.schedule,
    fontes: draft.fontes.trim(),
    limiar: draft.limiar,
    ativo: draft.ativo,
  };
}

export class SaveAgente {
  constructor(
    private readonly repository: AgenteRepository,
    private readonly newId: () => string,
  ) {}

  async execute({ id, draft }: SaveAgenteInput): Promise<AgenteToastDto> {
    const erros = validateAgenteDraft(draft);
    if (Object.keys(erros).length > 0) {
      throw new AgenteValidationError(erros);
    }
    if (id === undefined) {
      const codigo = nextAgenteCodigo(await this.repository.listCodigos());
      await this.repository.create({
        id: this.newId(),
        codigo,
        ...campos(draft),
        ultimoTeste: { ...TESTE_PENDENTE },
      });
    } else {
      await this.repository.update(id, campos(draft));
    }
    return { toast: AGENTE_SALVO_TOAST };
  }
}
