"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type ReminderSource = "manual" | "kanban";
type ReminderStatus = "pending" | "done" | "cancelled";
type ReminderPriority = "low" | "medium" | "high";
type QuickFilter = "all" | "today" | "upcoming" | "overdue" | "done";

type Reminder = {
  id: string;
  title: string;
  description?: string;
  context?: string;
  source: ReminderSource;
  dueAt?: string;
  status: ReminderStatus;
  priority?: ReminderPriority;
  linkedKanbanCardId?: string;
  kanbanColumn?: string;
};

const agendaTimeZone = "America/Sao_Paulo";
const todayKey = "2026-04-22";

const reminders: Reminder[] = [
  {
    id: "rem-1",
    title: "Retornar mensagem de cliente",
    description: "Responder sobre o andamento da implantação e próximos passos.",
    context: "Atendimento comercial",
    source: "manual",
    dueAt: "2026-04-22T10:00:00-03:00",
    status: "pending",
    priority: "high",
  },
  {
    id: "rem-2",
    title: "Confirmar material de apresentação",
    description: "Validar se o deck comercial está atualizado para a reunião.",
    context: "Apresentação institucional",
    source: "manual",
    dueAt: "2026-04-22T14:00:00-03:00",
    status: "pending",
    priority: "medium",
  },
  {
    id: "rem-3",
    title: "Revisar proposta comercial",
    description: "Checar valores, escopo e condições antes do envio final.",
    context: "Proposta",
    source: "manual",
    dueAt: "2026-04-24T09:30:00-03:00",
    status: "pending",
    priority: "medium",
  },
  {
    id: "rem-4",
    title: "Enviar atualização do projeto",
    description: "Enviar resumo de progresso e pendências para o cliente.",
    context: "Projeto Orbit",
    source: "kanban",
    dueAt: "2026-04-25T16:00:00-03:00",
    status: "pending",
    priority: "high",
    linkedKanbanCardId: "kanban-181",
    kanbanColumn: "Em revisão",
  },
  {
    id: "rem-5",
    title: "Cobrar resposta pendente",
    description: "Solicitar retorno sobre aprovação de conteúdo.",
    context: "Cliente estratégico",
    source: "manual",
    dueAt: "2026-04-20T11:00:00-03:00",
    status: "pending",
    priority: "high",
  },
  {
    id: "rem-6",
    title: "Revisar pauta interna",
    description: "Organizar tópicos para reunião de alinhamento semanal.",
    context: "Operação interna",
    source: "manual",
    dueAt: "2026-04-21T17:00:00-03:00",
    status: "done",
    priority: "low",
  },
  {
    id: "rem-7",
    title: "Validar card do Kanban",
    description: "Checar se o card pode sair de validação para concluído.",
    context: "Kanban",
    source: "kanban",
    status: "pending",
    priority: "medium",
    linkedKanbanCardId: "kanban-190",
    kanbanColumn: "Validação",
  },
  {
    id: "rem-8",
    title: "Enviar follow-up no WhatsApp",
    description: "Mensagem curta de acompanhamento para retorno comercial.",
    context: "Comercial",
    source: "manual",
    dueAt: "2026-04-28T15:30:00-03:00",
    status: "cancelled",
  },
];

const sourceLabels: Record<ReminderSource, string> = {
  kanban: "Kanban",
  manual: "Manual",
};

const statusLabels: Record<ReminderStatus, string> = {
  cancelled: "Cancelado",
  done: "Concluído",
  pending: "Pendente",
};

const priorityLabels: Record<ReminderPriority, string> = {
  high: "Alta",
  low: "Baixa",
  medium: "Média",
};

const quickFilters: { label: string; value: QuickFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Hoje", value: "today" },
  { label: "Próximos", value: "upcoming" },
  { label: "Atrasados", value: "overdue" },
  { label: "Concluídos", value: "done" },
];

const sourceFilters: { label: string; value: ReminderSource }[] = [
  { label: "Manual", value: "manual" },
  { label: "Kanban", value: "kanban" },
];

const statusFilters: { label: string; value: ReminderStatus }[] = [
  { label: "Pendente", value: "pending" },
  { label: "Concluído", value: "done" },
  { label: "Cancelado", value: "cancelled" },
];

function reminderDateKey(reminder: Reminder) {
  return reminder.dueAt?.slice(0, 10);
}

function isOverdue(reminder: Reminder) {
  const dateKey = reminderDateKey(reminder);

  return Boolean(dateKey && dateKey < todayKey && reminder.status === "pending");
}

