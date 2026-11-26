import TrilhaView, { type TrilhaQuery } from "@/app/trilha-view";

export default function PreviewPage({ searchParams }: { searchParams: Promise<TrilhaQuery> }) {
  return <TrilhaView searchParams={searchParams} visualizacao />;
}
