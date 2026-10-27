import type { AnalisesUseCases } from '@application/analises/analisesUseCases';
import { ContarAnalises } from '@application/analises/ContarAnalises';
import { DocumentarInteracao } from '@application/analises/DocumentarInteracao';
import type { Esperar } from '@application/analises/dto';
import { ExecutarAnalise } from '@application/analises/ExecutarAnalise';
import { ExportarPdfAnalise } from '@application/analises/ExportarPdfAnalise';
import { GetAnalise } from '@application/analises/GetAnalise';
import { GetNovaAnaliseOpcoes } from '@application/analises/GetNovaAnaliseOpcoes';
import { GetResumoAnalises } from '@application/analises/GetResumoAnalises';
import { ListAnalises } from '@application/analises/ListAnalises';
import { ListDriversSugeridos } from '@application/analises/ListDriversSugeridos';
import { ListSkusDoCiclo } from '@application/analises/ListSkusDoCiclo';
import { ResponderChat } from '@application/analises/ResponderChat';
import { SalvarAnalise } from '@application/analises/SalvarAnalise';
import { HttpAnaliseApoioRepository } from '@infrastructure/analises/HttpAnaliseApoioRepository';
import { HttpAnaliseFontesRepository } from '@infrastructure/analises/HttpAnaliseFontesRepository';
import { HttpAnaliseRepository } from '@infrastructure/analises/HttpAnaliseRepository';
import type { HttpClient } from '@infrastructure/http/HttpClient';

export interface AnalisesModuleDeps {
  now: () => Date;
  gerarId: () => string;
  esperar: Esperar;
}

export const esperarMs: Esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_DEPS: AnalisesModuleDeps = {
  now: () => new Date(),
  gerarId: () => crypto.randomUUID(),
  esperar: esperarMs,
};

export function createAnalisesModule(
  http: HttpClient,
  overrides: Partial<AnalisesModuleDeps> = {},
): AnalisesUseCases {
  const { now, gerarId, esperar } = { ...DEFAULT_DEPS, ...overrides };
  const repository = new HttpAnaliseRepository(http);
  const apoio = new HttpAnaliseApoioRepository(http);
  const fontes = new HttpAnaliseFontesRepository(http);
  return {
    list: new ListAnalises(repository),
    contar: new ContarAnalises(repository),
    resumo: new GetResumoAnalises(repository),
    get: new GetAnalise(repository),
    opcoes: new GetNovaAnaliseOpcoes(fontes, apoio),
    skusDoCiclo: new ListSkusDoCiclo(apoio),
    driversSugeridos: new ListDriversSugeridos(fontes),
    executar: new ExecutarAnalise(repository, apoio, now, gerarId, esperar),
    salvar: new SalvarAnalise(repository, now),
    exportarPdf: new ExportarPdfAnalise(repository),
    documentarInteracao: new DocumentarInteracao(repository, now),
    responderChat: new ResponderChat(apoio, esperar),
  };
}
