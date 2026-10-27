import type { ReactNode } from 'react';

interface NumberedListProps {
  items: readonly ReactNode[];
  'aria-label'?: string;
}

export function NumberedList({ items, 'aria-label': label }: NumberedListProps) {
  return (
    <ol role="list" aria-label={label}>
      {items.map((item, index) => (
        <li
          key={index}
          className="border-b border-apsen-bg py-[7px] text-[13px] leading-[1.6] last:border-b-0"
        >
          <span aria-hidden="true" className="mr-[6px] font-bold text-apsen-orange">
            {`${index + 1}.`}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}
