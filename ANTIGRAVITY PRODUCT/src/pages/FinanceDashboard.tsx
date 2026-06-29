import React from "react";
import type { FinanceDashboardStats } from "../types";
import { Wallet, TrendingUp, Clock, AlertTriangle, ArrowUpRight, CreditCard, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props { stats?: FinanceDashboardStats; onNavigate: (v: string) => void; }

export default function FinanceDashboard({ stats, onNavigate }: Props) {
  if (!stats) return <div className="text-center py-20"><div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" /></div>;

  const cards = [
    { label: "Total Revenue", value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: <TrendingUp size={20} />, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" },
    { label: "Pending Amount", value: `₹${(stats.pendingAmount / 1000).toFixed(0)}K`, icon: <Clock size={20} />, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
    { label: "Paid Transactions", value: stats.paidCount, icon: <CheckCircle2 size={20} />, color: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/20" },
    { label: "Pending Payments", value: stats.pendingCount, icon: <AlertTriangle size={20} />, color: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Finance <span className="gradient-text">Dashboard</span> 💰</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Revenue tracking, payment management, and financial reports</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={c.label} className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 card-hover animate-fadeIn stagger-${i + 1}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-lg ${c.shadow}`}>{c.icon}</div>
              <ArrowUpRight size={14} className="text-slate-300" />
            </div>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Transaction History</h3>
          <button onClick={() => onNavigate("fees")} className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer">Manage Fees</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Student</th>
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Type</th>
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Amount</th>
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Sem</th>
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Status</th>
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {(stats.recentTransactions || []).map(t => (
                <tr key={t._id} className="table-row-hover">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{t.studentName}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 capitalize">{t.feeType}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">₹{t.amount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">{t.semester}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === "paid" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : t.status === "pending" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300"}`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{t.transactionId || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
