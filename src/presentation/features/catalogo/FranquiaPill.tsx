import { tomDaFranquia, type FranquiaTone } from '@domain/catalogo/franquiaTone';
import { ColorPill, type PillColor } from '@presentation/components/ui';

const CORES: Record<FranquiaTone, PillColor> = {
  aster: 'blue',
  lyra: 'purple',
  polaris: 'cyan',
  sagita: 'amber',
  sirius: 'emerald',
  solaris: 'red',
  default: 'slate',
};

export function FranquiaPill({ franquia }: { franquia: string }) {
  return (
    <ColorPill color={CORES[tomDaFranquia(franquia)]} variant="soft">
      {franquia}
    </ColorPill>
  );
}
