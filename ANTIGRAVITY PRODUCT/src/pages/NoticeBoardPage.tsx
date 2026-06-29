import React, { useState } from "react";
import type { User, Notice } from "../types";
import { Search, Filter, Plus, X, Megaphone, Paperclip, Calendar, Tag, Trash2 } from "lucide-react";

const CATEGORIES = ["all", "academic", "examination", "administration", "events", "placement", "emergency"];
const CAT_COLORS: Record<string, string> = {
  academic: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300", examination: "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300",
  administration: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300", events: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
  placement: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300", emergency: "bg-red-100 text-red-700",
};

interface Props { user: User; notices: Notice[]; onAddNotice: (d: Partial<Notice>) => Promise<boolean>; onDeleteNotice: (id: string) => Promise<boolean>; }

export default function NoticeBoardPage({ user, notices, onAddNotice, onDeleteNotice }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState<Notice["category"]>("academic");
  const [expanded, setExpanded] = useState<string | null>(null);

  const canManage = user.role === "admin" || user.role === "teacher" || user.role === "admin-officer";
  const filtered = notices.filter(n => {
    if (category !== "all" && n.category !== category) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onAddNotice({ title, description: desc, category: cat });
    if (ok) { setShowForm(false); setTitle(""); setDesc(""); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Notice Board</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{filtered.length} notices · Campus announcements & updates</p>
        </div>
        {canManage && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl transition cursor-pointer">
            <Plus size={16} /> Post Notice
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fadeIn">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notices..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-400 transition" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                category === c ? "bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filtered.map((notice, i) => (
          <div key={notice._id} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden card-hover animate-fadeIn stagger-${Math.min(i + 1, 8)}`}>
            <div className="p-5 cursor-pointer select-none" onClick={() => setExpanded(expanded === notice._id ? null : notice._id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${CAT_COLORS[notice.category] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                      {notice.category}
                    </span>
                    {notice.attachments.length > 0 && <Paperclip size={12} className="text-slate-400" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">{notice.title}</h3>
                  {expanded === notice._id ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 whitespace-pre-wrap">{notice.description}</p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{notice.description}</p>
                  )}
                  <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 mt-1 inline-block">
                    {expanded === notice._id ? "Show less ↑" : "Read more ↓"}
                  </span>
                </div>
                {canManage && notice.createdBy === user._id && (
                  <button onClick={e => { e.stopPropagation(); onDeleteNotice(notice._id); }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span>·</span>
                <span>{notice.createdByName}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Megaphone size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">No notices found</p>
          </div>
        )}
      </div>

      {/* Add Notice Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-fadeInScale" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Post New Notice</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-indigo-400 transition" placeholder="Notice title" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none focus:border-indigo-400 transition" placeholder="Notice content..." />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                <select value={cat} onChange={e => setCat(e.target.value as Notice["category"])}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-indigo-400 transition bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {CATEGORIES.filter(c => c !== "all").map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 transition cursor-pointer">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
