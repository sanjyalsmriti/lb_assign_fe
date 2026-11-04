"use client";

import Link from "next/link";
import { Ban, CheckCircle2, Eye, LogOut, MoreHorizontal, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canApply, canEdit, canVoid } from "../constants";
import type { CheckpointEntry } from "../types";
import type { EntryAction } from "./entry-action-dialog";

interface EntryRowActionsProps {
  entry: CheckpointEntry;
  onAction: (entry: CheckpointEntry, action: EntryAction) => void;
}

export function EntryRowActions({ entry, onAction }: EntryRowActionsProps) {
  const { status } = entry;
  const hasStatusActions =
    canApply("verify", status) || canApply("reject", status) || canApply("exit", status) || canVoid(status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${entry.entryNo}`} />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem render={<Link href={`/checkpoint-entries/${entry.id}`} />}>
          <Eye />
          View details
        </DropdownMenuItem>
        {canEdit(status) && (
          <DropdownMenuItem render={<Link href={`/checkpoint-entries/${entry.id}/edit`} />}>
            <Pencil />
            Edit
          </DropdownMenuItem>
        )}

        {hasStatusActions && <DropdownMenuSeparator />}
        {canApply("verify", status) && (
          <DropdownMenuItem onClick={() => onAction(entry, "verify")}>
            <CheckCircle2 />
            Verify
          </DropdownMenuItem>
        )}
        {canApply("exit", status) && (
          <DropdownMenuItem onClick={() => onAction(entry, "exit")}>
            <LogOut />
            Mark exit
          </DropdownMenuItem>
        )}
        {canApply("reject", status) && (
          <DropdownMenuItem variant="destructive" onClick={() => onAction(entry, "reject")}>
            <XCircle />
            Reject
          </DropdownMenuItem>
        )}
        {canVoid(status) && (
          <DropdownMenuItem variant="destructive" onClick={() => onAction(entry, "void")}>
            <Ban />
            Void
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
