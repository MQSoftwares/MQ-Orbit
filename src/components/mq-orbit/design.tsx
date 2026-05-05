"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Drawer,
  EmptyState,
  FilterBar,
  PageHeader,
  Pill,
  ProgressBar,
  SectionCard,
  StatGrid,
  Timeline,
} from "@/components/mq-orbit/ui";

type DesignStatus = "Em andamento" | "Em revisão" | "Aprovado" | "Pausado";

type DesignProject = {
  id: string;
  name: string;
  client: string;
  stage: DesignStatus;
  deadline: string;
  owner: string;
  kind: string;
  progress: number;
};

type Briefing = {
  id: string;
  title: string;
  objective: string;
  audience: string;
  format: string;
  deadline: string;
  owner: string;
};

type Asset = {
  id: string;
  title: string;
  type: string;
  tag: string;
  source: string;
  updatedAt: string;
};

type Template = {
  id: string;
  title: string;
  format: string;
  status: "Pronto" | "Em revisão" | "Rascunho";
  useCase: string;
};

type Approval = {
  id: string;
  title: string;
  client: string;
  status: "Aguardando" | "Aprovado" | "Ajuste solicitado";
  owner: string;
  dueDate: string;
};

const projects: DesignProject[] = [
  { id: "dp1", name: "Rebranding PicBrand", client: "PicBrand", stage: "Em revisão", deadline: "24/04/2026", owner: "Bruna", kind: "Branding", progress: 78 },
  { id: "dp2", name: "LP Premium Cliente Alpha", client: "Landing Page Cliente Alpha", stage: "Em andamento", deadline: "26/04/2026", owner: "Marina", kind: "Landing page", progress: 61 },
  { id: "dp3", name: "Social Pack MQ", client: "MQSoftwares", stage: "Aprovado", deadline: "22/04/2026", owner: "Bia", kind: "Campanha", progress: 100 },
  { id: "dp4", name: "Identidade Casa Zeeni", client: "Casa Zeeni", stage: "Pausado", deadline: "29/04/2026", owner: "João", kind: "Identidade", progress: 34 },
];

const briefings: Briefing[] = [
  { id: "b1", title: "Rebranding PicBrand", objective: "Reposicionar a marca com linguagem mais premium e tecnológica.", audience: "Clientes e parceiros", format: "Brand kit", deadline: "24/04/2026", owner: "Bruna" },
  { id: "b2", title: "Landing Page Cliente Alpha", objective: "Converter leads com narrativa objetiva e foco em prova social.", audience: "Leads qualificados", format: "Landing page", deadline: "25/04/2026", owner: "Marina" },
  { id: "b3", title: "Campanha Institucional MQ", objective: "Reforçar a presença do hub interno como produto premium.", audience: "Equipe e mercado", format: "Social pack", deadline: "26/04/2026", owner: "Bia" },
];

const assets: Asset[] = [
  { id: "a1", title: "Logo oficial MQ Orbit", type: "Logo", tag: "MQSoftwares", source: "Marca", updatedAt: "Hoje" },
  { id: "a2", title: "Mockup cartão PicBrand", type: "Mockup", tag: "PicBrand", source: "Rebranding", updatedAt: "Ontem" },
  { id: "a3", title: "Banner campanha institucional", type: "Banner", tag: "MQSoftwares", source: "Marketing", updatedAt: "Ontem" },
  { id: "a4", title: "Capa apresentação comercial", type: "Apresentação", tag: "Comercial", source: "Proposta", updatedAt: "2 dias", },
  { id: "a5", title: "Identidade visual Casa Zeeni", type: "Brand kit", tag: "Casa Zeeni", source: "Cliente", updatedAt: "2 dias" },
  { id: "a6", title: "Ícone operacional MQ Orbit", type: "Ícone", tag: "MQ Orbit", source: "Sistema", updatedAt: "3 dias" },
];

const templates: Template[] = [
  { id: "t1", title: "Landing page", format: "Web", status: "Pronto", useCase: "Captação e conversão" },
  { id: "t2", title: "Post social", format: "1080x1080", status: "Em revisão", useCase: "Campanhas e anúncios" },
  { id: "t3", title: "Proposta comercial", format: "Doc", status: "Pronto", useCase: "Venda consultiva" },
  { id: "t4", title: "Apresentação institucional", format: "Deck", status: "Rascunho", useCase: "Reuniões e pitch" },
];

const approvals: Approval[] = [
  { id: "ap1", title: "Identidade PicBrand", client: "PicBrand", status: "Aguardando", owner: "Bruna", dueDate: "24/04/2026" },
  { id: "ap2", title: "LP Premium Cliente Alpha", client: "Landing Page Cliente Alpha", status: "Ajuste solicitado", owner: "Marina", dueDate: "25/04/2026" },
  { id: "ap3", title: "Social pack MQ", client: "MQSoftwares", status: "Aprovado", owner: "Bia", dueDate: "22/04/2026" },
];

