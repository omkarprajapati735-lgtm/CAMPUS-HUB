import React, { useState } from "react";
import type { User, Assignment, Subject } from "../types";
import { ClipboardList, Plus, X, Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";

interface Props { user: User; assignments: Assignment[]; subjects: Subject[]; onAddAssignment: (d: Partial<Assignment>) => Promise<boolean>; }

export default function AssignmentsPage({ user, assignments, subjects, onAddAssignment }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", subjectName: "", dueDate: "", totalMarks: 50 });
  const canCreate = user.role === "teacher";
  const now = new Date();

  const active = assignments.filter(a => a.status === "active" && new Date(a.dueDate) >= now);
  const pastDue = assignments.filter(a => a.status === "active" && new Date(a.dueDate) < now);
  const closed = assignments.filter(a => a.status === "closed");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onAddAssignment(formData as any);
    if (ok) { setShowForm(false); setFormData({ title: "", description: "", subjectName: "", dueDate: "", totalMarks: 50 }); }
  };

  const daysRemaining = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: "text-rose-600" };
    if (diff === 0) return { text: "Due today", color: "text-amber-600" };
    if (diff <= 3) return { text: `${diff}d left`, color: "text-amber-600" };
    return { text: `${diff}d left`, color: "text-emerald-600" };
  };

  const renderCard = (a: Assignment, i: number) => {
    const dr = daysRemaining(a.dueDate);
    return (
      <div key={a._id} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 card-hover animate-fadeIn stagger-${Math.min(i + 1, 8)}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">{a.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">{a.subjectName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{a.totalMarks} marks</span>
            </div>
          </div>
          <span className={`text-xs font-bold font-mono ${dr.color}`}>{dr.text}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{a.description}</p>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1"><Calendar size={11} /> Due: {a.dueDate}</span>
          <span>{a.teacherName}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div><h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{active.length} active · {pastDue.length} past due</p></div>
        {canCreate && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg cursor-pointer">
            <Plus size={16} /> Create Assignment
          </button>
        )}
      </div>

      {active.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">Active Assignments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{active.map(renderCard)}</div>
        </div>
      )}

      {pastDue.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 font-mono flex items-center gap-1"><AlertCircle size={12} /> Past Due</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{pastDue.map(renderCard)}</div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <ClipboardList size={40} className="mx-auto text-slate-200 mb-3" /><p className="text-sm text-slate-400">No assignments</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-fadeInScale" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display">Create Assignment</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                  <input type="text" value={formData.subjectName} onChange={e => setFormData({...formData, subjectName: e.target.value})} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
              </div>
              <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
              <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Total Marks</label>
                <input type="number" value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg transition cursor-pointer">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
