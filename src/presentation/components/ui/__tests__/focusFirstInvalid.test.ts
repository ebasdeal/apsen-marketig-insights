import { focusFirstInvalid } from '../focusFirstInvalid';

function form(invalid: readonly boolean[]): HTMLElement {
  const container = document.createElement('form');
  invalid.forEach((flag, index) => {
    const input = document.createElement('input');
    input.name = `campo-${index}`;
    if (flag) input.setAttribute('aria-invalid', 'true');
    container.append(input);
  });
  document.body.append(container);
  return container;
}

describe('focusFirstInvalid', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('foca o primeiro campo inválido em ordem de DOM', () => {
    const container = form([false, true, true]);
    expect(focusFirstInvalid(container)).toBe(true);
    expect(document.activeElement).toBe(container.querySelector('[name="campo-1"]'));
  });

  it('devolve false sem inválidos ou sem contêiner', () => {
    expect(focusFirstInvalid(form([false, false]))).toBe(false);
    expect(focusFirstInvalid(null)).toBe(false);
  });
});
