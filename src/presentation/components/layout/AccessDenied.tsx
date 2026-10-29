import type { NivelAcesso } from '@domain/perfis/Perfil';
import { HOME_ROUTE } from '@presentation/navigation/routes';
import { useId } from 'react';
import { ButtonLink } from '../ui/Button';
import { deniedUpgradeText } from './deniedUpgradeText';

export const DENIED_FALLBACK_MESSAGE =
  'Você não tem permissão para acessar esta funcionalidade com o perfil atual.';

interface AccessDeniedProps {
  perfil?: { label: string; nivel: NivelAcesso } | undefined;
}

export function AccessDenied({ perfil }: AccessDeniedProps) {
  const id = useId();
  const mensagem =
    perfil === undefined
      ? DENIED_FALLBACK_MESSAGE
      : `Seu perfil (${perfil.label}) não tem acesso a esta funcionalidade.`;
  const detalhe = perfil === undefined ? null : deniedUpgradeText(perfil.nivel);
  return (
    <section
      aria-labelledby={id}
      className="flex h-[60vh] flex-col items-center justify-center gap-[10px] text-center text-apsen-muted"
    >
      <div aria-hidden="true" className="mb-[8px] text-[44px]">
        🔒
      </div>
      <h1 id={id} className="text-[16px] font-semibold text-apsen-slate">
        Acesso Restrito
      </h1>
      <p>{mensagem}</p>
      {detalhe === null ? null : (
        <div
          data-testid="denied-detail"
          className="mt-[8px] text-[12.5px] leading-[1.6] text-apsen-muted"
        >
          {detalhe}
        </div>
      )}
      <ButtonLink href={HOME_ROUTE} variant="outline" className="mt-[16px]">
        ← Voltar ao Dashboard
      </ButtonLink>
    </section>
  );
}
