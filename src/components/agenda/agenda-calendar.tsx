"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarItemType = "Evento" | "Prazo" | "Lembrete";
type CalendarItemSource = "Manual" | "Kanban";
type CalendarItemStatus = "Confirmado" | "Pendente" | "Em atenção" | "Atrasado";
type CalendarPriority = "Alta" | "Média" | "Baixa";
type AgendaView = "month" | "week" | "day";

type CalendarItem = {
  id: string;
  title: string;
  type: CalendarItemType;
  source: CalendarItemSource;
  startAt: string;
  endAt?: string;
  allDay?: boolean;
  status: CalendarItemStatus;
  priority?: CalendarPriority;
  linkedKanbanCardId?: string;
  kanbanColumn?: string;
};

type CalendarDay = {
  key: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  items: CalendarItem[];
};

type NewCalendarItemDraft = {
  title: string;
  type: CalendarItemType;
  source: CalendarItemSource;
  dateKey: string;
  startTime: string;
  endTime: string;
  notes: string;
};

const agendaTimeZone = "America/Sao_Paulo";
const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const calendarItems: CalendarItem[] = [
  {
    id: "cal-1",
    title: "Reunião interna de operação",
    type: "Evento",
    source: "Manual",
    startAt: "2026-04-22T09:00:00-03:00",
    endAt: "2026-04-22T09:45:00-03:00",
    status: "Confirmado",
  },
  {
    id: "cal-2",
    title: "Alinhamento de projeto Orbit",
    type: "Evento",
    source: "Manual",
    startAt: "2026-04-22T11:30:00-03:00",
    endAt: "2026-04-22T12:00:00-03:00",
    status: "Confirmado",
  },
  {
    id: "cal-3",
    title: "Revisão de tarefas",
    type: "Lembrete",
    source: "Kanban",
    startAt: "2026-04-22T16:00:00-03:00",
    status: "Pendente",
    linkedKanbanCardId: "kanban-142",
    kanbanColumn: "Em revisão",
  },
  {
    id: "cal-4",
    title: "Entrega de landing page",
    type: "Prazo",
    source: "Kanban",
    startAt: "2026-04-23T18:00:00-03:00",
    status: "Em atenção",
    priority: "Alta",
    linkedKanbanCardId: "kanban-151",
    kanbanColumn: "Validação",
  },
  {
    id: "cal-5",
    title: "Follow-up de cliente",
    type: "Evento",
    source: "Manual",
    startAt: "2026-04-24T14:30:00-03:00",
    endAt: "2026-04-24T15:00:00-03:00",
    status: "Confirmado",
  },
  {
    id: "cal-6",
    title: "Lembrete de envio",
    type: "Lembrete",
    source: "Manual",
    startAt: "2026-04-27T09:15:00-03:00",
    status: "Pendente",
  },
  {
    id: "cal-7",
    title: "Arquitetura da API",
    type: "Evento",
    source: "Manual",
    startAt: "2026-04-28T10:00:00-03:00",
    endAt: "2026-04-28T11:00:00-03:00",
    status: "Confirmado",
  },
  {
    id: "cal-8",
    title: "Ajustes do painel",
    type: "Prazo",
    source: "Kanban",
    startAt: "2026-04-18T17:00:00-03:00",
    status: "Atrasado",
    priority: "Alta",
    linkedKanbanCardId: "kanban-158",
    kanbanColumn: "Em desenvolvimento",
  },
  {
    id: "cal-9",
    title: "Revisão comercial",
    type: "Lembrete",
    source: "Manual",
    startAt: "2026-05-04T09:00:00-03:00",
    status: "Pendente",
  },
];

function getTodayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: agendaTimeZone,
    year: "numeric",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function parseKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return { day, monthIndex: month - 1, year };
}

function createDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createDateFromKey(dateKey: string) {
  const { day, monthIndex, year } = parseKey(dateKey);

  return new Date(Date.UTC(year, monthIndex, day));
}

function shiftDateKey(
  dateKey: string,
  offset: number,
  unit: "day" | "week" | "month",
) {
  const date = createDateFromKey(dateKey);

  if (unit === "month") {
    date.setUTCMonth(date.getUTCMonth() + offset);
  } else if (unit === "week") {
    date.setUTCDate(date.getUTCDate() + offset * 7);
  } else {
    date.setUTCDate(date.getUTCDate() + offset);
  }

  return createDateKey(date);
}

