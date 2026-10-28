'use client';

import { CatalogoImportError } from '@domain/tipos/errors';
import { Button, FormField, Modal, TextArea } from '@presentation/components/ui';
import { useImportCatalogoMutation } from '@presentation/hooks/tipos/useTipoMutations';
import { useState } from 'react';

interface ImportCatalogoModalProps {
  onClose: () => void;
}

export function ImportCatalogoModal({ onClose }: ImportCatalogoModalProps) {
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | undefined>(undefined);
  const importar = useImportCatalogoMutation();

  const enviar = () => {
    importar.mutate(texto, {
      onSuccess: onClose,
      onError: (error) => {
        if (error instanceof CatalogoImportError) {
          setErro(error.message);
        }
      },
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Importar Catálogo de Tipos"
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={importar.isPending}>
            Cancelar
          </Button>
          <Button
            escrita
            variant="teal"
            size="sm"
            loading={importar.isPending}
            loadingLabel="Importando…"
            onClick={enviar}
          >
            Importar
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-[1.55] text-apsen-muted">
        Cole o JSON exportado de outro ambiente. Tipos com o mesmo slug serão{' '}
        <strong>atualizados</strong>; novos slugs serão <strong>inseridos</strong>.
      </p>
      <FormField label="JSON do catálogo" error={erro}>
        <TextArea
          rows={6}
          value={texto}
          onChange={(value) => {
            setTexto(value);
            setErro(undefined);
          }}
          placeholder={'{"schema":"drivers-catalogo-v1","tipos":[...]}'}
          className="font-mono text-[11.5px]"
        />
      </FormField>
    </Modal>
  );
}
