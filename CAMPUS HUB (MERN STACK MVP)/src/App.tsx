import React, { useState, useEffect } from "react";
import {
  User,
  StudentProfile,
  Notice,
  ClassroomNote,
  TimeTableSlot,
  LibraryBook,
  BorrowRecord,
  ExamFee,
  ExamResult,
  StudentProgress,
  Notification
} from "./types";
import DashboardView from "./components/DashboardView";
import NoticeBoardView from "./components/NoticeBoardView";
import ClassroomNotesView from "./components/ClassroomNotesView";
import TimetableView from "./components/TimetableView";
import LibraryView from "./components/LibraryView";
import ExamFeeView from "./components/ExamFeeView";
import ResultsView from "./components/ResultsView";
import DirectoryView from "./components/DirectoryView";
import SettingsView from "./components/SettingsView";
import {
  GraduationCap,
  Bell,
  LayoutDashboard,
  Megaphone,
  BookOpen,
  CalendarDays,
  FolderLock,
  Wallet,
  TrendingUp,
  Contact2,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  Lock,
  Mail,
  UserCheck,
  Menu,
  X,
  Plus,
  Compass,
  AlertCircle
} from "lucide-react";

export default function App() {
  // Session authentication states
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | undefined>(undefined);
  const [token, setToken] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Auth form inputs
  const [emailInput, setEmailInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [regName, setRegName] = useState("");
  const [regRoll, setRegRoll] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Navigation state
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, notices, notes, schedule, library, billing, academic, directory, settings
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Shared Data collections
  const [notices, setNotices] = useState<Notice[]>([]);
  const [notes, setNotes] = useState<ClassroomNote[]>([]);
  const [timetable, setTimetable] = useState<TimeTableSlot[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [borrowHistory, setBorrowHistory] = useState<BorrowRecord[]>([]);
  const [fees, setFees] = useState<ExamFee[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [progress, setProgress] = useState<StudentProgress | undefined>(undefined);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [studentsList, setStudentsList] = useState<StudentProfile[]>([]);

  // Notification dropdown alarm bell state
  const [showNotificationList, setShowNotificationList] = useState(false);

  // Load token and session state on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("campus_token");
    if (savedToken) {
      setToken(savedToken);
      fetchSession(savedToken);
    }
  }, []);

  // Sync data streams once logged in
  useEffect(() => {
    if (token) {
      fetchNotices();
      fetchNotes();
      fetchTimetable();
      fetchBooks();
      fetchFees();
      fetchResultsAndProgress();
      fetchNotifications();

      // Retrieve full students list if roles permit administrating
      if (user && (user.role === "admin" || user.role === "teacher")) {
        fetchStudentsList();
      }
    }
  }, [token, user?.role, currentView]);

  // Handle auto-clearing alerts on tab switches
  useEffect(() => {
    setShowNotificationList(false);
  }, [currentView]);

  // -------------------------------------------------------------
  // API FETCH METRIC OPERATIONS
  // -------------------------------------------------------------
  const fetchSession = async (userToken: string) => {
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setStudentProfile(data.studentProfile);
      } else {
        handleLogout();
      }
    } catch (e) {
      handleLogout();
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices");
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (e) {}
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {}
  };

  const fetchTimetable = async () => {
    try {
      const res = await fetch("/api/timetable");
      if (res.ok) {
        const data = await res.json();
        setTimetable(data);
      }
    } catch (e) {}
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/library/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (e) {}
  };

  const fetchFees = async () => {
    try {
      const res = await fetch("/api/fees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFees(data);
      }
    } catch (e) {}
  };

  const fetchResultsAndProgress = async () => {
    try {
      const res = await fetch("/api/results", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // If student, returns { results, progress }
        if (data.results && data.progress !== undefined) {
          setResults(data.results);
          setProgress(data.progress);
        } else {
          // If staff, might return lists
          setResults(data.results || []);
        }
      }
    } catch (e) {}

    // Fetch borrow records
    try {
      const res = await fetch("/api/library/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBorrowHistory(data);
      }
    } catch (e) {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {}
  };

  const fetchStudentsList = async () => {
    try {
      const res = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudentsList(data);
      }
    } catch (e) {}
  };

  // -------------------------------------------------------------
  // INTERACTIVE ACTION MUTATIONS
  // -------------------------------------------------------------
  const handleAddNotice = async (noticeData: Partial<Notice>): Promise<boolean> => {
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(noticeData)
      });
      if (res.ok) {
        fetchNotices();
        fetchNotifications();
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleDeleteNotice = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotices();
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleAddNote = async (noteData: Partial<ClassroomNote>): Promise<boolean> => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(noteData)
      });
      if (res.ok) {
        fetchNotes();
        fetchNotifications();
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleIncrementViews = async (id: string) => {
    try {
      await fetch(`/api/notes/${id}/view`, { method: "POST" });
      fetchNotes();
    } catch (e) {}
  };

  const handleAddSlot = async (slotData: Partial<TimeTableSlot>): Promise<boolean> => {
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(slotData)
      });
      if (res.ok) {
        fetchTimetable();
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleBorrowBook = async (bookId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/library/borrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bookId })
      });
      if (res.ok) {
        fetchBooks();
        fetchResultsAndProgress();
        fetchNotifications();
        return true;
      } else {
        const err = await res.json();
        alert(err.error || "Fail to issue book");
      }
    } catch (e) {}
    return false;
  };

  const handleReturnBook = async (recordId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/library/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recordId })
      });
      if (res.ok) {
        fetchBooks();
        fetchResultsAndProgress();
        fetchNotifications();
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleAddBook = async (bookData: Partial<LibraryBook>): Promise<boolean> => {
    try {
      const res = await fetch("/api/library/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });
      if (res.ok) {
        fetchBooks();
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handlePayFee = async (feeId: string, cardDetails: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/fees/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ feeId, ...cardDetails })
      });
      if (res.ok) {
        fetchFees();
        fetchNotifications();
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleAddResult = async (resultData: Partial<ExamResult>): Promise<boolean> => {
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(resultData)
      });
      if (res.ok) {
        fetchResultsAndProgress();
        fetchNotifications();
        return true;
      }
    } catch (e) {}
    return false;
  };

  const handleReadNotification = async (id?: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      fetchNotifications();
    } catch (e) {}
  };

  // -------------------------------------------------------------
  // AUTH ROUTINES
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passInput) {
      setErrorMsg("Please type in both validation lines.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passInput })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem("campus_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setStudentProfile(data.studentProfile);
        setCurrentView("dashboard");
      } else {
        setErrorMsg(data.error || "Credentials verification failed.");
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg("Fail connecting academic server port.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !emailInput || !passInput || !regRoll) {
      setErrorMsg("Please complete all requested verification inputs.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: emailInput,
          password: passInput,
          rollNo: regRoll,
          semester: 6,
          batch: "2023-2027",
          phone: regPhone
        })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem("campus_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setStudentProfile(data.studentProfile);
        setCurrentView("dashboard");
        setIsRegistering(false);
      } else {
        setErrorMsg(data.error || "Could not complete student registry.");
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg("Server registry error of port 3000 mapping.");
    }
  };

  const handleTriggerDemoLogin = async (email: string, pass: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem("campus_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setStudentProfile(data.studentProfile);
        setCurrentView("dashboard");
      } else {
        setErrorMsg(data.error || "Demo failure.");
      }
    } catch (e) {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("campus_token");
    setToken("");
    setUser(null);
    setStudentProfile(undefined);
    setIsRegistering(false);
    setEmailInput("");
    setPassInput("");
    setRegName("");
    setRegRoll("");
    setRegPhone("");
    setErrorMsg("");
  };

  // -------------------------------------------------------------
  // VIEW SWITCH RENDERING PARSING
  // -------------------------------------------------------------
  const renderStageView = () => {
    if (!user) return null;

    switch (currentView) {
      case "dashboard":
        return (
          <DashboardView
            user={user}
            profile={studentProfile}
            notices={notices}
            timetable={timetable}
            history={borrowHistory}
            fees={fees}
            notifications={notifications}
            onNavigate={(v) => setCurrentView(v)}
            onReadNotification={handleReadNotification}
          />
        );
      case "notices":
        return (
          <NoticeBoardView
            user={user}
            notices={notices}
            onAddNotice={handleAddNotice}
            onDeleteNotice={handleDeleteNotice}
          />
        );
      case "notes":
        return (
          <ClassroomNotesView
            user={user}
            notes={notes}
            onAddNote={handleAddNote}
            onIncrementViews={handleIncrementViews}
          />
        );
      case "schedule":
        return <TimetableView user={user} timetable={timetable} onAddSlot={handleAddSlot} />;
      case "library":
        return (
          <LibraryView
            user={user}
            books={books}
            history={borrowHistory}
            onBorrowBook={handleBorrowBook}
            onReturnBook={handleReturnBook}
            onAddBook={handleAddBook}
          />
        );
      case "billing":
        return <ExamFeeView user={user} fees={fees} onPayFee={handlePayFee} />;
      case "academic":
        return (
          <ResultsView
            user={user}
            students={studentsList}
            results={results}
            progress={progress}
            onAddResult={handleAddResult}
          />
        );
      case "directory":
        return <DirectoryView />;
      case "settings":
        return <SettingsView user={user} profile={studentProfile} />;
      default:
        return (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            Unknown structural portal coordinate.
          </div>
        );
    }
  };

  // Unread alerts count
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) {
    // -------------------------------------------------------------
    // RENDER LOGIN SCREEN (WITH DEMO BOXES INSIDE CARD)
    // -------------------------------------------------------------
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Abstract background blur shapes */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none -translate-y-10 translate-x-10"></div>
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-60 pointer-events-none translate-y-10 -translate-x-10"></div>

        <div className="max-w-md w-full space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 font-mono uppercase tracking-wider">
              Centralized Credentials Gate
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center justify-center gap-2">
              <GraduationCap className="text-indigo-600 animate-bounce" size={32} /> CAMPUS HUB
            </h1>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Central learning & administration synchronization console.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            <h2 className="text-sm font-bold text-slate-900 tracking-wider font-mono uppercase border-b pb-2 text-center">
              {isRegistering ? "Student Portal Registration" : "Account Identity Verification"}
            </h2>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-mono font-medium flex items-center gap-1.5">
                <AlertCircle className="shrink-0" size={14} /> {errorMsg}
              </div>
            )}

            <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                      Full Student Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-255 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Omkar Prajapati"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-255 rounded-lg text-xs focus:outline-none focus:border-indigo-500 font-mono"
                        placeholder="SV-2026-089"
                        value={regRoll}
                        onChange={(e) => setRegRoll(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                        Phone contact
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-slate-255 rounded-lg text-xs focus:outline-none focus:border-indigo-500 font-mono"
                        placeholder="+91 98765 43210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Active Email Address *
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    className="w-full pl-9 pr-3 py-2 border border-slate-255 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="student@campushub.edu"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                  Identity Secret Password *
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    className="w-full pl-9 pr-3 py-2 border border-slate-255 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="••••••••"
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shrink-0 transition disabled:opacity-50"
              >
                {loading ? "Verifying Token..." : isRegistering ? "Initiate Student Account" : "Access Campus Portal"}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg("");
                }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
              >
                {isRegistering ? "Already have validated profile? Login here." : "New Student registrar? Enroll passport."}
              </button>
            </div>

            {/* DEMO ACCOUNTS LAUNCHER BAR */}
            <div className="border-t pt-4 space-y-2.5">
              <div className="text-center text-[10px] font-extrabold font-mono uppercase tracking-wider text-slate-400">
                ⚡ DEMO INSTANT ROLE LAUNCHERS
              </div>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => handleTriggerDemoLogin("omkar.prajapati@somaiya.edu", "student123")}
                  className="p-1 px-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded text-indigo-700 border border-indigo-100 font-bold transition text-center truncate"
                  title="Test customized student experience"
                >
                  Omkar (Student)
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerDemoLogin("teacher@campushub.edu", "teacher123")}
                  className="p-1 px-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded text-emerald-700 border border-emerald-100 font-bold transition text-center truncate"
                >
                  Robert (Teacher)
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerDemoLogin("admin@campushub.edu", "admin123")}
                  className="p-1 px-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white rounded text-amber-700 border border-amber-100 font-bold transition text-center truncate"
                >
                  Vance (Admin)
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerDemoLogin("librarian@campushub.edu", "librarian123")}
                  className="p-1 px-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded text-rose-700 border border-rose-100 font-bold transition text-center truncate"
                >
                  Connor (Library)
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerDemoLogin("finance@campushub.edu", "finance123")}
                  className="p-1 px-1.5 bg-stone-50 hover:bg-stone-600 hover:text-white rounded text-stone-700 border border-stone-100 font-bold transition text-center truncate"
                >
                  Scott (Finance)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER MAIN APPLICATION DASHBOARD
  // -------------------------------------------------------------
  const roleColors: Record<string, string> = {
    student: "bg-indigo-100 text-indigo-800 border-indigo-200",
    teacher: "bg-emerald-100 text-emerald-800 border-emerald-200",
    admin: "bg-rose-100 text-rose-800 border-rose-200",
    librarian: "bg-amber-100 text-amber-800 border-amber-200",
    finance: "bg-stone-100 text-stone-800 border-stone-200"
  };

  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "notices", label: "Notice Board", icon: <Megaphone size={18} /> },
    { id: "notes", label: "Classroom Notes", icon: <BookOpen size={18} /> },
    { id: "schedule", label: "Lecture Schedule", icon: <CalendarDays size={18} /> },
    { id: "library", label: "Library Portal", icon: <FolderLock size={18} /> },
    { id: "billing", label: "Exam Fee Portal", icon: <Wallet size={18} /> },
    { id: "academic", label: "Grades & CGPA", icon: <TrendingUp size={18} /> },
    { id: "directory", label: "Faculty Directory", icon: <Contact2 size={18} /> },
    { id: "settings", label: "Settings & FAQs", icon: <SettingsIcon size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      {/* Dynamic desktop Sidebar left */}
      <aside className="w-64 bg-slate-900 text-slate-100 border-r border-slate-800 hidden md:flex flex-col shrink-0 justify-between">
        <div className="p-5 flex flex-col space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <GraduationCap className="text-indigo-400 shrink-0" size={26} />
            <div>
              <h2 className="font-bold tracking-tight text-md font-display uppercase text-white">CAMPUS HUB</h2>
              <span className="text-[10px] text-slate-400 font-mono">B.TECH SYSTEM</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentView(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide cursor-pointer transition ${
                  currentView === tab.id
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer logout button */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-2.5">
          <div className="truncate min-w-0">
            <div className="text-xs font-bold truncate text-white leading-tight">{user.name}</div>
            <div className="text-[9px] text-slate-400 font-mono capitalize tracking-wide mt-0.5">{user.role} console</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-white rounded-lg transition"
            title="Log out securely"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile top-bar layout header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-indigo-400" size={24} />
          <h2 className="font-bold text-sm tracking-tight font-display">CAMPUS HUB</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Bell counter */}
          <button
            onClick={() => setShowNotificationList(!showNotificationList)}
            className="relative p-1 text-slate-400 hover:text-white"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile expandable dropdown links drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[57px] inset-x-0 bg-slate-900 border-b border-slate-800 z-40 p-4 shadow-xl flex flex-col space-y-2 animate-fadeIn">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentView(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold uppercase text-left transition ${
                currentView === tab.id
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-2.5 text-rose-400 hover:text-white font-semibold text-xs uppercase"
          >
            <LogOut size={18} />
            <span>Terminate Session logout</span>
          </button>
        </div>
      )}

      {/* Stage Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Core stage Top bar */}
        <header className="bg-white border-b border-slate-200 hidden md:flex items-center justify-between p-4 px-6 select-none shadow-xs z-15 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-widest font-mono">
              authenticated portal stage / {currentView}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Alarm Bell alerts wrapper */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationList(!showNotificationList);
                  if (!showNotificationList && unreadCount > 0) {
                    handleReadNotification();
                  }
                }}
                className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 transition-colors relative ${
                  unreadCount > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-50"
                }`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center font-mono border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Expandable Notification Alarm bell drawer items list */}
              {showNotificationList && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-55 overflow-hidden animate-fadeIn">
                  <div className="p-3 bg-slate-900 text-white flex items-center justify-between font-mono text-[10px] uppercase font-bold">
                    <span>Direct Alerts Inbox</span>
                    <button onClick={() => setShowNotificationList(false)} className="hover:text-slate-300">
                      close
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 font-mono text-[11px]">
                        No notifications in inbox.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-3 text-xs space-y-1 hover:bg-slate-50/50 transition-colors ${
                            !notif.read ? "bg-indigo-50/20" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-slate-800 leading-tight">{notif.title}</span>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-slate-500 text-[11px] leading-relaxed select-text">
                            {notif.message}
                          </p>
                          <div className="text-[9px] text-slate-400 font-mono">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => handleReadNotification()}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 border-t text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider text-center"
                    >
                      Clear/Dismiss read alerts
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile pill indicator */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold border uppercase leading-none ${roleColors[user.role] || "bg-slate-100 text-slate-800"}`}>
                {user.role} console
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-display uppercase">
                {user.name.split(" ").slice(-1)[0][0] || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Content staging container scrollable layout */}
        <div className="p-5 sm:p-6 lg:p-8 overflow-y-auto flex-1 max-w-7xl w-full mx-auto">
          {renderStageView()}
        </div>
      </main>
    </div>
  );
}
