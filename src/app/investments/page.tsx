"use client";
import { useEffect, useState } from "react";
import { addInvestmentTrade, ensureProfile, fetchSummary, getRecurring, setRecurringActive, addRecurring, updateRecurring, deleteRecurring } from "../actions";
import { fromCents, getOrCreateDemoUser } from "@/lib/supabase";
import { Modal } from "../components/Modal";

export default function InvestmentsPage() {
  const [userId, setUserId] = useState<string|null>(null);
  const [sum, setSum] = useState<any>(null);
  const [recurringInvestments, setRecurringInvestments] = useState<any[]>([]);
  const [amount, setAmount] = useState<number|"">("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string|null>(null);
  
  // New recurring investment form
  const [newRecurringAmount, setNewRecurringAmount] = useState<number|"">("");
  const [newRecurringDescription, setNewRecurringDescription] = useState("");

  useEffect(() => {
    const id = getOrCreateDemoUser(); 
    setUserId(id);
    if(id) ensureProfile(id).then(()=> refresh(id));
  },[]);

  async function refresh(id: string) {
    const [s, r] = await Promise.all([fetchSummary(id), getRecurring(id)]);
    setSum(s); 
    setRecurringInvestments(r.filter((item: any) => item.kind === 'investment'));
  }

  async function onToggleRecurring(id: string, currentActive: boolean) {
    if(!userId) return;
    const res = await setRecurringActive(userId, id, !currentActive);
    if(!res.ok) { 
      setErr("Not enough balance to activate this rule. Try reducing the amount first."); 
      return; 
    }
    await refresh(userId);
  }

  async function onAddRecurring(e: React.FormEvent) {
    e.preventDefault();
    if(!userId) return;
    const amt = typeof newRecurringAmount==='number'?newRecurringAmount:parseFloat(String(newRecurringAmount||0));
    if(isNaN(amt)||amt<=0) { 
      setErr("Enter a valid amount."); 
      return; 
    }
    if(!newRecurringDescription.trim()) {
      setErr("Enter a description for this recurring investment.");
      return;
    }
    const res = await addRecurring(userId, 'investment', amt, newRecurringDescription.trim());
    if(!res.ok) { 
      setErr("Failed to add recurring investment."); 
      return; 
    }
    setNewRecurringAmount("");
    setNewRecurringDescription("");
    await refresh(userId);
  }

  async function onUpdateRecurring(id: string, currentAmount: number, currentDescription: string) {
    if(!userId) return; 
    const amt = typeof amount==='number'?amount:parseFloat(String(amount||0));
    if(isNaN(amt)||amt<0) { 
      setErr("Enter a valid amount."); 
      return; 
    }
    const res = await updateRecurring(userId, id, amt, currentDescription);
    if(!res.ok) { 
      setErr("Not enough balance for that amount while active."); 
      return; 
    }
    setAmount("");
    await refresh(userId);
  }

  async function onDeleteRecurring(id: string) {
    if(!userId) return;
    await deleteRecurring(userId, id);
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
    const r = await addInvestmentTrade(userId, amt, note);
    if(!r.ok) { 
      setErr("Not enough balance."); 
      return; 
    }
    setAmount(""); 
    setNote("");
    await refresh(userId);
  }

  const totalRecurringInvestments = recurringInvestments
    .filter((inv: any) => inv.active)
    .reduce((sum: number, inv: any) => sum + inv.amount_cents, 0);

  const totalInvestments = fromCents(totalRecurringInvestments + (sum?.invest_oneoff_cents ?? 0));

  return (
    <main>
      <section>
        <h2>Recurring Investments</h2>
        
        {/* Add new recurring investment */}
        <form onSubmit={onAddRecurring} style={{ marginBottom: '20px', padding: '15px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '10px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Add New Recurring Investment</h3>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="number" 
              step="0.01" 
              value={newRecurringAmount} 
              onChange={e=>setNewRecurringAmount(e.target.value===""?"":parseFloat(e.target.value))} 
              placeholder="Amount"
              style={{ width: '150px' }}
            />
            <input 
              value={newRecurringDescription} 
              onChange={e=>setNewRecurringDescription(e.target.value)} 
              placeholder="Description (e.g., Index Fund, Crypto, Stocks)"
              style={{ flex: 1, minWidth: '200px' }}
            />
            <button type="submit">Add Recurring</button>
          </div>
        </form>

        {/* List of recurring investments */}
        {recurringInvestments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recurringInvestments.map((inv) => (
              <div key={inv.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '10px',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {inv.description}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    ${fromCents(inv.amount_cents).toFixed(2)} per month
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={() => onToggleRecurring(inv.id, inv.active)}
                    style={{ 
                      background: inv.active ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6b7280, #4b5563)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {inv.active ? 'Active' : 'Inactive'}
                  </button>
                  <button 
                    onClick={() => onDeleteRecurring(inv.id)}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>
          Total Active Recurring: ${fromCents(totalRecurringInvestments).toFixed(2)} | 
          Total Invested (recurring + one-offs): ${totalInvestments.toFixed(2)}
        </div>
      </section>

      <section>
        <h2>Add One-off Investment Trade</h2>
        <form onSubmit={onOneOff}>
          <input 
            type="number" 
            step="0.01" 
            value={amount} 
            onChange={e=>setAmount(e.target.value===""?"":parseFloat(e.target.value))} 
            placeholder="Amount" 
          />
          <input 
            value={note} 
            onChange={e=>setNote(e.target.value)} 
            placeholder="note (optional)" 
          />
          <button type="submit">Add Trade</button>
        </form>
      </section>

      <section>
        <h2>Month Totals</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Recurring Investments</div>
            <div className="summary-value">${fromCents(totalRecurringInvestments).toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">One-off Trades</div>
            <div className="summary-value">${fromCents(sum?.invest_oneoff_cents ?? 0).toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Invested</div>
            <div className="summary-value">${totalInvestments.toFixed(2)}</div>
          </div>
        </div>
      </section>

      <Modal open={!!err} onClose={()=>setErr(null)} title="Blocked">
        {err}
      </Modal>
    </main>
  );
}
