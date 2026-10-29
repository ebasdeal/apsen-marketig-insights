import type { FonteCardDto } from '@application/fontes/dto';
import { EmptyState } from '@presentation/components/ui';
import { FonteCard } from './FonteCard';

interface FontesListProps {
  items: readonly FonteCardDto[];
  onConfigure: (fonte: FonteCardDto) => void;
  onRemove: (fonte: FonteCardDto) => void;
}

export function FontesList({ items, onConfigure, onRemove }: FontesListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="🔌"
        title="Nenhuma fonte cadastrada"
        description='Clique em "+ Nova Fonte de Dados" para configurar a primeira.'
      />
    );
  }
  return (
    <div aria-label="Fontes de dados" role="list">
      {items.map((fonte) => (
        <div role="listitem" key={fonte.id}>
          <FonteCard fonte={fonte} onConfigure={onConfigure} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
