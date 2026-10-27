export type CategoryTone =
  | 'tv'
  | 'digital'
  | 'pdv'
  | 'campo'
  | 'medico'
  | 'preco'
  | 'conc'
  | 'sazo'
  | 'supply'
  | 'canal'
  | 'reg'
  | 'viral'
  | 'macro'
  | 'outro';

export const CATEGORY_TONES: Record<CategoryTone, string> = {
  tv: 'bg-apsen-cat-tv-bg border-apsen-cat-tv-b text-apsen-cat-tv-fg',
  digital: 'bg-apsen-cat-digital-bg border-apsen-cat-digital-b text-apsen-cat-digital-fg',
  pdv: 'bg-apsen-cat-pdv-bg border-apsen-cat-pdv-b text-apsen-cat-pdv-fg',
  campo: 'bg-apsen-blue-bg border-apsen-blue-light text-apsen-blue',
  medico: 'bg-apsen-purple-bg border-apsen-purple-b text-apsen-purple',
  preco: 'bg-apsen-red-bg border-apsen-red-b text-apsen-red',
  conc: 'bg-apsen-cat-conc-bg border-apsen-cat-conc-b text-apsen-cat-conc-fg',
  sazo: 'bg-apsen-cat-sazo-bg border-apsen-cat-sazo-b text-apsen-cat-sazo-fg',
  supply: 'bg-apsen-orange-bg border-apsen-orange-b text-apsen-orange',
  canal: 'bg-apsen-purple-bg border-apsen-purple-b text-apsen-purple',
  reg: 'bg-apsen-teal-bg border-apsen-teal-light text-apsen-teal',
  viral: 'bg-apsen-cat-viral-bg border-apsen-cat-viral-b text-apsen-cat-viral-fg',
  macro: 'bg-apsen-purple-bg border-apsen-purple-b text-apsen-purple',
  outro: 'bg-apsen-bg border-apsen-border text-apsen-muted',
};
