import { render, screen } from '@testing-library/react';
import { CodeBlock } from '../CodeBlock';

describe('CodeBlock', () => {
  it('renderiza pre focável, nomeado e com as cores de código', () => {
    render(<CodeBlock aria-label="JSON exportado">{'{\n  "a": 1\n}'}</CodeBlock>);
    const block = screen.getByLabelText('JSON exportado');
    expect(block.tagName).toBe('PRE');
    expect(block).toHaveAttribute('tabindex', '0');
    expect(block).toHaveClass(
      'bg-apsen-code-bg',
      'text-apsen-code-fg',
      'max-h-[360px]',
      'whitespace-pre',
      'font-mono',
      'text-[11.5px]',
    );
    expect(block.textContent).toBe('{\n  "a": 1\n}');
  });

  it('aceita altura máxima própria', () => {
    render(
      <CodeBlock aria-label="Payload" maxHeightClassName="max-h-[200px]">
        x
      </CodeBlock>,
    );
    const block = screen.getByLabelText('Payload');
    expect(block).toHaveClass('max-h-[200px]');
    expect(block).not.toHaveClass('max-h-[360px]');
  });
});
