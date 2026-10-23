import { InvalidValueError } from './DomainError';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export class DateRange {
  private constructor(
    readonly start: Date,
    readonly end: Date,
  ) {}

  static create(start: Date, end: Date): DateRange {
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new InvalidValueError('Período com data inválida');
    }
    if (end.getTime() < start.getTime()) {
      throw new InvalidValueError('A data final do período deve ser posterior à inicial');
    }
    return new DateRange(new Date(start.getTime()), new Date(end.getTime()));
  }

  static fromIso(start: string, end: string): DateRange {
    return DateRange.create(new Date(start), new Date(end));
  }

  get days(): number {
    return Math.floor((this.end.getTime() - this.start.getTime()) / DAY_IN_MS) + 1;
  }

  contains(date: Date): boolean {
    const time = date.getTime();
    return time >= this.start.getTime() && time <= this.end.getTime();
  }

  overlaps(other: DateRange): boolean {
    return (
      this.start.getTime() <= other.end.getTime() && other.start.getTime() <= this.end.getTime()
    );
  }
}
