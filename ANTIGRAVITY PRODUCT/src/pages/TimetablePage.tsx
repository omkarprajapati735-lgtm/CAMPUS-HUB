import React, { useState } from "react";
import type { User, Timetable } from "../types";
import { CalendarDays, Clock, MapPin, GraduationCap, Plus, X } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TYPE_COLORS: Record<string, string> = { lecture: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200", lab: "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-200", tutorial: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200" };

interface Props { user: User; timetable: Timetable[]; onAddSlot: (d: Partial<Timetable>) => Promise<boolean>; }

export default function TimetablePage({ user, timetable, onAddSlot }: Props) {
  const [view, setView] = useState<"weekly" | "daily">("weekly");
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 || new Date().getDay() === 6 ? 0 : new Date().getDay() - 1]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ subjectName: "", classroom: "", day: "Monday", startTime: "09:00", endTime: "10:30", type: "lecture" });
  const canManage = user.role === "admin" || user.role === "teacher";

  const getSlots = (day: string) => timetable.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onAddSlot(formData as any);
    if (ok) { setShowForm(false); setFormData({ subjectName: "", classroom: "", day: "Monday", startTime: "09:00", endTime: "10:30", type: "lecture" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div><h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Timetable</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Weekly class schedule & room assignments</p></div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {(["weekly", "daily"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition cursor-pointer ${view === v ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}`}>{v}</button>
            ))}
          </div>
          {canManage && <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-semibold shadow-lg cursor-pointer"><Plus size={14} /> Add Slot</button>}
        </div>
      </div>

      {view === "weekly" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-fadeIn">
          {DAYS.map((day, di) => (
            <div key={day} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-fadeIn stagger-${di + 1}`}>
              <div className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-4 py-2.5">
                <p className="text-xs font-bold font-display">{day}</p>
              </div>
              <div className="p-3 space-y-2 min-h-[200px]">
                {getSlots(day).length === 0 ? (
                  <p className="text-xs text-slate-300 text-center py-8">No classes</p>
                ) : (
                  getSlots(day).map(slot => (
                    <div key={slot._id} className={`p-3 rounded-xl border ${TYPE_COLORS[slot.type] || "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"}`}>
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{slot.subjectName}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] opacity-80">
                        <Clock size={10} /> {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-70">
                        <MapPin size={10} /> {slot.classroom}
                      </div>
                      <p className="text-[9px] mt-1 opacity-60">{slot.teacherName}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-fadeIn">
          <div className="flex gap-2 mb-4">
            {DAYS.map(d => (
              <button key={d} onClick={() => setSelectedDay(d)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${selectedDay === d ? "bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}`}>
                {d.substring(0, 3)}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {getSlots(selectedDay).map(slot => (
              <div key={slot._id} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4 card-hover`}>
                <div className="text-center shrink-0 w-20">
                  <p className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">{slot.startTime}</p>
                  <div className="w-px h-2 bg-slate-200 mx-auto my-0.5" />
                  <p className="text-sm font-mono text-slate-400">{slot.endTime}</p>
                </div>
                <div className={`w-1 h-12 rounded-full ${slot.type === "lab" ? "bg-violet-500" : slot.type === "tutorial" ? "bg-amber-500" : "bg-blue-500"}`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">{slot.subjectName}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><MapPin size={12} /> {slot.classroom}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><GraduationCap size={12} /> {slot.teacherName}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${TYPE_COLORS[slot.type]}`}>{slot.type}</span>
              </div>
            ))}
            {getSlots(selectedDay).length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <CalendarDays size={40} className="mx-auto text-slate-200 mb-3" /><p className="text-sm text-slate-400">No classes on {selectedDay}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-fadeInScale" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display">Add Timetable Slot</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                <input type="text" value={formData.subjectName} onChange={e => setFormData({ ...formData, subjectName: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Day</label>
                  <select value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select></div>
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Classroom</label>
                  <input type="text" value={formData.classroom} onChange={e => setFormData({ ...formData, classroom: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Start</label>
                  <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">End</label>
                  <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    <option value="lecture">Lecture</option><option value="lab">Lab</option><option value="tutorial">Tutorial</option>
                  </select></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg transition cursor-pointer">Add Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
