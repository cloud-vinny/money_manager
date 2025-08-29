"use client";
import { useEffect, useState } from "react";
import { addIncome, fetchSummary, ensureProfile } from "./actions";
import { fromCents, getOrCreateDemoUser } from "@/lib/supabase";
import { Modal } from "./components/Modal";

export default function Page() {
  const [userId, setUserId] = useState<string | null>(null);
  const [sum, setSum] = useState<any>(null);
  const [income, setIncome] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const id = getOrCreateDemoUser();
    setUserId(id);
    if (id) ensureProfile(id).then(() => refresh(id));
  }, []);

  async function refresh(id: string) {
    const s = await fetchSummary(id);
    setSum(s);
  }

  async function onAddIncome(e: React.FormEvent) {
    e.preventDefault(); 
    if (!userId) return;
    const amt = typeof income === 'number' ? income : parseFloat(String(income||0));
    if (isNaN(amt) || amt <= 0) { 
      setErr("Enter a valid income amount."); 
      return; 
    }
    await addIncome(userId, amt, note);
    setIncome(""); 
    setNote("");
    await refresh(userId);
  }

  const savingsTotal = fromCents((sum?.rec_savings_cents ?? 0) + (sum?.savings_oneoff_cents ?? 0));
  const investTotal = fromCents((sum?.rec_invest_cents ?? 0) + (sum?.invest_oneoff_cents ?? 0));
  const spendTotal  = fromCents((sum?.rec_spend_cents ?? 0) + (sum?.expense_cents ?? 0));

  return (
    <main>
      <section>
        <h2>Add Income</h2>
        <form onSubmit={onAddIncome}>
          <input 
            type="number" 
            step="0.01" 
            value={income} 
            onChange={e=>setIncome(e.target.value===""?"":parseFloat(e.target.value))} 
            placeholder="e.g. 3500" 
          />
          <input 
            value={note} 
            onChange={e=>setNote(e.target.value)} 
            placeholder="note (optional)" 
          />
          <button type="submit">Add</button>
        </form>
      </section>

      <section>
        <h2>Financial Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Income</div>
            <div className="summary-value">${fromCents(sum?.income_cents ?? 0).toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Savings (recurring + one-offs)</div>
            <div className="summary-value">${savingsTotal.toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Investments (recurring + one-offs)</div>
            <div className="summary-value">${investTotal.toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Spending (recurring + one-offs)</div>
            <div className="summary-value">${spendTotal.toFixed(2)}</div>
          </div>
        </div>
      </section>

      <section className="remaining-balance">
        <h2>Remaining to Spend</h2>
        <div className="remaining-amount">${fromCents(sum?.remaining_cents ?? 0).toFixed(2)}</div>
        <div className="remaining-period">For {sum?.month_start}</div>
      </section>

      <Modal open={!!err} onClose={()=>setErr(null)} title="Oops">
        {err}
      </Modal>
    </main>
  );
}
