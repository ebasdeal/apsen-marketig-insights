import type { CampaignStatus } from '@domain/campaign/CampaignStatus';
import { STATUS_LABELS } from '@presentation/format/labels';
import { Badge, type BadgeSize, type BadgeTone } from './Badge';

const STATUS_TONES: Record<CampaignStatus, BadgeTone> = {
  ativa: 'green',
  pausada: 'orange',
  encerrada: 'gray',
};

interface StatusBadgeProps {
  status: CampaignStatus;
  size?: BadgeSize;
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <Badge tone={STATUS_TONES[status]} size={size} data-status={status}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
