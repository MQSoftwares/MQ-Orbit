"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DataTable,
  Drawer,
  EmptyState,
  FilterBar,
  PageHeader,
  Pill,
  SectionCard,
  StatGrid,
  Timeline,
  ProgressBar,
} from "@/components/mq-orbit/ui";

type FileKind = "imagem" | "pdf" | "doc" | "contrato" | "arte" | "planilha" | "apresentacao";
type FileLocation = "recentes" | "compartilhados" | "favoritos" | "lixeira" | "explorador";

type Folder = {
  id: string;
  name: string;
  module: string;
  files: number;
  size: string;
};

type FileItem = {
  id: string;
  name: string;
  kind: FileKind;
  owner: string;
  updatedAt: string;
  size: string;
  module: string;
  folder: string;
  location: FileLocation;
  starred: boolean;
  sharedWith: string;
};

const folders: Folder[] = [
  { id: "f1", name: "Contratos", module: "Administrativo", files: 12, size: "2,4 GB" },
  { id: "f2", name: "Assets de marca", module: "Design", files: 24, size: "8,1 GB" },
  { id: "f3", name: "Campanhas", module: "Marketing", files: 18, size: "5,6 GB" },
  { id: "f4", name: "Financeiro", module: "Finanças", files: 9, size: "1,2 GB" },
];

const files: FileItem[] = [
  { id: "fi1", name: "Contrato Casa Zeeni.pdf", kind: "contrato", owner: "Administrativo", updatedAt: "Hoje", size: "2,1 MB", module: "Administrativo", folder: "Contratos", location: "explorador", starred: true, sharedWith: "Larissa" },
  { id: "fi2", name: "Proposta Comercial LP Premium.doc", kind: "doc", owner: "Comercial", updatedAt: "Hoje", size: "1,4 MB", module: "Administrativo", folder: "Contratos", location: "recentes", starred: true, sharedWith: "Casa Zeeni" },
  { id: "fi3", name: "Logo oficial MQ Orbit.svg", kind: "imagem", owner: "Design", updatedAt: "Ontem", size: "340 KB", module: "Design", folder: "Assets de marca", location: "favoritos", starred: true, sharedWith: "Marketing" },
  { id: "fi4", name: "Arte campanha institucional.png", kind: "arte", owner: "Design", updatedAt: "Ontem", size: "4,8 MB", module: "Marketing", folder: "Campanhas", location: "compartilhados", starred: false, sharedWith: "PicBrand" },
  { id: "fi5", name: "Planilha financeira abril.xlsx", kind: "planilha", owner: "Financeiro", updatedAt: "2 dias", size: "860 KB", module: "Finanças", folder: "Financeiro", location: "explorador", starred: true, sharedWith: "Matheus" },
  { id: "fi6", name: "Briefing Rebranding PicBrand.pdf", kind: "pdf", owner: "Design", updatedAt: "2 dias", size: "3,2 MB", module: "Design", folder: "Assets de marca", location: "recentes", starred: false, sharedWith: "PicBrand" },
  { id: "fi7", name: "Apresentação institucional MQ.pptx", kind: "apresentacao", owner: "Marketing", updatedAt: "3 dias", size: "11,2 MB", module: "Marketing", folder: "Campanhas", location: "lixeira", starred: false, sharedWith: "Equipe comercial" },
  { id: "fi8", name: "Identidade visual Casa Zeeni.pdf", kind: "pdf", owner: "Design", updatedAt: "3 dias", size: "5,1 MB", module: "Design", folder: "Assets de marca", location: "favoritos", starred: true, sharedWith: "Casa Zeeni" },
];

const activity = [
  { time: "08:40", title: "Arquivo compartilhado", description: "Contrato Casa Zeeni foi enviado para revisão.", tone: "accent" as const },
  { time: "10:05", title: "Favorito atualizado", description: "Logo oficial MQ Orbit voltou para o topo da coleção." },
  { time: "13:20", title: "Item movido para lixeira", description: "Apresentação institucional antiga foi arquivada." , tone: "warning" as const },
];

const kindTone: Record<FileKind, "default" | "accent" | "warning" | "danger" | "success"> = {
  imagem: "accent",
  pdf: "warning",
  doc: "default",
  contrato: "success",
  arte: "accent",
  planilha: "warning",
  apresentacao: "accent",
};

function fileIcon(kind: FileKind) {
  switch (kind) {
    case "imagem":
    case "arte":
      return "IMG";
    case "pdf":
      return "PDF";
    case "doc":
      return "DOC";
    case "contrato":
      return "CTR";
    case "planilha":
      return "XLS";
    case "apresentacao":
      return "PPT";
    default:
      return "ARQ";
  }
}

