import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  KanbanBacklogPage,
  KanbanBoardsPage,
  KanbanOverviewPage,
  KanbanSprintsPage,
  getDragAutoScrollDelta,
} from "@/components/mq-orbit/kanban";
import {
  AdministrativoOverviewPage,
} from "@/components/mq-orbit/administrativo";
import {
  FinancasContasAPagarPage,
  FinancasOverviewPage,
} from "@/components/mq-orbit/financas";
import {
  ArquivosExploradorPage,
  ArquivosOverviewPage,
} from "@/components/mq-orbit/arquivos";
import {
  DesignAprovacoesPage,
  DesignOverviewPage,
} from "@/components/mq-orbit/design";
import {
  MarketingLeadsPage,
  MarketingOverviewPage,
} from "@/components/mq-orbit/marketing";

function createDataTransfer() {
  const data = new Map<string, string>();

  return {
    dropEffect: "move",
    effectAllowed: "move",
    getData: (format: string) => data.get(format) ?? "",
    setData: (format: string, value: string) => {
      data.set(format, value);
    },
  } as DataTransfer;
}

describe("MQ Orbit MVP modules", () => {
  it("renders the main overview pages", () => {
    render(
      <>
        <KanbanOverviewPage />
        <AdministrativoOverviewPage />
        <FinancasOverviewPage />
        <ArquivosOverviewPage />
        <DesignOverviewPage />
        <MarketingOverviewPage />
      </>,
    );

    expect(screen.getByText("Quadros ativos")).toBeInTheDocument();
    expect(screen.getByText("Clientes ativos")).toBeInTheDocument();
    expect(screen.getByText("Entradas previstas")).toBeInTheDocument();
    expect(screen.getByText("Arquivos totais")).toBeInTheDocument();
    expect(screen.getByText("Projetos ativos")).toBeInTheDocument();
    expect(screen.getByText("Campanhas ativas")).toBeInTheDocument();
  });

  it("adds a Kanban task to sprint from the backlog", async () => {
    render(<KanbanBacklogPage />);

    const backlogRow = screen
      .getByText("Revisar checklist de aprovação de identidade")
      .closest("tr");
    expect(backlogRow).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Adicionar à sprint" })[0]);

    const sprintPopover = screen.getByRole("dialog", { name: "Adicionar à sprint" });
    const sprint18Option = within(sprintPopover)
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("Sprint 18"));

    expect(sprint18Option).toBeTruthy();
    fireEvent.click(sprint18Option as HTMLElement);

    expect(screen.queryByRole("dialog", { name: "Adicionar à sprint" })).not.toBeInTheDocument();
  });

  it("manages sprints through the floating cards and fixed columns", () => {
    render(<KanbanSprintsPage />);

    expect(screen.getByRole("heading", { name: "Sprint 18" })).toBeInTheDocument();

    const sprintCurrentSection = screen.getByRole("heading", { name: "Sprint atual" }).closest("section");
    expect(sprintCurrentSection).toBeTruthy();
    expect(within(sprintCurrentSection as HTMLElement).getByRole("heading", { name: "Sprint 18" })).toBeInTheDocument();

    const sprintCurrentHeading = screen.getByRole("heading", { name: "Sprint atual" });
    const burndownHeading = screen.getByRole("heading", { name: "Burndown mockado" });
    const nextSprintsHeading = screen.getByRole("heading", { name: "Próximas sprints" });

    expect(sprintCurrentHeading.compareDocumentPosition(burndownHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(burndownHeading.compareDocumentPosition(nextSprintsHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Adicionar sprint" }));
    const createSprintDialog = screen.getByRole("dialog", { name: "Novo sprint" });
    expect(createSprintDialog).toBeInTheDocument();
    fireEvent.click(within(createSprintDialog).getByRole("button", { name: "Cancelar" }));

    const sprint19Button = screen.getByRole("button", { name: "Abrir sprint Sprint 19" });
    const sprint19Card = sprint19Button.closest("article");
    expect(sprint19Card).toBeTruthy();

    fireEvent.click(within(sprint19Card as HTMLElement).getByRole("button", { name: "Editar sprint" }));
    const editSprintDialog = screen.getByRole("dialog", { name: "Editar sprint" });
    fireEvent.change(within(editSprintDialog).getByLabelText("Nome"), {
      target: { value: "Sprint 19 ajustada" },
    });
    fireEvent.click(within(editSprintDialog).getByRole("button", { name: "Salvar" }));

    expect(screen.getByRole("heading", { name: "Sprint 19 ajustada" })).toBeInTheDocument();

    const sprint20Button = screen.getByRole("button", { name: "Abrir sprint Sprint 20" });
    const sprint20Card = sprint20Button.closest("article");
    expect(sprint20Card).toBeTruthy();

    fireEvent.click(within(sprint20Card as HTMLElement).getByRole("button", { name: "Mover" }));
    const moveDialog = screen.getByRole("dialog", { name: "Mover sprint" });
    fireEvent.click(within(moveDialog).getByRole("button", { name: /Concluído/ }));

    const concludedRegion = screen.getByRole("region", { name: "Concluído" });
    expect(within(concludedRegion).getByText("Sprint 20")).toBeInTheDocument();

    const sprint17Button = screen.getByRole("button", { name: "Abrir sprint Sprint 17" });
    const sprint17Card = sprint17Button.closest("article");
    expect(sprint17Card).toBeTruthy();

    fireEvent.click(within(sprint17Card as HTMLElement).getByRole("button", { name: "Excluir" }));
    const deleteDialog = screen.getByRole("dialog", { name: "Tem certeza que deseja excluir esse sprint?" });

    fireEvent.change(within(deleteDialog).getByRole("textbox"), {
      target: { value: "SPRINT 17" },
    });
    fireEvent.click(within(deleteDialog).getByRole("button", { name: "Excluir" }));

    expect(screen.queryByText("Sprint 17")).not.toBeInTheDocument();
  });

  it("creates a meeting card for the selected sprint", () => {
    render(<KanbanSprintsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Criar meeting" }));

    const meetingDialog = screen.getByRole("dialog", { name: "Novo meeting" });
    fireEvent.change(within(meetingDialog).getByLabelText("Título"), {
      target: { value: "Sprint Review do hub" },
    });
    fireEvent.change(within(meetingDialog).getByLabelText("Dia"), {
      target: { value: "2026-04-29" },
    });
    fireEvent.change(within(meetingDialog).getByLabelText("Horário"), {
      target: { value: "14:30" },
    });
    fireEvent.change(within(meetingDialog).getByLabelText("Tipo obrigatório"), {
      target: { value: "Sprint Review" },
    });
    fireEvent.change(within(meetingDialog).getByLabelText("Responsáveis"), {
      target: { value: "Matheus Barcellos, Larissa" },
    });

    fireEvent.click(within(meetingDialog).getByRole("button", { name: "Salvar" }));

    expect(screen.getByText("Sprint Review do hub")).toBeInTheDocument();
  });

  it("opens the board creation panel and logs board deletion", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    render(<KanbanBoardsPage />);

    expect(
      screen.queryByRole("dialog", { name: "Novo quadro" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Adicionar quadro" }));

    expect(
      screen.getByRole("dialog", { name: "Novo quadro" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Excluir quadro/ })[0]);

    expect(
      screen.getByRole("dialog", { name: "Tem certeza que deseja excluir esse quadro?" }),
    ).toBeInTheDocument();
    expect(consoleSpy).not.toHaveBeenCalled();

    const confirmationDialog = screen.getByRole("dialog", {
      name: "Tem certeza que deseja excluir esse quadro?",
    });

    fireEvent.change(within(confirmationDialog).getByRole("textbox"), {
      target: { value: "OPERAÇÃO MQ" },
    });
    fireEvent.click(within(confirmationDialog).getByRole("button", { name: "Continuar" }));

    expect(consoleSpy).toHaveBeenCalledWith("Excluído");
    consoleSpy.mockRestore();
  });

  it("moves a card through the floating move overlay", () => {
    render(<KanbanBoardsPage />);

    const card = screen.getByText("Ajustar visão geral do hub MQ Orbit").closest("article");
    expect(card).toBeTruthy();

    fireEvent.click(
      within(card as HTMLElement).getByRole("button", { name: /Mover/i }),
    );

    const moveDialog = screen.getByRole("dialog", { name: "Mover card" });

    fireEvent.click(within(moveDialog).getByRole("button", { name: "Backlog" }));

    const backlogRegion = screen.getByRole("region", { name: "Backlog" });
    expect(within(backlogRegion).getByText("Ajustar visão geral do hub MQ Orbit")).toBeInTheDocument();
  });

  it("edits a card through the floating editor", () => {
    render(<KanbanBoardsPage />);

    const card = screen.getByText("Ajustar visão geral do hub MQ Orbit").closest("article");
    expect(card).toBeTruthy();

    fireEvent.click(
      within(card as HTMLElement).getByRole("button", {
        name: "Editar card Ajustar visão geral do hub MQ Orbit",
      }),
    );

    const editDialog = screen.getByRole("dialog", { name: "Editar card do quadro" });

    fireEvent.change(within(editDialog).getByLabelText("Título"), {
      target: { value: "Ajustar visão geral do hub MQ Orbit - atualizado" },
    });
    expect(within(editDialog).getByLabelText("Título")).toHaveValue(
      "Ajustar visão geral do hub MQ Orbit - atualizado",
    );

    fireEvent.click(within(editDialog).getByRole("button", { name: "Fechar edição de card" }));

    expect(screen.queryByRole("dialog", { name: "Editar card do quadro" })).not.toBeInTheDocument();
  });

  it("requires confirmation to delete a card", () => {
    render(<KanbanBoardsPage />);

    const card = screen.getByText("Ajustar visão geral do hub MQ Orbit").closest("article");
    expect(card).toBeTruthy();

    fireEvent.click(
      within(card as HTMLElement).getByRole("button", { name: /Excluir/i }),
    );

    const deleteDialog = screen.getByRole("dialog", {
      name: "Tem certeza que deseja excluir esse card?",
    });

    fireEvent.change(within(deleteDialog).getByRole("textbox"), {
      target: { value: "AJUSTAR VISÃO GERAL DO HUB MQ ORBIT" },
    });
    fireEvent.click(within(deleteDialog).getByRole("button", { name: "Continuar" }));

    expect(
      screen.queryByText("Ajustar visão geral do hub MQ Orbit"),
    ).not.toBeInTheDocument();
  });

  it("moves kanban cards between existing columns via drag and drop", () => {
    render(<KanbanBoardsPage />);

    const taskCard = screen.getByText("Ajustar visão geral do hub MQ Orbit").closest("article");
    expect(taskCard).toBeTruthy();

    const emAndamentoRegion = screen.getByRole("region", { name: "Em andamento" });
    const revisaoRegion = screen.getByRole("region", { name: "Revisão (Testes)" });
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(taskCard as HTMLElement, { dataTransfer });
    fireEvent.dragOver(revisaoRegion, { dataTransfer });
    fireEvent.drop(revisaoRegion, { dataTransfer });

    expect(
      within(revisaoRegion).getByText("Ajustar visão geral do hub MQ Orbit"),
    ).toBeInTheDocument();
    expect(
      within(emAndamentoRegion).queryByText("Ajustar visão geral do hub MQ Orbit"),
    ).not.toBeInTheDocument();
  });

  it("computes viewport auto-scroll deltas near the edges", () => {
    expect(getDragAutoScrollDelta(12, 900)).toBeLessThan(0);
    expect(getDragAutoScrollDelta(888, 900)).toBeGreaterThan(0);
    expect(getDragAutoScrollDelta(450, 900)).toBe(0);
  });

  it("ignores drops outside valid columns", () => {
    render(<KanbanBoardsPage />);

    const taskCard = screen.getByText("Ajustar visão geral do hub MQ Orbit").closest("article");
    expect(taskCard).toBeTruthy();

    const emAndamentoRegion = screen.getByRole("region", { name: "Em andamento" });
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(taskCard as HTMLElement, { dataTransfer });
    fireEvent.drop(document.body, { dataTransfer });
    fireEvent.dragEnd(taskCard as HTMLElement);

    expect(
      within(emAndamentoRegion).getByText("Ajustar visão geral do hub MQ Orbit"),
    ).toBeInTheDocument();
  });

  it("marks payable items as paid", () => {
    render(<FinancasContasAPagarPage />);

    const buttons = screen.getAllByRole("button", { name: /Marcar .* como pago/ });
    buttons.forEach((button) => {
      fireEvent.click(button);
    });

    expect(screen.getByText("Tudo pago")).toBeInTheDocument();
  });

  it("toggles the file explorer into list view", () => {
    render(<ArquivosExploradorPage />);

    fireEvent.click(screen.getByRole("button", { name: "Lista" }));

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("approves a design item locally", () => {
    render(<DesignAprovacoesPage />);

    const firstCard = screen.getByText("Identidade PicBrand").closest("article");
    expect(firstCard).toBeTruthy();

    const approveButton = within(firstCard as HTMLElement).getByRole("button", {
      name: "Aprovar",
    });

    fireEvent.click(approveButton);

    expect(within(firstCard as HTMLElement).getByText("Aprovado")).toBeInTheDocument();
  });

  it("advances a marketing lead through the pipeline", () => {
    render(<MarketingLeadsPage />);

    const firstLeadCard = screen.getByText("Landing Page Cliente Alpha").closest("article");
    expect(firstLeadCard).toBeTruthy();

    const actionButton = within(firstLeadCard as HTMLElement).getByRole("button", {
      name: "Avançar estágio",
    });

    fireEvent.click(actionButton);

    expect(screen.getByRole("heading", { name: "Proposta enviada" })).toBeInTheDocument();
    expect(screen.getByText("Landing Page Cliente Alpha")).toBeInTheDocument();
  });
});
