"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  pending?: boolean;
  /** asks the user for a reason before confirming */
  reason?: {
    label: string;
    placeholder?: string;
    validate: (value: string) => string | undefined;
  };
  onConfirm: (reason: string) => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  pending,
  reason,
  onConfirm,
}: ConfirmDialogProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();

  const handleOpenChange = (next: boolean) => {
    if (pending) return;
    if (!next) {
      setText("");
      setError(undefined);
    }
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (reason) {
      const message = reason.validate(text);
      setError(message);
      if (message) return;
    }
    onConfirm(text.trim());
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {reason && (
          <div className="space-y-1.5">
            <Label htmlFor="confirm-reason">
              {reason.label}
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </Label>
            <Textarea
              id="confirm-reason"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(reason.validate(e.target.value));
              }}
              placeholder={reason.placeholder}
              rows={3}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "confirm-reason-error" : undefined}
              autoFocus
            />
            {error && (
              <p id="confirm-reason-error" role="alert" className="text-xs font-medium text-destructive">
                {error}
              </p>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
