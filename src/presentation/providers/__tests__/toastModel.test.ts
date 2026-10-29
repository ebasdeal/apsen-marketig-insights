import {
  MAX_TOASTS,
  TOAST_TITLES,
  durationOf,
  parseToast,
  pushToast,
  type ToastItem,
} from '../toastModel';

describe('parseToast', () => {
  it.each([
    ['✅ Ciclo criado!', 'success', 'Ciclo criado!'],
    ['❌ Falha ao salvar.', 'error', 'Falha ao salvar.'],
    ['⚠️ Preencha os campos.', 'warning', 'Preencha os campos.'],
    ['⚠ Atenção simples', 'warning', 'Atenção simples'],
    ['📋 Copiado.', 'info', '📋 Copiado.'],
    ['Texto sem prefixo', 'info', 'Texto sem prefixo'],
  ] as const)('%s → %s', (raw, tone, message) => {
    expect(parseToast(raw)).toEqual({ tone, message });
  });

  it('tom explícito vence o prefixo', () => {
    expect(parseToast('✅ ok', 'error')).toEqual({ tone: 'error', message: 'ok' });
    expect(parseToast('nada', 'warning')).toEqual({ tone: 'warning', message: 'nada' });
  });
});

describe('durationOf e títulos', () => {
  it('erro dura 6 s e os demais 4 s', () => {
    expect(durationOf('error')).toBe(6000);
    expect(durationOf('success')).toBe(4000);
    expect(durationOf('info')).toBe(4000);
    expect(TOAST_TITLES).toEqual({
      success: 'Tudo certo',
      error: 'Não foi possível concluir',
      warning: 'Atenção',
      info: 'Aviso',
    });
  });
});

describe('pushToast', () => {
  const add = (items: ToastItem[], message: string, id: number) =>
    pushToast(items, { tone: 'info', message }, id);

  it('mais novo no topo e no máximo 3', () => {
    let items: ToastItem[] = [];
    [1, 2, 3, 4].forEach((id) => {
      items = add(items, `m${id}`, id);
    });
    expect(items.map((item) => item.id)).toEqual([4, 3, 2]);
    expect(MAX_TOASTS).toBe(3);
  });

  it('mensagem idêntica visível reinicia em vez de duplicar', () => {
    const first = add([], 'igual', 1);
    const again = add(first, 'igual', 2);
    expect(again).toHaveLength(1);
    expect(again[0]).toMatchObject({ id: 1, version: 1 });
    const leaving = [{ ...(again[0] as ToastItem), leaving: true }];
    expect(add(leaving, 'igual', 3)).toHaveLength(2);
  });
});
