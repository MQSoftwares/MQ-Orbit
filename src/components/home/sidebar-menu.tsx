"use client";

import { BrandLogo } from "@/components/brand/brand-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type NavigationChildItem = {
  label: string;
  href: string;
  iconSrc: string;
};

type NavigationItem = NavigationChildItem & {
  routeBase: string;
  children: NavigationChildItem[];
};

function createChildren(
  routeBase: string,
  items: Array<{ label: string; slug: string; iconSrc: string }>,
): NavigationChildItem[] {
  return items.map((item) => ({
    label: item.label,
    href: `${routeBase}/${item.slug}`,
    iconSrc: item.iconSrc,
  }));
}

const navigation: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    routeBase: "/home",
    iconSrc: "/svgs/sidebar/home/home.svg",
    children: [],
  },
  {
    label: "Agenda",
    href: "/agenda",
    routeBase: "/agenda",
    iconSrc: "/svgs/sidebar/agenda/agenda.svg",
    children: createChildren("/agenda", [
      { label: "Calendário", slug: "calendario", iconSrc: "/svgs/sidebar/agenda/calendar.svg" },
      { label: "Compromissos", slug: "compromissos", iconSrc: "/svgs/sidebar/agenda/appointments.svg" },
    ]),
  },
  {
    label: "Kanban",
    href: "/kanban",
    routeBase: "/kanban",
    iconSrc: "/svgs/sidebar/kanban/kanban.svg",
    children: createChildren("/kanban", [
      { label: "Quadros", slug: "quadros", iconSrc: "/svgs/sidebar/kanban/boards.svg" },
      { label: "Backlog", slug: "backlog", iconSrc: "/svgs/sidebar/kanban/backlog.svg" },
      { label: "Etiquetas", slug: "etiquetas", iconSrc: "/svgs/sidebar/kanban/post_its.svg" },
      { label: "Sprints", slug: "sprints", iconSrc: "/svgs/sidebar/kanban/sprints.svg" },
    ]),
  },
  {
    label: "Administrativo",
    href: "/administrativo",
    routeBase: "/administrativo",
    iconSrc: "/svgs/sidebar/administrative/administrative.svg",
    children: createChildren("/administrativo", [
      { label: "Equipe", slug: "equipe", iconSrc: "/svgs/sidebar/administrative/team.svg" },
      { label: "Colaboradores", slug: "colaboradores", iconSrc: "/svgs/sidebar/administrative/collaborators.svg" },
      { label: "Cargos", slug: "permissoes", iconSrc: "/svgs/sidebar/administrative/permissions.svg" },
      { label: "Clientes", slug: "clientes", iconSrc: "/svgs/sidebar/administrative/clients.svg" },
      { label: "Contratos", slug: "contratos", iconSrc: "/svgs/sidebar/administrative/contratc.svg" },
      { label: "Processos", slug: "processos", iconSrc: "/svgs/sidebar/administrative/process.svg" },
      { label: "Documentos", slug: "documentos", iconSrc: "/svgs/sidebar/administrative/documentation.svg" },
    ]),
  },
  {
    label: "Finanças",
    href: "/financas",
    routeBase: "/financas",
    iconSrc: "/svgs/sidebar/finance/finance.svg",
    children: createChildren("/financas", [
      { label: "Fluxo de caixa", slug: "fluxo-de-caixa", iconSrc: "/svgs/sidebar/finance/cash_flow.svg" },
      { label: "Contas a pagar", slug: "contas-a-pagar", iconSrc: "/svgs/sidebar/finance/accounts_payable.svg" },
      { label: "Contas a receber", slug: "contas-a-receber", iconSrc: "/svgs/sidebar/finance/accounts_receivable.svg" },
      { label: "Assinaturas", slug: "assinaturas", iconSrc: "/svgs/sidebar/finance/subscriptions.svg" },
      { label: "Centros de custo", slug: "centros-de-custo", iconSrc: "/svgs/sidebar/finance/cost_centers.svg" },
      { label: "Relatórios", slug: "relatorios", iconSrc: "/svgs/sidebar/finance/reports.svg" },
    ]),
  },
  {
    label: "Arquivos",
    href: "/arquivos",
    routeBase: "/arquivos",
    iconSrc: "/svgs/sidebar/files/files.svg",
    children: createChildren("/arquivos", [
      { label: "Explorador", slug: "explorador", iconSrc: "/svgs/sidebar/files/explorer.svg" },
      { label: "Recentes", slug: "recentes", iconSrc: "/svgs/sidebar/files/recent.svg" },
      { label: "Compartilhados", slug: "compartilhados", iconSrc: "/svgs/sidebar/files/shared.svg" },
      { label: "Favoritos", slug: "favoritos", iconSrc: "/svgs/sidebar/files/favorites.svg" },
      { label: "Lixeira", slug: "lixeira", iconSrc: "/svgs/sidebar/files/trash.svg" },
    ]),
  },
  {
    label: "Design",
    href: "/design",
    routeBase: "/design",
    iconSrc: "/svgs/sidebar/design/design.svg",
    children: createChildren("/design", [
      { label: "Projetos", slug: "projetos", iconSrc: "/svgs/sidebar/design/projects.svg" },
      { label: "Briefings", slug: "briefings", iconSrc: "/svgs/sidebar/design/briefings.svg" },
      { label: "Assets", slug: "assets", iconSrc: "/svgs/sidebar/design/assets.svg" },
      { label: "Templates", slug: "templates", iconSrc: "/svgs/sidebar/design/templates.svg" },
      { label: "Aprovações", slug: "aprovacoes", iconSrc: "/svgs/sidebar/design/approvals.svg" },
      { label: "Referências", slug: "referencias", iconSrc: "/svgs/sidebar/design/references.svg" },
    ]),
  },
  {
    label: "Marketing",
    href: "/marketing",
    routeBase: "/marketing",
    iconSrc: "/svgs/sidebar/marketing/marketing.svg",
    children: createChildren("/marketing", [
      { label: "Campanhas", slug: "campanhas", iconSrc: "/svgs/sidebar/marketing/campaigns.svg" },
      { label: "Calendário editorial", slug: "calendario-editorial", iconSrc: "/svgs/sidebar/marketing/editorial_calendar.svg" },
      { label: "Leads", slug: "leads", iconSrc: "/svgs/sidebar/marketing/leads.svg" },
      { label: "Landing pages", slug: "landing-pages", iconSrc: "/svgs/sidebar/marketing/landing_pages.svg" },
      { label: "Métricas", slug: "metricas", iconSrc: "/svgs/sidebar/marketing/metrics.svg" },
      { label: "Automações", slug: "automacoes", iconSrc: "/svgs/sidebar/marketing/automations.svg" },
    ]),
  },
];

