import { SectionPlaceholderPage } from "@/components/section-placeholder-page";

type ArquivosSubpagePageProps = {
  params: Promise<{
    subpage: string;
  }>;
};

export default async function ArquivosSubpagePage({
  params,
}: ArquivosSubpagePageProps) {
  const { subpage } = await params;

  return <SectionPlaceholderPage subpage={subpage} />;
}
