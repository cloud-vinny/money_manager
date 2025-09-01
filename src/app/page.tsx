"use client";
import { useState } from "react";
import { addIncome, ensureProfile, deleteIncome } from "./actions";
import { fromCents } from "@/lib/supabase";
import { Modal } from "./components/Modal";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useApp } from "./context/AppContext";

export default function Page() {
  const { userId, summary: sum, incomes, loading, refreshData } = useApp();
  const [income, setIncome] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);

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
    await refreshData();
  }

  const savingsTotal = fromCents((sum?.rec_savings_cents ?? 0) + (sum?.savings_oneoff_cents ?? 0));
  const investTotal = fromCents((sum?.rec_invest_cents ?? 0) + (sum?.invest_oneoff_cents ?? 0));
  const spendTotal  = fromCents((sum?.rec_spend_cents ?? 0) + (sum?.expense_cents ?? 0));

  async function onDeleteIncome(incomeId: string) {
    if (!userId) return;
    await deleteIncome(userId, incomeId);
    await refreshData();
  }

  if (loading) {
    return (
      <main>
        <LoadingSpinner />
      </main>
    );
  }

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

      {incomes.length > 0 && (
        <section>
          <h2>Income History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {incomes.map((inc) => (
              <div key={inc.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    ${fromCents(inc.amount_cents).toFixed(2)}
                  </div>
                  {inc.note && (
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      {inc.note}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {new Date(inc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteIncome(inc.id)}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

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
