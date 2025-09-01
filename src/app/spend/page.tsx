"use client";
import { useState } from "react";
import { addExpense, ensureProfile, setRecurringActive, addRecurring, updateRecurring, deleteRecurring } from "../actions";
import { fromCents } from "@/lib/supabase";
import { Modal } from "../components/Modal";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useApp } from "../context/AppContext";

export default function SpendPage() {
  const { userId, summary: sum, recurringData, loading, refreshData } = useApp();
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [err, setErr] = useState<string|null>(null);
  
  // New recurring expense form
  const [newRecurringAmount, setNewRecurringAmount] = useState<number | "">("");
  const [newRecurringDescription, setNewRecurringDescription] = useState("");

  // Filter recurring expenses for spend category
  const recurringExpenses = recurringData.filter((item: any) => item.kind === 'spend');

  async function onToggleRecurring(id: string, currentActive: boolean) {
    if(!userId) return;
    const res = await setRecurringActive(userId, id, !currentActive);
    if(!res.ok) { 
      setErr("Not enough balance to activate this rule. Try reducing the amount first."); 
      return; 
    }
    await refreshData();
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
      setErr("Enter a description for this recurring expense.");
      return;
    }
    const res = await addRecurring(userId, 'spend', amt, newRecurringDescription.trim());
    if(!res.ok) { 
      setErr("Failed to add recurring expense."); 
      return; 
    }
    setNewRecurringAmount("");
    setNewRecurringDescription("");
    await refreshData();
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
    await refreshData();
  }

  async function onDeleteRecurring(id: string) {
    if(!userId) return;
    await deleteRecurring(userId, id);
    await refreshData();
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
    await refreshData();
  }

  const totalRecurringSpend = recurringExpenses
    .filter((exp: any) => exp.active)
    .reduce((sum: number, exp: any) => sum + exp.amount_cents, 0);

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
        <h2>Recurring Expenses</h2>
        
        {/* Add new recurring expense */}
        <form onSubmit={onAddRecurring} style={{ marginBottom: '20px', padding: '15px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '10px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Add New Recurring Expense</h3>
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
              placeholder="Description (e.g., Netflix, Rent)"
              style={{ flex: 1, minWidth: '200px' }}
            />
            <button type="submit">Add Recurring</button>
          </div>
        </form>

        {/* List of recurring expenses */}
        {recurringExpenses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recurringExpenses.map((exp) => (
              <div key={exp.id} style={{ 
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
                    {exp.description}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    ${fromCents(exp.amount_cents).toFixed(2)} per month
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={() => onToggleRecurring(exp.id, exp.active)}
                    style={{ 
                      background: exp.active ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6b7280, #4b5563)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {exp.active ? 'Active' : 'Inactive'}
                  </button>
                  <button 
                    onClick={() => onDeleteRecurring(exp.id)}
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
          Total Active Recurring: ${fromCents(totalRecurringSpend).toFixed(2)} | 
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
            <div className="summary-value">${fromCents(totalRecurringSpend).toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">One-off Expenses</div>
            <div className="summary-value">${fromCents(sum?.expense_cents ?? 0).toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Spent</div>
            <div className="summary-value">${fromCents(totalRecurringSpend + (sum?.expense_cents ?? 0)).toFixed(2)}</div>
          </div>
        </div>
      </section>

      <Modal open={!!err} onClose={()=>setErr(null)} title="Blocked">
        {err}
      </Modal>
    </main>
  );
}
