import type { NextRequest } from "next/server";
import { handle, json, readJson } from "@/mock/http";
import { createEntry, listEntries } from "@/mock/services/entries-service";

export function GET(request: NextRequest) {
  return handle(request, () => json(listEntries(request.nextUrl.searchParams)));
}

export function POST(request: NextRequest) {
  return handle(request, async () => {
    const entry = createEntry(await readJson(request));
    return json(
      { data: entry, message: "Checkpoint entry created successfully" },
      { status: 201, headers: { Location: `/api/checkpoint-entries/${entry.id}` } },
    );
  });
}
