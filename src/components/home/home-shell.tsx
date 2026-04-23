import { BrandLogo } from "@/components/brand/brand-logo";

export function HomeShell() {
  return (
    <>
      <header className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-surface/90 px-5 py-4 shadow-sm backdrop-blur">
        <div>
          <BrandLogo className="h-4 max-w-full w-auto" />
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Home skeleton
          </h1>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm text-muted-foreground sm:flex">
          Área principal
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="min-h-[22rem] rounded-[2rem] border border-dashed border-border bg-surface/80 p-6 shadow-sm">
          <div className="h-5 w-40 rounded-full bg-muted" />
          <div className="mt-6 h-10 w-3/5 rounded-2xl bg-muted" />
          <div className="mt-4 h-4 w-full rounded-full bg-surface-2" />
          <div className="mt-3 h-4 w-11/12 rounded-full bg-surface-2" />
          <div className="mt-3 h-4 w-4/5 rounded-full bg-surface-2" />
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm">
            <div className="h-4 w-24 rounded-full bg-muted" />
            <div className="mt-4 h-24 rounded-2xl bg-surface-2" />
          </div>
          <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm">
            <div className="h-4 w-28 rounded-full bg-muted" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full rounded-full bg-surface-2" />
              <div className="h-4 w-5/6 rounded-full bg-surface-2" />
              <div className="h-4 w-2/3 rounded-full bg-surface-2" />
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
