import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SidebarMenu } from "@/components/home/sidebar-menu";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/components/brand/brand-logo", () => ({
  BrandLogo: () => <div data-testid="brand-logo" />,
}));

vi.mock("@/components/theme-toggle-button", () => ({
  ThemeToggleButton: () => <button type="button">Theme</button>,
}));

describe("SidebarMenu", () => {
  it("keeps only one submenu open at a time", () => {
    render(<SidebarMenu />);

    fireEvent.click(screen.getByRole("button", { name: /Abrir submenu de Agenda/i }));
    expect(screen.getByText("Calendário")).toBeInTheDocument();
    expect(screen.queryByText("Lembretes")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Abrir submenu de Kanban/i }));

    expect(screen.queryByText("Calendário")).not.toBeInTheDocument();
    expect(screen.getByText("Quadros")).toBeInTheDocument();
    expect(screen.getByText("Etiquetas")).toBeInTheDocument();
    expect(screen.getByText("Sprints")).toBeInTheDocument();

    const etiquetas = screen.getByText("Etiquetas");
    const sprints = screen.getByText("Sprints");

    expect(etiquetas.compareDocumentPosition(sprints) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows cargos right below colaboradores in the administrativo submenu", () => {
    render(<SidebarMenu />);

    fireEvent.click(screen.getByRole("button", { name: /Abrir submenu de Administrativo/i }));

    const colaboradores = screen.getByText("Colaboradores");
    const cargos = screen.getByText("Cargos");

    expect(cargos).toBeInTheDocument();
    expect(colaboradores.compareDocumentPosition(cargos) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
