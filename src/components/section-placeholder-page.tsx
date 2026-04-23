import { MaintenancePage } from "@/components/maintenance-page";
import { notFound } from "next/navigation";

const defaultValidSubpages = new Set([
  "teste_1",
  "teste_2",
  "teste_3",
  "teste_4",
  "teste_5",
]);

const sectionValidSubpages = {
  agenda: new Set(["calendario", "compromissos", "lembretes"]),
} satisfies Record<string, Set<string>>;

type SectionPlaceholderPageProps = {
  section?: keyof typeof sectionValidSubpages;
  subpage: string;
};

export function SectionPlaceholderPage({
  section,
  subpage,
}: SectionPlaceholderPageProps) {
  const validSubpages = section
    ? sectionValidSubpages[section]
    : defaultValidSubpages;

  if (!validSubpages.has(subpage)) {
    notFound();
  }

  return <MaintenancePage title={subpage} />;
}
