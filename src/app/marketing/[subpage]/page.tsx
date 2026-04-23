import { SectionPlaceholderPage } from "@/components/section-placeholder-page";

type MarketingSubpagePageProps = {
  params: Promise<{
    subpage: string;
  }>;
};

export default async function MarketingSubpagePage({
  params,
}: MarketingSubpagePageProps) {
  const { subpage } = await params;

  return <SectionPlaceholderPage subpage={subpage} />;
}
