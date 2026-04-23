import { SectionPlaceholderPage } from "@/components/section-placeholder-page";

type AgendaSubpagePageProps = {
  params: Promise<{
    subpage: string;
  }>;
};

export default async function AgendaSubpagePage({
  params,
}: AgendaSubpagePageProps) {
  const { subpage } = await params;

  return <SectionPlaceholderPage section="agenda" subpage={subpage} />;
}
