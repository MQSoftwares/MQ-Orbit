"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
};

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  accent?: string;
};

type SectionCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

type PillProps = {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
};

type FilterBarProps = {
  search: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  filters?: Array<{
    active: boolean;
    label: string;
    onClick: () => void;
  }>;
  trailing?: ReactNode;
};

type TableColumn<T> = {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  items: T[];
  columns: TableColumn<T>[];
  getKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  selectedKey?: string;
};

type DrawerProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

type ProgressProps = {
  value: number;
  label?: string;
};

type TimelineItem = {
  title: string;
  description: string;
  time: string;
  tone?: "default" | "accent" | "warning";
};

type TimelineProps = {
  items: TimelineItem[];
};

type MetricBarsProps = {
  items: Array<{
    label: string;
    value: number;
    hint?: string;
  }>;
  unit?: string;
};

function mergeClassNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <header className="rounded-[2rem] border border-border bg-surface/95 p-5 shadow-[0_20px_60px_rgba(2,11,37,0.06)] backdrop-blur sm:p-6">
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href ? (
                <Link className="transition hover:text-foreground" href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

export function StatCard({ label, value, detail, accent }: StatCardProps) {
  return (
    <article className="rounded-[1.6rem] border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        {accent ? (
          <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-foreground">
            {accent}
          </span>
        ) : null}
      </div>
      {detail ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
      ) : null}
    </article>
  );
}

export function StatGrid({ items }: { items: StatCardProps[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={mergeClassNames(
        "rounded-[1.8rem] border border-border bg-surface p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-border bg-surface/80 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Pill({ children, tone = "default" }: PillProps) {
  const toneClassName = {
    default: "border-border bg-surface-2 text-foreground",
    accent: "border-accent/25 bg-accent/10 text-foreground",
    success: "border-[#279890]/25 bg-[#279890]/10 text-foreground",
    warning: "border-[#FFA500]/30 bg-[#FFA500]/10 text-foreground",
    danger: "border-[#0F3A53]/25 bg-[#0F3A53]/10 text-foreground",
  }[tone];

  return (
    <span
      className={mergeClassNames(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
        toneClassName,
      )}
    >
      {children}
    </span>
  );
}

export function FilterBar({
  search,
  searchPlaceholder = "Buscar",
  onSearchChange,
  filters = [],
  trailing,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.6rem] border border-border bg-surface p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3">
        <span aria-hidden="true" className="text-sm text-muted-foreground">
          Buscar
        </span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      {filters.length ? (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={filter.onClick}
              className={mergeClassNames(
                "rounded-full border px-3 py-2 text-xs font-semibold transition",
                filter.active
                  ? "border-accent/25 bg-accent/10 text-foreground"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      ) : null}

      {trailing ? <div className="flex flex-wrap gap-2">{trailing}</div> : null}
    </div>
  );
}

export function DataTable<T>({
  items,
  columns,
  getKey,
  onRowClick,
  selectedKey,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-border bg-surface shadow-sm">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-2/70">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={mergeClassNames(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            const key = getKey(item);
            const active = selectedKey === key;

            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={mergeClassNames(
                  onRowClick ? "cursor-pointer transition hover:bg-surface-2/70" : "",
                  active ? "bg-accent/5" : "",
                )}
              >
                {columns.map((column) => (
                  <td
                    key={`${key}-${column.header}`}
                    className={mergeClassNames(
                      "px-4 py-4 align-top text-sm text-foreground",
                      column.className,
                    )}
                  >
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Drawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: DrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar painel"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/45 backdrop-blur-[2px]"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col border-l border-border bg-surface shadow-[0_30px_90px_rgba(2,11,37,0.35)]">
        <div className="border-b border-border px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Detalhes
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              {subtitle ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-surface"
            >
              Fechar
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <div className="border-t border-border px-5 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
}

export function ProgressBar({ value, label }: ProgressProps) {
  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span
              className={mergeClassNames(
                "mt-1 h-3 w-3 rounded-full",
                item.tone === "accent"
                  ? "bg-accent"
                  : item.tone === "warning"
                    ? "bg-[#FFA500]"
                    : "bg-[#279890]",
              )}
            />
            {index < items.length - 1 ? (
              <span className="mt-2 h-full w-px flex-1 bg-border" />
            ) : null}
          </div>
          <div className="pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {item.time}
            </p>
            <h4 className="mt-1 text-sm font-semibold text-foreground">
              {item.title}
            </h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetricBars({ items, unit }: MetricBarsProps) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="font-semibold text-muted-foreground">
              {item.value}
              {unit ? unit : ""}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          {item.hint ? (
            <p className="text-xs leading-5 text-muted-foreground">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function MiniChart({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: number }>;
}) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="rounded-[1.6rem] border border-border bg-surface p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <Pill tone="accent">Mock</Pill>
      </div>
      <div className="grid grid-cols-6 items-end gap-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-2 text-center">
            <div className="flex h-32 items-end rounded-[1rem] bg-surface-2 p-2">
              <div
                className="w-full rounded-[0.85rem] bg-accent/80"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AvatarStack({
  initials,
}: {
  initials: string[];
}) {
  return (
    <div className="flex -space-x-2">
      {initials.map((initial, index) => (
        <span
          key={`${initial}-${index}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-surface bg-accent/10 text-[11px] font-semibold text-foreground"
        >
          {initial}
        </span>
      ))}
    </div>
  );
}

export function Dialog({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-2xl rounded-[2rem] border border-border bg-surface p-5 shadow-[0_30px_90px_rgba(2,11,37,0.35)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Modal
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-surface"
          >
            Fechar
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

