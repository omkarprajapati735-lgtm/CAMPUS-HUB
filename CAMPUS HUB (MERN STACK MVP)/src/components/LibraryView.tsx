import React, { useState } from "react";
import { LibraryBook, BorrowRecord, User } from "../types";
import {
  BookOpen,
  Search,
  CheckCircle,
  XCircle,
  BookMarked,
  History,
  Clock,
  Sparkles,
  Plus,
  Check,
  RotateCcw,
  BookOpenCheck
} from "lucide-react";

interface LibraryViewProps {
  user: User;
  books: LibraryBook[];
  history: BorrowRecord[];
  onBorrowBook: (bookId: string) => Promise<boolean>;
  onReturnBook: (recordId: string) => Promise<boolean>;
  onAddBook: (book: Partial<LibraryBook>) => Promise<boolean>;
}

export default function LibraryView({
  user,
  books,
  history,
  onBorrowBook,
  onReturnBook,
  onAddBook
}: LibraryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"catalog" | "history">("catalog");

  // Admin uploader
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState("Computer Science");
  const [quantity, setQuantity] = useState("5");
  const [description, setDescription] = useState("");
  const [publishedYear, setPublishedYear] = useState("2022");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Borrow loading tracker
  const [borrowingId, setBorrowingId] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);

  const canAddBook = user.role === "admin" || user.role === "librarian";

  const categories = [
    "all",
    "Computer Science",
    "Information Systems",
    "Networking",
    "Software Practice",
    "General"
  ];

  // Filters
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    const matchesCategory = categoryFilter === "all" || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleBorrow = async (bookId: string) => {
    setBorrowingId(bookId);
    await onBorrowBook(bookId);
    setBorrowingId(null);
  };

  const handleReturn = async (recordId: string) => {
    setReturningId(recordId);
    await onReturnBook(recordId);
    setReturningId(null);
  };

  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !isbn || !quantity) {
      setError("Please fill in required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    const ok = await onAddBook({
      title,
      author,
      isbn,
      category,
      quantity: Number(quantity),
      description,
      publishedYear: Number(publishedYear)
    });

    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      setTitle("");
      setAuthor("");
      setIsbn("");
      setDescription("");
      setTimeout(() => {
        setSuccess(false);
        setShowAddForm(false);
      }, 1500);
    } else {
      setError("Could not register book to library database catalog.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Library Services Portal
          </h1>
          <p className="text-sm text-slate-500">
            Browse text references, request digital/physical borrows, track due dates, and manage borrow ledger.
          </p>
        </div>

        {canAddBook && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Plus size={16} />
            {showAddForm ? "Close Cataloger" : "Catalog New Title"}
          </button>
        )}
      </div>

      {/* Add book drawer */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm transition-all animate-fadeIn">
          <div className="absolute right-0 top-0 w-24 h-24 bg-teal-50 rounded-full blur-2xl opacity-70 pointer-events-none -translate-y-5 translate-x-5"></div>
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" /> Book Registry Catalog Entry Form
          </h2>

          <form onSubmit={handleAddBookSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-medium font-mono">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-semibold flex items-center gap-1 font-mono">
                <Check size={14} /> Catalog updated and registered successfully!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to Computer Systems Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Author Details *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cormen, Silberschatz, etc."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  ISBN Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 978-0130313583"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Book Subject Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Systems">Information Systems</option>
                  <option value="Networking">Networking</option>
                  <option value="Software Practice">Software Practice</option>
                  <option value="General">General/Others</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Copies Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Published Year
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2027"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-12">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Description / Synopsis
                </label>
                <textarea
                  rows={2}
                  placeholder="Reference material information..."
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
                Dismiss Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Cataloging..." : "Verify & Add to Catalog"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Primary Dashboard Switch Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "catalog"
              ? "border-indigo-600 text-indigo-600 font-bold bg-indigo-50/10"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookMarked size={16} /> Catalog Directory
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-600 font-bold bg-indigo-50/10"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <History size={16} /> Borrow History & Returns ({history.length})
        </button>
      </div>

      {activeTab === "catalog" ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Catalog Filter Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog by title, author, or ISBN key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-xs text-slate-400 font-mono">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none w-full sm:w-auto"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "Every Subject" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Book Catalog Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map((book) => {
              const currentStudentsIssued = history.find(
                (h) => h.bookId === book._id && h.status === "borrowed"
              );
              const isOutStock = book.available <= 0;

              return (
                <div
                  key={book._id}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all hover:shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-medium">
                        {book.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Released: {book.publishedYear}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-500">By: {book.author}</p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {book.description || "Central textbook index for engineering curricula studies."}
                    </p>

                    <div className="text-[10px] text-slate-400 font-mono">
                      <span>ISBN Reference: {book.isbn}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs">
                      {isOutStock ? (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-medium font-mono text-[11px]">
                          <XCircle size={12} className="text-slate-400" /> Out of stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium font-mono text-[11px]">
                          <CheckCircle size={12} className="text-emerald-500" /> {book.available} / {book.quantity} copies in library
                        </span>
                      )}
                    </div>

                    {user.role === "student" && (
                      <button
                        onClick={() => handleBorrow(book._id)}
                        disabled={isOutStock || borrowingId !== null || currentStudentsIssued !== undefined}
                        className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-all select-none ${
                          currentStudentsIssued !== undefined
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium"
                            : isOutStock
                            ? "bg-slate-150 text-slate-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        {currentStudentsIssued !== undefined ? (
                          <span className="flex items-center gap-1">Issued <BookOpenCheck size={11} /></span>
                        ) : borrowingId === book._id ? (
                          "Issuing..."
                        ) : (
                          "Issue Book"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-fadeIn">
          {/* History Details Tab */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <History size={16} className="text-slate-500" />
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono">
              Borrowing ledger statement
            </h3>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-1.5 bg-white">
              <Clock size={24} className="text-slate-300 mx-auto" />
              <p className="text-xs font-semibold">You have not requested book issues yet.</p>
              <p className="text-[11px] text-slate-400">Search the catalog and click "Issue Book" to test.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 text-[10px] font-semibold font-mono uppercase tracking-wider border-b border-slate-200">
                    <th className="p-4">Book Details</th>
                    <th className="p-4">Borrowed on</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Return Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((record) => {
                    const isOverdue = record.status === "overdue" || (record.status === "borrowed" && new Date(record.dueDate) < new Date());

                    return (
                      <tr key={record._id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <div className="font-semibold text-slate-800 line-clamp-1">{record.bookTitle}</div>
                          <div className="text-[10px] text-slate-400">Author: {record.bookAuthor}</div>
                        </td>
                        <td className="p-4 font-mono text-xs">{record.borrowedDate}</td>
                        <td className="p-4 font-mono text-xs text-rose-650">{record.dueDate}</td>
                        <td className="p-4">
                          {record.status === "returned" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Returned ({record.returnDate})
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded animate-pulse">
                              Overdue Fine Due
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              Active Borrow
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {record.status === "borrowed" && (
                            <button
                              onClick={() => handleReturn(record._id)}
                              disabled={returningId !== null}
                              className="px-2.5 py-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white rounded text-[11px] font-semibold text-slate-700 transition"
                            >
                              <RotateCcw size={11} /> Return Book
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
