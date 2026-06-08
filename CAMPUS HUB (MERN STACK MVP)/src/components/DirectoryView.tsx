import React, { useState } from "react";
import { Search, Phone, Mail, Building, Tag, ShieldAlert } from "lucide-react";

interface FacultyItem {
  _id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  image?: string;
}

const FACULTY_LIST: FacultyItem[] = [
  { _id: "f-1", name: "Dr. Alice Vance", role: "Registrar / Administrator", department: "Dean of Academic Affairs", email: "alice.vance@somaiya.edu", phone: "+91 98989 11211" },
  { _id: "f-2", name: "Prof. Robert Downey", role: "Sr. Professor & Head", department: "Computer Science & IT Office", email: "robert.downey@somaiya.edu", phone: "+91 98989 22322" },
  { _id: "f-3", name: "Sarah Connor", role: "Chief Librarian & Archivist", department: "Library Resources Center", email: "library@somaiya.edu", phone: "+91 98989 33433" },
  { _id: "f-4", name: "Michael Scott", role: "Accounts Lead Officer", department: "Finance & Accounts Office", email: "michael.scott@somaiya.edu", phone: "+91 98989 44544" },
  { _id: "f-5", name: "Prof. Tony Stark", role: "Associate Professor", department: "Electronics & Robot Lab", email: "stark.tony@somaiya.edu", phone: "+91 98989 55656" },
  { _id: "f-6", name: "Dr. Bruce Banner", role: "Head of Chemistry Research", department: "Material Science Office", email: "banner.bruce@somaiya.edu", phone: "+91 98989 66767" }
];

export default function DirectoryView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const filteredFaculty = FACULTY_LIST.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fac.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "all" || fac.department.includes(deptFilter);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          Campus Faculty & Staff Directory
        </h1>
        <p className="text-sm text-slate-500">
          Find contacts for deans, department heads, system administration offices, and accounts divisions quickly.
        </p>
      </div>

      {/* Filter and searching */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts by staff name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Building size={14} className="text-slate-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none w-full sm:w-auto"
          >
            <option value="all">Every Division</option>
            <option value="Academic">Academic Affairs</option>
            <option value="Computer">Computer Science & IT</option>
            <option value="Library">Library</option>
            <option value="Finance">Accounts</option>
            <option value="Research">Research Labs</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.length === 0 ? (
          <div className="col-span-full py-12 bg-white rounded-xl border border-slate-100 text-center space-y-1">
            <Building size={32} className="text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 font-medium">No faculty matched selection.</p>
          </div>
        ) : (
          filteredFaculty.map((fac) => (
            <div
              key={fac._id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all hover:shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {/* Custom animated placeholder image badge */}
                  <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center font-display uppercase tracking-wider text-sm">
                    {fac.name.split(" ").slice(-1)[0][0] || "F"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight tracking-tight text-sm">
                      {fac.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{fac.role}</p>
                  </div>
                </div>

                <div className="text-[11px] bg-slate-50 text-slate-600 px-2 py-1 rounded inline-flex items-center gap-1">
                  <Building size={11} className="text-slate-400" />
                  <span>Division: {fac.department}</span>
                </div>
              </div>

              {/* Contacts info */}
              <div className="mt-5 pt-3 border-t border-slate-150 space-y-1.5 text-xs">
                <a
                  href={`mailto:${fac.email}`}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition"
                >
                  <Mail size={12} className="text-slate-400" />
                  <span>{fac.email}</span>
                </a>
                <a
                  href={`tel:${fac.phone}`}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition"
                >
                  <Phone size={12} className="text-slate-400" />
                  <span>{fac.phone}</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Emergency numbers row */}
      <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert size={20} className="text-rose-600 shrink-0 mt-0.5 animate-bounce" />
        <div className="text-xs">
          <h4 className="font-bold text-rose-950">24/7 Campus Safety Emergency Contacts</h4>
          <p className="text-rose-800 leading-relaxed mt-0.5">
            For medical support, fire safety precautions, or central security desk alerts, call campus guards directly on <span className="font-semibold">+91 022-21021200</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
