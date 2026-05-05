"use client";

import Link from "next/link";

type AgendaItemType = "Evento" | "Prazo" | "Lembrete";
type AgendaItemSource = "Manual" | "Kanban";
type AgendaItemStatus = "Confirmado" | "Pendente" | "Em atenção" | "Atrasado";
type AgendaPriority = "Alta" | "Média" | "Baixa";

type AgendaItem = {
  id: string;
  title: string;
  type: AgendaItemType;
  source: AgendaItemSource;
  startAt: string;
  endAt?: string;
  status: AgendaItemStatus;
  priority?: AgendaPriority;
  linkedKanbanCardId?: string;
  kanbanColumn?: string;
};

const agendaTimeZone = "America/Sao_Paulo";

const todayItems: AgendaItem[] = [
  {
    id: "today-1",
    title: "Reunião interna de operação",
    type: "Evento",
    source: "Manual",
    startAt: "2026-04-22T09:00:00",
    endAt: "2026-04-22T09:45:00",
    status: "Confirmado",
  },
  {
    id: "today-2",
    title: "Alinhamento do projeto Orbit",
    type: "Evento",
    source: "Manual",
    startAt: "2026-04-22T11:30:00",
    endAt: "2026-04-22T12:00:00",
    status: "Confirmado",
  },
  {
    id: "today-3",
    title: "Revisão de tarefas do Kanban",
    type: "Lembrete",
    source: "Kanban",
    startAt: "2026-04-22T16:00:00",
    status: "Pendente",
    linkedKanbanCardId: "kanban-142",
    kanbanColumn: "Em revisão",
  },
];

const upcomingItems: AgendaItem[] = [
  ...todayItems,
  {
    id: "upcoming-1",
    title: "Entrega de landing page institucional",
    type: "Prazo",
    source: "Kanban",
    startAt: "2026-04-23T10:00:00",
    status: "Em atenção",
    priority: "Alta",
    linkedKanbanCardId: "kanban-151",
    kanbanColumn: "Validação",
  },
  {
    id: "upcoming-2",
    title: "Follow-up de cliente estratégico",
    type: "Evento",
    source: "Manual",
    startAt: "2026-04-24T14:30:00",
    endAt: "2026-04-24T15:00:00",
    status: "Confirmado",
  },
  {
    id: "upcoming-3",
    title: "Revisão de proposta comercial",
    type: "Lembrete",
    source: "Manual",
    startAt: "2026-04-27T09:15:00",
    status: "Pendente",
  },
];

const kanbanDeadlines: AgendaItem[] = [
  {
    id: "kanban-deadline-1",
    title: "Landing page MQ Softwares",
    type: "Prazo",
    source: "Kanban",
    startAt: "2026-04-23T18:00:00",
    status: "Em atenção",
    priority: "Alta",
    linkedKanbanCardId: "kanban-151",
    kanbanColumn: "Validação",
  },
  {
    id: "kanban-deadline-2",
    title: "Ajustes do painel administrativo",
    type: "Prazo",
    source: "Kanban",
    startAt: "2026-04-24T17:00:00",
    status: "Pendente",
    priority: "Média",
    linkedKanbanCardId: "kanban-158",
    kanbanColumn: "Em desenvolvimento",
  },
  {
    id: "kanban-deadline-3",
    title: "Revisão visual do módulo Agenda",
    type: "Prazo",
    source: "Kanban",
    startAt: "2026-04-27T12:00:00",
    status: "Pendente",
    priority: "Média",
    linkedKanbanCardId: "kanban-163",
    kanbanColumn: "Backlog priorizado",
  },
  {
    id: "kanban-deadline-4",
    title: "Checklist de publicação",
    type: "Prazo",
    source: "Kanban",
    startAt: "2026-04-28T15:30:00",
    status: "Pendente",
    priority: "Baixa",
    linkedKanbanCardId: "kanban-170",
    kanbanColumn: "Aguardando início",
  },
];

const summaryCards = [
  { title: "Hoje", value: todayItems.length, detail: "compromissos do dia" },
  { title: "Próximos 7 dias", value: 11, detail: "itens programados" },
  { title: "Prazos do Kanban", value: kanbanDeadlines.length, detail: "cards com prazo próximo" },
  { title: "Atrasados", value: 1, detail: "item vencido" },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: agendaTimeZone,
  }).format(parseAgendaDate(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: agendaTimeZone,
  }).format(parseAgendaDate(value));
}

