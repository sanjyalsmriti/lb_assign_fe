const STORAGE_KEY = "tqms:simulate-errors";

export const MOCK_FAIL_HEADER = "x-mock-fail";

export function isSimulatingErrors() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function setSimulatingErrors(enabled: boolean) {
  if (enabled) window.localStorage.setItem(STORAGE_KEY, "1");
  else window.localStorage.removeItem(STORAGE_KEY);
}
