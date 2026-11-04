import type { Metadata } from "next";
import { EntryCreate } from "@/features/checkpoint-entries/components/entry-create";

export const metadata: Metadata = { title: "New Entry" };

export default function NewEntryPage() {
  return <EntryCreate />;
}
