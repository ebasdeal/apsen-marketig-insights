import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState, type ReactNode } from 'react';
import { focusableElements, useFocusTrap } from '../useFocusTrap';

function Trap({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = useFocusTrap(ref, onClose);
  return (
    <div ref={ref} role="group" aria-label="Armadilha" tabIndex={-1} onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}

describe('focusableElements', () => {
  it('ignora controles desabilitados e tabindex -1', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <a href="#a">link</a><a>sem href</a>
      <button>ok</button><button disabled>off</button>
      <input /><input disabled />
      <select></select><textarea disabled></textarea>
      <span tabindex="0">foco</span><span tabindex="-1">fora</span>`;
    expect(focusableElements(container).map((element) => element.tagName)).toEqual([
      'A',
      'BUTTON',
      'INPUT',
      'SELECT',
      'SPAN',
    ]);
  });
});

describe('useFocusTrap', () => {
  it('mantém o foco no contêiner sem focáveis e fecha com Esc', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Trap onClose={onClose}>
        <p>Sem focáveis</p>
      </Trap>,
    );
    const group = screen.getByRole('group', { name: 'Armadilha' });
    group.focus();
    await user.tab();
    expect(group).toHaveFocus();
    await user.keyboard('a');
    expect(onClose).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não devolve o foco a um elemento que saiu do documento', async () => {
    const user = userEvent.setup();
    function Host() {
      const [step, setStep] = useState<'opener' | 'trap' | 'done'>('opener');
      return (
        <>
          {step === 'opener' ? (
            <button type="button" onClick={() => setStep('trap')}>
              Abrir
            </button>
          ) : null}
          {step === 'trap' ? (
            <Trap onClose={() => setStep('done')}>
              <button type="button">Dentro</button>
            </Trap>
          ) : null}
        </>
      );
    }
    render(<Host />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(screen.getByRole('button', { name: 'Dentro' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(document.body).toHaveFocus();
  });
});
