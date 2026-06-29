import React, { useState } from "react";
import type { User } from "../types";
import { useTheme } from "../context/ThemeContext";
import { Settings, Moon, Bell, Shield, Globe, Monitor, Palette } from "lucide-react";

interface Props { user: User; }

export default function SettingsPage({ user }: Props) {
  const { theme, setTheme, isDark, isCompact, setIsCompact } = useTheme();
  
  const [settingsState, setSettingsState] = useState<Record<string, any>>({
    "Email Notifications": true,
    "Push Notifications": true,
    "Notice Alerts": true,
    "Fee Reminders": true,
    "Two-Factor Authentication": false,
    "Language": "English",
    "Date Format": "DD/MM/YYYY"
  });

  const toggleSetting = (key: string) => {
    if (key === "Theme") {
      setTheme(isDark ? "light" : "dark");
    } else if (key === "Compact Mode") {
      setIsCompact(!isCompact);
    } else {
      setSettingsState(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const sections = [
    {
      title: "Appearance", icon: <Palette size={18} />,
      items: [
        { label: "Theme", desc: "Choose between light and dark theme", type: "toggle", value: isDark },
        { label: "Compact Mode", desc: "Reduce spacing for denser UI", type: "toggle", value: isCompact },
      ],
    },
    {
      title: "Notifications", icon: <Bell size={18} />,
      items: [
        { label: "Email Notifications", desc: "Receive notifications via email", type: "toggle", value: settingsState["Email Notifications"] },
        { label: "Push Notifications", desc: "Browser push notifications", type: "toggle", value: settingsState["Push Notifications"] },
        { label: "Notice Alerts", desc: "Get alerted for new notices", type: "toggle", value: settingsState["Notice Alerts"] },
        { label: "Fee Reminders", desc: "Payment deadline reminders", type: "toggle", value: settingsState["Fee Reminders"] },
      ],
    },
    {
      title: "Privacy & Security", icon: <Shield size={18} />,
      items: [
        { label: "Two-Factor Authentication", desc: "Add extra security to your account", type: "toggle", value: settingsState["Two-Factor Authentication"] },
        { label: "Session Management", desc: "View and manage active sessions", type: "action", value: "Manage" },
        { label: "Change Password", desc: "Update your account password", type: "action", value: "Change" },
      ],
    },
    {
      title: "Language & Region", icon: <Globe size={18} />,
      items: [
        { label: "Language", desc: "Interface language", type: "select", value: settingsState["Language"] },
        { label: "Date Format", desc: "DD/MM/YYYY or MM/DD/YYYY", type: "select", value: settingsState["Date Format"] },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="animate-fadeIn"><h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your preferences and account settings</p></div>

      {sections.map((section, si) => (
        <div key={section.title} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-fadeIn stagger-${si + 1}`}>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400">{section.icon}</span>
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">{section.title}</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {section.items.map(item => (
              <div key={item.label} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                {item.type === "toggle" && (
                  <button onClick={() => toggleSetting(item.label)} className={`w-10 h-5.5 rounded-full transition cursor-pointer relative ${item.value ? "bg-indigo-500" : "bg-slate-300"}`}>
                    <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all ${item.value ? "left-5" : "left-0.5"}`} />
                  </button>
                )}
                {item.type === "action" && (
                  <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">{item.value as string}</button>
                )}
                {item.type === "select" && (
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1 rounded-lg">{item.value as string}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-fadeIn">
        <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-3">Account Info</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="font-mono text-slate-700 dark:text-slate-300">{user.email}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Role</span><span className="font-mono text-slate-700 dark:text-slate-300 capitalize">{user.role}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">User ID</span><span className="font-mono text-slate-400">{user._id}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Version</span><span className="font-mono text-slate-400">Campus Hub v1.0</span></div>
        </div>
      </div>
    </div>
  );
}
