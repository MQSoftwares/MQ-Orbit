import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdministrativoColaboradoresPage } from "@/components/mq-orbit/administrativo";

describe("AdministrativoColaboradoresPage", () => {
  it("creates a collaborator with multiple team assignments and filters by team", () => {
    render(<AdministrativoColaboradoresPage />);

    fireEvent.click(screen.getByRole("button", { name: "Novo colaborador" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();

    fireEvent.change(within(dialog as HTMLElement).getByLabelText("Nome do colaborador"), {
      target: { value: "Ana Martins" },
    });
    fireEvent.change(within(dialog as HTMLElement).getByLabelText("Função atual"), {
      target: { value: "Coordenação operacional" },
    });
    fireEvent.change(within(dialog as HTMLElement).getByLabelText("Área"), {
      target: { value: "Administrativo" },
    });
    fireEvent.change(within(dialog as HTMLElement).getByLabelText("Especialidade"), {
      target: { value: "Projetos e relacionamento" },
    });
    fireEvent.click(within(dialog as HTMLElement).getByRole("checkbox", { name: /Equipe Produto/i }));
    fireEvent.click(within(dialog as HTMLElement).getByRole("checkbox", { name: /Equipe Marketing/i }));
    fireEvent.click(within(dialog as HTMLElement).getByRole("button", { name: "Salvar colaborador" }));

    expect(screen.getByText("Ana Martins")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Equipe Marketing" }));

    expect(screen.getByText("Ana Martins")).toBeInTheDocument();
    expect(screen.queryByText("Lucas Andrade")).not.toBeInTheDocument();
  });

  it("edits and removes an existing collaborator", () => {
    render(<AdministrativoColaboradoresPage />);

    const collaboratorCard = screen.getByText("Larissa Moura").closest("article");
    expect(collaboratorCard).toBeTruthy();

    fireEvent.click(within(collaboratorCard as HTMLElement).getByRole("button", { name: "Editar colaborador Larissa Moura" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();

    fireEvent.change(within(dialog as HTMLElement).getByLabelText("Nome do colaborador"), {
      target: { value: "Larissa Moura Atualizada" },
    });
    fireEvent.click(within(dialog as HTMLElement).getByRole("button", { name: "Salvar colaborador" }));

    expect(screen.getByText("Larissa Moura Atualizada")).toBeInTheDocument();

    const updatedCard = screen.getByText("Larissa Moura Atualizada").closest("article");
    expect(updatedCard).toBeTruthy();

    fireEvent.click(within(updatedCard as HTMLElement).getByRole("button", { name: "Remover colaborador Larissa Moura Atualizada" }));

    const deleteDialog = screen
      .getByText("O colaborador será removido desta página e deixará de aparecer na lista.")
      .closest("div");
    expect(deleteDialog).toBeTruthy();

    fireEvent.click(within(deleteDialog as HTMLElement).getByRole("button", { name: "Remover" }));

    expect(screen.queryByText("Larissa Moura Atualizada")).not.toBeInTheDocument();
  });
});
