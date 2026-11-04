import type { CheckpointEntry } from "@/features/checkpoint-entries/types";
import { seedEntries } from "./seed";

interface MockDb {
  entries: CheckpointEntry[];
  entrySeq: number;
  tokenSeq: number;
}

// kept on globalThis so data survives hot reloads during the dev session
const globalForDb = globalThis as typeof globalThis & { __tqmsMockDb?: MockDb };

export function getDb(): MockDb {
  if (!globalForDb.__tqmsMockDb) {
    const { entries, tokenSeq } = seedEntries();
    globalForDb.__tqmsMockDb = { entries, entrySeq: entries.length, tokenSeq };
  }
  return globalForDb.__tqmsMockDb;
}
