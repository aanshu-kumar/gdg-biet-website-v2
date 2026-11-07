"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";

export type ActionResult = { error: string } | void;

const PendingContext = createContext(false);
/** True while the enclosing ActionForm's action is running. */
export const useActionPending = () => useContext(PendingContext);

/**
 * Form that runs a server action without React's automatic form reset, so a
 * validation error never wipes what the person typed (or the files they
 * picked). The action returns `{ error }` to show a message, or redirects on
 * success. The clicked submit button's name/value (e.g. intent=publish) is sent.
 */
export function ActionForm({
  action,
  className,
  children,
}: {
  action: (form: FormData) => Promise<ActionResult>;
  className?: string;
  children: React.ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const data = new FormData(e.currentTarget, submitter);
        setError(null);
        startTransition(async () => {
          const result = await action(data);
          if (result?.error) {
            setError(result.error);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
      }}
    >
      {error && (
        <p role="alert" className="mb-6 flex items-start gap-2 rounded-2xl bg-g-red-tint px-4 py-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-g-red" />
          {error}
        </p>
      )}
      <PendingContext.Provider value={pending}>{children}</PendingContext.Provider>
    </form>
  );
}
