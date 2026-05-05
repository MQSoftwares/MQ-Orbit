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

type FinancialStatus = "Pago" | "Pendente" | "Vencendo" | "Atrasado" | "Recebido";

type FinancialEntry = {
  id: string;
  date: string;
  description: string;
  category: string;
  competence: string;
  status: FinancialStatus;
  amount: number;
  type: "Entrada" | "Saída";
  client?: string;
  contract?: string;
  costCenter: string;
};

type Payable = {
  id: string;
  title: string;
  supplier: string;
  category: string;
  dueDate: string;
  amount: number;
  status: FinancialStatus;
  contract?: string;
  costCenter: string;
};

type Receivable = {
  id: string;
  title: string;
  client: string;
  installment: string;
  dueDate: string;
  amount: number;
  status: FinancialStatus;
  contract: string;
};

type Subscription = {
  id: string;
  name: string;
  supplier: string;
  value: number;
  renewal: string;
  category: string;
  cadence: "Mensal" | "Anual";
};

type CostCenter = {
  id: string;
  name: string;
  share: number;
  amount: number;
  description: string;
};

type ReportPreset = {
  id: string;
  title: string;
  description: string;
  metric: string;
};

const entries: FinancialEntry[] = [
  { id: "fe1", date: "22/04", description: "Recebimento LP Cliente Alpha", category: "Receita recorrente", competence: "Abr/26", status: "Recebido", amount: 7200, type: "Entrada", client: "Landing Page Cliente Alpha", contract: "Proposta Comercial LP Premium", costCenter: "Comercial" },
  { id: "fe2", date: "22/04", description: "Pagamento VPS Hostinger", category: "Infraestrutura", competence: "Abr/26", status: "Pago", amount: 89, type: "Saída", costCenter: "Infraestrutura" },
  { id: "fe3", date: "23/04", description: "DNS anual MQ", category: "Infraestrutura", competence: "Abr/26", status: "Vencendo", amount: 79, type: "Saída", contract: "Contrato suporte interno", costCenter: "Infraestrutura" },
  { id: "fe4", date: "24/04", description: "Campanha institucional MQ", category: "Marketing", competence: "Abr/26", status: "Pendente", amount: 1450, type: "Saída", client: "MQSoftwares", costCenter: "Marketing" },
  { id: "fe5", date: "25/04", description: "Parcela Casa Zeeni", category: "Receita recorrente", competence: "Abr/26", status: "Pendente", amount: 4800, type: "Entrada", client: "Casa Zeeni", contract: "Contrato Casa Zeeni", costCenter: "Operação" },
  { id: "fe6", date: "20/04", description: "Zoho Mail anual", category: "Ferramentas", competence: "Abr/26", status: "Atrasado", amount: 365, type: "Saída", costCenter: "Infraestrutura" },
];

const payables: Payable[] = [
  { id: "p1", title: "Servidor VPS Hostinger", supplier: "Hostinger", category: "Infraestrutura", dueDate: "22/04/2026", amount: 89, status: "Pago", costCenter: "Infraestrutura" },
  { id: "p2", title: "DNS anual MQ", supplier: "Registro BR", category: "Infraestrutura", dueDate: "23/04/2026", amount: 79, status: "Vencendo", contract: "Contrato suporte interno", costCenter: "Infraestrutura" },
  { id: "p3", title: "Zoho Mail", supplier: "Zoho", category: "Ferramentas", dueDate: "20/04/2026", amount: 365, status: "Atrasado", costCenter: "Infraestrutura" },
  { id: "p4", title: "Design freelancer campanha", supplier: "Bruna Studio", category: "Produção", dueDate: "25/04/2026", amount: 1200, status: "Pendente", contract: "Campanha Institucional MQ", costCenter: "Marketing" },
];

