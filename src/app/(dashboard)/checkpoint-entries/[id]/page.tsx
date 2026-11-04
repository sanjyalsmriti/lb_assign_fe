import type { Metadata } from "next";
import { EntryDetail } from "@/features/checkpoint-entries/components/entry-detail";

export const metadata: Metadata = { title: "Entry Details" };

export default async function EntryDetailPage({ params }: PageProps<"/checkpoint-entries/[id]">) {
  const { id } = await params;
  return <EntryDetail id={id} />;
}
