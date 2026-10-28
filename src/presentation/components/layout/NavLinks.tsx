'use client';

import { moduloVisivel } from '@domain/perfis/acesso';
import { nextAccordion, resolveOpenModule } from '@presentation/navigation/resolveOpenModule';
import { useCurrentScreen } from '@presentation/navigation/useCurrentScreen';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavBadges } from '../../hooks/useNavBadges';
import { usePerfilAtual } from '../../hooks/usePerfilAtual';
import { useSidebarStore } from '../../stores/sidebarStore';
import { useNav } from './NavContext';
import { DashboardIcon } from './NavIcons';
import { NAV_MODULES, NAV_ROOT } from './navItems';
import { NavModuleGroup } from './NavModuleGroup';

const ROOT_CLASS =
  'mx-[8px] mt-[8px] mb-[4px] flex select-none items-center gap-[8px] rounded-apsen border-l-[3px] py-[8px] pr-[18px] pl-[13px] text-[13px] font-semibold transition-all focus-ring';
const ROOT_ACTIVE = 'border-apsen-blue bg-apsen-blue text-white';
const ROOT_INACTIVE =
  'border-transparent text-apsen-muted hover:bg-apsen-hover hover:text-apsen-slate';

export function NavLinks() {
  const pathname = usePathname();
  const { closeOnMobile } = useNav();
  const { screen, blocked } = useCurrentScreen();
  const { perfil } = usePerfilAtual();
  const badges = useNavBadges().data;
  const accordion = useSidebarStore((state) => state.accordion);
  const setAccordion = useSidebarStore((state) => state.setAccordion);
  const activeScreenId = blocked ? null : (screen?.id ?? null);
  const openModule = resolveOpenModule(screen?.modulo ?? null, pathname, accordion);
  const rootActive = activeScreenId === NAV_ROOT.screenId;
  const modules =
    perfil === undefined
      ? []
      : NAV_MODULES.filter((module) => moduloVisivel(perfil.nivel, module.id));
  return (
    <nav aria-label="Navegação principal">
      <Link
        href={NAV_ROOT.href as Route}
        onClick={closeOnMobile}
        aria-current={rootActive ? 'page' : undefined}
        className={`${ROOT_CLASS} ${rootActive ? ROOT_ACTIVE : ROOT_INACTIVE}`}
      >
        <DashboardIcon />
        {NAV_ROOT.label}
      </Link>
      {perfil === undefined ? (
        <div
          aria-hidden
          data-testid="nav-placeholder"
          className="mx-[8px] mt-[8px] flex flex-col gap-[10px]"
        >
          {[0, 1, 2, 3].map((item) => (
            <span key={item} className="mx-[13px] h-[14px] animate-pulse rounded bg-apsen-border" />
          ))}
        </div>
      ) : (
        modules.map((module) => (
          <NavModuleGroup
            key={module.id}
            module={module}
            open={openModule === module.id}
            onToggle={() => setAccordion(nextAccordion(openModule, module.id), pathname)}
            activeScreenId={activeScreenId}
            badges={badges}
            nivel={perfil.nivel}
          />
        ))
      )}
    </nav>
  );
}
