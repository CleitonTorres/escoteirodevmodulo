import TrilhaView, { type TrilhaQuery } from "./trilha-view";

export default function Page({ searchParams }: { searchParams: Promise<TrilhaQuery> }) {
  return <TrilhaView searchParams={searchParams} />;
}
