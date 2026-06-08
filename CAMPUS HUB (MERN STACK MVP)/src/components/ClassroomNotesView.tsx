import React, { useState } from "react";
import { ClassroomNote, User } from "../types";
import {
  FileText,
  Search,
  Book,
  Download,
  Eye,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  Check,
  X,
  ExternalLink
} from "lucide-react";

interface ClassroomNotesViewProps {
  user: User;
  notes: ClassroomNote[];
  onAddNote: (note: Partial<ClassroomNote>) => Promise<boolean>;
  onIncrementViews: (id: string) => void;
}

export default function ClassroomNotesView({
  user,
  notes,
  onAddNote,
  onIncrementViews
}: ClassroomNotesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");

  // Add notes form
  const [showAddForm, setShowAddForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [fileName, setFileName] = useState("");
  const [semester, setSemester] = useState("6");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Preview overlay state
  const [previewNote, setPreviewNote] = useState<ClassroomNote | null>(null);

  const canUpload = user.role === "admin" || user.role === "teacher";

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = semesterFilter === "all" || note.semester.toString() === semesterFilter;
    return matchesSearch && matchesSemester;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !fileName || !semester) {
      setError("Please input the required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    const ok = await onAddNote({
      subject,
      fileName: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`,
      semester: Number(semester),
      description
    });

    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      setSubject("");
      setFileName("");
      setDescription("");
      setTimeout(() => {
        setSuccess(false);
        setShowAddForm(false);
      }, 1500);
    } else {
      setError("Failed to share the note documents. Try again.");
    }
  };

  const startPreview = (note: ClassroomNote) => {
    onIncrementViews(note._id);
    setPreviewNote(note);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Classroom Notes & Resources
          </h1>
          <p className="text-sm text-slate-500">
            Study materials, pdf notes, reference chapters, and curriculum slides shared by professors.
          </p>
        </div>

        {canUpload && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Plus size={16} />
            {showAddForm ? "Close Form" : "Upload Digital Note"}
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm transition-all animate-fadeIn">
          <div className="absolute right-0 top-0 w-24 h-24 bg-teal-50 rounded-full blur-2xl opacity-70 pointer-events-none -translate-y-5 translate-x-5"></div>
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-teal-600" /> Share Curricular Study Guides
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium flex items-center gap-1">
                <Check size={14} /> Shared successfully and broadcast to students!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Computer Networking"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Target Semester *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-12">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Document Filename *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Unit_3_Routing_Mechanisms.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-12">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Reference Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly state syllabus keys covered, assignments to match, or guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm"
              >
                Cancel Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Uploading Documents..." : "Publish PDF Resource"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Searching */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes by subject, filename, or topics covered..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Layers size={14} className="text-slate-400" />
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none w-full sm:w-auto"
          >
            <option value="all">Every Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-12 bg-white rounded-xl border border-slate-100 text-center space-y-2">
            <Book size={32} className="text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 font-medium">No textbook reference notes found matching filters.</p>
            <p className="text-xs text-slate-400">Ask your class professor to share course resources on the portal.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note._id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all hover:shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono font-medium">
                    Sem {note.semester}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {note.fileSize}
                  </span>
                </div>

                <div className="flex gap-2 text-slate-900 group-hover:text-indigo-600 transition-colors">
                  <FileText className="shrink-0 mt-0.5 text-slate-400 group-hover:text-indigo-600" size={18} />
                  <h3 className="text-sm font-semibold tracking-tight truncate" title={note.fileName}>
                    {note.fileName}
                  </h3>
                </div>

                <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider font-mono">
                  {note.subject}
                </p>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {note.description || "Class study companion covering course curriculum syllabus."}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {note.views} reads
                </span>
                <button
                  onClick={() => startPreview(note)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded text-slate-700 font-semibold transition-all text-xs"
                >
                  Read & Download <ExternalLink size={10} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal Overlay */}
      {previewNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" />
                <h3 className="font-semibold text-sm truncate max-w-md">{previewNote.fileName}</h3>
              </div>
              <button
                onClick={() => setPreviewNote(null)}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Document Content View */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 bg-slate-50">
              <div className="bg-white border border-slate-200 p-5 rounded-lg space-y-3 shadow-xs">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                    {previewNote.subject}
                  </span>
                  <span className="text-[10px] font-mono font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    Semester {previewNote.semester} Resource
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  Resource: {previewNote.fileName}
                </h2>
                <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                  <p>Faculty Uploader: <span className="text-slate-600 font-medium">{previewNote.uploadedBy}</span></p>
                  <p>Document Metadata: <span className="text-slate-600 font-medium">{previewNote.fileSize} PDF format</span></p>
                  <p>Reference Date: <span className="text-slate-600 font-medium">{new Date(previewNote.createdAt).toLocaleDateString()}</span></p>
                </div>
              </div>

              {/* Simulated PDF Pages */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs relative overflow-hidden text-xs leading-relaxed text-slate-600">
                  <span className="absolute top-2 right-4 font-mono text-[9px] text-slate-300">PAGE 1 of 2</span>
                  <h4 className="font-bold text-slate-900 border-b pb-2 mb-3 font-display">1. COURSE PREFACE & REVIEWS</h4>
                  <p className="mb-2">
                    This unit reviews the underlying architectures matching standard cloud containers.
                    Ensure server processes bind correctly to Host <span className="font-mono bg-slate-100 px-1 py-0.5 text-slate-800 rounded">0.0.0.0</span> and Port <span className="font-mono bg-slate-100 px-1 py-0.5 text-slate-800 rounded">3000</span> for container routing configurations.
                  </p>
                  <p className="mb-2">
                    The core syllabus covers multi-stage Dockerfiles, caching strategies, and proxy layers like nginx to direct frontend routing.
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded border font-mono text-[10px] text-slate-800 my-4 whitespace-pre-wrap">
                    {`# Example Docker Compose Endpoint Routing\nservices:\n  web:\n    image: node:alpine\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production`}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs relative overflow-hidden text-xs leading-relaxed text-slate-600 border-dashed">
                  <span className="absolute top-2 right-4 font-mono text-[9px] text-slate-300">PAGE 2 of 2 (PREVIEW RESTRICTED)</span>
                  <h4 className="font-bold text-slate-900 border-b pb-2 mb-3 font-display">2. DESIGN CONCEPTS SUMMARY</h4>
                  <p className="mb-3">
                    {previewNote.description || "Class study companion covering exam relevant course questions."}
                  </p>
                  <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-950 font-medium rounded-lg text-center">
                    Simulated PDF preview loaded successfully. Enjoy reading.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Size: {previewNote.fileSize}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewNote(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded text-xs select-none"
                >
                  Close Reader
                </button>
                <a
                  href={previewNote.downloadUrl}
                  download={previewNote.fileName}
                  onClick={() => setPreviewNote(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-xs"
                >
                  <Download size={12} /> Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
