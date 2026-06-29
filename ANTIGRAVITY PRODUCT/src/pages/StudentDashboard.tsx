import React from "react";
import type { User, Student, Notice, Timetable, BorrowRecord, Transaction, StudentProgress, Notification, Assignment } from "../types";
import {
  TrendingUp, BookOpen, Wallet, Library, CalendarDays, Bell, Clock,
  Award, Target, BarChart3, ArrowUpRight, CheckCircle2, AlertTriangle,
  GraduationCap, Percent, CreditCard, BookCheck, ChevronRight,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

interface Props {
  user: User;
  profile?: Student;
  notices: Notice[];
  timetable: Timetable[];
  borrowRecords: BorrowRecord[];
  transactions: Transaction[];
  progress?: StudentProgress;
  notifications: Notification[];
  assignments: Assignment[];
  onNavigate: (view: string) => void;
}

export default function StudentDashboard({ user, profile, notices, timetable, borrowRecords, transactions, progress, notifications, assignments, onNavigate }: Props) {
  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[today.getDay()];
  const todayClasses = timetable.filter(t => t.day === todayName).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const pendingFees = transactions.filter(t => t.status === "pending");
  const borrowedBooks = borrowRecords.filter(r => r.status === "borrowed");
  const upcomingAssignments = assignments.filter(a => a.status === "active" && new Date(a.dueDate) > today).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const cgpaData = progress?.academicHistory.map(h => ({
    name: `Sem ${h.semester}`, SGPA: h.sgpa, credits: h.credits,
  })) || [];

  const statCards = [
    { label: "Current CGPA", value: progress?.currentCGPA?.toFixed(2) || profile?.currentCGPA?.toFixed(2) || "—", icon: <Award size={20} />, color: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/20", lightBg: "bg-indigo-50" },
    { label: "Attendance", value: `${profile?.attendancePercentage || 0}%`, icon: <Percent size={20} />, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20", lightBg: "bg-emerald-50" },
    { label: "Credits Earned", value: progress?.passedCredits || 0, icon: <Target size={20} />, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20", lightBg: "bg-amber-50" },
    { label: "Semester", value: profile?.semester || "—", icon: <GraduationCap size={20} />, color: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/20", lightBg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="animate-fadeIn">
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Welcome back, <span className="gradient-text">{user.fullName.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {todayName}, {today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            {profile && <span className="text-slate-400"> · {profile.department} · Sem {profile.semester}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-semibold font-mono border border-indigo-200 dark:border-indigo-500/20">
            {profile?.rollNumber || "—"}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={card.label} className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 card-hover animate-fadeIn stagger-${i + 1}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg ${card.shadow}`}>
                {card.icon}
              </div>
              <ArrowUpRight size={14} className="text-slate-300" />
            </div>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts + Quick Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SGPA Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Academic Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5">SGPA trend across semesters</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-[10px] text-slate-400 font-mono">SGPA</span>
            </div>
          </div>
          {cgpaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cgpaData}>
                <defs>
                  <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[6, 10]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #334155", fontSize: "12px", fontFamily: "JetBrains Mono" }} />
                <Area type="monotone" dataKey="SGPA" stroke="#4f46e5" strokeWidth={2.5} fill="url(#sgpaGrad)" dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">No academic data available</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-6">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Fees & Payments", icon: <Wallet size={16} />, view: "fees", count: pendingFees.length, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400" },
              { label: "Library Portal", icon: <Library size={16} />, view: "library", count: borrowedBooks.length, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400" },
              { label: "Notice Board", icon: <Bell size={16} />, view: "notices", count: notices.length, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" },
              { label: "Results", icon: <BarChart3 size={16} />, view: "results", count: null, color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400" },
              { label: "Notifications", icon: <Bell size={16} />, view: "notifications", count: unreadNotifs, color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400" },
            ].map(action => (
              <button key={action.view} onClick={() => onNavigate(action.view)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group cursor-pointer">
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 text-left">{action.label}</span>
                {action.count !== null && action.count > 0 && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{action.count}</span>
                )}
                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 dark:text-slate-400 transition" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Today's Classes + Notices + Fees */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Today's Classes</h3>
            <button onClick={() => onNavigate("timetable")} className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer">View All</button>
          </div>
          {todayClasses.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-xs text-slate-400">No classes scheduled today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayClasses.map(cls => (
                <div key={cls._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-center shrink-0">
                    <p className="text-[10px] font-mono text-slate-400">{cls.startTime}</p>
                    <div className="w-px h-3 bg-slate-200 mx-auto my-0.5" />
                    <p className="text-[10px] font-mono text-slate-400">{cls.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{cls.subjectName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{cls.classroom} · {cls.teacherName}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    cls.type === "lab" ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300" : cls.type === "tutorial" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                  }`}>
                    {cls.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notices */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Recent Notices</h3>
            <button onClick={() => onNavigate("notices")} className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer">View All</button>
          </div>
          <div className="space-y-3">
            {notices.slice(0, 4).map(notice => (
              <div key={notice._id} className="group cursor-pointer" onClick={() => onNavigate("notices")}>
                <div className="flex items-start gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    notice.category === "examination" ? "bg-rose-500" : notice.category === "events" ? "bg-amber-500" : notice.category === "placement" ? "bg-emerald-500" : "bg-indigo-500"
                  }`} />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition line-clamp-1">{notice.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      <span className="mx-1">·</span>
                      <span className="capitalize">{notice.category}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-8">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {pendingFees.slice(0, 2).map(fee => (
              <div key={fee._id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                <CreditCard size={16} className="text-amber-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">{fee.feeType} Fee</p>
                  <p className="text-[10px] text-slate-400">Due: {fee.dueDate}</p>
                </div>
                <span className="text-xs font-bold text-amber-700 font-mono">₹{fee.amount.toLocaleString()}</span>
              </div>
            ))}
            {upcomingAssignments.slice(0, 2).map(asgn => (
              <div key={asgn._id} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <BookCheck size={16} className="text-indigo-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{asgn.title}</p>
                  <p className="text-[10px] text-slate-400">Due: {asgn.dueDate}</p>
                </div>
              </div>
            ))}
            {borrowedBooks.slice(0, 2).map(br => (
              <div key={br._id} className="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 border border-violet-100">
                <BookOpen size={16} className="text-violet-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{br.bookTitle}</p>
                  <p className="text-[10px] text-slate-400">Return by: {br.dueDate}</p>
                </div>
              </div>
            ))}
            {pendingFees.length === 0 && upcomingAssignments.length === 0 && borrowedBooks.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 size={28} className="mx-auto text-emerald-300 mb-2" />
                <p className="text-xs text-slate-400">All clear! No pending deadlines.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
