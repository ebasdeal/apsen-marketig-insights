import type { Agente, AgentePatch } from '@domain/agentes/Agente';
import { LIMIAR_PADRAO } from '@domain/agentes/vocabulario';
import type { AgenteApiDto } from './agenteSchema';

export type AgentePatchDto = Omit<AgentePatch, 'ultimoTeste'> & {
  ultimo_teste?: Agente['ultimoTeste'];
};

export function toAgente(dto: AgenteApiDto): Agente {
  return {
    id: dto.id,
    codigo: dto.codigo ?? dto.id,
    papel: dto.papel,
    nome: dto.nome ?? '',
    fontes: dto.fontes,
    provedor: dto.provedor,
    endpoint: dto.endpoint,
    secret: dto.secret,
    vault: dto.vault,
    modelo: dto.modelo,
    schedule: dto.schedule,
    ambiente: dto.ambiente,
    ultimoTeste: { ...dto.ultimo_teste },
    ativo: dto.ativo,
    limiar: dto.limiar ?? LIMIAR_PADRAO,
  };
}

export function toAgentePatchDto({ ultimoTeste, ...rest }: AgentePatch): AgentePatchDto {
  return ultimoTeste === undefined ? rest : { ...rest, ultimo_teste: ultimoTeste };
}

export function toAgenteDto({ ultimoTeste, ...rest }: Agente): AgenteApiDto {
  return { ...rest, ultimo_teste: { ...ultimoTeste } };
}
