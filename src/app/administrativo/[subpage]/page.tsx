import { SectionPlaceholderPage } from "@/components/section-placeholder-page";

type AdministrativoSubpagePageProps = {
  params: Promise<{
    subpage: string;
  }>;
};

export default async function AdministrativoSubpagePage({
  params,
}: AdministrativoSubpagePageProps) {
  const { subpage } = await params;

  return <SectionPlaceholderPage subpage={subpage} />;
}
