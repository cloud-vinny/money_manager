export const toCents = (n: number) => Math.round((n || 0) * 100);
export const fromCents = (n: number | null | undefined) => ((n ?? 0) / 100);

import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Single-user demo id (persisted locally)
export const getOrCreateDemoUser = () => {
  if (typeof window === "undefined") return "demo-user-placeholder";
  let id = localStorage.getItem("demo_user_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("demo_user_id", id); }
  return id;
};

export const getMonthStart = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
