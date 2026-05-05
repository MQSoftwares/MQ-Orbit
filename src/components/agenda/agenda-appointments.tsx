"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type AppointmentType = "event" | "deadline" | "reminder";
type AppointmentSource = "manual" | "kanban";
type AppointmentStatus = "scheduled" | "done" | "cancelled";
type AppointmentPriority = "Alta" | "Média" | "Baixa";
type StatusFilter = "all" | "scheduled" | "overdue" | "done";

type Appointment = {
  id: string;
  title: string;
  description?: string;
  type: AppointmentType;
  source: AppointmentSource;
  startAt: string;
  endAt?: string;
  status: AppointmentStatus;
  priority?: AppointmentPriority;
  linkedKanbanCardId?: string;
  kanbanColumn?: string;
};

const agendaTimeZone = "America/Sao_Paulo";
const todayKey = "2026-04-22";

const appointments: Appointment[] = [
  {
    id: "appt-1",
    title: "Reunião interna de alinhamento",
    description: "Revisão rápida das prioridades operacionais da semana.",
    type: "event",
    source: "manual",
    startAt: "2026-04-22T09:00:00-03:00",
    endAt: "2026-04-22T09:45:00-03:00",
    status: "scheduled",
    priority: "Média",
  },
  {
    id: "appt-2",
    title: "Entrega de landing page",
    description: "Prazo vinculado ao card de validação visual do projeto.",
    type: "deadline",
    source: "kanban",
    startAt: "2026-04-23T18:00:00-03:00",
    status: "scheduled",
    priority: "Alta",
    linkedKanbanCardId: "kanban-151",
    kanbanColumn: "Validação",
  },
  {
    id: "appt-3",
    title: "Follow-up com cliente",
    description: "Confirmar próximos passos da implantação e pendências abertas.",
    type: "event",
    source: "manual",
    startAt: "2026-04-24T14:30:00-03:00",
    endAt: "2026-04-24T15:00:00-03:00",
    status: "scheduled",
  },
  {
    id: "appt-4",
    title: "Revisão de tarefas da semana",
    description: "Checar tarefas em revisão e itens bloqueados no Kanban.",
    type: "reminder",
    source: "kanban",
    startAt: "2026-04-22T16:00:00-03:00",
    status: "scheduled",
    linkedKanbanCardId: "kanban-142",
    kanbanColumn: "Em revisão",
  },
  {
    id: "appt-5",
    title: "Prazo de card no Kanban",
    description: "Ajustes do painel administrativo precisam ser finalizados.",
    type: "deadline",
    source: "kanban",
    startAt: "2026-04-18T17:00:00-03:00",
    status: "scheduled",
    priority: "Alta",
    linkedKanbanCardId: "kanban-158",
    kanbanColumn: "Em desenvolvimento",
  },
  {
    id: "appt-6",
    title: "Lembrete de retorno comercial",
    description: "Enviar atualização sobre proposta e prazo de aprovação.",
    type: "reminder",
    source: "manual",
    startAt: "2026-04-27T09:15:00-03:00",
    status: "scheduled",
    priority: "Baixa",
  },
  {
    id: "appt-7",
    title: "Reunião de arquitetura da API",
    description: "Definir contratos de autenticação, notificações e pagamentos.",
    type: "event",
    source: "manual",
    startAt: "2026-04-28T10:00:00-03:00",
    endAt: "2026-04-28T11:00:00-03:00",
    status: "done",
    priority: "Média",
  },
  {
    id: "appt-8",
    title: "Revisão administrativa",
    description: "Conferência de documentação e pendências internas.",
    type: "event",
    source: "manual",
    startAt: "2026-04-21T15:00:00-03:00",
    status: "cancelled",
  },
];

const typeLabels: Record<AppointmentType, string> = {
  deadline: "Cards",
  event: "Evento",
  reminder: "Lembrete",
};

const sourceLabels: Record<AppointmentSource, string> = {
  kanban: "Kanban",
  manual: "Manual",
};

