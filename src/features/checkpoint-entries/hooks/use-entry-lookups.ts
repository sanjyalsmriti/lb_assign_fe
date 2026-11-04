import type { EntryLookups } from "../types";
import { useLookup } from "./use-entries";

export function useEntryLookups() {
  const checkpoints = useLookup("checkpoints");
  const transporters = useLookup("transporters");
  const products = useLookup("products");
  const vehicleTypes = useLookup("vehicle-types");
  const queries = [checkpoints, transporters, products, vehicleTypes];

  const data: EntryLookups | undefined =
    checkpoints.data && transporters.data && products.data && vehicleTypes.data
      ? {
          checkpoints: checkpoints.data,
          transporters: transporters.data,
          products: products.data,
          vehicleTypes: vehicleTypes.data,
        }
      : undefined;

  return {
    data,
    isError: queries.some((q) => q.isError),
    error: queries.find((q) => q.error)?.error,
    isFetching: queries.some((q) => q.isFetching),
    refetch: () => queries.forEach((q) => q.isError && q.refetch()),
  };
}
