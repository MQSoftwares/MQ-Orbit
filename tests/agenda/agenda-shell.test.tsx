import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AgendaKanbanDeadlines,
  AgendaOverviewPage,
  AgendaTodayPanel,
  AgendaUpcomingList,
} from "@/components/agenda/agenda-shell";

describe("AgendaOverviewPage", () => {
  it("renders the agenda title", () => {
    render(<AgendaOverviewPage />);

    expect(
      screen.getByRole("heading", { name: "Agenda" }),
    ).toBeInTheDocument();
  });

  it("renders the four summary cards", () => {
    render(<AgendaOverviewPage />);

    expect(screen.getByRole("button", { name: /Hoje 3/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Próximos 7 dias 11/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Prazos do Kanban 4/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Atrasados 1/ }),
    ).toBeInTheDocument();
  });

  it("renders the upcoming appointments list", () => {
    render(<AgendaOverviewPage />);

    expect(
      screen.getByRole("heading", { name: "Próximos compromissos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Follow-up de cliente estratégico")).toBeInTheDocument();
  });

  it("renders the Kanban deadlines block", () => {
    render(<AgendaOverviewPage />);

    expect(
      screen.getByRole("heading", { name: "Prazos ligados ao Kanban" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Landing page MQ Softwares")).toBeInTheDocument();
  });

  it("renders empty states for empty lists", () => {
    render(
      <>
        <AgendaTodayPanel items={[]} />
        <AgendaUpcomingList items={[]} />
        <AgendaKanbanDeadlines items={[]} />
      </>,
    );

    expect(screen.getByText("Nenhum item para hoje")).toBeInTheDocument();
    expect(screen.getByText("Nenhum próximo compromisso")).toBeInTheDocument();
    expect(screen.getByText("Nenhum prazo do Kanban")).toBeInTheDocument();
  });
});
