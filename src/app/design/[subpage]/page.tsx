import { SectionPlaceholderPage } from "@/components/section-placeholder-page";

type DesignSubpagePageProps = {
  params: Promise<{
    subpage: string;
  }>;
};

export default async function DesignSubpagePage({
  params,
}: DesignSubpagePageProps) {
  const { subpage } = await params;

  return <SectionPlaceholderPage subpage={subpage} />;
}