const statusLabels: Record<AppointmentStatus, string> = {
  cancelled: "Cancelado",
  done: "Concluído",
  scheduled: "Agendado",
};

const typeFilters: { label: string; value: AppointmentType }[] = [
  { label: "Evento", value: "event" },
  { label: "Cards", value: "deadline" },
  { label: "Lembrete", value: "reminder" },
];

function itemDateKey(item: Appointment) {
  return item.startAt.slice(0, 10);
}

function isOverdue(item: Appointment) {
  return itemDateKey(item) < todayKey && item.status === "scheduled";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: agendaTimeZone,
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: agendaTimeZone,
  }).format(new Date(value));
}

function groupAppointments(items: Appointment[]) {
  return [
    {
      items: items.filter((item) => itemDateKey(item) < todayKey),
      title: "Atrasados",
    },
    {
      items: items.filter((item) => itemDateKey(item) === todayKey),
      title: "Hoje",
    },
    {
      items: items.filter((item) => itemDateKey(item) > todayKey),
      title: "Próximos dias",
    },
  ].filter((group) => group.items.length > 0);
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-panel-border bg-panel-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      {children}
    </span>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-panel-border bg-panel-surface-muted/70 px-5 py-12 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent",
        active
          ? "border-accent bg-accent/10 text-foreground"
          : "border-panel-border bg-panel-surface-muted text-muted-foreground hover:bg-panel-surface",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function AgendaAppointmentsHeader() {
  return (
    <header className="flex flex-col gap-5 rounded-3xl border border-panel-border bg-panel-surface px-5 py-5 shadow-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Agenda
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Compromissos
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Acompanhe e organize seus itens agendados em uma visão de lista
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/agenda/calendario?novo=compromisso"
          className="inline-flex items-center justify-center rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
        >
          Novo compromisso
        </Link>
        <Link
          href="/agenda/calendario"
          className="inline-flex items-center justify-center rounded-2xl border border-panel-border bg-panel-surface-muted px-5 py-3 text-sm font-semibold text-foreground transition hover:translate-y-[-1px] hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
        >
          Ver calendário
        </Link>
      </div>
    </header>
  );
}

export function AgendaAppointmentsFilters({
  activeType,
  query,
  setActiveType,
  setQuery,
}: {
  activeType: AppointmentType | "all";
  query: string;
  setActiveType: (value: AppointmentType | "all") => void;
  setQuery: (value: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-4 shadow-sm sm:p-5">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Buscar
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque por título, descrição, origem ou tipo"
          className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Filtro por tipo">
        <FilterButton
          active={activeType === "all"}
          onClick={() => setActiveType("all")}
        >
          Todos os tipos
        </FilterButton>
        {typeFilters.map((filter) => (
          <FilterButton
            key={filter.value}
            active={activeType === filter.value}
            onClick={() => setActiveType(filter.value)}
          >
            {filter.label}
          </FilterButton>
        ))}
      </div>
    </section>
  );
}

export function AgendaAppointmentsStats({
  activeStatus,
  items,
  onSelectStatus,
}: {
  activeStatus: StatusFilter;
  items: Appointment[];
  onSelectStatus: (value: StatusFilter) => void;
}) {
  const stats = [
    { label: "Total", value: items.length, filter: "all" as StatusFilter },
    {
      label: "Agendados",
      value: items.filter((item) => item.status === "scheduled" && !isOverdue(item)).length,
      filter: "scheduled" as StatusFilter,
    },
    {
      label: "Atrasados",
      value: items.filter(isOverdue).length,
      filter: "overdue" as StatusFilter,
    },
    {
      label: "Concluídos",
      value: items.filter((item) => item.status === "done").length,
      filter: "done" as StatusFilter,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <button
          key={stat.label}
          type="button"
          onClick={() => onSelectStatus(stat.filter)}
          className={[
            "rounded-3xl border bg-panel-surface p-5 text-left shadow-sm transition hover:translate-y-[-2px] hover:border-accent/60 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel",
            activeStatus === stat.filter ? "border-accent" : "border-panel-border",
          ].join(" ")}
        >
          <span className="text-sm font-medium text-muted-foreground">
            {stat.label}
          </span>
          <span className="mt-3 block text-3xl font-semibold tracking-tight text-foreground">
            {stat.value}
          </span>
        </button>
      ))}
    </section>
  );
}

