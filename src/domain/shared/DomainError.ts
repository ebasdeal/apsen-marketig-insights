export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidValueError extends DomainError {}

export class NotFoundError extends DomainError {
  constructor(
    readonly resource: string,
    readonly resourceId: string,
  ) {
    super(`${resource} ${resourceId} não encontrado`);
  }
}
