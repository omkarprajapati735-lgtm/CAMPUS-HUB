import React, { useState } from "react";
import type { User, Result, StudentProgress, Student, Subject } from "../types";
import { TrendingUp, Award, Target, BookOpen, Plus, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from "recharts";

interface Props { user: User; results: Result[]; progress?: StudentProgress; allProgress: StudentProgress[]; students: Student[]; subjects: Subject[]; onAddResult: (d: Partial<Result>) => Promise<boolean>; }

export default function ResultsPage({ user, results, progress, allProgress, students, subjects, onAddResult }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [semFilter, setSemFilter] = useState<number | "all">("all");
  const [formData, setFormData] = useState({ studentId: "", subjectName: "", semester: 6, marksObtained: 0, totalMarks: 100, grade: "A", gpa: 9, credits: 4 });
  const canManage = user.role === "teacher" || user.role === "admin";

  const filteredResults = semFilter === "all" ? results : results.filter(r => r.semester === semFilter);
  const semesters = [...new Set(results.map(r => r.semester))].sort();
  const cgpaData = progress?.academicHistory.map(h => ({ name: `Sem ${h.semester}`, SGPA: h.sgpa, credits: h.credits })) || [];

  const semResults = semesters.map(sem => {
    const semRes = results.filter(r => r.semester === sem);
    const avg = semRes.length > 0 ? Math.round(semRes.reduce((s, r) => s + r.marksObtained, 0) / semRes.length) : 0;
    return { name: `Sem ${sem}`, avg, subjects: semRes.length };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onAddResult(formData as any);
    if (ok) setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div><h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Results & Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Academic performance tracking and grade analysis</p></div>
        <div className="flex items-center gap-2">
          <select value={semFilter} onChange={e => setSemFilter(e.target.value === "all" ? "all" : Number(e.target.value))} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            <option value="all">All Semesters</option>
            {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          {canManage && <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-semibold shadow-lg cursor-pointer"><Plus size={14} /> Add Result</button>}
        </div>
      </div>

      {progress && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {[
            { label: "Current CGPA", value: progress.currentCGPA.toFixed(2), icon: <Award size={20} />, color: "from-indigo-500 to-violet-600" },
            { label: "Total Credits", value: progress.totalCredits, icon: <Target size={20} />, color: "from-emerald-500 to-teal-600" },
            { label: "Credits Passed", value: progress.passedCredits, icon: <TrendingUp size={20} />, color: "from-amber-500 to-orange-600" },
            { label: "Subjects Graded", value: results.length, icon: <BookOpen size={20} />, color: "from-rose-500 to-pink-600" },
          ].map((c, i) => (
            <div key={c.label} className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 card-hover animate-fadeIn stagger-${i + 1}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-lg mb-3`}>{c.icon}</div>
              <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">{c.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
        {cgpaData.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">SGPA Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cgpaData}>
                <defs><linearGradient id="sgpaGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} /><stop offset="100%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[6, 10]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #334155", fontSize: "12px", fontFamily: "JetBrains Mono" }} />
                <Area type="monotone" dataKey="SGPA" stroke="#4f46e5" strokeWidth={2.5} fill="url(#sgpaGrad2)" dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {semResults.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Average Marks by Semester</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={semResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #334155", fontSize: "12px" }} />
                <Bar dataKey="avg" fill="#059669" radius={[6, 6, 0, 0]} name="Avg Marks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn">
        <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-4">Subject Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-100 dark:border-slate-800">
              {user.role !== "student" && <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Student</th>}
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Subject</th>
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Sem</th>
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Marks</th>
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Grade</th>
              <th className="text-left py-2 px-3 text-slate-400 font-mono uppercase tracking-wider">Credits</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredResults.map(r => (
                <tr key={r._id} className="table-row-hover">
                  {user.role !== "student" && <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{students.find(s => s._id === r.studentId)?.email || r.studentId}</td>}
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{r.subjectName}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{r.semester}</td>
                  <td className="py-3 px-3 font-mono"><span className="font-bold text-slate-800 dark:text-slate-200">{r.marksObtained}</span><span className="text-slate-400">/{r.totalMarks}</span></td>
                  <td className="py-3 px-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.grade.includes("A") ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : r.grade.includes("B") ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300" : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"}`}>{r.grade}</span></td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{r.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredResults.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No results available</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-fadeInScale" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display">Publish Result</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Student ID</label>
                <select value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" required>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.rollNumber} — {s.email}</option>)}
                </select></div>
              <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                <input type="text" value={formData.subjectName} onChange={e => setFormData({...formData, subjectName: e.target.value})} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Marks</label>
                  <input type="number" value={formData.marksObtained} onChange={e => setFormData({...formData, marksObtained: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Total</label>
                  <input type="number" value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Grade</label>
                  <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {["A+", "A", "B+", "B", "C", "D", "F"].map(g => <option key={g}>{g}</option>)}
                  </select></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg transition cursor-pointer">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
