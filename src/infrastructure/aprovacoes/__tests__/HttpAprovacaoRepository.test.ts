import { FILTRO_VAZIO } from '@domain/aprovacoes/Aprovacao';
import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { APROVACOES, APROVACOES_API } from '@test/fixtures/aprovacoes';
import { HttpAprovacaoRepository } from '../HttpAprovacaoRepository';

const BASE = 'http://localhost:3001';

describe('HttpAprovacaoRepository', () => {
  it('listPage ordena por id desc e envia só os filtros preenchidos', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/aprovacoes': { body: APROVACOES_API.slice(0, 5), headers: { 'X-Total-Count': '14' } },
    });
    const repository = new HttpAprovacaoRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
    const result = await repository.listPage(
      {
        q: ' bari ',
        ini: '2026-01-01',
        fim: '2026-06-30',
        tipo: '📺 TV Aberta',
        status: 'pendente',
      },
      { page: 2, size: 5 },
    );
    expect(result).toEqual({ items: APROVACOES.slice(0, 5), total: 14, page: 2, limit: 5 });
    const url = new URL(calls[0]!.url);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      _page: '2',
      _limit: '5',
      _sort: 'id',
      _order: 'desc',
      q: 'bari',
      data_reg_gte: '2026-01-01',
      data_reg_lte: '2026-06-30',
      tipo: '📺 TV Aberta',
      status: 'pendente',
    });
    await repository.listPage(FILTRO_VAZIO, { page: 1, size: 5 });
    expect(calls[1]?.url).toBe(`${BASE}/aprovacoes?_page=1&_limit=5&_sort=id&_order=desc`);
  });

  it('countPendentes com e sem filtro', async () => {
    const http = createFakeHttpClient({ getPage: async () => ({ data: [], total: 2 }) });
    const repository = new HttpAprovacaoRepository(http);
    await expect(repository.countPendentes()).resolves.toBe(2);
    expect(http.getPage).toHaveBeenCalledWith('/aprovacoes', {
      query: { status: 'pendente', _page: '1', _limit: '1' },
    });
    await repository.countPendentes({ ...FILTRO_VAZIO, q: 'x', status: 'pendente' });
    expect(http.getPage).toHaveBeenLastCalledWith('/aprovacoes', {
      query: { q: 'x', status: 'pendente', _page: '1', _limit: '1' },
    });
  });

  it('listEmUso lê APROV_INGERIDOS de /config', async () => {
    const http = createFakeHttpClient({
      get: async () => ({ id: 1, APROV_INGERIDOS: ['DRV-2026-032'], outro: true }),
    });
    await expect(new HttpAprovacaoRepository(http).listEmUso()).resolves.toEqual(['DRV-2026-032']);
    expect(http.get).toHaveBeenCalledWith('/config');
  });

  it('intensidade fora de 1..5 → InvalidResponseError', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: [{ ...APROVACOES_API[0], intensidade: 7 }], total: 1 }),
    });
    await expect(
      new HttpAprovacaoRepository(http).listPage(FILTRO_VAZIO, { page: 1, size: 5 }),
    ).rejects.toEqual(
      new InvalidResponseError('Resposta de /aprovacoes fora do contrato: 0.intensidade'),
    );
  });

  it('justificativa ausente vira texto vazio', () => {
    expect(APROVACOES[0]?.justificativaRejeicao).toBe('');
    expect(APROVACOES.find((a) => a.id === 'DRV-2026-028')?.motivoRejeicao).toMatch(/^Período/);
  });

  it('update envia os nomes do db.json; 404 → NotFoundError; 500 propaga', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/aprovacoes/DRV-2026-034': { body: {} },
      '/aprovacoes/DRV-2026-001': { status: 500, body: {} },
    });
    const repository = new HttpAprovacaoRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
    await repository.update('DRV-2026-034', {
      status: 'rejeitado',
      motivoRejeicao: 'Outro',
      justificativaRejeicao: 'x',
    });
    expect(calls[0]?.init?.method).toBe('PATCH');
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      status: 'rejeitado',
      motivo_rejeicao: 'Outro',
      justificativa_rejeicao: 'x',
    });
    await repository.update('DRV-2026-034', { status: 'aprovado' });
    expect(JSON.parse(String(calls[1]?.init?.body))).toEqual({ status: 'aprovado' });
    await expect(repository.update('DRV-9', { status: 'aprovado' })).rejects.toEqual(
      new NotFoundError('Aprovação', 'DRV-9'),
    );
    await expect(repository.update('DRV-2026-001', { status: 'aprovado' })).rejects.toBeInstanceOf(
      HttpError,
    );
  });
});

describe('HttpAprovacaoRepository — registro de driver', () => {
  it('maiorId devolve o id mais alto ou null; create faz POST do DTO com autoria', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/aprovacoes': { body: APROVACOES_API.slice(0, 1), headers: { 'X-Total-Count': '14' } },
    });
    const repository = new HttpAprovacaoRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
    await expect(repository.maiorId()).resolves.toBe(APROVACOES[0]?.id);
    const vazio = createFakeFetch({
      '/aprovacoes': { body: [], headers: { 'X-Total-Count': '0' } },
    });
    await expect(
      new HttpAprovacaoRepository(
        new FetchHttpClient({ baseUrl: BASE, fetchFn: vazio.fetchFn }),
      ).maiorId(),
    ).resolves.toBeNull();
    await repository.create({
      ...APROVACOES[0]!,
      status: 'aprovado',
      decisao: { tipo: 'aprovado', por: 'Ana', em: '2026-10-28T10:00:00.000Z' },
    });
    const post = calls.find((call) => call.init?.method === 'POST');
    expect(JSON.parse(String(post?.init?.body))).toMatchObject({
      status: 'aprovado',
      data_reg: APROVACOES[0]?.dataReg,
      aprovado_por: 'Ana',
    });
  });
});

describe('HttpAprovacaoRepository: remoção por driver', () => {
  it('apaga cada aprovação ligada ao driver e ignora 404', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({
        data: [
          { ...APROVACOES_API[0]!, driver_id: '9' },
          { ...APROVACOES_API[1]!, driver_id: '9' },
        ],
        total: 2,
      }),
      delete: vi
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new HttpError(404, '/aprovacoes/x', null)),
    });
    await new HttpAprovacaoRepository(http).removerPorDriver('9');
    expect(http.getPage).toHaveBeenCalledWith('/aprovacoes', {
      query: { driver_id: '9', _page: '1', _limit: '100' },
    });
    expect(http.delete).toHaveBeenCalledTimes(2);
  });
});