const receivables: Receivable[] = [
  { id: "r1", title: "Parcela 1", client: "Casa Zeeni", installment: "1/4", dueDate: "25/04/2026", amount: 4800, status: "Pendente", contract: "Contrato Casa Zeeni" },
  { id: "r2", title: "Fase de implantação", client: "Landing Page Cliente Alpha", installment: "2/3", dueDate: "24/04/2026", amount: 3200, status: "Recebido", contract: "Proposta Comercial LP Premium" },
  { id: "r3", title: "Assinatura recorrente", client: "PicBrand", installment: "Mensal", dueDate: "30/04/2026", amount: 2100, status: "Vencendo", contract: "Aditivo PicBrand" },
  { id: "r4", title: "Suporte interno", client: "MQSoftwares", installment: "Abr/26", dueDate: "22/04/2026", amount: 0, status: "Pago", contract: "Contrato suporte interno" },
];

const subscriptions: Subscription[] = [
  { id: "s1", name: "Hostinger VPS", supplier: "Hostinger", value: 89, renewal: "22/05/2026", category: "Infraestrutura", cadence: "Mensal" },
  { id: "s2", name: "Zoho Mail", supplier: "Zoho", value: 365, renewal: "20/04/2027", category: "Ferramentas", cadence: "Anual" },
  { id: "s3", name: "Stripe SaaS", supplier: "Stripe", value: 0, renewal: "Mensal recorrente", category: "Cobrança", cadence: "Mensal" },
  { id: "s4", name: "Domínio MQ", supplier: "Registro BR", value: 79, renewal: "23/04/2026", category: "Infraestrutura", cadence: "Anual" },
];

const centers: CostCenter[] = [
  { id: "cc1", name: "Infraestrutura", share: 34, amount: 533, description: "Servidor, domínio, e-mail e suporte técnico" },
  { id: "cc2", name: "Marketing", share: 22, amount: 1450, description: "Campanhas, mídia e conteúdo de aquisição" },
  { id: "cc3", name: "Design", share: 16, amount: 1200, description: "Assets, motion e produção visual" },
  { id: "cc4", name: "Operação", share: 18, amount: 980, description: "Processos internos e administração" },
  { id: "cc5", name: "Comercial", share: 10, amount: 720, description: "Propostas, contratos e materiais de venda" },
];

const reportPresets: ReportPreset[] = [
  { id: "rp1", title: "Mensal", description: "Resumo de entradas, saídas e saldo projetado.", metric: "R$ 8,1 mil" },
  { id: "rp2", title: "Trimestral", description: "Tendência consolidada por período.", metric: "+12%" },
  { id: "rp3", title: "Por cliente", description: "Recebíveis e contratos por conta.", metric: "4 clientes" },
  { id: "rp4", title: "Centro de custo", description: "Distribuição por área e operação.", metric: "5 centros" },
];

const monthlyActivity = [
  { time: "08:00", title: "Recebimento confirmado", description: "Entrada da Landing Page Cliente Alpha entrou no caixa.", tone: "accent" as const },
  { time: "10:30", title: "Conta recorrente vencendo", description: "DNS anual MQ pediu atenção para evitar bloqueio.", tone: "warning" as const },
  { time: "14:10", title: "Nova despesa registrada", description: "Campanha institucional foi vinculada ao centro de custo de Marketing." },
];

const statusTone: Record<FinancialStatus, "default" | "accent" | "warning" | "danger" | "success"> = {
  Pago: "success",
  Pendente: "default",
  Vencendo: "warning",
  Atrasado: "danger",
  Recebido: "success",
};

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

