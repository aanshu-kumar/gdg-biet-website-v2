"use client";

import { useFormStatus } from "react-dom";
import { useActionPending } from "@/components/dashboard/ActionForm";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Submit button that disables itself while its form's server action runs (plain or ActionForm). */
export function SubmitButton({ children, pendingText, ...props }: ButtonProps & { pendingText?: string }) {
  const { pending: formPending } = useFormStatus();
  const actionPending = useActionPending();
  const pending = formPending || actionPending;
  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? pendingText ?? "Saving…" : children}
    </Button>
  );
}

/** Submit button that asks for confirmation first (for deletes). */
export function ConfirmButton({ children, message, ...props }: ButtonProps & { message: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
