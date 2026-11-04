import { z } from "zod";
import { PURPOSES } from "../types";

const required = (label: string) => z.string({ error: `${label} is required` });
const requiredSelect = (label: string) => required(label).min(1, `${label} is required`);

export const entrySchema = z.object({
  vehicleNo: required("Vehicle number")
    .trim()
    .toUpperCase()
    .min(1, "Vehicle number is required")
    .regex(/^[A-Z0-9][A-Z0-9 -]{4,18}[A-Z0-9]$/, "Use letters and numbers only, e.g. BA 2 KHA 4521"),
  vehicleTypeId: requiredSelect("Vehicle type"),
  driverName: required("Driver name")
    .trim()
    .min(2, "Driver name must be at least 2 characters")
    .max(60, "Driver name is too long"),
  driverPhone: required("Driver phone")
    .trim()
    .regex(/^9[78]\d{8}$/, "Enter a 10 digit mobile number starting with 97 or 98"),
  licenseNo: required("License number")
    .trim()
    .min(5, "License number must be at least 5 characters")
    .max(20, "License number is too long"),
  transporterId: requiredSelect("Transporter"),
  checkpointId: requiredSelect("Checkpoint"),
  productId: requiredSelect("Product"),
  purpose: z.enum(PURPOSES, { error: "Purpose is required" }),
  quantity: z
    .number({ error: "Quantity is required" })
    .positive("Quantity must be greater than 0")
    .max(60, "Quantity can't be more than 60 MT"),
  challanNo: z.string().trim().max(30, "Challan number is too long").default(""),
  arrivedAt: required("Arrival time")
    .min(1, "Arrival time is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date and time")
    .refine((value) => Date.parse(value) <= Date.now() + 60_000, "Arrival time can't be in the future"),
  remarks: z.string().trim().max(250, "Remarks can be at most 250 characters").default(""),
});

export type EntryInput = z.infer<typeof entrySchema>;

export const reasonSchema = z
  .string({ error: "Please give a reason" })
  .trim()
  .min(5, "Please give a reason (at least 5 characters)")
  .max(250, "Reason can be at most 250 characters");

export const statusChangeSchema = z
  .object({
    action: z.enum(["verify", "reject", "exit"], { error: "Unknown action" }),
    reason: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action !== "reject") return;
    const result = reasonSchema.safeParse(value.reason ?? "");
    if (!result.success) {
      ctx.addIssue({ code: "custom", path: ["reason"], message: result.error.issues[0].message });
    }
  });

export const voidSchema = z.object({ reason: reasonSchema });
