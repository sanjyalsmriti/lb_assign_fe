import type { NextRequest } from "next/server";
import { handle, json, readJson } from "@/mock/http";
import { getEntry, updateEntry, voidEntry } from "@/mock/services/entries-service";

type Context = RouteContext<"/api/checkpoint-entries/[id]">;

export function GET(request: NextRequest, ctx: Context) {
  return handle(request, async () => {
    const { id } = await ctx.params;
    return json({ data: getEntry(id), message: "Checkpoint entry retrieved successfully" });
  });
}

export function PATCH(request: NextRequest, ctx: Context) {
  return handle(request, async () => {
    const { id } = await ctx.params;
    return json({ data: updateEntry(id, await readJson(request)), message: "Checkpoint entry updated successfully" });
  });
}

// entries are never hard deleted; DELETE voids the entry and keeps it for audit
export function DELETE(request: NextRequest, ctx: Context) {
  return handle(request, async () => {
    const { id } = await ctx.params;
    return json({ data: voidEntry(id, await readJson(request)), message: "Checkpoint entry voided successfully" });
  });
}
