import type { BarraOutput } from '@application/dashboard/dto';
import { BarRow, InlineEmpty, Section } from '@presentation/components/ui';

interface BarrasPanelProps {
  title: string;
  barras: readonly BarraOutput[];
  cores: Record<string, string>;
  vazio: string;
}

export function BarrasPanel({ title, barras, cores, vazio }: BarrasPanelProps) {
  return (
    <Section variant="panel" title={title}>
      {barras.length === 0 ? (
        <InlineEmpty>{vazio}</InlineEmpty>
      ) : (
        barras.map((barra) => (
          <BarRow
            key={barra.chave}
            label={barra.label}
            value={barra.n}
            max={barra.max}
            valueLabel={String(barra.n)}
            valueWidth="compact"
            fillClassName={cores[barra.chave] ?? 'bg-apsen-blue'}
          />
        ))
      )}
    </Section>
  );
}
