import type { Metadata } from "next";
import { EntryEdit } from "@/features/checkpoint-entries/components/entry-edit";

export const metadata: Metadata = { title: "Edit Entry" };

export default async function EditEntryPage({ params }: PageProps<"/checkpoint-entries/[id]/edit">) {
  const { id } = await params;
  return <EntryEdit id={id} />;
}
