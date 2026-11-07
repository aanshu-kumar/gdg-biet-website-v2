"use server";

import { getSupabase } from "@/lib/supabase";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Echoed back on error so the form can refill what the visitor typed. */
  values?: { name: string; email: string; message: string };
  attempt?: number;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot: real visitors never see or fill this field.
  if (form.get("company")) return { status: "success" };

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  const fail = (msg: string): ContactState => ({
    status: "error",
    message: msg,
    values: { name, email, message },
    attempt: Date.now(),
  });

  if (!name || !email || !message) return fail("Please fill in every field.");
  if (!EMAIL.test(email)) return fail("That email address doesn't look right.");
  if (name.length > 120 || message.length > 5000) return fail("Your message is too long.");

  const supabase = getSupabase();
  if (!supabase) {
    return fail("The contact form isn't connected yet — please email us instead.");
  }

  const { error } = await supabase.from("contact_messages").insert({ name, email, message });
  if (error) {
    console.error("[contact] insert failed:", error.message);
    return fail("Something went wrong. Please try again or email us.");
  }
  return { status: "success" };
}
