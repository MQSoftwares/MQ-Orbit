"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
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

type CampaignStatus = "Ativa" | "Em produção" | "Pausada" | "Concluída";
type LeadStage = "Novo lead" | "Contato feito" | "Proposta enviada" | "Negociação" | "Convertido" | "Perdido";

type Campaign = {
  id: string;
  name: string;
  channel: string;
  goal: string;
  status: CampaignStatus;
  budget: number;
  owner: string;
  period: string;
};

type ContentItem = {
  id: string;
  title: string;
  channel: string;
  theme: string;
  status: "Programado" | "Publicado" | "Rascunho";
  date: string;
};

type Lead = {
  id: string;
  name: string;
  source: string;
  interest: string;
  owner: string;
  value: number;
  stage: LeadStage;
};

type LandingPage = {
  id: string;
  title: string;
  client: string;
  stage: string;
  progress: number;
  visits: string;
  conversion: string;
};

type MetricSnapshot = {
  id: string;
  label: string;
  value: string;
  hint: string;
};

type AutomationFlow = {
  id: string;
  title: string;
  description: string;
  status: "Ativo" | "Pausado" | "Rascunho";
};

const campaigns: Campaign[] = [
  { id: "m1", name: "Campanha Institucional MQ", channel: "Orgânico + paid", goal: "Autoridade de marca", status: "Ativa", budget: 4800, owner: "Camila", period: "Abr/26" },
  { id: "m2", name: "Captação Landing Pages", channel: "Google Ads", goal: "Leads qualificados", status: "Em produção", budget: 7200, owner: "Larissa", period: "Abr/26" },
  { id: "m3", name: "Lançamento PicBrand Tech", channel: "Social + email", goal: "Awareness", status: "Pausada", budget: 3600, owner: "Bruna", period: "Abr/26" },
  { id: "m4", name: "Retargeting Casa Zeeni", channel: "Meta Ads", goal: "Remarketing", status: "Concluída", budget: 2400, owner: "Paulo", period: "Mar/26" },
];

const content: ContentItem[] = [
  { id: "ct1", title: "Post de prova social MQ", channel: "Instagram", theme: "Institucional", status: "Programado", date: "23/04" },
  { id: "ct2", title: "Email de follow-up comercial", channel: "Email", theme: "Nutrição", status: "Rascunho", date: "24/04" },
  { id: "ct3", title: "Carrossel PicBrand", channel: "LinkedIn", theme: "Branding", status: "Publicado", date: "21/04" },
  { id: "ct4", title: "Story campanha MQ Orbit", channel: "Stories", theme: "Produto", status: "Programado", date: "25/04" },
];

const leads: Lead[] = [
  { id: "l1", name: "Landing Page Cliente Alpha", source: "Google Ads", interest: "LP Premium", owner: "Larissa", value: 7200, stage: "Contato feito" },
  { id: "l2", name: "PicBrand", source: "Orgânico", interest: "Rebranding", owner: "Bruna", value: 12400, stage: "Proposta enviada" },
  { id: "l3", name: "Casa Zeeni", source: "Indicação", interest: "Site institucional", owner: "Camila", value: 9600, stage: "Negociação" },
  { id: "l4", name: "MQSoftwares", source: "Site", interest: "Módulos internos", owner: "Matheus", value: 0, stage: "Convertido" },
  { id: "l5", name: "Loja parceira", source: "Meta Ads", interest: "Landing page", owner: "Larissa", value: 5400, stage: "Novo lead" },
];

const landingPages: LandingPage[] = [
  { id: "lp1", title: "Landing Page Cliente Alpha", client: "Cliente Alpha", stage: "Desenvolvimento", progress: 76, visits: "1,8k", conversion: "4,1%" },
  { id: "lp2", title: "Página MQ Orbit", client: "MQSoftwares", stage: "Publicado", progress: 100, visits: "3,2k", conversion: "5,8%" },
  { id: "lp3", title: "LP Casa Zeeni", client: "Casa Zeeni", stage: "Briefing", progress: 24, visits: "620", conversion: "1,9%" },
  { id: "lp4", title: "LP PicBrand Tech", client: "PicBrand", stage: "Design", progress: 51, visits: "980", conversion: "3,2%" },
];