const userProfile = {
  name: "Matheus Barcellos",
  avatarSrc: "/images/placeholders/user.png",
};

const avatarImageClassName = "h-full w-full scale-110 object-cover";

function isGroupActive(item: NavigationItem, pathname: string) {
  if (item.href === "/") {
    return pathname === "/";
  }

  return pathname === item.href || pathname.startsWith(`${item.routeBase}/`);
}

function MenuIcon({
  src,
  className = "h-6 w-6 object-contain",
}: {
  src: string;
  className?: string;
}) {
  return (
    <img alt="" aria-hidden="true" className={["block shrink-0", className].join(" ")} src={src} />
  );
}

function MenuChildLink({
  child,
  onNavigate,
  active,
}: {
  child: NavigationChildItem;
  onNavigate?: () => void;
  active: boolean;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      href={child.href}
      onClick={onNavigate}
      className={[
        "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm font-medium transition-all duration-300 ease-out",
        active
          ? "border border-border bg-surface-2 text-foreground shadow-sm"
          : "border border-transparent text-sidebar-muted hover:bg-surface-2 hover:text-foreground",
      ].join(" ")}
    >
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
        <MenuIcon src={child.iconSrc} className="h-5 w-5" />
      </span>
      <span className="truncate">{child.label}</span>
    </Link>
  );
}

