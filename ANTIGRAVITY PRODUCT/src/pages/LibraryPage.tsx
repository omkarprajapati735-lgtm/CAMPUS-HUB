import React, { useState } from "react";
import type { User, Book, BorrowRecord } from "../types";
import { Search, Plus, X, Library, BookOpen, BookCheck, Clock, AlertTriangle } from "lucide-react";

interface Props { user: User; books: Book[]; borrowRecords: BorrowRecord[]; onBorrowBook: (id: string, studentId: string) => Promise<boolean>; onReturnBook: (id: string) => Promise<boolean>; onAddBook: (d: Partial<Book>) => Promise<boolean>; }

export default function LibraryPage({ user, books, borrowRecords, onBorrowBook, onReturnBook, onAddBook }: Props) {
  const [tab, setTab] = useState<"catalog" | "history">("catalog");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", author: "", isbn: "", category: "Computer Science", quantity: 1, description: "", publishedYear: 2024, location: "Shelf A1" });

  const canManage = user.role === "librarian" || user.role === "admin";
  const categories = ["all", ...new Set(books.map(b => b.category))];
  const filtered = books.filter(b => {
    if (catFilter !== "all" && b.category !== catFilter) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onAddBook(formData as any);
    if (ok) { setShowForm(false); setFormData({ title: "", author: "", isbn: "", category: "Computer Science", quantity: 1, description: "", publishedYear: 2024, location: "Shelf A1" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div><h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Library Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{books.length} books · Browse, borrow & manage</p></div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {(["catalog", "history"] as const).map(v => (
              <button key={v} onClick={() => setTab(v)} className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition cursor-pointer ${tab === v ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"}`}>{v === "catalog" ? "Book Catalog" : "Borrow History"}</button>
            ))}
          </div>
          {canManage && <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-semibold shadow-lg cursor-pointer"><Plus size={14} /> Add Book</button>}
        </div>
      </div>

      {tab === "catalog" ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3 animate-fadeIn">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books by title or author..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-400 transition" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((book, i) => (
              <div key={book._id} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 card-hover animate-fadeIn stagger-${Math.min(i + 1, 8)}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0">
                    <BookOpen size={20} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{book.author}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{book.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">{book.category}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">ISBN: {book.isbn.slice(-6)}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300">{book.publishedYear}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className={`font-bold ${book.availableQuantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {book.availableQuantity > 0 ? `${book.availableQuantity} available` : "Not Available"}
                    </span>
                    <span className="text-slate-400"> / {book.quantity} total</span>
                  </div>
                  {user.role === "librarian" && book.availableQuantity > 0 && (
                    <button onClick={() => {
                      const sid = window.prompt("Enter Student Roll Number to allot this book:");
                      if (sid && sid.trim() !== "") onBorrowBook(book._id, sid.trim());
                    }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-semibold hover:bg-indigo-700 transition cursor-pointer">
                      Allot Book
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Library size={40} className="mx-auto text-slate-200 mb-3" /><p className="text-sm text-slate-400">No books found</p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3 animate-fadeIn">
          {borrowRecords.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <BookCheck size={40} className="mx-auto text-slate-200 mb-3" /><p className="text-sm text-slate-400">No borrowing history</p>
            </div>
          ) : (
            borrowRecords.map((r, i) => (
              <div key={r._id} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4 card-hover animate-fadeIn stagger-${Math.min(i + 1, 8)}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.status === "returned" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300" : r.status === "overdue" ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300" : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300"}`}>
                  {r.status === "returned" ? <BookCheck size={18} /> : r.status === "overdue" ? <AlertTriangle size={18} /> : <Clock size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{r.bookTitle}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{r.bookAuthor}</p>
                  {user.role !== "student" && (
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      Borrowed by: {r.studentName}
                    </p>
                  )}
                  <div className="flex gap-3 mt-1 text-[10px] text-slate-400 font-mono">
                    <span>Issued: {r.issueDate}</span>
                    <span>Due: {r.dueDate}</span>
                    {r.returnDate && <span>Returned: {r.returnDate}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {r.fineAmount > 0 && <span className="text-xs font-bold text-rose-600 font-mono">₹{r.fineAmount}</span>}
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${r.status === "returned" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : r.status === "overdue" ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300" : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"}`}>{r.status}</span>
                  {r.status === "borrowed" && user.role === "librarian" && (
                    <button onClick={() => onReturnBook(r._id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-semibold hover:bg-emerald-700 transition cursor-pointer">Return</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-fadeInScale" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display">Add New Book</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Author</label>
                  <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">ISBN</label>
                  <input type="text" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} required className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Quantity</label>
                  <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} min={1} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Year</label>
                  <input type="number" value={formData.publishedYear} onChange={e => setFormData({...formData, publishedYear: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
                <div><label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg transition cursor-pointer">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
