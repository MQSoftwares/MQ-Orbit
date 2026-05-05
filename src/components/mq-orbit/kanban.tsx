"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type DragEvent } from "react";
import {
  AvatarStack,
  DataTable,
  Drawer,
  EmptyState,
  FilterBar,
  MiniChart,
  PageHeader,
  Pill,
  ProgressBar,
  SectionCard,
  StatGrid,
  Timeline,
} from "@/components/mq-orbit/ui";

type TaskPriority = "Baixa" | "Média" | "Alta" | "Crítica";
type TaskImportance = "Baixa" | "Média" | "Alta";
type TaskCardType = "Financeiro" | "Administrativo" | "Dev" | "Design" | "Marketing";
type TaskStatus = string;

type Task = {
  id: string;
  title: string;
  subtitle?: string;
  team: string;
  cardType: TaskCardType;
  importance: TaskImportance;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  statusLabel?: string;
  assignee: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  client: string;
  project: string;
  module: string;
  tags: string[];
  progress: number;
  board: string;
  checklists?: TaskChecklist[];
};

type TaskChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

type TaskChecklist = {
  id: string;
  title: string;
  items: TaskChecklistItem[];
};

type Board = {
  id: string;
  name: string;
  client: string;
  focus: string;
  columns: BoardColumnDraft[];
  activeTasks: number;
  dueSoon: number;
  blocked: number;
};

type BoardColumnDraft = {
  id: string;
  label: string;
  isFixed: boolean;
};

type BoardAccessRole = "Editor" | "Visualizador";

type BoardViewerDraft = {
  name: string;
  active: boolean;
  role: BoardAccessRole;
};

type BoardDraft = {
  title: string;
  subtitle: string;
  description: string;
  viewers: BoardViewerDraft[];
  columns: BoardColumnDraft[];
};

type TaskFormDraft = {
  id: string | null;
  title: string;
  subtitle?: string;
  team: string;
  cardType: TaskCardType;
  importance: TaskImportance;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  statusLabel?: string;
  assignee: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  client: string;
  project: string;
  module: string;
  tags: string[];
  progress: number;
  board: string;
  checklists: TaskChecklist[];
};

type TaskFormValidation = {
  isEndBeforeStart: boolean;
  isLongDuration: boolean;
  missingRequiredFields: boolean;
  hasChecklistError: boolean;
};

type SprintStatus = "Backlog" | "Em andamento" | "Concluído";

type SprintMeetingType = "Sprint Planning" | "Daily Scrum" | "Sprint Review" | "Sprint Retrospective";

type SprintMeetingAudience = "Responsáveis" | "Equipes";

type Sprint = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  goal: string;
  progress: number;
  burndown: number[];
  goals: string[];
  meetings: SprintMeeting[];
};

type SprintMeeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: SprintMeetingType;
  audience: SprintMeetingAudience;
  responsibles: string[];
  teams: string[];
  calendarEventId: string;
  googleMeetUrl: string;
};

type SprintFormDraft = {
  id: string | null;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  goals: string;
};

type SprintMeetingFormDraft = {
  id: string | null;
  title: string;
  date: string;
  time: string;
  type: SprintMeetingType | "";
  audience: SprintMeetingAudience;
  responsibles: string;
  teams: string;
};

type Tag = {
  name: string;
  color: string;
  usage: number;
  context: string;
};

const defaultBoardColumns: BoardColumnDraft[] = [
  { id: "Backlog", label: "Backlog", isFixed: true },
  { id: "Aprovado", label: "Aprovados", isFixed: true },
  { id: "Em andamento", label: "Em andamento", isFixed: false },
  { id: "Revisão", label: "Revisão (Testes)", isFixed: false },
  { id: "Concluído", label: "Concluído", isFixed: true },
];

function cloneBoardColumns(columns: BoardColumnDraft[] = defaultBoardColumns) {
  return columns.map((column) => ({
    id: column.id,
    label: column.label,
    isFixed: column.isFixed,
  }));
}

function createBoardColumnDraft(label = ""): BoardColumnDraft {
  return {
    id: createId("board-column"),
    label,
    isFixed: false,
  };
}

const boards: Board[] = [
  {
    id: "operacao",
    name: "Operação MQ",
    client: "MQSoftwares",
    focus: "Entregas internas, ajustes de produto e manutenção do hub",
    columns: cloneBoardColumns(),
    activeTasks: 12,
    dueSoon: 4,
    blocked: 1,
  },
  {
    id: "clientes",
    name: "Projetos de Cliente",
    client: "PicBrand / Casa Zeeni",
    focus: "Campanhas, LPs e materiais em andamento com aprovação externa",
    columns: cloneBoardColumns(),
    activeTasks: 18,
    dueSoon: 6,
    blocked: 2,
  },
  {
    id: "criativo",
    name: "Design e Marketing",
    client: "MQ Orbit",
    focus: "Assets, campanhas institucionais e peças de mídia",
    columns: cloneBoardColumns(),
    activeTasks: 9,
    dueSoon: 3,
    blocked: 0,
  },
];

const boardViewerOptions = [
  "Matheus",
  "Larissa",
  "Bruna",
  "Camila",
  "Paulo",
  "Bia",
];

const taskTeamOptions = [
  "Equipe Operação",
  "Equipe Clientes",
  "Equipe Criativo",
  "Equipe Administrativa",
  "Equipe Financeira",
  "Equipe Comercial",
];

