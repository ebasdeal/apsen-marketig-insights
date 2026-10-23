import { InvalidValueError } from '../shared/DomainError';
import type { DateRange } from '../shared/DateRange';
import type { Money } from '../shared/Money';
import { Percentage } from '../shared/Percentage';
import type { CampaignStatus } from './CampaignStatus';
import type { Channel } from './Channel';
import type { Kpis, Metrics } from './Metrics';

export interface CampaignProps {
  id: string;
  name: string;
  channel: Channel;
  status: CampaignStatus;
  period: DateRange;
  budget: Money;
  metrics: Metrics;
}

export class Campaign {
  private constructor(private readonly props: CampaignProps) {}

  static create(props: CampaignProps): Campaign {
    const id = props.id.trim();
    const name = props.name.trim();
    if (id.length === 0) {
      throw new InvalidValueError('Campanha precisa de um id');
    }
    if (name.length === 0) {
      throw new InvalidValueError('Campanha precisa de um nome');
    }
    return new Campaign({ ...props, id, name });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get channel(): Channel {
    return this.props.channel;
  }

  get status(): CampaignStatus {
    return this.props.status;
  }

  get period(): DateRange {
    return this.props.period;
  }

  get budget(): Money {
    return this.props.budget;
  }

  get metrics(): Metrics {
    return this.props.metrics;
  }

  kpis(): Kpis {
    return this.props.metrics.kpis();
  }

  budgetUsage(): Percentage | null {
    const ratio = this.props.metrics.spend.ratioTo(this.props.budget);
    return ratio === null ? null : Percentage.fromRatio(ratio);
  }

  isOverBudget(): boolean {
    const ratio = this.props.metrics.spend.ratioTo(this.props.budget);
    return ratio !== null && ratio > 1;
  }
}
