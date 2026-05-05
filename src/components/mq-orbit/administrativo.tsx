"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { tasks as kanbanTasks } from "@/components/mq-orbit/kanban";
import {
  DataTable,
  Drawer,
  EmptyState,
  Dialog,
  PageHeader,
  Pill,
  ProgressBar,
  SectionCard,
  StatGrid,
  Timeline,
} from "@/components/mq-orbit/ui";

type Employee = {
  id: string;
  name: string;
  role: string;
  area: string;
  access: "admin" | "gestor" | "operacional" | "visualizador";
  status: "Ativo" | "Férias" | "Pausado";
  specialty: string;
};

type Client = {
  id: string;
  name: string;
  status: "Ativo" | "Em implantação" | "Pausado";
  project: string;
  segment: string;
  ticket: string;
  lastContact: string;
  owner: string;
};

type Contract = {
  id: string;
  name: string;
  client: string;
  type: string;
  status: "rascunho" | "enviado" | "assinado" | "vencendo" | "encerrado";
  value: string;
  renewal: string;
};

type Process = {
  id: string;
  title: string;
  owner: string;
  priority: "Alta" | "Média" | "Baixa";
  status: "Aberto" | "Em análise" | "Aguardando" | "Concluído";
  deadline: string;
};

type Document = {
  id: string;
  title: string;
  type: "Contrato" | "Proposta" | "Comprovante" | "Termo" | "Nota" | "Política";
  owner: string;
  date: string;
  relatedTo: string;
};

type PermissionSectionGroup = "Agenda" | "Kanban" | "Administrativo" | "Finanças" | "Arquivos" | "Design" | "Marketing";

type PermissionSubsection = {
  id: string;
  group: PermissionSectionGroup;
  label: string;
  description: string;
};

type PermissionRoleProfile = {
  id: string;
  name: string;
  description: string;
  isManager: boolean;
  subsectionIds: string[];
};

type PermissionRoleFormDraft = {
  id: string | null;
  name: string;
  description: string;
  isManager: boolean;
  subsectionIds: string[];
};

type TeamAccessSection = "Kanban" | "Administrativo" | "Finanças" | "Arquivos" | "Design" | "Marketing";

type TeamStatus = "Ativa" | "Em ajuste" | "Pausada";

type Team = {
  id: string;
  name: string;
  area: string;
  accessSections: TeamAccessSection[];
  currentFunction: string;
  status: TeamStatus;
  specialty: string;
};

type TeamFormDraft = {
  id: string | null;
  name: string;
  area: string;
  accessSections: TeamAccessSection[];
  currentFunction: string;
  status: TeamStatus;
  specialty: string;
};

type Collaborator = {
  id: string;
  name: string;
  role: string;
  area: string;
  access: Employee["access"];
  status: Employee["status"];
  specialty: string;
  teamIds: string[];
};

type CollaboratorFormDraft = {
  id: string | null;
  name: string;
  role: string;
  area: string;
  access: Employee["access"];
  status: Employee["status"];
  specialty: string;
  teamIds: string[];
};

const employees: Employee[] = [
  { id: "e1", name: "Matheus Barcellos", role: "Direção de produto", area: "Administrativo", access: "admin", status: "Ativo", specialty: "hub e arquitetura" },
  { id: "e2", name: "Larissa Moura", role: "Operações", area: "Comercial", access: "gestor", status: "Ativo", specialty: "clientes e contratos" },
  { id: "e3", name: "Bruna Lima", role: "Design Lead", area: "Design", access: "operacional", status: "Ativo", specialty: "briefings e assets" },
  { id: "e4", name: "Lucas Andrade", role: "Financeiro", area: "Financeiro", access: "gestor", status: "Ativo", specialty: "cobranças e recorrência" },
  { id: "e5", name: "Camila Rocha", role: "Projeto", area: "Marketing", access: "operacional", status: "Férias", specialty: "campanhas e leads" },
];

const clients: Client[] = [
  { id: "c1", name: "MQSoftwares", status: "Ativo", project: "Projeto site institucional", segment: "Software house", ticket: "Interno", lastContact: "Hoje", owner: "Matheus" },
  { id: "c2", name: "PicBrand", status: "Ativo", project: "Rebranding PicBrand", segment: "Marca própria", ticket: "Médio", lastContact: "Ontem", owner: "Bruna" },
  { id: "c3", name: "Casa Zeeni", status: "Em implantação", project: "Contrato Casa Zeeni", segment: "Serviços", ticket: "Alto", lastContact: "2 dias", owner: "Larissa" },
  { id: "c4", name: "Landing Page Cliente Alpha", status: "Ativo", project: "Captação Landing Pages", segment: "Marketing digital", ticket: "Alto", lastContact: "Hoje", owner: "Camila" },
];

const contracts: Contract[] = [
  { id: "ct1", name: "Contrato Casa Zeeni", client: "Casa Zeeni", type: "Recorrente", status: "assinado", value: "R$ 4.800/mês", renewal: "12/05/2026" },
  { id: "ct2", name: "Proposta Comercial LP Premium", client: "Landing Page Cliente Alpha", type: "Projeto", status: "enviado", value: "R$ 7.200", renewal: "28/04/2026" },
  { id: "ct3", name: "Aditivo PicBrand", client: "PicBrand", type: "Aditivo", status: "vencendo", value: "R$ 2.100", renewal: "24/04/2026" },
  { id: "ct4", name: "Contrato suporte interno", client: "MQSoftwares", type: "Interno", status: "rascunho", value: "R$ 0", renewal: "30/04/2026" },
];

const processes: Process[] = [
  { id: "p1", title: "Aprovação de orçamento", owner: "Larissa", priority: "Alta", status: "Em análise", deadline: "23/04/2026" },
  { id: "p2", title: "Validação de identidade visual", owner: "Bruna", priority: "Alta", status: "Aguardando", deadline: "24/04/2026" },
  { id: "p3", title: "Liberação de pagamento", owner: "Lucas", priority: "Média", status: "Aberto", deadline: "25/04/2026" },
  { id: "p4", title: "Revisão contratual", owner: "Matheus", priority: "Baixa", status: "Concluído", deadline: "21/04/2026" },
];

const documents: Document[] = [
  { id: "d1", title: "Contrato Casa Zeeni", type: "Contrato", owner: "Administrativo", date: "22/04/2026", relatedTo: "Casa Zeeni" },
  { id: "d2", title: "Proposta Comercial LP Premium", type: "Proposta", owner: "Comercial", date: "21/04/2026", relatedTo: "Landing Page Cliente Alpha" },
  { id: "d3", title: "Comprovante Stripe SaaS", type: "Comprovante", owner: "Financeiro", date: "20/04/2026", relatedTo: "Stripe SaaS" },
  { id: "d4", title: "Política interna de acesso", type: "Política", owner: "Operação", date: "19/04/2026", relatedTo: "MQ Orbit" },
];

