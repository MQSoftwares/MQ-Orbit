import { SectionPlaceholderPage } from "@/components/section-placeholder-page";

type KanbanSubpagePageProps = {
  params: Promise<{
    subpage: string;
  }>;
};

export default async function KanbanSubpagePage({
  params,
}: KanbanSubpagePageProps) {
  const { subpage } = await params;

  return <SectionPlaceholderPage subpage={subpage} />;
}
