"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, ShoppingCart, Landmark, Plus, RefreshCw, Search, CheckCircle2, AlertCircle, FileText } from "lucide-react";

type Area = "ACCOUNTING" | "SALES" | "PURCHASING" | "BANKING";
type RecordRow = { id: string; area: Area; kind: string; title: string; reference: string | null; counterparty: string | null; status: string; amount: number | null; currency: string; recordDate: string | null; dueDate: string | null; description: string | null; createdAt: string };
const groups = [
  { id: "ACCOUNTING" as Area, anchor: "accounting", title: "Accounting", subtitle: "Company profile, chart of accounts, journals and ledger.", icon: BookOpen, items: [{kind:"COMPANY",label:"Company Setup",hint:"Company name, tax ID, fiscal year and currency"},{kind:"ACCOUNT",label:"Chart of Accounts",hint:"Cash, receivables, payables, equity, revenue and expenses"},{kind:"JOURNAL",label:"Journal Entry",hint:"Prepare a balanced entry for review"},{kind:"LEDGER",label:"General Ledger",hint:"Review recorded activity by account"}] },
  { id: "SALES" as Area, anchor: "sales", title: "Sales", subtitle: "Customers, invoices and incoming payments.", icon: Users, items: [{kind:"CUSTOMER",label:"Customers",hint:"Customer details, terms and credit limits"},{kind:"INVOICE",label:"New Invoice",hint:"Invoice header, due date and total"},{kind:"RECEIPT",label:"Receive Payment",hint:"Record payment against a customer invoice"}] },
  { id: "PURCHASING" as Area, anchor: "purchasing", title: "Purchasing", subtitle: "Vendor records, bills and business expenses.", icon: ShoppingCart, items: [{kind:"VENDOR",label:"Vendors",hint:"Vendor details, terms and 1099 status"},{kind:"BILL",label:"Enter Bill",hint:"Capture vendor invoice and due date"},{kind:"EXPENSE",label:"Record Expense",hint:"Record receipt-backed operating expenses"}] },
  { id: "BANKING" as Area, anchor: "banking", title: "Banking & Payroll", subtitle: "Bank accounts, statements, employees and payroll records.", icon: Landmark, items: [{kind:"BANK_ACCOUNT",label:"Bank Accounts",hint:"Bank name, account type and masked number"},{kind:"BANK_STATEMENT",label:"Upload Statement Record",hint:"Track a statement and its source document"},{kind:"EMPLOYEE",label:"Employees",hint:"Employee profile and payroll details"},{kind:"PAYROLL",label:"Payroll Run",hint:"Capture a payroll run for review"}] },
] as const;

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50";
const money = (n:number,c:string) => new Intl.NumberFormat("en-US",{style:"currency",currency:c || "USD"}).format(n);

