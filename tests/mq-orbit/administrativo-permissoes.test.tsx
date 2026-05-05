import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdministrativoPermissoesPage } from "@/components/mq-orbit/administrativo";

describe("AdministrativoPermissoesPage", () => {
  it("creates a manual cargo and filters it by section group", () => {
    render(<AdministrativoPermissoesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Novo cargo" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();

    fireEvent.change(within(dialog as HTMLElement).getByLabelText("Nome do cargo"), {
      target: { value: "Coordenador interno" },
    });
    fireEvent.change(within(dialog as HTMLElement).getByLabelText("Descrição"), {
      target: { value: "Coordena as frentes internas com acesso manual às subseções-chave." },
    });
    fireEvent.click(within(dialog as HTMLElement).getByRole("checkbox", { name: /Quadros/i }));
    fireEvent.click(within(dialog as HTMLElement).getByRole("checkbox", { name: /Equipe/i }));
    fireEvent.click(within(dialog as HTMLElement).getByRole("button", { name: "Salvar cargo" }));

    const createdCard = screen.getByText("Coordenador interno").closest("article");
    expect(createdCard).toBeTruthy();
    expect(within(createdCard as HTMLElement).getByText("Acesso manual")).toBeInTheDocument();
    expect(within(createdCard as HTMLElement).getByText("2 subseções")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Administrativo" }));
    expect(screen.getByText("Coordenador interno")).toBeInTheDocument();
  });

  it("turns a cargo into gestor total and removes it", () => {
    render(<AdministrativoPermissoesPage />);

    const operationalCard = screen.getByText("Operacional").closest("article");
    expect(operationalCard).toBeTruthy();

    fireEvent.click(within(operationalCard as HTMLElement).getByRole("button", { name: "Editar cargo Operacional" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();

    fireEvent.click(within(dialog as HTMLElement).getByRole("checkbox", { name: /Gestor/i }));
    fireEvent.click(within(dialog as HTMLElement).getByRole("button", { name: "Salvar cargo" }));

    const updatedCard = screen.getByText("Operacional").closest("article");
    expect(updatedCard).toBeTruthy();
    expect(within(updatedCard as HTMLElement).getByText("Gestor total")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Gestor total" }));
    expect(screen.getByText("Operacional")).toBeInTheDocument();

    fireEvent.click(within(updatedCard as HTMLElement).getByRole("button", { name: "Remover cargo Operacional" }));

    const deleteDialog = screen
      .getByText("O cargo será removido desta página e deixará de aparecer na lista de perfis de acesso.")
      .closest("div");
    expect(deleteDialog).toBeTruthy();

    fireEvent.click(within(deleteDialog as HTMLElement).getByRole("button", { name: "Remover" }));
    expect(screen.queryByText("Operacional")).not.toBeInTheDocument();
  });
});
