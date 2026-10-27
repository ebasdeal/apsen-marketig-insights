interface IconProps {
  className?: string;
}

const SVG = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'aria-hidden': true,
} as const;

export function EditIcon({ className = 'size-[14px]' }: IconProps) {
  return (
    <svg {...SVG} strokeWidth="2" className={className}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function TrashIcon({ className = 'size-[14px]' }: IconProps) {
  return (
    <svg {...SVG} strokeWidth="2" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  );
}

export function CheckIcon({ className = 'size-[12px]' }: IconProps) {
  return (
    <svg {...SVG} strokeWidth="2.5" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CloseIcon({ className = 'size-[12px]' }: IconProps) {
  return (
    <svg {...SVG} strokeWidth="2.5" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
