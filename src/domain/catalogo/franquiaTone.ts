export type FranquiaTone =
  'aster' | 'lyra' | 'polaris' | 'sagita' | 'sirius' | 'solaris' | 'default';

const TONS: Readonly<Record<string, FranquiaTone>> = {
  ASTER: 'aster',
  LYRA: 'lyra',
  POLARIS: 'polaris',
  SAGITA: 'sagita',
  SIRIUS: 'sirius',
  SOLARIS: 'solaris',
};

export function tomDaFranquia(id: string): FranquiaTone {
  return TONS[id] ?? 'default';
}
