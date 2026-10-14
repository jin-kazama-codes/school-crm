import React, { useState } from "react";
import PropTypes from "prop-types";
import { KeyRound, Copy, Check, GraduationCap, X, ShieldCheck } from "lucide-react";

const StudentCredentialModal = ({
  open,
  onClose,
  credentials,
  studentName = "",
  className = "",
  title = "Student Portal Account Credentials",
  subtitle = "Student portal account credentials for online quizzes, attendance & exams.",
  doneButtonText = "Done"
}) => {
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!open || !credentials) return null;

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(credentials.username || "");
    setCopiedUser(true);
    setTimeout(() => setCopiedUser(false), 2000);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(credentials.password || "");
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleCopyAll = () => {
    const text = `School Student Portal Credentials:\nStudent: ${studentName || "Student"}\nClass: ${className || ""}\nUsername: ${credentials.username}\nDefault Password: ${credentials.password}\nLogin URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#2e2e32] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex p-3 rounded-2xl bg-white/15 backdrop-blur-md mb-3 border border-white/20">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-lg font-extrabold tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-indigo-100/90 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Student Info Pill */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121214] border border-slate-100 dark:border-[#26262a] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Student Name
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {studentName || "Enrolled Student"}
              </span>
            </div>
            {className && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60">
                {className}
              </span>
            )}
          </div>

          {/* Credentials Display Boxes */}
          <div className="space-y-3">
            {/* Username */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#28282c] bg-white dark:bg-[#151518] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Student Username (Enrollment No)
                </span>
                <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {credentials.username}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUsername}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 bg-slate-100 dark:bg-[#222226] hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-all cursor-pointer"
              >
                {copiedUser ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUser ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Password */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#28282c] bg-white dark:bg-[#151518] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Default Temporary Password
                </span>
                <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                  {credentials.password}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 bg-slate-100 dark:bg-[#222226] hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-all cursor-pointer"
              >
                {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPass ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-[11px] text-blue-800 dark:text-blue-300">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p>
              The student can now log into the portal directly to take online quizzes and view class schedules. Parent/Guardian credentials remain separate for fee payments.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#121214] border-t border-slate-100 dark:border-[#222] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-900/60 rounded-xl transition-all cursor-pointer"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? "All Copied!" : "Copy Credential Slip"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            {doneButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

StudentCredentialModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  credentials: PropTypes.object,
  studentName: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  doneButtonText: PropTypes.string
};

export default StudentCredentialModal;
