import React, { useState } from "react";
import { User, StudentProfile } from "../types";
import {
  Settings,
  Bell,
  Download,
  FileCheck,
  HelpCircle,
  Clock,
  User as UserIcon,
  Check,
  ShieldAlert,
  GraduationCap
} from "lucide-react";

interface SettingsViewProps {
  user: User;
  profile?: StudentProfile;
}

export default function SettingsView({ user, profile }: SettingsViewProps) {
  // Config state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [gradesAlerts, setGradesAlerts] = useState(true);
  const [libraryAlerts, setLibraryAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  // FAQ Expand state
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownloadFakeDoc = (docName: string) => {
    alert(`Generating certified digital copy of: ${docName}. Downloading file...`);
  };

  const FAQS = [
    {
      q: "When is the deadline to pay Semester Exam Registration Fees?",
      a: "All online exam fee registration charges should be paid before June 14, 2026. If missed, late fee fines will automatically be levied."
    },
    {
      q: "How can I request physical textbook extensions at the library portal?",
      a: "Go into the library portal 'History' tab view. Any currently active borrowed list has a direct return or renew action button to clear and update lists."
    },
    {
      q: "Where do I retrieve verified marksheet documents?",
      a: "Certified academic sheets or graduation certificates can be queried and printed directly from the 'Document Repository' tab located on this page."
    },
    {
      q: "Who should I report database grade mismatches to?",
      a: "Please directory lookup our Dean of Academic Affairs (Dr. Alice Vance) or Department Sr. Professor (Prof. Robert Downey) via our 'Faculty Hub' division listing."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          Portal Controls, Downloads & FAQ
        </h1>
        <p className="text-sm text-slate-500">
          Manage system notification preferences, fetch certified degree logs, and access support questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Document Repository & Preferences */}
        <div className="lg:col-span-7 space-y-6">
          {/* Certificate downloads */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <FileCheck size={16} className="text-indigo-600" /> Digital Credentials & Verification Documents
            </h2>
            <p className="text-xs text-slate-500">
              Download certified, university cryptographically signed PDF documents instantly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-lg flex flex-col justify-between items-start gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Admission Credentials Certificate</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Verification copy of enrollment</p>
                </div>
                <button
                  onClick={() => handleDownloadFakeDoc("Admission_Credentials.pdf")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-semibold hover:bg-indigo-600 transition"
                >
                  <Download size={11} /> Download PDF
                </button>
              </div>

              <div className="border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-lg flex flex-col justify-between items-start gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Semester 5 Certified Transcript</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Grades certification for previous term</p>
                </div>
                <button
                  onClick={() => handleDownloadFakeDoc("Semester_5_Certified_Marksheet.pdf")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-semibold hover:bg-indigo-600 transition"
                >
                  <Download size={11} /> Download PDF
                </button>
              </div>

              <div className="border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-lg flex flex-col justify-between items-start gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">No-Due Clearance sheet</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Library & accounts clearing receipt</p>
                </div>
                <button
                  onClick={() => handleDownloadFakeDoc("No_Dues_Library_and_Accounts.pdf")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-semibold hover:bg-indigo-600 transition"
                >
                  <Download size={11} /> Download PDF
                </button>
              </div>

              <div className="border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-lg flex flex-col justify-between items-start gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Verified Campus ID card copy</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Scanned student verification index</p>
                </div>
                <button
                  onClick={() => handleDownloadFakeDoc("Verified_Student_ID.pdf")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-semibold hover:bg-indigo-600 transition"
                >
                  <Download size={11} /> Download PDF
                </button>
              </div>
            </div>
          </div>

          {/* Settings preferences */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Bell size={16} className="text-indigo-600" /> Automated Warning & Broadcast Settings
            </h2>

            <div className="space-y-3.5 pt-1.5">
              {saved && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded font-mono font-bold flex items-center gap-1">
                  <Check size={12} /> Preference overrides recorded successfully.
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="mt-0.5 accent-indigo-650"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition">Email Billing Invoices</span>
                  <p className="text-[11px] text-slate-400">Receive copy of invoice receipts and exam late fines on registered mail.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={gradesAlerts}
                  onChange={(e) => setGradesAlerts(e.target.checked)}
                  className="mt-0.5 accent-indigo-650"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition">Grade Publish Updates</span>
                  <p className="text-[11px] text-slate-400">Receive real-time dashboard notifications on marks updates.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={libraryAlerts}
                  onChange={(e) => setLibraryAlerts(e.target.checked)}
                  className="mt-0.5 accent-indigo-650"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition">Book Issue Reminders</span>
                  <p className="text-[11px] text-slate-400">Receive warnings 3 days prior to book return deadlines.</p>
                </div>
              </label>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded font-semibold text-xs transition"
              >
                Apply Preference Changes
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Campus FAQ */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <HelpCircle size={16} className="text-indigo-600" /> Portal Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Browse queries regarding portal integrations.
            </p>

            <div className="space-y-3 pt-2">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-slate-100 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                    className="w-full text-left p-3 .5 bg-slate-50/50 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition flex items-center justify-between"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[11px] text-indigo-600">{expandedFAQ === idx ? "−" : "+"}</span>
                  </button>
                  {expandedFAQ === idx && (
                    <div className="p-3.5 bg-white text-xs text-slate-500 border-t border-slate-100 leading-relaxed font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
