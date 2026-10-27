'use client';

interface RangeSliderProps {
  'aria-label': string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  accent?: 'blue' | 'purple';
  format?: (value: number) => string;
  disabled?: boolean;
}

const ACCENTS = {
  blue: {
    row: 'mt-[3px] gap-[10px]',
    input: 'accent-apsen-blue',
    value: 'min-w-[18px] text-apsen-blue',
  },
  purple: {
    row: 'mt-[4px] gap-[12px]',
    input: 'accent-apsen-purple',
    value: 'min-w-[44px] text-apsen-purple',
  },
};

export function RangeSlider({
  'aria-label': label,
  min,
  max,
  step = 1,
  value,
  onChange,
  accent = 'blue',
  format = String,
  disabled = false,
}: RangeSliderProps) {
  const style = ACCENTS[accent];
  const text = format(value);
  return (
    <div className={`flex items-center ${style.row}`}>
      <input
        type="range"
        aria-label={label}
        aria-valuetext={text}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`min-w-0 flex-1 cursor-pointer focus-ring disabled:cursor-default ${style.input}`}
      />
      <span aria-hidden="true" className={`text-[15px] font-bold ${style.value}`}>
        {text}
      </span>
    </div>
  );
}
