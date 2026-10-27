import {
  CICLO_RASCUNHO,
  CICLOS_PAGE_FIXTURE,
  CICLOS_RESUMO_FIXTURE,
  cicloRow,
} from '@test/fixtures/ciclos';
import { applyToggleToPage, applyToggleToResumo } from '../cicloOptimistic';

const RASCUNHO = cicloRow(CICLO_RASCUNHO);
const PAGE = { ...CICLOS_PAGE_FIXTURE, rows: [...CICLOS_PAGE_FIXTURE.rows, RASCUNHO] };

describe('applyToggleToPage', () => {
  it('desligar marca a linha como encerrada', () => {
    const next = applyToggleToPage(PAGE, { id: 'PLP-2026-07', ativo: false });
    expect(next.rows.map((row) => row.status)).toEqual([
      'encerrado',
      'encerrado',
      'encerrado',
      'rascunho',
    ]);
  });

  it('ligar ativa a linha e encerra o ativo anterior', () => {
    const next = applyToggleToPage(PAGE, { id: RASCUNHO.id, ativo: true });
    expect(next.rows.map((row) => row.status)).toEqual([
      'encerrado',
      'encerrado',
      'encerrado',
      'ativo',
    ]);
    expect(next.rows[1]).toBe(PAGE.rows[1]);
  });
});

describe('applyToggleToResumo', () => {
  it('desligar o ativo zera o ativo', () => {
    expect(
      applyToggleToResumo(CICLOS_RESUMO_FIXTURE, { id: 'PLP-2026-07', ativo: false }, undefined),
    ).toMatchObject({ ativo: null, ativos: 0 });
  });

  it('desligar outro ciclo não muda o resumo', () => {
    expect(applyToggleToResumo(CICLOS_RESUMO_FIXTURE, { id: 'x', ativo: false }, undefined)).toBe(
      CICLOS_RESUMO_FIXTURE,
    );
    const semAtivo = { ...CICLOS_RESUMO_FIXTURE, ativo: null, ativos: 0 };
    expect(applyToggleToResumo(semAtivo, { id: 'x', ativo: false }, undefined)).toBe(semAtivo);
  });

  it('ligar troca o ativo pela linha', () => {
    expect(
      applyToggleToResumo(CICLOS_RESUMO_FIXTURE, { id: RASCUNHO.id, ativo: true }, RASCUNHO),
    ).toMatchObject({
      ativos: 1,
      ativo: { id: RASCUNHO.id, codigo: 'PLP-2026-08', mesAno: 'Agosto 2026' },
    });
    const semAtivo = { ...CICLOS_RESUMO_FIXTURE, ativo: null, ativos: 0 };
    expect(applyToggleToResumo(semAtivo, { id: RASCUNHO.id, ativo: true }, RASCUNHO).ativos).toBe(
      1,
    );
  });

  it('ligar sem a linha em cache mantém o resumo', () => {
    expect(applyToggleToResumo(CICLOS_RESUMO_FIXTURE, { id: 'x', ativo: true }, undefined)).toBe(
      CICLOS_RESUMO_FIXTURE,
    );
  });
});
