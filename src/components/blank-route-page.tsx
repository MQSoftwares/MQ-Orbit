import { MaintenancePage } from "@/components/maintenance-page";

type BlankRoutePageProps = {
  title?: string;
};

export function BlankRoutePage({ title }: BlankRoutePageProps) {
  return <MaintenancePage title={title} />;
}
