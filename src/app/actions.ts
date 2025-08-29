"use server";
import { supabase, toCents, getMonthStart } from "@/lib/supabase";

export async function ensureProfile(user_id: string) {
  const { error } = await supabase.from("profiles").upsert({ id: user_id });
  if (error) {
    console.error("Error creating profile:", error);
    throw new Error("Failed to create profile");
  }
}

export async function ensurePeriod(user_id: string, d = new Date()) {
  const month_start = getMonthStart(d).toISOString().slice(0,10);
  let { data } = await supabase
    .from("periods")
    .select("id")
    .eq("user_id", user_id)
    .eq("month_start", month_start)
    .maybeSingle();
  if (!data) {
    const ins = await supabase
      .from("periods")
      .insert({ user_id, month_start })
      .select("id")
      .single();
    if (ins.error) {
      console.error("Error creating period:", ins.error);
      throw new Error("Failed to create period");
    }
    data = ins.data;
  }
  return data?.id as string;
}

// ---------- recurring CRUD ----------
export async function upsertRecurring(user_id: string, kind: 'savings'|'investment'|'spend', amount: number) {
  const amount_cents = toCents(amount);
  const { data: existing } = await supabase
    .from("recurring_allocations")
    .select("id, active, amount_cents")
    .eq("user_id", user_id)
    .eq("kind", kind)
    .maybeSingle();

  // If currently active and we are increasing amount, we must pass guard
  if (existing?.active) {
    const delta = amount_cents - (existing.amount_cents ?? 0);
    if (delta > 0) {
      const ok = await canAfford(user_id, delta);
      if (!ok) return { ok: false as const, reason: "INSUFFICIENT_BALANCE" };
    }
  }

  const { error } = await supabase
    .from("recurring_allocations")
    .upsert({ user_id, kind, amount_cents })
    .select()
    .single();
  return { ok: !error, reason: error?.message } as const;
}

export async function setRecurringActive(user_id: string, kind: 'savings'|'investment'|'spend', active: boolean) {
  if (active) {
    // turning ON → must be able to afford full amount
    const { data } = await supabase
      .from("recurring_allocations")
      .select("amount_cents")
      .eq("user_id", user_id)
      .eq("kind", kind)
      .single();
    const amt = data?.amount_cents ?? 0;
    const ok = await canAfford(user_id, amt);
    if (!ok) return { ok: false as const, reason: "INSUFFICIENT_BALANCE" };
  }
  const { error } = await supabase
    .from("recurring_allocations")
    .upsert({ user_id, kind, active })
    .select()
    .single();
  return { ok: !error, reason: error?.message } as const;
}

// ---------- income & one-offs with guards ----------
export async function addIncome(user_id: string, amount: number, note?: string) {
  const period_id = await ensurePeriod(user_id);
  await supabase.from("incomes").insert({ user_id, period_id, amount_cents: toCents(amount), note });
  return { ok: true as const };
}

export async function addExpense(user_id: string, merchant: string, amount: number, category?: string) {
  const amt = toCents(amount);
  const ok = await canAfford(user_id, amt);
  if (!ok) return { ok: false as const, reason: "INSUFFICIENT_BALANCE" };
  const period_id = await ensurePeriod(user_id);
  await supabase.from("expenses").insert({ user_id, period_id, merchant, amount_cents: amt, category });
  return { ok: true as const };
}

export async function addSavingsTransfer(user_id: string, amount: number, note?: string) {
  const amt = toCents(amount);
  const ok = await canAfford(user_id, amt);
  if (!ok) return { ok: false as const, reason: "INSUFFICIENT_BALANCE" };
  const period_id = await ensurePeriod(user_id);
  await supabase.from("savings_transfers").insert({ user_id, period_id, amount_cents: amt, note });
  return { ok: true as const };
}

export async function addInvestmentTrade(user_id: string, amount: number, note?: string) {
  const amt = toCents(amount);
  const ok = await canAfford(user_id, amt);
  if (!ok) return { ok: false as const, reason: "INSUFFICIENT_BALANCE" };
  const period_id = await ensurePeriod(user_id);
  await supabase.from("investment_trades").insert({ user_id, period_id, amount_cents: amt, note });
  return { ok: true as const };
}

// ---------- summaries ----------
export async function fetchSummary(user_id: string) {
  const period_id = await ensurePeriod(user_id);
  const month = await supabase
    .from("v_month_totals")
    .select("income_cents, expense_cents, savings_oneoff_cents, invest_oneoff_cents, month_start")
    .eq("user_id", user_id)
    .eq("period_id", period_id)
    .single();

  const rec = await getRecurringActive(user_id);
  const income = month.data?.income_cents ?? 0;
  const spent = month.data?.expense_cents ?? 0;
  const saved_one = month.data?.savings_oneoff_cents ?? 0;
  const invested_one = month.data?.invest_oneoff_cents ?? 0;

  const remaining = income - rec.rec_savings_cents - rec.rec_invest_cents - rec.rec_spend_cents - spent - saved_one - invested_one;
  return {
    income_cents: income,
    expense_cents: spent,
    savings_oneoff_cents: saved_one,
    invest_oneoff_cents: invested_one,
    rec_savings_cents: rec.rec_savings_cents,
    rec_invest_cents: rec.rec_invest_cents,
    rec_spend_cents: rec.rec_spend_cents,
    remaining_cents: remaining,
    month_start: month.data?.month_start
  };
}

export async function getRecurring(user_id: string) {
  const { data } = await supabase
    .from("recurring_allocations")
    .select("kind, amount_cents, active")
    .eq("user_id", user_id);
  const map = { savings: { amount_cents: 0, active: false }, investment: { amount_cents: 0, active: false }, spend: { amount_cents: 0, active: false } } as any;
  (data ?? []).forEach(r => { map[r.kind] = { amount_cents: r.amount_cents, active: r.active }; });
  return map as { [k in 'savings'|'investment'|'spend']: { amount_cents: number, active: boolean } };
}

async function getRecurringActive(user_id: string) {
  const { data } = await supabase
    .from("recurring_allocations")
    .select("kind, amount_cents, active")
    .eq("user_id", user_id)
    .eq("active", true);
  let rec_savings_cents=0, rec_invest_cents=0, rec_spend_cents=0;
  (data ?? []).forEach(r => {
    if (r.kind==='savings') rec_savings_cents += r.amount_cents;
    if (r.kind==='investment') rec_invest_cents += r.amount_cents;
    if (r.kind==='spend') rec_spend_cents += r.amount_cents;
  });
  return { rec_savings_cents, rec_invest_cents, rec_spend_cents };
}

export async function canAfford(user_id: string, newDeductionCents: number) {
  const s = await fetchSummary(user_id);
  return (s.remaining_cents - newDeductionCents) >= 0;
}
