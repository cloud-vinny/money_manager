"use client";
import { useEffect, useState } from "react";
import { addExpense, fetchSummary, ensureProfile, getRecurring, setRecurringActive, upsertRecurring } from "../actions";
import { fromCents, getOrCreateDemoUser } from "@/lib/supabase";
import { Modal } from "../components/Modal";

export default function SpendPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [sum, setSum] = useState<any>(null);
  const [rec, setRec] = useState<{amount_cents:number, active:boolean}>({amount_cents:0, active:false});
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    const id = getOrCreateDemoUser();
    setUserId(id);
    if (id) ensureProfile(id).then(() => refresh(id));
  }, []);

  async function refresh(id: string) {
    const [s, r] = await Promise.all([fetchSummary(id), getRecurring(id)]);
    setSum(s); 
    setRec(r.spend);
  }

  async function onToggle() {
    if(!userId) return;
    const res = await setRecurringActive(userId, 'spend', !rec.active);
    if(!res.ok) { 
      setErr("Not enough balance to activate this rule. Try reducing the amount first."); 
      return; 
    }
    await refresh(userId);
  }

  async function onUpdateAmount() {
    if(!userId) return; 
    const amt = typeof amount==='number'?amount:parseFloat(String(amount||0));
    if(isNaN(amt)||amt<0) { 
      setErr("Enter a valid amount."); 
      return; 
    }
    const res = await upsertRecurring(userId,'spend', amt);
    if(!res.ok) { 
      setErr("Not enough balance for that amount while active."); 
      return; 
    }
    await refresh(userId);
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault(); 
    if(!userId) return;
    const amt = typeof amount==='number'?amount:parseFloat(String(amount||0));
    if(isNaN(amt)||amt<=0) { 
      setErr("Enter a valid expense amount."); 
      return; 
    }
    const r = await addExpense(userId, merchant, amt, category);
    if(!r.ok) { 
      setErr("Not enough balance."); 
      return; 
    }
    setMerchant(""); 
    setAmount(""); 
    setCategory("");
    await refresh(userId);
  }

  return (
    <main>
      <section>
        <h2>Recurring Spend Rule (bills etc.)</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input 
            type="number" 
            step="0.01" 
            defaultValue={fromCents(rec.amount_cents)} 
            onChange={e=>setAmount(parseFloat(e.target.value))} 
            placeholder="Amount"
            style={{ width: '150px' }}
          />
          <button onClick={onUpdateAmount}>Save Amount</button>
          <button 
            onClick={onToggle} 
            style={{ 
              background: rec.active ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6b7280, #4b5563)'
            }}
          >
            {rec.active ? 'Active' : 'Inactive'}
          </button>
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Remaining: ${fromCents(sum?.remaining_cents ?? 0).toFixed(2)}
        </div>
      </section>

      <section>
        <h2>Add One-off Expense</h2>
        <form onSubmit={onAdd}>
          <input 
            value={merchant} 
            onChange={e=>setMerchant(e.target.value)} 
            placeholder="Merchant (e.g., Starbucks)" 
          />
          <input 
            type="number" 
            step="0.01" 
            value={amount} 
            onChange={e=>setAmount(e.target.value===""?"":parseFloat(e.target.value))} 
            placeholder="Amount" 
          />
          <input 
            value={category} 
            onChange={e=>setCategory(e.target.value)} 
            placeholder="Category (optional)" 
          />
          <button type="submit">Add Expense</button>
        </form>
      </section>

      <section>
        <h2>Month Totals</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Recurring Spend</div>
            <div className="summary-value">${fromCents(sum?.rec_spend_cents ?? 0).toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">One-off Expenses</div>
            <div className="summary-value">${fromCents(sum?.expense_cents ?? 0).toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Spent</div>
            <div className="summary-value">${fromCents((sum?.rec_spend_cents ?? 0) + (sum?.expense_cents ?? 0)).toFixed(2)}</div>
          </div>
        </div>
      </section>

      <Modal open={!!err} onClose={()=>setErr(null)} title="Blocked">
        {err}
      </Modal>
    </main>
  );
}
