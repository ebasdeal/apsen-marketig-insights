import { InvalidValueError } from '../shared/DomainError';
import { Money } from '../shared/Money';
import { Percentage } from '../shared/Percentage';

export interface MetricsProps {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: Money;
  revenue: Money;
}

export interface Kpis {
  ctr: Percentage | null;
  cpc: Money | null;
  cpa: Money | null;
  roas: number | null;
  conversionRate: Percentage | null;
}

function assertCount(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new InvalidValueError(`${name} deve ser um inteiro não negativo: ${value}`);
  }
}

export class Metrics {
  private constructor(
    readonly impressions: number,
    readonly clicks: number,
    readonly conversions: number,
    readonly spend: Money,
    readonly revenue: Money,
  ) {}

  static create(props: MetricsProps): Metrics {
    assertCount('Impressões', props.impressions);
    assertCount('Cliques', props.clicks);
    assertCount('Conversões', props.conversions);
    if (props.clicks > props.impressions) {
      throw new InvalidValueError('Cliques não podem exceder impressões');
    }
    if (props.conversions > props.clicks) {
      throw new InvalidValueError('Conversões não podem exceder cliques');
    }
    return new Metrics(
      props.impressions,
      props.clicks,
      props.conversions,
      props.spend,
      props.revenue,
    );
  }

  static empty(): Metrics {
    return new Metrics(0, 0, 0, Money.zero(), Money.zero());
  }

  add(other: Metrics): Metrics {
    return new Metrics(
      this.impressions + other.impressions,
      this.clicks + other.clicks,
      this.conversions + other.conversions,
      this.spend.add(other.spend),
      this.revenue.add(other.revenue),
    );
  }

  ctr(): Percentage | null {
    return Percentage.fromFraction(this.clicks, this.impressions);
  }

  cpc(): Money | null {
    return this.spend.divideBy(this.clicks);
  }

  cpa(): Money | null {
    return this.spend.divideBy(this.conversions);
  }

  roas(): number | null {
    return this.revenue.ratioTo(this.spend);
  }

  conversionRate(): Percentage | null {
    return Percentage.fromFraction(this.conversions, this.clicks);
  }

  kpis(): Kpis {
    return {
      ctr: this.ctr(),
      cpc: this.cpc(),
      cpa: this.cpa(),
      roas: this.roas(),
      conversionRate: this.conversionRate(),
    };
  }
}
