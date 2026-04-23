import { SectionPlaceholderPage } from "@/components/section-placeholder-page";

type HomeSubpagePageProps = {
  params: Promise<{
    subpage: string;
  }>;
};

export default async function HomeSubpagePage({ params }: HomeSubpagePageProps) {
  const { subpage } = await params;

  return <SectionPlaceholderPage subpage={subpage} />;
}
