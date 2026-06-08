import React, { useState } from "react";
import { TimeTableSlot, User } from "../types";
import {
  Calendar,
  Clock,
  MapPin,
  User as InstructorIcon,
  Plus,
  Sparkles,
  Check,
  Filter,
  Columns
} from "lucide-react";

interface TimetableViewProps {
  user: User;
  timetable: TimeTableSlot[];
  onAddSlot: (slot: Partial<TimeTableSlot>) => Promise<boolean>;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetableView({
  user,
  timetable,
  onAddSlot
}: TimetableViewProps) {
  const [selectedSemester, setSelectedSemester] = useState<number>(6);
  const [activeDay, setActiveDay] = useState<string>("Monday");

  // Admin/Teacher Add Slot Modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [instructor, setInstructor] = useState("");
  const [classroom, setClassroom] = useState("");
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:30 AM");
  const [semesterInput, setSemesterInput] = useState("6");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canAddSlot = user.role === "admin" || user.role === "teacher";

  // Filter timetable
  const filteredSlots = timetable.filter(
    (slot) => slot.semester === selectedSemester && slot.day === activeDay
  ).sort((a, b) => {
    // Simple chronological sort helper
    return a.startTime.localeCompare(b.startTime);
  });

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !classroom || !startTime || !endTime) {
      setError("Please key in the fields required.");
      return;
    }

    setSubmitting(true);
    setError("");
    const ok = await onAddSlot({
      subject,
      instructor: instructor || user.name,
      classroom,
      day,
      startTime,
      endTime,
      semester: Number(semesterInput)
    });

    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      setSubject("");
      setInstructor("");
      setClassroom("");
      setTimeout(() => {
        setSuccess(false);
        setShowAddForm(false);
      }, 1500);
    } else {
      setError("Failed to create the lecture schedule. Verify connection.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Weekly Lecture Schedules
          </h1>
          <p className="text-sm text-slate-500">
            Keep track of lecture hours, lab rotations, classroom numbers, and faculty details.
          </p>
        </div>

        {canAddSlot && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Plus size={16} />
            {showAddForm ? "Close Drawer" : "Add Lecture Slot"}
          </button>
        )}
      </div>

      {/* Add Lecture Slot Modal */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm transition-all animate-fadeIn">
          <div className="absolute right-0 top-0 w-24 h-24 bg-teal-50 rounded-full blur-2xl opacity-70 pointer-events-none -translate-y-5 translate-x-5"></div>
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" /> Allocate Lecture Time & Hall
          </h2>

          <form onSubmit={handleCreateSlot} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium flex items-center gap-1">
                <Check size={14} /> Schedule slot added and updated in database!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Subject / Lecture Course *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Computer Systems Architecture"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Faculty Instructor
                </label>
                <input
                  type="text"
                  placeholder={`Default: ${user.name}`}
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Classroom/Lab Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Lab 3 / Seminar Hall"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Week Day
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Target Semester
                </label>
                <select
                  value={semesterInput}
                  onChange={(e) => setSemesterInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Start Time *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 09:00 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  End Time *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 10:30 AM"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm"
              >
                Cancel Slot
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Publishing Schedule..." : "Allocate Lecture Hour"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selector controls for Semester & Days */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        {/* Semester selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono shrink-0">
            academic term:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSemester(s)}
                className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
                  selectedSemester === s
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Sem {s}
              </button>
            ))}
          </div>
        </div>

        {/* Week day tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto gap-1">
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`px-5 py-2.5 text-xs font-semibold tracking-wide border-b-2 font-display uppercase tracking-wider whitespace-nowrap transition-all ${
                activeDay === d
                  ? "border-b-indigo-600 text-indigo-600 font-bold bg-indigo-50/20"
                  : "border-b-transparent text-slate-500 hover:text-slate-950"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Lectures Time Column */}
      <div className="space-y-4">
        {filteredSlots.length === 0 ? (
          <div className="py-12 bg-white rounded-xl border border-slate-200 text-center space-y-2">
            <Calendar size={32} className="text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 font-medium">No lectures scheduled for {activeDay} (Semester {selectedSemester}).</p>
            <p className="text-xs text-slate-400">Enjoy the free study period or verify other weekday schedules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSlots.map((slot) => (
              <div
                key={slot._id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all hover:shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      <Clock size={11} />
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      <MapPin size={11} className="text-slate-400" />
                      {slot.classroom}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                    {slot.subject}
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-mono">
                    <InstructorIcon size={12} className="text-slate-400" />
                    <span>{slot.instructor}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">B.Tech IT</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
