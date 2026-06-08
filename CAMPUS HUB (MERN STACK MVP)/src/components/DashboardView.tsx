import React from "react";
import {
  StudentProfile,
  User,
  Notice,
  TimeTableSlot,
  BorrowRecord,
  ExamFee,
  Notification
} from "../types";
import {
  GraduationCap,
  Bell,
  Wallet,
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  Users,
  Search,
  ArrowRight,
  Info
} from "lucide-react";

interface DashboardViewProps {
  user: User;
  profile?: StudentProfile;
  notices: Notice[];
  timetable: TimeTableSlot[];
  history: BorrowRecord[];
  fees: ExamFee[];
  notifications: Notification[];
  onNavigate: (view: string) => void;
  onReadNotification: (id: string) => void;
}

export default function DashboardView({
  user,
  profile,
  notices,
  timetable,
  history,
  fees,
  notifications,
  onNavigate,
  onReadNotification
}: DashboardViewProps) {
  // Helpers to calculate stats
  const activeBorrows = history.filter((b) => b.status === "borrowed").length;
  const pendingFees = fees.filter((f) => !f.paid);
  const pendingFeeAmount = pendingFees.reduce((acc, f) => acc + f.amount, 0);
  const unreadAlerts = notifications.filter((n) => !n.read);

  // Get current day for timetable preview
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = daysOfWeek[new Date().getDay()] || "Monday";
  // Filter timetable slots for today
  const todayClasses = timetable.filter(
    (item) => item.day.toLowerCase() === currentDayName.toLowerCase()
  );

  // Filter high-importance announcements
  const urgentNotices = notices.filter((n) => n.importance === "high").slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <GraduationCap size={280} />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20 mb-4 uppercase tracking-wider font-mono">
            academic session - 2026/2027
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Welcome back, <span className="text-indigo-400 font-display">{user.name}</span>!
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Your centralized companion for academic performance, library indices, course schedules, and college correspondence.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Verified Student Profile
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Roll: {profile?.rollNo || "N/A"}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Sem: {profile?.semester || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPA */}
        <div
          onClick={() => onNavigate("academic")}
          className="bg-white border border-slate-200 p-5 rounded-xl transition-all cursor-pointer hover:border-slate-300 hover:shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">cumulative gpa</p>
              <h3 className="text-2xl font-bold mt-1.5 font-display text-slate-900">
                {profile?.gpa.toFixed(2) || "N/A"} <span className="text-sm font-normal text-slate-400">/ 10</span>
              </h3>
            </div>
            <span className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <GraduationCap size={20} />
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
            Excellent academic status <CheckCircle size={12} className="text-emerald-500" />
          </p>
        </div>

        {/* Notifications */}
        <div
          onClick={() => onNavigate("settings")}
          className="bg-white border border-slate-200 p-5 rounded-xl transition-all cursor-pointer hover:border-slate-300 hover:shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">unread alerts</p>
              <h3 className="text-2xl font-bold mt-1.5 font-display text-slate-900">
                {unreadAlerts.length}
              </h3>
            </div>
            <span className={`p-2.5 rounded-lg text-amber-600 transition-colors ${unreadAlerts.length > 0 ? 'bg-amber-50 animate-pulse group-hover:bg-amber-100' : 'bg-slate-50'}`}>
              <Bell size={20} />
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            {unreadAlerts.length > 0 ? "Important direct feed waiting" : "No pending critical updates"}
          </p>
        </div>

        {/* Exam Fees */}
        <div
          onClick={() => onNavigate("billing")}
          className="bg-white border border-slate-200 p-5 rounded-xl transition-all cursor-pointer hover:border-slate-300 hover:shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">exam fee status</p>
              <h3 className="text-2xl font-bold mt-1.5 font-display text-slate-900">
                {pendingFeeAmount > 0 ? `$${pendingFeeAmount}` : "Paid"}
              </h3>
            </div>
            <span className={`p-2.5 rounded-lg transition-colors ${pendingFeeAmount > 0 ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600'}`}>
              <Wallet size={20} />
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
            {pendingFeeAmount > 0 ? (
              <span className="text-rose-600 font-medium">Due by June 14, 2026</span>
            ) : (
              <span className="text-emerald-600 font-medium flex items-center gap-1">Receipt issued <CheckCircle size={10} /></span>
            )}
          </p>
        </div>

        {/* Library books */}
        <div
          onClick={() => onNavigate("library")}
          className="bg-white border border-slate-200 p-5 rounded-xl transition-all cursor-pointer hover:border-slate-300 hover:shadow-sm group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">borrowed books</p>
              <h3 className="text-2xl font-bold mt-1.5 font-display text-slate-900">
                {activeBorrows}
              </h3>
            </div>
            <span className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <BookOpen size={20} />
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            {activeBorrows > 0 ? `${activeBorrows} titles issued currently` : "Clear library clearance account"}
          </p>
        </div>
      </div>

      {/* Main Grid: Class schedule + News / Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Classes timetable today */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-6 lg:col-span-7">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Today's Class Schedule</h2>
            </div>
            <button
              onClick={() => onNavigate("schedule")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Full Calendar <ArrowRight size={12} />
            </button>
          </div>

          {todayClasses.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">No lectures scheduled for {currentDayName}.</p>
              <p className="text-xs text-slate-400 mt-1">Check full calendar for upcoming days.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {todayClasses.map((lecture) => (
                <div
                  key={lecture._id}
                  className="flex items-start gap-4 p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1.5 rounded-md font-mono text-center min-w-20">
                    <div className="leading-tight">{lecture.startTime}</div>
                    <div className="text-[10px] text-slate-400 font-normal">to</div>
                    <div className="leading-tight text-slate-500">{lecture.endTime}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{lecture.subject}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Instructor: {lecture.instructor}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        Hall: {lecture.classroom}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notices & Alerts Feed */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-slate-700" />
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Urgent Notice Stream</h2>
              </div>
              <button
                onClick={() => onNavigate("notices")}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                All Notices <ArrowRight size={12} />
              </button>
            </div>

            {urgentNotices.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs leading-relaxed">
                No high importance circulars on the board today. Check general announcements.
              </div>
            ) : (
              <div className="space-y-4">
                {urgentNotices.map((notice) => (
                  <div key={notice._id} className="p-3.5 rounded-lg border-l-4 border-l-rose-500 bg-rose-50/40 border border-slate-100">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-semibold text-rose-950 line-clamp-1">{notice.title}</h4>
                      <span className="text-[9px] font-medium bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded uppercase font-mono">
                        critical
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {notice.description}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono">
                      Posted on: {new Date(notice.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            {unreadAlerts.length > 0 ? (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-2.5">
                <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 font-normal">
                  <span className="font-semibold">Attention needed!</span> You have {unreadAlerts.length} unread personal notification alerts in your account feed panel.
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                <CheckCircle size={12} className="text-emerald-500" /> Account in excellent synchronized standing
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Launchpad Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight uppercase tracking-wider text-slate-400 font-mono mb-4">
          Quick Launch Pad
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate("notes")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600 text-slate-600 transition-all text-center group"
          >
            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
              <FileText size={20} />
            </div>
            <span className="text-xs font-semibold mt-2">Class Notes</span>
          </button>

          <button
            onClick={() => onNavigate("schedule")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600 text-slate-600 transition-all text-center group"
          >
            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
              <Calendar size={20} />
            </div>
            <span className="text-xs font-semibold mt-2">Timetables</span>
          </button>

          <button
            onClick={() => onNavigate("library")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600 text-slate-600 transition-all text-center group"
          >
            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
              <BookOpen size={20} />
            </div>
            <span className="text-xs font-semibold mt-2">Library Catalog</span>
          </button>

          <button
            onClick={() => onNavigate("billing")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600 text-slate-600 transition-all text-center group"
          >
            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
              <Wallet size={20} />
            </div>
            <span className="text-xs font-semibold mt-2">Exam Fees</span>
          </button>

          <button
            onClick={() => onNavigate("academic")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600 text-slate-600 transition-all text-center group"
          >
            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
              <GraduationCap size={20} />
            </div>
            <span className="text-xs font-semibold mt-2">Results & CGPA</span>
          </button>

          <button
            onClick={() => onNavigate("directory")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600 text-slate-600 transition-all text-center group"
          >
            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
              <Users size={20} />
            </div>
            <span className="text-xs font-semibold mt-2">Faculty Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
}
