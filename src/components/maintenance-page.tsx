import Link from "next/link";

type MaintenancePageProps = {
  title?: string;
};

export function MaintenancePage({ title }: MaintenancePageProps) {
  return (
    <section
      aria-label={title ?? "Página em manutenção"}
      className="flex min-h-[calc(100vh-2rem)] w-full items-center justify-center px-2 py-4 sm:px-4 lg:px-6"
    >
      <div className="w-full max-w-[760px]">
        <div className="mx-auto flex w-full flex-col items-center rounded-[2.5rem] border border-border bg-surface/95 px-6 py-16 text-center shadow-[0_32px_90px_rgba(2,8,23,0.18)] backdrop-blur-sm sm:px-10 sm:py-20 lg:px-16">
          <span className="rounded-full border border-accent/20 bg-accent/10 px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.38em] text-accent sm:px-6">
            Status do sistema
          </span>

          <h1 className="mt-8 text-4xl font-black uppercase leading-none tracking-tight text-foreground sm:text-6xl">
            <span className="block">PÁGINA EM</span>
            <span className="block text-accent">MANUTENÇÃO</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg font-medium leading-8 text-muted-foreground sm:text-xl">
            No momento, estas áreas estão indisponíveis devido a atualizações
            técnicas em andamento. Em breve, o acesso será estabelecido.
          </p>

          <Link
            href="/"
            className="mt-10 inline-flex items-center justify-center rounded-2xl bg-accent px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-accent-foreground shadow-[0_18px_35px_rgba(34,211,238,0.18)] transition-transform duration-300 ease-out hover:scale-[1.03] hover:brightness-110"
          >
            Voltar para o início
          </Link>
        </div>

        <p className="mt-10 text-center text-[0.65rem] font-medium uppercase tracking-[0.45em] text-muted-foreground/70">
          © MQSOFTWARES 2026 — TODOS OS DIREITOS RESERVADOS
        </p>
      </div>
    </section>
  );
}
