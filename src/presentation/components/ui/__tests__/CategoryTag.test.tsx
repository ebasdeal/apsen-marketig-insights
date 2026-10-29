import { render, screen } from '@testing-library/react';
import { CategoryTag } from '../CategoryTag';
import type { CategoryTone } from '../categoryTones';

const CASES: readonly (readonly [CategoryTone, readonly string[]])[] = [
  ['tv', ['bg-apsen-cat-tv-bg', 'border-apsen-cat-tv-b', 'text-apsen-cat-tv-fg']],
  [
    'digital',
    ['bg-apsen-cat-digital-bg', 'border-apsen-cat-digital-b', 'text-apsen-cat-digital-fg'],
  ],
  ['pdv', ['bg-apsen-cat-pdv-bg', 'border-apsen-cat-pdv-b', 'text-apsen-cat-pdv-fg']],
  ['conc', ['bg-apsen-cat-conc-bg', 'border-apsen-cat-conc-b', 'text-apsen-cat-conc-fg']],
  ['sazo', ['bg-apsen-cat-sazo-bg', 'border-apsen-cat-sazo-b', 'text-apsen-cat-sazo-fg']],
  ['viral', ['bg-apsen-cat-viral-bg', 'border-apsen-cat-viral-b', 'text-apsen-cat-viral-fg']],
  ['campo', ['bg-apsen-blue-bg', 'border-apsen-blue-light', 'text-apsen-blue']],
  ['medico', ['bg-apsen-purple-bg', 'border-apsen-purple-b', 'text-apsen-purple']],
  ['canal', ['bg-apsen-purple-bg', 'border-apsen-purple-b', 'text-apsen-purple']],
  ['macro', ['bg-apsen-purple-bg', 'border-apsen-purple-b', 'text-apsen-purple']],
  ['preco', ['bg-apsen-red-bg', 'border-apsen-red-b', 'text-apsen-red']],
  ['supply', ['bg-apsen-orange-bg', 'border-apsen-orange-b', 'text-apsen-orange']],
  ['reg', ['bg-apsen-teal-bg', 'border-apsen-teal-light', 'text-apsen-teal']],
  ['outro', ['bg-apsen-bg', 'border-apsen-border', 'text-apsen-muted']],
];

describe('CategoryTag', () => {
  it.each(CASES)('aplica o tom %s', (tone, classes) => {
    render(<CategoryTag tone={tone}>{tone}</CategoryTag>);
    expect(screen.getByText(tone)).toHaveClass(
      'inline-block',
      'rounded-[4px]',
      'border',
      'px-[8px]',
      'py-[2px]',
      'text-[10.5px]',
      'font-bold',
      ...classes,
    );
  });

  it('aceita classe extra', () => {
    render(
      <CategoryTag tone="tv" className="ml-[6px]">
        TV
      </CategoryTag>,
    );
    expect(screen.getByText('TV')).toHaveClass('ml-[6px]');
  });
});