function itemDateKey(item: CalendarItem) {
  return item.startAt.slice(0, 10);
}

function itemHourInTimeZone(item: CalendarItem) {
  return Number(
    new Intl.DateTimeFormat("en-CA", {
      hour: "2-digit",
      hour12: false,
      timeZone: agendaTimeZone,
    }).format(new Date(item.startAt)),
  );
}

function getDefaultHourForDate(dateKey: string) {
  const dayItems = calendarItems
    .filter((item) => itemDateKey(item) === dateKey)
    .sort((left, right) => left.startAt.localeCompare(right.startAt));

  if (dayItems.length === 0) {
    return 0;
  }

  return itemHourInTimeZone(dayItems[0]);
}

function formatMonthLabel(year: number, monthIndex: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

function formatDayLabel(dateKey: string) {
  const { day, monthIndex, year } = parseKey(dateKey);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthIndex, day)));
}

function formatItemTime(item: CalendarItem) {
  if (item.allDay) {
    return "Dia todo";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: agendaTimeZone,
  }).format(new Date(item.startAt));
}

function buildMonthDays(
  year: number,
  monthIndex: number,
  selectedKey: string,
  todayKey: string,
) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const gridStart = new Date(firstDay);
  gridStart.setUTCDate(firstDay.getUTCDate() - firstDay.getUTCDay());

  return Array.from({ length: 42 }, (_, index): CalendarDay => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);

    const key = createDateKey(date);
    const items = calendarItems.filter((item) => itemDateKey(item) === key);

    return {
      key,
      day: date.getUTCDate(),
      isCurrentMonth: date.getUTCMonth() === monthIndex,
      isToday: key === todayKey,
      isSelected: key === selectedKey,
      items,
    };
  });
}

function buildWeekDays(
  referenceKey: string,
  selectedKey: string,
  todayKey: string,
) {
  const referenceDate = createDateFromKey(referenceKey);
  const gridStart = new Date(referenceDate);
  gridStart.setUTCDate(referenceDate.getUTCDate() - referenceDate.getUTCDay());

  return Array.from({ length: 7 }, (_, index): CalendarDay => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);

    const key = createDateKey(date);
    const items = calendarItems.filter((item) => itemDateKey(item) === key);

    return {
      key,
      day: date.getUTCDate(),
      isCurrentMonth: date.getUTCMonth() === referenceDate.getUTCMonth(),
      isToday: key === todayKey,
      isSelected: key === selectedKey,
      items,
    };
  });
}

type DaySlot = {
  hour: number;
  key: string;
  items: CalendarItem[];
  isSelected: boolean;
  isToday: boolean;
};

function buildDaySlots(
  dateKey: string,
  selectedHour: number,
  todayKey: string,
) {
  const dayItems = calendarItems.filter((item) => itemDateKey(item) === dateKey);

  return Array.from({ length: 24 }, (_, hour): DaySlot => {
    const items = dayItems.filter((item) => itemHourInTimeZone(item) === hour);

    return {
      hour,
      key: `${dateKey}T${String(hour).padStart(2, "0")}:00`,
      items,
      isSelected: hour === selectedHour,
      isToday: dateKey === todayKey,
    };
  });
}

function formatDateLabel(dateKey: string) {
  const { day, monthIndex, year } = parseKey(dateKey);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthIndex, day)));
}

