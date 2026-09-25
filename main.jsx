import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Plus, Trash2, Wallet, TrendingDown, PiggyBank, X, CalendarDays,
  Utensils, Car, ShoppingBag, Home, HeartPulse, GraduationCap, MoreHorizontal,
  ChevronDown, RotateCcw
} from "lucide-react";
import "./styles.css";

const CATEGORIES = [
  ["Food", Utensils], ["Transport", Car], ["Shopping", ShoppingBag],
  ["Home", Home], ["Health", HeartPulse], ["Education", GraduationCap], ["Other", MoreHorizontal]
];

const money = (n) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(Number(n) || 0);

const today = () => new Date().toISOString().slice(0,10);

function App() {
  const [income, setIncome] = useState(() => Number(localStorage.getItem("mec-income")) || 0);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem("mec-expenses") || "[]"));
  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [filter, setFilter] = useState("All");

  useEffect(() => localStorage.setItem("mec-income", income), [income]);
  useEffect(() => localStorage.setItem("mec-expenses", JSON.stringify(expenses)), [expenses]);

  const total = useMemo(() => expenses.reduce((s,e)=>s+Number(e.amount),0), [expenses]);
  const remaining = Number(income) - total;
  const categories = useMemo(() => {
    const map = {};
    expenses.forEach(e => map[e.category] = (map[e.category] || 0) + Number(e.amount));
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  }, [expenses]);

  const visible = filter === "All" ? expenses : expenses.filter(e => e.category === filter);

  function addExpense(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    setExpenses([{ id: crypto.randomUUID(), category, amount:value, note:note.trim(), date }, ...expenses]);
    setAmount(""); setNote(""); setShowAdd(false);
  }

  function resetAll() {
    if (confirm("Reset all income and expenses?")) {
      setIncome(0); setExpenses([]);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="eyebrow">PERSONAL FINANCE</div>
          <h1>Monthly Expenses</h1>
        </div>
        <button className="iconBtn" onClick={resetAll} title="Reset"><RotateCcw size={19}/></button>
      </header>

      <main>
        <section className="hero">
          <div className="heroTop">
            <div>
              <span className="muted">Monthly income</span>
              <div className="incomeEdit">
                <span>₹</span>
                <input value={income || ""} onChange={e=>setIncome(e.target.value.replace(/\D/g,""))} placeholder="0" inputMode="numeric"/>
              </div>
            </div>
            <div className="wallet"><Wallet size={23}/></div>
          </div>
          <div className="balanceRow">
            <div><span className="muted">Available balance</span><strong className={remaining < 0 ? "dangerText":""}>{money(remaining)}</strong></div>
            <div className="spentPill"><TrendingDown size={15}/> {money(total)} spent</div>
          </div>
        </section>

        <section className="stats">
          <div className="stat"><span><TrendingDown size={17}/> Expenses</span><b>{money(total)}</b></div>
          <div className="stat"><span><PiggyBank size={17}/> Savings</span><b>{money(Math.max(remaining,0))}</b></div>
        </section>

        <section className="section">
          <div className="sectionTitle"><h2>Spending by category</h2></div>
          {categories.length === 0 ? <div className="emptySmall">Add your first expense to see the breakdown.</div> :
            <div className="bars">{categories.slice(0,6).map(([name,val])=>{
              const Icon=CATEGORIES.find(x=>x[0]===name)?.[1] || MoreHorizontal;
              const pct=total ? Math.round(val/total*100) : 0;
              return <div className="barItem" key={name}><div className="barLabel"><span><Icon size={16}/> {name}</span><b>{money(val)}</b></div><div className="track"><div className="fill" style={{width:`${pct}%`}}/></div></div>
            })}</div>}
        </section>

        <section className="section">
          <div className="sectionTitle">
            <h2>Transactions</h2>
            <select value={filter} onChange={e=>setFilter(e.target.value)}>
              <option>All</option>{CATEGORIES.map(([n])=><option key={n}>{n}</option>)}
            </select>
          </div>
          {visible.length === 0 ? <div className="empty">No expenses yet.<br/><span>Tap + to add one.</span></div> :
            <div className="transactions">{visible.map(e=>{
              const Icon=CATEGORIES.find(x=>x[0]===e.category)?.[1] || MoreHorizontal;
              return <div className="transaction" key={e.id}>
                <div className="catIcon"><Icon size={19}/></div>
                <div className="txInfo"><b>{e.note || e.category}</b><span>{e.category} · {new Date(e.date+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</span></div>
                <div className="txRight"><strong>-{money(e.amount)}</strong><button onClick={()=>setExpenses(expenses.filter(x=>x.id!==e.id))}><Trash2 size={16}/></button></div>
              </div>
            })}</div>}
        </section>
      </main>

      <button className="fab" onClick={()=>setShowAdd(true)}><Plus size={25}/><span>Add expense</span></button>

      {showAdd && <div className="overlay" onClick={()=>setShowAdd(false)}>
        <form className="sheet" onSubmit={addExpense} onClick={e=>e.stopPropagation()}>
          <div className="sheetHead"><h2>Add expense</h2><button type="button" className="close" onClick={()=>setShowAdd(false)}><X/></button></div>
          <label>Amount</label>
          <div className="amountBox"><span>₹</span><input autoFocus value={amount} onChange={e=>setAmount(e.target.value.replace(/\D/g,""))} placeholder="0" inputMode="numeric" required/></div>
          <label>Category</label>
          <div className="catGrid">{CATEGORIES.map(([name,Icon])=><button type="button" className={category===name?"catChoice active":"catChoice"} onClick={()=>setCategory(name)} key={name}><Icon size={18}/>{name}</button>)}</div>
          <label>Note <small>optional</small></label>
          <input className="textInput" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Lunch, fuel, rent"/>
          <label>Date</label>
          <div className="dateBox"><CalendarDays size={17}/><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
          <button className="saveBtn">Save expense</button>
        </form>
      </div>}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App/>);