function MenuGroup({
  item,
  expanded,
  onNavigate,
  onToggle,
  active,
  pathname,
  rowRef,
}: {
  item: NavigationItem;
  expanded: boolean;
  onNavigate?: () => void;
  onToggle: (routeBase: string) => void;
  active: boolean;
  pathname: string;
  rowRef: (node: HTMLDivElement | null) => void;
}) {
  const hasChildren = item.children.length > 0;

  return (
    <div className="space-y-0.5">
      <div
        ref={rowRef}
        className={[
          "relative z-10 flex items-stretch overflow-hidden rounded-xl transition-all duration-300 ease-out",
          active
            ? "border border-border bg-surface-2 shadow-sm"
            : "border border-transparent",
        ].join(" ")}
      >
        <Link
          aria-current={active ? "page" : undefined}
          href={item.href}
          onClick={onNavigate}
          className={[
            "flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-1.5 text-sm font-medium transition-colors duration-300 ease-out",
            active
              ? "text-foreground"
              : "text-sidebar-muted hover:bg-surface-2 hover:text-foreground",
          ].join(" ")}
        >
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
            <MenuIcon src={item.iconSrc} className="h-6 w-6" />
          </span>
          <span className="truncate">{item.label}</span>
        </Link>

        {hasChildren ? (
          <button
            type="button"
            aria-label={`${expanded ? "Fechar" : "Abrir"} submenu de ${item.label}`}
            aria-expanded={expanded}
            onClick={() => onToggle(item.routeBase)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-sidebar-muted transition-colors duration-300 ease-out hover:bg-surface-2 hover:text-foreground"
          >
            <img
              alt=""
              aria-hidden="true"
              className={[
                "h-5 w-5 object-contain transition-transform duration-300 ease-out",
                expanded ? "rotate-180" : "rotate-0",
              ].join(" ")}
              src="/svgs/sidebar/common/arrow-dropdown.svg"
            />
          </button>
        ) : null}
      </div>

      {hasChildren && expanded ? (
        <div
          className="overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out max-h-96 opacity-100 translate-y-0"
        >
          <div className="ml-6 space-y-1 pt-1">
            {item.children.map((child) => (
              <MenuChildLink
                key={child.href}
                active={child.href === pathname}
                child={child}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuList({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [blobStyle, setBlobStyle] = useState<{
    opacity: number;
    top: number;
    height: number;
  }>({
    opacity: 0,
    top: 0,
    height: 0,
  });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const activeIndex = useMemo(
    () => navigation.findIndex((item) => isGroupActive(item, pathname)),
    [pathname],
  );
  const activeGroup = navigation[activeIndex];

  useLayoutEffect(() => {
    if (!activeGroup) {
      return;
    }

    if (!activeGroup.children.length) {
      setOpenGroups({});
      return;
    }

    setOpenGroups({ [activeGroup.routeBase]: true });
  }, [pathname, activeGroup?.routeBase]);

  useLayoutEffect(() => {
    const activeItem = itemRefs.current[activeIndex];

    if (!activeItem) {
      setBlobStyle((current) => ({ ...current, opacity: 0 }));
      return;
    }

    setBlobStyle({
      opacity: 1,
      top: activeItem.offsetTop,
      height: activeItem.offsetHeight,
    });
  }, [activeIndex, pathname]);

  function toggleGroup(routeBase: string) {
    setOpenGroups((current) => ({
      ...(current[routeBase] ? {} : { [routeBase]: true }),
    }));
  }

  return (
    <nav className="relative space-y-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 rounded-xl border border-border bg-surface-2 shadow-sm transition-[top,height,opacity] duration-300 ease-out"
        style={{
          opacity: blobStyle.opacity,
          top: blobStyle.top,
          height: blobStyle.height,
          left: 0,
          right: 0,
        }}
      />
      {navigation.map((item, index) => (
        <MenuGroup
          key={item.label}
          active={isGroupActive(item, pathname)}
          expanded={Boolean(openGroups[item.routeBase])}
          item={item}
          onNavigate={onNavigate}
          onToggle={toggleGroup}
          pathname={pathname}
          rowRef={(node) => {
            itemRefs.current[index] = node;
          }}
        />
      ))}
    </nav>
  );
}

function ProfileCard({
  className,
  onClick,
  active,
}: {
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div className={className}>
      <div
        className={[
          "flex items-center justify-between gap-2.5 rounded-2xl p-2.5 transition-all duration-300 ease-out",
          active
            ? "border border-border bg-surface-2 shadow-sm"
            : "border border-border bg-surface",
        ].join(" ")}
      >
        <Link
          aria-label="Abrir painel de perfil"
          href="/perfil"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-center gap-2.5 transition-all duration-300 ease-out hover:opacity-90"
        >
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-surface bg-muted shadow-sm">
            <img
              alt={userProfile.name}
              className={avatarImageClassName}
              src={userProfile.avatarSrc}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Seja bem-vindo</p>
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {userProfile.name}
            </p>
          </div>
        </Link>

        <Link
          aria-label="Deslogar"
          href="/logout"
          onClick={onClick}
          className="inline-flex flex-shrink-0 items-center justify-center rounded-full p-1.5 text-sidebar-muted transition-colors hover:text-foreground"
        >
          <img
            alt=""
            aria-hidden="true"
            className="h-[22px] w-[22px] object-contain"
            src="/svgs/sidebar/common/logout.svg"
          />
        </Link>
      </div>
    </div>
  );
}

export function SidebarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  function openMobileMenu() {
    setIsOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
  }

  function closeMobileMenu() {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 280);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle("sidebar-collapsed", isCollapsed);
  }, [isCollapsed]);

  return (
    <>
      <aside
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col lg:overflow-y-auto lg:border-r lg:border-sidebar-border lg:bg-sidebar"
        style={{
          width: isCollapsed ? "1.5rem" : "18rem",
          transition: "width 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="flex h-full min-w-[18rem] flex-col gap-2 p-3.5"
          style={{
            opacity: isCollapsed ? 0 : 1,
            pointerEvents: isCollapsed ? "none" : undefined,
            transition: "opacity 200ms ease-out",
          }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <BrandLogo className="my-4 h-8 w-auto max-w-full" />
              <ThemeToggleButton className="h-10 w-20" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Painel Administrativo
            </h2>
          </div>
          <MenuList />
          <div className="mt-auto" />
          <ProfileCard active={pathname === "/perfil"} />
        </div>
      </aside>

      <button
        type="button"
        aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
        onClick={() => setIsCollapsed((v) => !v)}
        className="fixed top-1/2 z-40 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-muted shadow-sm hover:text-foreground lg:flex"
        style={{
          left: isCollapsed ? "calc(1.5rem - 0.875rem)" : "calc(18rem - 0.875rem)",
          transition: "left 400ms cubic-bezier(0.22, 1, 0.36, 1), color 200ms ease-out, background-color 200ms ease-out",
        }}
      >
        <img
          alt=""
          aria-hidden="true"
          className="h-5 w-5 object-contain"
          style={{
            transform: isCollapsed ? "scaleX(-1)" : "scaleX(1)",
            transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          src="/svgs/sidebar/toggle_aside_menu_recreated.svg"
        />
      </button>

      <button
        type="button"
        onClick={openMobileMenu}
        className="inline-flex items-center justify-center rounded-full border border-border bg-surface p-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface-2 lg:hidden"
      >
        <img
          alt=""
          aria-hidden="true"
          className="h-7 w-7"
          src="/svgs/sidebar/common/open-mobile-menu.svg"
        />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" aria-hidden="true">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-foreground/50"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: "opacity 280ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
          <aside
            className="absolute left-0 top-0 flex h-full w-[min(82vw,18rem)] flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar p-4 shadow-2xl"
            style={{
              transform: isVisible ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <BrandLogo className="h-3.5 w-auto max-w-full" />
                  <ThemeToggleButton className="h-9 w-20" />
                </div>
                <h2 className="mt-2.5 text-xl font-semibold tracking-tight text-foreground">
                  Painel Administrativo
                </h2>
              </div>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="rounded-full border border-border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Fechar
              </button>
            </div>
            <div className="mt-8 flex-1">
              <MenuList onNavigate={closeMobileMenu} />
            </div>
            <div className="pt-6">
              <ProfileCard
                active={pathname === "/perfil"}
                onClick={closeMobileMenu}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
