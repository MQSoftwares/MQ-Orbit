import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AdministrativoEquipePage,
  AdministrativoOverviewPage,
} from "@/components/mq-orbit/administrativo";

describe("Administrativo operational load", () => {
  it("stores multiple team access sections and supports selecting all", () => {
    render(<AdministrativoEquipePage />);

    const operationsTeamCard = screen.getByText("Equipe Operações").closest("article");
    expect(operationsTeamCard).toBeTruthy();

    fireEvent.click(
      within(operationsTeamCard as HTMLElement).getByRole("button", { name: "Editar equipe Equipe Operações" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();

    fireEvent.click(within(dialog as HTMLElement).getByRole("button", { name: "Kanban" }));
    fireEvent.click(within(dialog as HTMLElement).getByRole("button", { name: "Arquivos" }));
    fireEvent.click(within(dialog as HTMLElement).getByRole("button", { name: "Salvar equipe" }));

    const updatedCard = screen.getByText("Equipe Operações").closest("article");
    expect(updatedCard).toBeTruthy();
    expect(within(updatedCard as HTMLElement).getByText("Kanban")).toBeInTheDocument();
    expect(within(updatedCard as HTMLElement).getByText("Administrativo")).toBeInTheDocument();
    expect(within(updatedCard as HTMLElement).getByText("Arquivos")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Kanban" }));
    expect(screen.getByText("Equipe Operações")).toBeInTheDocument();
    expect(screen.queryByText("Equipe Criativa")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Todas as seções" }));
    const refreshedCard = screen.getByText("Equipe Operações").closest("article");
    expect(refreshedCard).toBeTruthy();
    fireEvent.click(
      within(refreshedCard as HTMLElement).getByRole("button", { name: "Editar equipe Equipe Operações" }),
    );

    const reopenedDialog = screen.getByRole("dialog");
    fireEvent.click(within(reopenedDialog as HTMLElement).getByRole("button", { name: "Todos" }));
    fireEvent.click(within(reopenedDialog as HTMLElement).getByRole("button", { name: "Salvar equipe" }));

    const fullyUpdatedCard = screen.getByText("Equipe Operações").closest("article");
    expect(fullyUpdatedCard).toBeTruthy();
    expect(within(fullyUpdatedCard as HTMLElement).getByText("Marketing")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Finanças" }));
    expect(screen.getByText("Equipe Operações")).toBeInTheDocument();
  });

  it("distributes kanban cards across teams", () => {
    render(<AdministrativoEquipePage />);

    const operationsTeamCard = screen.getByText("Equipe Operações").closest("article");
    expect(operationsTeamCard).toBeTruthy();
    expect(within(operationsTeamCard as HTMLElement).getByText("2.0 card(s) distribuídos")).toBeInTheDocument();
    expect(within(operationsTeamCard as HTMLElement).getByText("Acima da média")).toBeInTheDocument();

    const productTeamCard = screen.getByText("Equipe Produto").closest("article");
    expect(productTeamCard).toBeTruthy();
    expect(within(productTeamCard as HTMLElement).getByText("0.5 card(s) distribuídos")).toBeInTheDocument();
    expect(within(productTeamCard as HTMLElement).getByText("Abaixo da média")).toBeInTheDocument();
  });

  it("shows team load as automatic in the edit form", () => {
    render(<AdministrativoEquipePage />);

    const operationsTeamCard = screen.getByText("Equipe Operações").closest("article");
    expect(operationsTeamCard).toBeTruthy();

    fireEvent.click(
      within(operationsTeamCard as HTMLElement).getByRole("button", { name: "Editar equipe Equipe Operações" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(within(dialog as HTMLElement).getByText("2.0 card(s)")).toBeInTheDocument();
    expect(
      within(dialog as HTMLElement).getByText(/Valor automático com base nos cards do Kanban rateados entre as equipes vinculadas/i),
    ).toBeInTheDocument();
  });

  it("aggregates sector load in the overview", () => {
    render(<AdministrativoOverviewPage />);

    expect(screen.getByText("2.0 card(s) distribuídos entre as equipes deste setor")).toBeInTheDocument();
    expect(screen.getAllByText("0.5 card(s) distribuídos entre as equipes deste setor")).toHaveLength(2);
  });
});
