import React, { useState, useEffect, useCallback } from "react";
import type {
  User, Student, Teacher, Notice, StudyMaterial, Timetable, Book,
  BorrowRecord, Transaction, Result, StudentProgress, Notification,
  Assignment, Attendance, Subject,
  AdminDashboardStats, LibrarianDashboardStats, FinanceDashboardStats,
} from "./types";
import LoginPage from "./pages/LoginPage.tsx";
import StudentDashboard from "./pages/StudentDashboard.tsx";
import TeacherDashboard from "./pages/TeacherDashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import LibrarianDashboard from "./pages/LibrarianDashboard.tsx";
import FinanceDashboard from "./pages/FinanceDashboard.tsx";
import NoticeBoardPage from "./pages/NoticeBoardPage.tsx";
import StudyMaterialsPage from "./pages/StudyMaterialsPage.tsx";
import TimetablePage from "./pages/TimetablePage.tsx";
import LibraryPage from "./pages/LibraryPage.tsx";
import FeesPage from "./pages/FeesPage.tsx";
import ResultsPage from "./pages/ResultsPage.tsx";
import NotificationsPage from "./pages/NotificationsPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import AttendancePage from "./pages/AttendancePage.tsx";
import AssignmentsPage from "./pages/AssignmentsPage.tsx";
import {
  GraduationCap, Bell, LayoutDashboard, Megaphone, BookOpen,
  CalendarDays, Library, Wallet, TrendingUp, Settings as SettingsIcon,
  LogOut, Menu, X, User as UserIcon, BellRing, ClipboardList,
  Users, BookCheck, ChevronRight, FileText,
} from "lucide-react";

