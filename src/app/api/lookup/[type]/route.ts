import type { NextRequest } from "next/server";
import { handle, json, notFound } from "@/mock/http";
import { lookups } from "@/mock/data/lookups";

export function GET(request: NextRequest, ctx: RouteContext<"/api/lookup/[type]">) {
  return handle(request, async () => {
    const { type } = await ctx.params;
    if (!(type in lookups)) throw notFound(`Lookup "${type}"`);
    return json({ data: lookups[type as keyof typeof lookups] });
  });
}
