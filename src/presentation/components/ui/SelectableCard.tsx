'use client';

interface SelectableCardProps {
  title: string;
  description?: string;
  icon?: string;
  tag?: string;
  selected: boolean;
  onSelect: () => void;
}

const CARD =
  'relative w-full cursor-pointer rounded-[10px] border-2 p-[14px] text-left font-[inherit] transition-all hover:border-apsen-orange focus-ring';
const CHECK =
  'absolute top-[10px] right-[10px] flex size-[18px] items-center justify-center rounded-full border-2 text-[10px]';

export function SelectableCard({
  title,
  description,
  icon,
  tag,
  selected,
  onSelect,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`${CARD} ${selected ? 'border-apsen-orange bg-apsen-orange-soft' : 'border-apsen-border bg-apsen-bg'}`}
    >
      <span
        aria-hidden="true"
        className={`${CHECK} ${selected ? 'border-apsen-orange bg-apsen-orange text-white' : 'border-apsen-border bg-apsen-white'}`}
      >
        {selected ? '✓' : null}
      </span>
      {icon === undefined ? null : (
        <span aria-hidden="true" className="mb-[5px] block text-[20px]">
          {icon}
        </span>
      )}
      <span className="mb-[3px] block pr-[22px] text-[13px] font-semibold text-apsen-slate">
        {title}
      </span>
      {description === undefined ? null : (
        <span className="block text-[12px] leading-[1.5] text-apsen-muted">{description}</span>
      )}
      {tag === undefined ? null : (
        <span className="mt-[5px] inline-block rounded-[8px] border border-apsen-orange-b bg-apsen-orange-soft px-[7px] py-[1px] text-[10.5px] font-semibold text-apsen-orange">
          {tag}
        </span>
      )}
    </button>
  );
}
