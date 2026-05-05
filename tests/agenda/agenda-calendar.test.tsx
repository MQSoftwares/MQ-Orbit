import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  AgendaCalendarPage,
  AgendaMonthGrid,
} from "@/components/agenda/agenda-calendar";

describe("AgendaCalendarPage", () => {
  it("renders the calendar title", () => {
    render(<AgendaCalendarPage />);

    expect(
      screen.getByRole("heading", { name: "Calendário" }),
    ).toBeInTheDocument();
  });

  it("renders the current month and year", () => {
    render(<AgendaCalendarPage />);

    expect(screen.getByText("abril de 2026")).toBeInTheDocument();
  });

  it("renders the monthly grid", () => {
    render(<AgendaCalendarPage />);

    expect(screen.getByTestId("month-grid")).toBeInTheDocument();
    expect(screen.getByText("Dom")).toBeInTheDocument();
    expect(screen.getByText("Sáb")).toBeInTheDocument();
  });

  it("switches between month, week, and day views", () => {
    render(<AgendaCalendarPage />);

    fireEvent.click(screen.getByRole("button", { name: "Semana" }));

    expect(screen.getByTestId("week-grid")).toBeInTheDocument();
    expect(screen.queryByTestId("month-grid")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dia" }));

    expect(screen.getByTestId("day-grid")).toBeInTheDocument();
    expect(screen.queryByTestId("week-grid")).not.toBeInTheDocument();
  });

  it("highlights the current day", () => {
    render(<AgendaCalendarPage />);

    expect(
      screen
        .getAllByRole("button")
        .find((button) => button.getAttribute("aria-current") === "date"),
    ).toBeTruthy();
  });

  it("updates the details panel when selecting an empty day", () => {
    render(<AgendaCalendarPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /01 de abril de 2026/ }),
    );

    expect(screen.getByText("Nenhum item neste dia")).toBeInTheDocument();
  });

  it("opens and closes the new item card", () => {
    render(<AgendaCalendarPage />);

    fireEvent.click(screen.getAllByRole("button", { name: "Novo item" })[0]);

    expect(
      screen.getByRole("dialog", { name: "Novo item na agenda" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Novo item na agenda" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toBeInTheDocument();
    expect(screen.getByLabelText("Data")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      screen.queryByRole("heading", { name: "Novo item na agenda" }),
    ).not.toBeInTheDocument();
  });

  it("opens the new item card from the creation query parameter", async () => {
    window.history.pushState(null, "", "/agenda/calendario?novo=compromisso");

    try {
      render(<AgendaCalendarPage />);

      expect(
        await screen.findByRole("dialog", { name: "Novo item na agenda" }),
      ).toBeInTheDocument();
    } finally {
      window.history.pushState(null, "", "/");
    }
  });

  it("shows hour details in day view and updates the selected time slot", () => {
    render(<AgendaCalendarPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /22 de abril de 2026/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Dia" }));

    expect(
      screen.getByRole("heading", { name: "Detalhes da hora" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("quarta-feira, 22 de abril de 2026 · 09:00 até 10:00"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Novo item" }).length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getByRole("button", { name: /11:00 - 1 itens/ }));

    expect(
      screen.getByText("quarta-feira, 22 de abril de 2026 · 11:00 até 12:00"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Novo item" }).length).toBeGreaterThanOrEqual(2);
  });

  it("renders the upcoming items block", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-23T12:00:00-03:00"));

    try {
      render(<AgendaCalendarPage />);

      expect(
        screen.getByRole("heading", { name: "Próximos itens" }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText("Follow-up de cliente").length,
      ).toBeGreaterThan(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows only the task count badge inside calendar cells", () => {
    render(
      <AgendaMonthGrid
        days={[
          {
            day: 23,
            isCurrentMonth: true,
            isSelected: false,
            isToday: false,
            key: "2026-04-23",
            items: Array.from({ length: 6 }, (_, index) => ({
              id: `item-${index + 1}`,
              title: `Task ${index + 1}`,
              type: "Evento",
              source: "Manual",
              startAt: "2026-04-23T09:00:00-03:00",
              status: "Confirmado",
            })),
          },
        ]}
        onSelectDay={() => undefined}
      />,
    );

    expect(screen.getByText("+6")).toBeInTheDocument();
    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
  });
});
