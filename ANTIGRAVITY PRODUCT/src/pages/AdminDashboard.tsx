import React from "react";
import type { AdminDashboardStats, Notice } from "../types";
import { Users, GraduationCap, BookOpen, Wallet, Library, Megaphone, Building, BookCheck, ArrowUpRight, TrendingUp, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props { stats?: AdminDashboardStats; notices: Notice[]; onNavigate: (v: string) => void; showUsers?: boolean; }

export default function AdminDashboard({ stats, notices, onNavigate, showUsers }: Props) {
  if (!stats) return <div className="text-center py-20"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>;

  const cards = [
    { label: "Total Students", value: stats.totalStudents, icon: <GraduationCap size={20} />, color: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/20" },
    { label: "Total Teachers", value: stats.totalTeachers, icon: <Users size={20} />, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" },
    { label: "Departments", value: stats.totalDepartments, icon: <Building size={20} />, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
    { label: "Total Books", value: stats.totalBooks, icon: <Library size={20} />, color: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/20" },
    { label: "Fee Collected", value: `₹${(stats.totalFeeCollected / 1000).toFixed(0)}K`, icon: <Wallet size={20} />, color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/20" },
    { label: "Pending Payments", value: stats.pendingPayments, icon: <AlertTriangle size={20} />, color: "from-orange-500 to-red-600", shadow: "shadow-orange-500/20" },
    { label: "Books Issued", value: stats.booksIssued, icon: <BookCheck size={20} />, color: "from-teal-500 to-cyan-600", shadow: "shadow-teal-500/20" },
    { label: "Active Notices", value: stats.totalNotices, icon: <Megaphone size={20} />, color: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/20" },
  ];

  const pieData = [
    { name: "Students", value: stats.totalStudents, color: "#4f46e5" },
    { name: "Teachers", value: stats.totalTeachers, color: "#059669" },
    { name: "Staff", value: 2, color: "#d97706" },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Admin <span className="gradient-text">Dashboard</span> 🛡️</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">System overview and management controls</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #334155", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Recent Notices</h3>
          <div className="space-y-3">
            {(stats.recentNotices || notices).slice(0, 5).map(n => (
              <div key={n._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.category === "examination" ? "bg-rose-500" : n.category === "events" ? "bg-amber-500" : "bg-indigo-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                  <p className="text-[10px] text-slate-400">{n.createdByName} · {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">{n.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn">
        <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Student</th>
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Type</th>
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Amount</th>
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Date</th>
                <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {(stats.recentTransactions || []).map(t => (
                <tr key={t._id} className="table-row-hover">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{t.studentName}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 capitalize">{t.feeType}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">₹{t.amount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">{t.paidAt ? new Date(t.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</td>
                  <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === "paid" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"}`}>{t.status.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