export default function OperationsPage() {
  const [records,setRecords] = useState<RecordRow[]>([]);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [search,setSearch] = useState("");
  const [selected,setSelected] = useState<Area>("ACCOUNTING");
  const [active,setActive] = useState<{area:Area;kind:string;label:string}|null>(null);
  const [notice,setNotice] = useState<{ok:boolean;text:string}|null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res=await fetch("/api/workspace-records",{cache:"no-store"}); const data=await res.json(); if(!res.ok) throw new Error(data.error||"Could not load records."); setRecords(data.records||[]); }
    catch(e){setNotice({ok:false,text:e instanceof Error?e.message:"Could not load records."});}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);

  const filtered = useMemo(()=>records.filter(r=>(r.title+" "+(r.reference||"")+" "+(r.counterparty||"")+" "+r.kind).toLowerCase().includes(search.toLowerCase())),[records,search]);
  const counts = (area:Area)=>records.filter(r=>r.area===area).length;
  const group=groups.find(g=>g.id===selected)!;

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if(!active)return;
    const form=new FormData(e.currentTarget);
    const body=Object.fromEntries(form.entries());
    setSaving(true);setNotice(null);
    try{
      const res=await fetch("/api/workspace-records",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,area:active.area,kind:active.kind})});
      const data=await res.json();if(!res.ok)throw new Error(data.error||"Save failed.");
      setNotice({ok:true,text:active.label+" saved as a draft. It is now in your records."});setActive(null);await load();
    }catch(err){setNotice({ok:false,text:err instanceof Error?err.message:"Could not save this record."});}
    finally{setSaving(false);}
  }

  return <div className="mx-auto max-w-[1500px] space-y-6 pb-12">
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"><ArrowLeft className="h-4 w-4"/>Back to dashboard</Link>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Finova · Accounting</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Accounting</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Your finance workspace, organized into simple work areas.</p>
      </div>
      <button onClick={()=>void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50"><RefreshCw className={"h-4 w-4 "+(loading?"animate-spin":"")}/>Refresh records</button>
    </header>

    <nav aria-label="Accounting work areas" className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:grid-cols-4">
      {groups.map(g=>{const Icon=g.icon;const activeTab=selected===g.id;return <button key={g.id} onClick={()=>setSelected(g.id)} aria-pressed={activeTab} className={"flex min-h-[62px] items-center gap-3 rounded-xl px-3 py-3 text-left transition "+(activeTab?"bg-teal-700 text-white shadow-sm":"text-slate-600 hover:bg-teal-50 hover:text-teal-800")}><span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg "+(activeTab?"bg-white/15":"bg-teal-50 text-teal-700")}><Icon className="h-5 w-5"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{g.title}</span><span className={"mt-0.5 block text-xs "+(activeTab?"text-teal-50":"text-slate-400")}>{counts(g.id)} saved</span></span></button>})}
    </nav>

    {notice&&<div role="status" className={"flex items-start gap-2 rounded-xl border px-4 py-3 text-sm "+(notice.ok?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-rose-200 bg-rose-50 text-rose-800")}>{notice.ok?<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/>:<AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/>}{notice.text}</div>}

    <section className="space-y-4" aria-live="polite">
      <div className="flex items-end justify-between gap-3"><div><div className="flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">{(()=>{const Icon=group.icon;return <Icon className="h-5 w-5"/>})()}</span><h2 className="text-xl font-semibold text-slate-900">{group.title}</h2></div><p className="mt-2 text-sm text-slate-500">{group.subtitle}</p></div><span className="text-xs font-medium text-slate-400">{counts(group.id)} saved</span></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{group.items.map(item=><article key={item.kind} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{item.label}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{item.hint}</p></div><span className="rounded-lg bg-slate-50 p-2 text-slate-500"><FileText className="h-4 w-4"/></span></div><button onClick={()=>{setActive({area:group.id,kind:item.kind,label:item.label});setNotice(null);}} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100"><Plus className="h-4 w-4"/>Create {item.label}</button></article>)}</div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-slate-900">Saved workspace records</h2><p className="mt-1 text-xs text-slate-500">Draft records across all four work areas.</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search records…" className={inputClass+" pl-9"}/></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Record</th><th className="px-5 py-3">Area</th><th className="px-5 py-3">Reference</th><th className="px-5 py-3">Counterparty</th><th className="px-5 py-3 text-right">Amount</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(r=><tr key={r.id} className="hover:bg-slate-50/70"><td className="px-5 py-3.5"><p className="font-semibold text-slate-800">{r.title}</p><p className="mt-0.5 text-xs text-slate-400">{r.kind.replaceAll("_"," ")} · {new Date(r.createdAt).toLocaleDateString()}</p></td><td className="px-5 py-3.5 text-slate-600">{r.area}</td><td className="px-5 py-3.5 text-slate-500">{r.reference||"—"}</td><td className="px-5 py-3.5 text-slate-500">{r.counterparty||"—"}</td><td className="px-5 py-3.5 text-right font-medium tabular-nums text-slate-800">{r.amount==null?"—":money(r.amount,r.currency)}</td><td className="px-5 py-3.5"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{r.status}</span></td></tr>)}{!loading&&filtered.length===0&&<tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">No records yet. Create one above to get started.</td></tr>}</tbody></table></div>
      {loading&&<p className="p-5 text-center text-sm text-slate-400">Loading records…</p>}
    </section>

    {active&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="record-modal-title"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">{active.area}</p><h2 id="record-modal-title" className="mt-1 text-xl font-semibold text-slate-900">Create {active.label}</h2><p className="mt-1 text-sm text-slate-500">Enter the available details. You can add supporting documents through Documents.</p></div><button onClick={()=>setActive(null)} className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100">Close</button></div>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">Name / description *<input name="title" required maxLength={180} className={inputClass+" mt-1"} placeholder={active.kind==="COMPANY"?"Company legal name":active.kind==="CUSTOMER"?"Customer name":active.kind==="VENDOR"?"Vendor name":"Enter a clear record name"}/></label>
        <label className="text-sm font-medium text-slate-700">Reference / ID<input name="reference" className={inputClass+" mt-1"} placeholder="Invoice no., account code, EIN…"/></label>
        <label className="text-sm font-medium text-slate-700">Customer / vendor / bank<input name="counterparty" className={inputClass+" mt-1"} placeholder="Related party or institution"/></label>
        <label className="text-sm font-medium text-slate-700">Amount<input name="amount" type="number" min="0" step="0.01" className={inputClass+" mt-1"} placeholder="0.00"/></label>
        <label className="text-sm font-medium text-slate-700">Currency<select name="currency" defaultValue="USD" className={inputClass+" mt-1"}><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option></select></label>
        <label className="text-sm font-medium text-slate-700">Record date<input name="recordDate" type="date" className={inputClass+" mt-1"}/></label>
        <label className="text-sm font-medium text-slate-700">Due date<input name="dueDate" type="date" className={inputClass+" mt-1"}/></label>
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">Notes<textarea name="description" rows={3} className={inputClass+" mt-1"} placeholder="Add context, terms, or supporting details…"/></label>
        <div className="sm:col-span-2 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={()=>setActive(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button disabled={saving} className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">{saving?"Saving…":"Save draft record"}</button></div>
      </form>
    </div></div>}
  </div>;
}