function formatToday() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: agendaTimeZone,
  }).format(new Date());
}

function parseAgendaDate(value: string) {
  return new Date(`${value}-03:00`);
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-panel-border bg-panel-surface-muted/70 px-5 py-8 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
      {label}
    </span>
  );
}

export function AgendaOverviewHeader() {
  function handleNewItem() {
    console.log("Novo item da agenda");
  }

  return (
    <header className="flex flex-col gap-5 rounded-3xl border border-panel-border bg-panel-surface px-5 py-5 shadow-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Visão geral
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Agenda
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Sua visão rápida de compromissos, prazos e lembretes
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleNewItem}
          className="inline-flex items-center justify-center rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
        >
          Novo item
        </button>
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

export function AgendaOverviewStats() {
  return (
    <section
      aria-label="Resumo da agenda"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {summaryCards.map((card) => (
        <button
          key={card.title}
          type="button"
          className="group rounded-3xl border border-panel-border bg-panel-surface p-5 text-left shadow-sm transition hover:translate-y-[-2px] hover:border-accent/60 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
        >
          <span className="text-sm font-medium text-muted-foreground">
            {card.title}
          </span>
          <span className="mt-4 block text-4xl font-semibold tracking-tight text-foreground">
            {card.value}
          </span>
          <span className="mt-2 block text-xs font-medium text-muted-foreground">
            {card.detail}
          </span>
        </button>
      ))}
    </section>
  );
}

export function AgendaTodayPanel({ items = todayItems }: { items?: AgendaItem[] }) {
  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Hoje
        </h2>
        <p className="text-sm capitalize text-muted-foreground">{formatToday()}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <EmptyState
            title="Nenhum item para hoje"
            description="Quando houver compromissos, prazos ou lembretes do dia, eles aparecerão aqui."
          />
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-panel-border bg-panel-surface-muted/70 p-4 transition hover:bg-panel-surface"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-accent">
                    {formatTime(item.startAt)}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.type} · {item.source}
                  </p>
                </div>
                <StatusBadge label={item.status} />
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function AgendaUpcomingList({
  items = upcomingItems,
}: {
  items?: AgendaItem[];
}) {
  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-5 shadow-sm sm:p-6 lg:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Próximos compromissos
        </h2>
        <StatusBadge label="7 dias" />
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <EmptyState
            title="Nenhum próximo compromisso"
            description="Os próximos eventos, prazos e lembretes serão listados aqui conforme forem criados."
          />
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="group grid gap-4 rounded-2xl border border-panel-border bg-panel-surface-muted/70 p-4 transition hover:bg-panel-surface md:grid-cols-[0.18fr_1fr_auto]"
            >
              <div className="flex items-center gap-3 md:block">
                <span className="block h-10 w-1 rounded-full bg-accent md:h-full" />
                <p className="text-xs font-semibold text-muted-foreground">
                  {formatDateTime(item.startAt)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.type} · {item.source}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <StatusBadge label={item.status} />
                {item.priority ? <StatusBadge label={item.priority} /> : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function AgendaKanbanDeadlines({
  items = kanbanDeadlines,
}: {
  items?: AgendaItem[];
}) {
  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Prazos ligados ao Kanban
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Cards próximos do vencimento sincronizados para acompanhamento operacional.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <EmptyState
            title="Nenhum prazo do Kanban"
            description="Quando cards do Kanban tiverem prazos vinculados, eles serão destacados neste bloco."
          />
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-panel-border bg-panel-surface-muted/70 p-4 transition hover:bg-panel-surface"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      Kanban
                    </p>
                    <h3 className="mt-2 text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <StatusBadge label={item.priority ?? "Média"} />
                </div>

                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <p>Prazo: {formatDateTime(item.startAt)}</p>
                  <p>Coluna: {item.kanbanColumn}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function AgendaOverviewPage() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] w-full flex-1">
      <div className="relative min-h-[calc(100vh-4rem)] flex-1 overflow-hidden rounded-[2rem] border border-panel-border bg-panel p-4 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06),0_24px_80px_hsl(var(--background)/0.18)] sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,hsl(var(--accent)/0.10),transparent_48%)]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5">
          <AgendaOverviewHeader />
          <AgendaOverviewStats />

          <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <AgendaTodayPanel />
            <AgendaKanbanDeadlines />
            <AgendaUpcomingList />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AgendaShell() {
  return <AgendaOverviewPage />;
}
