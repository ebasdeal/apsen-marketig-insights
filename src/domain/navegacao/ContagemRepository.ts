export interface ContagemRepository {
  contar(colecao: string, filtro?: Readonly<Record<string, string>>): Promise<number>;
}
