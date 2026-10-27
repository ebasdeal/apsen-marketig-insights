import { PERFIS_DA_MATRIZ, type Permissao } from '@domain/permissoes/Permissao';
import type { PermissaoRepository } from '@domain/permissoes/PermissaoRepository';
import { agruparPermissoes, celula, type Celula } from '@domain/permissoes/permissaoRules';
import type { PerfilId } from '@domain/perfis/Perfil';

export interface PermissaoLinhaDto {
  id: string;
  funcionalidade: string;
  celulas: Record<PerfilId, Celula>;
}

export interface PermissoesMatrizDto {
  grupos: { grupo: string; linhas: PermissaoLinhaDto[] }[];
}

function toLinha(permissao: Permissao): PermissaoLinhaDto {
  const celulas = Object.fromEntries(
    PERFIS_DA_MATRIZ.map((perfil) => [perfil, celula(permissao[perfil])]),
  ) as Record<PerfilId, Celula>;
  return { id: permissao.id, funcionalidade: permissao.funcionalidade, celulas };
}

export class ListPermissoes {
  constructor(private readonly repository: PermissaoRepository) {}

  async execute(): Promise<PermissoesMatrizDto> {
    const grupos = agruparPermissoes(await this.repository.list());
    return {
      grupos: grupos.map(({ grupo, permissoes }) => ({ grupo, linhas: permissoes.map(toLinha) })),
    };
  }
}