function createBoardDraft(board?: Board): BoardDraft {
  return {
    title: board?.name ?? "",
    subtitle: board?.client ?? "",
    description: board?.focus ?? "",
    columns: cloneBoardColumns(board?.columns ?? defaultBoardColumns),
    viewers: boardViewerOptions.map((name, index) => ({
      name,
      active: index < 3,
      role: index === 0 ? "Editor" : "Visualizador",
    })),
  };
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createChecklistItemDraft(label = "", completed = false): TaskChecklistItem {
  return {
    id: createId("check-item"),
    label,
    completed,
  };
}

function createChecklistDraft(title = "", items: TaskChecklistItem[] = [createChecklistItemDraft()]): TaskChecklist {
  return {
    id: createId("checklist"),
    title,
    items,
  };
}

function cloneChecklistDrafts(checklists?: TaskChecklist[]) {
  return (checklists ?? []).map((checklist) => ({
    id: checklist.id,
    title: checklist.title,
    items: checklist.items.map((item) => ({
      id: item.id,
      label: item.label,
      completed: item.completed,
    })),
  }));
}

function computeChecklistProgress(checklists?: TaskChecklist[]) {
  const items = (checklists ?? []).flatMap((checklist) => checklist.items);

  if (!items.length) {
    return 0;
  }

  return Math.round((items.filter((item) => item.completed).length / items.length) * 100);
}

function parseTaskDate(value: string) {
  return value ? new Date(`${value}T12:00:00Z`) : null;
}

function isTaskLongDuration(startDate: string, endDate: string) {
  const start = parseTaskDate(startDate);
  const end = parseTaskDate(endDate);

  if (!start || !end || end < start) {
    return false;
  }

  const limit = new Date(start);
  limit.setMonth(limit.getMonth() + 1);

  return end > limit;
}

function hasRequiredTaskFields(draft: TaskFormDraft) {
  return Boolean(
    draft.title.trim() &&
      draft.team.trim() &&
      draft.description.trim() &&
      draft.startDate &&
      draft.endDate &&
      draft.cardType &&
      draft.importance,
  );
}

function isChecklistDraftValid(checklists: TaskChecklist[]) {
  return checklists.every((checklist) => {
    const hasTitle = Boolean(checklist.title.trim());
    const hasItems = checklist.items.some((item) => item.label.trim());
    const hasNoBlankItems = checklist.items.every((item) => item.label.trim());

    return hasTitle && hasItems && hasNoBlankItems;
  });
}

function createTaskFormDraft(board: Board | null, task?: Task): TaskFormDraft {
  if (task) {
    return {
      id: task.id,
      title: task.title,
      subtitle: task.subtitle,
      team: task.team,
      cardType: task.cardType,
      importance: task.importance,
      description: task.description,
      priority: task.priority,
      status: task.status,
      statusLabel: task.statusLabel,
      assignee: task.assignee,
      startDate: task.startDate,
      endDate: task.endDate,
      dueDate: task.dueDate,
      client: task.client,
      project: task.project,
      module: task.module,
      tags: [...task.tags],
      progress: task.progress,
      board: task.board,
      checklists: cloneChecklistDrafts(task.checklists),
    };
  }

  const boardId = board?.id ?? boards[0].id;
  const boardClient = board?.client ?? "MQSoftwares";
  const boardName = board?.name ?? "Novo quadro";

  return {
    id: null,
    title: "",
    subtitle: undefined,
    team: taskTeamOptions[0],
    cardType: "Dev",
    importance: "Média",
    description: "",
    priority: "Média",
    status: "Backlog",
    assignee: taskTeamOptions[0],
    startDate: "",
    endDate: "",
    dueDate: "",
    client: boardClient,
    project: boardName,
    module: "Kanban",
    tags: [],
    progress: 0,
    board: boardId,
    checklists: [],
  };
}

export const tasks: Task[] = [
  {
    id: "task-001",
    title: "Ajustar visão geral do hub MQ Orbit",
    subtitle: "Refino visual da navegação principal e da densidade informacional.",
    team: "Equipe Operação",
    cardType: "Dev",
    importance: "Alta",
    description: "Refinar cards, navegação e densidade de informações na página principal.",
    priority: "Alta",
    status: "Em andamento",
    assignee: "Matheus",
    startDate: "2026-04-20",
    endDate: "2026-04-24",
    dueDate: "2026-04-24",
    client: "MQSoftwares",
    project: "Projeto site institucional",
    module: "Kanban",
    tags: ["interno", "design"],
    progress: 62,
    board: "operacao",
  },
  {
    id: "task-002",
    title: "Validar landing page do cliente Alpha",
    subtitle: "Checagem final de copy, CTA, responsividade e aprovação.",
    team: "Equipe Clientes",
    cardType: "Marketing",
    importance: "Alta",
    description: "Checar copy, CTA, responsividade e fluxo de aprovação.",
    priority: "Crítica",
    status: "Revisão",
    assignee: "Larissa",
    startDate: "2026-04-20",
    endDate: "2026-04-23",
    dueDate: "2026-04-23",
    client: "Landing Page Cliente Alpha",
    project: "Captação Landing Pages",
    module: "Marketing",
    tags: ["cliente", "marketing"],
    progress: 84,
    board: "clientes",
  },
  {
    id: "task-003",
    title: "Organizar briefing do rebranding PicBrand",
    subtitle: "Consolidação de referências, escopo e dependências de assets.",
    team: "Equipe Criativo",
    cardType: "Design",
    importance: "Alta",
    description: "Consolidar referências, escopo e dependências de assets.",
    priority: "Alta",
    status: "Backlog",
    assignee: "Bruna",
    startDate: "2026-04-23",
    endDate: "2026-04-27",
    dueDate: "2026-04-27",
    client: "PicBrand",
    project: "Rebranding PicBrand",
    module: "Design",
    tags: ["cliente", "design"],
    progress: 18,
    board: "criativo",
  },
  {
    id: "task-004",
    title: "Revisar contrato Casa Zeeni",
    subtitle: "Ajustes de validade, aditivos e vínculo com recorrência.",
    team: "Equipe Administrativa",
    cardType: "Administrativo",
    importance: "Média",
    description: "Conferir validade, aditivos e vínculo com recebimento recorrente.",
    priority: "Média",
    status: "Aprovado",
    assignee: "Camila",
    startDate: "2026-04-25",
    endDate: "2026-04-29",
    dueDate: "2026-04-29",
    client: "Casa Zeeni",
    project: "Contrato Casa Zeeni",
    module: "Administrativo",
    tags: ["cliente", "documento"],
    progress: 100,
    board: "clientes",
  },
  {
    id: "task-005",
    title: "Fechar sprint de pagamentos recorrentes",
    subtitle: "Validação de DNS anual, Zoho Mail e VPS no fluxo de caixa.",
    team: "Equipe Financeira",
    cardType: "Financeiro",
    importance: "Alta",
    description: "Confirmar DNS anual, Zoho Mail e VPS Hostinger no fluxo de caixa.",
    priority: "Alta",
    status: "Concluído",
    assignee: "Paulo",
    startDate: "2026-04-18",
    endDate: "2026-04-22",
    dueDate: "2026-04-22",
    client: "MQSoftwares",
    project: "DNS anual MQ",
    module: "Finanças",
    tags: ["financeiro", "interno"],
    progress: 100,
    board: "operacao",
  },
  {
    id: "task-006",
    title: "Atualizar biblioteca de assets da campanha institucional",
    subtitle: "Organização de banners, mockups e variações de mídia.",
    team: "Equipe Criativo",
    cardType: "Marketing",
    importance: "Média",
    description: "Organizar banners, mockups e variações de mídia para o time.",
    priority: "Média",
    status: "Em andamento",
    assignee: "Bia",
    startDate: "2026-04-21",
    endDate: "2026-04-25",
    dueDate: "2026-04-25",
    client: "MQSoftwares",
    project: "Campanha Institucional MQ",
    module: "Marketing",
    tags: ["design", "marketing"],
    progress: 46,
    board: "criativo",
  },
  {
    id: "task-007",
    title: "Revisar checklist de aprovação de identidade",
    subtitle: "Fluxo de validação para evitar retrabalho em ajustes pequenos.",
    team: "Equipe Clientes",
    cardType: "Design",
    importance: "Baixa",
    description: "Garantir que ajustes pequenos sejam encaminhados sem retrabalho.",
    priority: "Baixa",
    status: "Backlog",
    assignee: "Marina",
    startDate: "2026-04-26",
    endDate: "2026-04-30",
    dueDate: "2026-04-30",
    client: "PicBrand",
    project: "Rebranding PicBrand",
    module: "Design",
    tags: ["bloqueado", "cliente"],
    progress: 12,
    board: "clientes",
  },
  {
    id: "task-008",
    title: "Preparar publicação do site tech",
    subtitle: "Ajustes finais de título, meta description e lançamento.",
    team: "Equipe Operação",
    cardType: "Marketing",
    importance: "Alta",
    description: "Ajustar título, meta description e itens finais do lançamento.",
    priority: "Alta",
    status: "Revisão",
    assignee: "Nina",
    startDate: "2026-04-20",
    endDate: "2026-04-23",
    dueDate: "2026-04-23",
    client: "Projeto site tech",
    project: "Projeto site tech",
    module: "Marketing",
    tags: ["interno", "marketing"],
    progress: 77,
    board: "operacao",
  },
  {
    id: "task-009",
    title: "Enviar proposta comercial LP Premium",
    subtitle: "Integração de valores, recorrência e próximos passos.",
    team: "Equipe Comercial",
    cardType: "Administrativo",
    importance: "Alta",
    description: "Integrar valores, recorrência e próximos passos do cliente.",
    priority: "Alta",
    status: "Em andamento",
    assignee: "Lucas",
    startDate: "2026-04-22",
    endDate: "2026-04-26",
    dueDate: "2026-04-26",
    client: "Proposta Comercial LP Premium",
    project: "Proposta Comercial LP Premium",
    module: "Administrativo",
    tags: ["cliente", "financeiro"],
    progress: 53,
    board: "clientes",
  },
];

const sprints: Sprint[] = [
  {
    id: "sprint-17",
    name: "Sprint 17",
    startDate: "2026-04-08",
    endDate: "2026-04-19",
    status: "Concluído",
    goal: "Consolidar a base operacional do hub com os primeiros fluxos críticos estabilizados.",
    progress: 100,
    burndown: [20, 19, 18, 16, 14, 11, 9, 7, 5, 3, 2, 0],
    goals: [
      "Estrutura do hub MQ Orbit validada em navegação principal",
      "Estados vazios e consistência visual estabilizados",
      "Base de organização para Kanban e Agenda consolidada",
      "Cobertura inicial de regressão adicionada ao fluxo",
    ],
    meetings: [
      {
        id: "meeting-17-planning",
        title: "Sprint Planning",
        date: "2026-04-08",
        time: "09:30",
        type: "Sprint Planning",
        audience: "Equipes",
        responsibles: ["Matheus Barcellos", "Larissa"],
        teams: ["Produto", "Design"],
        calendarEventId: "cal-17-planning",
        googleMeetUrl: "https://meet.google.com/mqorbit-sprint-17-planning",
      },
    ],
  },
  {
    id: "sprint-18",
    name: "Sprint 18",
    startDate: "2026-04-22",
    endDate: "2026-05-03",
    status: "Em andamento",
    goal: "Encaminhar o MVP navegável dos módulos principais com densidade operacional.",
    progress: 67,
    burndown: [18, 17, 15, 13, 12, 10, 8, 6, 4, 3, 2, 1],
    goals: [
      "Hub MQ Orbit navegável em todas as áreas principais",
      "Sidebar com dropdown funcional para os módulos restantes",
      "Datasets mockados com vínculos entre cliente, arquivo e campanha",
      "Testes smoke cobrindo páginas principais e interações essenciais",
    ],
    meetings: [
      {
        id: "meeting-18-planning",
        title: "Sprint Planning",
        date: "2026-04-22",
        time: "08:30",
        type: "Sprint Planning",
        audience: "Equipes",
        responsibles: ["Matheus Barcellos", "Camila"],
        teams: ["Produto", "Operação"],
        calendarEventId: "cal-18-planning",
        googleMeetUrl: "https://meet.google.com/mqorbit-sprint-18-planning",
      },
      {
        id: "meeting-18-daily",
        title: "Daily Scrum",
        date: "2026-04-28",
        time: "09:00",
        type: "Daily Scrum",
        audience: "Responsáveis",
        responsibles: ["Matheus Barcellos", "Bruna", "Paulo"],
        teams: [],
        calendarEventId: "cal-18-daily",
        googleMeetUrl: "https://meet.google.com/mqorbit-sprint-18-daily",
      },
    ],
  },
  {
    id: "sprint-19",
    name: "Sprint 19",
    startDate: "2026-05-06",
    endDate: "2026-05-17",
    status: "Em andamento",
    goal: "Refinar fluxos críticos, filtros e estados vazios dos módulos.",
    progress: 12,
    burndown: [20, 20, 19, 19, 18, 18, 16, 15, 14, 13, 12, 11],
    goals: [
      "Ajustar transições e clareza dos fluxos mais usados",
      "Reduzir ruído nos estados vazios e carregamentos",
      "Preparar a agenda para novos eventos vinculados ao Kanban",
      "Padronizar a leitura dos cards principais do hub",
    ],
    meetings: [
      {
        id: "meeting-19-planning",
        title: "Sprint Planning",
        date: "2026-05-06",
        time: "10:00",
        type: "Sprint Planning",
        audience: "Equipes",
        responsibles: ["Larissa", "Camila"],
        teams: ["Produto", "Design"],
        calendarEventId: "cal-19-planning",
        googleMeetUrl: "https://meet.google.com/mqorbit-sprint-19-planning",
      },
    ],
  },
  {
    id: "sprint-20",
    name: "Sprint 20",
    startDate: "2026-05-20",
    endDate: "2026-05-31",
    status: "Backlog",
    goal: "Planejar consolidação de rotinas, integrações e cobertura operacional.",
    progress: 0,
    burndown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    goals: [
      "Organizar dependências vindas da sprint atual",
      "Mapear vínculos com calendário e Google Meet",
      "Detalhar evolução dos cards e critérios de aceite",
    ],
    meetings: [],
  },
];

const tags: Tag[] = [
  { name: "urgente", color: "#FFA500", usage: 9, context: "cards em revisão crítica" },
  { name: "cliente", color: "#2C77D4", usage: 21, context: "tarefas ligadas a contratos e campanhas" },
  { name: "interno", color: "#7AD6D3", usage: 14, context: "ajustes do hub e operações da MQ" },
  { name: "design", color: "#279890", usage: 16, context: "assets, briefings e aprovações visuais" },
  { name: "financeiro", color: "#1D4E76", usage: 8, context: "contas, contratos e recorrências" },
  { name: "marketing", color: "#A4C6E1", usage: 13, context: "campanhas, calendários e leads" },
  { name: "bloqueado", color: "#0F3A53", usage: 4, context: "itens aguardando aprovação ou dependência" },
];

const recentActivity = [
  {
    time: "09:20",
    title: "Card movido para Revisão",
    description: "Landing page do cliente Alpha entrou em validação final.",
    tone: "accent" as const,
  },
  {
    time: "10:10",
    title: "Sprint atual atualizada",
    description: "Meta de publicação do hub MQ Orbit permanece em prioridade máxima.",
  },
  {
    time: "11:45",
    title: "Etiqueta aplicada",
    description: "Cards de financeiro receberam o marcador de recorrência.",
    tone: "warning" as const,
  },
];

const priorityTone: Record<TaskPriority, "default" | "accent" | "warning" | "danger" | "success"> = {
  Baixa: "default",
  Média: "accent",
  Alta: "warning",
  Crítica: "danger",
};

const statusTone: Record<TaskStatus, "default" | "accent" | "warning" | "danger" | "success"> = {
  Backlog: "default",
  "Em andamento": "accent",
  Revisão: "warning",
  Aprovado: "success",
  Concluído: "success",
};

const importanceStripeClass: Record<TaskImportance, string> = {
  Baixa: "bg-[#279890]",
  Média: "bg-[#FFA500]/80",
  Alta: "bg-[#FFA500]",
};

const importanceBadgeClass: Record<TaskImportance, string> = {
  Baixa: "border-[#279890]/25 bg-[#279890]/12 text-foreground",
  Média: "border-[#FFA500]/25 bg-[#FFA500]/12 text-foreground",
  Alta: "border-[#FFA500]/35 bg-[#FFA500]/18 text-foreground",
};

const defaultStatusLabels: Record<string, string> = {
  Backlog: "Backlog",
  Aprovado: "Aprovados",
  "Em andamento": "Em andamento",
  Revisão: "Revisão (Testes)",
  Concluído: "Concluído",
};

const sprintStatusOrder: SprintStatus[] = ["Backlog", "Em andamento", "Concluído"];

const sprintStatusTone: Record<SprintStatus, "default" | "accent" | "warning" | "success"> = {
  Backlog: "default",
  "Em andamento": "accent",
  Concluído: "success",
};

const sprintMeetingTypeTone: Record<SprintMeetingType, "default" | "accent" | "warning"> = {
  "Sprint Planning": "accent",
  "Daily Scrum": "default",
  "Sprint Review": "warning",
  "Sprint Retrospective": "warning",
};

function getStatusTone(status: string) {
  return statusTone[status] ?? "default";
}

function getTaskStatusLabel(task: Pick<Task, "status" | "statusLabel">) {
  return task.statusLabel ?? defaultStatusLabels[task.status] ?? task.status;
}

function sanitizeBoardColumns(columns: BoardColumnDraft[]) {
  return [
    ...columns
      .map((column) => ({
        id: column.id,
        label: column.label.trim(),
        isFixed: column.isFixed,
      }))
      .filter((column) => column.label.length > 0),
  ];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

function parseIsoDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function splitCommaSeparatedValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function createSprintBurndown(progress: number) {
  const start = Math.max(0, Math.round(progress + 24));

  return Array.from({ length: 12 }, (_, index) =>
    Math.max(0, start - index * Math.max(1, Math.round(start / 11))),
  );
}

function createSprintFormDraft(sprint?: Sprint | null): SprintFormDraft {
  return {
    id: sprint?.id ?? null,
    name: sprint?.name ?? "",
    startDate: sprint?.startDate ?? "",
    endDate: sprint?.endDate ?? "",
    goal: sprint?.goal ?? "",
    goals: sprint?.goals.join("\n") ?? "",
  };
}

function createSprintMeetingFormDraft(): SprintMeetingFormDraft {
  return {
    id: null,
    title: "",
    date: "",
    time: "",
    type: "",
    audience: "Responsáveis",
    responsibles: "",
    teams: "",
  };
}

function getDefaultSprintId(items: Sprint[]) {
  const activeSprints = items
    .filter((sprint) => sprint.status === "Em andamento")
    .sort((left, right) => parseIsoDate(left.startDate).getTime() - parseIsoDate(right.startDate).getTime());

  return activeSprints[0]?.id ?? items[0]?.id ?? null;
}

export function getDragAutoScrollDelta(
  clientY: number,
  viewportHeight: number,
  threshold = 96,
  maxScrollStep = 28,
) {
  if (viewportHeight <= 0) {
    return 0;
  }

  if (clientY < threshold) {
    const ratio = Math.min(1, Math.max(0, (threshold - clientY) / threshold));

    return -Math.max(8, Math.round(maxScrollStep * ratio));
  }

  const bottomZoneStart = viewportHeight - threshold;

  if (clientY > bottomZoneStart) {
    const ratio = Math.min(1, Math.max(0, (clientY - bottomZoneStart) / threshold));

    return Math.max(8, Math.round(maxScrollStep * ratio));
  }

  return 0;
}

function getBoardTasks(boardId: string) {
  return tasks.filter((task) => task.board === boardId);
}

function TaskCard({
  task,
  onEdit,
  onMove,
  onFinalize,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onMove: (task: Task) => void;
  onFinalize: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDragStart: (taskId: string, event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  return (
    <article
      draggable={task.status !== "Backlog"}
      aria-grabbed={isDragging}
      onDragStart={(event) => onDragStart(task.id, event)}
      onDragEnd={onDragEnd}
      className={[
        "group relative overflow-hidden rounded-[1.4rem] border border-border bg-surface p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        isDragging ? "opacity-60 ring-2 ring-accent/30" : "",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "absolute left-0 top-0 h-full w-1.5 rounded-br-full",
          importanceStripeClass[task.importance],
        ].join(" ")}
      />

      <div className="flex items-start gap-3 pl-2 pr-10">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {task.title}
          </p>
          {task.subtitle ? (
            <p className="mt-1 max-h-12 overflow-hidden text-sm leading-6 text-muted-foreground">
              {task.subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(task)}
        aria-label={`Editar card ${task.title}`}
        title="Editar card (placeholder)"
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2 text-foreground transition hover:bg-surface"
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
          <path d="M4 20h4" />
          <path d="M13.5 5.5 18 10" />
          <path d="M6 18l-2 2 4.5-1.2L19 8.3a1.4 1.4 0 0 0 0-2L17.7 5a1.4 1.4 0 0 0-2 0L6 14.7" />
        </svg>
      </button>

      <div className="mt-4 flex flex-wrap gap-2">
        <Pill tone="accent">{task.cardType}</Pill>
        <span
          className={[
            "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
            importanceBadgeClass[task.importance],
          ].join(" ")}
        >
          {task.importance}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Pill tone={getStatusTone(task.status)}>{getTaskStatusLabel(task)}</Pill>
        <Pill>{task.team}</Pill>
        {task.checklists?.length ? (
          <Pill tone="success">{computeChecklistProgress(task.checklists)}% checklist</Pill>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 rounded-2xl border border-border bg-surface-2 px-3 py-3">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span>Início</span>
          <span>{formatLongDate(task.startDate)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span>Fim</span>
          <span>{formatLongDate(task.endDate)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {task.status === "Concluído" ? (
          <button
            type="button"
            onClick={() => onFinalize(task)}
            className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/15"
          >
            Concluído
          </button>
        ) : task.status === "Backlog" ? (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground"
          >
            Bloqueado
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onMove(task)}
            className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/15"
          >
            Mover
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface"
        >
          Excluir
        </button>
      </div>
    </article>
  );
}

function TaskDrawer({
  task,
  onClose,
}: {
  task: Task | null;
  onClose: () => void;
}) {
  return (
      <Drawer
      open={Boolean(task)}
      title={task?.title ?? ""}
      subtitle={task ? `${task.module} · ${task.project}` : undefined}
      onClose={onClose}
      footer={
        task ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/administrativo/clientes"
              className="rounded-full border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface"
            >
              Ver cliente
            </Link>
            <Link
              href="/design/projetos"
              className="rounded-full border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface"
            >
              Abrir projeto
            </Link>
          </div>
        ) : null
      }
    >
      {task ? (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Pill tone={priorityTone[task.priority]}>{task.priority}</Pill>
            <Pill tone={getStatusTone(task.status)}>{getTaskStatusLabel(task)}</Pill>
            <Pill>{task.assignee}</Pill>
            <Pill>{task.dueDate}</Pill>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">{task.description}</p>
          <ProgressBar value={task.progress} label="Progresso do card" />
          <SectionCard title="Relações" description="Conexões conceituais exibidas no MVP">
            <div className="flex flex-wrap gap-2">
              <Pill tone="accent">{task.client}</Pill>
              <Pill>{task.project}</Pill>
              <Pill>{task.module}</Pill>
              {task.tags.map((tag) => (
                <Pill key={tag}>{tag}</Pill>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Checklist" description="Estado persistido apenas em memória">
            {task.checklists?.length ? (
              <div className="space-y-4">
                {task.checklists.map((checklist) => {
                  const completion = computeChecklistProgress([checklist]);

                  return (
                    <div key={checklist.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{checklist.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            {checklist.items.length} tarefas
                          </p>
                        </div>
                        <Pill tone="success">{completion}%</Pill>
                      </div>
                      <div className="mt-4 space-y-3">
                        {checklist.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                            <span
                              aria-hidden="true"
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#279890] text-[#279890]"
                            >
                              {item.completed ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                                  <path d="m5 12 4 4 10-10" />
                                </svg>
                              ) : null}
                            </span>
                            <span className="text-sm text-foreground">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Sem checklist"
                description="Este card não possui checklist associado no momento."
              />
            )}
          </SectionCard>
        </div>
      ) : null}
    </Drawer>
  );
}

export function KanbanOverviewPage() {
  const openTasks = tasks.filter((task) => task.status !== "Concluído");
  const blockedTasks = tasks.filter((task) => task.tags.includes("bloqueado"));
  const overdueTasks = tasks.filter((task) => task.dueDate < "2026-04-22" && task.status !== "Concluído");
  const completedTasks = tasks.filter((task) => task.status === "Concluído");
  const taskDistribution = [
    { label: "Backlog", value: tasks.filter((task) => task.status === "Backlog").length },
    { label: "Andamento", value: tasks.filter((task) => task.status === "Em andamento").length },
    { label: "Revisão (Testes)", value: tasks.filter((task) => task.status === "Revisão").length },
    { label: "Aprovados", value: tasks.filter((task) => task.status === "Aprovado").length },
    { label: "Concluído", value: completedTasks.length },
    { label: "Bloqueado", value: blockedTasks.length },
  ];

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        eyebrow="Kanban"
        title="Visão Geral"
        description="Base operacional dos quadros, backlog, sprint e etiquetas do hub MQ Orbit."
        breadcrumbs={[
          { href: "/kanban", label: "Kanban" },
          { label: "Visão Geral" },
        ]}
        actions={
          <>
            <Link
              href="/kanban/backlog"
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-2"
            >
              Abrir backlog
            </Link>
            <Link
              href="/kanban/quadros"
              className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
            >
              Ver quadros
            </Link>
          </>
        }
      />

      <StatGrid
        items={[
          { label: "Quadros ativos", value: "3", detail: "estrutura principal em uso", accent: "ok" },
          { label: "Tarefas da semana", value: String(openTasks.length), detail: "inclui backlog priorizado" },
          { label: "Atrasadas", value: String(overdueTasks.length), detail: "itens acima do prazo" },
          { label: "Bloqueadas", value: String(blockedTasks.length), detail: "aguardando dependência" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Minhas pendências"
          description="Itens com contexto de cliente, módulo e prazo já vinculados"

        >
          <div className="grid gap-3">
            {tasks.slice(0, 3).map((task) => (
              <article key={task.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.client} · {task.project}</p>
                  </div>
                  <Pill tone={priorityTone[task.priority]}>{task.priority}</Pill>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill tone={getStatusTone(task.status)}>{getTaskStatusLabel(task)}</Pill>
                  <Pill>{task.assignee}</Pill>
                  <Pill>{formatDate(task.dueDate)}</Pill>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Distribuição por responsável"
          description="Visão rápida da carga do time"
          action={<Link href="/kanban/sprints" className="text-sm font-semibold text-accent">Sprint atual</Link>}
        >
          <div className="space-y-4">
            {[
              { label: "Matheus", value: 8, hint: "hub e arquitetura" },
              { label: "Larissa", value: 6, hint: "clientes e aprovação" },
              { label: "Bruna", value: 7, hint: "design e briefing" },
              { label: "Lucas", value: 5, hint: "propostas e comercial" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="font-semibold text-muted-foreground">{item.value} cards</span>
                </div>
                <ProgressBar value={Math.min(100, item.value * 12)} />
                <p className="text-xs text-muted-foreground">{item.hint}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Entregas da semana" description="Conexões com módulos vizinhos e demandas de produto">
          <MiniChart
            title="Ritmo semanal"
            items={[
              { label: "Seg", value: 4 },
              { label: "Ter", value: 6 },
              { label: "Qua", value: 5 },
              { label: "Qui", value: 8 },
              { label: "Sex", value: 7 },
              { label: "Sáb", value: 3 },
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill tone="accent">Campanha Institucional MQ</Pill>
            <Pill tone="accent">Rebranding PicBrand</Pill>
            <Pill>Contrato Casa Zeeni</Pill>
            <Pill>Projeto site tech</Pill>
          </div>
        </SectionCard>

        <SectionCard title="Atividade recente" description="Linha do tempo das últimas mudanças no fluxo">
          <Timeline items={recentActivity} />
        </SectionCard>
      </div>

      <SectionCard title="Distribuição de status" description="Resumo do estado atual do Kanban">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {taskDistribution.map((item) => (
            <article key={item.label} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{item.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">cards visíveis no conjunto mockado</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function KanbanBoardsPage() {
  const [currentBoards, setCurrentBoards] = useState(boards);
  const [selectedBoardId, setSelectedBoardId] = useState(boards[0].id);
  const [currentTasks, setCurrentTasks] = useState(tasks);
  const [, setArchivedTasks] = useState<Task[]>([]);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [newBoardDraft, setNewBoardDraft] = useState(createBoardDraft);
  const [newBoardColumnLabel, setNewBoardColumnLabel] = useState("");
  const [draggedBoardColumnId, setDraggedBoardColumnId] = useState<string | null>(null);
  const [dragOverBoardColumnId, setDragOverBoardColumnId] = useState<string | null>(null);
  const [deleteTargetBoard, setDeleteTargetBoard] = useState<Board | null>(null);
  const [deleteTargetBoardColumn, setDeleteTargetBoardColumn] = useState<BoardColumnDraft | null>(
    null,
  );
  const [deleteTargetTask, setDeleteTargetTask] = useState<Task | null>(null);
  const [taskToFinalize, setTaskToFinalize] = useState<Task | null>(null);
  const [taskFormDraft, setTaskFormDraft] = useState<TaskFormDraft | null>(null);
  const [deleteConfirmationValue, setDeleteConfirmationValue] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [taskToMove, setTaskToMove] = useState<Task | null>(null);

  const selectedBoard = currentBoards.find((board) => board.id === selectedBoardId) ?? null;
  const visibleTasks = selectedBoard
    ? currentTasks.filter((task) => task.board === selectedBoard.id)
    : [];
  const selectedBoardColumns = selectedBoard?.columns ?? defaultBoardColumns;
  const deleteBoardConfirmationTarget = deleteTargetBoard?.name.toUpperCase() ?? "";
  const deleteBoardConfirmationMatches =
    deleteTargetBoard !== null &&
    deleteConfirmationValue.trim() === deleteBoardConfirmationTarget;
  const deleteBoardColumnHasCards =
    deleteTargetBoardColumn !== null &&
    editingBoardId !== null &&
    currentTasks.some(
      (task) => task.board === editingBoardId && task.status === deleteTargetBoardColumn.id,
    );
  const deleteBoardColumnIsLocked =
    (deleteTargetBoardColumn?.isFixed ?? false) || deleteBoardColumnHasCards;
  const deleteTaskConfirmationTarget = deleteTargetTask?.title.toUpperCase() ?? "";
  const deleteTaskConfirmationMatches =
    deleteTargetTask !== null &&
    deleteConfirmationValue.trim() === deleteTaskConfirmationTarget;
  const isEditingBoard = editingBoardId !== null;
  const isTaskEditing = Boolean(taskFormDraft?.id);
  const taskDateValidation = taskFormDraft
    ? (() => {
        const startDate = parseTaskDate(taskFormDraft.startDate);
        const endDate = parseTaskDate(taskFormDraft.endDate);

        return {
          isEndBeforeStart: Boolean(startDate && endDate && endDate < startDate),
          isLongDuration: isTaskLongDuration(taskFormDraft.startDate, taskFormDraft.endDate),
          missingRequiredFields: !hasRequiredTaskFields(taskFormDraft),
          hasChecklistError: !isChecklistDraftValid(taskFormDraft.checklists),
        } satisfies TaskFormValidation;
      })()
    : null;
  const taskFormCanSave =
    taskFormDraft !== null &&
    taskDateValidation !== null &&
    !taskDateValidation.isEndBeforeStart &&
    !taskDateValidation.missingRequiredFields &&
    !taskDateValidation.hasChecklistError;

  const isAnyOverlayOpen =
    isCreateBoardOpen ||
    Boolean(deleteTargetBoard) ||
    Boolean(deleteTargetBoardColumn) ||
    Boolean(deleteTargetTask) ||
    Boolean(taskToFinalize) ||
    Boolean(taskToMove) ||
    Boolean(taskFormDraft);

  useEffect(() => {
    if (!isAnyOverlayOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isAnyOverlayOpen]);

  function syncTaskStatusChange(task: Task, nextStatusValue: TaskStatus) {
    // Future production hook:
    // await Promise.all([
    //   fetch(`/api/kanban/tasks/${task.id}`, {
    //     method: "PATCH",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ status: nextStatusValue, boardId: task.board }),
    //   }),
    //   fetch(`/api/kanban/boards/${task.board}/summary`, { method: "POST" }),
    // ]);
    void task;
    void nextStatusValue;
  }

  function moveTaskToColumn(taskId: string, nextStatusValue: TaskStatus) {
    const task = currentTasks.find((item) => item.id === taskId);

    if (
      !task ||
      task.status === nextStatusValue ||
      (task.status === "Backlog" && nextStatusValue !== "Backlog")
    ) {
      return;
    }

    syncTaskStatusChange(task, nextStatusValue);
    const nextStatusLabel =
      selectedBoardColumns.find((column) => column.id === nextStatusValue)?.label ??
      defaultStatusLabels[nextStatusValue] ??
      nextStatusValue;

    setCurrentTasks((current) =>
      current.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status: nextStatusValue,
              statusLabel: nextStatusLabel,
            }
          : item,
      ),
    );
  }

  function handleTaskDragStart(taskId: string, event: DragEvent<HTMLElement>) {
    const task = currentTasks.find((item) => item.id === taskId);

    if (task?.status === "Backlog") {
      event.preventDefault();
      return;
    }

    setDraggedTaskId(taskId);
    setDragOverColumn(null);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", taskId);
  }

  function handleTaskDragEnd() {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  }

  function handleViewportAutoScroll(event: DragEvent<HTMLElement>) {
    if (!draggedTaskId) {
      return;
    }

    const delta = getDragAutoScrollDelta(event.clientY, window.innerHeight);

    if (delta !== 0) {
      window.scrollBy({ top: delta, behavior: "auto" });
    }
  }

  function handleBoardDragOver(event: DragEvent<HTMLElement>) {
    if (!draggedTaskId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    handleViewportAutoScroll(event);
  }

  function handleColumnDragOver(column: BoardColumnDraft, event: DragEvent<HTMLElement>) {
    if (!draggedTaskId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    handleViewportAutoScroll(event);

    if (dragOverColumn !== column.id) {
      setDragOverColumn(column.id);
    }
  }

  function handleColumnDragLeave(column: BoardColumnDraft, event: DragEvent<HTMLElement>) {
    const relatedTarget = event.relatedTarget as Node | null;

    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      setDragOverColumn((current) => (current === column.id ? null : current));
    }
  }

  function handleColumnDrop(column: BoardColumnDraft, event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const taskId = draggedTaskId ?? event.dataTransfer.getData("text/plain");
    const task = taskId ? currentTasks.find((item) => item.id === taskId) ?? null : null;

    if (taskId) {
      moveTaskToColumn(taskId, column.id);

      if (column.id === "Concluído" && task && task.status !== "Concluído") {
        setTaskToFinalize(task);
      }
    }

    setDraggedTaskId(null);
    setDragOverColumn(null);
  }

  function openCreateBoardModal() {
    setEditingBoardId(null);
    setNewBoardDraft(createBoardDraft());
    setNewBoardColumnLabel("");
    setDraggedBoardColumnId(null);
    setDragOverBoardColumnId(null);
    setDeleteTargetBoardColumn(null);
    setIsCreateBoardOpen(true);
  }

  function closeCreateBoardModal() {
    setIsCreateBoardOpen(false);
    setEditingBoardId(null);
    setNewBoardDraft(createBoardDraft());
    setNewBoardColumnLabel("");
    setDraggedBoardColumnId(null);
    setDragOverBoardColumnId(null);
    setDeleteTargetBoardColumn(null);
  }

  function updateBoardDraft<K extends keyof BoardDraft>(key: K, value: BoardDraft[K]) {
    setNewBoardDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateBoardViewer(name: string, patch: Partial<BoardViewerDraft>) {
    setNewBoardDraft((current) => ({
      ...current,
      viewers: current.viewers.map((viewer) =>
        viewer.name === name ? { ...viewer, ...patch } : viewer,
      ),
    }));
  }

  function openDeleteBoardConfirm(board: Board) {
    setDeleteTargetBoard(board);
    setDeleteConfirmationValue("");
  }

  function openDeleteBoardColumnConfirm(column: BoardColumnDraft) {
    if (!canRemoveDraftBoardColumn(column)) {
      return;
    }

    setDeleteTargetBoardColumn(column);
  }

  function closeDeleteBoardColumnConfirm() {
    setDeleteTargetBoardColumn(null);
  }

  function openCreateTaskDialog() {
    if (!selectedBoard) {
      return;
    }

    setTaskFormDraft(createTaskFormDraft(selectedBoard));
  }

  function closeTaskFormDialog() {
    setTaskFormDraft(null);
  }

  function openEditBoardModal(board: Board) {
    setEditingBoardId(board.id);
    setNewBoardDraft(createBoardDraft(board));
    setNewBoardColumnLabel("");
    setDraggedBoardColumnId(null);
    setDragOverBoardColumnId(null);
    setDeleteTargetBoardColumn(null);
    setIsCreateBoardOpen(true);
  }

  function closeDeleteBoardConfirm() {
    setDeleteTargetBoard(null);
    setDeleteConfirmationValue("");
  }

  function addBoardColumnToDraft() {
    const label = newBoardColumnLabel.trim();

    if (!label) {
      return;
    }

    setNewBoardDraft((current) => ({
      ...current,
      columns: (() => {
        const nextColumn = createBoardColumnDraft(label);
        const doneIndex = current.columns.findIndex((column) => column.id === "Concluído");

        if (doneIndex < 0) {
          return [...current.columns, nextColumn];
        }

        return [
          ...current.columns.slice(0, doneIndex),
          nextColumn,
          ...current.columns.slice(doneIndex),
        ];
      })(),
    }));
    setNewBoardColumnLabel("");
  }

  function moveBoardColumnDraft(columnId: string, targetColumnId: string) {
    if (columnId === targetColumnId) {
      return;
    }

    setNewBoardDraft((current) => {
      const fromIndex = current.columns.findIndex((column) => column.id === columnId);
      const toIndex = current.columns.findIndex((column) => column.id === targetColumnId);

      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }

      const nextColumns = [...current.columns];
      const [movedColumn] = nextColumns.splice(fromIndex, 1);
      nextColumns.splice(toIndex, 0, movedColumn);

      return {
        ...current,
        columns: nextColumns,
      };
    });
  }

  function handleBoardColumnDragStart(columnId: string) {
    setDraggedBoardColumnId(columnId);
    setDragOverBoardColumnId(columnId);
  }

  function handleBoardColumnDragEnd() {
    setDraggedBoardColumnId(null);
    setDragOverBoardColumnId(null);
  }

  function handleBoardColumnDragOver(columnId: string, event: DragEvent<HTMLElement>) {
    if (!draggedBoardColumnId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dragOverBoardColumnId !== columnId) {
      setDragOverBoardColumnId(columnId);
    }
  }

  function handleBoardColumnDrop(columnId: string, event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const draggedId = draggedBoardColumnId ?? event.dataTransfer.getData("text/plain");

    if (draggedId) {
      moveBoardColumnDraft(draggedId, columnId);
    }

    handleBoardColumnDragEnd();
  }

  function removeBoardColumnFromDraft(columnId: string) {
    setNewBoardDraft((current) => ({
      ...current,
      columns: current.columns.filter((column) => column.id !== columnId),
    }));
    closeDeleteBoardColumnConfirm();
  }

  function canRemoveDraftBoardColumn(column: BoardColumnDraft) {
    if (column.isFixed) {
      return false;
    }

    if (!editingBoardId) {
      return true;
    }

    return !currentTasks.some((task) => task.board === editingBoardId && task.status === column.id);
  }

  function handleDeleteBoardColumn() {
    if (!deleteTargetBoardColumn) {
      return;
    }

    if (!canRemoveDraftBoardColumn(deleteTargetBoardColumn)) {
      return;
    }

    removeBoardColumnFromDraft(deleteTargetBoardColumn.id);
  }

  function handleSaveBoard() {
    const title = newBoardDraft.title.trim() || "Novo quadro";
    const subtitle = newBoardDraft.subtitle.trim();
    const description = newBoardDraft.description.trim();
    const sanitizedColumns = sanitizeBoardColumns(newBoardDraft.columns);
    const viewerPayload = newBoardDraft.viewers
      .filter((viewer) => viewer.active)
      .map((viewer) => ({
        name: viewer.name,
        role: viewer.role,
      }));

    const nextBoard: Board = {
      id: `board-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${currentBoards.length + 1}`,
      name: title,
      client: subtitle || "Novo contexto",
      focus: description || "Descrição do quadro",
      columns: sanitizedColumns,
      activeTasks: 0,
      dueSoon: 0,
      blocked: 0,
    };

    const editingBoard = editingBoardId
      ? currentBoards.find((board) => board.id === editingBoardId) ?? null
      : null;
    const removedColumns = editingBoard
      ? editingBoard.columns.filter(
          (column) => !sanitizedColumns.some((draftColumn) => draftColumn.id === column.id),
        )
      : [];
    const hasRemovedColumnsWithCards =
      editingBoardId !== null &&
      removedColumns.some((column) =>
        currentTasks.some((task) => task.board === editingBoardId && task.status === column.id),
      );

    if (hasRemovedColumnsWithCards) {
      return;
    }

    // Future production hook:
    // await fetch("/api/kanban/boards", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ ...nextBoard, viewers: viewerPayload }),
    // });
    void viewerPayload;

    if (editingBoardId) {
      setCurrentBoards((current) =>
        current.map((board) =>
          board.id === editingBoardId
            ? {
                ...board,
                name: title,
                client: subtitle || "Novo contexto",
                focus: description || "Descrição do quadro",
                columns: sanitizedColumns,
              }
            : board,
        ),
      );
      setSelectedBoardId(editingBoardId);
    } else {
      setCurrentBoards((current) => [...current, nextBoard]);
      setSelectedBoardId(nextBoard.id);
    }

    setIsCreateBoardOpen(false);
    setEditingBoardId(null);
    setNewBoardDraft(createBoardDraft());
    setNewBoardColumnLabel("");
    setDeleteTargetBoardColumn(null);
  }

  function openMoveTaskDialog(task: Task) {
    if (task.status === "Backlog") {
      return;
    }

    setTaskToMove(task);
  }

  function closeMoveTaskDialog() {
    setTaskToMove(null);
  }

  function handleMoveTaskToColumn(column: TaskStatus) {
    if (!taskToMove) {
      return;
    }

    moveTaskToColumn(taskToMove.id, column);
    closeMoveTaskDialog();
  }

  function openDeleteTaskConfirm(task: Task) {
    setDeleteTargetTask(task);
    setDeleteConfirmationValue("");
  }

  function openFinalizeTaskConfirm(task: Task) {
    setTaskToFinalize(task);
  }

  function closeFinalizeTaskConfirm() {
    setTaskToFinalize(null);
  }

  function handleFinalizeTask() {
    if (!taskToFinalize) {
      return;
    }

    setArchivedTasks((current) => [
      ...current,
      {
        ...taskToFinalize,
        status: "Concluído",
      },
    ]);
    setCurrentTasks((current) => current.filter((task) => task.id !== taskToFinalize.id));
    closeFinalizeTaskConfirm();
  }

  function closeDeleteTaskConfirm() {
    setDeleteTargetTask(null);
    setDeleteConfirmationValue("");
  }

  function handleDeleteTask() {
    if (!deleteTargetTask || !deleteTaskConfirmationMatches) {
      return;
    }

    setCurrentTasks((current) => current.filter((task) => task.id !== deleteTargetTask.id));
    closeDeleteTaskConfirm();
  }

  function openEditTaskDialog(task: Task) {
    setTaskFormDraft(createTaskFormDraft(selectedBoard, task));
  }

  function updateTaskFormDraft(patch: Partial<TaskFormDraft>) {
    setTaskFormDraft((current) => (current ? { ...current, ...patch } : current));
  }

  function updateTaskChecklistTitle(checklistId: string, title: string) {
    setTaskFormDraft((current) =>
      current
        ? {
            ...current,
            checklists: current.checklists.map((checklist) =>
              checklist.id === checklistId ? { ...checklist, title } : checklist,
            ),
          }
        : current,
    );
  }

  function updateTaskChecklistItem(
    checklistId: string,
    itemId: string,
    patch: Partial<TaskChecklistItem>,
  ) {
    setTaskFormDraft((current) =>
      current
        ? {
            ...current,
            checklists: current.checklists.map((checklist) =>
              checklist.id === checklistId
                ? {
                    ...checklist,
                    items: checklist.items.map((item) =>
                      item.id === itemId ? { ...item, ...patch } : item,
                    ),
                  }
                : checklist,
            ),
          }
        : current,
    );
  }

  function addTaskChecklist() {
    setTaskFormDraft((current) =>
      current
        ? {
            ...current,
            checklists: [...current.checklists, createChecklistDraft()],
          }
        : current,
    );
  }

  function removeTaskChecklist(checklistId: string) {
    setTaskFormDraft((current) =>
      current
        ? {
            ...current,
            checklists: current.checklists.filter((checklist) => checklist.id !== checklistId),
          }
        : current,
    );
  }

  function addTaskChecklistItem(checklistId: string) {
    setTaskFormDraft((current) =>
      current
        ? {
            ...current,
            checklists: current.checklists.map((checklist) =>
              checklist.id === checklistId
                ? { ...checklist, items: [...checklist.items, createChecklistItemDraft()] }
                : checklist,
            ),
          }
        : current,
    );
  }

  function removeTaskChecklistItem(checklistId: string, itemId: string) {
    setTaskFormDraft((current) =>
      current
        ? {
            ...current,
            checklists: current.checklists.map((checklist) =>
              checklist.id === checklistId
                ? {
                    ...checklist,
                    items: checklist.items.filter((item) => item.id !== itemId),
                  }
                : checklist,
            ),
          }
        : current,
    );
  }

  function toggleTaskChecklistItem(checklistId: string, itemId: string) {
    setTaskFormDraft((current) =>
      current
        ? {
            ...current,
            checklists: current.checklists.map((checklist) =>
              checklist.id === checklistId
                ? {
                    ...checklist,
                    items: checklist.items.map((item) =>
                      item.id === itemId ? { ...item, completed: !item.completed } : item,
                    ),
                  }
                : checklist,
            ),
          }
        : current,
    );
  }

  function handleSaveTask() {
    if (!taskFormDraft || !taskDateValidation || !taskFormCanSave) {
      return;
    }

    const checklistProgress = computeChecklistProgress(taskFormDraft.checklists);
    const sanitizedChecklists = taskFormDraft.checklists
      .map((checklist) => ({
        ...checklist,
        title: checklist.title.trim(),
        items: checklist.items
          .map((item) => ({ ...item, label: item.label.trim() }))
          .filter((item) => item.label.length > 0),
      }))
      .filter((checklist) => checklist.title.length > 0 && checklist.items.length > 0);

    const baseTask: Task = {
      id: taskFormDraft.id ?? `task-${currentTasks.length + 1}-${createId("new")}`,
      title: taskFormDraft.title.trim(),
      subtitle: taskFormDraft.subtitle?.trim() || undefined,
      team: taskFormDraft.team,
      cardType: taskFormDraft.cardType,
      importance: taskFormDraft.importance,
      description: taskFormDraft.description.trim(),
      priority: taskFormDraft.priority,
      status: taskFormDraft.status,
      statusLabel:
        taskFormDraft.statusLabel ??
        defaultStatusLabels[taskFormDraft.status] ??
        taskFormDraft.status,
      assignee: taskFormDraft.assignee || taskFormDraft.team,
      startDate: taskFormDraft.startDate,
      endDate: taskFormDraft.endDate,
      dueDate: taskFormDraft.endDate,
      client: taskFormDraft.client,
      project: taskFormDraft.project,
      module: taskFormDraft.module,
      tags: taskFormDraft.tags,
      progress:
        sanitizedChecklists.length > 0
          ? checklistProgress
          : taskFormDraft.id
            ? taskFormDraft.progress
            : 0,
      board: taskFormDraft.board,
      checklists: sanitizedChecklists,
    };

    const nextTask = {
      ...baseTask,
      priority:
        taskFormDraft.priority ||
        (taskFormDraft.importance === "Baixa"
          ? "Baixa"
          : taskFormDraft.importance === "Média"
            ? "Média"
            : "Alta"),
    } satisfies Task;

    setCurrentTasks((current) =>
      taskFormDraft.id
        ? current.map((task) => (task.id === taskFormDraft.id ? nextTask : task))
        : [...current, nextTask],
    );

    closeTaskFormDialog();
  }

  function handleDeleteBoard() {
    if (!deleteTargetBoard || !deleteBoardConfirmationMatches) {
      return;
    }

    // Future production hook:
    // await fetch(`/api/kanban/boards/${deleteTargetBoard.id}`, { method: "DELETE" });
    console.log("Excluído");

    const nextBoards = currentBoards.filter((board) => board.id !== deleteTargetBoard.id);

    setCurrentBoards(nextBoards);
    setCurrentTasks((current) => current.filter((task) => task.board !== deleteTargetBoard.id));

    if (selectedBoardId === deleteTargetBoard.id) {
      setSelectedBoardId(nextBoards[0]?.id ?? "");
    }

    closeDeleteBoardConfirm();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kanban"
        title="Quadros"
        description="Selecione um quadro e acompanhe as colunas com mudança de status em memória."
        breadcrumbs={[
          { href: "/kanban", label: "Kanban" },
          { label: "Quadros" },
        ]}
      />

      <SectionCard
        title="Quadros existentes"
        description="Três contextos reais do hub MQ Orbit"
        action={
          <button
            type="button"
            onClick={openCreateBoardModal}
            aria-label="Adicionar quadro"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-2xl font-semibold text-foreground transition hover:bg-accent/15"
          >
            +
          </button>
        }
      >
        {currentBoards.length ? (
          <div className="flex flex-wrap gap-4">
            {currentBoards.map((board) => {
              const isSelected = selectedBoard?.id === board.id;

              return (
                <article
                  key={board.id}
                  className={[
                    "relative flex flex-[1_1_18rem] min-w-[18rem] flex-col rounded-[1.6rem] border p-4 text-left transition hover:-translate-y-0.5",
                    isSelected
                      ? "border-accent/25 bg-accent/10 shadow-sm"
                      : "border-border bg-surface-2",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedBoardId(board.id)}
                    aria-pressed={isSelected}
                    className="block w-full pr-20 text-left"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {board.client}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                      {board.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {board.focus}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Pill tone="accent">{board.activeTasks} tarefas</Pill>
                      <Pill>{board.dueSoon} vencendo</Pill>
                      <Pill>{board.blocked} bloqueadas</Pill>
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir quadro ${board.name}`}
                    onClick={() => openDeleteBoardConfirm(board)}
                    className="absolute right-14 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/80 text-foreground transition hover:bg-surface"
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
                      <path d="M8 6V4.8c0-.88.72-1.6 1.6-1.6h4.8c.88 0 1.6.72 1.6 1.6V6" />
                      <path d="M6.5 6l.75 12.2c.06.98.87 1.8 1.86 1.8h5.78c.99 0 1.8-.82 1.86-1.8L17.5 6" />
                      <path d="M10 10.2v5.6" />
                      <path d="M14 10.2v5.6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label={`Editar quadro ${board.name}`}
                    onClick={() => openEditBoardModal(board)}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/80 text-foreground transition hover:bg-surface"
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
                      <path d="M4 20h4" />
                      <path d="M13.5 5.5 18 10" />
                      <path d="M6 18l-2 2 4.5-1.2L19 8.3a1.4 1.4 0 0 0 0-2L17.7 5a1.4 1.4 0 0 0-2 0L6 14.7" />
                    </svg>
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Sem quadros"
            description="Crie um quadro para começar a organizar o fluxo."
            action={
              <button
                type="button"
                onClick={openCreateBoardModal}
                className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                Novo quadro
              </button>
            }
          />
        )}
      </SectionCard>

      {selectedBoard ? (
        <SectionCard
          title={selectedBoard.name}
          description={selectedBoard.focus}
          action={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openCreateTaskDialog}
                aria-label="Adicionar card no quadro selecionado"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-2xl font-semibold text-foreground transition hover:bg-accent/15"
              >
                +
              </button>
              <Pill tone="accent">{visibleTasks.length} cards</Pill>
            </div>
          }
        >
          <div className="flex flex-wrap gap-4" onDragOver={handleBoardDragOver}>
            {selectedBoardColumns.map((column) => {
              const columnTasks = visibleTasks.filter((task) => task.status === column.id);
              const columnId = column.id.toLowerCase().replace(/\s+/g, "-");

              return (
                <section
                  key={column.id}
                  aria-labelledby={`kanban-column-${columnId}`}
                  onDragOver={(event) => handleColumnDragOver(column, event)}
                  onDragLeave={(event) => handleColumnDragLeave(column, event)}
                  onDrop={(event) => handleColumnDrop(column, event)}
                  className={[
                    "flex flex-[1_1_18rem] min-w-[18rem] flex-col rounded-[1.4rem] border bg-surface-2 p-4 transition",
                    dragOverColumn === column.id
                      ? "border-accent/40 bg-accent/10 shadow-sm"
                      : "border-border",
                  ].join(" ")}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3
                      id={`kanban-column-${columnId}`}
                      className="text-sm font-semibold tracking-tight text-foreground"
                    >
                      {column.label}
                    </h3>
                    <Pill>{columnTasks.length}</Pill>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {columnTasks.length ? (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={openEditTaskDialog}
                          onMove={openMoveTaskDialog}
                          onFinalize={openFinalizeTaskConfirm}
                          onDelete={openDeleteTaskConfirm}
                          onDragStart={handleTaskDragStart}
                          onDragEnd={handleTaskDragEnd}
                          isDragging={draggedTaskId === task.id}
                        />
                      ))
                    ) : (
                      <div className="w-full rounded-[1.3rem] border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
                        Sem cards nesta coluna
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </SectionCard>
      ) : (
        <EmptyState
          title="Nenhum quadro selecionado"
          description="Crie ou selecione um quadro para ver as colunas."
          action={
            <button
              type="button"
              onClick={openCreateBoardModal}
              className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
            >
              Novo quadro
            </button>
          }
        />
      )}

      {taskToMove ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeMoveTaskDialog}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="move-task-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[32rem] flex-col overflow-hidden rounded-[2rem] border border-accent/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Mover card
                </p>
                <h2
                  id="move-task-dialog-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Mover card
                </h2>
                <p className="text-sm font-semibold text-foreground">
                  {taskToMove.title}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Escolha a coluna de destino deste quadro.
                </p>
              </div>
              <button
                type="button"
                onClick={closeMoveTaskDialog}
                aria-label="Fechar mover card"
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {selectedBoardColumns.map((column) => {
                const active = taskToMove.status === column.id;

                return (
                  <button
                    key={column.id}
                    type="button"
                    onClick={() => handleMoveTaskToColumn(column.id)}
                    disabled={active}
                    aria-label={column.label}
                    className={[
                      "rounded-[1.25rem] border px-4 py-4 text-left transition",
                      active
                        ? "cursor-not-allowed border-border bg-surface-2 text-muted-foreground"
                        : "border-border bg-surface hover:bg-surface-2",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold text-foreground">{column.label}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {active ? "Coluna atual" : "Mover card para esta coluna"}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      {taskFormDraft ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeTaskFormDialog}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[46rem] max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[2rem] border border-accent/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6 lg:max-w-[62rem] lg:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  {isTaskEditing ? "Editar card" : "Novo card"}
                </p>
                <h2
                  id="task-form-dialog-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  {isTaskEditing ? "Editar card do quadro" : "Adicionar card ao quadro"}
                </h2>
                <p className="text-sm font-semibold text-foreground">
                  {selectedBoard?.name ?? taskFormDraft.project}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {isTaskEditing
                    ? "Atualize os dados do card selecionado."
                    : "Preencha os campos obrigatórios e, se necessário, adicione um checklist opcional."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeTaskFormDialog}
                aria-label={isTaskEditing ? "Fechar edição de card" : "Fechar criação de card"}
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Título
                    </span>
                    <input
                      value={taskFormDraft.title}
                      onChange={(event) => updateTaskFormDraft({ title: event.target.value })}
                      placeholder="Ex.: Nova entrega do quadro"
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Descrição
                    </span>
                    <textarea
                      value={taskFormDraft.description}
                      onChange={(event) => updateTaskFormDraft({ description: event.target.value })}
                      placeholder="Descreva a tarefa, contexto e entregáveis."
                      rows={7}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </label>

                  <div className="rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Datas
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          O fim não pode ser anterior ao início.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Início
                        </span>
                        <input
                          type="date"
                          value={taskFormDraft.startDate}
                          onChange={(event) => updateTaskFormDraft({ startDate: event.target.value })}
                          className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Fim
                        </span>
                        <input
                          type="date"
                          value={taskFormDraft.endDate}
                          onChange={(event) => updateTaskFormDraft({ endDate: event.target.value })}
                          className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                        />
                      </label>
                    </div>

                    <div className="mt-4 space-y-2">
                      {taskDateValidation?.isEndBeforeStart ? (
                        <p className="rounded-2xl border border-[#FFA500]/25 bg-[#FFA500]/10 px-4 py-3 text-sm font-semibold text-[#FFA500]">
                          A data final não pode ser anterior à inicial.
                        </p>
                      ) : null}
                      {taskDateValidation?.isLongDuration ? (
                        <p className="rounded-2xl border border-[#FFA500]/25 bg-[#FFA500]/10 px-4 py-3 text-sm text-[#FFA500]">
                          Card com longa duração: o período ultrapassa um mês.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Equipe designada
                    </span>
                    <select
                      value={taskFormDraft.team}
                      onChange={(event) =>
                        updateTaskFormDraft({
                          team: event.target.value,
                          assignee: event.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      {taskTeamOptions.map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Tipo de card
                    </span>
                    <select
                      value={taskFormDraft.cardType}
                      onChange={(event) => updateTaskFormDraft({ cardType: event.target.value as TaskCardType })}
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="Financeiro">Financeiro</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Dev">Dev</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Importância
                    </span>
                    <select
                      value={taskFormDraft.importance}
                      onChange={(event) =>
                        updateTaskFormDraft({
                          importance: event.target.value as TaskImportance,
                          priority:
                            event.target.value === "Baixa"
                              ? "Baixa"
                              : event.target.value === "Média"
                                ? "Média"
                                : "Alta",
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </label>

                  <div className="rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Checklist opcional
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Cada checklist precisa de um título e de pelo menos uma tarefa.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addTaskChecklist}
                        className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/15"
                      >
                        Adicionar checklist
                      </button>
                    </div>

                    {taskDateValidation?.hasChecklistError ? (
                      <p className="mt-4 rounded-2xl border border-[#FFA500]/25 bg-[#FFA500]/10 px-4 py-3 text-sm text-[#FFA500]">
                        Revise os títulos e tarefas do checklist antes de salvar.
                      </p>
                    ) : null}

                    <div className="mt-4 space-y-4">
                      {taskFormDraft.checklists.length ? (
                        taskFormDraft.checklists.map((checklist) => {
                          const completion = computeChecklistProgress([checklist]);

                          return (
                            <section
                              key={checklist.id}
                              className="rounded-[1.4rem] border border-panel-border bg-panel-surface px-4 py-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <label className="block flex-1">
                                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Título do checklist
                                  </span>
                                  <input
                                    value={checklist.title}
                                    onChange={(event) =>
                                      updateTaskChecklistTitle(checklist.id, event.target.value)
                                    }
                                    placeholder="Ex.: Validação do card"
                                    className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                                  />
                                </label>

                                <div className="flex items-center gap-2 pt-7">
                                  <Pill tone="success">{completion}%</Pill>
                                  <button
                                    type="button"
                                    onClick={() => removeTaskChecklist(checklist.id)}
                                    className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </div>

                              <div className="mt-4 space-y-3">
                                {checklist.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-2xl border border-panel-border bg-panel-surface-muted px-3 py-3"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleTaskChecklistItem(checklist.id, item.id)}
                                      aria-label={
                                        item.completed
                                          ? `Desmarcar tarefa ${item.label || "do checklist"}`
                                          : `Marcar tarefa ${item.label || "do checklist"}`
                                      }
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#279890] text-[#279890] transition hover:bg-[#279890]/10"
                                    >
                                      {item.completed ? (
                                        <svg
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="h-3 w-3"
                                          aria-hidden="true"
                                        >
                                          <path d="m5 12 4 4 10-10" />
                                        </svg>
                                      ) : null}
                                    </button>

                                    <input
                                      value={item.label}
                                      onChange={(event) =>
                                        updateTaskChecklistItem(checklist.id, item.id, {
                                          label: event.target.value,
                                        })
                                      }
                                      placeholder="Nome da tarefa"
                                      className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                    />

                                    <button
                                      type="button"
                                      onClick={() => removeTaskChecklistItem(checklist.id, item.id)}
                                      className="rounded-full border border-border bg-surface px-2 py-1 text-xs font-semibold text-foreground transition hover:bg-surface-2"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => addTaskChecklistItem(checklist.id)}
                                  className="rounded-full border border-[#279890]/25 bg-[#279890]/10 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-[#279890]/15"
                                >
                                  + Adicionar tarefa
                                </button>
                              </div>
                            </section>
                          );
                        })
                      ) : (
                        <EmptyState
                          title="Sem checklist"
                          description="Adicione um bloco para organizar tarefas menores."
                          action={
                            <button
                              type="button"
                              onClick={addTaskChecklist}
                              className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
                            >
                              Adicionar checklist
                            </button>
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4 text-sm leading-6 text-muted-foreground">
                  <p className="font-semibold text-foreground">Campos obrigatórios</p>
                  <p className="mt-2">
                    Título, equipe, descrição, início e fim precisam estar preenchidos para salvar.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeTaskFormDialog}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTask}
                disabled={!taskFormCanSave}
                className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isTaskEditing ? "Salvar alterações" : "Salvar card"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {taskToFinalize ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeFinalizeTaskConfirm}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="finalize-task-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[30rem] flex-col overflow-hidden rounded-[2rem] border border-panel-border bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Conclusão
              </p>
              <h2
                id="finalize-task-dialog-title"
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                Tem certeza que deseja finalizar?
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {taskToFinalize.title}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeFinalizeTaskConfirm}
                className="rounded-2xl border border-[#FFA500]/30 bg-[#FFA500]/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-[#FFA500]/15 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/25"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinalizeTask}
                className="rounded-2xl border border-accent/25 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Confirmar
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isCreateBoardOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/50 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeCreateBoardModal}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-board-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[32rem] max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[2rem] border border-accent/40 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:max-w-[44rem] sm:p-6 lg:max-w-[60rem] lg:p-8 xl:max-w-[66rem]"
          >
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                    {isEditingBoard ? "Edição de quadro" : "Rascunho ilustrativo"}
                  </p>
                  <h2
                    id="new-board-dialog-title"
                    className="mt-2 text-xl font-semibold tracking-tight text-foreground"
                  >
                    {isEditingBoard ? "Editar quadro" : "Novo quadro"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeCreateBoardModal}
                  aria-label={isEditingBoard ? "Fechar edição de quadro" : "Fechar criação de quadro"}
                  className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Título
                      </span>
                      <input
                        value={newBoardDraft.title}
                        onChange={(event) => updateBoardDraft("title", event.target.value)}
                        placeholder="Ex.: Operação MQ"
                        className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Subtítulo
                      </span>
                      <input
                        value={newBoardDraft.subtitle}
                        onChange={(event) => updateBoardDraft("subtitle", event.target.value)}
                        placeholder="Ex.: MQSoftwares"
                        className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Descrição
                      </span>
                      <textarea
                        value={newBoardDraft.description}
                        onChange={(event) => updateBoardDraft("description", event.target.value)}
                        placeholder="Descreva o contexto, escopo e uso do quadro."
                        rows={6}
                        className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    </label>

                    <div className="rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Pessoas que podem ver
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Defina quem acessa o quadro e o papel de cada pessoa.
                      </p>

                      <div className="mt-4 space-y-3">
                        {newBoardDraft.viewers.map((viewer) => (
                          <label
                            key={viewer.name}
                            className={[
                              "flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
                              viewer.active
                                ? "border-panel-border bg-panel-surface"
                                : "border-panel-border/70 bg-panel-surface-muted/50",
                            ].join(" ")}
                          >
                            <input
                              type="checkbox"
                              checked={viewer.active}
                              onChange={(event) =>
                                updateBoardViewer(viewer.name, { active: event.target.checked })
                              }
                              className="h-4 w-4 rounded border-panel-border text-accent focus:ring-accent"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {viewer.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Seleção individual por papel
                              </p>
                            </div>
                            <select
                              value={viewer.role}
                              onChange={(event) =>
                                updateBoardViewer(viewer.name, {
                                  role: event.target.value as BoardAccessRole,
                                })
                              }
                              disabled={!viewer.active}
                              className="rounded-2xl border border-panel-border bg-panel-surface-muted px-3 py-2 text-xs font-semibold text-foreground outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent focus:ring-2 focus:ring-accent/20"
                            >
                              <option value="Editor">Editor</option>
                              <option value="Visualizador">Visualizador</option>
                            </select>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Colunas do quadro
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Backlog, Aprovados e Concluído ficam fixos. Em andamento e Revisão podem ser removidas se não houver cards, e colunas extras podem ser adicionadas aqui.
                          </p>
                        </div>
                        <Pill tone="accent">{newBoardDraft.columns.length} colunas</Pill>
                      </div>

                      <div className="mt-4 space-y-2">
                        {newBoardDraft.columns.map((column) => {
                          const removable = canRemoveDraftBoardColumn(column);

                          return (
                            <div
                              key={column.id}
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData("text/plain", column.id);
                                handleBoardColumnDragStart(column.id);
                              }}
                              onDragEnd={handleBoardColumnDragEnd}
                              onDragOver={(event) => handleBoardColumnDragOver(column.id, event)}
                              onDrop={(event) => handleBoardColumnDrop(column.id, event)}
                              className={[
                                "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition",
                                column.isFixed
                                  ? "border-border bg-panel-surface"
                                  : "border-panel-border bg-panel-surface-muted",
                                dragOverBoardColumnId === column.id
                                  ? "ring-2 ring-accent/25"
                                  : "",
                                draggedBoardColumnId === column.id ? "opacity-60" : "",
                                "cursor-grab active:cursor-grabbing",
                              ].join(" ")}
                            >
                              <div
                                aria-hidden="true"
                                title="Arrastar para reordenar"
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-muted-foreground"
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
                                  <path d="M9 5h.01" />
                                  <path d="M15 5h.01" />
                                  <path d="M9 12h.01" />
                                  <path d="M15 12h.01" />
                                  <path d="M9 19h.01" />
                                  <path d="M15 19h.01" />
                                </svg>
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {column.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {column.isFixed ? "Coluna fixa" : "Coluna editável"}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => openDeleteBoardColumnConfirm(column)}
                                disabled={!removable}
                                className={[
                                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                                  column.isFixed
                                    ? "cursor-not-allowed border-border bg-surface-2 text-muted-foreground"
                                    : removable
                                      ? "border-accent/25 bg-accent/10 text-foreground hover:bg-accent/15"
                                      : "border-[#FFA500]/25 bg-[#FFA500]/10 text-foreground hover:bg-[#FFA500]/15",
                                ].join(" ")}
                              >
                                {column.isFixed ? "Fixa" : removable ? "Remover" : "Bloqueada"}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <input
                          value={newBoardColumnLabel}
                          onChange={(event) => setNewBoardColumnLabel(event.target.value)}
                          placeholder="Nova coluna"
                          className="min-w-0 flex-1 rounded-2xl border border-panel-border bg-panel-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                        />
                        <button
                          type="button"
                          onClick={addBoardColumnToDraft}
                          className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-accent/15"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={closeCreateBoardModal}
                    className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBoard}
                    className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {isEditingBoard ? "Salvar alterações" : "Salvar"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {deleteTargetBoardColumn ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeDeleteBoardColumnConfirm}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-board-column-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[32rem] flex-col overflow-hidden rounded-[2rem] border border-panel-border bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FFA500]">
                Atenção
              </p>
              <h2
                id="delete-board-column-dialog-title"
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                Tem certeza que deseja remover essa coluna?
              </h2>
              <p className="text-sm font-semibold text-foreground">
                {deleteTargetBoardColumn.label}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {deleteBoardColumnIsLocked
                  ? "Essa coluna não pode ser removida porque é fixa ou já possui cards vinculados."
                  : "A remoção só afeta a configuração do quadro atual."}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeDeleteBoardColumnConfirm}
                className="rounded-2xl border border-[#FFA500]/30 bg-[#FFA500]/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-[#FFA500]/15 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/25"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteBoardColumn}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteTargetBoard ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeDeleteBoardConfirm}
          onCopy={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onCut={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onContextMenu={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-board-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[32rem] flex-col overflow-hidden rounded-[2rem] border border-[#0F3A53]/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FFA500]">
                  Atenção
                </p>
                <h2
                  id="delete-board-dialog-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Tem certeza que deseja excluir esse quadro?
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Essa é uma ação irreversível.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeleteBoardConfirm}
                aria-label="Fechar confirmação de exclusão"
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-[1.4rem] border border-panel-border bg-panel-surface-muted/70 p-4 select-none">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Quadro selecionado
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {deleteTargetBoard.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Digite o título em maiúsculo para confirmar a exclusão.
                </p>
                <p className="mt-4 rounded-2xl border border-panel-border bg-panel-surface px-4 py-3 text-sm font-semibold tracking-[0.16em] text-foreground">
                  {deleteBoardConfirmationTarget}
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Confirmação
                </span>
                <input
                  value={deleteConfirmationValue}
                  onChange={(event) =>
                    setDeleteConfirmationValue(event.target.value.toUpperCase())
                  }
                  placeholder={deleteBoardConfirmationTarget}
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeDeleteBoardConfirm}
                className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                Cancelar operação
              </button>
              <button
                type="button"
                onClick={handleDeleteBoard}
                disabled={!deleteBoardConfirmationMatches}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteTargetTask ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeDeleteTaskConfirm}
          onCopy={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onCut={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onContextMenu={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-task-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[32rem] flex-col overflow-hidden rounded-[2rem] border border-[#0F3A53]/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FFA500]">
                  Atenção
                </p>
                <h2
                  id="delete-task-dialog-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Tem certeza que deseja excluir esse card?
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Essa é uma ação irreversível.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeleteTaskConfirm}
                aria-label="Fechar confirmação de exclusão"
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-[1.4rem] border border-panel-border bg-panel-surface-muted/70 p-4 select-none">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Card selecionado
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {deleteTargetTask.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Digite o título em maiúsculo para confirmar a exclusão.
                </p>
                <p className="mt-4 rounded-2xl border border-panel-border bg-panel-surface px-4 py-3 text-sm font-semibold tracking-[0.16em] text-foreground">
                  {deleteTaskConfirmationTarget}
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Confirmação
                </span>
                <input
                  value={deleteConfirmationValue}
                  onChange={(event) =>
                    setDeleteConfirmationValue(event.target.value.toUpperCase())
                  }
                  placeholder={deleteTaskConfirmationTarget}
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeDeleteTaskConfirm}
                className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                Cancelar operação
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={!deleteTaskConfirmationMatches}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function KanbanBacklogPage() {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<"Todos" | TaskPriority>("Todos");
  const [assignee, setAssignee] = useState("Todos");
  const [team, setTeam] = useState("Todos");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addedToSprint, setAddedToSprint] = useState<Record<string, string>>({});
  const [sprintPopover, setSprintPopover] = useState<{ task: Task; rect: DOMRect } | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [removeTargetTask, setRemoveTargetTask] = useState<Task | null>(null);
  const [removeConfirmValue, setRemoveConfirmValue] = useState("");

  const removeTaskConfirmTarget = removeTargetTask?.title.toUpperCase() ?? "";
  const removeTaskConfirmMatches =
    removeTargetTask !== null && removeConfirmValue.trim() === removeTaskConfirmTarget;

  const filtered = useMemo(
    () =>
      localTasks.filter((task) => {
        const matchesQuery =
          query.trim().length === 0 ||
          `${task.title} ${task.description} ${task.client} ${task.project}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
        const matchesPriority = priority === "Todos" || task.priority === priority;
        const matchesAssignee = assignee === "Todos" || task.assignee === assignee;
        const matchesTeam = team === "Todos" || task.team === team;

        return matchesQuery && matchesPriority && matchesAssignee && matchesTeam && task.status === "Backlog";
      }),
    [assignee, priority, query, team, localTasks],
  );

  const uniqueAssignees = useMemo(
    () => Array.from(new Set(localTasks.map((t) => t.assignee))).sort(),
    [localTasks],
  );

  const uniqueTeams = useMemo(
    () => Array.from(new Set(localTasks.map((t) => t.team))).sort(),
    [localTasks],
  );

  function openRemoveConfirm(task: Task) {
    setRemoveTargetTask(task);
    setRemoveConfirmValue("");
  }

  function closeRemoveConfirm() {
    setRemoveTargetTask(null);
    setRemoveConfirmValue("");
  }

  function handleRemoveTask() {
    if (!removeTaskConfirmMatches || !removeTargetTask) return;
    setLocalTasks((prev) => prev.filter((t) => t.id !== removeTargetTask.id));
    setAddedToSprint((prev) => {
      const next = { ...prev };
      delete next[removeTargetTask.id];
      return next;
    });
    closeRemoveConfirm();
  }

  const availableSprints = sprints.filter((s) => parseIsoDate(s.endDate) >= new Date());

  function openSprintPopover(task: Task, rect: DOMRect) {
    setSprintPopover({ task, rect });
  }

  function closeSprintPopover() {
    setSprintPopover(null);
  }

  function handleSelectSprint(sprintName: string) {
    if (!sprintPopover) return;
    const taskId = sprintPopover.task.id;
    setAddedToSprint((prev) => ({ ...prev, [taskId]: sprintName }));
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: "Aprovado" as TaskStatus, statusLabel: defaultStatusLabels.Aprovado }
          : t,
      ),
    );
    closeSprintPopover();
  }

  const priorityFilters: Array<{ label: string; value: "Todos" | TaskPriority }> = [
    { label: "Todos", value: "Todos" },
    { label: "Baixa", value: "Baixa" },
    { label: "Média", value: "Média" },
    { label: "Alta", value: "Alta" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kanban"
        title="Backlog"
        description="Lista priorizada de itens ainda não puxados para sprint, com filtros e ação simulada."
        breadcrumbs={[
          { href: "/kanban", label: "Kanban" },
          { label: "Backlog" },
        ]}
        actions={
          <Link
            href="/kanban/sprints"
            className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
          >
            Ver sprint atual
          </Link>
        }
      />

      <div className="space-y-3 rounded-[1.6rem] border border-border bg-surface p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Filtros
        </p>

        <label className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3">
          <span
            aria-hidden="true"
            className="shrink-0 rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-semibold text-foreground"
          >
            Buscar
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar tarefa, cliente, projeto ou etiqueta"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {priorityFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setPriority(filter.value)}
              className={[
                "rounded-full border px-3 py-2 text-xs font-semibold transition",
                priority === filter.value
                  ? "border-accent/25 bg-accent/10 text-foreground"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {filter.label}
            </button>
          ))}

          <div className="ml-auto flex flex-wrap gap-2">
            <select
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              className="rounded-full border border-border bg-surface-2 px-4 py-2 pr-3 text-sm font-semibold text-foreground outline-none"
            >
              <option value="Todos">Nomes</option>
              {uniqueAssignees.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={team}
              onChange={(event) => setTeam(event.target.value)}
              className="rounded-full border border-border bg-surface-2 px-4 py-2 pr-3 text-sm font-semibold text-foreground outline-none"
            >
              <option value="Todos">Equipes</option>
              {uniqueTeams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <DataTable
        items={filtered}
        getKey={(task) => task.id}
        selectedKey={selectedTask?.id}
        onRowClick={setSelectedTask}
        columns={[
          {
            header: "Cards",
            cell: (task: Task) => (
              <div>
                <p className="font-semibold text-foreground">{task.title}</p>
                {task.subtitle ? (
                  <p className="mt-1 text-sm text-muted-foreground">{task.subtitle}</p>
                ) : null}
              </div>
            ),
            className: "min-w-[20rem]",
          },
          {
            header: "Quadro / Projeto",
            cell: (task: Task) => (
              <div>
                <p className="font-medium text-foreground">
                  {boards.find((b) => b.id === task.board)?.name ?? task.board}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{task.project}</p>
              </div>
            ),
          },
          {
            header: "Responsável",
            cell: (task: Task) => <Pill>{task.assignee}</Pill>,
          },
          {
            header: "",
            cell: (task: Task) => (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (addedToSprint[task.id]) return;
                    openSprintPopover(task, event.currentTarget.getBoundingClientRect());
                  }}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    addedToSprint[task.id]
                      ? "border-[#279890]/30 bg-[#279890]/10 text-[#7AD6D3] cursor-default"
                      : "border-accent/25 bg-accent/10 text-foreground hover:bg-accent/15",
                  ].join(" ")}
                >
                  {addedToSprint[task.id] ? addedToSprint[task.id] : "Adicionar à sprint"}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openRemoveConfirm(task);
                  }}
                  className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface"
                >
                  Remover
                </button>
              </div>
            ),
          },
        ]}
      />

      <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />

      {sprintPopover ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeSprintPopover}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sprint-select-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[32rem] flex-col overflow-hidden rounded-[2rem] border border-[#0F3A53]/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Backlog
                </p>
                <h2
                  id="sprint-select-dialog-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Adicionar à sprint
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Selecione uma sprint aberta ou futura para receber este card.
                </p>
              </div>
              <button
                type="button"
                onClick={closeSprintPopover}
                aria-label="Fechar seleção de sprint"
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-4 select-none rounded-[1.4rem] border border-panel-border bg-panel-surface-muted/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Card
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {sprintPopover.task.title}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {availableSprints.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">
                  Nenhuma sprint disponível no momento.
                </p>
              ) : (
                availableSprints.map((sprint) => (
                  <button
                    key={sprint.name}
                    type="button"
                    onClick={() => handleSelectSprint(sprint.name)}
                    className="w-full rounded-[1.4rem] border border-panel-border bg-panel-surface-muted/70 p-4 text-left transition hover:border-accent/25 hover:bg-accent/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {sprint.name}
                      </span>
                      <span className="shrink-0 rounded-full border border-panel-border bg-panel-surface px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {sprint.goal}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-surface">
                        <div
                          className="h-full rounded-full bg-accent/60"
                          style={{ width: `${sprint.progress}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                        {sprint.progress}%
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeSprintPopover}
                className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                Cancelar
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {removeTargetTask ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeRemoveConfirm}
          onCopy={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onCut={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onContextMenu={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-task-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[32rem] flex-col overflow-hidden rounded-[2rem] border border-[#0F3A53]/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FFA500]">
                  Atenção
                </p>
                <h2
                  id="remove-task-dialog-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Tem certeza que deseja remover esse card do backlog?
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Essa é uma ação irreversível.
                </p>
              </div>
              <button
                type="button"
                onClick={closeRemoveConfirm}
                aria-label="Fechar confirmação de remoção"
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="select-none rounded-[1.4rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Card selecionado
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {removeTargetTask.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Digite o título em maiúsculo para confirmar a remoção.
                </p>
                <p className="mt-4 rounded-2xl border border-panel-border bg-panel-surface px-4 py-3 text-sm font-semibold tracking-[0.16em] text-foreground">
                  {removeTaskConfirmTarget}
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Confirmação
                </span>
                <input
                  value={removeConfirmValue}
                  onChange={(event) => setRemoveConfirmValue(event.target.value.toUpperCase())}
                  placeholder={removeTaskConfirmTarget}
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeRemoveConfirm}
                className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                Cancelar operação
              </button>
              <button
                type="button"
                onClick={handleRemoveTask}
                disabled={!removeTaskConfirmMatches}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}


export function KanbanSprintsPage() {
  const [localSprints, setLocalSprints] = useState<Sprint[]>(() =>
    sprints.map((sprint) => ({
      ...sprint,
      goals: [...sprint.goals],
      burndown: [...sprint.burndown],
      meetings: sprint.meetings.map((meeting) => ({
        ...meeting,
        responsibles: [...meeting.responsibles],
        teams: [...meeting.teams],
      })),
    })),
  );
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(() => getDefaultSprintId(sprints));
  const [draggedSprintId, setDraggedSprintId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<SprintStatus | null>(null);
  const [sprintFormDraft, setSprintFormDraft] = useState<SprintFormDraft | null>(null);
  const [sprintMoveTargetId, setSprintMoveTargetId] = useState<string | null>(null);
  const [sprintFinalizeTargetId, setSprintFinalizeTargetId] = useState<string | null>(null);
  const [sprintDeleteTargetId, setSprintDeleteTargetId] = useState<string | null>(null);
  const [sprintDeleteConfirmValue, setSprintDeleteConfirmValue] = useState("");
  const [meetingDraft, setMeetingDraft] = useState<SprintMeetingFormDraft | null>(null);
  const [meetingTargetSprintId, setMeetingTargetSprintId] = useState<string | null>(null);

  useEffect(() => {
    if (!localSprints.length) {
      if (selectedSprintId !== null) {
        setSelectedSprintId(null);
      }
      return;
    }

    if (selectedSprintId && localSprints.some((sprint) => sprint.id === selectedSprintId)) {
      return;
    }

    const nextSelectedSprintId = getDefaultSprintId(localSprints);

    if (nextSelectedSprintId !== selectedSprintId) {
      setSelectedSprintId(nextSelectedSprintId);
    }
  }, [localSprints, selectedSprintId]);

  const selectedSprint = selectedSprintId
    ? localSprints.find((sprint) => sprint.id === selectedSprintId) ?? null
    : null;
  const moveTargetSprint = sprintMoveTargetId
    ? localSprints.find((sprint) => sprint.id === sprintMoveTargetId) ?? null
    : null;
  const finalizeTargetSprint = sprintFinalizeTargetId
    ? localSprints.find((sprint) => sprint.id === sprintFinalizeTargetId) ?? null
    : null;
  const deleteTargetSprint = sprintDeleteTargetId
    ? localSprints.find((sprint) => sprint.id === sprintDeleteTargetId) ?? null
    : null;
  const meetingTargetSprint = meetingTargetSprintId
    ? localSprints.find((sprint) => sprint.id === meetingTargetSprintId) ?? null
    : selectedSprint;

  const sprintDeleteConfirmMatches = deleteTargetSprint
    ? sprintDeleteConfirmValue.trim().toUpperCase() === deleteTargetSprint.name.toUpperCase()
    : false;

  const sprintColumns = useMemo(
    () =>
      sprintStatusOrder.map((status) => ({
        status,
        sprints: localSprints
          .filter((sprint) => sprint.status === status)
          .sort((left, right) => parseIsoDate(left.startDate).getTime() - parseIsoDate(right.startDate).getTime()),
      })),
    [localSprints],
  );

  const remainingSprints = useMemo(
    () =>
      localSprints
        .filter((sprint) => sprint.id !== selectedSprint?.id)
        .sort((left, right) => parseIsoDate(left.startDate).getTime() - parseIsoDate(right.startDate).getTime()),
    [localSprints, selectedSprint?.id],
  );

  const sprintFormCanSave = Boolean(
    sprintFormDraft &&
      sprintFormDraft.name.trim() &&
      sprintFormDraft.startDate &&
      sprintFormDraft.endDate &&
      sprintFormDraft.goal.trim() &&
      parseIsoDate(sprintFormDraft.startDate).getTime() <= parseIsoDate(sprintFormDraft.endDate).getTime(),
  );

  const meetingFormCanSave = Boolean(
    meetingDraft &&
      meetingTargetSprint &&
      meetingDraft.date &&
      meetingDraft.time &&
      meetingDraft.type,
  );

  function openCreateSprintDialog() {
    setSprintFormDraft(createSprintFormDraft());
  }

  function openEditSprintDialog(sprint: Sprint) {
    setSprintFormDraft(createSprintFormDraft(sprint));
  }

  function closeSprintFormDialog() {
    setSprintFormDraft(null);
  }

  function saveSprintFormDraft() {
    if (!sprintFormDraft || !sprintFormCanSave) {
      return;
    }

    const nextGoals = splitCommaSeparatedValues(sprintFormDraft.goals.replace(/\n+/g, ","));
    const normalizedGoals = nextGoals.length ? nextGoals : [sprintFormDraft.goal.trim()];
    const existingSprint = sprintFormDraft.id
      ? localSprints.find((sprint) => sprint.id === sprintFormDraft.id) ?? null
      : null;
    const status = existingSprint?.status ?? "Backlog";
    const progress = existingSprint?.progress ?? 0;

    const nextSprint: Sprint = {
      id: sprintFormDraft.id ?? createId("sprint"),
      name: sprintFormDraft.name.trim(),
      startDate: sprintFormDraft.startDate,
      endDate: sprintFormDraft.endDate,
      status,
      goal: sprintFormDraft.goal.trim(),
      progress,
      burndown: createSprintBurndown(progress),
      goals: normalizedGoals,
      meetings: existingSprint?.meetings ?? [],
    };

    setLocalSprints((current) =>
      sprintFormDraft.id
        ? current.map((sprint) => (sprint.id === sprintFormDraft.id ? nextSprint : sprint))
        : [...current, nextSprint],
    );
    setSelectedSprintId(nextSprint.id);
    closeSprintFormDialog();
  }

  function openMoveSprintDialog(sprint: Sprint) {
    setSprintMoveTargetId(sprint.id);
  }

  function closeMoveSprintDialog() {
    setSprintMoveTargetId(null);
  }

  function handleMoveSprint(status: SprintStatus) {
    if (!moveTargetSprint) {
      return;
    }

    setLocalSprints((current) =>
      current.map((sprint) => (sprint.id === moveTargetSprint.id ? { ...sprint, status } : sprint)),
    );
    closeMoveSprintDialog();
  }

  function openFinalizeSprintConfirm(sprint: Sprint) {
    setSprintFinalizeTargetId(sprint.id);
    closeMoveSprintDialog();
  }

  function closeFinalizeSprintConfirm() {
    setSprintFinalizeTargetId(null);
  }

  function handleFinalizeSprint() {
    if (!finalizeTargetSprint) {
      return;
    }

    setLocalSprints((current) => current.filter((sprint) => sprint.id !== finalizeTargetSprint.id));
    closeFinalizeSprintConfirm();
  }

  function openDeleteSprintDialog(sprint: Sprint) {
    setSprintDeleteTargetId(sprint.id);
    setSprintDeleteConfirmValue("");
  }

  function closeDeleteSprintDialog() {
    setSprintDeleteTargetId(null);
    setSprintDeleteConfirmValue("");
  }

  function handleDeleteSprint() {
    if (!deleteTargetSprint || !sprintDeleteConfirmMatches) {
      return;
    }

    setLocalSprints((current) => current.filter((sprint) => sprint.id !== deleteTargetSprint.id));
    closeDeleteSprintDialog();
  }

  function openCreateMeetingDialog() {
    if (!selectedSprint) {
      return;
    }

    setMeetingTargetSprintId(selectedSprint.id);
    setMeetingDraft(createSprintMeetingFormDraft());
  }

  function closeMeetingDialog() {
    setMeetingDraft(null);
    setMeetingTargetSprintId(null);
  }

  function saveMeetingDraft() {
    if (!meetingDraft || !meetingFormCanSave || !meetingTargetSprint) {
      return;
    }

    const title = meetingDraft.title.trim() || `${meetingDraft.type} · ${formatDate(meetingDraft.date)}`;
    const responsibles = splitCommaSeparatedValues(meetingDraft.responsibles);
    const teams = splitCommaSeparatedValues(meetingDraft.teams);
    const meeting: SprintMeeting = {
      id: createId("meeting"),
      title,
      date: meetingDraft.date,
      time: meetingDraft.time,
      type: meetingDraft.type as SprintMeetingType,
      audience: meetingDraft.audience,
      responsibles,
      teams,
      calendarEventId: `calendar-${createId("event")}`,
      googleMeetUrl: `https://meet.google.com/${createId("meet")}`,
    };

    setLocalSprints((current) =>
      current.map((sprint) =>
        sprint.id === meetingTargetSprint.id
          ? { ...sprint, meetings: [meeting, ...sprint.meetings] }
          : sprint,
      ),
    );
    closeMeetingDialog();
  }

  function handleSprintDragStart(sprint: Sprint, event: DragEvent<HTMLElement>) {
    setDraggedSprintId(sprint.id);
    event.dataTransfer.setData("text/plain", sprint.id);
    event.dataTransfer.effectAllowed = "move";
  }

  function handleSprintDragEnd() {
    setDraggedSprintId(null);
    setDragOverStatus(null);
  }

  function handleSprintColumnDragOver(status: SprintStatus, event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragOverStatus(status);
  }

  function handleSprintColumnDrop(status: SprintStatus, event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const sprintId = event.dataTransfer.getData("text/plain") || draggedSprintId;

    if (!sprintId) {
      return;
    }

    setLocalSprints((current) =>
      current.map((sprint) => (sprint.id === sprintId ? { ...sprint, status } : sprint)),
    );
    setDraggedSprintId(null);
    setDragOverStatus(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kanban"
        title="Sprints"
        description="Seção designada ao gerenciamento de Sprints."
        breadcrumbs={[
          { href: "/kanban", label: "Kanban" },
          { label: "Sprints" },
        ]}
      />

      <SectionCard
        title="Gerenciador de Sprints"
        description="Cards pequenos, colunas fixas e interação de sprint por estado."
        action={
          <button
            type="button"
            onClick={openCreateSprintDialog}
            className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
          >
            Adicionar sprint
          </button>
        }
      >
        {localSprints.length ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {sprintColumns.map((column) => (
              <section
                key={column.status}
                aria-labelledby={`sprint-column-${column.status.replace(/\s+/g, "-").toLowerCase()}`}
                onDragOver={(event) => handleSprintColumnDragOver(column.status, event)}
                onDrop={(event) => handleSprintColumnDrop(column.status, event)}
                className={[
                  "flex min-h-[18rem] flex-col rounded-[1.4rem] border p-4 transition",
                  dragOverStatus === column.status
                    ? "border-accent/40 bg-accent/10 shadow-sm"
                    : "border-border bg-surface-2",
                ].join(" ")}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3
                      id={`sprint-column-${column.status.replace(/\s+/g, "-").toLowerCase()}`}
                      className="text-sm font-semibold tracking-tight text-foreground"
                    >
                      {column.status}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Coluna fixa do gerenciador
                    </p>
                  </div>
                  <Pill tone={sprintStatusTone[column.status]}>{column.sprints.length}</Pill>
                </div>

                <div className="flex flex-1 flex-col gap-3">
                  {column.sprints.length ? (
                    column.sprints.map((sprint) => {
                      const isSelected = selectedSprint?.id === sprint.id;
                      const isDragging = draggedSprintId === sprint.id;

                      return (
                        <article
                          key={sprint.id}
                          draggable
                          onDragStart={(event) => handleSprintDragStart(sprint, event)}
                          onDragEnd={handleSprintDragEnd}
                          className={[
                            "overflow-hidden rounded-[1.25rem] border bg-surface p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                            isSelected ? "border-accent/35 ring-1 ring-accent/25" : "border-border",
                            isDragging ? "opacity-60" : "",
                          ].join(" ")}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedSprintId(sprint.id)}
                            aria-label={`Abrir sprint ${sprint.name}`}
                            className="block w-full text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="relative h-12 w-12 shrink-0 rounded-full border border-border bg-surface-2 p-1"
                                style={{
                                  backgroundImage: `conic-gradient(#7AD6D3 0 ${Math.min(
                                    100,
                                    Math.max(0, sprint.progress),
                                  )}%, rgba(164,198,225,0.16) ${Math.min(100, Math.max(0, sprint.progress))}% 100%)`,
                                }}
                              >
                                <div className="flex h-full w-full items-center justify-center rounded-full border border-border bg-surface text-[10px] font-semibold text-foreground">
                                  {sprint.progress}%
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                                      {sprint.name}
                                    </p>
                                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                      {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                                    </p>
                                  </div>
                                  <Pill tone={sprintStatusTone[sprint.status]}>{sprint.status}</Pill>
                                </div>
                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                  {sprint.goal}
                                </p>
                              </div>
                            </div>
                          </button>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {sprint.status === "Concluído" ? (
                              <button
                                type="button"
                                onClick={() => openFinalizeSprintConfirm(sprint)}
                                className="rounded-full border border-[#279890]/25 bg-[#279890]/10 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-[#279890]/15"
                              >
                                Concluído
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditSprintDialog(sprint)}
                                  className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface"
                                >
                                  Editar sprint
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openMoveSprintDialog(sprint)}
                                  className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface"
                                >
                                  Mover
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteSprintDialog(sprint)}
                                  className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface"
                                >
                                  Excluir
                                </button>
                              </>
                            )}
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="flex min-h-40 flex-1 items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
                      Nenhum sprint nesta coluna
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum sprint cadastrado"
            description="Crie o primeiro sprint para começar a organizar backlog, andamento e conclusão."
            action={
              <button
                type="button"
                onClick={openCreateSprintDialog}
                className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                Adicionar sprint
              </button>
            }
          />
        )}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)]">
        <div className="min-w-0 space-y-6">
          <SectionCard
            title="Sprint atual"
            description="Dados preenchidos a partir do sprint selecionado no gerenciador."
            className="w-full"
            action={
              selectedSprint ? (
                <button
                  type="button"
                  onClick={() => openEditSprintDialog(selectedSprint)}
                  className="rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface"
                >
                  Editar sprint
                </button>
              ) : null
            }
          >
            {selectedSprint ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start gap-4">
                  <div
                    className="relative h-24 w-24 shrink-0 rounded-full border border-border bg-surface-2 p-2"
                    style={{
                      backgroundImage: `conic-gradient(#7AD6D3 0 ${Math.min(
                        100,
                        Math.max(0, selectedSprint.progress),
                      )}%, rgba(164,198,225,0.16) ${Math.min(
                        100,
                        Math.max(0, selectedSprint.progress),
                      )}% 100%)`,
                    }}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-foreground">
                      {selectedSprint.progress}%
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={sprintStatusTone[selectedSprint.status]}>{selectedSprint.status}</Pill>
                      <Pill>{selectedSprint.meetings.length} reuniões</Pill>
                      <Pill>{selectedSprint.goals.length} metas</Pill>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {formatLongDate(selectedSprint.startDate)} - {formatLongDate(selectedSprint.endDate)}
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        {selectedSprint.name}
                      </h2>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {selectedSprint.goal}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.25rem] border border-border bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Nome
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {selectedSprint.name}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-border bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Início
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {formatLongDate(selectedSprint.startDate)}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-border bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Finalização
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {formatLongDate(selectedSprint.endDate)}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-border bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Meta principal
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {selectedSprint.goal}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Nenhum sprint selecionado"
                description="Selecione um card no gerenciador para preencher os dados desta área."
              />
            )}
          </SectionCard>

          <SectionCard title="Metas da sprint" description="Itens estratégicos em execução">
            {selectedSprint ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedSprint.goals.map((goal) => (
                  <div
                    key={goal}
                    className="rounded-[1.25rem] border border-border bg-surface-2 px-4 py-3"
                  >
                    <p className="text-sm leading-6 text-foreground">{goal}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Sem metas para exibir"
                description="Selecione um sprint para ver as metas estratégicas associadas."
              />
            )}
          </SectionCard>

          <SectionCard
            title="Sprints Meetings"
            description="Eventos da sprint vinculados ao calendário e preparados para Google Meet."
            action={
              <button
                type="button"
                onClick={openCreateMeetingDialog}
                disabled={!selectedSprint}
                className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Criar meeting
              </button>
            }
          >
            {selectedSprint ? (
              selectedSprint.meetings.length ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {selectedSprint.meetings.map((meeting) => (
                    <article
                      key={meeting.id}
                      className="rounded-[1.25rem] border border-border bg-surface-2 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold tracking-tight text-foreground">
                            {meeting.title}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            {formatLongDate(meeting.date)} · {meeting.time}
                          </p>
                        </div>
                        <Pill tone={sprintMeetingTypeTone[meeting.type]}>{meeting.type}</Pill>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Pill tone="accent">{meeting.audience}</Pill>
                        <Pill>{meeting.calendarEventId}</Pill>
                        <Pill>Google Meet</Pill>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            {meeting.audience === "Responsáveis" ? "Responsáveis" : "Equipes"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(meeting.audience === "Responsáveis" ? meeting.responsibles : meeting.teams).length ? (
                              (meeting.audience === "Responsáveis" ? meeting.responsibles : meeting.teams).map((item) => (
                                <Pill key={`${meeting.id}-${item}`}>{item}</Pill>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">Sem vínculos definidos</span>
                            )}
                          </div>
                        </div>
                        <p className="break-all text-xs leading-5 text-muted-foreground">
                          {meeting.googleMeetUrl}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Sem meetings nesta sprint"
                  description="Use o botão de criar para registrar planejamento, daily, review ou retrospective."
                />
              )
            ) : (
              <EmptyState
                title="Sem sprint selecionado"
                description="Escolha um sprint acima para liberar a criação e visualização dos meetings."
              />
            )}
          </SectionCard>
        </div>

        <div className="min-w-0 space-y-6">
          <SectionCard title="Burndown mockado" description="Curva simples para leitura operacional">
            {selectedSprint ? (
              <>
                <MiniChart
                  title="Remaining work"
                  items={selectedSprint.burndown.map((value, index) => ({
                    label: String(index + 1),
                    value,
                  }))}
                />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Ritmo
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">+12%</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      aumento de cards concluídos em relação à sprint anterior
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Previsão
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">83%</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      probabilidade de fechamento da sprint sem estouro
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                title="Sem burndown"
                description="Selecione um sprint para visualizar o gráfico de trabalho restante."
              />
            )}
          </SectionCard>

          <SectionCard title="Próximas sprints" description="Resumo de preparação">
            <div className="space-y-4">
              {remainingSprints.length ? (
                remainingSprints.map((sprint) => (
                  <article
                    key={sprint.id}
                    className="rounded-[1.25rem] border border-border bg-surface-2 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                          {sprint.name}
                        </h3>
                      </div>
                      <Pill tone={sprintStatusTone[sprint.status]}>{sprint.status}</Pill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {sprint.goal}
                    </p>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Sem próximas sprints"
                  description="Quando houver mais sprints cadastradas, elas aparecerão aqui como resumo."
                />
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {sprintFormDraft ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeSprintFormDialog}
          onCopy={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onCut={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onContextMenu={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sprint-form-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[42rem] flex-col overflow-hidden rounded-[2rem] border border-[#0F3A53]/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Sprint
                </p>
                <h2
                  id="sprint-form-dialog-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  {sprintFormDraft.id ? "Editar sprint" : "Novo sprint"}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Preencha apenas o que for necessário e salve para manter o card no gerenciador.
                </p>
              </div>
              <button
                type="button"
                onClick={closeSprintFormDialog}
                aria-label="Fechar editor de sprint"
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Nome
                </span>
                <input
                  value={sprintFormDraft.name}
                  onChange={(event) =>
                    setSprintFormDraft((current) =>
                      current ? { ...current, name: event.target.value } : current,
                    )
                  }
                  placeholder="Sprint 21"
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Início
                </span>
                <input
                  type="date"
                  value={sprintFormDraft.startDate}
                  onChange={(event) =>
                    setSprintFormDraft((current) =>
                      current ? { ...current, startDate: event.target.value } : current,
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Finalização
                </span>
                <input
                  type="date"
                  value={sprintFormDraft.endDate}
                  onChange={(event) =>
                    setSprintFormDraft((current) =>
                      current ? { ...current, endDate: event.target.value } : current,
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Meta principal
                </span>
                <textarea
                  value={sprintFormDraft.goal}
                  onChange={(event) =>
                    setSprintFormDraft((current) =>
                      current ? { ...current, goal: event.target.value } : current,
                    )
                  }
                  rows={3}
                  placeholder="Descrição curta do objetivo da sprint"
                  className="mt-2 w-full rounded-[1.4rem] border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Metas em execução
                </span>
                <textarea
                  value={sprintFormDraft.goals}
                  onChange={(event) =>
                    setSprintFormDraft((current) =>
                      current ? { ...current, goals: event.target.value } : current,
                    )
                  }
                  rows={4}
                  placeholder="Uma meta por linha"
                  className="mt-2 w-full rounded-[1.4rem] border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeSprintFormDialog}
                className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveSprintFormDraft}
                disabled={!sprintFormCanSave}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {meetingDraft ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeMeetingDialog}
          onCopy={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onCut={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onContextMenu={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="meeting-form-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[42rem] flex-col overflow-hidden rounded-[2rem] border border-[#0F3A53]/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Evento
                </p>
                <h2
                  id="meeting-form-dialog-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Novo meeting
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  O evento fica associado ao sprint atual e preparado para calendário e Google Meet.
                </p>
              </div>
              <button
                type="button"
                onClick={closeMeetingDialog}
                aria-label="Fechar editor de meeting"
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Título
                </span>
                <input
                  value={meetingDraft.title}
                  onChange={(event) =>
                    setMeetingDraft((current) =>
                      current ? { ...current, title: event.target.value } : current,
                    )
                  }
                  placeholder="Sprint Planning"
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Dia
                </span>
                <input
                  type="date"
                  value={meetingDraft.date}
                  onChange={(event) =>
                    setMeetingDraft((current) =>
                      current ? { ...current, date: event.target.value } : current,
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Horário
                </span>
                <input
                  type="time"
                  value={meetingDraft.time}
                  onChange={(event) =>
                    setMeetingDraft((current) =>
                      current ? { ...current, time: event.target.value } : current,
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Tipo obrigatório
                </span>
                <select
                  value={meetingDraft.type}
                  onChange={(event) =>
                    setMeetingDraft((current) =>
                      current
                        ? { ...current, type: event.target.value as SprintMeetingType | "" }
                        : current,
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">Selecionar tipo</option>
                  {(["Sprint Planning", "Daily Scrum", "Sprint Review", "Sprint Retrospective"] as SprintMeetingType[]).map(
                    (type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <fieldset className="sm:col-span-2">
                <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Vincular por
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["Responsáveis", "Equipes"] as SprintMeetingAudience[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setMeetingDraft((current) =>
                          current ? { ...current, audience: option } : current,
                        )
                      }
                      className={[
                        "rounded-full border px-3 py-2 text-xs font-semibold transition",
                        meetingDraft.audience === option
                          ? "border-accent/25 bg-accent/10 text-foreground"
                          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Responsáveis
                </span>
                <textarea
                  value={meetingDraft.responsibles}
                  onChange={(event) =>
                    setMeetingDraft((current) =>
                      current ? { ...current, responsibles: event.target.value } : current,
                    )
                  }
                  rows={3}
                  placeholder="Matheus Barcellos, Larissa"
                  className="mt-2 w-full rounded-[1.4rem] border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Equipes
                </span>
                <textarea
                  value={meetingDraft.teams}
                  onChange={(event) =>
                    setMeetingDraft((current) =>
                      current ? { ...current, teams: event.target.value } : current,
                    )
                  }
                  rows={3}
                  placeholder="Produto, Design"
                  className="mt-2 w-full rounded-[1.4rem] border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            </div>

            {meetingTargetSprint ? (
              <div className="mt-4 rounded-[1.25rem] border border-panel-border bg-panel-surface-muted/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Sprint vinculada
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {meetingTargetSprint.name}
                </p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeMeetingDialog}
                className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveMeetingDraft}
                disabled={!meetingFormCanSave}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {moveTargetSprint ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeMoveSprintDialog}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="move-sprint-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[32rem] flex-col overflow-hidden rounded-[2rem] border border-[#0F3A53]/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Sprint
                </p>
                <h2
                  id="move-sprint-dialog-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Mover sprint
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Escolha a coluna fixa de destino para este sprint.
                </p>
              </div>
              <button
                type="button"
                onClick={closeMoveSprintDialog}
                aria-label="Fechar mover sprint"
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-4 select-none rounded-[1.4rem] border border-panel-border bg-panel-surface-muted/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Sprint
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{moveTargetSprint.name}</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {sprintStatusOrder.map((status) => {
                const active = moveTargetSprint.status === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleMoveSprint(status)}
                    disabled={active}
                    className={[
                      "rounded-[1.25rem] border px-4 py-4 text-left transition",
                      active
                        ? "cursor-not-allowed border-border bg-surface-2 text-muted-foreground"
                        : "border-border bg-surface hover:bg-surface-2",
                    ].join(" ")}
                    >
                      <p className="text-sm font-semibold text-foreground">{status}</p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {active ? "Coluna atual" : "Mover para esta coluna"}
                      </p>
                    </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      {finalizeTargetSprint ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeFinalizeSprintConfirm}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="finalize-sprint-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[30rem] flex-col overflow-hidden rounded-[2rem] border border-panel-border bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Conclusão
              </p>
              <h2
                id="finalize-sprint-dialog-title"
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                Tem certeza que deseja concluir?
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {finalizeTargetSprint.name}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeFinalizeSprintConfirm}
                className="rounded-2xl border border-[#FFA500]/30 bg-[#FFA500]/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-[#FFA500]/15 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/25"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinalizeSprint}
                className="rounded-2xl border border-accent/25 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Confirmar
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteTargetSprint ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/55 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
          onClick={closeDeleteSprintDialog}
          onCopy={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onCut={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
          onContextMenu={(event) => {
            const target = event.target as HTMLElement | null;

            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLTextAreaElement ||
              target instanceof HTMLSelectElement
            ) {
              return;
            }

            event.preventDefault();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-sprint-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-[32rem] flex-col overflow-hidden rounded-[2rem] border border-[#0F3A53]/35 bg-panel-surface p-5 shadow-[0_32px_80px_hsl(var(--background)/0.45)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FFA500]">
                  Atenção
                </p>
                <h2
                  id="delete-sprint-dialog-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Tem certeza que deseja excluir esse sprint?
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Essa é uma ação irreversível.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeleteSprintDialog}
                aria-label="Fechar confirmação de exclusão"
                className="inline-flex items-center justify-center rounded-full border border-panel-border bg-panel-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-panel-surface focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="select-none rounded-[1.4rem] border border-panel-border bg-panel-surface-muted/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Sprint selecionada
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">{deleteTargetSprint.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Digite o nome em maiúsculo para confirmar a exclusão.
                </p>
                <p className="mt-4 rounded-2xl border border-panel-border bg-panel-surface px-4 py-3 text-sm font-semibold tracking-[0.16em] text-foreground">
                  {deleteTargetSprint.name.toUpperCase()}
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Confirmação
                </span>
                <input
                  value={sprintDeleteConfirmValue}
                  onChange={(event) => setSprintDeleteConfirmValue(event.target.value.toUpperCase())}
                  placeholder={deleteTargetSprint.name.toUpperCase()}
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-2 w-full rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-panel-border pt-4">
              <button
                type="button"
                onClick={closeDeleteSprintDialog}
                className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteSprint}
                disabled={!sprintDeleteConfirmMatches}
                className="rounded-2xl border border-panel-border bg-panel-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-panel-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Excluir
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function KanbanTagsPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Placeholder: substituir pela resposta de GET /api/kanban/tags quando o backend estiver pronto
  const [tagData, setTagData] = useState<Tag[]>(tags);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    fetch("/api/kanban/tags")
      .then((res) => {
        if (!res.ok) throw new Error("fetch_failed");
        return res.json() as Promise<Tag[]>;
      })
      .then((data) => {
        if (!cancelled) setTagData(data);
      })
      .catch(() => {
        if (!cancelled) setFetchError(true);
        // mantém os dados de placeholder já carregados
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTags = useMemo(
    () =>
      tagData.filter((tag) => {
        const matchesSearch = `${tag.name} ${tag.context}`
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        const matchesTag = activeTag === null || tag.name === activeTag;
        return matchesSearch && matchesTag;
      }),
    [search, activeTag, tagData],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kanban"
        title="Etiquetas"
        description="Tags operacionais que atravessam tarefas, campanhas, finanças e documentação."
        breadcrumbs={[
          { href: "/kanban", label: "Kanban" },
          { label: "Etiquetas" },
        ]}
      />

      <div className="space-y-3 rounded-[1.6rem] border border-border bg-surface p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Filtros
        </p>

        <label className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3">
          <span
            aria-hidden="true"
            className="shrink-0 rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-semibold text-foreground"
          >
            Buscar
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar etiqueta ou contexto"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={[
              "rounded-full border px-3 py-2 text-xs font-semibold transition",
              activeTag === null
                ? "border-accent/25 bg-accent/10 text-foreground"
                : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Todos
          </button>
          {tagData.map((tag) => (
            <button
              key={tag.name}
              type="button"
              onClick={() => setActiveTag(activeTag === tag.name ? null : tag.name)}
              className={[
                "flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition",
                activeTag === tag.name
                  ? "border-accent/25 bg-accent/10 text-foreground"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Carregando etiquetas…</p>
        </div>
      ) : fetchError ? (
        <div className="rounded-[1.6rem] border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar as etiquetas. Exibindo dados locais.
          </p>
        </div>
      ) : null}

      {filteredTags.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTags.map((tag) => (
            <article
              key={tag.name}
              className="rounded-[1.6rem] border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
                    {tag.name}
                  </h2>
                </div>
                <Pill>{tag.usage} usos</Pill>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{tag.context}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill tone="accent">Kanban</Pill>
                <Pill>Financeiro</Pill>
                <Pill>Design</Pill>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma etiqueta encontrada"
          description="A busca ou o filtro ativo não encontrou correspondência."
        />
      )}

      <SectionCard title="Uso cruzado" description="Exemplo de presença em outros módulos">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Pill tone="accent">Urgente · LP Cliente Alpha</Pill>
          <Pill tone="accent">Interno · Hubs e ajustes</Pill>
          <Pill tone="warning">Bloqueado · Aprovação visual</Pill>
          <Pill tone="accent">Financeiro · DNS anual MQ</Pill>
        </div>
      </SectionCard>
    </div>
  );
}
