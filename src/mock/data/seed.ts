import type {
  CheckpointEntry,
  EntryStatus,
  StatusEvent,
} from "@/features/checkpoint-entries/types";
import { checkpoints, products, transporters, vehicleTypes } from "./lookups";

const DRIVERS = [
  "Ram Bahadur Thapa", "Shyam Kumar Yadav", "Bikash Gurung", "Sanjay Chaudhary",
  "Dipendra Rai", "Hari Prasad Adhikari", "Raju Shrestha", "Mohan Tamang",
  "Suresh Mahato", "Krishna Bhandari", "Prakash Magar", "Anil Kumar Shah",
  "Rajan Karki", "Gopal Sah", "Nabin Lama", "Bishnu Poudel", "Rajendra Mandal",
  "Santosh Khadka", "Kamal Thakur", "Arjun Bhattarai", "Bhim Bahadur KC",
  "Manoj Kushwaha", "Ganesh Limbu", "Sunil Pandey",
];

const ZONES = ["BA", "NA", "LU", "KO", "JA", "SA", "GA", "ME", "BHE"];
const HEAVY_CODES = ["KHA", "CHA", "PA"];
const OFFICERS = ["Sita Sharma", "Rabin Joshi", "Puja Basnet", "Kiran Oli"];

const REJECT_REASONS = [
  "Driver license expired",
  "Challan does not match the loaded product",
  "Vehicle fitness certificate missing",
  "Overloaded beyond permitted weight",
];
const VOID_REASONS = ["Duplicate entry created by mistake", "Wrong vehicle number entered"];

// small deterministic PRNG so the seed data is the same on every restart
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20261104);
const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)];
const between = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;

const HOUR = 60 * 60 * 1000;

function vehicleNumber() {
  return `${pick(ZONES)} ${between(1, 9)} ${pick(HEAVY_CODES)} ${between(1000, 9999)}`;
}

function phone() {
  return `${pick(["98", "97"])}${between(10000000, 99999999)}`;
}

function statusFor(ageHours: number): EntryStatus {
  const roll = random();
  if (ageHours < 6) return roll < 0.6 ? "arrived" : "verified";
  if (ageHours < 48) {
    if (roll < 0.25) return "arrived";
    if (roll < 0.65) return "verified";
    if (roll < 0.9) return "exited";
    return roll < 0.96 ? "rejected" : "voided";
  }
  if (roll < 0.82) return "exited";
  if (roll < 0.93) return "rejected";
  return "voided";
}

export function entryNumber(date: Date, seq: number) {
  const nepal = new Date(date.getTime() + 345 * 60_000);
  const yymm = nepal.toISOString().slice(2, 7).replace("-", "");
  return `CP-${yymm}-${String(seq).padStart(4, "0")}`;
}

export function seedEntries(count = 140) {
  const now = Date.now();
  // squared so more entries land in the last few days, like a real busy gate
  const arrivals = Array.from({ length: count }, () => now - random() ** 2 * 21 * 24 * HOUR).sort(
    (a, b) => a - b,
  );

  let tokenSeq = 0;
  const entries: CheckpointEntry[] = arrivals.map((arrivedAtMs, index) => {
    const ageHours = (now - arrivedAtMs) / HOUR;
    const status = statusFor(ageHours);
    const arrivedAt = new Date(arrivedAtMs);
    const checkpoint = pick(checkpoints);
    const transporter = pick(transporters);
    const product = pick(products);
    const vehicleType = product.label.match(/Diesel|Petrol|LPG/)
      ? vehicleTypes.find((v) => v.value === "vt-tanker")!
      : pick(vehicleTypes.filter((v) => v.value !== "vt-tanker"));
    const officer = pick(OFFICERS);

    const history: StatusEvent[] = [{ status: "arrived", at: arrivedAt.toISOString(), by: officer }];
    let tokenNo: string | null = null;
    let statusReason: string | null = null;
    let lastAt = arrivedAtMs;
    const step = () => {
      lastAt = Math.min(lastAt + between(10, 90) * 60_000, now);
      return new Date(lastAt).toISOString();
    };

    if (status === "verified" || status === "exited") {
      tokenNo = `T-${String(++tokenSeq).padStart(4, "0")}`;
      history.push({ status: "verified", at: step(), by: officer, note: `Token ${tokenNo} issued` });
    }
    if (status === "exited") {
      history.push({ status: "exited", at: step(), by: officer });
    }
    if (status === "rejected") {
      statusReason = pick(REJECT_REASONS);
      history.push({ status: "rejected", at: step(), by: officer, note: statusReason });
    }
    if (status === "voided") {
      statusReason = pick(VOID_REASONS);
      history.push({ status: "voided", at: step(), by: officer, note: statusReason });
    }

    const updatedAt = history[history.length - 1].at;

    return {
      id: `e${String(index + 1).padStart(4, "0")}`,
      entryNo: entryNumber(arrivedAt, index + 1),
      tokenNo,
      vehicleNo: vehicleNumber(),
      vehicleTypeId: vehicleType.value,
      vehicleTypeName: vehicleType.label,
      driverName: pick(DRIVERS),
      driverPhone: phone(),
      licenseNo: `0${between(1, 7)}-06-${String(between(100000, 999999)).padStart(8, "0")}`,
      transporterId: transporter.value,
      transporterName: transporter.label,
      checkpointId: checkpoint.value,
      checkpointName: checkpoint.label,
      productId: product.value,
      productName: product.label,
      purpose: random() < 0.7 ? "loading" : "unloading",
      quantity: vehicleType.value === "vt-mini" ? between(3, 8) : between(12, 40) + between(0, 9) / 10,
      challanNo: random() < 0.8 ? `CH-${between(100000, 999999)}` : "",
      remarks: random() < 0.15 ? "Driver requested early slot" : "",
      arrivedAt: arrivedAt.toISOString(),
      status,
      statusReason,
      history,
      createdAt: arrivedAt.toISOString(),
      updatedAt,
    };
  });

  return { entries, tokenSeq };
}
