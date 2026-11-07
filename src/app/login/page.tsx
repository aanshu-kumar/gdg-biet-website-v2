import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Shape, ShapeLayer } from "@/components/Shapes";
import { getViewer } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";
import { signInWithGoogle } from "./actions";

export const metadata: Metadata = { title: "Team sign in", robots: { index: false } };

const errors: Record<string, string> = {
  not_invited:
    "This Google account doesn't have access yet. Ask your department lead or an admin to invite the email you signed in with.",
  auth: "Sign-in didn't complete. Please try again.",
  oauth: "Couldn't start Google sign-in. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; signed_out?: string }>;
}) {
  const { next, error, signed_out } = await searchParams;
  if (!error && (await getViewer())) redirect(safeNext(next));

  return (
    <div className="relative isolate flex min-h-[85vh] items-center justify-center px-4 pb-16 pt-28">
      <ShapeLayer>
        <Shape kind="circle" color="blue" className="left-[12%] top-[22%] w-28" />
        <Shape kind="triangle" color="yellow" className="bottom-[14%] left-[20%] w-20 -rotate-12" />
        <Shape kind="square" color="red" className="right-[16%] top-[26%] w-16 rotate-12" />
        <Shape kind="arc" color="green" className="bottom-[16%] right-[14%] w-28" />
      </ShapeLayer>

      <div className="glass relative w-full max-w-md rounded-4xl p-8 text-center md:p-10">
        <h1 className="font-display text-3xl font-medium tracking-tight">Team sign in</h1>
        <p className="mt-3 text-muted">
          For GDG On Campus BIET organizers and members. Access is by invitation.
        </p>

        {error && errors[error] && (
          <p role="alert" className="mt-6 rounded-2xl bg-g-red-tint px-4 py-3 text-left text-sm">
            {errors[error]}
          </p>
        )}
        {signed_out && !error && (
          <p className="mt-6 rounded-2xl bg-g-green-tint px-4 py-3 text-sm">You&apos;ve been signed out.</p>
        )}

        <form action={signInWithGoogle} className="mt-8">
          <input type="hidden" name="next" value={next ?? ""} />
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-bg px-6 font-medium transition-shadow hover:shadow-card"
          >
            <FcGoogle className="size-5" />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
