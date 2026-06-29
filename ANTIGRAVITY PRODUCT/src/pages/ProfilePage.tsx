import React, { useState } from "react";
import type { User, Student, Teacher } from "../types";
import { User as UserIcon, Mail, Phone, MapPin, GraduationCap, Building, Hash, Calendar, Shield, Save, Briefcase, Award } from "lucide-react";

interface Props { user: User; studentProfile?: Student; teacherProfile?: Teacher; onUpdateProfile: (d: any) => Promise<boolean>; }

export default function ProfilePage({ user, studentProfile: sp, teacherProfile: tp, onUpdateProfile }: Props) {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(sp?.phone || tp?.phone || "");
  const [address, setAddress] = useState(sp?.address || "");
  const [parentContact, setParentContact] = useState(sp?.parentContact || "");
  const [designation, setDesignation] = useState(tp?.designation || "");

  const handleSave = async () => {
    const payload: any = { phone };
    if (sp) { payload.address = address; payload.parentContact = parentContact; }
    if (tp) { payload.designation = designation; }
    const ok = await onUpdateProfile(payload);
    if (ok) setEditing(false);
  };

  const initials = user.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="animate-fadeIn"><h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Personal & academic information</p></div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-fadeIn">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center text-2xl font-bold font-display text-slate-700 dark:text-slate-300 border-4 border-white">
              {initials}
            </div>
          </div>
        </div>

        <div className="pt-14 px-6 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">{user.fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono uppercase ${
                  user.role === "student" ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" : user.role === "teacher" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300"
                }`}>{user.role}</span>
                {sp && <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{sp.rollNumber}</span>}
                {tp && <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{tp.employeeId}</span>}
              </div>
            </div>
            <button onClick={() => editing ? handleSave() : setEditing(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                editing ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}>
              {editing ? <><Save size={14} /> Save Changes</> : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow icon={<Mail size={15} />} label="Email" value={user.email} />
            {sp && (
              <>
                <InfoRow icon={<Phone size={15} />} label="Phone" value={editing ? undefined : sp.phone} editValue={editing ? phone : undefined} onChange={setPhone} />
                <InfoRow icon={<Building size={15} />} label="Department" value={sp.department} />
                <InfoRow icon={<GraduationCap size={15} />} label="Program" value={`${sp.program} · Semester ${sp.semester}`} />
                <InfoRow icon={<Hash size={15} />} label="Registration" value={sp.registrationNumber} />
                <InfoRow icon={<Calendar size={15} />} label="Batch" value={sp.batch} />
                <InfoRow icon={<MapPin size={15} />} label="Address" value={editing ? undefined : sp.address || "—"} editValue={editing ? address : undefined} onChange={setAddress} />
                <InfoRow icon={<Phone size={15} />} label="Parent Contact" value={editing ? undefined : sp.parentContact || "—"} editValue={editing ? parentContact : undefined} onChange={setParentContact} />
                <InfoRow icon={<Shield size={15} />} label="Verified" value={sp.verified ? "Yes ✅" : "Pending"} />
              </>
            )}
            {tp && (
              <>
                <InfoRow icon={<Phone size={15} />} label="Phone" value={editing ? undefined : tp.phone} editValue={editing ? phone : undefined} onChange={setPhone} />
                <InfoRow icon={<Building size={15} />} label="Department" value={tp.department} />
                <InfoRow icon={<Briefcase size={15} />} label="Designation" value={editing ? undefined : tp.designation} editValue={editing ? designation : undefined} onChange={setDesignation} />
                <InfoRow icon={<Calendar size={15} />} label="Joining Date" value={tp.joiningDate} />
                <InfoRow icon={<Award size={15} />} label="Experience" value={`${tp.experience} years`} />
                <InfoRow icon={<GraduationCap size={15} />} label="Qualifications" value={tp.qualifications.join(", ")} />
              </>
            )}
            {!sp && !tp && (
              <>
                <InfoRow icon={<Shield size={15} />} label="Role" value={user.role} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, editValue, onChange }: {
  icon: React.ReactNode; label: string; value?: string; editValue?: string; onChange?: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40">
      <span className="text-slate-400">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        {editValue !== undefined ? (
          <input type="text" value={editValue} onChange={e => onChange?.(e.target.value)} className="w-full mt-0.5 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 focus:border-indigo-400 transition" />
        ) : (
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