const permissionSubsections: PermissionSubsection[] = [
  { id: "agenda-calendario", group: "Agenda", label: "Calendário", description: "Agenda principal com compromissos e visão diária." },
  { id: "agenda-compromissos", group: "Agenda", label: "Compromissos", description: "Lista operacional de reuniões e lembretes do time." },
  { id: "kanban-quadros", group: "Kanban", label: "Quadros", description: "Quadros ativos para gestão do fluxo e execução." },
  { id: "kanban-backlog", group: "Kanban", label: "Backlog", description: "Organização de demandas futuras e priorização." },
  { id: "kanban-etiquetas", group: "Kanban", label: "Etiquetas", description: "Classificação visual e contexto dos cards." },
  { id: "kanban-sprints", group: "Kanban", label: "Sprints", description: "Planejamento e cadência das entregas." },
  { id: "administrativo-equipe", group: "Administrativo", label: "Equipe", description: "Gestão das equipes e seções liberadas." },
  { id: "administrativo-colaboradores", group: "Administrativo", label: "Colaboradores", description: "Cadastro individual de colaboradores e vínculos." },
  { id: "administrativo-permissoes", group: "Administrativo", label: "Cargos", description: "Configuração de cargos e alcance das subseções." },
  { id: "administrativo-clientes", group: "Administrativo", label: "Clientes", description: "Base de clientes e relacionamento comercial." },
  { id: "administrativo-contratos", group: "Administrativo", label: "Contratos", description: "Contratos, propostas e renovações em andamento." },
  { id: "administrativo-processos", group: "Administrativo", label: "Processos", description: "Fluxos internos de aprovação e acompanhamento." },
  { id: "administrativo-documentos", group: "Administrativo", label: "Documentos", description: "Arquivos administrativos vinculados à operação." },
  { id: "financas-fluxo-de-caixa", group: "Finanças", label: "Fluxo de caixa", description: "Visão consolidada de entradas e saídas." },
  { id: "financas-contas-a-pagar", group: "Finanças", label: "Contas a pagar", description: "Despesas pendentes e prazos de quitação." },
  { id: "financas-contas-a-receber", group: "Finanças", label: "Contas a receber", description: "Recebimentos previstos e acompanhamento." },
  { id: "financas-assinaturas", group: "Finanças", label: "Assinaturas", description: "Serviços recorrentes e cobranças contínuas." },
  { id: "financas-centros-de-custo", group: "Finanças", label: "Centros de custo", description: "Distribuição financeira por frente e núcleo." },
  { id: "financas-relatorios", group: "Finanças", label: "Relatórios", description: "Leitura executiva e relatórios financeiros." },
  { id: "arquivos-explorador", group: "Arquivos", label: "Explorador", description: "Navegação principal da estrutura de arquivos." },
  { id: "arquivos-recentes", group: "Arquivos", label: "Recentes", description: "Itens atualizados ou consultados recentemente." },
  { id: "arquivos-compartilhados", group: "Arquivos", label: "Compartilhados", description: "Arquivos liberados para outros setores." },
  { id: "arquivos-favoritos", group: "Arquivos", label: "Favoritos", description: "Atalhos rápidos para materiais recorrentes." },
  { id: "arquivos-lixeira", group: "Arquivos", label: "Lixeira", description: "Itens removidos aguardando revisão." },
  { id: "design-projetos", group: "Design", label: "Projetos", description: "Projetos criativos em execução e acompanhamento." },
  { id: "design-briefings", group: "Design", label: "Briefings", description: "Solicitações, contexto e direcionamento visual." },
  { id: "design-assets", group: "Design", label: "Assets", description: "Biblioteca de peças, arquivos e materiais." },
  { id: "design-templates", group: "Design", label: "Templates", description: "Estruturas base para acelerar novas entregas." },
  { id: "design-aprovacoes", group: "Design", label: "Aprovações", description: "Fila de retorno e aprovação de materiais." },
  { id: "design-referencias", group: "Design", label: "Referências", description: "Repertório visual e base de inspiração." },
  { id: "marketing-campanhas", group: "Marketing", label: "Campanhas", description: "Campanhas ativas e seu desempenho." },
  { id: "marketing-calendario-editorial", group: "Marketing", label: "Calendário editorial", description: "Programação de conteúdo e publicações." },
  { id: "marketing-leads", group: "Marketing", label: "Leads", description: "Captação e qualificação comercial." },
  { id: "marketing-landing-pages", group: "Marketing", label: "Landing pages", description: "Páginas de captação e performance." },
  { id: "marketing-metricas", group: "Marketing", label: "Métricas", description: "Indicadores de mídia, campanha e conversão." },
  { id: "marketing-automacoes", group: "Marketing", label: "Automações", description: "Fluxos automatizados de marketing e CRM." },
];

const permissionSectionGroups = [
  "Agenda",
  "Kanban",
  "Administrativo",
  "Finanças",
  "Arquivos",
  "Design",
  "Marketing",
] as const satisfies readonly PermissionSectionGroup[];

const permissionSubsectionIds = permissionSubsections.map((subsection) => subsection.id);

const permissionSubsectionById = Object.fromEntries(
  permissionSubsections.map((subsection) => [subsection.id, subsection]),
) as Record<string, PermissionSubsection>;

const permissionRoleSeed: PermissionRoleProfile[] = [
  {
    id: "role-1",
    name: "Admin",
    description: "Acesso amplo para revisão, gestão e configuração das frentes internas.",
    isManager: false,
    subsectionIds: [...permissionSubsectionIds],
  },
  {
    id: "role-2",
    name: "Gestor",
    description: "Liberação total para supervisão transversal de todas as subseções do projeto.",
    isManager: true,
    subsectionIds: [...permissionSubsectionIds],
  },
  {
    id: "role-3",
    name: "Operacional",
    description: "Execução diária focada em Kanban, Arquivos e pontos essenciais do Administrativo.",
    isManager: false,
    subsectionIds: [
      "kanban-quadros",
      "kanban-backlog",
      "kanban-etiquetas",
      "kanban-sprints",
      "administrativo-colaboradores",
      "administrativo-clientes",
      "administrativo-contratos",
      "arquivos-explorador",
      "arquivos-recentes",
      "design-briefings",
      "design-assets",
      "marketing-leads",
    ],
  },
  {
    id: "role-4",
    name: "Visualizador",
    description: "Consulta guiada para acompanhamento dos pontos principais sem amplitude total.",
    isManager: false,
    subsectionIds: [
      "agenda-calendario",
      "kanban-quadros",
      "administrativo-clientes",
      "administrativo-documentos",
      "financas-relatorios",
      "arquivos-compartilhados",
      "design-aprovacoes",
      "marketing-metricas",
    ],
  },
];

const teamStatusTone: Record<TeamStatus, "default" | "accent" | "warning" | "danger" | "success"> = {
  Ativa: "success",
  "Em ajuste": "warning",
  Pausada: "default",
};

const teamSeed: Team[] = [
  {
    id: "team-1",
    name: "Equipe Produto",
    area: "Administrativo",
    accessSections: ["Administrativo"],
    currentFunction: "Direção de produto",
    status: "Ativa",
    specialty: "hub e arquitetura",
  },
  {
    id: "team-2",
    name: "Equipe Operações",
    area: "Comercial",
    accessSections: ["Administrativo"],
    currentFunction: "Operações e contratos",
    status: "Ativa",
    specialty: "clientes e contratos",
  },
  {
    id: "team-3",
    name: "Equipe Criativa",
    area: "Design",
    accessSections: ["Design"],
    currentFunction: "Design Lead",
    status: "Ativa",
    specialty: "briefings e assets",
  },
  {
    id: "team-4",
    name: "Equipe Financeira",
    area: "Financeiro",
    accessSections: ["Finanças"],
    currentFunction: "Gestão financeira",
    status: "Em ajuste",
    specialty: "cobranças e recorrência",
  },
  {
    id: "team-5",
    name: "Equipe Marketing",
    area: "Marketing",
    accessSections: ["Marketing"],
    currentFunction: "Projetos e campanhas",
    status: "Pausada",
    specialty: "campanhas e leads",
  },
];

const collaboratorSeed: Collaborator[] = [
  {
    id: "collaborator-1",
    name: "Matheus Barcellos",
    role: "Direção de produto",
    area: "Administrativo",
    access: "admin",
    status: "Ativo",
    specialty: "hub e arquitetura",
    teamIds: ["team-1", "team-2"],
  },
  {
    id: "collaborator-2",
    name: "Larissa Moura",
    role: "Operações",
    area: "Comercial",
    access: "gestor",
    status: "Ativo",
    specialty: "clientes e contratos",
    teamIds: ["team-2"],
  },
  {
    id: "collaborator-3",
    name: "Bruna Lima",
    role: "Design Lead",
    area: "Design",
    access: "operacional",
    status: "Ativo",
    specialty: "briefings e assets",
    teamIds: ["team-3", "team-5"],
  },
  {
    id: "collaborator-4",
    name: "Lucas Andrade",
    role: "Financeiro",
    area: "Financeiro",
    access: "gestor",
    status: "Ativo",
    specialty: "cobranças e recorrência",
    teamIds: ["team-4"],
  },
  {
    id: "collaborator-5",
    name: "Camila Rocha",
    role: "Projeto",
    area: "Marketing",
    access: "operacional",
    status: "Férias",
    specialty: "campanhas e leads",
    teamIds: ["team-5", "team-2"],
  },
];

const permissionModules = [
  "Kanban",
  "Administrativo",
  "Finanças",
  "Arquivos",
  "Design",
  "Marketing",
] as const satisfies readonly TeamAccessSection[];

const accessRoles = [
  { key: "admin", label: "Admin" },
  { key: "gestor", label: "Gestor" },
  { key: "operacional", label: "Operacional" },
  { key: "visualizador", label: "Visualizador" },
] as const;

const activity = [
  { time: "08:30", title: "Novo cliente cadastrado", description: "Landing Page Cliente Alpha entrou em acompanhamento ativo.", tone: "accent" as const },
  { time: "09:15", title: "Contrato próximo do vencimento", description: "Aditivo PicBrand sinalizado no painel de contratos.", tone: "warning" as const },
  { time: "11:20", title: "Cargo revisado", description: "Acesso operacional habilitado para o módulo de Design.", tone: "default" as const },
];

const statusTone: Record<string, "default" | "accent" | "warning" | "danger" | "success"> = {
  Ativo: "success",
  "Em implantação": "accent",
  Pausado: "warning",
  assinado: "success",
  enviado: "accent",
  vencendo: "warning",
  encerrado: "default",
  rascunho: "default",
  Aberto: "default",
  "Em análise": "accent",
  Aguardando: "warning",
  Concluído: "success",
};

const priorityTone: Record<Process["priority"], "default" | "accent" | "warning" | "danger" | "success"> = {
  Baixa: "default",
  Média: "accent",
  Alta: "warning",
};

