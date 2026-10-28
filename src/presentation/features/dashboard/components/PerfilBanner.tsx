import type { NivelAcesso } from '@domain/perfis/Perfil';
import { BANNER_PERFIL } from '../dashboardStyles';

export function PerfilBanner({ nivel }: { nivel: NivelAcesso | undefined }) {
  const banner = nivel === undefined ? undefined : BANNER_PERFIL[nivel];
  if (banner === undefined) return null;
  return (
    <p
      role="note"
      className={`mb-[14px] rounded-apsen border px-[16px] py-[10px] text-[13px] leading-[1.5] ${banner.classes}`}
    >
      🔑 Você está como <strong>{banner.perfil}</strong>
      {banner.texto}
    </p>
  );
}
