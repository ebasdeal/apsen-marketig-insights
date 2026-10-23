import { CampaignNotFoundError } from '@domain/shared/DomainError';

export function toUserMessage(error: unknown): string {
  if (error instanceof CampaignNotFoundError) {
    return 'Campanha não encontrada.';
  }
  return 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.';
}
