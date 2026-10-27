'use client';

import type { IngeridoRowDto } from '@application/ingeridos/dto';
import { Button, CategoryTag, CodeTag, DetailField, Modal } from '@presentation/components/ui';

interface IngeridoDetailModalProps {
  ingerido: IngeridoRowDto;
  onClose: () => void;
}

export function IngeridoDetailModal({ ingerido, onClose }: IngeridoDetailModalProps) {
  return (
    <Modal
      open
      onClose={onClose}
      title={`Driver ${ingerido.id}`}
      size="md"
      footer={
        <Button variant="ghost" size="sm" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-[14px]">
        <DetailField label="Produto">{ingerido.produto}</DetailField>
        <DetailField label="SKU">{ingerido.sku}</DetailField>
        <DetailField label="Tipo">
          <CategoryTag tone={ingerido.badge}>{ingerido.tipo}</CategoryTag>
        </DetailField>
        <DetailField label="Período">{ingerido.periodo}</DetailField>
        <DetailField label="Feature">
          <CodeTag tone={ingerido.featureTone}>{ingerido.feature}</CodeTag>
        </DetailField>
        <DetailField label="Categoria">{ingerido.categoria}</DetailField>
        <DetailField label="Área">{ingerido.area}</DetailField>
        <DetailField label="Validado por">{ingerido.validadoPor}</DetailField>
      </div>
    </Modal>
  );
}
