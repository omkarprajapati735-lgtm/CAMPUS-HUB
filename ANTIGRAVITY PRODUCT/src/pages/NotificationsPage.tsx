import React, { useState } from "react";
import type { Notification } from "../types";
import { Bell, BellRing, CheckCircle2, AlertTriangle, BookOpen, CreditCard, GraduationCap, Calendar, Shield, Zap, Check } from "lucide-react";

const CAT_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  academic: { icon: <GraduationCap size={16} />, color: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300" },
  examination: { icon: <AlertTriangle size={16} />, color: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300" },
  fee: { icon: <CreditCard size={16} />, color: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300" },
  library: { icon: <BookOpen size={16} />, color: "bg-violet-100 text-violet-600" },
  event: { icon: <Calendar size={16} />, color: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300" },
  administrative: { icon: <Shield size={16} />, color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" },
  emergency: { icon: <Zap size={16} />, color: "bg-red-100 text-red-600" },
};

interface Props { notifications: Notification[]; onRead: (id?: string) => void; }

export default function NotificationsPage({ notifications, onRead }: Props) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const filtered = filter === "unread" ? notifications.filter(n => !n.isRead) : notifications;
  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div><h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{unread} unread · {notifications.length} total</p></div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {(["all", "unread"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition cursor-pointer ${filter === f ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"}`}>{f}</button>
            ))}
          </div>
          {unread > 0 && (
            <button onClick={() => onRead()} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer border border-indigo-200">
              <Check size={14} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((n, i) => {
          const cat = CAT_CONFIG[n.category] || CAT_CONFIG.academic;
          return (
            <div key={n._id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 flex items-start gap-4 card-hover animate-fadeIn stagger-${Math.min(i + 1, 8)} ${!n.isRead ? "border-indigo-200 bg-indigo-50/30" : "border-slate-100 dark:border-slate-800"}`}
              onClick={() => !n.isRead && onRead(n._id)}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>{cat.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</h3>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1.5">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold capitalize bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{n.category}</span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <BellRing size={40} className="mx-auto text-slate-200 mb-3" /><p className="text-sm text-slate-400">{filter === "unread" ? "No unread notifications" : "No notifications"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
