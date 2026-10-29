import type { AgenteDraft } from '@domain/agentes/Agente';
import { AgenteValidationError } from '@domain/agentes/errors';
import { createFakeAgenteRepository } from '@test/fakes/acessoRepositories';
import { SaveAgente } from '../SaveAgente';

const UUID = 'e7d4-0000-4000-8000-000000000001';

const DRAFT: AgenteDraft = {
  papelOpcao: '➕ Agente customizado',
  nome: ' Agente Preços — Homologação ',
  provedor: 'openai',
  ambiente: 'Homologação',
  endpoint: ' https://api.openai.com ',
  vault: 'https://apsen-keyvault.vault.azure.net',
  secret: ' apsen-di-precos-key ',
  modelo: 'gpt-4o',
  schedule: 'Diário · 03h00',
  fontes: 'https://www.gov.br/anvisa',
  limiar: 80,
  ativo: false,
};

describe('SaveAgente (RN-05, CA-09)', () => {
  it('dado rascunho válido, quando cria, então POST com UUID, código e teste pendente', async () => {
    const repository = createFakeAgenteRepository();
    await expect(new SaveAgente(repository, () => UUID).execute({ draft: DRAFT })).resolves.toEqual(
      { toast: '✅ Agente salvo!' },
    );
    expect(repository.create).toHaveBeenCalledWith({
      id: UUID,
      codigo: 'AG-006',
      papel: '➕ Agente customizado',
      nome: 'Agente Preços — Homologação',
      fontes: 'https://www.gov.br/anvisa',
      provedor: 'openai',
      endpoint: 'https://api.openai.com',
      secret: 'apsen-di-precos-key',
      vault: 'https://apsen-keyvault.vault.azure.net',
      modelo: 'gpt-4o',
      schedule: 'Diário · 03h00',
      ambiente: 'Homologação',
      limiar: 80,
      ultimoTeste: { status: 'pendente', ts: '— não testado' },
      ativo: false,
    });
  });

  it('edição faz PATCH sem codigo e ultimo_teste, com o papel curto da opção', async () => {
    const repository = createFakeAgenteRepository();
    await new SaveAgente(repository, () => UUID).execute({
      id: 'AG-001',
      draft: { ...DRAFT, papelOpcao: '🏛️ Agente Regulatório — DOU / ANVISA / CMED / MS' },
    });
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.listCodigos).not.toHaveBeenCalled();
    const [id, patch] = repository.update.mock.calls[0] ?? [];
    expect(id).toBe('AG-001');
    expect(patch).not.toHaveProperty('codigo');
    expect(patch).not.toHaveProperty('ultimoTeste');
    expect(patch).not.toHaveProperty('id');
    expect(patch).toMatchObject({ papel: '🏛️ Agente Regulatório' });
  });

  it('rascunho inválido → AgenteValidationError sem gravar', async () => {
    const repository = createFakeAgenteRepository();
    const error = await new SaveAgente(repository, () => UUID)
      .execute({ draft: { ...DRAFT, papelOpcao: '' } })
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AgenteValidationError);
    expect((error as AgenteValidationError).message).toBe('⚠️ Selecione o papel do agente.');
    expect(repository.create).not.toHaveBeenCalled();
  });
});
