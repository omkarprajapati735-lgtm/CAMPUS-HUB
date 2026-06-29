import React, { useState } from "react";
import type { User, Student, Subject, Attendance } from "../types";
import { BookCheck, Users, Check, X as XIcon, Clock, Calendar } from "lucide-react";

interface Props { user: User; students: Student[]; subjects: Subject[]; onMarkAttendance: (records: Partial<Attendance>[]) => Promise<boolean>; }

export default function AttendancePage({ user, students, subjects, onMarkAttendance }: Props) {
  const mySubjects = subjects.filter(s => s.assignedTeacher === user._id);
  const [selectedSubject, setSelectedSubject] = useState(mySubjects[0]?._id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "present" | "absent" | "late">>({});
  const [submitted, setSubmitted] = useState(false);

  const subjectObj = subjects.find(s => s._id === selectedSubject);
  const eligibleStudents = students.filter(s => subjectObj ? s.semester === subjectObj.semester : true);

  const toggleStatus = (studentId: string) => {
    const current = attendanceMap[studentId] || "present";
    const next = current === "present" ? "absent" : current === "absent" ? "late" : "present";
    setAttendanceMap({ ...attendanceMap, [studentId]: next });
  };

  const handleSubmit = async () => {
    const records = eligibleStudents.map(s => ({
      studentId: s._id, subjectId: selectedSubject, subjectName: subjectObj?.subjectName || "",
      date, status: attendanceMap[s._id] || "present",
    }));
    const ok = await onMarkAttendance(records);
    if (ok) setSubmitted(true);
  };

  const presentCount = eligibleStudents.filter(s => (attendanceMap[s._id] || "present") === "present").length;
  const absentCount = eligibleStudents.filter(s => attendanceMap[s._id] === "absent").length;
  const lateCount = eligibleStudents.filter(s => attendanceMap[s._id] === "late").length;

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn"><h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Attendance Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Mark and manage student attendance records</p></div>

      <div className="flex flex-col sm:flex-row gap-3 animate-fadeIn">
        <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSubmitted(false); setAttendanceMap({}); }}
          className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-400 transition flex-1">
          {mySubjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} — {s.subjectName}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 font-mono focus:border-indigo-400 transition" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 animate-fadeIn">
        {[
          { label: "Present", value: presentCount, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
          { label: "Absent", value: absentCount, color: "text-rose-600 bg-rose-50 border-rose-200" },
          { label: "Late", value: lateCount, color: "text-amber-600 bg-amber-50 border-amber-200" },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.color} text-center`}>
            <p className="text-2xl font-bold font-display">{s.value}</p>
            <p className="text-xs font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center animate-fadeIn">
          <Check size={40} className="mx-auto text-emerald-500 mb-3" />
          <h3 className="text-lg font-bold font-display text-emerald-800">Attendance Saved!</h3>
          <p className="text-sm text-emerald-600 mt-1">{presentCount} present, {absentCount} absent, {lateCount} late for {date}</p>
          <button onClick={() => { setSubmitted(false); setAttendanceMap({}); }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-emerald-700 transition">
            Mark Another
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-fadeIn">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left py-3 px-4 text-slate-400 font-mono uppercase tracking-wider">Roll No.</th>
                <th className="text-left py-3 px-4 text-slate-400 font-mono uppercase tracking-wider">Student</th>
                <th className="text-center py-3 px-4 text-slate-400 font-mono uppercase tracking-wider">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {eligibleStudents.map(s => {
                  const status = attendanceMap[s._id] || "present";
                  return (
                    <tr key={s._id} className="table-row-hover">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">{s.rollNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{s.email.split("@")[0]}</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => toggleStatus(s._id)}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                            status === "present" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200" :
                            status === "absent" ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-200" :
                            "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
                          }`}>
                          {status}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {eligibleStudents.length === 0 && <div className="p-12 text-center text-slate-400 text-sm">No students found for this subject</div>}
          </div>

          {eligibleStudents.length > 0 && (
            <button onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition cursor-pointer animate-fadeIn">
              Save Attendance for {date}
            </button>
          )}
        </>
      )}
    </div>
  );
}
