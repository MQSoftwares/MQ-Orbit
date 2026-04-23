"use client";

import { BrandLogo } from "@/components/brand/brand-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const dropdownItemLabels = ["teste_1", "teste_2", "teste_3", "teste_4", "teste_5"] as const;
const agendaDropdownItems = [
  { label: "Calendário", slug: "calendario" },
  { label: "Compromissos", slug: "compromissos" },
  { label: "Lembretes", slug: "lembretes" },
] as const;

type NavigationChildItem = {
  label: string;
  href: string;
  iconSrc: string;
};

type NavigationItem = NavigationChildItem & {
  routeBase: string;
  children: NavigationChildItem[];
};

function createChildren(routeBase: string, iconSrc: string): NavigationChildItem[] {
  return dropdownItemLabels.map((label) => ({
    label,
    href: `${routeBase}/${label}`,
    iconSrc,
  }));
}

function createAgendaChildren(iconSrc: string): NavigationChildItem[] {
  return agendaDropdownItems.map((item) => ({
    label: item.label,
    href: `/agenda/${item.slug}`,
    iconSrc,
  }));
}

const navigation: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    routeBase: "/home",
    iconSrc: "/svgs/sidebar/home.svg",
    children: createChildren("/home", "/svgs/sidebar/home.svg"),
  },
  {
    label: "Agenda",
    href: "/agenda",
    routeBase: "/agenda",
    iconSrc: "/svgs/sidebar/calendar.svg",
    children: createAgendaChildren("/svgs/sidebar/calendar.svg"),
  },
  {
    label: "Kanban",
    href: "/kanban",
    routeBase: "/kanban",
    iconSrc: "/svgs/sidebar/kanban.svg",
    children: createChildren("/kanban", "/svgs/sidebar/kanban.svg"),
  },
  {
    label: "Administrativo",
    href: "/administrativo",
    routeBase: "/administrativo",
    iconSrc: "/svgs/sidebar/adm.svg",
    children: createChildren("/administrativo", "/svgs/sidebar/adm.svg"),
  },
  {
    label: "Finanças",
    href: "/financas",
    routeBase: "/financas",
    iconSrc: "/svgs/sidebar/money.svg",
    children: createChildren("/financas", "/svgs/sidebar/money.svg"),
  },
  {
    label: "Arquivos",
    href: "/arquivos",
    routeBase: "/arquivos",
    iconSrc: "/svgs/sidebar/files.svg",
    children: createChildren("/arquivos", "/svgs/sidebar/files.svg"),
  },
  {
    label: "Design",
    href: "/design",
    routeBase: "/design",
    iconSrc: "/svgs/sidebar/design.svg",
    children: createChildren("/design", "/svgs/sidebar/design.svg"),
  },
  {
    label: "Marketing",
    href: "/marketing",
    routeBase: "/marketing",
    iconSrc: "/svgs/sidebar/marketing.svg",
    children: createChildren("/marketing", "/svgs/sidebar/marketing.svg"),
  },
];

const userProfile = {
  name: "Matheus Barcellos",
  avatarSrc: "/images/placeholders/user.png",
};

const avatarImageClassName = "h-full w-full scale-110 object-cover";

function isGroupActive(item: NavigationItem, pathname: string) {
  if (item.href === "/") {
    return pathname === "/" || pathname.startsWith("/home/");
  }

  return pathname === item.href || pathname.startsWith(`${item.routeBase}/`);
}

function MenuIcon({
  src,
  className = "h-7 w-7",
}: {
  src: string;
  className?: string;
}) {
  return (
    <img alt="" aria-hidden="true" className={className} src={src} />
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
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ease-out",
            active
              ? "border border-border bg-surface-2 text-foreground shadow-sm"
              : "border border-transparent text-sidebar-muted hover:bg-surface-2 hover:text-foreground",
          ].join(" ")}
        >
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
        <MenuIcon src={child.iconSrc} className="h-6 w-6" />
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
  return (
    <div className="space-y-1">
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
            "flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-sm font-medium transition-colors duration-300 ease-out",
            active
              ? "text-foreground"
              : "text-sidebar-muted hover:bg-surface-2 hover:text-foreground",
          ].join(" ")}
        >
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center">
            <MenuIcon src={item.iconSrc} />
          </span>
          <span className="truncate">{item.label}</span>
        </Link>

        <button
          type="button"
          aria-label={`${expanded ? "Fechar" : "Abrir"} submenu de ${item.label}`}
          aria-expanded={expanded}
          onClick={() => onToggle(item.routeBase)}
          className="inline-flex w-11 shrink-0 items-center justify-center text-sidebar-muted transition-colors duration-300 ease-out hover:bg-surface-2 hover:text-foreground"
        >
          <img
            alt=""
            aria-hidden="true"
            className={[
              "h-5 w-5 transition-transform duration-300 ease-out",
              expanded ? "rotate-180" : "rotate-0",
            ].join(" ")}
            src="/svgs/sidebar/arrow_drop_menu.svg"
          />
        </button>
      </div>

      <div
        className={[
          "overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out",
          expanded
            ? "max-h-96 opacity-100 translate-y-0"
            : "pointer-events-none max-h-0 -translate-y-1 opacity-0",
        ].join(" ")}
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

    setOpenGroups((current) =>
      current[activeGroup.routeBase]
        ? current
        : { ...current, [activeGroup.routeBase]: true },
    );
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
      ...current,
      [routeBase]: !current[routeBase],
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
          "flex items-center justify-between gap-3 rounded-2xl p-3 transition-all duration-300 ease-out",
          active
            ? "border border-border bg-surface-2 shadow-sm"
            : "border border-border bg-surface",
        ].join(" ")}
      >
        <Link
          aria-label="Abrir painel de perfil"
          href="/perfil"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-center gap-3 transition-all duration-300 ease-out hover:opacity-90"
        >
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-surface bg-muted shadow-sm">
            <img
              alt={userProfile.name}
              className={avatarImageClassName}
              src={userProfile.avatarSrc}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Seja bem-vindo</p>
            <p className="truncate text-base font-semibold tracking-tight text-foreground">
              {userProfile.name}
            </p>
          </div>
        </Link>

        <Link
          aria-label="Deslogar"
          href="/logout"
          onClick={onClick}
          className="inline-flex flex-shrink-0 items-center justify-center rounded-full p-2 text-sidebar-muted transition-colors hover:text-foreground"
        >
          <img
            alt=""
            aria-hidden="true"
            className="h-7 w-7"
            src="/svgs/sidebar/logout.svg"
          />
        </Link>
      </div>
    </div>
  );
}

export function SidebarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-80 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-sidebar-border lg:bg-sidebar">
        <div className="flex h-full flex-col gap-2 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BrandLogo className="my-5 h-10 w-auto max-w-full" />
              <ThemeToggleButton />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
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
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-border bg-surface p-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface-2 lg:hidden"
      >
        <img
          alt=""
          aria-hidden="true"
          className="h-7 w-7"
          src="/svgs/sidebar/open_menu_mobile.svg"
        />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" aria-hidden="true">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-foreground/50"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(85vw,20rem)] flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <BrandLogo className="h-4 w-auto max-w-full" />
                  <ThemeToggleButton />
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Painel Administrativo
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-border px-3 py-1 text-sm font-medium text-muted-foreground"
              >
                Fechar
              </button>
            </div>
            <div className="mt-8 flex-1">
              <MenuList onNavigate={() => setIsOpen(false)} />
            </div>
            <div className="pt-6">
              <ProfileCard
                active={pathname === "/perfil"}
                onClick={() => setIsOpen(false)}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