export function ArquivosOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Arquivos"
        title="Visão Geral"
        description="Repositório central de contratos, artes, planilhas, propostas e anexos da operação."
        breadcrumbs={[{ href: "/arquivos", label: "Arquivos" }, { label: "Visão Geral" }]}
        actions={<Link href="/arquivos/explorador" className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/15">Explorador</Link>}
      />

      <StatGrid
        items={[
          { label: "Arquivos totais", value: String(files.length), detail: "itens mockados no repositório" },
          { label: "Favoritos", value: String(files.filter((item) => item.starred).length), detail: "materiais prioritários" },
          { label: "Compartilhados", value: String(files.filter((item) => item.location === "compartilhados").length), detail: "itens circulando entre áreas" },
          { label: "Pastas", value: String(folders.length), detail: "estrutura base por módulo" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Pastas por módulo" description="Ponto de partida do hub de arquivos">
          <div className="grid gap-3 md:grid-cols-2">
            {folders.map((folder) => (
              <article key={folder.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
                <p className="text-sm font-semibold text-foreground">{folder.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{folder.module}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>{folder.files} arquivos</Pill>
                  <Pill>{folder.size}</Pill>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Atividade recente" description="Linha do tempo de operações de arquivo">
          <Timeline items={activity} />
        </SectionCard>
      </div>

      <SectionCard title="Atalhos rápidos" description="Ações comuns do repositório">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Pill tone="accent">Novo contrato</Pill>
          <Pill tone="accent">Nova arte</Pill>
          <Pill tone="accent">Enviar apresentação</Pill>
          <Pill tone="accent">Importar planilha</Pill>
        </div>
      </SectionCard>
    </div>
  );
}

export function ArquivosExploradorPage() {
  const [view, setView] = useState<"grid" | "lista">("grid");
  const [query, setQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(folders[0].name);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(files[0]);
  const [starred, setStarred] = useState<string[]>(files.filter((file) => file.starred).map((file) => file.id));

  const filtered = useMemo(
    () =>
      files.filter((file) => {
        const matchesQuery =
          `${file.name} ${file.module} ${file.folder}`.toLowerCase().includes(query.trim().toLowerCase());
        const matchesFolder = selectedFolder ? file.folder === selectedFolder : true;

        return matchesQuery && matchesFolder && file.location === "explorador";
      }),
    [query, selectedFolder],
  );

  function toggleStar(id: string) {
    setStarred((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Arquivos" title="Explorador" description="Vista em grid/lista com preview lateral e ações locais." breadcrumbs={[{ href: "/arquivos", label: "Arquivos" }, { label: "Explorador" }]} />
      <FilterBar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar arquivo, pasta ou módulo"
        trailing={
          <>
            <select value={selectedFolder} onChange={(event) => setSelectedFolder(event.target.value)} className="rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-foreground outline-none">
              {folders.map((folder) => (
                <option key={folder.id}>{folder.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => setView("grid")} className={view === "grid" ? "rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground" : "rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-muted-foreground"}>Grid</button>
            <button type="button" onClick={() => setView("lista")} className={view === "lista" ? "rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground" : "rounded-full border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-muted-foreground"}>Lista</button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <SectionCard title="Pastas" description="Escopo de navegação lateral">
          <div className="space-y-2">
            {folders.map((folder) => (
              <button
                type="button"
                key={folder.id}
                onClick={() => setSelectedFolder(folder.name)}
                className={[
                  "w-full rounded-[1.3rem] border px-4 py-3 text-left transition",
                  selectedFolder === folder.name ? "border-accent/25 bg-accent/10" : "border-border bg-surface-2",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{folder.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{folder.module}</p>
                  </div>
                  <Pill>{folder.files}</Pill>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Arquivos" description="Itens do explorador com preview por clique">
          {filtered.length ? (
            view === "grid" ? (
              <div className="grid gap-3 md:grid-cols-2">
                {filtered.map((file) => (
                  <article
                    key={file.id}
                    className="rounded-[1.4rem] border border-border bg-surface-2 p-4 text-left transition hover:-translate-y-0.5"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedFile(file)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedFile(file);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-xs font-semibold text-foreground">{fileIcon(file.kind)}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{file.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{file.owner}</p>
                        </div>
                      </div>
                      <Pill tone={kindTone[file.kind]}>{file.kind}</Pill>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Pill>{file.size}</Pill>
                      <Pill>{file.updatedAt}</Pill>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={(event) => { event.stopPropagation(); toggleStar(file.id); }} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground">
                        {starred.includes(file.id) ? "Remover favorito" : "Favoritar"}
                      </button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedFile(file); }} className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-foreground">
                        Abrir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <DataTable
                items={filtered}
                getKey={(file) => file.id}
                onRowClick={setSelectedFile}
                columns={[
                  { header: "Arquivo", className: "min-w-[18rem]", cell: (file: FileItem) => <div><p className="font-semibold text-foreground">{file.name}</p><p className="mt-1 text-sm text-muted-foreground">{file.module} · {file.folder}</p></div> },
                  { header: "Tipo", cell: (file: FileItem) => <Pill tone={kindTone[file.kind]}>{file.kind}</Pill> },
                  { header: "Atualizado", cell: (file: FileItem) => <span className="font-semibold text-foreground">{file.updatedAt}</span> },
                  { header: "Tamanho", cell: (file: FileItem) => <span className="font-semibold text-foreground">{file.size}</span> },
                ]}
              />
            )
          ) : (
            <EmptyState title="Nada encontrado" description="A combinação de pasta e busca não encontrou arquivos no explorador." />
          )}
        </SectionCard>
      </div>

      <Drawer open={Boolean(selectedFile)} title={selectedFile?.name ?? ""} subtitle={selectedFile ? `${selectedFile.module} · ${selectedFile.folder}` : undefined} onClose={() => setSelectedFile(null)}>
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Pill tone={kindTone[selectedFile.kind]}>{selectedFile.kind}</Pill>
              <Pill>{selectedFile.owner}</Pill>
              <Pill>{selectedFile.updatedAt}</Pill>
            </div>
            <SectionCard title="Ações" description="Simulação local">
              <div className="flex flex-wrap gap-2">
                <Pill tone="accent">Abrir</Pill>
                <Pill tone="accent">Mover</Pill>
                <Pill tone="accent">Compartilhar</Pill>
                <Pill tone="accent">Excluir</Pill>
              </div>
            </SectionCard>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export function ArquivosRecentesPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Arquivos" title="Recentes" description="Cronologia de arquivos editados, enviados ou consultados." breadcrumbs={[{ href: "/arquivos", label: "Arquivos" }, { label: "Recentes" }]} />
      <Timeline items={activity} />
    </div>
  );
}

export function ArquivosCompartilhadosPage() {
  const shared = files.filter((file) => file.location === "compartilhados");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Arquivos" title="Compartilhados" description="Itens com permissão distribuída entre áreas e clientes." breadcrumbs={[{ href: "/arquivos", label: "Arquivos" }, { label: "Compartilhados" }]} />
      <DataTable
        items={shared}
        getKey={(file) => file.id}
        columns={[
          { header: "Arquivo", className: "min-w-[18rem]", cell: (file: FileItem) => <div><p className="font-semibold text-foreground">{file.name}</p><p className="mt-1 text-sm text-muted-foreground">{file.folder}</p></div> },
          { header: "Origem", cell: (file: FileItem) => <Pill>{file.owner}</Pill> },
          { header: "Destino", cell: (file: FileItem) => <Pill tone="accent">{file.sharedWith}</Pill> },
          { header: "Tipo", cell: (file: FileItem) => <Pill tone={kindTone[file.kind]}>{file.kind}</Pill> },
        ]}
      />
    </div>
  );
}

export function ArquivosFavoritosPage() {
  const favoriteFiles = files.filter((file) => file.starred);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      favoriteFiles.filter((file) =>
        `${file.name} ${file.module} ${file.folder}`.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [favoriteFiles, search],
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Arquivos" title="Favoritos" description="Materiais críticos, arquivos-chave e referências prioritárias." breadcrumbs={[{ href: "/arquivos", label: "Arquivos" }, { label: "Favoritos" }]} />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar favorito" />
      {filtered.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((file) => (
            <article key={file.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
              <p className="text-sm font-semibold text-foreground">{file.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{file.module} · {file.sharedWith}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone={kindTone[file.kind]}>{file.kind}</Pill>
                <Pill>{file.updatedAt}</Pill>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Sem favoritos" description="Nenhum arquivo favorito corresponde à busca atual." />
      )}
    </div>
  );
}

export function ArquivosLixeiraPage() {
  const trash = files.filter((file) => file.location === "lixeira");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Arquivos" title="Lixeira" description="Itens removidos recentemente com opção de restauração simulada." breadcrumbs={[{ href: "/arquivos", label: "Arquivos" }, { label: "Lixeira" }]} />
      {trash.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {trash.map((file) => (
            <article key={file.id} className="rounded-[1.4rem] border border-border bg-surface-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{file.folder}</p>
                </div>
                <Pill tone="warning">{file.kind}</Pill>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill>Restaurar</Pill>
                <Pill tone="warning">Excluir permanentemente</Pill>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Lixeira vazia" description="Nenhum item removido no conjunto mockado atual." />
      )}
    </div>
  );
}
