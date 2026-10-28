'use client';

import type { PerfilId, UsuarioDraft } from '@domain/usuarios/Usuario';
import type { UsuarioErros } from '@domain/usuarios/usuarioRules';
import { USUARIO_PERFIS } from '@domain/usuarios/vocabulario';
import { FormField, FormGrid, FormSelect, TextInput, Tooltip } from '@presentation/components/ui';

interface UsuarioDadosCardProps {
  draft: UsuarioDraft;
  erros: UsuarioErros;
  areas: readonly string[];
  perfilHint: string | undefined;
  onChange: (patch: Partial<UsuarioDraft>) => void;
}

function PerfilTip() {
  return (
    <Tooltip label="Sobre os perfis de acesso">
      <strong>Define o que o usuário pode fazer no módulo:</strong>
      <br />
      <br />
      ⚙️ <em>Admin:</em> acesso total — configura tipos, gerencia usuários, exporta dados
      <br />
      📋 <em>Planejador:</em> revisa e valida drivers, acessa catálogo e exportação
      <br />
      🏢 <em>Área:</em> registra drivers apenas das categorias autorizadas — não acessa admin
      <br />
      👁 <em>Visualizador:</em> somente leitura — vê drivers ingeridos e catálogo de tipos
    </Tooltip>
  );
}

export function UsuarioDadosCard({
  draft,
  erros,
  areas,
  perfilHint,
  onChange,
}: UsuarioDadosCardProps) {
  return (
    <FormGrid columns={2}>
      <FormField label="Nome completo" required error={erros.nome}>
        <TextInput
          value={draft.nome}
          onChange={(nome) => onChange({ nome })}
          placeholder="Ex: Ana Paula Ferreira"
        />
      </FormField>
      <FormField label="E-mail corporativo" required error={erros.email}>
        <TextInput
          type="email"
          value={draft.email}
          onChange={(email) => onChange({ email })}
          placeholder="usuario@apsen.com.br"
        />
      </FormField>
      <FormField label="Área / Departamento" required error={erros.area}>
        <FormSelect
          value={draft.area}
          onChange={(area) => onChange({ area })}
          options={areas.map((area) => ({ value: area, label: area }))}
          placeholder="Selecione..."
        />
      </FormField>
      <FormField
        label="Perfil de acesso"
        required
        tip={<PerfilTip />}
        error={erros.perfil}
        {...(perfilHint === undefined ? {} : { hint: perfilHint })}
      >
        <FormSelect<PerfilId>
          value={draft.perfil}
          onChange={(perfil) => onChange({ perfil })}
          options={USUARIO_PERFIS}
          placeholder="Selecione..."
        />
      </FormField>
    </FormGrid>
  );
}