const metrics: MetricSnapshot[] = [
  { id: "ms1", label: "Visitas", value: "8,2k", hint: "tráfego consolidado do mês" },
  { id: "ms2", label: "Leads", value: "146", hint: "captação das campanhas ativas" },
  { id: "ms3", label: "CTR", value: "4,8%", hint: "performance das peças em circulação" },
  { id: "ms4", label: "Custo por lead", value: "R$ 52", hint: "média ponderada do funil" },
];

const automations: AutomationFlow[] = [
  { id: "au1", title: "Follow-up comercial", description: "Dispara após o primeiro contato e registra retorno do lead.", status: "Ativo" },
  { id: "au2", title: "Pós-lead de LP", description: "Nutrição curta após envio de proposta ou landing page.", status: "Ativo" },
  { id: "au3", title: "Lembrete de proposta", description: "Reforço automático para negociações em aberto.", status: "Pausado" },
  { id: "au4", title: "Sequência institucional", description: "Fluxo de conteúdo para leads entrando pelo conteúdo orgânico.", status: "Rascunho" },
];

const activity = [
  { time: "09:10", title: "Campanha atualizada", description: "Campanha Institucional MQ recebeu novo criativo.", tone: "accent" as const },
  { time: "11:00", title: "Lead avançado", description: "PicBrand saiu de contato feito para proposta enviada.", tone: "warning" as const },
  { time: "15:20", title: "Landing page publicada", description: "MQ Orbit entrou na etapa publicada com conversão monitorada." },
];

const campaignTone: Record<CampaignStatus, "default" | "accent" | "warning" | "danger" | "success"> = {
  Ativa: "accent",
  "Em produção": "warning",
  Pausada: "default",
  Concluída: "success",
};

const leadTone: Record<LeadStage, "default" | "accent" | "warning" | "danger" | "success"> = {
  "Novo lead": "default",
  "Contato feito": "accent",
  "Proposta enviada": "warning",
  Negociação: "warning",
  Convertido: "success",
  Perdido: "danger",
};

