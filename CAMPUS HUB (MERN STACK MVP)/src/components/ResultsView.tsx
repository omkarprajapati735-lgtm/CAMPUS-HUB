import React, { useState } from "react";
import { ExamResult, StudentProgress, User, StudentProfile } from "../types";
import {
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen
} from "lucide-react";

interface ResultsViewProps {
  user: User;
  students: StudentProfile[];
  results: ExamResult[];
  progress?: StudentProgress;
  onAddResult: (result: Partial<ExamResult>) => Promise<boolean>;
}

export default function ResultsView({
  user,
  students,
  results,
  progress,
  onAddResult
}: ResultsViewProps) {
  const [selectedSemester, setSelectedSemester] = useState<number>(5);

  // Result Upload Drawer
  const [showAddForm, setShowAddForm] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState("");
  const [semesterInput, setSemesterInput] = useState("5");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [grade, setGrade] = useState("A");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canAddResult = user.role === "admin" || user.role === "teacher";

  // Filter results for selected semester
  const filteredResults = results.filter((r) => r.semester === selectedSemester);

  // Math metrics for current semester if results exist
  const totalSubjectMarksSum = filteredResults.reduce((acc, r) => acc + r.marks, 0);
  const totalPossibleSum = filteredResults.reduce((acc, r) => acc + r.totalMarks, 0);
  const semPercentage = totalPossibleSum > 0 ? (totalSubjectMarksSum / totalPossibleSum) * 100 : 0;

  // Render SVG Chart coordinates helper
  const historyData = progress?.academicHistory || [];
  const chartHeight = 140;
  const chartWidth = 400;
  const padding = 20;

  // Generating points for smooth SVG Line Chart
  let pointsStr = "";
  if (historyData.length > 0) {
    historyData.forEach((h, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / Math.max(1, historyData.length - 1);
      // SGPA is 0 to 10 scale
      const y = chartHeight - padding - ((h.sgpa - 5) / 5) * (chartHeight - padding * 2);
      pointsStr += `${x},${y} `;
    });
  }

  const handlePostResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId || !subject || !marks || !grade) {
      setError("Please fill in required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    const ok = await onAddResult({
      studentId: targetStudentId,
      semester: Number(semesterInput),
      subject,
      marks: Number(marks),
      totalMarks: Number(totalMarks),
      grade
    });

    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      setSubject("");
      setMarks("");
      setTimeout(() => {
        setSuccess(false);
        setShowAddForm(false);
      }, 1500);
    } else {
      setError("Could not submit. Verify the academic info is valid.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Academic Grades & Trajectory
          </h1>
          <p className="text-sm text-slate-500">
            Monitor course grades, review semester transcript analysis, and evaluate cumulative performance metrics.
          </p>
        </div>

        {canAddResult && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Plus size={16} />
            {showAddForm ? "Close Drawer" : "Upload Student Grades"}
          </button>
        )}
      </div>

      {/* Upload Grades Drawer */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm transition-all animate-fadeIn">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-70 pointer-events-none -translate-y-5 translate-x-5"></div>
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" /> Push Exam Marks to Registrar Ledger
          </h2>

          <form onSubmit={handlePostResultSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium flex items-center gap-1">
                <Check size={14} /> Result published. Dynamic CGPA updated and student alerted!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Select Student roll *
                </label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">Choose Roll No.</option>
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.rollNo} (Sem {st.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Academic Term *
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

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Grade Letters *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                >
                  {["A+", "A", "B+", "B", "C+", "C", "D", "F"].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Class / Subject Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Advanced Database Architectures"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Marks Scored *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Max possible marks
                </label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 pointer-events-none"
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm"
              >
                Dismiss Form
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Publishing Grades..." : "Confer Degree Grades"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dual Core Grid: CGPA Overview + Academic History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cumulative performance summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 lg:col-span-5 space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight uppercase tracking-wider text-slate-400 font-mono mb-4">
              Performance Index
            </h3>

            <div className="flex items-center gap-5">
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                {/* Custom circular SVG dial */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    className="stroke-slate-100"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    className="stroke-indigo-600"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="276"
                    strokeDashoffset={276 - (276 * (progress?.currentCGPA || 0)) / 10}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold font-display text-slate-900 leading-none">
                    {progress?.currentCGPA.toFixed(2) || "0.00"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">CGPA</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">Degree Tier status</p>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Award size={15} className="text-indigo-600 shrink-0" />
                    First Class Distinction
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs border-t pt-2 border-slate-100">
                  <div>
                    <span className="text-slate-400 font-mono block">Passed:</span>
                    <span className="font-semibold text-slate-700">{progress?.passedCredits || 0} Credits</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono block">Current Sem:</span>
                    <span className="font-semibold text-slate-700">Sem {progress?.currentSemester || 6}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * CGPA calculations are strictly derived dynamically using registered marks records.
          </p>
        </div>

        {/* Dynamic SGPA charts comparison */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 lg:col-span-7 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={16} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900 font-display">Semesters Progress Chart</h3>
              </div>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                Trend analysis
              </span>
            </div>

            {historyData.length === 0 ? (
              <div className="py-8 text-center text-slate-500 font-mono text-xs">
                No historical CGPA tracking nodes created yet.
              </div>
            ) : (
              <div className="w-full flex-1 flex flex-col justify-end">
                {/* Pure custom SVG Line Chart */}
                <div className="relative w-full overflow-hidden self-center h-32">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="20" x2={chartWidth} y2="20" className="stroke-slate-100" strokeWidth="1" />
                    <line x1="0" y1="70" x2={chartWidth} y2="70" className="stroke-slate-150" strokeWidth="1" />
                    <line x1="0" y1="120" x2={chartWidth} y2="120" className="stroke-slate-200" strokeWidth="1" strokeDasharray="3" />

                    {/* Chart path line */}
                    {pointsStr && (
                      <>
                        <polyline
                          fill="none"
                          className="stroke-indigo-600"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={pointsStr}
                        />
                        {/* Interactive Node markers circles */}
                        {historyData.map((h, index) => {
                          const x = padding + (index * (chartWidth - padding * 2)) / Math.max(1, historyData.length - 1);
                          const y = chartHeight - padding - ((h.sgpa - 5) / 5) * (chartHeight - padding * 2);
                          return (
                            <g key={index}>
                              <circle cx={x} cy={y} r="5" className="fill-white stroke-indigo-600" strokeWidth="2.5" />
                              <text x={x} y={y - 12} textAnchor="middle" className="text-[9px] fill-indigo-650 font-bold font-mono">
                                {h.sgpa.toFixed(2)}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    )}
                  </svg>
                </div>

                {/* Semester labels */}
                <div className="flex justify-between px-2.5 font-mono text-[9px] text-slate-400 mt-2">
                  {historyData.map((h, index) => (
                    <span key={index}>Sem {h.semester}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Selected semester grade list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Semester header filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-slate-505" />
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono">
              Course Transcript Semester Statement
            </h3>
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSemester(s)}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded border transition-all ${
                  selectedSemester === s
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Sem {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table content */}
        {filteredResults.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs bg-white">
            <GraduationCap size={28} className="text-slate-300 mx-auto mb-1.5" />
            <p className="font-semibold">No results published for Semester {selectedSemester} yet.</p>
            <p className="text-[10px] text-slate-400">Grades are posted on completion of final terms assessments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-left border-collapse text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-semibold font-mono uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Subject</th>
                  <th className="p-4">Marks Out of Total</th>
                  <th className="p-4">Grade Letter</th>
                  <th className="p-4">Credits Issued</th>
                  <th className="p-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredResults.map((result) => {
                  let badge = "bg-slate-100 text-slate-700";
                  if (result.grade.includes("A")) badge = "bg-emerald-50 text-emerald-800 font-bold border border-emerald-100";
                  else if (result.grade.includes("B")) badge = "bg-indigo-50 text-indigo-800 font-medium border border-indigo-100";

                  return (
                    <tr key={result._id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-slate-800">{result.subject}</td>
                      <td className="p-4 font-mono text-xs">{result.marks} <span className="text-slate-400">/ {result.totalMarks}</span></td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs leading-none ${badge}`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs">4.0 Credits</td>
                      <td className="p-4 text-right font-semibold text-emerald-600 text-xs font-mono">Passed</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
