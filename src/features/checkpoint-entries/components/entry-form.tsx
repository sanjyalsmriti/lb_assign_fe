"use client";

import Link from "next/link";
import { Controller, useForm, type DefaultValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { describedBy, FormField } from "@/components/form/form-field";
import { SelectField } from "@/components/form/select-field";
import { ApiError, getErrorMessage } from "@/lib/api-error";
import { fromLocalInputValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PURPOSE_LABELS } from "../constants";
import {
  entryFormSchema,
  type EntryFormInput,
  type EntryFormValues,
  type EntryInput,
} from "../schemas/entry-schema";
import { PURPOSES, type EntryLookups } from "../types";

const FORM_FIELDS = Object.keys(entryFormSchema.shape);

interface EntryFormProps {
  defaultValues: DefaultValues<EntryFormInput>;
  lookups: EntryLookups;
  submitLabel: string;
  cancelHref: string;
  /** keep submit disabled until something changes (edit mode) */
  requireChanges?: boolean;
  onSubmit: (input: EntryInput) => Promise<unknown>;
}

export function EntryForm({
  defaultValues,
  lookups,
  submitLabel,
  cancelHref,
  requireChanges,
  onSubmit,
}: EntryFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EntryFormInput, unknown, EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({ ...values, arrivedAt: fromLocalInputValue(values.arrivedAt) });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        const fields = Object.entries(error.fieldErrors).filter(([name]) => FORM_FIELDS.includes(name));
        fields.forEach(([name, messages]) => {
          setError(name as Path<EntryFormInput>, { type: "server", message: messages[0] });
        });
        if (fields[0]) setFocus(fields[0][0] as Path<EntryFormInput>);
      }
      toast.error(getErrorMessage(error));
    }
  });

  const fieldProps = (name: keyof EntryFormInput, hint?: string) => ({
    id: name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": describedBy(name, errors[name]?.message, hint),
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle & driver</CardTitle>
          <CardDescription>Details from the vehicle registration and driver license.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="vehicleNo" label="Vehicle number" required error={errors.vehicleNo?.message} hint="e.g. BA 2 KHA 4521">
            <Input
              {...register("vehicleNo")}
              {...fieldProps("vehicleNo", "e.g. BA 2 KHA 4521")}
              autoComplete="off"
              className="h-9 uppercase"
            />
          </FormField>

          <FormField id="vehicleTypeId" label="Vehicle type" required error={errors.vehicleTypeId?.message}>
            <Controller
              control={control}
              name="vehicleTypeId"
              render={({ field }) => (
                <SelectField
                  id="vehicleTypeId"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={lookups.vehicleTypes}
                  placeholder="Select vehicle type"
                  invalid={!!errors.vehicleTypeId}
                  describedBy={describedBy("vehicleTypeId", errors.vehicleTypeId?.message)}
                />
              )}
            />
          </FormField>

          <FormField id="driverName" label="Driver name" required error={errors.driverName?.message}>
            <Input {...register("driverName")} {...fieldProps("driverName")} autoComplete="off" className="h-9" />
          </FormField>

          <FormField id="driverPhone" label="Driver phone" required error={errors.driverPhone?.message} hint="10 digits, starts with 97 or 98">
            <Input
              {...register("driverPhone")}
              {...fieldProps("driverPhone", "10 digits, starts with 97 or 98")}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className="h-9"
            />
          </FormField>

          <FormField id="licenseNo" label="License number" required error={errors.licenseNo?.message}>
            <Input {...register("licenseNo")} {...fieldProps("licenseNo")} autoComplete="off" className="h-9" />
          </FormField>

          <FormField id="transporterId" label="Transporter" required error={errors.transporterId?.message}>
            <Controller
              control={control}
              name="transporterId"
              render={({ field }) => (
                <SelectField
                  id="transporterId"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={lookups.transporters}
                  placeholder="Select transporter"
                  invalid={!!errors.transporterId}
                  describedBy={describedBy("transporterId", errors.transporterId?.message)}
                />
              )}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Load & checkpoint</CardTitle>
          <CardDescription>What the vehicle carries and where it arrived.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="productId" label="Product" required error={errors.productId?.message}>
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <SelectField
                  id="productId"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={lookups.products}
                  placeholder="Select product"
                  invalid={!!errors.productId}
                  describedBy={describedBy("productId", errors.productId?.message)}
                />
              )}
            />
          </FormField>

          <FormField id="quantity" label="Quantity (MT)" required error={errors.quantity?.message}>
            <Input
              {...register("quantity", { valueAsNumber: true })}
              {...fieldProps("quantity")}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              className="h-9"
            />
          </FormField>

          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">
              Purpose <span className="text-destructive" aria-hidden>*</span>
            </legend>
            <div
              className="grid grid-cols-2 gap-2"
              aria-describedby={describedBy("purpose", errors.purpose?.message)}
            >
              {PURPOSES.map((purpose) => (
                <label
                  key={purpose}
                  className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5 has-checked:text-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
                >
                  <input type="radio" value={purpose} {...register("purpose")} className="sr-only" />
                  {PURPOSE_LABELS[purpose]}
                </label>
              ))}
            </div>
            {errors.purpose && (
              <p id="purpose-error" role="alert" className="text-xs font-medium text-destructive">
                {errors.purpose.message}
              </p>
            )}
          </fieldset>

          <FormField id="challanNo" label="Challan number" error={errors.challanNo?.message}>
            <Input {...register("challanNo")} {...fieldProps("challanNo")} autoComplete="off" className="h-9" />
          </FormField>

          <FormField id="checkpointId" label="Checkpoint" required error={errors.checkpointId?.message}>
            <Controller
              control={control}
              name="checkpointId"
              render={({ field }) => (
                <SelectField
                  id="checkpointId"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={lookups.checkpoints}
                  placeholder="Select checkpoint"
                  invalid={!!errors.checkpointId}
                  describedBy={describedBy("checkpointId", errors.checkpointId?.message)}
                />
              )}
            />
          </FormField>

          <FormField id="arrivedAt" label="Arrived at" required error={errors.arrivedAt?.message}>
            <Input {...register("arrivedAt")} {...fieldProps("arrivedAt")} type="datetime-local" className="h-9" />
          </FormField>

          <FormField id="remarks" label="Remarks" error={errors.remarks?.message} className="sm:col-span-2">
            <Textarea {...register("remarks")} {...fieldProps("remarks")} rows={3} maxLength={250} />
          </FormField>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Link href={cancelHref} className={cn(buttonVariants({ variant: "outline" }), "h-9")}>
          Cancel
        </Link>
        <Button type="submit" className="h-9" disabled={isSubmitting || (requireChanges && !isDirty)}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
