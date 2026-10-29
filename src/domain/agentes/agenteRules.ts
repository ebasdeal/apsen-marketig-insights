import type { Agente, AgenteDraft } from './Agente';
import { AGENTE_MODELOS, AGENTE_PAPEIS, LIMIAR_PADRAO, SCHEDULE_PADRAO } from './vocabulario';

export type AgenteCampo =
  'papelOpcao' | 'nome' | 'provedor' | 'ambiente' | 'endpoint' | 'vault' | 'secret' | 'modelo';

export type AgenteErros = Partial<Record<AgenteCampo, string>>;

export type AmbienteTone = 'red' | 'yellow' | 'green';

export interface ProximaExecucao {
  nome: string;
  hora: string;
}

export const AGENTE_MENSAGENS: Record<AgenteCampo, string> = {
  papelOpcao: '⚠️ Selecione o papel do agente.',
  nome: '⚠️ Informe o nome de exibição.',
  provedor: '⚠️ Selecione o provedor.',
  ambiente: '⚠️ Selecione o ambiente.',
  endpoint: '⚠️ Informe um endpoint https:// válido.',
  vault: '⚠️ Informe a Key Vault URI.',
  secret: '⚠️ Informe o Secret Name.',
  modelo: '⚠️ Selecione o modelo padrão.',
};

const SEPARADOR_OPCAO = ' — ';
const AMBIENTE_DEV = 'Dev';
const AMBIENTE_DESENVOLVIMENTO = 'Desenvolvimento';
const AMBIENTE_TONES: Readonly<Record<string, AmbienteTone>> = {
  Produção: 'red',
  Homologação: 'yellow',
};
const DIARIO = /^Diário · (\d{2}h\d{2})$/;
const CODIGO = /^AG-(\d+)$/;
const HTTPS = /^https:\/\/\S+$/;

export function papelCurto(papel: string): string {
  return papel.split(' ').slice(0, 2).join(' ');
}

export function papelDaOpcao(opcao: string): string {
  return opcao.split(SEPARADOR_OPCAO, 1).join('');
}

export function opcaoDoPapel(papel: string): string {
  return AGENTE_PAPEIS.find((opcao) => papelDaOpcao(opcao) === papel) ?? '';
}

export function ambienteDoSelect(ambiente: string): string {
  return ambiente === AMBIENTE_DEV ? AMBIENTE_DESENVOLVIMENTO : ambiente;
}

export function ambienteTone(ambiente: string): AmbienteTone {
  return AMBIENTE_TONES[ambiente] ?? 'green';
}

export function ambientePillLabel(ambiente: string): string {
  return AMBIENTE_TONES[ambiente] === undefined ? AMBIENTE_DEV : ambiente;
}

export function resumoAgentes(total: number, ativos: number): string {
  return `${total} agentes cadastrados · ${ativos} ativos`;
}

export function proximaExecucao(
  agentes: readonly Pick<Agente, 'papel' | 'schedule' | 'ativo'>[],
): ProximaExecucao | null {
  return agentes.reduce<ProximaExecucao | null>((melhor, agente) => {
    const hora = agente.ativo ? DIARIO.exec(agente.schedule)?.[1] : undefined;
    if (hora === undefined || (melhor !== null && melhor.hora <= hora)) {
      return melhor;
    }
    return { nome: agente.papel.split(' ').slice(1).join(' '), hora };
  }, null);
}

export function alertaAgentes(total: number, ativos: number, proxima: ProximaExecucao | null) {
  const resumo = resumoAgentes(total, ativos);
  return proxima === null
    ? `${resumo} — nenhuma execução agendada`
    : `${resumo} — próxima execução: ${proxima.nome} em ${proxima.hora}`;
}

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatTs(date: Date): string {
  const dia = [date.getDate(), date.getMonth() + 1].map(doisDigitos).join('/');
  const hora = [date.getHours(), date.getMinutes()].map(doisDigitos).join(':');
  return `${dia}/${date.getFullYear()} ${hora}`;
}

export function nextAgenteCodigo(codigos: readonly string[]): string {
  const maior = codigos.reduce((max, codigo) => {
    const numero = Number(CODIGO.exec(codigo)?.[1] ?? 0);
    return Math.max(max, numero);
  }, 0);
  return `AG-${String(maior + 1).padStart(3, '0')}`;
}

function vazio(valor: string): boolean {
  return valor.trim() === '';
}

export function validateAgenteDraft(draft: AgenteDraft): AgenteErros {
  const invalidos: Record<AgenteCampo, boolean> = {
    papelOpcao: vazio(draft.papelOpcao),
    nome: vazio(draft.nome),
    provedor: draft.provedor === '',
    ambiente: vazio(draft.ambiente),
    endpoint: !HTTPS.test(draft.endpoint.trim()),
    vault: vazio(draft.vault),
    secret: vazio(draft.secret),
    modelo: vazio(draft.modelo),
  };
  return Object.fromEntries(
    (Object.keys(AGENTE_MENSAGENS) as AgenteCampo[])
      .filter((campo) => invalidos[campo])
      .map((campo) => [campo, AGENTE_MENSAGENS[campo]]),
  );
}

export function optionsComExtra(lista: readonly string[], atual: string): string[] {
  return atual.trim() === '' || lista.includes(atual) ? [...lista] : [...lista, atual];
}

export function modelosConhecidos(): string[] {
  return AGENTE_MODELOS.flatMap((grupo) => [...grupo.options]);
}

export function novoAgenteDraft(): AgenteDraft {
  return {
    papelOpcao: '',
    nome: '',
    provedor: '',
    ambiente: '',
    endpoint: '',
    vault: '',
    secret: '',
    modelo: '',
    schedule: SCHEDULE_PADRAO,
    fontes: '',
    limiar: LIMIAR_PADRAO,
    ativo: false,
  };
}
