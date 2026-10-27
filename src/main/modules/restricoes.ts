import { AtualizarRestricao } from '@application/restricoes/AtualizarRestricao';
import { ContarRestricoes } from '@application/restricoes/ContarRestricoes';
import { ListRestricoes } from '@application/restricoes/ListRestricoes';
import { RegistrarRestricao } from '@application/restricoes/RegistrarRestricao';
import { ResolverRestricao } from '@application/restricoes/ResolverRestricao';
import { ResumirRestricoes } from '@application/restricoes/ResumirRestricoes';
import type { RestricoesUseCases } from '@application/restricoes/restricoesUseCases';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { HttpRestricaoRepository } from '@infrastructure/restricoes/HttpRestricaoRepository';

export interface RestricoesModuleDeps {
  gerarId?: () => string;
  now?: () => Date;
}

export function createRestricoesModule(
  http: HttpClient,
  { gerarId = () => crypto.randomUUID(), now = () => new Date() }: RestricoesModuleDeps = {},
): RestricoesUseCases {
  const repository = new HttpRestricaoRepository(http);
  return {
    list: new ListRestricoes(repository),
    contar: new ContarRestricoes(repository),
    registrar: new RegistrarRestricao(repository, gerarId),
    atualizar: new AtualizarRestricao(repository),
    resolver: new ResolverRestricao(repository, now),
    resumo: new ResumirRestricoes(repository),
  };
}
