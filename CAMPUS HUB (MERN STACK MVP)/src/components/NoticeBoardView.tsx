import React, { useState } from "react";
import { Notice, User } from "../types";
import {
  Bell,
  Search,
  Filter,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Check
} from "lucide-react";

interface NoticeBoardViewProps {
  user: User;
  notices: Notice[];
  onAddNotice: (notice: Partial<Notice>) => Promise<boolean>;
  onDeleteNotice: (id: string) => Promise<boolean>;
}

export default function NoticeBoardView({
  user,
  notices,
  onAddNotice,
  onDeleteNotice
}: NoticeBoardViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [importanceFilter, setImportanceFilter] = useState("all");

  // Create notice state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState<"high" | "medium" | "low">("medium");
  const [category, setCategory] = useState<"academic" | "event" | "exam" | "general">("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canPostNotices = user.role === "admin" || user.role === "teacher";

  // Filter logic
  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || notice.category === categoryFilter;
    const matchesImportance = importanceFilter === "all" || notice.importance === importanceFilter;
    return matchesSearch && matchesCategory && matchesImportance;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    const ok = await onAddNotice({
      title,
      description,
      importance,
      category
    });

    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      setTitle("");
      setDescription("");
      setImportance("medium");
      setCategory("general");
      setTimeout(() => {
        setSuccess(false);
        setShowAddForm(false);
      }, 1500);
    } else {
      setError("Could not submit the announcement circular. Verify connection.");
    }
  };

  const deleteNotice = async (id: string) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      await onDeleteNotice(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Notice Board & Circulars
          </h1>
          <p className="text-sm text-slate-500">
            Official announcements, examination notices, event dates, and administrative releases.
          </p>
        </div>

        {canPostNotices && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Plus size={16} />
            {showAddForm ? "Close Drawer" : "Broadcast Circular"}
          </button>
        )}
      </div>

      {/* Broadcast Form Drawer */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm transition-all animate-fadeIn">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-70 pointer-events-none -translate-y-5 translate-x-5"></div>
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" /> Draft Digital Circular Announcement
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium flex items-center gap-1">
                <Check size={14} /> Shared successfully and sent to student alerts!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Extended Lab Timings / Examination Fee Delay"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="general">General Campus Notice</option>
                  <option value="academic">Academic Circular</option>
                  <option value="exam">Exam Announcement</option>
                  <option value="event">Campus Event/Activities</option>
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Importance Tier
                </label>
                <select
                  value={importance}
                  onChange={(e) => setImportance(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low (General Broadcast)</option>
                  <option value="medium">Medium (Requires Reading)</option>
                  <option value="high">High (Urgent Attention)</option>
                </select>
              </div>

              <div className="md:col-span-12">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Circular Content Details *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the announcements, deadlines, references and required actions in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                Dismiss Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Broadcasting..." : "Confirm & Broadcast"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Area */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search circulars by title, keyword, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="all">Every Category</option>
              <option value="academic">Academics</option>
              <option value="exam">Exams</option>
              <option value="event">Events</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <Layers size={14} className="text-slate-400 shrink-0" />
            <select
              value={importanceFilter}
              onChange={(e) => setImportanceFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="all">Every Priority</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="py-12 bg-white rounded-xl border border-slate-100 text-center space-y-2">
            <Bell size={32} className="text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 font-medium">No notice circulars matched your filter settings.</p>
            <p className="text-xs text-slate-400">Clear filters or try a different term.</p>
          </div>
        ) : (
          filteredNotices.map((notice) => {
            // Priority Tag Styles
            let designColor = "border-l-slate-400 bg-slate-50";
            let tagColor = "bg-slate-100 text-slate-700";

            if (notice.importance === "high") {
              designColor = "border-l-rose-500 bg-rose-50/20";
              tagColor = "bg-rose-100 text-rose-700";
            } else if (notice.importance === "medium") {
              designColor = "border-l-indigo-500 bg-indigo-50/10";
              tagColor = "bg-indigo-100 text-indigo-700";
            }

            return (
              <div
                key={notice._id}
                className={`bg-white border border-slate-200 border-l-4 rounded-xl p-5 md:p-6 transition-all hover:border-r-slate-300 hover:shadow-xs flex gap-4 ${designColor}`}
              >
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase font-mono tracking-wider ${tagColor}`}>
                      {notice.importance} priority
                    </span>
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                      {notice.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                      {notice.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                      <Calendar size={12} />
                      {new Date(notice.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                      <span className="text-slate-300">•</span>
                      <span>By: {notice.postedByName}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {notice.description}
                  </p>
                </div>

                {canPostNotices && (
                  <button
                    onClick={() => deleteNotice(notice._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 self-start"
                    title="Delete notice"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
