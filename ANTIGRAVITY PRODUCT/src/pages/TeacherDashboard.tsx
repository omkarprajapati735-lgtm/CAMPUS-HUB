import React from "react";
import type { User, Teacher, Subject, Student, Timetable, Assignment, StudyMaterial, Notice } from "../types";
import { Users, BookOpen, CalendarDays, ClipboardList, FileText, TrendingUp, ChevronRight, ArrowUpRight, Clock, GraduationCap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  user: User;
  profile?: Teacher;
  subjects: Subject[];
  students: Student[];
  timetable: Timetable[];
  assignments: Assignment[];
  materials: StudyMaterial[];
  notices: Notice[];
  onNavigate: (view: string) => void;
}

export default function TeacherDashboard({ user, profile, subjects, students, timetable, assignments, materials, notices, onNavigate }: Props) {
  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[today.getDay()];
  const todayClasses = timetable.filter(t => t.day === todayName && t.teacherId === user._id).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const mySubjects = subjects.filter(s => s.assignedTeacher === user._id);
  const myAssignments = assignments.filter(a => a.teacherId === user._id);
  const myMaterials = materials.filter(m => m.uploadedBy === user._id);
  const activeAssignments = myAssignments.filter(a => a.status === "active");

  const subjectData = mySubjects.map(s => ({
    name: s.subjectCode,
    students: students.filter(st => st.semester === s.semester).length,
    credits: s.credits,
  }));

  const stats = [
    { label: "Assigned Subjects", value: mySubjects.length, icon: <BookOpen size={20} />, color: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/20" },
    { label: "Total Students", value: students.length, icon: <Users size={20} />, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" },
    { label: "Active Assignments", value: activeAssignments.length, icon: <ClipboardList size={20} />, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
    { label: "Materials Uploaded", value: myMaterials.length, icon: <FileText size={20} />, color: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          Welcome, <span className="gradient-text">{user.fullName.split(" ").pop()}</span> 📚
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {todayName}, {today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          {profile && <span className="text-slate-400"> · {profile.department} · {profile.designation}</span>}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-5">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Student Distribution by Subject</h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #334155", fontSize: "12px" }} />
                <Bar dataKey="students" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">No subjects assigned</div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-6">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Upload Notes", icon: <FileText size={16} />, view: "materials", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400" },
              { label: "Mark Attendance", icon: <GraduationCap size={16} />, view: "attendance", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" },
              { label: "Create Assignment", icon: <ClipboardList size={16} />, view: "assignments", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400" },
              { label: "Publish Results", icon: <TrendingUp size={16} />, view: "results", color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400" },
              { label: "Post Notice", icon: <FileText size={16} />, view: "notices", color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400" },
            ].map(action => (
              <button key={action.view} onClick={() => onNavigate(action.view)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group cursor-pointer">
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>{action.icon}</div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 text-left">{action.label}</span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 dark:text-slate-400 transition" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Today's Schedule</h3>
            <button onClick={() => onNavigate("timetable")} className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer">Full Schedule</button>
          </div>
          {todayClasses.length === 0 ? (
            <div className="text-center py-8"><CalendarDays size={28} className="mx-auto text-slate-200 mb-2" /><p className="text-xs text-slate-400">No classes today</p></div>
          ) : (
            <div className="space-y-2">
              {todayClasses.map(cls => (
                <div key={cls._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="text-center shrink-0 w-14">
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{cls.startTime}</p>
                    <p className="text-[10px] font-mono text-slate-400">{cls.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{cls.subjectName}</p>
                    <p className="text-[10px] text-slate-400">{cls.classroom}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cls.type === "lab" ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300" : cls.type === "tutorial" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"}`}>
                    {cls.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn stagger-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">Recent Notices</h3>
            <button onClick={() => onNavigate("notices")} className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer">View All</button>
          </div>
          <div className="space-y-3">
            {notices.slice(0, 5).map(n => (
              <div key={n._id} className="flex items-start gap-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.category === "examination" ? "bg-rose-500" : n.category === "events" ? "bg-amber-500" : "bg-indigo-500"}`} />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{n.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