function formatWeekLabel(referenceKey: string) {
  const referenceDate = createDateFromKey(referenceKey);
  const weekStart = new Date(referenceDate);
  weekStart.setUTCDate(referenceDate.getUTCDate() - referenceDate.getUTCDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

  return `${formatDateLabel(createDateKey(weekStart))} a ${formatDateLabel(
    createDateKey(weekEnd),
  )}`;
}

function formatHourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatHourRangeLabel(hour: number) {
  const endLabel = hour === 23 ? "23:59" : formatHourLabel(hour + 1);

  return `${formatHourLabel(hour)} até ${endLabel}`;
}

function buildNewItemDraft(dateKey: string, hour: number): NewCalendarItemDraft {
  const startTime = formatHourLabel(hour);
  const endTime = hour === 23 ? "23:59" : formatHourLabel(hour + 1);

  return {
    title: "",
    type: "Evento",
    source: "Manual",
    dateKey,
    startTime,
    endTime,
    notes: "",
  };
}

function formatItemTimeRange(item: CalendarItem) {
  if (item.allDay || !item.endAt) {
    return formatItemTime(item);
  }

  const endTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: agendaTimeZone,
  }).format(new Date(item.endAt));

  return `${formatItemTime(item)} até ${endTime}`;
}

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-panel-border bg-panel-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      {children}
    </span>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-panel-border bg-panel-surface-muted/70 px-4 py-7 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export function AgendaCalendarHeader({
  onCreateItem,
  onToday,
}: {
  onCreateItem: () => void;
  onToday: () => void;
}) {
  return (
    <header className="flex flex-col gap-5 rounded-3xl border border-panel-border bg-panel-surface px-5 py-5 shadow-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Agenda
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Calendário
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Visualize compromissos, prazos e lembretes ao longo do mês
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCreateItem}
          className="inline-flex items-center justify-center rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
        >
          Novo item
        </button>
        <button
          type="button"
          onClick={onToday}
          className="inline-flex items-center justify-center rounded-2xl border border-panel-border bg-panel-surface-muted px-5 py-3 text-sm font-semibold text-foreground transition hover:translate-y-[-1px] hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
        >
          Hoje
        </button>
      </div>
    </header>
  );
}