export function MarketingOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketing"
        title="Visão Geral"
        description="Painel de campanhas, conteúdo, leads, landing pages e métricas do mês."
        breadcrumbs={[{ href: "/marketing", label: "Marketing" }, { label: "Visão Geral" }]}
        actions={<Link href="/marketing/campanhas" className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15">Campanhas</Link>}
      />

      <StatGrid items={metrics.map((metric) => ({ label: metric.label, value: metric.value, detail: metric.hint }))} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Campanhas ativas" description="Projetos e objetivos em andamento">
          <div className="space-y-3">
            {campaigns.slice(0, 3).map((campaign) => (
              <article key={campaign.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{campaign.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{campaign.channel}</p>
                  </div>
                  <Pill tone={campaignTone[campaign.status]}>{campaign.status}</Pill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>{campaign.goal}</Pill>
                  <Pill>{campaign.period}</Pill>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Funil rápido" description="Leitura de distribuição de leads">
          <MiniChart
            title="Leads por estágio"
            items={[
              { label: "Novo", value: 12 },
              { label: "Contato", value: 18 },
              { label: "Proposta", value: 11 },
              { label: "Negoc.", value: 9 },
              { label: "Convert.", value: 7 },
              { label: "Perdido", value: 4 },
            ]}
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Conteúdo da semana" description="Publicações programadas e lançadas">
          <Timeline items={activity} />
        </SectionCard>

        <SectionCard title="Pendências" description="Alertas e próximos passos">
          <div className="space-y-3">
            <Pill tone="warning">2 campanhas com budget próximo do limite</Pill>
            <Pill tone="accent">3 landing pages em produção ou revisão</Pill>
            <Pill tone="accent">4 automações com status ativo</Pill>
            <Pill>Leads do mês alinhados com vendas</Pill>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function MarketingCampanhasPage() {
  const [channel, setChannel] = useState("Todos");

  const filtered = useMemo(
    () =>
      campaigns.filter((campaign) => {
        const matchesChannel = channel === "Todos" || campaign.channel.includes(channel);
        return matchesChannel;
      }),
    [channel],
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Marketing" title="Campanhas" description="Lista de campanhas com filtro por canal e status." breadcrumbs={[{ href: "/marketing", label: "Marketing" }, { label: "Campanhas" }]} />
      <FilterBar
        search={channel}
        onSearchChange={setChannel}
        searchPlaceholder="Filtrar canal"
        trailing={<Pill tone="accent">{filtered.length} campanhas</Pill>}
      />
      <div className="grid gap-3 xl:grid-cols-2">
        {filtered.map((campaign) => (
          <article key={campaign.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{campaign.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{campaign.goal}</p>
              </div>
              <Pill tone={campaignTone[campaign.status]}>{campaign.status}</Pill>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill>{campaign.channel}</Pill>
              <Pill>{campaign.owner}</Pill>
              <Pill>{campaign.period}</Pill>
              <Pill>{currency(campaign.budget)}</Pill>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

export function MarketingCalendarioPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Marketing" title="Calendário Editorial" description="Painel simplificado para posts, canais e status de publicação." breadcrumbs={[{ href: "/marketing", label: "Marketing" }, { label: "Calendário editorial" }]} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {content.map((item) => (
          <article key={item.id} className="rounded-[1.4rem] border border-border bg-surface p-4 shadow-sm">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.channel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill>{item.theme}</Pill>
              <Pill>{item.status}</Pill>
              <Pill>{item.date}</Pill>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function MarketingLeadsPage() {
  const [items, setItems] = useState(leads);
  const stages: LeadStage[] = ["Novo lead", "Contato feito", "Proposta enviada", "Negociação", "Convertido", "Perdido"];

  function nextStage(current: LeadStage): LeadStage {
    const index = stages.indexOf(current);
    return stages[Math.min(stages.length - 1, index + 1)];
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Marketing" title="Leads" description="Pipeline simples com mudança de estágio em memória." breadcrumbs={[{ href: "/marketing", label: "Marketing" }, { label: "Leads" }]} />
      <div className="space-y-3">
        {stages.map((stage) => {
          const stageItems = items.filter((item) => item.stage === stage);

          return (
            <SectionCard key={stage} title={stage} description={`${stageItems.length} leads neste estágio`}>
              <div className="grid gap-3 xl:grid-cols-2">
                {stageItems.length ? stageItems.map((lead) => (
                  <article key={lead.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{lead.source} · {lead.interest}</p>
                      </div>
                      <Pill tone={leadTone[lead.stage]}>{lead.stage}</Pill>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Pill>{lead.owner}</Pill>
                      <Pill>{currency(lead.value)}</Pill>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setItems((current) => current.map((item) => (item.id === lead.id ? { ...item, stage: nextStage(item.stage) } : item)))} className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-foreground">Avançar estágio</button>
                    </div>
                  </article>
                )) : <EmptyState title="Sem leads" description="Nenhum lead neste estágio no momento." />}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}

export function MarketingLandingPagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Marketing" title="Landing Pages" description="LPs vinculadas a campanhas e clientes com progresso e métricas rápidas." breadcrumbs={[{ href: "/marketing", label: "Marketing" }, { label: "Landing pages" }]} />
      <div className="grid gap-3 xl:grid-cols-2">
        {landingPages.map((page) => (
          <article key={page.id} className="rounded-[1.4rem] border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{page.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{page.client}</p>
              </div>
              <Pill>{page.stage}</Pill>
            </div>
            <div className="mt-4">
              <ProgressBar value={page.progress} label="Progresso" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>{page.visits} visitas</Pill>
              <Pill tone="accent">{page.conversion}</Pill>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function MarketingMetricasPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Marketing" title="Métricas" description="Visão consolidada de visitas, leads, CTR e custo por lead." breadcrumbs={[{ href: "/marketing", label: "Marketing" }, { label: "Métricas" }]} />
      <StatGrid items={metrics.map((metric) => ({ label: metric.label, value: metric.value, detail: metric.hint }))} />
      <MiniChart
        title="Desempenho por canal"
        items={[
          { label: "Ads", value: 14 },
          { label: "Org", value: 9 },
          { label: "Email", value: 7 },
          { label: "Social", value: 12 },
          { label: "LP", value: 11 },
          { label: "Ind", value: 5 },
        ]}
      />
    </div>
  );
}

export function MarketingAutomacoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Marketing" title="Automações" description="Fluxos mockados com status e descrição operacional." breadcrumbs={[{ href: "/marketing", label: "Marketing" }, { label: "Automações" }]} />
      <div className="grid gap-3 xl:grid-cols-2">
        {automations.map((flow) => (
          <article key={flow.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{flow.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{flow.description}</p>
              </div>
              <Pill tone={flow.status === "Ativo" ? "accent" : flow.status === "Pausado" ? "warning" : "default"}>{flow.status}</Pill>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

