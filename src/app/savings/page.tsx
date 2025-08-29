"use client";
import { useEffect, useState } from "react";
import { addSavingsTransfer, ensureProfile, fetchSummary, getRecurring, setRecurringActive, upsertRecurring } from "../actions";
import { fromCents, getOrCreateDemoUser } from "@/lib/supabase";
import { Modal } from "../components/Modal";

export default function SavingsPage() {
  const [userId, setUserId] = useState<string|null>(null);
  const [sum, setSum] = useState<any>(null);
  const [rec, setRec] = useState<{amount_cents:number, active:boolean}>({amount_cents:0, active:false});
  const [amount, setAmount] = useState<number|"">("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    const id = getOrCreateDemoUser(); 
    setUserId(id);
    if(id) ensureProfile(id).then(()=> refresh(id));
  },[]);

  async function refresh(id: string) {
    const [s, r] = await Promise.all([fetchSummary(id), getRecurring(id)]);
    setSum(s); 
    setRec(r.savings);
  }

  async function onToggle() {
    if(!userId) return;
    const res = await setRecurringActive(userId,'savings', !rec.active);
    if(!res.ok) { 
      setErr("Not enough balance to activate this rule."); 
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
    const res = await upsertRecurring(userId,'savings', amt);
    if(!res.ok) { 
      setErr("Not enough balance for that amount while active."); 
      return; 
    }
    await refresh(userId);
  }

  async function onOneOff(e: React.FormEvent) {
    e.preventDefault(); 
    if(!userId) return;
    const amt = typeof amount==='number'?amount:parseFloat(String(amount||0));
    if(isNaN(amt)||amt<=0) { 
      setErr("Enter a valid amount."); 
      return; 
    }
    const r = await addSavingsTransfer(userId, amt, note);
    if(!r.ok) { 
      setErr("Not enough balance."); 
      return; 
    }
    setAmount(""); 
    setNote("");
    await refresh(userId);
  }

  const totalSavings = fromCents((sum?.rec_savings_cents ?? 0) + (sum?.savings_oneoff_cents ?? 0));

  return (
    <main>
      <section>
        <h2>Recurring Savings Rule</h2>
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
          Saved (recurring + one-offs) this month: ${totalSavings.toFixed(2)}
        </div>
      </section>

      <section>
        <h2>Add One-off Savings Transfer</h2>
        <form onSubmit={onOneOff}>
          <input 
            type="number" 
            step="0.01" 
            value={amount} 
            onChange={e=>setAmount(e.target.value===""?"":parseFloat(e.target.value))} 
            placeholder="Amount (e.g., 1000)" 
          />
          <input 
            value={note} 
            onChange={e=>setNote(e.target.value)} 
            placeholder="Note (optional)" 
          />
          <button type="submit">Transfer to Savings</button>
        </form>
      </section>

      <section>
        <h2>Savings Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Recurring Savings</div>
            <div className="summary-value">${fromCents(sum?.rec_savings_cents ?? 0).toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">One-off Transfers</div>
            <div className="summary-value">${fromCents(sum?.savings_oneoff_cents ?? 0).toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Saved This Month</div>
            <div className="summary-value">${totalSavings.toFixed(2)}</div>
          </div>
        </div>
      </section>

      <section className="remaining-balance">
        <h2>Remaining to Spend</h2>
        <div className="remaining-amount">${fromCents(sum?.remaining_cents ?? 0).toFixed(2)}</div>
        <div className="remaining-period">For {sum?.month_start}</div>
      </section>

      <Modal open={!!err} onClose={()=>setErr(null)} title="Blocked">
        {err}
      </Modal>
    </main>
  );
}
