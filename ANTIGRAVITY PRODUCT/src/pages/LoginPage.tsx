import React, { useState } from "react";
import { GraduationCap, Mail, Lock, User, Hash, Phone, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  onLogin: (email: string, password: string) => Promise<string | null>;
  onRegister: (data: any) => Promise<string | null>;
}

const DEMO_ACCOUNTS = [
  { label: "Student", subtitle: "Omkar Prajapati", email: "student@campushub.com", color: "from-indigo-500 to-blue-600", hoverBg: "hover:bg-indigo-50", textColor: "text-indigo-700" },
  { label: "Teacher", subtitle: "Prof. Robert", email: "teacher@campushub.com", color: "from-emerald-500 to-teal-600", hoverBg: "hover:bg-emerald-50", textColor: "text-emerald-700" },
  { label: "Admin", subtitle: "Dr. Alice Vance", email: "admin@campushub.com", color: "from-rose-500 to-pink-600", hoverBg: "hover:bg-rose-50", textColor: "text-rose-700" },
  { label: "Librarian", subtitle: "Sarah Connor", email: "librarian@campushub.com", color: "from-amber-500 to-orange-600", hoverBg: "hover:bg-amber-50", textColor: "text-amber-700" },
  { label: "Finance", subtitle: "Michael Scott", email: "finance@campushub.com", color: "from-violet-500 to-purple-600", hoverBg: "hover:bg-violet-50", textColor: "text-violet-700" },
];

export default function LoginPage({ onLogin, onRegister }: Props) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let errMsg: string | null;
    if (isRegistering) {
      errMsg = await onRegister({ fullName: name, email, password, rollNumber, phone, semester: 6, batch: "2023-2027" });
    } else {
      errMsg = await onLogin(email, password);
    }

    setLoading(false);
    if (errMsg) setError(errMsg);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setError("");
    const errMsg = await onLogin(demoEmail, "Admin@123");
    setLoading(false);
    if (errMsg) setError(errMsg);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/80 to-violet-100/60 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-100/60 to-teal-100/40 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-br from-amber-100/30 to-rose-100/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
            <Sparkles size={12} className="text-indigo-500" />
            <span className="text-[11px] font-semibold text-indigo-600 font-mono tracking-wider uppercase">Campus Management System</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 animate-float">
              <GraduationCap className="text-white" size={26} />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            CAMPUS <span className="gradient-text">HUB</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto">
            Your centralized college management portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 dark:border-slate-700/80 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display text-center mb-6">
              {isRegistering ? "Create Student Account" : "Sign In to Your Account"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={name} onChange={e => setName(e.target.value)} required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:bg-slate-900 focus:border-indigo-400 transition" placeholder="Enter your full name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Roll Number</label>
                      <div className="relative">
                        <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)} required
                          className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:bg-slate-900 focus:border-indigo-400 transition" placeholder="SV-2026-XXX" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:bg-slate-900 focus:border-indigo-400 transition" placeholder="+91 XXXXX" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:bg-slate-900 focus:border-indigo-400 transition" placeholder="your@email.com" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:bg-white dark:bg-slate-900 focus:border-indigo-400 transition" placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isRegistering ? "Create Account" : "Sign In"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <button onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer">
                {isRegistering ? "Already have an account? Sign In" : "New student? Create Account"}
              </button>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-5 sm:p-6">
            <div className="text-center mb-3">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">Quick Demo Access</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {DEMO_ACCOUNTS.map(demo => (
                <button key={demo.email} onClick={() => handleDemoLogin(demo.email)} disabled={loading}
                  className={`group relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${demo.hoverBg} transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5`}>
                  <div className={`w-7 h-7 mx-auto rounded-lg bg-gradient-to-br ${demo.color} flex items-center justify-center text-white text-[10px] font-bold font-display mb-1.5 shadow-sm`}>
                    {demo.label[0]}
                  </div>
                  <p className={`text-[9px] font-bold ${demo.textColor} text-center truncate`}>{demo.label}</p>
                  <p className="text-[8px] text-slate-400 text-center truncate">{demo.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-6 font-mono">
          Campus Hub v1.0 — College Management System
        </p>
      </div>
    </div>
  );
}