function isUpcoming(reminder: Reminder) {
  const dateKey = reminderDateKey(reminder);

  return Boolean(dateKey && dateKey > todayKey && reminder.status === "pending");
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

function groupReminders(items: Reminder[]) {
  return [
    {
      items: items.filter(isOverdue),
      title: "Atrasados",
    },
    {
      items: items.filter((item) => reminderDateKey(item) === todayKey),
      title: "Hoje",
    },
    {
      items: items.filter(isUpcoming),
      title: "Próximos",
    },
    {
      items: items.filter(
        (item) => !item.dueAt && item.status !== "done" && item.status !== "cancelled",
      ),
      title: "Sem data definida",
    },
    {
      items: items.filter((item) => item.status === "done"),
      title: "Concluídos recentes",
    },
    {
      items: items.filter((item) => item.status === "cancelled"),
      title: "Cancelados",
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

export function AgendaRemindersHeader() {
  function handleNewReminder() {
    console.log("Novo lembrete");
  }

  return (
    <header className="flex flex-col gap-5 rounded-3xl border border-panel-border bg-panel-surface px-5 py-5 shadow-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Agenda
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Lembretes
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Centralize avisos, retornos e pequenas pendências do dia a dia
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleNewReminder}
          className="inline-flex items-center justify-center rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
        >
          Novo lembrete
        </button>
        <Link
          href="/agenda"
          className="inline-flex items-center justify-center rounded-2xl border border-panel-border bg-panel-surface-muted px-5 py-3 text-sm font-semibold text-foreground transition hover:translate-y-[-1px] hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
        >
          Ver agenda
        </Link>
      </div>
    </header>
  );
}

export function AgendaRemindersStats({
  items,
  onSelectQuickFilter,
}: {
  items: Reminder[];
  onSelectQuickFilter: (value: QuickFilter) => void;
}) {
  const stats = [
    { filter: "all" as QuickFilter, label: "Total", value: items.length },
    {
      filter: "today" as QuickFilter,
      label: "Para hoje",
      value: items.filter((item) => reminderDateKey(item) === todayKey).length,
    },
    {
      filter: "overdue" as QuickFilter,
      label: "Atrasados",
      value: items.filter(isOverdue).length,
    },
    {
      filter: "done" as QuickFilter,
      label: "Concluídos",
      value: items.filter((item) => item.status === "done").length,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <button
          key={stat.label}
          type="button"
          onClick={() => onSelectQuickFilter(stat.filter)}
          className="rounded-3xl border border-panel-border bg-panel-surface p-5 text-left shadow-sm transition hover:translate-y-[-2px] hover:border-accent/60 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
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

export function AgendaRemindersFilters({
  activeQuickFilter,
  activeSource,
  activeStatus,
  query,
  setActiveQuickFilter,
  setActiveSource,
  setActiveStatus,
  setQuery,
}: {
  activeQuickFilter: QuickFilter;
  activeSource: ReminderSource | "all";
  activeStatus: ReminderStatus | "all";
  query: string;
  setActiveQuickFilter: (value: QuickFilter) => void;
  setActiveSource: (value: ReminderSource | "all") => void;
  setActiveStatus: (value: ReminderStatus | "all") => void;
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
          placeholder="Busque por título, descrição, contexto ou origem"
          className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Filtros rápidos">
        {quickFilters.map((filter) => (
          <FilterButton
            key={filter.value}
            active={activeQuickFilter === filter.value}
            onClick={() => setActiveQuickFilter(filter.value)}
          >
            {filter.label}
          </FilterButton>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="flex flex-wrap gap-2" aria-label="Filtro por origem">
          <FilterButton
            active={activeSource === "all"}
            onClick={() => setActiveSource("all")}
          >
            Todas as origens
          </FilterButton>
          {sourceFilters.map((filter) => (
            <FilterButton
              key={filter.value}
              active={activeSource === filter.value}
              onClick={() => setActiveSource(filter.value)}
            >
              {filter.label}
            </FilterButton>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end" aria-label="Filtro por status">
          <FilterButton
            active={activeStatus === "all"}
            onClick={() => setActiveStatus("all")}
          >
            Todos os status
          </FilterButton>
          {statusFilters.map((filter) => (
            <FilterButton
              key={filter.value}
              active={activeStatus === filter.value}
              onClick={() => setActiveStatus(filter.value)}
            >
              {filter.label}
            </FilterButton>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AgendaRemindersListItem({ item }: { item: Reminder }) {
  function handleAction(action: string) {
    console.log(action, item.id);
  }

  return (
    <article className="grid gap-4 rounded-3xl border border-panel-border bg-panel-surface-muted/70 p-4 transition hover:bg-panel-surface lg:grid-cols-[1fr_auto]">
      <button
        type="button"
        onClick={() => handleAction("abrir")}
        className="min-w-0 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
          {item.priority ? <Badge>{priorityLabels[item.priority]}</Badge> : null}
        </div>
        {item.description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{statusLabels[item.status]}</Badge>
          <Badge>{sourceLabels[item.source]}</Badge>
          {item.dueAt ? (
            <>
              <Badge>{formatDate(item.dueAt)}</Badge>
              <Badge>{formatTime(item.dueAt)}</Badge>
            </>
          ) : (
            <Badge>Sem horário</Badge>
          )}
          {item.linkedKanbanCardId ? <Badge>Vinculado ao Kanban</Badge> : null}
        </div>
        {item.context || item.kanbanColumn ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {item.context}
            {item.kanbanColumn ? ` · Kanban: ${item.kanbanColumn}` : ""}
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

export function AgendaRemindersList({ items }: { items: Reminder[] }) {
  const groups = groupReminders(items);

  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Lista de lembretes
        </h2>
        <Badge>{items.length} itens</Badge>
      </div>

      <div className="mt-5 space-y-6">
        {groups.length === 0 ? (
          <EmptyState
            title="Nenhum lembrete encontrado"
            description="Ajuste a busca ou os filtros para localizar outros lembretes."
          />
        ) : (
          groups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <AgendaRemindersListItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function AgendaRemindersAside({ items }: { items: Reminder[] }) {
  const priorityItems = items
    .filter((item) => item.priority === "high" && item.status === "pending")
    .slice(0, 3);

  return (
    <aside className="rounded-3xl border border-panel-border bg-panel-surface p-5 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Prioritários
      </h2>
      <div className="mt-4 space-y-3">
        {priorityItems.length === 0 ? (
          <EmptyState
            title="Sem prioridades"
            description="Lembretes de alta prioridade aparecerão aqui."
          />
        ) : (
          priorityItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-panel-border bg-panel-surface-muted/70 p-4"
            >
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.dueAt ? `${formatDate(item.dueAt)} · ${formatTime(item.dueAt)}` : "Sem data definida"}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export function AgendaRemindersPage() {
  const [query, setQuery] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter>("all");
  const [activeSource, setActiveSource] = useState<ReminderSource | "all">("all");
  const [activeStatus, setActiveStatus] = useState<ReminderStatus | "all">("all");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reminders
      .filter((item) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          item.title,
          item.description,
          item.context,
          sourceLabels[item.source],
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));
      })
      .filter((item) => activeSource === "all" || item.source === activeSource)
      .filter((item) => activeStatus === "all" || item.status === activeStatus)
      .filter((item) => {
        if (activeQuickFilter === "today") {
          return reminderDateKey(item) === todayKey;
        }
        if (activeQuickFilter === "upcoming") {
          return isUpcoming(item);
        }
        if (activeQuickFilter === "overdue") {
          return isOverdue(item);
        }
        if (activeQuickFilter === "done") {
          return item.status === "done";
        }

        return true;
      })
      .sort((left, right) => {
        if (!left.dueAt) {
          return 1;
        }
        if (!right.dueAt) {
          return -1;
        }

        return left.dueAt.localeCompare(right.dueAt);
      });
  }, [activeQuickFilter, activeSource, activeStatus, query]);

  return (
    <section className="flex min-h-[calc(100vh-4rem)] w-full flex-1">
      <div className="relative min-h-[calc(100vh-4rem)] flex-1 overflow-hidden rounded-[2rem] border border-panel-border bg-panel p-4 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06),0_24px_80px_hsl(var(--background)/0.18)] sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,hsl(var(--accent)/0.10),transparent_48%)]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5">
          <AgendaRemindersHeader />
          <AgendaRemindersStats
            items={reminders}
            onSelectQuickFilter={setActiveQuickFilter}
          />
          <AgendaRemindersFilters
            activeQuickFilter={activeQuickFilter}
            activeSource={activeSource}
            activeStatus={activeStatus}
            query={query}
            setActiveQuickFilter={setActiveQuickFilter}
            setActiveSource={setActiveSource}
            setActiveStatus={setActiveStatus}
            setQuery={setQuery}
          />

          <div className="grid gap-5 xl:grid-cols-[1fr_21rem]">
            <AgendaRemindersList items={filteredItems} />
            <AgendaRemindersAside items={reminders} />
          </div>
        </div>
      </div>
    </section>
  );
}
