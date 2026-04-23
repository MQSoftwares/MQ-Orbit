import { SectionPlaceholderPage } from "@/components/section-placeholder-page";

type FinancasSubpagePageProps = {
  params: Promise<{
    subpage: string;
  }>;
};

export default async function FinancasSubpagePage({
  params,
}: FinancasSubpagePageProps) {
  const { subpage } = await params;

  return <SectionPlaceholderPage subpage={subpage} />;
}
