import { Suspense } from "react";
import type { Metadata } from "next";
import { EntryList } from "@/features/checkpoint-entries/components/entry-list";

export const metadata: Metadata = { title: "Checkpoint Entries" };

export default function CheckpointEntriesPage() {
  return (
    <Suspense>
      <EntryList />
    </Suspense>
  );
}
