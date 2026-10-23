import { InvalidValueError } from './DomainError';

export class Percentage {
  private constructor(readonly ratio: number) {}

  static fromRatio(ratio: number): Percentage {
    if (!Number.isFinite(ratio) || ratio < 0) {
      throw new InvalidValueError(`Percentual inválido: ${ratio}`);
    }
    return new Percentage(ratio);
  }

  static fromFraction(numerator: number, denominator: number): Percentage | null {
    if (denominator === 0) {
      return null;
    }
    return Percentage.fromRatio(numerator / denominator);
  }

  get value(): number {
    return this.ratio * 100;
  }
}