export function AgendaAppointmentsListItem({ item }: { item: Appointment }) {
  function handleAction(action: string) {
    console.log(action, item.id);
  }

  return (
    <article className="grid gap-4 rounded-3xl border border-panel-border bg-panel-surface-muted/70 p-4 transition hover:bg-panel-surface lg:grid-cols-[9rem_1fr_auto]">
      <button
        type="button"
        onClick={() => handleAction("visualizar")}
        className="text-left"
      >
        <p className="text-sm font-semibold text-foreground">
          {formatDate(item.startAt)}
        </p>
        <p className="mt-1 text-xs font-semibold text-accent">
          {formatTime(item.startAt)}
        </p>
      </button>

      <button
        type="button"
        onClick={() => handleAction("visualizar")}
        className="min-w-0 text-left"
      >
        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
        {item.description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{typeLabels[item.type]}</Badge>
          <Badge>{sourceLabels[item.source]}</Badge>
          <Badge>{statusLabels[item.status]}</Badge>
          {item.priority ? <Badge>{item.priority}</Badge> : null}
          {item.linkedKanbanCardId ? <Badge>Vinculado ao Kanban</Badge> : null}
        </div>
        {item.kanbanColumn ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Coluna do Kanban: {item.kanbanColumn}
          </p>
        ) : null}
      </button>

      <div className="flex flex-wrap items-start gap-2 lg:justify-end">
        <button
          type="button"
          onClick={() => handleAction("editar")}
          className="rounded-full border border-panel-border bg-panel-surface px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-panel-surface-muted"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => handleAction("concluir")}
          className="rounded-full border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent/15"
        >
          Concluir
        </button>
      </div>
    </article>
  );
}

export function AgendaAppointmentsList({ items }: { items: Appointment[] }) {
  const groups = groupAppointments(items);

  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Lista de compromissos
        </h2>
        <Badge>{items.length} itens</Badge>
      </div>

      <div className="mt-5 space-y-6">
        {groups.length === 0 ? (
          <EmptyState
            title="Nenhum compromisso encontrado"
            description="Ajuste a busca ou os filtros para localizar outros itens da agenda."
          />
        ) : (
          groups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <AgendaAppointmentsListItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function AgendaAppointmentsPage() {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<AppointmentType | "all">("all");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return appointments
      .filter((item) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          item.title,
          item.description,
          typeLabels[item.type],
          sourceLabels[item.source],
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));
      })
      .filter((item) => activeType === "all" || item.type === activeType)
      .filter((item) => {
        if (activeStatus === "overdue") {
          return isOverdue(item);
        }
        if (activeStatus === "scheduled") {
          return item.status === "scheduled" && !isOverdue(item);
        }

        return activeStatus === "all" || item.status === activeStatus;
      })
      .sort((left, right) => left.startAt.localeCompare(right.startAt));
  }, [activeStatus, activeType, query]);

  return (
    <section className="flex min-h-[calc(100vh-4rem)] w-full flex-1">
      <div className="relative min-h-[calc(100vh-4rem)] flex-1 overflow-hidden rounded-[2rem] border border-panel-border bg-panel p-4 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06),0_24px_80px_hsl(var(--background)/0.18)] sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,hsl(var(--accent)/0.10),transparent_48%)]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5">
          <AgendaAppointmentsHeader />
          <AgendaAppointmentsFilters
            activeType={activeType}
            query={query}
            setActiveType={setActiveType}
            setQuery={setQuery}
          />
          <AgendaAppointmentsStats
            activeStatus={activeStatus}
            items={appointments}
            onSelectStatus={setActiveStatus}
          />
          <AgendaAppointmentsList items={filteredItems} />
        </div>
      </div>
    </section>
  );
}