const accessTone: Record<Employee["access"], "default" | "accent" | "warning" | "danger" | "success"> = {
  admin: "accent",
  gestor: "warning",
  operacional: "default",
  visualizador: "default",
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createTeamFormDraft(team?: Team | null): TeamFormDraft {
  return {
    id: team?.id ?? null,
    name: team?.name ?? "",
    area: team?.area ?? "",
    accessSections: team?.accessSections ? [...team.accessSections] : ["Administrativo"],
    currentFunction: team?.currentFunction ?? "",
    status: team?.status ?? "Ativa",
    specialty: team?.specialty ?? "",
  };
}

function createCollaboratorFormDraft(collaborator?: Collaborator | null): CollaboratorFormDraft {
  return {
    id: collaborator?.id ?? null,
    name: collaborator?.name ?? "",
    role: collaborator?.role ?? "",
    area: collaborator?.area ?? "",
    access: collaborator?.access ?? "operacional",
    status: collaborator?.status ?? "Ativo",
    specialty: collaborator?.specialty ?? "",
    teamIds: collaborator?.teamIds ?? [],
  };
}

function createPermissionRoleFormDraft(role?: PermissionRoleProfile | null): PermissionRoleFormDraft {
  return {
    id: role?.id ?? null,
    name: role?.name ?? "",
    description: role?.description ?? "",
    isManager: role?.isManager ?? false,
    subsectionIds: role?.subsectionIds ? [...role.subsectionIds] : [],
  };
}

function normalizePersonReference(value: string) {
  return value.trim().toLowerCase();
}

function getCollaboratorAliases(name: string) {
  const normalizedName = normalizePersonReference(name);
  const firstName = normalizedName.split(/\s+/)[0] ?? "";

  return [normalizedName, firstName].filter(Boolean);
}

function buildCollaboratorAssignedCardsMap(collaborators: Collaborator[]) {
  const collaboratorAliases = collaborators.map((collaborator) => ({
    id: collaborator.id,
    aliases: getCollaboratorAliases(collaborator.name),
  }));

  return Object.fromEntries(
    collaboratorAliases.map((collaboratorAlias) => {
      const assignedCards = kanbanTasks.filter((task) =>
        collaboratorAlias.aliases.includes(normalizePersonReference(task.assignee)),
      ).length;

      return [collaboratorAlias.id, assignedCards];
    }),
  ) as Record<string, number>;
}

function buildTeamAssignedCardsMap(
  teams: Team[],
  collaborators: Collaborator[],
  collaboratorLoadById: Record<string, number>,
) {
  const teamIds = new Set(teams.map((team) => team.id));
  const loads = Object.fromEntries(teams.map((team) => [team.id, 0])) as Record<string, number>;

  collaborators.forEach((collaborator) => {
    const assignedCards = collaboratorLoadById[collaborator.id] ?? 0;
    const validTeamIds = collaborator.teamIds.filter((teamId) => teamIds.has(teamId));

    if (!assignedCards || !validTeamIds.length) {
      return;
    }

    const distributedLoad = assignedCards / validTeamIds.length;

    validTeamIds.forEach((teamId) => {
      loads[teamId] += distributedLoad;
    });
  });

  return loads;
}

function buildRelativeLoadMap(loadById: Record<string, number>) {
  const maxLoad = Math.max(0, ...Object.values(loadById));

  return Object.fromEntries(
    Object.entries(loadById).map(([id, load]) => [
      id,
      maxLoad ? Math.round((load / maxLoad) * 100) : 0,
    ]),
  ) as Record<string, number>;
}

function getAverageLoad(loadById: Record<string, number>, totalItems: number) {
  if (!totalItems) {
    return 0;
  }

  const totalLoad = Object.values(loadById).reduce((sum, load) => sum + load, 0);

  return totalLoad / totalItems;
}

function getLoadSummary(load: number, averageLoad: number) {
  const loadDelta = load - averageLoad;

  if (loadDelta > 0.25) {
    return "Acima da média";
  }

  if (loadDelta < -0.25) {
    return "Abaixo da média";
  }

  return "Na média";
}

export function AdministrativoOverviewPage() {
  const collaboratorLoadById = useMemo(
    () => buildCollaboratorAssignedCardsMap(collaboratorSeed),
    [],
  );
  const teamLoadById = useMemo(
    () => buildTeamAssignedCardsMap(teamSeed, collaboratorSeed, collaboratorLoadById),
    [collaboratorLoadById],
  );
  const areaLoadByName = useMemo(() => {
    const nextLoads = new Map<string, number>();

    teamSeed.forEach((team) => {
      const currentLoad = nextLoads.get(team.area) ?? 0;
      nextLoads.set(team.area, currentLoad + (teamLoadById[team.id] ?? 0));
    });

    return Object.fromEntries(nextLoads.entries()) as Record<string, number>;
  }, [teamLoadById]);
  const areaLoadPercentageByName = useMemo(
    () => buildRelativeLoadMap(areaLoadByName),
    [areaLoadByName],
  );
  const areaLoadEntries = useMemo(
    () =>
      Object.entries(areaLoadByName)
        .map(([label, load]) => ({
          label,
          value: areaLoadPercentageByName[label] ?? 0,
          cards: load,
        }))
        .sort((left, right) => right.cards - left.cards),
    [areaLoadByName, areaLoadPercentageByName],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administrativo"
        title="Visão Geral"
        description="Centro de operação interna, equipe, clientes, contratos e cargos da MQ."
        breadcrumbs={[{ href: "/administrativo", label: "Administrativo" }, { label: "Visão Geral" }]}
        actions={
          <>
            <Link href="/administrativo/clientes" className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-2">
              Clientes
            </Link>
            <Link href="/administrativo/contratos" className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15">
              Contratos
            </Link>
          </>
        }
      />

      <StatGrid
        items={[
          { label: "Clientes ativos", value: "4", detail: "vínculos em acompanhamento" },
          { label: "Contratos vigentes", value: "2", detail: "inclui renovações próximas" },
          { label: "Equipe", value: String(collaboratorSeed.length), detail: "núcleo operacional da MQ" },
          { label: "Processos pendentes", value: String(processes.filter((item) => item.status !== "Concluído").length), detail: "solicitações em andamento" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Aprovações pendentes" description="Fluxo administrativo que precisa de atenção">
          <div className="space-y-3">
            {processes.filter((item) => item.status !== "Concluído").map((item) => (
              <article key={item.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Responsável: {item.owner}</p>
                  </div>
                  <Pill tone={priorityTone[item.priority]}>{item.priority}</Pill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone={statusTone[item.status]}>{item.status}</Pill>
                  <Pill>{item.deadline}</Pill>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Próximos vencimentos" description="Contratos e processos com prazo curto">
          <div className="space-y-4">
            <Timeline items={activity} />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Status de setores" description="Leitura rápida da operação">
          <div className="space-y-4">
            {areaLoadEntries.map((item) => (
              <div key={item.label} className="space-y-2">
                <ProgressBar value={item.value} label={item.label} />
                <p className="text-xs text-muted-foreground">
                  {item.cards.toFixed(1)} card(s) distribuídos entre as equipes deste setor
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Documentos recentes" description="Arquivos administrativos vinculados a clientes e contratos">
          <div className="grid gap-3">
            {documents.map((document) => (
              <article key={document.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{document.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{document.relatedTo}</p>
                  </div>
                  <Pill>{document.type}</Pill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>{document.owner}</Pill>
                  <Pill>{document.date}</Pill>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function AdministrativoEquipePage() {
  const [teams, setTeams] = useState<Team[]>(() =>
    teamSeed.map((team) => ({ ...team, accessSections: [...team.accessSections] })),
  );
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<TeamAccessSection | "Todas">("Todas");
  const [teamFormDraft, setTeamFormDraft] = useState<TeamFormDraft | null>(null);
  const [deleteTargetTeam, setDeleteTargetTeam] = useState<Team | null>(null);

  const teamCollaboratorCountById = useMemo(
    () =>
      Object.fromEntries(
        teams.map((team) => [
          team.id,
          collaboratorSeed.filter((collaborator) => collaborator.teamIds.includes(team.id)).length,
        ]),
      ) as Record<string, number>,
    [teams],
  );
  const teamLoadById = useMemo(
    () => buildTeamAssignedCardsMap(teams, collaboratorSeed, buildCollaboratorAssignedCardsMap(collaboratorSeed)),
    [teams],
  );
  const teamLoadPercentageById = useMemo(
    () => buildRelativeLoadMap(teamLoadById),
    [teamLoadById],
  );
  const averageCardsPerTeam = useMemo(
    () => getAverageLoad(teamLoadById, teams.length),
    [teamLoadById, teams.length],
  );
  const sectionFilterOptions = permissionModules;

  const filteredTeams = useMemo(
    () =>
      teams.filter((team) => {
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch =
          `${team.name} ${team.area} ${team.accessSections.join(" ")} ${team.currentFunction} ${team.specialty}`.toLowerCase().includes(
            normalizedSearch,
          );
        const matchesSection =
          sectionFilter === "Todas" || team.accessSections.includes(sectionFilter);

        return matchesSearch && matchesSection;
      }),
    [search, sectionFilter, teams],
  );

  const teamStats = useMemo(
    () => ({
      total: teams.length,
      active: teams.filter((team) => team.status === "Ativa").length,
      adjusting: teams.filter((team) => team.status === "Em ajuste").length,
      paused: teams.filter((team) => team.status === "Pausada").length,
    }),
    [teams],
  );

  const teamFormCanSave = Boolean(
    teamFormDraft &&
      teamFormDraft.name.trim() &&
      teamFormDraft.area.trim() &&
      teamFormDraft.accessSections.length &&
      teamFormDraft.currentFunction.trim() &&
      teamFormDraft.specialty.trim(),
  );

  function openCreateTeamDrawer() {
    setTeamFormDraft(createTeamFormDraft());
  }

  function openEditTeamDrawer(team: Team) {
    setTeamFormDraft(createTeamFormDraft(team));
  }

  function closeTeamFormDrawer() {
    setTeamFormDraft(null);
  }

  function saveTeamFormDraft() {
    if (!teamFormDraft || !teamFormCanSave) {
      return;
    }

    const nextTeam: Team = {
      id: teamFormDraft.id ?? createId("team"),
      name: teamFormDraft.name.trim(),
      area: teamFormDraft.area.trim(),
      accessSections: [...teamFormDraft.accessSections],
      currentFunction: teamFormDraft.currentFunction.trim(),
      status: teamFormDraft.status,
      specialty: teamFormDraft.specialty.trim(),
    };

    setTeams((current) =>
      teamFormDraft.id
        ? current.map((team) => (team.id === teamFormDraft.id ? nextTeam : team))
        : [...current, nextTeam],
    );
    closeTeamFormDrawer();
  }

  function openDeleteTeamConfirm(team: Team) {
    setDeleteTargetTeam(team);
  }

  function closeDeleteTeamConfirm() {
    setDeleteTargetTeam(null);
  }

  function handleDeleteTeam() {
    if (!deleteTargetTeam) {
      return;
    }

    setTeams((current) => current.filter((team) => team.id !== deleteTargetTeam.id));
    closeDeleteTeamConfirm();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administrativo"
        title="Equipes"
        description="Equipes internas para organizar colaboradores, distribuir acesso por seção e gerenciar a operação."
        breadcrumbs={[{ href: "/administrativo", label: "Administrativo" }, { label: "Equipes" }]}
        actions={
          <button
            type="button"
            onClick={openCreateTeamDrawer}
            className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Nova equipe
          </button>
        }
      />

      <StatGrid
        items={[
          { label: "Equipes", value: String(teamStats.total), detail: "cadastros ativos no setor" },
          { label: "Ativas", value: String(teamStats.active), detail: "equipes operando normalmente" },
          { label: "Em ajuste", value: String(teamStats.adjusting), detail: "times em reorganização" },
          { label: "Pausadas", value: String(teamStats.paused), detail: "times sem operação corrente" },
        ]}
      />

      <SectionCard
        title="Filtros"
        description="Busque por equipe, área, escopo ou refine rapidamente pelas seções que essa equipe libera no sistema."
      >
        <div className="space-y-4">
          <label className="block">
            <span className="sr-only">Buscar equipe, área, seção de acesso, escopo ou especialidade</span>
            <div className="flex items-center gap-3 rounded-[1.6rem] border border-border bg-surface-2 px-4 py-3">
              <span aria-hidden="true" className="text-sm text-muted-foreground">
                Buscar
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar equipe, área, seção de acesso, escopo ou especialidade"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </label>

          <div className="flex flex-wrap gap-2" aria-label="Filtros rápidos">
            <button
              type="button"
              onClick={() => setSectionFilter("Todas")}
              className={[
                "rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                sectionFilter === "Todas"
                  ? "border-accent/35 bg-accent/10 text-foreground"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              Todas as seções
            </button>
            {sectionFilterOptions.map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setSectionFilter(section)}
                className={[
                  "rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                  sectionFilter === section
                    ? "border-accent/35 bg-accent/10 text-foreground"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Equipes cadastradas"
        description="Cada equipe exibe suas seções, o escopo principal, a carga distribuída e os colaboradores vinculados."
      >
        {filteredTeams.length ? (
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              (() => {
                const assignedCards = teamLoadById[team.id] ?? 0;
                const loadPercentage = teamLoadPercentageById[team.id] ?? 0;
                const loadSummary = getLoadSummary(assignedCards, averageCardsPerTeam);
                const collaboratorCount = teamCollaboratorCountById[team.id] ?? 0;

                return (
                  <article
                    key={team.id}
                    className="rounded-[1.6rem] border border-border bg-surface-2 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-lg font-semibold tracking-tight text-foreground">{team.name}</p>
                            <p className="mt-1 text-base text-muted-foreground">{team.currentFunction}</p>
                          </div>
                          <Pill tone={teamStatusTone[team.status]}>{team.status}</Pill>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Pill>{team.area}</Pill>
                          {team.accessSections.map((section) => (
                            <Pill key={`${team.id}-${section}`} tone="accent">
                              {section}
                            </Pill>
                          ))}
                          <Pill>{team.specialty}</Pill>
                          <Pill tone="accent">{collaboratorCount} colaborador(es)</Pill>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start lg:pl-4">
                        <button
                          type="button"
                          aria-label={`Editar equipe ${team.name}`}
                          onClick={() => openEditTeamDrawer(team)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-surface"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label={`Remover equipe ${team.name}`}
                          onClick={() => openDeleteTeamConfirm(team)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFA500]/30 bg-[#FFA500]/10 text-foreground transition hover:bg-[#FFA500]/15"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-5">
                      <ProgressBar value={loadPercentage} label="Carga operacional" />
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                        <span>{assignedCards.toFixed(1)} card(s) distribuídos</span>
                        <span>•</span>
                        <span>Média atual {averageCardsPerTeam.toFixed(1)}</span>
                        <span>•</span>
                        <span>{loadSummary}</span>
                      </div>
                    </div>
                  </article>
                );
              })()
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma equipe encontrada"
            description="Ajuste a busca ou o filtro de área para localizar outro grupo."
            action={
              <button
                type="button"
                onClick={openCreateTeamDrawer}
                className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Nova equipe
              </button>
            }
          />
        )}
      </SectionCard>

      {teamFormDraft ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeTeamFormDrawer}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-form-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[46rem] max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[2rem] border border-accent/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6 lg:max-w-[68rem] lg:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  {teamFormDraft.id ? "Rascunho ilustrativo" : "Nova equipe"}
                </p>
                <div className="flex items-center gap-3">
                  {!teamFormDraft.id ? (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-foreground">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  ) : null}
                  <div>
                    <h2
                      id="team-form-dialog-title"
                      className="text-xl font-semibold tracking-tight text-foreground"
                    >
                      {teamFormDraft.id ? "Editar equipe" : "Nova equipe"}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {teamFormDraft.currentFunction || "Configure a equipe para organizar colaboradores e acessos por seção."}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeTeamFormDrawer}
                aria-label={teamFormDraft.id ? "Fechar edição de equipe" : "Fechar criação de equipe"}
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Nome da equipe
                    </span>
                    <input
                      value={teamFormDraft.name}
                      onChange={(event) =>
                        setTeamFormDraft((current) =>
                          current ? { ...current, name: event.target.value } : current,
                        )
                      }
                      placeholder="Equipe Operações"
                      autoComplete="off"
                      spellCheck={false}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Área
                    </span>
                    <input
                      value={teamFormDraft.area}
                      onChange={(event) =>
                        setTeamFormDraft((current) =>
                          current ? { ...current, area: event.target.value } : current,
                        )
                      }
                      placeholder="Administrativo"
                      autoComplete="off"
                      spellCheck={false}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Escopo principal
                    </span>
                    <input
                      value={teamFormDraft.currentFunction}
                      onChange={(event) =>
                        setTeamFormDraft((current) =>
                          current ? { ...current, currentFunction: event.target.value } : current,
                        )
                      }
                      placeholder="Operações e contratos"
                      autoComplete="off"
                      spellCheck={false}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Especialidade
                    </span>
                    <input
                      value={teamFormDraft.specialty}
                      onChange={(event) =>
                        setTeamFormDraft((current) =>
                          current ? { ...current, specialty: event.target.value } : current,
                        )
                      }
                      placeholder="Relacionamento e organização"
                      autoComplete="off"
                      spellCheck={false}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Configuração da equipe
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          A equipe organiza colaboradores por seção e ajuda a distribuir o acesso no sistema.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Status
                        </span>
                        <select
                          value={teamFormDraft.status}
                          onChange={(event) =>
                            setTeamFormDraft((current) =>
                              current ? { ...current, status: event.target.value as TeamStatus } : current,
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                        >
                          <option value="Ativa">Ativa</option>
                          <option value="Em ajuste">Em ajuste</option>
                          <option value="Pausada">Pausada</option>
                          </select>
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Seções com acesso
                        </span>
                        <div className="mt-2 rounded-2xl border border-panel-border bg-panel-surface px-4 py-4">
                          <div className="flex flex-wrap gap-2" aria-label="Seleção de seções com acesso">
                            <button
                              type="button"
                              aria-label="Todos"
                              onClick={() =>
                                setTeamFormDraft((current) =>
                                  current
                                    ? { ...current, accessSections: [...permissionModules] }
                                    : current,
                                )
                              }
                              className={[
                                "rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                                teamFormDraft.accessSections.length === permissionModules.length
                                  ? "border-accent/35 bg-accent/10 text-foreground"
                                  : "border-panel-border bg-panel-surface-muted text-muted-foreground hover:text-foreground",
                              ].join(" ")}
                            >
                              Todos
                            </button>
                            {permissionModules.map((module) => {
                              const isSelected = teamFormDraft.accessSections.includes(module);

                              return (
                                <button
                                  key={module}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() =>
                                    setTeamFormDraft((current) => {
                                      if (!current) {
                                        return current;
                                      }

                                      return {
                                        ...current,
                                        accessSections: isSelected
                                          ? current.accessSections.filter((section) => section !== module)
                                          : [...current.accessSections, module],
                                      };
                                    })
                                  }
                                  className={[
                                    "rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                                    isSelected
                                      ? "border-accent/35 bg-accent/10 text-foreground"
                                      : "border-panel-border bg-panel-surface-muted text-muted-foreground hover:text-foreground",
                                  ].join(" ")}
                                >
                                  {module}
                                </button>
                              );
                            })}
                          </div>
                          <p className="mt-3 text-xs leading-5 text-muted-foreground">
                            Selecione uma ou mais seções. Use &quot;Todos&quot; para liberar a equipe em todo o sistema.
                          </p>
                        </div>
                      </label>

                      <div className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Colaboradores vinculados
                        </span>
                        <div className="mt-2 rounded-2xl border border-panel-border bg-panel-surface px-4 py-3">
                          <p className="text-sm font-semibold text-foreground">
                            {teamFormDraft.id
                              ? `${teamCollaboratorCountById[teamFormDraft.id] ?? 0} colaborador(es)`
                              : "0 colaborador(es)"}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Atribuição gerenciada na subseção de colaboradores.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Carga operacional
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Valor automático com base nos cards do Kanban rateados entre as equipes vinculadas.
                        </p>
                      </div>
                      <Pill tone="accent">
                        {teamFormDraft.id ? `${(teamLoadById[teamFormDraft.id] ?? 0).toFixed(1)} card(s)` : "0.0 card(s)"}
                      </Pill>
                    </div>

                    <div className="mt-4">
                      <ProgressBar
                        value={teamFormDraft.id ? teamLoadPercentageById[teamFormDraft.id] ?? 0 : 0}
                        label="Carga operacional"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeTeamFormDrawer}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveTeamFormDraft}
                disabled={!teamFormCanSave}
                className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Salvar equipe
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <Dialog
        open={Boolean(deleteTargetTeam)}
        title="Tem certeza que deseja remover?"
        subtitle={deleteTargetTeam ? deleteTargetTeam.name : undefined}
        onClose={closeDeleteTeamConfirm}
      >
        {deleteTargetTeam ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              A equipe será removida desta página e deixará de aparecer na lista.
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={closeDeleteTeamConfirm}
                className="rounded-2xl border border-[#FFA500]/30 bg-[#FFA500]/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-[#FFA500]/15"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteTeam}
                className="rounded-2xl border border-accent/25 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Remover
              </button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

export function AdministrativoColaboradoresPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() =>
    collaboratorSeed.map((collaborator) => ({ ...collaborator, teamIds: [...collaborator.teamIds] })),
  );
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("Todos");
  const [collaboratorFormDraft, setCollaboratorFormDraft] = useState<CollaboratorFormDraft | null>(null);
  const [deleteTargetCollaborator, setDeleteTargetCollaborator] = useState<Collaborator | null>(null);

  const teamNameById = useMemo(
    () =>
      Object.fromEntries(teamSeed.map((team) => [team.id, team.name])),
    [],
  );

  const collaboratorLoadById = useMemo(
    () => buildCollaboratorAssignedCardsMap(collaborators),
    [collaborators],
  );

  const averageCardsPerCollaborator = useMemo(
    () => getAverageLoad(collaboratorLoadById, collaborators.length),
    [collaboratorLoadById, collaborators.length],
  );

  const maxCardsPerCollaborator = useMemo(
    () => Math.max(0, ...Object.values(collaboratorLoadById)),
    [collaboratorLoadById],
  );

  const filteredCollaborators = useMemo(
    () =>
      collaborators.filter((collaborator) => {
        const normalizedSearch = search.trim().toLowerCase();
        const assignedTeams = collaborator.teamIds.map((teamId) => teamNameById[teamId] ?? "");
        const matchesSearch =
          `${collaborator.name} ${collaborator.role} ${collaborator.area} ${collaborator.specialty} ${assignedTeams.join(" ")}`
            .toLowerCase()
            .includes(normalizedSearch);
        const matchesTeam = teamFilter === "Todos" || collaborator.teamIds.includes(teamFilter);

        return matchesSearch && matchesTeam;
      }),
    [collaborators, search, teamFilter, teamNameById],
  );

  const collaboratorStats = useMemo(
    () => ({
      total: collaborators.length,
      active: collaborators.filter((collaborator) => collaborator.status === "Ativo").length,
      leadership: collaborators.filter((collaborator) => collaborator.access === "admin" || collaborator.access === "gestor").length,
      multiTeam: collaborators.filter((collaborator) => collaborator.teamIds.length > 1).length,
    }),
    [collaborators],
  );

  const collaboratorFormCanSave = Boolean(
    collaboratorFormDraft &&
      collaboratorFormDraft.name.trim() &&
      collaboratorFormDraft.role.trim() &&
      collaboratorFormDraft.area.trim() &&
      collaboratorFormDraft.specialty.trim() &&
      collaboratorFormDraft.teamIds.length,
  );

  function openCreateCollaboratorDrawer() {
    setCollaboratorFormDraft(createCollaboratorFormDraft());
  }

  function openEditCollaboratorDrawer(collaborator: Collaborator) {
    setCollaboratorFormDraft(createCollaboratorFormDraft(collaborator));
  }

  function closeCollaboratorFormDrawer() {
    setCollaboratorFormDraft(null);
  }

  function toggleDraftTeam(teamId: string) {
    setCollaboratorFormDraft((current) => {
      if (!current) {
        return current;
      }

      const nextTeamIds = current.teamIds.includes(teamId)
        ? current.teamIds.filter((currentTeamId) => currentTeamId !== teamId)
        : [...current.teamIds, teamId];

      return { ...current, teamIds: nextTeamIds };
    });
  }

  function saveCollaboratorFormDraft() {
    if (!collaboratorFormDraft || !collaboratorFormCanSave) {
      return;
    }

    const nextCollaborator: Collaborator = {
      id: collaboratorFormDraft.id ?? createId("collaborator"),
      name: collaboratorFormDraft.name.trim(),
      role: collaboratorFormDraft.role.trim(),
      area: collaboratorFormDraft.area.trim(),
      access: collaboratorFormDraft.access,
      status: collaboratorFormDraft.status,
      specialty: collaboratorFormDraft.specialty.trim(),
      teamIds: collaboratorFormDraft.teamIds,
    };

    setCollaborators((current) =>
      collaboratorFormDraft.id
        ? current.map((collaborator) =>
            collaborator.id === collaboratorFormDraft.id ? nextCollaborator : collaborator,
          )
        : [...current, nextCollaborator],
    );
    closeCollaboratorFormDrawer();
  }

  function openDeleteCollaboratorConfirm(collaborator: Collaborator) {
    setDeleteTargetCollaborator(collaborator);
  }

  function closeDeleteCollaboratorConfirm() {
    setDeleteTargetCollaborator(null);
  }

  function handleDeleteCollaborator() {
    if (!deleteTargetCollaborator) {
      return;
    }

    setCollaborators((current) =>
      current.filter((collaborator) => collaborator.id !== deleteTargetCollaborator.id),
    );
    closeDeleteCollaboratorConfirm();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administrativo"
        title="Colaboradores"
        description="Colaboradores internos com vínculo em múltiplas equipes, acesso administrativo e ações rápidas de cadastro, edição e remoção."
        breadcrumbs={[{ href: "/administrativo", label: "Administrativo" }, { label: "Colaboradores" }]}
        actions={
          <button
            type="button"
            onClick={openCreateCollaboratorDrawer}
            className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Novo colaborador
          </button>
        }
      />

      <StatGrid
        items={[
          { label: "Colaboradores", value: String(collaboratorStats.total), detail: "cadastros ativos no setor" },
          { label: "Ativos", value: String(collaboratorStats.active), detail: "operações em andamento" },
          { label: "Lideranças", value: String(collaboratorStats.leadership), detail: "admin e gestor habilitados" },
          { label: "Multi-equipe", value: String(collaboratorStats.multiTeam), detail: "alocados em duas ou mais equipes" },
        ]}
      />

      <SectionCard
        title="Filtros"
        description="Busque por colaborador, função, área ou refine rapidamente pela equipe vinculada."
      >
        <div className="space-y-4">
          <label className="block">
            <span className="sr-only">Buscar colaborador, função, área ou equipe</span>
            <div className="flex items-center gap-3 rounded-[1.6rem] border border-border bg-surface-2 px-4 py-3">
              <span aria-hidden="true" className="text-sm text-muted-foreground">
                Buscar
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar colaborador, função, área ou equipe"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </label>

          <div className="flex flex-wrap gap-2" aria-label="Filtros rápidos">
            <button
              type="button"
              onClick={() => setTeamFilter("Todos")}
              className={[
                "rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                teamFilter === "Todos"
                  ? "border-accent/35 bg-accent/10 text-foreground"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              Todas as equipes
            </button>
            {teamSeed.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => setTeamFilter(team.id)}
                className={[
                  "rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                  teamFilter === team.id
                    ? "border-accent/35 bg-accent/10 text-foreground"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {team.name}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Colaboradores alocados"
        description="Cada card mostra o acesso atual, a área principal e as equipes vinculadas ao colaborador."
      >
        {filteredCollaborators.length ? (
          <div className="space-y-4">
            {filteredCollaborators.map((collaborator) => (
              (() => {
                const assignedCards = collaboratorLoadById[collaborator.id] ?? 0;
                const loadPercentage = maxCardsPerCollaborator
                  ? Math.round((assignedCards / maxCardsPerCollaborator) * 100)
                  : 0;
                const loadSummary = getLoadSummary(assignedCards, averageCardsPerCollaborator);

                return (
                  <article
                    key={collaborator.id}
                    className="rounded-[1.6rem] border border-border bg-surface-2 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-lg font-semibold tracking-tight text-foreground">{collaborator.name}</p>
                            <p className="mt-1 text-base text-muted-foreground">{collaborator.role}</p>
                          </div>
                          <Pill tone={accessTone[collaborator.access]}>
                            {accessRoles.find((role) => role.key === collaborator.access)?.label ?? collaborator.access}
                          </Pill>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Pill>{collaborator.area}</Pill>
                          <Pill tone={statusTone[collaborator.status]}>{collaborator.status}</Pill>
                          <Pill>{collaborator.specialty}</Pill>
                          {collaborator.teamIds.map((teamId) => (
                            <Pill key={teamId} tone="accent">
                              {teamNameById[teamId] ?? "Equipe"}
                            </Pill>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start lg:pl-4">
                        <button
                          type="button"
                          aria-label={`Editar colaborador ${collaborator.name}`}
                          onClick={() => openEditCollaboratorDrawer(collaborator)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-surface"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label={`Remover colaborador ${collaborator.name}`}
                          onClick={() => openDeleteCollaboratorConfirm(collaborator)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFA500]/30 bg-[#FFA500]/10 text-foreground transition hover:bg-[#FFA500]/15"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-5">
                      <ProgressBar value={loadPercentage} label="Carga operacional" />
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                        <span>{assignedCards} card(s) atribuídos</span>
                        <span>•</span>
                        <span>Média atual {averageCardsPerCollaborator.toFixed(1)}</span>
                        <span>•</span>
                        <span>{loadSummary}</span>
                      </div>
                    </div>
                  </article>
                );
              })()
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum colaborador encontrado"
            description="Ajuste a busca ou o filtro de equipe para localizar outro cadastro."
            action={
              <button
                type="button"
                onClick={openCreateCollaboratorDrawer}
                className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Novo colaborador
              </button>
            }
          />
        )}
      </SectionCard>

      {collaboratorFormDraft ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeCollaboratorFormDrawer}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="collaborator-form-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[46rem] max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[2rem] border border-accent/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6 lg:max-w-[72rem] lg:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  {collaboratorFormDraft.id ? "Rascunho ilustrativo" : "Novo colaborador"}
                </p>
                <div className="flex items-center gap-3">
                  {!collaboratorFormDraft.id ? (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-foreground">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  ) : null}
                  <div>
                    <h2
                      id="collaborator-form-dialog-title"
                      className="text-xl font-semibold tracking-tight text-foreground"
                    >
                      {collaboratorFormDraft.id ? "Editar colaborador" : "Novo colaborador"}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {collaboratorFormDraft.role || "Cadastro interno com alocação em múltiplas equipes."}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCollaboratorFormDrawer}
                aria-label={collaboratorFormDraft.id ? "Fechar edição de colaborador" : "Fechar criação de colaborador"}
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Nome do colaborador
                    </span>
                    <input
                      value={collaboratorFormDraft.name}
                      onChange={(event) =>
                        setCollaboratorFormDraft((current) =>
                          current ? { ...current, name: event.target.value } : current,
                        )
                      }
                      placeholder="Ana Martins"
                      autoComplete="off"
                      spellCheck={false}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Função atual
                    </span>
                    <input
                      value={collaboratorFormDraft.role}
                      onChange={(event) =>
                        setCollaboratorFormDraft((current) =>
                          current ? { ...current, role: event.target.value } : current,
                        )
                      }
                      placeholder="Coordenação operacional"
                      autoComplete="off"
                      spellCheck={false}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Área
                    </span>
                    <input
                      value={collaboratorFormDraft.area}
                      onChange={(event) =>
                        setCollaboratorFormDraft((current) =>
                          current ? { ...current, area: event.target.value } : current,
                        )
                      }
                      placeholder="Administrativo"
                      autoComplete="off"
                      spellCheck={false}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Especialidade
                    </span>
                    <input
                      value={collaboratorFormDraft.specialty}
                      onChange={(event) =>
                        setCollaboratorFormDraft((current) =>
                          current ? { ...current, specialty: event.target.value } : current,
                        )
                      }
                      placeholder="Projetos e relacionamento"
                      autoComplete="off"
                      spellCheck={false}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Carga operacional
                    </span>
                    <div className="mt-2 rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">
                        {collaboratorFormDraft.id
                          ? `${collaboratorLoadById[collaboratorFormDraft.id] ?? 0} card(s) atribuídos`
                          : "0 card(s) atribuídos"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Valor automático com base nos cards do Kanban e na média atual de{" "}
                        {averageCardsPerCollaborator.toFixed(1)} card(s) por colaborador.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Configuração de acesso
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Defina o nível administrativo e o status operacional do colaborador.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Nível de acesso
                        </span>
                        <select
                          value={collaboratorFormDraft.access}
                          onChange={(event) =>
                            setCollaboratorFormDraft((current) =>
                              current ? { ...current, access: event.target.value as Employee["access"] } : current,
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                        >
                          {accessRoles.map((role) => (
                            <option key={role.key} value={role.key}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Status
                        </span>
                        <select
                          value={collaboratorFormDraft.status}
                          onChange={(event) =>
                            setCollaboratorFormDraft((current) =>
                              current ? { ...current, status: event.target.value as Employee["status"] } : current,
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Férias">Férias</option>
                          <option value="Pausado">Pausado</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Equipes vinculadas
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Marque uma ou mais equipes para distribuir o colaborador no administrativo.
                        </p>
                      </div>
                      <Pill tone="accent">{collaboratorFormDraft.teamIds.length} equipes</Pill>
                    </div>

                    <div className="mt-4 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
                      {teamSeed.map((team) => {
                        const checked = collaboratorFormDraft.teamIds.includes(team.id);
                        const sectionSummary = team.accessSections.join(", ");

                        return (
                          <label
                            key={team.id}
                            className={[
                              "block rounded-[1.3rem] border px-4 py-3 text-sm text-foreground transition",
                              checked
                                ? "border-accent/35 bg-panel-surface"
                                : "border-panel-border bg-panel-surface hover:border-accent/30",
                            ].join(" ")}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex min-w-0 items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleDraftTeam(team.id)}
                                  className="mt-1 h-4 w-4 shrink-0 rounded border border-panel-border accent-[hsl(var(--accent))]"
                                />
                                <span className="min-w-0 space-y-1">
                                  <span className="block text-base font-semibold">{team.name}</span>
                                  <span className="block text-xs leading-5 text-muted-foreground">
                                    {team.currentFunction}
                                  </span>
                                </span>
                              </div>

                              <span className="flex min-w-0 flex-col gap-1 rounded-[1.15rem] border border-panel-border bg-panel-surface-muted px-4 py-3 lg:min-w-[16rem]">
                                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                  Seções liberadas
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                  {sectionSummary}
                                </span>
                                <span className="text-xs leading-5 text-muted-foreground">
                                  {team.area}
                                </span>
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeCollaboratorFormDrawer}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveCollaboratorFormDraft}
                disabled={!collaboratorFormCanSave}
                className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Salvar colaborador
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <Dialog
        open={Boolean(deleteTargetCollaborator)}
        title="Tem certeza que deseja remover?"
        subtitle={deleteTargetCollaborator ? deleteTargetCollaborator.name : undefined}
        onClose={closeDeleteCollaboratorConfirm}
      >
        {deleteTargetCollaborator ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              O colaborador será removido desta página e deixará de aparecer na lista.
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={closeDeleteCollaboratorConfirm}
                className="rounded-2xl border border-[#FFA500]/30 bg-[#FFA500]/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-[#FFA500]/15"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteCollaborator}
                className="rounded-2xl border border-accent/25 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Remover
              </button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

export function AdministrativoClientesPage() {
  const [selected, setSelected] = useState<Client | null>(clients[0]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administrativo" title="Clientes" description="Cadastros, projetos ativos, segmento e último contato." breadcrumbs={[{ href: "/administrativo", label: "Administrativo" }, { label: "Clientes" }]} />
      <SectionCard title="Base de clientes" description="Visão consolidada do ecossistema">
        <div className="grid gap-3 xl:grid-cols-2">
          {clients.map((client) => (
            <button key={client.id} type="button" onClick={() => setSelected(client)} className="rounded-[1.4rem] border border-border bg-surface-2 p-4 text-left transition hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{client.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{client.project}</p>
                </div>
                <Pill tone={statusTone[client.status]}>{client.status}</Pill>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill>{client.segment}</Pill>
                <Pill>{client.ticket}</Pill>
                <Pill>{client.owner}</Pill>
                <Pill>{client.lastContact}</Pill>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <Drawer open={Boolean(selected)} title={selected?.name ?? ""} subtitle={selected ? selected.project : undefined} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Pill tone={statusTone[selected.status]}>{selected.status}</Pill>
              <Pill>{selected.segment}</Pill>
              <Pill>{selected.ticket}</Pill>
            </div>
            <SectionCard title="Resumo" description="Relações com o restante do sistema">
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>Projeto ativo: {selected.project}</p>
                <p>Responsável: {selected.owner}</p>
                <p>Último contato: {selected.lastContact}</p>
              </div>
            </SectionCard>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export function AdministrativoContratosPage() {
  const vencendo = contracts.filter((contract) => contract.status === "vencendo");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administrativo" title="Contratos" description="Contratos, propostas e aditivos com status e recorrência." breadcrumbs={[{ href: "/administrativo", label: "Administrativo" }, { label: "Contratos" }]} />
      <StatGrid
        items={[
          { label: "Assinados", value: "1", detail: "documentação em vigor" },
          { label: "Enviados", value: "1", detail: "aguardando retorno" },
          { label: "Vencendo", value: String(vencendo.length), detail: "alerta de renovação" },
          { label: "Rascunhos", value: String(contracts.filter((contract) => contract.status === "rascunho").length), detail: "em preparação" },
        ]}
      />
      <SectionCard title="Lista de contratos" description="Foco em vencimentos e vínculo com cliente">
        <div className="grid gap-3 xl:grid-cols-2">
          {contracts.map((contract) => (
            <article key={contract.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{contract.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{contract.client}</p>
                </div>
                <Pill tone={statusTone[contract.status]}>{contract.status}</Pill>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill>{contract.type}</Pill>
                <Pill>{contract.value}</Pill>
                <Pill>{contract.renewal}</Pill>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Alertas" description="Contratos com janela curta">
        {vencendo.length ? (
          <div className="flex flex-wrap gap-2">
            {vencendo.map((contract) => <Pill tone="warning" key={contract.id}>{contract.name}</Pill>)}
          </div>
        ) : (
          <EmptyState title="Sem alertas" description="Nenhum contrato próximo do vencimento neste conjunto mockado." />
        )}
      </SectionCard>
    </div>
  );
}

export function AdministrativoProcessosPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administrativo" title="Processos" description="Fluxo interno de solicitações e aprovações." breadcrumbs={[{ href: "/administrativo", label: "Administrativo" }, { label: "Processos" }]} />
      <DataTable
        items={processes}
        getKey={(process) => process.id}
        columns={[
          { header: "Processo", className: "min-w-[20rem]", cell: (process: Process) => <div><p className="font-semibold text-foreground">{process.title}</p><p className="mt-1 text-sm text-muted-foreground">Responsável: {process.owner}</p></div> },
          { header: "Prioridade", cell: (process: Process) => <Pill tone={priorityTone[process.priority]}>{process.priority}</Pill> },
          { header: "Status", cell: (process: Process) => <Pill tone={statusTone[process.status]}>{process.status}</Pill> },
          { header: "Prazo", cell: (process: Process) => <span className="font-semibold text-foreground">{process.deadline}</span> },
        ]}
      />
    </div>
  );
}

export function AdministrativoDocumentosPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administrativo" title="Documentos" description="Contratos, propostas, comprovantes, termos e políticas." breadcrumbs={[{ href: "/administrativo", label: "Administrativo" }, { label: "Documentos" }]} />
      <div className="grid gap-3 xl:grid-cols-2">
        {documents.map((document) => (
          <article key={document.id} className="rounded-[1.6rem] border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{document.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{document.relatedTo}</p>
              </div>
              <Pill>{document.type}</Pill>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>{document.owner}</Pill>
              <Pill>{document.date}</Pill>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdministrativoPermissoesPage() {
  const [roles, setRoles] = useState<PermissionRoleProfile[]>(() =>
    permissionRoleSeed.map((role) => ({ ...role, subsectionIds: [...role.subsectionIds] })),
  );
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<PermissionSectionGroup | "Todas" | "Gestor total">("Todas");
  const [roleFormDraft, setRoleFormDraft] = useState<PermissionRoleFormDraft | null>(null);
  const [deleteTargetRole, setDeleteTargetRole] = useState<PermissionRoleProfile | null>(null);

  const groupedPermissionSubsections = useMemo(
    () =>
      permissionSectionGroups.map((group) => ({
        group,
        items: permissionSubsections.filter((subsection) => subsection.group === group),
      })),
    [],
  );

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) => {
        const roleSubsections = role.subsectionIds
          .map((subsectionId) => permissionSubsectionById[subsectionId])
          .filter(Boolean);
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch = `${role.name} ${role.description} ${roleSubsections
          .map((subsection) => `${subsection.group} ${subsection.label}`)
          .join(" ")}`
          .toLowerCase()
          .includes(normalizedSearch);

        const matchesSection =
          sectionFilter === "Todas"
            ? true
            : sectionFilter === "Gestor total"
              ? role.isManager
              : role.isManager || roleSubsections.some((subsection) => subsection.group === sectionFilter);

        return matchesSearch && matchesSection;
      }),
    [roles, search, sectionFilter],
  );

  const roleStats = useMemo(
    () => ({
      total: roles.length,
      manager: roles.filter((role) => role.isManager).length,
      manual: roles.filter((role) => !role.isManager).length,
      subsections: permissionSubsections.length,
    }),
    [roles],
  );

  const roleFormCanSave = Boolean(
    roleFormDraft &&
      roleFormDraft.name.trim() &&
      roleFormDraft.description.trim() &&
      (roleFormDraft.isManager || roleFormDraft.subsectionIds.length),
  );

  function openCreateRoleDrawer() {
    setRoleFormDraft(createPermissionRoleFormDraft());
  }

  function openEditRoleDrawer(role: PermissionRoleProfile) {
    setRoleFormDraft(createPermissionRoleFormDraft(role));
  }

  function closeRoleFormDrawer() {
    setRoleFormDraft(null);
  }

  function toggleRoleSubsection(subsectionId: string) {
    setRoleFormDraft((current) => {
      if (!current || current.isManager) {
        return current;
      }

      return {
        ...current,
        subsectionIds: current.subsectionIds.includes(subsectionId)
          ? current.subsectionIds.filter((currentId) => currentId !== subsectionId)
          : [...current.subsectionIds, subsectionId],
      };
    });
  }

  function toggleManagerRole() {
    setRoleFormDraft((current) => {
      if (!current) {
        return current;
      }

      const nextIsManager = !current.isManager;

      return {
        ...current,
        isManager: nextIsManager,
        subsectionIds: nextIsManager ? [...permissionSubsectionIds] : current.subsectionIds,
      };
    });
  }

  function saveRoleFormDraft() {
    if (!roleFormDraft || !roleFormCanSave) {
      return;
    }

    const nextRole: PermissionRoleProfile = {
      id: roleFormDraft.id ?? createId("permission-role"),
      name: roleFormDraft.name.trim(),
      description: roleFormDraft.description.trim(),
      isManager: roleFormDraft.isManager,
      subsectionIds: roleFormDraft.isManager ? [...permissionSubsectionIds] : [...roleFormDraft.subsectionIds],
    };

    setRoles((current) =>
      roleFormDraft.id
        ? current.map((role) => (role.id === roleFormDraft.id ? nextRole : role))
        : [...current, nextRole],
    );
    closeRoleFormDrawer();
  }

  function openDeleteRoleConfirm(role: PermissionRoleProfile) {
    setDeleteTargetRole(role);
  }

  function closeDeleteRoleConfirm() {
    setDeleteTargetRole(null);
  }

  function handleDeleteRole() {
    if (!deleteTargetRole) {
      return;
    }

    setRoles((current) => current.filter((role) => role.id !== deleteTargetRole.id));
    closeDeleteRoleConfirm();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administrativo"
        title="Cargos"
        description="Cargos de acesso por subseção, com gestão total para gestores e liberação manual para perfis mais controlados."
        breadcrumbs={[{ href: "/administrativo", label: "Administrativo" }, { label: "Cargos" }]}
        actions={
          <button
            type="button"
            onClick={openCreateRoleDrawer}
            className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Novo cargo
          </button>
        }
      />

      <StatGrid
        items={[
          { label: "Cargos", value: String(roleStats.total), detail: "perfis disponíveis no projeto" },
          { label: "Gestor total", value: String(roleStats.manager), detail: "acesso completo automático" },
          { label: "Acesso manual", value: String(roleStats.manual), detail: "liberação configurada por subseção" },
          { label: "Subseções", value: String(roleStats.subsections), detail: "pontos disponíveis para controle" },
        ]}
      />

      <SectionCard
        title="Filtros"
        description="Busque por cargo, descrição, seção ou refine rapidamente pelo núcleo de acesso liberado."
      >
        <div className="space-y-4">
          <label className="block">
            <span className="sr-only">Buscar cargo, descrição, seção ou subseção</span>
            <div className="flex items-center gap-3 rounded-[1.6rem] border border-border bg-surface-2 px-4 py-3">
              <span aria-hidden="true" className="text-sm text-muted-foreground">
                Buscar
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar cargo, descrição, seção ou subseção"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </label>

          <div className="flex flex-wrap gap-2" aria-label="Filtros rápidos">
            <button
              type="button"
              onClick={() => setSectionFilter("Todas")}
              className={[
                "rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                sectionFilter === "Todas"
                  ? "border-accent/35 bg-accent/10 text-foreground"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              Todos os cargos
            </button>
            <button
              type="button"
              onClick={() => setSectionFilter("Gestor total")}
              className={[
                "rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                sectionFilter === "Gestor total"
                  ? "border-accent/35 bg-accent/10 text-foreground"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              Gestor total
            </button>
            {permissionSectionGroups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setSectionFilter(group)}
                className={[
                  "rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                  sectionFilter === group
                    ? "border-accent/35 bg-accent/10 text-foreground"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Cargos cadastrados"
        description="Cada cargo concentra as subseções liberadas, o modo de acesso e o alcance operacional previsto."
      >
        {filteredRoles.length ? (
          <div className="space-y-4">
            {filteredRoles.map((role) => {
              const roleSubsections = role.subsectionIds
                .map((subsectionId) => permissionSubsectionById[subsectionId])
                .filter(Boolean);
              const roleGroups = Array.from(new Set(roleSubsections.map((subsection) => subsection.group)));
              const rolePreview = role.isManager ? permissionSectionGroups : roleGroups.slice(0, 4);

              return (
                <article
                  key={role.id}
                  className="rounded-[1.6rem] border border-border bg-surface-2 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-lg font-semibold tracking-tight text-foreground">{role.name}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{role.description}</p>
                        </div>
                        <Pill tone={role.isManager ? "accent" : "default"}>
                          {role.isManager ? "Gestor total" : "Acesso manual"}
                        </Pill>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {rolePreview.map((group) => (
                          <Pill key={`${role.id}-${group}`} tone="accent">
                            {group}
                          </Pill>
                        ))}
                        {roleGroups.length > rolePreview.length ? (
                          <Pill>+{roleGroups.length - rolePreview.length} seções</Pill>
                        ) : null}
                        <Pill>{role.subsectionIds.length} subseções</Pill>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:pl-4">
                      <button
                        type="button"
                        aria-label={`Editar cargo ${role.name}`}
                        onClick={() => openEditRoleDrawer(role)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-surface"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remover cargo ${role.name}`}
                        onClick={() => openDeleteRoleConfirm(role)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#FFA500]/30 bg-[#FFA500]/10 text-foreground transition hover:bg-[#FFA500]/15"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.3rem] border border-border bg-surface px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Leitura do cargo
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {role.isManager
                          ? "Esse perfil ignora seleção manual e acessa automaticamente todas as subseções do projeto."
                          : "Esse perfil depende das subseções marcadas manualmente para controlar o alcance com mais precisão."}
                      </p>
                    </div>

                    <div className="rounded-[1.3rem] border border-border bg-surface px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Prévia liberada
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {roleSubsections.slice(0, 2).map((subsection) => subsection.label).join(" • ") || "Sem subseções"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {roleSubsections.length > 2
                          ? `+${roleSubsections.length - 2} subseções adicionais vinculadas.`
                          : "Sem itens adicionais além da prévia mostrada."}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nenhum cargo encontrado"
            description="Ajuste a busca ou o filtro para localizar outro perfil de acesso."
            action={
              <button
                type="button"
                onClick={openCreateRoleDrawer}
                className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Novo cargo
              </button>
            }
          />
        )}
      </SectionCard>

      {roleFormDraft ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeRoleFormDrawer}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-role-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[46rem] max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[2rem] border border-accent/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6 lg:max-w-[72rem] lg:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  {roleFormDraft.id ? "Rascunho ilustrativo" : "Novo cargo"}
                </p>
                <div className="flex items-center gap-3">
                  {!roleFormDraft.id ? (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-foreground">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    </span>
                  ) : null}
                  <div>
                    <h2 id="permission-role-dialog-title" className="text-xl font-semibold tracking-tight text-foreground">
                      {roleFormDraft.id ? "Editar cargo" : "Novo cargo"}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {roleFormDraft.description || "Defina o alcance de cada perfil pelas subseções do projeto."}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeRoleFormDrawer}
                aria-label={roleFormDraft.id ? "Fechar edição de cargo" : "Fechar criação de cargo"}
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Nome do cargo
                    </span>
                    <input
                      value={roleFormDraft.name}
                      onChange={(event) =>
                        setRoleFormDraft((current) =>
                          current ? { ...current, name: event.target.value } : current,
                        )
                      }
                      placeholder="Coordenador interno"
                      autoComplete="off"
                      spellCheck={false}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Descrição
                    </span>
                    <textarea
                      value={roleFormDraft.description}
                      onChange={(event) =>
                        setRoleFormDraft((current) =>
                          current ? { ...current, description: event.target.value } : current,
                        )
                      }
                      placeholder="Explique como esse cargo deve ser usado dentro do projeto."
                      rows={6}
                      className="mt-2 w-full resize-none rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <div className="rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Regra de alcance
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Perfis marcados como gestor recebem todas as subseções automaticamente.
                        </p>
                      </div>
                      <Pill tone={roleFormDraft.isManager ? "accent" : "default"}>
                        {roleFormDraft.isManager ? "Gestor total" : "Acesso manual"}
                      </Pill>
                    </div>

                    <label className="mt-4 flex items-start gap-3 rounded-[1.3rem] border border-panel-border bg-panel-surface px-4 py-3">
                      <input
                        type="checkbox"
                        checked={roleFormDraft.isManager}
                        onChange={toggleManagerRole}
                        className="mt-1 h-4 w-4 rounded border border-panel-border accent-[hsl(var(--accent))]"
                      />
                      <span className="space-y-1">
                        <span className="block text-sm font-semibold text-foreground">Gestor</span>
                        <span className="block text-xs leading-5 text-muted-foreground">
                          Libera automaticamente todas as subseções do projeto, sem depender da seleção manual abaixo.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Subseções liberadas
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Marque manualmente quais subseções esse cargo pode acessar no projeto.
                        </p>
                      </div>
                      <Pill tone="accent">
                        {roleFormDraft.isManager ? permissionSubsections.length : roleFormDraft.subsectionIds.length} subseções
                      </Pill>
                    </div>

                    <div
                      className={[
                        "mt-4 max-h-[28rem] space-y-4 overflow-y-auto pr-1",
                        roleFormDraft.isManager ? "pointer-events-none opacity-60" : "",
                      ].join(" ")}
                    >
                      {groupedPermissionSubsections.map((group) => (
                        <div key={group.group} className="space-y-3 rounded-[1.3rem] border border-panel-border bg-panel-surface px-4 py-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{group.group}</p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {group.items.length} subseção(ões) disponíveis neste núcleo.
                              </p>
                            </div>
                            <Pill>
                              {
                                group.items.filter((item) => roleFormDraft.subsectionIds.includes(item.id)).length
                              }/{group.items.length}
                            </Pill>
                          </div>

                          <div className="space-y-3">
                            {group.items.map((subsection) => {
                              const checked = roleFormDraft.subsectionIds.includes(subsection.id);

                              return (
                                <label
                                  key={subsection.id}
                                  className={[
                                    "flex items-start gap-3 rounded-[1.2rem] border px-4 py-3 text-sm transition",
                                    checked
                                      ? "border-accent/35 bg-panel-surface"
                                      : "border-panel-border bg-panel-surface-muted hover:border-accent/30",
                                  ].join(" ")}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleRoleSubsection(subsection.id)}
                                    className="mt-1 h-4 w-4 shrink-0 rounded border border-panel-border accent-[hsl(var(--accent))]"
                                  />
                                  <span className="space-y-1">
                                    <span className="block font-semibold text-foreground">{subsection.label}</span>
                                    <span className="block text-xs leading-5 text-muted-foreground">
                                      {subsection.description}
                                    </span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeRoleFormDrawer}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveRoleFormDraft}
                disabled={!roleFormCanSave}
                className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Salvar cargo
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <Dialog
        open={Boolean(deleteTargetRole)}
        title="Tem certeza que deseja remover?"
        subtitle={deleteTargetRole ? deleteTargetRole.name : undefined}
        onClose={closeDeleteRoleConfirm}
      >
        {deleteTargetRole ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              O cargo será removido desta página e deixará de aparecer na lista de perfis de acesso.
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={closeDeleteRoleConfirm}
                className="rounded-2xl border border-[#FFA500]/30 bg-[#FFA500]/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-[#FFA500]/15"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
                className="rounded-2xl border border-accent/25 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Remover
              </button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