export function FinancasOverviewPage() {
  const inflow = entries.filter((item) => item.type === "Entrada").reduce((sum, item) => sum + item.amount, 0);
  const outflow = entries.filter((item) => item.type === "Saída").reduce((sum, item) => sum + item.amount, 0);
  const projected = inflow - outflow;
  const pending = payables.filter((item) => item.status !== "Pago").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanças"
        title="Visão Geral"
        description="Saldo projetado, recorrências, despesas e recebíveis do ciclo atual da operação."
        breadcrumbs={[{ href: "/financas", label: "Finanças" }, { label: "Visão Geral" }]}
        actions={
          <>
            <Link href="/financas/contas-a-pagar" className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-2">
              Contas a pagar
            </Link>
            <Link href="/financas/fluxo-de-caixa" className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15">
              Fluxo de caixa
            </Link>
          </>
        }
      />

      <StatGrid
        items={[
          { label: "Entradas previstas", value: currency(inflow), detail: "recebíveis em aberto e recorrências" },
          { label: "Saídas previstas", value: currency(outflow), detail: "despesas operacionais e ferramentas" },
          { label: "Saldo projetado", value: currency(projected), detail: "resultado antes de ajustes", accent: projected >= 0 ? "positivo" : "déficit" },
          { label: "Inadimplência", value: String(pending), detail: "contas fora do status pago" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Evolução do mês" description="Placeholder simples para leitura da tendência">
          <MiniChart
            title="Fluxo acumulado"
            items={[
              { label: "S1", value: 4 },
              { label: "S2", value: 6 },
              { label: "S3", value: 8 },
              { label: "S4", value: 10 },
              { label: "S5", value: 12 },
              { label: "S6", value: 9 },
            ]}
          />
        </SectionCard>

        <SectionCard title="Alertas financeiros" description="Itens que merecem atenção hoje">
          <Timeline items={monthlyActivity} />
        </SectionCard>
      </div>

      <SectionCard title="Maiores despesas do mês" description="Conjunto operacional que conversa com contratos e recorrências">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {payables.map((item) => (
            <article key={item.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.supplier}</p>
                </div>
                <Pill tone={statusTone[item.status]}>{item.status}</Pill>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill>{currency(item.amount)}</Pill>
                <Pill>{item.category}</Pill>
                <Pill>{item.costCenter}</Pill>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function FinancasFluxoCaixaPage() {
  const [month, setMonth] = useState("Abr/26");

  const filtered = useMemo(() => entries.filter((entry) => entry.competence === month), [month]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finanças" title="Fluxo de Caixa" description="Ledger operacional com visão por competência e status." breadcrumbs={[{ href: "/financas", label: "Finanças" }, { label: "Fluxo de caixa" }]} />
      <FilterBar
        search={month}
        searchPlaceholder="Competência, ex.: Abr/26"
        onSearchChange={setMonth}
        trailing={<Pill tone="accent">{filtered.length} lançamentos</Pill>}
      />
      <DataTable
        items={filtered}
        getKey={(entry) => entry.id}
        columns={[
          { header: "Data", cell: (entry: FinancialEntry) => <span className="font-semibold text-foreground">{entry.date}</span> },
          { header: "Descrição", className: "min-w-[20rem]", cell: (entry: FinancialEntry) => <div><p className="font-semibold text-foreground">{entry.description}</p><p className="mt-1 text-sm text-muted-foreground">{entry.category}</p></div> },
          { header: "Tipo", cell: (entry: FinancialEntry) => <Pill tone={entry.type === "Entrada" ? "success" : "warning"}>{entry.type}</Pill> },
          { header: "Status", cell: (entry: FinancialEntry) => <Pill tone={statusTone[entry.status]}>{entry.status}</Pill> },
          { header: "Valor", cell: (entry: FinancialEntry) => <span className="font-semibold text-foreground">{currency(entry.amount)}</span> },
        ]}
      />
    </div>
  );
}

export function FinancasContasAPagarPage() {
  const [items, setItems] = useState(payables);
  const [selected, setSelected] = useState<Payable | null>(payables[0]);

  function payItem(id: string) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "Pago" } : item)),
    );
  }

  const pending = items.filter((item) => item.status !== "Pago");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finanças" title="Contas a Pagar" description="Despesa recorrente e pontual com ação simulada de pagamento." breadcrumbs={[{ href: "/financas", label: "Finanças" }, { label: "Contas a pagar" }]} />
      <div className="grid gap-3 xl:grid-cols-2">
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => setSelected(item)} className="rounded-[1.4rem] border border-border bg-surface-2 p-4 text-left transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.supplier}</p>
              </div>
              <Pill tone={statusTone[item.status]}>{item.status}</Pill>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill>{currency(item.amount)}</Pill>
              <Pill>{item.category}</Pill>
              <Pill>{item.dueDate}</Pill>
            </div>
          </button>
        ))}
      </div>

      <SectionCard title="Pendências" description="Itens ainda fora de Pago">
        {pending.length ? (
          <div className="flex flex-wrap gap-2">
            {pending.map((item) => (
              <button key={item.id} type="button" onClick={() => payItem(item.id)} className="rounded-full border border-accent/25 bg-accent/10 px-3 py-2 text-xs font-semibold text-foreground">
                Marcar {item.title} como pago
              </button>
            ))}
          </div>
        ) : (
          <EmptyState title="Tudo pago" description="Nenhuma conta pendente neste conjunto mockado." />
        )}
      </SectionCard>

      <Drawer open={Boolean(selected)} title={selected?.title ?? ""} subtitle={selected ? selected.supplier : undefined} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Pill tone={statusTone[selected.status]}>{selected.status}</Pill>
              <Pill>{selected.costCenter}</Pill>
              <Pill>{selected.category}</Pill>
            </div>
            <ProgressBar value={selected.status === "Pago" ? 100 : selected.status === "Vencendo" ? 72 : 46} label="Conferência financeira" />
            <SectionCard title="Vínculo" description="Relação com contratos e módulos">
              <div className="flex flex-wrap gap-2">
                {selected.contract ? <Pill tone="accent">{selected.contract}</Pill> : null}
                <Pill>Administrativo</Pill>
                <Pill>Arquivos</Pill>
              </div>
            </SectionCard>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export function FinancasContasAReceberPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finanças" title="Contas a Receber" description="Cobranças, parcelas e contratos recorrentes por cliente." breadcrumbs={[{ href: "/financas", label: "Finanças" }, { label: "Contas a receber" }]} />
      <DataTable
        items={receivables}
        getKey={(item) => item.id}
        columns={[
          { header: "Cliente", cell: (item: Receivable) => <div><p className="font-semibold text-foreground">{item.client}</p><p className="mt-1 text-sm text-muted-foreground">{item.title}</p></div> },
          { header: "Parcela", cell: (item: Receivable) => <Pill>{item.installment}</Pill> },
          { header: "Status", cell: (item: Receivable) => <Pill tone={statusTone[item.status]}>{item.status}</Pill> },
          { header: "Valor", cell: (item: Receivable) => <span className="font-semibold text-foreground">{currency(item.amount)}</span> },
          { header: "Contrato", className: "min-w-[16rem]", cell: (item: Receivable) => <span className="text-sm text-muted-foreground">{item.contract}</span> },
        ]}
      />
    </div>
  );
}

