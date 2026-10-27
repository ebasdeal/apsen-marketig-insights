import type { InteracaoIa, MensagemChat, RegraChat } from './Analise';

export interface ContextoChat {
  ciclo: string;
  modelo: string;
}

export function regraPadrao(regras: readonly RegraChat[]): RegraChat | undefined {
  return regras.find((regra) => regra.gatilhos.length === 0);
}

export function responderChat(
  pergunta: string,
  regras: readonly RegraChat[],
  contexto: ContextoChat,
): string {
  const texto = pergunta.toLowerCase();
  const regra =
    regras.find((candidata) => candidata.gatilhos.some((gatilho) => texto.includes(gatilho))) ??
    regraPadrao(regras);
  return (regra?.resposta ?? '')
    .replaceAll('{ciclo}', contexto.ciclo)
    .replaceAll('{modelo}', contexto.modelo);
}

function ultimaDo(mensagens: readonly MensagemChat[], papel: MensagemChat['papel']) {
  return mensagens.findLast((mensagem) => mensagem.papel === papel);
}

export function ultimaInteracao(
  mensagens: readonly MensagemChat[],
): { pergunta: string; resposta: string } | null {
  const pergunta = ultimaDo(mensagens, 'usuario');
  const resposta = ultimaDo(mensagens, 'ia');
  if (pergunta === undefined || resposta === undefined) {
    return null;
  }
  return { pergunta: pergunta.texto, resposta: resposta.texto };
}

export function mensagensDoHistorico(historico: readonly InteracaoIa[]): MensagemChat[] {
  return historico.flatMap((item) => [
    { papel: 'usuario' as const, texto: item.pergunta },
    { papel: 'ia' as const, texto: item.resposta },
  ]);
}
