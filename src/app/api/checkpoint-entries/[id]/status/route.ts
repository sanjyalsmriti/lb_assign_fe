import type { NextRequest } from "next/server";
import { handle, json, readJson } from "@/mock/http";
import { changeStatus } from "@/mock/services/entries-service";

export function PATCH(request: NextRequest, ctx: RouteContext<"/api/checkpoint-entries/[id]/status">) {
  return handle(request, async () => {
    const { id } = await ctx.params;
    return json({ data: changeStatus(id, await readJson(request)), message: "Checkpoint entry status updated successfully" });
  });
}
