import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AgendaAppointmentsPage } from "@/components/agenda/agenda-appointments";

describe("AgendaAppointmentsPage", () => {
  it("renders the page title", () => {
    render(<AgendaAppointmentsPage />);

    expect(
      screen.getByRole("heading", { name: "Compromissos" }),
    ).toBeInTheDocument();
  });

  it("renders the filters bar", () => {
    render(<AgendaAppointmentsPage />);

    expect(
      screen.getByPlaceholderText("Busque por título, descrição, origem ou tipo"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Todos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hoje" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Esta semana" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kanban" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cards" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Todos os status" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Agendado" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Concluído" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Atrasados" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancelado" })).not.toBeInTheDocument();
  });

  it("renders the summary cards", () => {
    render(<AgendaAppointmentsPage />);

    expect(screen.getByRole("button", { name: /Total 8/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agendados 5/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Atrasados 1/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Concluídos 1/ })).toBeInTheDocument();
  });

  it("renders the appointments list", () => {
    render(<AgendaAppointmentsPage />);

    expect(
      screen.getByRole("heading", { name: "Lista de compromissos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Reunião interna de alinhamento")).toBeInTheDocument();
  });

  it("links the new appointment action to calendar creation", () => {
    render(<AgendaAppointmentsPage />);

    expect(
      screen.getByRole("link", { name: "Novo compromisso" }),
    ).toHaveAttribute("href", "/agenda/calendario?novo=compromisso");
  });

  it("filters appointments by text", () => {
    render(<AgendaAppointmentsPage />);

    fireEvent.change(
      screen.getByPlaceholderText("Busque por título, descrição, origem ou tipo"),
      { target: { value: "landing" } },
    );

    expect(screen.getByText("Entrega de landing page")).toBeInTheDocument();
    expect(
      screen.queryByText("Reunião interna de alinhamento"),
    ).not.toBeInTheDocument();
  });

  it("filters appointments by type", () => {
    render(<AgendaAppointmentsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Cards" }));

    expect(screen.getByText("Entrega de landing page")).toBeInTheDocument();
    expect(screen.getByText("Prazo de card no Kanban")).toBeInTheDocument();
    expect(
      screen.queryByText("Follow-up com cliente"),
    ).not.toBeInTheDocument();
  });

  it("filters appointments by overdue status", () => {
    render(<AgendaAppointmentsPage />);

    fireEvent.click(screen.getByRole("button", { name: /Atrasados 1/ }));

    expect(screen.getByText("Prazo de card no Kanban")).toBeInTheDocument();
    expect(
      screen.queryByText("Reunião interna de alinhamento"),
    ).not.toBeInTheDocument();
  });

  it("filters appointments by scheduled status card", () => {
    render(<AgendaAppointmentsPage />);

    fireEvent.click(screen.getByRole("button", { name: /Agendados 5/ }));

    expect(screen.getByText("Reunião interna de alinhamento")).toBeInTheDocument();
    expect(screen.getByText("Entrega de landing page")).toBeInTheDocument();
    expect(
      screen.queryByText("Prazo de card no Kanban"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Reunião de arquitetura da API"),
    ).not.toBeInTheDocument();
  });

  it("renders an empty state when there are no results", () => {
    render(<AgendaAppointmentsPage />);

    fireEvent.change(
      screen.getByPlaceholderText("Busque por título, descrição, origem ou tipo"),
      { target: { value: "sem resultado possível" } },
    );

    expect(screen.getByText("Nenhum compromisso encontrado")).toBeInTheDocument();
  });
});
