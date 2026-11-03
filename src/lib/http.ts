import axios, { AxiosError } from "axios";
import type { ApiErrorBody } from "@/types/api";
import { ApiError } from "./api-error";
import { isSimulatingErrors, MOCK_FAIL_HEADER } from "./simulate-errors";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  if (isSimulatingErrors()) {
    config.headers.set(MOCK_FAIL_HEADER, "1");
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check your connection."),
      );
    }

    const { status, data } = error.response;
    const body = data?.error;

    return Promise.reject(
      new ApiError(
        status,
        body?.code ?? "UNKNOWN_ERROR",
        body?.message ?? "Something went wrong. Please try again.",
        body?.fieldErrors,
      ),
    );
  },
);