export function FinancasAssinaturasPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finanças" title="Assinaturas" description="Serviços mensais e anuais que sustentam a operação." breadcrumbs={[{ href: "/financas", label: "Finanças" }, { label: "Assinaturas" }]} />
      <div className="grid gap-3 xl:grid-cols-2">
        {subscriptions.map((item) => (
          <article key={item.id} className="rounded-[1.4rem] border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.supplier}</p>
              </div>
              <Pill>{item.cadence}</Pill>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill tone="accent">{currency(item.value)}</Pill>
              <Pill>{item.category}</Pill>
              <Pill>{item.renewal}</Pill>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function FinancasCentrosDeCustoPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finanças" title="Centros de Custo" description="Distribuição da despesa entre áreas da operação." breadcrumbs={[{ href: "/financas", label: "Finanças" }, { label: "Centros de custo" }]} />
      <div className="grid gap-3 xl:grid-cols-2">
        {centers.map((item) => (
          <article key={item.id} className="rounded-[1.4rem] border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Pill>{item.share}%</Pill>
            </div>
            <div className="mt-4">
              <ProgressBar value={item.share} label="Participação" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function FinancasRelatoriosPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finanças" title="Relatórios" description="Exportações simuladas e presets de leitura financeira." breadcrumbs={[{ href: "/financas", label: "Finanças" }, { label: "Relatórios" }]} />
      <div className="grid gap-3 xl:grid-cols-2">
        {reportPresets.map((preset) => (
          <article key={preset.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{preset.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
              </div>
              <Pill tone="accent">{preset.metric}</Pill>
            </div>
          </article>
        ))}
      </div>
      <SectionCard title="Resumo exportável" description="Indicadores para PDF, CSV ou apresentação">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Saldo</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">+R$ 8,1 mil</p>
          </article>
          <article className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Taxa</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">97%</p>
          </article>
          <article className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Inadimplência</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">2 títulos</p>
          </article>
          <article className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recorrência</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">6 lançamentos</p>
          </article>
        </div>
      </SectionCard>
    </div>
  );
}

