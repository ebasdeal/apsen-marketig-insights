'use client';

import type { AgenteRowDto } from '@application/agentes/dto';
import type { TesteStatus } from '@domain/agentes/Agente';
import { Button, CodeTag, DetailField, Modal } from '@presentation/components/ui';

const TESTE: Record<TesteStatus, { texto: string; className: string }> = {
  ok: { texto: '✓ OK', className: 'text-apsen-green-fg' },
  falha: { texto: '✗ Falha', className: 'text-apsen-red' },
  pendente: { texto: '—', className: 'text-apsen-muted' },
};

interface AgenteViewModalProps {
  agente: AgenteRowDto | null;
  onClose: () => void;
}

export function AgenteViewModal({ agente, onClose }: AgenteViewModalProps) {
  if (agente === null) {
    return null;
  }
  const teste = TESTE[agente.ultimoTeste.status];
  return (
    <Modal
      open
      size="lg"
      title={agente.papel}
      onClose={onClose}
      footer={
        <Button variant="ghost" size="sm" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-[14px]">
        {agente.nome === '' ? null : (
          <DetailField label="Nome de exibição" full>
            {agente.nome}
          </DetailField>
        )}
        <DetailField label="Provedor">
          <span className="font-medium">{agente.provedor}</span>
        </DetailField>
        <DetailField label="Modelo">
          <CodeTag className="text-[12px]">{agente.modelo}</CodeTag>
        </DetailField>
        <DetailField label="Endpoint" full>
          <span className="font-mono text-[12px] text-apsen-blue">{agente.endpoint}</span>
        </DetailField>
        <DetailField label="Secret (Key Vault ref.)">
          <span className="text-[12.5px]">
            {agente.secret}
            <br />
            <span className="text-[11px] text-apsen-muted">vault: {agente.vault}</span>
          </span>
        </DetailField>
        <DetailField label="Schedule">{agente.schedule}</DetailField>
        <DetailField label="Ambiente">{agente.ambiente}</DetailField>
        <DetailField label="Fontes">
          <span className="text-[12.5px]">{agente.fontes}</span>
        </DetailField>
        <DetailField label="Status">
          <span
            className={`font-semibold ${agente.ativo ? 'text-apsen-green-fg' : 'text-apsen-muted'}`}
          >
            {agente.ativo ? '✅ Ativo' : '⏸ Inativo'}
          </span>
        </DetailField>
        <DetailField label="Último Teste" full>
          <span className={teste.className}>
            {teste.texto}
            <span className="ml-[8px] text-[11.5px] text-apsen-muted">{agente.ultimoTeste.ts}</span>
          </span>
        </DetailField>
      </div>
    </Modal>
  );
}
