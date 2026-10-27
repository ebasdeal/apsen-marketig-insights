import type { AnalisesUseCases } from '@application/analises/analisesUseCases';
import { buildAnaliseDetail, buildListAnalisesOutput } from '../fixtures/analises';

export function createFakeAnalisesUseCases(
  overrides: Partial<AnalisesUseCases> = {},
): AnalisesUseCases {
  return {
    list: { execute: vi.fn().mockResolvedValue(buildListAnalisesOutput()) },
    contar: { execute: vi.fn().mockResolvedValue(2) },
    resumo: { execute: vi.fn().mockResolvedValue({ total: 2, salvas: 2 }) },
    get: { execute: vi.fn().mockResolvedValue(buildAnaliseDetail()) },
    opcoes: {
      execute: vi.fn().mockResolvedValue({
        ciclos: [{ value: 'PLP-2026-07', label: 'PLP-2026-07 · Julho 2026 (ativo)' }],
        cicloAtivoId: 'PLP-2026-07',
        modelosGuiados: [],
      }),
    },
    skusDoCiclo: { execute: vi.fn().mockResolvedValue([]) },
    driversSugeridos: { execute: vi.fn().mockResolvedValue({ itens: [], total: 0 }) },
    executar: { execute: vi.fn().mockResolvedValue({ id: 'nova-analise' }) },
    salvar: { execute: vi.fn().mockResolvedValue('salva') },
    exportarPdf: { execute: vi.fn().mockResolvedValue('relatorio') },
    documentarInteracao: { execute: vi.fn().mockResolvedValue([]) },
    responderChat: { execute: vi.fn().mockResolvedValue('Resposta da IA') },
    ...overrides,
  };
}