const references = [
  { category: "Premium", note: "Uso de contraste escuro, cortes limpos e acabamento firme." },
  { category: "Institucional", note: "Composição direta, bloco forte e mensagens de alto controle." },
  { category: "Tech", note: "Cards estruturados, grid modular e áreas de respiro minimalistas." },
  { category: "Campanha", note: "Ritmo visual, headline objetiva e hierarquia agressiva." },
  { category: "UI", note: "Componentes densos com foco em leitura e operação." },
  { category: "Gastronômico", note: "Exemplo de marca parceira com linguagem mais quente para referência." },
];

const activity = [
  { time: "09:00", title: "Briefing atualizado", description: "Rebranding PicBrand recebeu nova referência visual.", tone: "accent" as const },
  { time: "11:30", title: "Asset anexado", description: "Logo oficial MQ Orbit entrou na biblioteca.", tone: "default" as const },
  { time: "14:45", title: "Aprovação pendente", description: "LP Premium aguardando ajuste no CTA principal.", tone: "warning" as const },
];

const stageTone: Record<DesignStatus, "default" | "accent" | "warning" | "danger" | "success"> = {
  "Em andamento": "accent",
  "Em revisão": "warning",
  Aprovado: "success",
  Pausado: "default",
};

const approvalTone: Record<Approval["status"], "default" | "accent" | "warning" | "danger" | "success"> = {
  Aguardando: "warning",
  Aprovado: "success",
  "Ajuste solicitado": "danger",
};

const templateTone: Record<Template["status"], "default" | "accent" | "warning" | "danger" | "success"> = {
  Pronto: "success",
  "Em revisão": "warning",
  Rascunho: "default",
};