// ─── Navigation config per role ──────────────────────────────────────
const NAV_ITEMS: Record<string, { id: string; label: string; icon: React.ReactNode }[]> = {
  student: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "profile", label: "My Profile", icon: <UserIcon size={18} /> },
    { id: "notices", label: "Notice Board", icon: <Megaphone size={18} /> },
    { id: "materials", label: "Study Materials", icon: <BookOpen size={18} /> },
    { id: "timetable", label: "Timetable", icon: <CalendarDays size={18} /> },
    { id: "library", label: "Library Portal", icon: <Library size={18} /> },
    { id: "fees", label: "Fees & Payments", icon: <Wallet size={18} /> },
    { id: "results", label: "Results & Analytics", icon: <TrendingUp size={18} /> },
    { id: "assignments", label: "Assignments", icon: <ClipboardList size={18} /> },
    { id: "notifications", label: "Notifications", icon: <BellRing size={18} /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
  ],
  teacher: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "profile", label: "My Profile", icon: <UserIcon size={18} /> },
    { id: "materials", label: "Notes Management", icon: <BookOpen size={18} /> },
    { id: "attendance", label: "Attendance", icon: <BookCheck size={18} /> },
    { id: "timetable", label: "Timetable", icon: <CalendarDays size={18} /> },
    { id: "assignments", label: "Assignments", icon: <ClipboardList size={18} /> },
    { id: "results", label: "Results & Grading", icon: <TrendingUp size={18} /> },
    { id: "notices", label: "Notices", icon: <Megaphone size={18} /> },
    { id: "notifications", label: "Notifications", icon: <BellRing size={18} /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
  ],
  admin: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "users", label: "User Management", icon: <Users size={18} /> },
    { id: "notices", label: "Notice Board", icon: <Megaphone size={18} /> },
    { id: "materials", label: "Study Materials", icon: <BookOpen size={18} /> },
    { id: "timetable", label: "Timetable", icon: <CalendarDays size={18} /> },
    { id: "library", label: "Library", icon: <Library size={18} /> },
    { id: "fees", label: "Finance", icon: <Wallet size={18} /> },
    { id: "results", label: "Results", icon: <TrendingUp size={18} /> },
    { id: "notifications", label: "Notifications", icon: <BellRing size={18} /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
  ],
  librarian: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "library", label: "Book Catalog", icon: <Library size={18} /> },
    { id: "notices", label: "Notices", icon: <Megaphone size={18} /> },
    { id: "notifications", label: "Notifications", icon: <BellRing size={18} /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
  ],
  finance: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "fees", label: "Fee Management", icon: <Wallet size={18} /> },
    { id: "notices", label: "Notices", icon: <Megaphone size={18} /> },
    { id: "notifications", label: "Notifications", icon: <BellRing size={18} /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
  ],
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  student: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", accent: "#4f46e5" },
  teacher: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", accent: "#059669" },
  admin: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", accent: "#e11d48" },
  librarian: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", accent: "#d97706" },
  finance: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", accent: "#7c3aed" },
};

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [studentProfile, setStudentProfile] = useState<Student | undefined>();
  const [teacherProfile, setTeacherProfile] = useState<Teacher | undefined>();

  // Navigation
  const [currentView, setCurrentView] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Data stores
  const [notices, setNotices] = useState<Notice[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [progress, setProgress] = useState<StudentProgress | undefined>();
  const [allProgress, setAllProgress] = useState<StudentProgress[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [adminStats, setAdminStats] = useState<AdminDashboardStats | undefined>();
  const [librarianStats, setLibrarianStats] = useState<LibrarianDashboardStats | undefined>();
  const [financeStats, setFinanceStats] = useState<FinanceDashboardStats | undefined>();

  // ─── API helpers ─────────────────────────────────────────────────
  const api = useCallback(async (url: string, options?: RequestInit) => {
    const headers: any = { "Content-Type": "application/json", ...options?.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    return res;
  }, [token]);

  const fetchJSON = useCallback(async (url: string) => {
    try {
      const res = await api(url);
      if (res.ok) return (await res.json()).data;
    } catch {}
    return null;
  }, [api]);

  // ─── Session restore ────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("campus_token");
    if (saved) {
      setToken(saved);
      restoreSession(saved);
    }
  }, []);

  const restoreSession = async (t: string) => {
    try {
      const res = await fetch("/api/profile", { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const { data } = await res.json();
        setUser(data.user);
        setStudentProfile(data.studentProfile);
        setTeacherProfile(data.teacherProfile);
      } else {
        handleLogout();
      }
    } catch { handleLogout(); }
  };

  // ─── Data fetching ──────────────────────────────────────────────
  useEffect(() => {
    if (!token || !user) return;
    fetchNotices();
    fetchMaterials();
    fetchTimetable();
    fetchBooks();
    fetchNotifications();
    fetchSubjects();
    fetchAssignments();

    if (user.role === "student") {
      fetchBorrowRecords();
      fetchTransactions();
      fetchResults();
    }
    if (user.role === "teacher" || user.role === "admin") {
      fetchStudents();
      fetchTransactions();
      fetchResults();
      fetchBorrowRecords();
    }
    if (user.role === "admin") fetchAdminStats();
    if (user.role === "librarian") { fetchLibrarianStats(); fetchBorrowRecords(); }
    if (user.role === "finance") { fetchFinanceStats(); fetchTransactions(); }
  }, [token, user?.role]);

  const fetchNotices = async () => { const d = await fetchJSON("/api/notices"); if (d) setNotices(d); };
  const fetchMaterials = async () => { const d = await fetchJSON("/api/study-materials"); if (d) setMaterials(d); };
  const fetchTimetable = async () => { const d = await fetchJSON("/api/timetable"); if (d) setTimetable(d); };
  const fetchBooks = async () => { const d = await fetchJSON("/api/books"); if (d) setBooks(d); };
  const fetchBorrowRecords = async () => { const d = await fetchJSON("/api/book-transactions"); if (d) setBorrowRecords(d); };
  const fetchTransactions = async () => { const d = await fetchJSON("/api/transactions"); if (d) setTransactions(d); };
  const fetchNotifications = async () => { const d = await fetchJSON("/api/notifications"); if (d) setNotifications(d); };
  const fetchSubjects = async () => { const d = await fetchJSON("/api/subjects"); if (d) setSubjects(d); };
  const fetchAssignments = async () => { const d = await fetchJSON("/api/assignments"); if (d) setAssignments(d); };
  const fetchStudents = async () => {
    try {
      const res = await api("/api/students");
      if (res.ok) { const json = await res.json(); setStudents(json.data); }
    } catch {}
  };
  const fetchResults = async () => {
    try {
      const res = await api("/api/results");
      if (res.ok) {
        const { data } = await res.json();
        if (Array.isArray(data.results)) setResults(data.results);
        if (data.progress) {
          if (Array.isArray(data.progress)) { setAllProgress(data.progress); setProgress(undefined); }
          else { setProgress(data.progress); setAllProgress([]); }
        }
      }
    } catch {}
  };
  const fetchAdminStats = async () => { const d = await fetchJSON("/api/dashboard/admin"); if (d) setAdminStats(d); };
  const fetchLibrarianStats = async () => { const d = await fetchJSON("/api/dashboard/librarian"); if (d) setLibrarianStats(d); };
  const fetchFinanceStats = async () => { const d = await fetchJSON("/api/dashboard/finance"); if (d) setFinanceStats(d); };

  // ─── Mutations ──────────────────────────────────────────────────
  const handleAddNotice = async (data: Partial<Notice>) => {
    const res = await api("/api/notices", { method: "POST", body: JSON.stringify(data) });
    if (res.ok) { fetchNotices(); fetchNotifications(); return true; }
    return false;
  };
  const handleDeleteNotice = async (id: string) => {
    const res = await api(`/api/notices/${id}`, { method: "DELETE" });
    if (res.ok) { fetchNotices(); return true; }
    return false;
  };
  const handleAddMaterial = async (formData: FormData) => {
    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/study-materials", { method: "POST", headers, body: formData });
    if (res.ok) { fetchMaterials(); fetchNotifications(); return true; }
    return false;
  };
  const handleAddSlot = async (data: Partial<Timetable>) => {
    const res = await api("/api/timetable", { method: "POST", body: JSON.stringify(data) });
    if (res.ok) { fetchTimetable(); return true; }
    return false;
  };
  const handleBorrowBook = async (bookId: string, studentId: string) => {
    const res = await api("/api/books/issue", { method: "POST", body: JSON.stringify({ bookId, studentId }) });
    if (res.ok) { fetchBooks(); fetchBorrowRecords(); fetchNotifications(); return true; }
    const err = await res.json();
    alert(err.message || "Failed to issue book");
    return false;
  };
  const handleReturnBook = async (recordId: string) => {
    const res = await api("/api/books/return", { method: "POST", body: JSON.stringify({ recordId }) });
    if (res.ok) { fetchBooks(); fetchBorrowRecords(); return true; }
    return false;
  };
  const handleAddBook = async (data: Partial<Book>) => {
    const res = await api("/api/books", { method: "POST", body: JSON.stringify(data) });
    if (res.ok) { fetchBooks(); return true; }
    return false;
  };
  const handlePayFee = async (txnId: string) => {
    const res = await api("/api/payments", { method: "POST", body: JSON.stringify({ transactionId: txnId }) });
    if (res.ok) { fetchTransactions(); fetchNotifications(); return true; }
    return false;
  };
  const handleAddResult = async (data: Partial<Result>) => {
    const res = await api("/api/results", { method: "POST", body: JSON.stringify(data) });
    if (res.ok) { fetchResults(); fetchNotifications(); return true; }
    return false;
  };
  const handleAddAssignment = async (data: Partial<Assignment>) => {
    const res = await api("/api/assignments", { method: "POST", body: JSON.stringify(data) });
    if (res.ok) { fetchAssignments(); fetchNotifications(); return true; }
    return false;
  };
  const handleMarkAttendance = async (records: Partial<Attendance>[]) => {
    const res = await api("/api/attendance", { method: "POST", body: JSON.stringify({ records }) });
    if (res.ok) return true;
    return false;
  };
  const handleReadNotification = async (id?: string) => {
    await api("/api/notifications/read", { method: "POST", body: JSON.stringify({ id }) });
    fetchNotifications();
  };
  const handleUpdateProfile = async (data: any) => {
    const res = await api("/api/profile", { method: "PUT", body: JSON.stringify(data) });
    if (res.ok) {
      const { data: d } = await res.json();
      setUser(d.user);
      if (d.studentProfile) setStudentProfile(d.studentProfile);
      if (d.teacherProfile) setTeacherProfile(d.teacherProfile);
      return true;
    }
    return false;
  };

  // ─── Auth ───────────────────────────────────────────────────────
  const handleLogin = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        localStorage.setItem("campus_token", json.data.token);
        setToken(json.data.token);
        setUser(json.data.user);
        setStudentProfile(json.data.studentProfile);
        setTeacherProfile(json.data.teacherProfile);
        setCurrentView("dashboard");
        return null;
      }
      return json.message || "Login failed";
    } catch { return "Server connection failed"; }
  };

  const handleRegister = async (data: any): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        localStorage.setItem("campus_token", json.data.token);
        setToken(json.data.token);
        setUser(json.data.user);
        setStudentProfile(json.data.studentProfile);
        setCurrentView("dashboard");
        return null;
      }
      return json.message || "Registration failed";
    } catch { return "Server connection failed"; }
  };

  const handleLogout = () => {
    localStorage.removeItem("campus_token");
    setToken(""); setUser(null); setStudentProfile(undefined); setTeacherProfile(undefined);
    setCurrentView("dashboard"); setMobileMenuOpen(false);
  };

  // ─── Close dropdowns on nav ─────────────────────────────────────
  useEffect(() => { setShowNotifDropdown(false); setMobileMenuOpen(false); }, [currentView]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ─── Login Screen ──────────────────────────────────────────────
  if (!user) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // ─── Role-based nav items ──────────────────────────────────────
  const navItems = NAV_ITEMS[user.role] || NAV_ITEMS.student;
  const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.student;

  // ─── Render current view ───────────────────────────────────────
  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        if (user.role === "student") return <StudentDashboard user={user} profile={studentProfile} notices={notices} timetable={timetable} borrowRecords={borrowRecords} transactions={transactions} progress={progress} notifications={notifications} assignments={assignments} onNavigate={setCurrentView} />;
        if (user.role === "teacher") return <TeacherDashboard user={user} profile={teacherProfile} subjects={subjects} students={students} timetable={timetable} assignments={assignments} materials={materials} notices={notices} onNavigate={setCurrentView} />;
        if (user.role === "admin") return <AdminDashboard stats={adminStats} notices={notices} onNavigate={setCurrentView} />;
        if (user.role === "librarian") return <LibrarianDashboard stats={librarianStats} onNavigate={setCurrentView} />;
        if (user.role === "finance") return <FinanceDashboard stats={financeStats} onNavigate={setCurrentView} />;
        return null;
      case "profile":
        return <ProfilePage user={user} studentProfile={studentProfile} teacherProfile={teacherProfile} onUpdateProfile={handleUpdateProfile} />;
      case "notices":
        return <NoticeBoardPage user={user} notices={notices} onAddNotice={handleAddNotice} onDeleteNotice={handleDeleteNotice} />;
      case "materials":
        return <StudyMaterialsPage user={user} materials={materials} subjects={subjects} onAddMaterial={handleAddMaterial} />;
      case "timetable":
        return <TimetablePage user={user} timetable={timetable} onAddSlot={handleAddSlot} />;
      case "library":
        return <LibraryPage user={user} books={books} borrowRecords={borrowRecords} onBorrowBook={handleBorrowBook} onReturnBook={handleReturnBook} onAddBook={handleAddBook} />;
      case "fees":
        return <FeesPage user={user} transactions={transactions} onPayFee={handlePayFee} />;
      case "results":
        return <ResultsPage user={user} results={results} progress={progress} allProgress={allProgress} students={students} subjects={subjects} onAddResult={handleAddResult} />;
      case "assignments":
        return <AssignmentsPage user={user} assignments={assignments} subjects={subjects} onAddAssignment={handleAddAssignment} />;
      case "attendance":
        return <AttendancePage user={user} students={students} subjects={subjects} onMarkAttendance={handleMarkAttendance} />;
      case "notifications":
        return <NotificationsPage notifications={notifications} onRead={handleReadNotification} />;
      case "settings":
        return <SettingsPage user={user} />;
      case "users":
        return <AdminDashboard stats={adminStats} notices={notices} onNavigate={setCurrentView} showUsers />;
      default:
        return <div className="text-center py-20 text-slate-400 font-mono text-sm">Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col md:flex-row">
      {/* ─── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="w-64 bg-slate-900 text-slate-100 hidden md:flex flex-col shrink-0 fixed inset-y-0 left-0 z-30">
        <div className="p-5 flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center gap-2.5 pb-5 mb-2 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight font-display text-white">CAMPUS HUB</h2>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider">MANAGEMENT PORTAL</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 overflow-y-auto py-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-200 group ${
                  currentView === item.id
                    ? "bg-white/10 text-white font-semibold nav-active"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={currentView === item.id ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[9px] font-bold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Footer */}
          <div className="pt-4 mt-2 border-t border-slate-800">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer" onClick={() => setCurrentView("profile")}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-white font-bold text-xs flex items-center justify-center font-display uppercase shadow-inner">
                {user.fullName.split(" ").map(n => n[0]).join("").substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user.fullName}</div>
                <div className="text-[10px] text-slate-500 font-mono capitalize">{user.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs font-medium cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Header ───────────────────────────────────────── */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <GraduationCap className="text-white" size={16} />
          </div>
          <h2 className="font-bold text-sm font-display">CAMPUS HUB</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setCurrentView("notifications"); if (unreadCount > 0) handleReadNotification(); }} className="relative p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center font-mono animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-400 hover:text-white rounded-lg">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-slate-900/95 backdrop-blur-sm z-30 animate-fadeIn">
          <div className="p-4 space-y-1 max-h-[calc(100vh-57px)] overflow-y-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setCurrentView(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition ${
                  currentView === item.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
                <ChevronRight size={14} className="ml-auto text-slate-600" />
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-rose-400 hover:text-rose-300 text-sm font-medium mt-4">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Top Bar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 hidden md:flex items-center justify-between px-6 py-3 sticky top-0 z-20 transition-colors">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-slate-300 dark:text-slate-600">●</span>
            <span className="capitalize dark:text-slate-300">{user.role}</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-600 dark:text-slate-200 font-semibold capitalize">{currentView === "dashboard" ? "Overview" : currentView.replace(/([A-Z])/g, " $1")}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifDropdown(!showNotifDropdown); if (!showNotifDropdown && unreadCount > 0) handleReadNotification(); }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${unreadCount > 0 ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20" : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center font-mono border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeInScale">
                  <div className="p-3 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
                    <span className="text-xs font-semibold font-display">Notifications</span>
                    <button onClick={() => setShowNotifDropdown(false)} className="text-[10px] text-slate-400 hover:text-white font-mono">CLOSE</button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs font-mono">No notifications</div>
                    ) : (
                      notifications.slice(0, 8).map(n => (
                        <div key={n._id} className={`p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition ${!n.isRead ? "bg-indigo-50/30 dark:bg-indigo-500/10" : ""}`}>
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                            {!n.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1 shrink-0" />}
                          </div>
                          <p className="text-[9px] text-slate-400 font-mono mt-1">
                            {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => { setCurrentView("notifications"); setShowNotifDropdown(false); }}
                      className="w-full py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 text-center border-t dark:border-slate-800 transition"
                    >
                      View All Notifications →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Role Badge + Avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold font-mono uppercase tracking-wider ${roleColor.bg} ${roleColor.text} border ${roleColor.border} dark:opacity-80`}>
                {user.role}
              </span>
              <button onClick={() => setCurrentView("profile")} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white font-bold text-[11px] flex items-center justify-center font-display uppercase cursor-pointer hover:ring-2 hover:ring-indigo-300 transition">
                {user.fullName.split(" ").map(n => n[0]).join("").substring(0, 2)}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
}
