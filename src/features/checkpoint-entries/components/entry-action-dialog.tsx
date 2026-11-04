"use client";

import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { ApiError, getErrorMessage } from "@/lib/api-error";
import { entryKeys } from "../api/query-keys";
import { useChangeEntryStatus, useVoidEntry } from "../hooks/use-entries";
import { reasonSchema } from "../schemas/entry-schema";
import type { CheckpointEntry, StatusAction } from "../types";

export type EntryAction = StatusAction | "void";

export interface PendingAction {
  entry: CheckpointEntry;
  action: EntryAction;
}

const validateReason = (value: string) => {
  const result = reasonSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
};

function dialogCopy(action: EntryAction, entry: CheckpointEntry) {
  const subject = `${entry.entryNo} (${entry.vehicleNo})`;
  switch (action) {
    case "verify":
      return {
        title: "Verify entry?",
        description: `Documents for ${subject} are checked and OK. A queue token will be issued.`,
        confirmLabel: "Verify & issue token",
        success: "Entry verified",
      };
    case "reject":
      return {
        title: "Reject entry?",
        description: `${subject} will be marked as rejected. This can't be undone.`,
        confirmLabel: "Reject entry",
        destructive: true,
        reasonLabel: "Reason for rejection",
        success: "Entry rejected",
      };
    case "exit":
      return {
        title: "Mark as exited?",
        description: `Confirm that ${subject} has left the checkpoint.`,
        confirmLabel: "Mark exit",
        success: "Vehicle marked as exited",
      };
    case "void":
      return {
        title: "Void entry?",
        description: `${subject} will be voided and kept only for records. This can't be undone.`,
        confirmLabel: "Void entry",
        destructive: true,
        reasonLabel: "Reason for voiding",
        success: "Entry voided",
      };
  }
}

interface EntryActionDialogProps {
  pending: PendingAction | null;
  onClose: () => void;
}

export function EntryActionDialog({ pending, onClose }: EntryActionDialogProps) {
  const queryClient = useQueryClient();
  const changeStatus = useChangeEntryStatus();
  const voidEntry = useVoidEntry();
  const isPending = changeStatus.isPending || voidEntry.isPending;

  if (!pending) return null;

  const { entry, action } = pending;
  const copy = dialogCopy(action, entry);

  const handleConfirm = (reason: string) => {
    const options = {
      onSuccess: (updated: CheckpointEntry) => {
        toast.success(copy.success, {
          description: updated.tokenNo && action === "verify" ? `Token ${updated.tokenNo}` : entry.entryNo,
        });
        onClose();
      },
      onError: (error: Error) => {
        toast.error(getErrorMessage(error));
        // someone else may have changed the entry, refresh what's on screen
        if (error instanceof ApiError && error.status === 409) {
          queryClient.invalidateQueries({ queryKey: entryKeys.all });
          onClose();
        }
      },
    };

    if (action === "void") {
      voidEntry.mutate({ id: entry.id, reason }, options);
    } else {
      changeStatus.mutate({ id: entry.id, action, reason: reason || undefined }, options);
    }
  };

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={copy.title}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      destructive={copy.destructive}
      pending={isPending}
      reason={
        copy.reasonLabel
          ? { label: copy.reasonLabel, placeholder: "Write a short reason…", validate: validateReason }
          : undefined
      }
      onConfirm={handleConfirm}
    />
  );
}
