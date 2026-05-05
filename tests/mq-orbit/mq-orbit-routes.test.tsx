import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import KanbanPage from "@/app/kanban/page";
import KanbanQuadrosPage from "@/app/kanban/quadros/page";
import AdministrativoPage from "@/app/administrativo/page";
import AdministrativoColaboradoresPage from "@/app/administrativo/colaboradores/page";
import AdministrativoClientesPage from "@/app/administrativo/clientes/page";
import AdministrativoPermissoesPage from "@/app/administrativo/permissoes/page";
import FinancasPage from "@/app/financas/page";
import FinancasContasAPagarPage from "@/app/financas/contas-a-pagar/page";
import ArquivosPage from "@/app/arquivos/page";
import ArquivosExploradorPage from "@/app/arquivos/explorador/page";
import DesignPage from "@/app/design/page";
import DesignAprovacoesPage from "@/app/design/aprovacoes/page";
import MarketingPage from "@/app/marketing/page";
import MarketingLeadsPage from "@/app/marketing/leads/page";
import AdministrativeFallbackPage from "@/app/administrativo/[subpage]/page";
import FinancasFallbackPage from "@/app/financas/[subpage]/page";
import ArquivosFallbackPage from "@/app/arquivos/[subpage]/page";
import DesignFallbackPage from "@/app/design/[subpage]/page";
import MarketingFallbackPage from "@/app/marketing/[subpage]/page";

describe("MQ Orbit route structure", () => {
  it("renders the root routes as real pages", () => {
    render(<KanbanPage />);
    expect(screen.getByText("Quadros ativos")).toBeInTheDocument();

    render(<AdministrativoPage />);
    expect(screen.getByText("Clientes ativos")).toBeInTheDocument();

    render(<FinancasPage />);
    expect(screen.getByText("Entradas previstas")).toBeInTheDocument();

    render(<ArquivosPage />);
    expect(screen.getByText("Arquivos totais")).toBeInTheDocument();

    render(<DesignPage />);
    expect(screen.getByText("Projetos ativos")).toBeInTheDocument();

    render(<MarketingPage />);
    expect(screen.getByText("Campanhas ativas")).toBeInTheDocument();
  });

  it("renders explicit subpages without a switch-based dispatcher", () => {
    render(<KanbanQuadrosPage />);
    expect(screen.getByText("Quadros existentes")).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "Novo quadro" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Voltar à visão geral" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir backlog" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ver cliente" })).not.toBeInTheDocument();

    render(<AdministrativoColaboradoresPage />);
    expect(screen.getByText("Colaboradores alocados")).toBeInTheDocument();

    render(<AdministrativoClientesPage />);
    expect(screen.getByText("Base de clientes")).toBeInTheDocument();

    render(<AdministrativoPermissoesPage />);
    expect(screen.getByText("Cargos cadastrados")).toBeInTheDocument();

    render(<FinancasContasAPagarPage />);
    expect(screen.getByText("Pendências")).toBeInTheDocument();

    render(<ArquivosExploradorPage />);
    expect(screen.getByText("Pastas")).toBeInTheDocument();

    render(<DesignAprovacoesPage />);
    expect(screen.getByText("Fila de materiais esperando retorno ou ajuste.")).toBeInTheDocument();

    render(<MarketingLeadsPage />);
    expect(screen.getByText("Pipeline simples com mudança de estágio em memória.")).toBeInTheDocument();
  });

  it("keeps the old [subpage] segment as notFound fallback", () => {
    expect(() => AdministrativeFallbackPage()).toThrow();
    expect(() => FinancasFallbackPage()).toThrow();
    expect(() => ArquivosFallbackPage()).toThrow();
    expect(() => DesignFallbackPage()).toThrow();
    expect(() => MarketingFallbackPage()).toThrow();
  });
});
