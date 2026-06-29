import React from "react";
import type { LibrarianDashboardStats } from "../types";
import { Library, BookOpen, BookCheck, AlertTriangle, Wallet, ArrowUpRight, Clock, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props { stats?: LibrarianDashboardStats; onNavigate: (v: string) => void; }

export default function LibrarianDashboard({ stats, onNavigate }: Props) {
  if (!stats) return <div className="text-center py-20"><div className="w-8 h-8 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto" /></div>;

  const cards = [
    { label: "Total Books", value: stats.totalBooks, icon: <Library size={20} />, color: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/20" },
    { label: "Available", value: stats.availableBooks, icon: <BookOpen size={20} />, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" },
    { label: "Borrowed", value: stats.borrowedBooks, icon: <BookCheck size={20} />, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
    { label: "Overdue", value: stats.overdueBooks, icon: <AlertTriangle size={20} />, color: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Library <span className="gradient-text">Dashboard</span> 📚</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage books, track borrowing, and monitor inventory</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Recent Activity</h3>
            <button onClick={() => onNavigate("library")} className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer">Manage Catalog</button>
          </div>
          <div className="space-y-2">
            {(stats.recentActivity || []).map(r => (
              <div key={r._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.status === "borrowed" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300" : r.status === "returned" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300" : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300"}`}>
                  {r.status === "returned" ? <BookCheck size={14} /> : <BookOpen size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{r.bookTitle}</p>
                  <p className="text-[10px] text-slate-400">{r.studentName} · {r.status === "returned" ? r.returnDate : `Due: ${r.dueDate}`}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.status === "borrowed" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" : r.status === "returned" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300"}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Popular Books</h3>
          <div className="space-y-2">
            {(stats.popularBooks || []).map((b, i) => (
              <div key={b._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{b.title}</p>
                  <p className="text-[10px] text-slate-400">{b.author}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{b.availableQuantity}/{b.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
