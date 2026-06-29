import React, { useState, useRef } from "react";
import type { User, StudyMaterial, Subject } from "../types";
import { Search, Plus, X, Download, Eye, FileText, BookOpen, Filter, Clock, Upload, Image } from "lucide-react";

const CATEGORIES = ["all", "lecture-notes", "assignments", "lab-manuals", "question-banks", "reference", "project-guidelines"];
const CAT_LABELS: Record<string, string> = { "lecture-notes": "Lecture Notes", "assignments": "Assignments", "lab-manuals": "Lab Manuals", "question-banks": "Question Banks", "reference": "Reference", "project-guidelines": "Project Guidelines" };

interface Props { user: User; materials: StudyMaterial[]; subjects: Subject[]; onAddMaterial: (formData: FormData) => Promise<boolean>; }

export default function StudyMaterialsPage({ user, materials, subjects, onAddMaterial }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [semFilter, setSemFilter] = useState<number | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("");
  const [cat, setCat] = useState("lecture-notes"); const [semester, setSemester] = useState(6);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = user.role === "teacher" || user.role === "admin";
  const filtered = materials.filter(m => {
    if (category !== "all" && m.category !== category) return false;
    if (semFilter !== "all" && m.semester !== semFilter) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", desc);
    formData.append("subject", subject);
    formData.append("semester", String(semester));
    formData.append("category", cat);
    if (selectedFile) formData.append("file", selectedFile);
    const ok = await onAddMaterial(formData);
    setUploading(false);
    if (ok) { setShowForm(false); setTitle(""); setDesc(""); setSubject(""); setSelectedFile(null); }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const getFileIcon = (type: string) => {
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(type)) return <Image size={20} className="text-violet-600 dark:text-violet-400" />;
    return <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div><h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Study Materials</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{filtered.length} resources · Subject-wise notes & downloads</p></div>
        {canUpload && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 cursor-pointer">
            <Plus size={16} /> Upload Material
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 animate-fadeIn">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-400 transition" />
        </div>
        <select value={semFilter} onChange={e => setSemFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-400 transition">
          <option value="all">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              category === c ? "bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}>
            {c === "all" ? "All" : CAT_LABELS[c] || c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((m, i) => (          
          <div key={m._id} 
               onClick={() => {
                 if (m.downloadUrl === "#") {
                   alert("This is a demo file. Please upload a real file to test downloading.");
                 } else {
                   window.open(`/api/study-materials/${m._id}/download`, "_blank");
                 }
               }}
               className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 card-hover cursor-pointer animate-fadeIn stagger-${Math.min(i + 1, 8)}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 dark:from-indigo-500/20 to-violet-100 dark:to-violet-500/20 flex items-center justify-center shrink-0">
                {getFileIcon(m.fileType)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display" style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">{m.subject}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Sem {m.semester}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300">{CAT_LABELS[m.category] || m.category}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase">{m.fileType}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Eye size={11} /> {m.views}</span>
                    <span className="flex items-center gap-1"><Download size={11} /> {m.downloads}</span>
                    <span>{m.fileSize}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 transition cursor-pointer" title="Download">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">{m.uploadedByName} · {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <BookOpen size={40} className="mx-auto text-slate-200 mb-3" /><p className="text-sm text-slate-400">No materials found</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-fadeInScale" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Upload Study Material</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder="Material title" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder="Subject name" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Semester</label>
                  <select value={semester} onChange={e => setSemester(Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select></div>
              </div>

              {/* File Upload Zone */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Upload File (PDF, Image, Doc)</label>
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${selectedFile ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt,.csv" onChange={e => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                        <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null); }} className="p-1 text-slate-400 hover:text-rose-500 transition">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Click to browse or drag & drop</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">PDF, Images, Docs — up to 50MB</p>
                    </>
                  )}
                </div>
              </div>

              <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                <select value={cat} onChange={e => setCat(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
              <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder="Brief description..." /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</> : <><Upload size={14} /> Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
