import { fireEvent, render, screen } from '@testing-library/react';
import { RangeSlider } from '../RangeSlider';

describe('RangeSlider', () => {
  it('emite número e mostra o valor azul por padrão', () => {
    const onChange = vi.fn();
    render(<RangeSlider aria-label="Intensidade" min={1} max={5} value={3} onChange={onChange} />);
    const slider = screen.getByRole('slider', { name: 'Intensidade' });
    expect(slider).toHaveAttribute('min', '1');
    expect(slider).toHaveAttribute('max', '5');
    expect(slider).toHaveAttribute('step', '1');
    expect(slider).toHaveAttribute('aria-valuetext', '3');
    expect(slider).toHaveClass('accent-apsen-blue', 'flex-1');
    expect(slider.parentElement).toHaveClass('mt-[3px]', 'gap-[10px]');
    expect(screen.getByText('3')).toHaveClass(
      'text-[15px]',
      'font-bold',
      'text-apsen-blue',
      'min-w-[18px]',
    );
    fireEvent.change(slider, { target: { value: '4' } });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('formata o valor com accent roxo', () => {
    render(
      <RangeSlider
        aria-label="Limiar de confiança"
        min={50}
        max={95}
        step={5}
        value={75}
        onChange={vi.fn()}
        accent="purple"
        format={(value) => `${value}%`}
        disabled
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Limiar de confiança' });
    expect(slider).toHaveAttribute('aria-valuetext', '75%');
    expect(slider).toHaveClass('accent-apsen-purple');
    expect(slider).toBeDisabled();
    expect(slider.parentElement).toHaveClass('mt-[4px]', 'gap-[12px]');
    expect(screen.getByText('75%')).toHaveClass('min-w-[44px]', 'text-apsen-purple');
  });
});
