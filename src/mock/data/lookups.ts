import type { LookupOption } from "@/types/api";

export const checkpoints: LookupOption[] = [
  { value: "cp-birgunj", label: "Birgunj Dry Port Gate" },
  { value: "cp-bhairahawa", label: "Bhairahawa Customs Point" },
  { value: "cp-biratnagar", label: "Biratnagar Gate" },
  { value: "cp-nepalgunj", label: "Nepalgunj Checkpost" },
  { value: "cp-kakarbhitta", label: "Kakarbhitta Checkpost" },
  { value: "cp-hetauda", label: "Hetauda Industrial Gate" },
];

export const transporters: LookupOption[] = [
  { value: "tr-shree-krishna", label: "Shree Krishna Transport" },
  { value: "tr-gandaki", label: "Gandaki Dhuwani Sewa" },
  { value: "tr-everest", label: "Everest Logistics Pvt. Ltd." },
  { value: "tr-himalayan", label: "Himalayan Cargo Movers" },
  { value: "tr-sagarmatha", label: "Sagarmatha Transport Co." },
  { value: "tr-lumbini", label: "Lumbini Goods Carrier" },
  { value: "tr-janakpur", label: "Janakpur Dhuwani Sewa" },
  { value: "tr-mahakali", label: "Mahakali Freight" },
];

export const products: LookupOption[] = [
  { value: "pr-opc", label: "Cement (OPC)" },
  { value: "pr-ppc", label: "Cement (PPC)" },
  { value: "pr-clinker", label: "Clinker" },
  { value: "pr-diesel", label: "Diesel" },
  { value: "pr-petrol", label: "Petrol" },
  { value: "pr-lpg", label: "LPG" },
  { value: "pr-rice", label: "Rice" },
  { value: "pr-sugar", label: "Sugar" },
  { value: "pr-iron-rod", label: "Iron Rods" },
  { value: "pr-urea", label: "Fertilizer (Urea)" },
];

export const vehicleTypes: LookupOption[] = [
  { value: "vt-truck-10", label: "Truck (10 wheel)" },
  { value: "vt-truck-6", label: "Truck (6 wheel)" },
  { value: "vt-tanker", label: "Tanker" },
  { value: "vt-trailer", label: "Trailer" },
  { value: "vt-container", label: "Container" },
  { value: "vt-mini", label: "Mini Truck" },
];

export const lookups = {
  checkpoints,
  transporters,
  products,
  "vehicle-types": vehicleTypes,
};

export function findLabel(options: LookupOption[], value: string) {
  return options.find((option) => option.value === value)?.label;
}
