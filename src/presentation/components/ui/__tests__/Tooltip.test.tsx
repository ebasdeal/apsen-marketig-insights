import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../Tooltip';

function renderTooltip() {
  return render(
    <>
      <button type="button">Antes</button>
      <Tooltip label="Ajuda sobre verba">
        <strong>Verba.</strong> Valor investido no período.
      </Tooltip>
      <button type="button">Depois</button>
    </>,
  );
}

describe('Tooltip', () => {
  it('mostra o balão com o mouse e esconde ao sair', async () => {
    const user = userEvent.setup();
    renderTooltip();
    const trigger = screen.getByRole('button', { name: 'Ajuda sobre verba' });
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.hover(trigger);
    const tip = screen.getByRole('tooltip');
    expect(tip).toBeVisible();
    expect(tip).toHaveClass(
      'bg-apsen-tip-bg',
      'text-apsen-tip-fg',
      'w-max',
      'max-w-[320px]',
      'fixed',
      'z-[9000]',
      'shadow-apsen-tip',
    );
    await user.unhover(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('abre no foco, fecha com Esc e ao sair, e descreve o botão mesmo fechado', async () => {
    const user = userEvent.setup();
    renderTooltip();
    const trigger = screen.getByRole('button', { name: 'Ajuda sobre verba' });
    expect(trigger).toHaveAccessibleDescription('Verba. Valor investido no período.');
    expect(trigger).toHaveClass('cursor-help', 'focus-ring');
    screen.getByRole('button', { name: 'Antes' }).focus();
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('tooltip')).toBeVisible();
    await user.keyboard('a');
    expect(screen.getByRole('tooltip')).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.tab({ shift: true });
    await user.tab();
    expect(screen.getByRole('tooltip')).toBeVisible();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Depois' })).toHaveFocus();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('renderiza o balão em um portal no body, fora de containers com overflow', () => {
    const { container } = render(
      <div style={{ overflow: 'auto' }}>
        <Tooltip label="Ajuda">Texto</Tooltip>
      </div>,
    );
    const tip = screen.getByRole('tooltip', { hidden: true });
    expect(container).not.toContainElement(tip);
    expect(tip.parentElement).toBe(document.body);
  });

  describe('posicionamento', () => {
    const originalWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    const originalHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');

    beforeEach(() => {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        get: () => 300,
      });
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get: () => 100,
      });
      Object.defineProperty(document.documentElement, 'clientWidth', {
        configurable: true,
        get: () => 1000,
      });
      Object.defineProperty(document.documentElement, 'clientHeight', {
        configurable: true,
        get: () => 600,
      });
    });

    afterEach(() => {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalWidth!);
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalHeight!);
      Reflect.deleteProperty(document.documentElement, 'clientWidth');
      Reflect.deleteProperty(document.documentElement, 'clientHeight');
      document.getElementById('app-sidebar')?.remove();
    });

    function anchorAt(rect: Partial<DOMRect>) {
      const trigger = screen.getByRole('button', { name: 'Ajuda sobre verba' });
      trigger.getBoundingClientRect = () =>
        ({ left: 0, top: 0, right: 0, bottom: 0, width: 14, height: 14, ...rect }) as DOMRect;
      return trigger;
    }

    it('abre abaixo e centralizado quando cabe', async () => {
      renderTooltip();
      const trigger = anchorAt({ left: 493, right: 507, top: 200, bottom: 214 });
      await userEvent.hover(trigger);
      const tip = screen.getByRole('tooltip');
      expect(tip.style.transform).toBe('translate(350px, 222px)');
      expect(tip.lastElementChild).toHaveAttribute('data-placement', 'below');
    });

    it('vira para cima quando falta espaço embaixo', async () => {
      renderTooltip();
      const trigger = anchorAt({ left: 493, right: 507, top: 540, bottom: 554 });
      await userEvent.hover(trigger);
      const tip = screen.getByRole('tooltip');
      expect(tip.style.transform).toBe('translate(350px, 432px)');
      expect(tip.lastElementChild).toHaveAttribute('data-placement', 'above');
    });

    it('não passa da borda direita e a seta acompanha o gatilho', async () => {
      renderTooltip();
      const trigger = anchorAt({ left: 980, right: 994, top: 200, bottom: 214 });
      await userEvent.hover(trigger);
      const tip = screen.getByRole('tooltip');
      expect(tip.style.transform).toBe('translate(690px, 222px)');
      expect((tip.lastElementChild as HTMLElement).style.left).toBe('281px');
    });

    it('nunca fica sob a sidebar aberta', async () => {
      const sidebar = document.createElement('aside');
      sidebar.id = 'app-sidebar';
      sidebar.getBoundingClientRect = () => ({ right: 240 }) as DOMRect;
      document.body.append(sidebar);
      renderTooltip();
      const trigger = anchorAt({ left: 250, right: 264, top: 200, bottom: 214 });
      await userEvent.hover(trigger);
      expect(screen.getByRole('tooltip').style.transform).toBe('translate(250px, 222px)');
    });

    it('texto longo: alarga o balão e, se preciso, limita a altura ao espaço livre', async () => {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get(this: HTMLElement) {
          const wide = this.style.maxWidth !== '';
          const capped = this.querySelector<HTMLElement>('span.block')?.style.maxHeight;
          return capped ? 200 : wide ? 400 : 700;
        },
      });
      renderTooltip();
      const trigger = anchorAt({ left: 493, right: 507, top: 300, bottom: 314 });
      await userEvent.hover(trigger);
      const tip = screen.getByRole('tooltip');
      expect(tip.style.maxWidth).toBe('760px');
      expect(tip.querySelector<HTMLElement>('span.block')?.style.maxHeight).toBe('558px');
      expect(tip.style.transform).toBe('translate(350px, 322px)');
      expect(tip.lastElementChild).toHaveAttribute('data-placement', 'below');
    });

    it('sem espaço nenhum, cobre o gatilho e esconde a seta', async () => {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get: () => 560,
      });
      renderTooltip();
      const trigger = anchorAt({ left: 493, right: 507, top: 300, bottom: 314 });
      await userEvent.hover(trigger);
      const tip = screen.getByRole('tooltip');
      expect(tip.style.transform).toBe('translate(350px, 10px)');
      expect(tip.lastElementChild).toHaveAttribute('data-placement', 'none');
    });

    it('reposiciona no scroll e no resize enquanto aberto', async () => {
      renderTooltip();
      const trigger = anchorAt({ left: 493, right: 507, top: 200, bottom: 214 });
      await userEvent.hover(trigger);
      anchorAt({ left: 493, right: 507, top: 300, bottom: 314 });
      fireEvent.scroll(window);
      expect(screen.getByRole('tooltip').style.transform).toBe('translate(350px, 322px)');
      anchorAt({ left: 593, right: 607, top: 300, bottom: 314 });
      fireEvent(window, new Event('resize'));
      expect(screen.getByRole('tooltip').style.transform).toBe('translate(450px, 322px)');
    });
  });
});
