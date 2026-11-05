import type { FieldErrors } from "@/types/api";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: FieldErrors,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, "NOT_FOUND", `${what} not found`);

export function json<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}

function errorResponse(status: number, code: string, message: string, fieldErrors?: FieldErrors) {
  return Response.json({ error: { code, message, ...(fieldErrors && { fieldErrors }) } }, { status });
}

const BASE_DELAY = Number(process.env.MOCK_DELAY_MS ?? 600);
const FAILURE_RATE = Number(process.env.MOCK_FAILURE_RATE ?? 0);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps a mock route: adds a realistic delay, optional failure injection
 * and turns thrown HttpErrors into the standard error body.
 */
export async function handle(request: Request, handler: () => Response | Promise<Response>) {
  await sleep(BASE_DELAY * (0.5 + Math.random()));

  if (Math.random() < FAILURE_RATE) {
    return errorResponse(500, "SERVER_ERROR", "The server ran into a problem. Please try again.");
  }

  try {
    return await handler();
  } catch (error) {
    if (error instanceof HttpError) {
      return errorResponse(error.status, error.code, error.message, error.fieldErrors);
    }
    console.error("[mock api]", error);
    return errorResponse(500, "SERVER_ERROR", "Unexpected server error.");
  }
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
}
