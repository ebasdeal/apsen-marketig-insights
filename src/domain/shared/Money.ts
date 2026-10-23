import { InvalidValueError } from './DomainError';

export class Money {
  private constructor(private readonly cents: number) {}

  static of(amount: number): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new InvalidValueError(`Valor monetário inválido: ${amount}`);
    }
    return new Money(Math.round(amount * 100));
  }

  static zero(): Money {
    return new Money(0);
  }

  get amount(): number {
    return this.cents / 100;
  }

  isZero(): boolean {
    return this.cents === 0;
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  divideBy(divisor: number): Money | null {
    if (!Number.isFinite(divisor) || divisor <= 0) {
      return null;
    }
    return Money.of(this.amount / divisor);
  }

  ratioTo(other: Money): number | null {
    if (other.isZero()) {
      return null;
    }
    return this.cents / other.cents;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }
}