export function AgendaCalendarToolbar({
  monthLabel,
  view,
  onNextMonth,
  onPreviousMonth,
  onToday,
  onViewChange,
}: {
  monthLabel: string;
  view: AgendaView;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onToday: () => void;
  onViewChange: (view: AgendaView) => void;
}) {
  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <button
            type="button"
            aria-label="Mês anterior"
            onClick={onPreviousMonth}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-panel-border bg-panel-surface-muted text-lg font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
          >
            ‹
          </button>
          <p className="min-w-48 text-center text-lg font-semibold capitalize text-foreground">
            {monthLabel}
          </p>
          <button
            type="button"
            aria-label="Próximo mês"
            onClick={onNextMonth}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-panel-border bg-panel-surface-muted text-lg font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
          >
            ›
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToday}
            className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent/15"
          >
            Hoje
          </button>
          <div className="flex rounded-full border border-panel-border bg-panel-surface-muted p-1">
            {[
              ["month", "Mês"],
              ["week", "Semana"],
              ["day", "Dia"],
            ].map(([tabView, label]) => (
              <button
                key={tabView}
                type="button"
                onClick={() => onViewChange(tabView as AgendaView)}
                className={[
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                  view === tabView
                    ? "bg-panel-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["Evento", "Prazo", "Lembrete", "Manual", "Kanban"].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </div>
    </section>
  );
}

export function AgendaMonthGrid({
  days,
  onSelectDay,
}: {
  days: CalendarDay[];
  onSelectDay: (dateKey: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-3 shadow-sm sm:p-4">
      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:gap-2">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2" data-testid="month-grid">
        {days.map((day) => {
          const itemCount = day.items.length;

          return (
            <button
              key={day.key}
              type="button"
              aria-label={`Selecionar ${formatDayLabel(day.key)}`}
              aria-current={day.isToday ? "date" : undefined}
              onClick={() => onSelectDay(day.key)}
              className={[
                "group flex aspect-[2/3] w-full flex-col rounded-2xl border p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-accent sm:p-3",
                day.isSelected
                  ? "border-accent bg-accent/10 shadow-sm"
                  : "border-panel-border bg-panel-surface-muted/60 hover:bg-panel-surface",
                day.isCurrentMonth ? "opacity-100" : "opacity-45",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  day.isToday
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground",
                ].join(" ")}
              >
                {day.day}
              </span>

              {itemCount > 0 ? (
                <span className="mt-2 inline-flex w-fit rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  +{itemCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function AgendaWeekGrid({
  days,
  onSelectDay,
}: {
  days: CalendarDay[];
  onSelectDay: (dateKey: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-3 shadow-sm sm:p-4">
      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:gap-2">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2" data-testid="week-grid">
        {days.map((day) => {
          const itemCount = day.items.length;

          return (
            <button
              key={day.key}
              type="button"
              aria-label={`Selecionar ${formatDayLabel(day.key)}`}
              aria-current={day.isToday ? "date" : undefined}
              onClick={() => onSelectDay(day.key)}
              className={[
                "group flex aspect-[2/3] w-full flex-col rounded-2xl border p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-accent sm:p-3",
                day.isSelected
                  ? "border-accent bg-accent/10 shadow-sm"
                  : "border-panel-border bg-panel-surface-muted/60 hover:bg-panel-surface",
                day.isCurrentMonth ? "opacity-100" : "opacity-45",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  day.isToday
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground",
                ].join(" ")}
              >
                {day.day}
              </span>

              {itemCount > 0 ? (
                <span className="mt-2 inline-flex w-fit rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  +{itemCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function AgendaDayTimeline({
  dateKey,
  slots,
  onSelectDay,
  onSelectHour,
}: {
  dateKey: string;
  slots: DaySlot[];
  onSelectDay: (dateKey: string) => void;
  onSelectHour: (hour: number) => void;
}) {
  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Dia
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground capitalize">
            {formatDateLabel(dateKey)}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onSelectDay(dateKey)}
          className="rounded-full border border-panel-border bg-panel-surface-muted px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-panel-surface"
        >
          Focar dia
        </button>
      </div>

      <div className="grid gap-2" data-testid="day-grid">
        {slots.map((slot) => (
          <button
            key={slot.key}
            type="button"
            aria-label={`${formatHourLabel(slot.hour)} - ${slot.items.length} itens`}
            aria-pressed={slot.isSelected}
            onClick={() => onSelectHour(slot.hour)}
            className={[
              "grid grid-cols-[5rem,1fr] items-center gap-3 rounded-2xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-accent sm:grid-cols-[5.5rem,1fr]",
              slot.isSelected
                ? "border-accent bg-accent/10 shadow-sm"
                : "border-panel-border bg-panel-surface-muted/60 hover:bg-panel-surface",
              slot.isToday ? "opacity-100" : "opacity-95",
            ].join(" ")}
          >
            <span className="text-xs font-semibold text-muted-foreground">
              {formatHourLabel(slot.hour)}
            </span>

            <div className="flex items-center gap-2 overflow-hidden">
              {slot.items.length > 0 ? (
                <span className="inline-flex rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  +{slot.items.length}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Sem tarefas
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function AgendaDayDetailsPanel({
  dateKey,
  items,
  selectedHour,
  view,
  onCreateItem,
}: {
  dateKey: string;
  items: CalendarItem[];
  selectedHour?: number;
  view: AgendaView;
  onCreateItem: () => void;
}) {
  const isHourlyView = view === "day" && typeof selectedHour === "number";
  const hourRangeLabel = isHourlyView ? formatHourRangeLabel(selectedHour) : "";

  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {isHourlyView ? "Detalhes da hora" : "Detalhes do dia"}
          </h2>
          <p className="mt-2 text-sm capitalize text-muted-foreground">
            {isHourlyView
              ? `${formatDayLabel(dateKey)} · ${hourRangeLabel}`
              : formatDayLabel(dateKey)}
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateItem}
          className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Novo item
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <EmptyState
            title={isHourlyView ? "Nenhum item nesta hora" : "Nenhum item neste dia"}
            description={
              isHourlyView
                ? "Selecione outra hora ou crie um novo item para preencher este intervalo."
                : "Selecione outro dia ou crie um novo item para preencher a agenda."
            }
          />
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-panel-border bg-panel-surface-muted/70 p-4 transition hover:bg-panel-surface"
            >
              <p className="text-xs font-semibold text-accent">
                {formatItemTimeRange(item)}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-foreground">
                {item.title}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{item.type}</Badge>
                <Badge>{item.source}</Badge>
                <Badge>{item.status}</Badge>
                {item.priority ? <Badge>{item.priority}</Badge> : null}
              </div>
              {item.linkedKanbanCardId ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Kanban: {item.kanbanColumn} · {item.linkedKanbanCardId}
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function AgendaUpcomingSidebar({
  items = calendarItems,
}: {
  items?: CalendarItem[];
}) {
  const todayKey = getTodayKey();
  const upcoming = items
    .filter((item) => itemDateKey(item) >= todayKey)
    .sort((left, right) => left.startAt.localeCompare(right.startAt))
    .slice(0, 4);

  return (
    <section className="rounded-3xl border border-panel-border bg-panel-surface p-5 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Próximos itens
      </h2>

      <div className="mt-5 space-y-3">
        {upcoming.length === 0 ? (
          <EmptyState
            title="Nenhum próximo item"
            description="Os próximos compromissos aparecerão aqui em ordem cronológica."
          />
        ) : (
          upcoming.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-panel-border bg-panel-surface-muted/70 p-4 transition hover:bg-panel-surface"
            >
              <p className="text-xs font-semibold text-muted-foreground">
                {formatDayLabel(itemDateKey(item))} · {formatItemTime(item)}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.type} · {item.source}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function AgendaCalendarPage() {
  const todayKey = getTodayKey();
  const [view, setView] = useState<AgendaView>("month");
  const [focusKey, setFocusKey] = useState(todayKey);
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [selectedHour, setSelectedHour] = useState(() =>
    getDefaultHourForDate(todayKey),
  );
  const [isNewItemCardOpen, setIsNewItemCardOpen] = useState(false);
  const [newItemDraft, setNewItemDraft] = useState<NewCalendarItemDraft>(() =>
    buildNewItemDraft(todayKey, getDefaultHourForDate(todayKey)),
  );

  const days = useMemo(
    () =>
      buildMonthDays(
        parseKey(focusKey).year,
        parseKey(focusKey).monthIndex,
        selectedKey,
        todayKey,
      ),
    [focusKey, selectedKey, todayKey],
  );
  const weekDaysForView = useMemo(
    () => buildWeekDays(focusKey, selectedKey, todayKey),
    [focusKey, selectedKey, todayKey],
  );
  const daySlots = useMemo(
    () => buildDaySlots(selectedKey, selectedHour, todayKey),
    [selectedHour, selectedKey, todayKey],
  );
  const selectedDayItems = calendarItems.filter(
    (item) => itemDateKey(item) === selectedKey,
  );
  const selectedHourItems =
    daySlots.find((slot) => slot.hour === selectedHour)?.items ?? [];
  const anchorDate = parseKey(focusKey);
  const monthLabel = formatMonthLabel(anchorDate.year, anchorDate.monthIndex);
  const periodLabel =
    view === "month"
      ? monthLabel
      : view === "week"
        ? formatWeekLabel(focusKey)
        : formatDateLabel(selectedKey);

  function handlePreviousMonth() {
    setFocusKey((current) =>
      shiftDateKey(
        current,
        -1,
        view === "month" ? "month" : view === "week" ? "week" : "day",
      ),
    );
    setSelectedKey((current) =>
      shiftDateKey(
        current,
        -1,
        view === "month" ? "month" : view === "week" ? "week" : "day",
      ),
    );
  }

  function handleNextMonth() {
    setFocusKey((current) =>
      shiftDateKey(
        current,
        1,
        view === "month" ? "month" : view === "week" ? "week" : "day",
      ),
    );
    setSelectedKey((current) =>
      shiftDateKey(
        current,
        1,
        view === "month" ? "month" : view === "week" ? "week" : "day",
      ),
    );
  }

  function handleToday() {
    setSelectedKey(todayKey);
    setFocusKey(todayKey);
  }

  useEffect(() => {
    setSelectedHour(getDefaultHourForDate(selectedKey));
  }, [selectedKey]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.get("novo") === "compromisso") {
      const draftHour = getDefaultHourForDate(selectedKey);

      setNewItemDraft(buildNewItemDraft(selectedKey, draftHour));
      setIsNewItemCardOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!isNewItemCardOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isNewItemCardOpen]);

  function openNewItemCard() {
    const draftHour = view === "day" ? selectedHour : getDefaultHourForDate(selectedKey);

    setNewItemDraft(buildNewItemDraft(selectedKey, draftHour));
    setIsNewItemCardOpen(true);
  }

  function closeNewItemCard() {
    setIsNewItemCardOpen(false);
  }

  function handleSaveNewItem() {
    setIsNewItemCardOpen(false);
  }

  function updateNewItemDraft<K extends keyof NewCalendarItemDraft>(
    key: K,
    value: NewCalendarItemDraft[K],
  ) {
    setNewItemDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleViewChange(nextView: AgendaView) {
    setView(nextView);
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] w-full flex-1">
      <div className="relative min-h-[calc(100vh-4rem)] flex-1 overflow-hidden rounded-[2rem] border border-panel-border bg-panel p-4 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06),0_24px_80px_hsl(var(--background)/0.18)] sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,hsl(var(--accent)/0.10),transparent_48%)]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5">
          <AgendaCalendarHeader onCreateItem={openNewItemCard} onToday={handleToday} />
          <AgendaCalendarToolbar
            monthLabel={periodLabel}
            view={view}
            onNextMonth={handleNextMonth}
            onPreviousMonth={handlePreviousMonth}
            onToday={handleToday}
            onViewChange={handleViewChange}
          />

          <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
            {view === "month" ? (
              <AgendaMonthGrid days={days} onSelectDay={setSelectedKey} />
            ) : null}
            {view === "week" ? (
              <AgendaWeekGrid
                days={weekDaysForView}
                onSelectDay={setSelectedKey}
              />
            ) : null}
            {view === "day" ? (
              <AgendaDayTimeline
                dateKey={selectedKey}
                slots={daySlots}
                onSelectDay={setSelectedKey}
                onSelectHour={setSelectedHour}
              />
            ) : null}
            <div className="grid gap-5 content-start">
              <AgendaDayDetailsPanel
                dateKey={selectedKey}
                items={view === "day" ? selectedHourItems : selectedDayItems}
                selectedHour={view === "day" ? selectedHour : undefined}
                view={view}
                onCreateItem={openNewItemCard}
              />
              <AgendaUpcomingSidebar />
            </div>
          </div>
        </div>

        {isNewItemCardOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/50 px-4 py-6 backdrop-blur-md sm:items-center sm:px-6 sm:py-10"
            onClick={closeNewItemCard}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-item-card-title"
              onClick={(event) => event.stopPropagation()}
              className="my-6 w-full max-w-[28rem] rounded-[2rem] border border-accent/40 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:my-10 sm:max-w-[42rem] sm:p-6 lg:max-w-[56rem] lg:p-8 xl:max-w-[60rem]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                    Rascunho ilustrativo
                  </p>
                  <h2
                    id="new-item-card-title"
                    className="mt-2 text-xl font-semibold tracking-tight text-foreground"
                  >
                    Novo item na agenda
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Estrutura pronta para ligar a criação real sem alterar o layout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeNewItemCard}
                  className="rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  Fechar
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Título
                    </span>
                    <input
                      value={newItemDraft.title}
                      onChange={(event) =>
                        updateNewItemDraft("title", event.target.value)
                      }
                      placeholder="Ex.: reunião de alinhamento"
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Tipo
                    </span>
                    <select
                      value={newItemDraft.type}
                      onChange={(event) =>
                        updateNewItemDraft(
                          "type",
                          event.target.value as CalendarItemType,
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="Evento">Evento</option>
                      <option value="Prazo">Prazo</option>
                      <option value="Lembrete">Lembrete</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Origem
                    </span>
                    <select
                      value={newItemDraft.source}
                      onChange={(event) =>
                        updateNewItemDraft(
                          "source",
                          event.target.value as CalendarItemSource,
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Kanban">Kanban</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Data
                    </span>
                    <input
                      type="date"
                      value={newItemDraft.dateKey}
                      onChange={(event) =>
                        updateNewItemDraft("dateKey", event.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Início
                    </span>
                    <input
                      type="time"
                      value={newItemDraft.startTime}
                      onChange={(event) =>
                        updateNewItemDraft("startTime", event.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Fim
                    </span>
                    <input
                      type="time"
                      value={newItemDraft.endTime}
                      onChange={(event) =>
                        updateNewItemDraft("endTime", event.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Observações
                  </span>
                  <textarea
                    value={newItemDraft.notes}
                    onChange={(event) =>
                      updateNewItemDraft("notes", event.target.value)
                    }
                    placeholder="Campo ilustrativo para preparar a integração real."
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-panel-border pt-4">
                <div className="text-xs text-muted-foreground">
                  Pronto para conectar validação, persistência e edição real.
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={closeNewItemCard}
                    className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewItem}
                    className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}
