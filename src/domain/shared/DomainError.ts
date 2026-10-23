export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidValueError extends DomainError {}

export class CampaignNotFoundError extends DomainError {
  constructor(readonly campaignId: string) {
    super(`Campanha ${campaignId} não encontrada`);
  }
}
