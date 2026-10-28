'use client';

import { ApsenLoader } from './ApsenLoader';
import { PulseIcon } from './icons';
import type { AutocompleteItem, AutocompleteStatus } from './useAutocomplete';

const MESSAGE = 'p-[12px] text-center text-[12.5px] text-apsen-muted';
const OPTION =
  'flex cursor-pointer items-center gap-[8px] border-b border-apsen-bg px-[12px] py-[9px] text-[13px] transition-[background] duration-100 last:border-b-0 hover:bg-apsen-blue-bg aria-selected:bg-apsen-blue-bg motion-reduce:transition-none';

interface AutocompleteMenuProps {
  listId: string;
  label: string | undefined;
  items: readonly AutocompleteItem[];
  status: AutocompleteStatus;
  activeIndex: number;
  itemTag: string | undefined;
  loadingText: string;
  disabledMessage: string | undefined;
  sourceLabel: string;
  onPick: (value: string) => void;
}

export function optionId(listId: string, index: number): string {
  return `${listId}-option-${index}`;
}

export function AutocompleteMenu({
  listId,
  label,
  items,
  status,
  activeIndex,
  itemTag,
  loadingText,
  disabledMessage,
  sourceLabel,
  onPick,
}: AutocompleteMenuProps) {
  const ready = status === 'ready';
  return (
    <div className="absolute top-full right-0 left-0 z-50 mt-[2px] max-h-[220px] overflow-y-auto rounded-apsen border border-apsen-border bg-apsen-white shadow-apsen-dropdown">
      <ul id={listId} role="listbox" aria-label={label}>
        {ready
          ? items.map((item, index) => (
              <li
                key={`${item.value}-${index}`}
                id={optionId(listId, index)}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onPick(item.value)}
                className={OPTION}
              >
                <span>{item.value}</span>
                {(item.tag ?? itemTag) === undefined ? null : (
                  <span className="ml-auto shrink-0 whitespace-nowrap rounded-[8px] bg-apsen-bg px-[7px] py-[1px] text-[10px] font-semibold text-apsen-muted">
                    {item.tag ?? itemTag}
                  </span>
                )}
              </li>
            ))
          : null}
      </ul>
      {status === 'loading' || status === 'idle' ? (
        <ApsenLoader variant="inline" label={loadingText} />
      ) : null}
      <div role="status" aria-live="polite">
        {status === 'blocked' ? <p className={MESSAGE}>{disabledMessage}</p> : null}
        {ready && items.length === 0 ? (
          <p className={MESSAGE}>Nenhum resultado. Você pode digitar um valor novo.</p>
        ) : null}
        {ready ? (
          <p className="flex items-center gap-[5px] border-t border-apsen-border bg-apsen-bg px-[12px] py-[6px] text-[10.5px] text-apsen-muted">
            <PulseIcon className="size-[10px]" />
            {items.length === 0
              ? `Fonte: ${sourceLabel}`
              : `${items.length} resultado(s) · Fonte: ${sourceLabel}`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