export function DesignOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Design"
        title="Visão Geral"
        description="Painel criativo da operação com projetos ativos, assets recentes e fila de aprovações."
        breadcrumbs={[{ href: "/design", label: "Design" }, { label: "Visão Geral" }]}
        actions={<Link href="/design/projetos" className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15">Projetos</Link>}
      />

      <StatGrid
        items={[
          { label: "Projetos ativos", value: String(projects.filter((item) => item.stage !== "Aprovado").length), detail: "entregas em fluxo" },
          { label: "Aprovações pendentes", value: String(approvals.filter((item) => item.status !== "Aprovado").length), detail: "fila aguardando retorno" },
          { label: "Assets recentes", value: String(assets.length), detail: "biblioteca visual em atualização" },
          { label: "Briefings abertos", value: String(briefings.length), detail: "entrada contínua de demanda" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <SectionCard title="Projetos em destaque" description="Frentes criativas mais importantes do momento">
          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <article key={project.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{project.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{project.client}</p>
                  </div>
                  <Pill tone={stageTone[project.stage]}>{project.stage}</Pill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>{project.kind}</Pill>
                  <Pill>{project.deadline}</Pill>
                  <Pill>{project.owner}</Pill>
                </div>
                <div className="mt-4">
                  <ProgressBar value={project.progress} label="Progresso" />
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Fila de urgência" description="Pedidos que exigem atenção visual imediata">
          <Timeline items={activity} />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Assets recentes" description="Miniaturas placeholder e tags por marca">
          <div className="grid gap-3 md:grid-cols-2">
            {assets.slice(0, 4).map((asset) => (
              <article key={asset.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                <p className="text-sm font-semibold text-foreground">{asset.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{asset.source}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone="accent">{asset.type}</Pill>
                  <Pill>{asset.tag}</Pill>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Briefings em aberto" description="Entradas da operação criativa">
          <div className="space-y-3">
            {briefings.map((briefing) => (
              <article key={briefing.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{briefing.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{briefing.objective}</p>
                  </div>
                  <Pill>{briefing.owner}</Pill>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function DesignProjetosPage() {
  const [selected, setSelected] = useState<DesignProject | null>(projects[0]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Design" title="Projetos" description="Carteira de entregas criativas com cliente, etapa e deadline." breadcrumbs={[{ href: "/design", label: "Design" }, { label: "Projetos" }]} />
      <div className="grid gap-3 xl:grid-cols-2">
        {projects.map((project) => (
          <button key={project.id} type="button" onClick={() => setSelected(project)} className="rounded-[1.4rem] border border-border bg-surface-2 p-4 text-left transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{project.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{project.client}</p>
              </div>
              <Pill tone={stageTone[project.stage]}>{project.stage}</Pill>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill>{project.kind}</Pill>
              <Pill>{project.deadline}</Pill>
              <Pill>{project.owner}</Pill>
            </div>
          </button>
        ))}
      </div>

      <Drawer open={Boolean(selected)} title={selected?.name ?? ""} subtitle={selected ? selected.client : undefined} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Pill tone={stageTone[selected.stage]}>{selected.stage}</Pill>
              <Pill>{selected.kind}</Pill>
              <Pill>{selected.owner}</Pill>
            </div>
            <ProgressBar value={selected.progress} label="Progresso da criação" />
            <SectionCard title="Vínculos" description="Relacionamento com outros módulos">
              <div className="flex flex-wrap gap-2">
                <Pill tone="accent">{selected.client}</Pill>
                <Pill>Arquivos</Pill>
                <Pill>Marketing</Pill>
              </div>
            </SectionCard>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export function DesignBriefingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Design" title="Briefings" description="Lista operacional com objetivo, público e prazo." breadcrumbs={[{ href: "/design", label: "Design" }, { label: "Briefings" }]} />
      <div className="grid gap-3 xl:grid-cols-2">
        {briefings.map((briefing) => (
          <article key={briefing.id} className="rounded-[1.4rem] border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">{briefing.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{briefing.objective}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>{briefing.audience}</Pill>
              <Pill tone="accent">{briefing.format}</Pill>
              <Pill>{briefing.deadline}</Pill>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function DesignAssetsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Asset | null>(assets[0]);

  const filtered = useMemo(
    () =>
      assets.filter((asset) =>
        `${asset.title} ${asset.tag} ${asset.source}`.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [search],
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Design" title="Assets" description="Biblioteca visual com miniaturas placeholder e tags por marca." breadcrumbs={[{ href: "/design", label: "Design" }, { label: "Assets" }]} />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar asset, marca ou origem" />
      {filtered.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((asset) => (
            <button key={asset.id} type="button" onClick={() => setSelected(asset)} className="rounded-[1.4rem] border border-border bg-surface-2 p-4 text-left transition hover:-translate-y-0.5">
              <div className="mb-4 aspect-[4/3] rounded-[1.2rem] border border-border bg-gradient-to-br from-surface to-accent/10" />
              <p className="text-sm font-semibold text-foreground">{asset.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{asset.source}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone="accent">{asset.type}</Pill>
                <Pill>{asset.tag}</Pill>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="Sem assets" description="A busca não encontrou correspondências no conjunto atual." />
      )}
      <Drawer open={Boolean(selected)} title={selected?.title ?? ""} subtitle={selected ? selected.source : undefined} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Pill tone="accent">{selected.type}</Pill>
              <Pill>{selected.tag}</Pill>
              <Pill>{selected.updatedAt}</Pill>
            </div>
            <SectionCard title="Preview" description="Miniatura abstrata para o MVP">
              <div className="aspect-[4/3] rounded-[1.4rem] border border-border bg-gradient-to-br from-surface-2 to-accent/10" />
            </SectionCard>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export function DesignTemplatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Design" title="Templates" description="Modelos reutilizáveis para landing pages, posts, propostas e decks." breadcrumbs={[{ href: "/design", label: "Design" }, { label: "Templates" }]} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <article key={template.id} className="rounded-[1.4rem] border border-border bg-surface p-4 shadow-sm">
            <p className="text-sm font-semibold text-foreground">{template.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{template.useCase}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone={templateTone[template.status]}>{template.status}</Pill>
              <Pill>{template.format}</Pill>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function DesignAprovacoesPage() {
  const [items, setItems] = useState(approvals);

  function updateStatus(id: string, status: Approval["status"]) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Design" title="Aprovações" description="Fila de materiais esperando retorno ou ajuste." breadcrumbs={[{ href: "/design", label: "Design" }, { label: "Aprovações" }]} />
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.client}</p>
              </div>
              <Pill tone={approvalTone[item.status]}>{item.status}</Pill>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill>{item.owner}</Pill>
              <Pill>{item.dueDate}</Pill>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => updateStatus(item.id, "Aprovado")} className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-foreground">Aprovar</button>
              <button type="button" onClick={() => updateStatus(item.id, "Ajuste solicitado")} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground">Solicitar ajuste</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function DesignReferenciasPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Design" title="Referências" description="Moodboard simples com categorias que ajudam a orientar o time." breadcrumbs={[{ href: "/design", label: "Design" }, { label: "Referências" }]} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {references.map((reference) => (
          <article key={reference.category} className="rounded-[1.4rem] border border-border bg-surface p-5 shadow-sm">
            <div className="aspect-[4/3] rounded-[1.2rem] border border-border bg-gradient-to-br from-surface-2 to-accent/10" />
            <p className="mt-4 text-sm font-semibold text-foreground">{reference.category}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{reference.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

