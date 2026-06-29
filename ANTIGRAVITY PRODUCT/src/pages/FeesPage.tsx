import React from "react";
import type { User, Transaction } from "../types";
import { Wallet, CheckCircle2, Clock, AlertTriangle, CreditCard, ArrowUpRight } from "lucide-react";

interface Props { user: User; transactions: Transaction[]; onPayFee: (id: string) => Promise<boolean>; }

export default function FeesPage({ user, transactions, onPayFee }: Props) {
  const paid = transactions.filter(t => t.status === "paid");
  const pending = transactions.filter(t => t.status === "pending");
  const totalPaid = paid.reduce((s, t) => s + t.amount, 0);
  const totalPending = pending.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Fees & Payments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View fee details, pay online, and track transactions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
        {[
          { label: "Total Paid", value: `₹${totalPaid.toLocaleString()}`, icon: <CheckCircle2 size={20} />, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" },
          { label: "Pending Amount", value: `₹${totalPending.toLocaleString()}`, icon: <Clock size={20} />, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
          { label: "Paid Transactions", value: paid.length, icon: <CreditCard size={20} />, color: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/20" },
          { label: "Pending Payments", value: pending.length, icon: <AlertTriangle size={20} />, color: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/20" },
        ].map((c, i) => (
          <div key={c.label} className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 card-hover animate-fadeIn stagger-${i + 1}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-lg ${c.shadow}`}>{c.icon}</div>
              <ArrowUpRight size={14} className="text-slate-300" />
            </div>
            <p className="text-xl font-bold font-display text-slate-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-5">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Pending Payments</h3>
          <div className="space-y-3">
            {pending.map(t => (
              <div key={t._id} className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center"><Wallet size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{t.feeType} Fee — Semester {t.semester}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Due: {t.dueDate}{t.studentName && ` · ${t.studentName}`}</p>
                </div>
                <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">₹{t.amount.toLocaleString()}</p>
                {(user.role === "student" || user.role === "finance") && (
                  <button onClick={() => onPayFee(t._id)} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-xl transition cursor-pointer">
                    Pay Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-6">
        <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-100 dark:border-slate-800">
              {user.role !== "student" && <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Student</th>}
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Type</th>
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Semester</th>
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Amount</th>
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Status</th>
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Date</th>
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Reference</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {transactions.map(t => (
                <tr key={t._id} className="table-row-hover">
                  {user.role !== "student" && <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{t.studentName || "—"}</td>}
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 capitalize">{t.feeType}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{t.semester}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">₹{t.amount.toLocaleString()}</td>
                  <td className="py-3 px-3"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.status === "paid" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300" : t.status === "pending" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 dark:bg-amber-500/20 dark:text-amber-300" : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 dark:bg-rose-500/20 dark:text-rose-300"}`}>{t.status.toUpperCase()}</span></td>
                  <td className="py-3 px-3 font-mono text-slate-400">{t.paidAt ? new Date(t.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                  <td className="py-3 px-3 font-mono text-[10px] text-slate-400">{t.transactionId || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No transactions</div>}
      </div>
    </div>
  );
}
