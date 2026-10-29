import type { DriverBadge } from '@domain/drivers/badgeTone';
import { CategoryTag } from '@presentation/components/ui';

interface DriverTypeBadgeProps {
  badge: DriverBadge;
  className?: string;
}

export function DriverTypeBadge({ badge, className = '' }: DriverTypeBadgeProps) {
  return (
    <CategoryTag tone={badge.tone} className={className}>
      {badge.label}
    </CategoryTag>
  );
}
