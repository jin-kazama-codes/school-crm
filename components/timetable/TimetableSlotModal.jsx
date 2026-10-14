import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, BookOpen, Clock, Calendar, Save, Trash2, CheckCircle2, User, Layers } from "lucide-react";

const TimetableSlotModal = ({
  isOpen,
  onClose,
  slotData,
  allSubjects = [],
  allTeachers = [],
  onSave,
  onDelete,
  loading = false,
}) => {
  const [subjectId, setSubjectId] = useState("");
  const [batch, setBatch] = useState("both");
  const [duration, setDuration] = useState("45 min");

  useEffect(() => {
    if (slotData) {
      setSubjectId(slotData?.subject_id ? String(slotData.subject_id) : "");
      setBatch(slotData?.batch || "both");
      setDuration(slotData?.duration || `${slotData?.slotDuration || 45} min`);
    } else {
      setSubjectId("");
      setBatch("both");
      setDuration("45 min");
    }
  }, [slotData, isOpen]);

  if (!isOpen || !slotData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subjectId) {
      alert("Please select a subject");
      return;
    }
    onSave({
      id: slotData?.id,
      class_id: slotData?.class_id,
      section_id: slotData?.section_id,
      subject_id: parseInt(subjectId, 10),
      period: slotData?.periodNumber,
      day: String(slotData?.day).toLowerCase(),
      batch: batch,
      duration: duration,
    });
  };

  const isExisting = Boolean(slotData?.id);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-[#202020] flex items-center justify-between bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                {isExisting ? "Edit Period" : "Assign Period"}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span className="capitalize font-bold text-white">{slotData?.day}</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span>Period {slotData?.periodNumber}</span>
                {slotData?.timeRange && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                    <span className="font-mono text-emerald-200">{slotData.timeRange}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 text-white/80 hover:text-white rounded-xl transition-colors cursor-pointer border border-white/10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Class & Section context banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                Target:
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                Class {slotData?.className || slotData?.class_id} • Sec {slotData?.sectionName || slotData?.section_id}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Period #{slotData?.periodNumber}
            </span>
          </div>

          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Subject <span className="text-rose-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#161616] border border-slate-300 dark:border-[#333] rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="" disabled>Select Subject</option>
              {allSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name || sub.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Batch Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Batch
              </label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#161616] border border-slate-300 dark:border-[#333] rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="both">Both (Junior & Senior)</option>
                <option value="junior">Junior Batch</option>
                <option value="senior">Senior Batch</option>
              </select>
            </div>

            {/* Duration Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Slot Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 45 min"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#161616] border border-slate-300 dark:border-[#333] rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-[#202020] flex items-center justify-between gap-3">
            <div>
              {isExisting && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(slotData.id)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 rounded-xl transition-all border border-rose-200 dark:border-rose-900/40 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Slot
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#202020] rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !subjectId}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
                {loading ? "Saving..." : isExisting ? "Update Slot" : "Assign Slot"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

TimetableSlotModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  slotData: PropTypes.object,
  allSubjects: PropTypes.array,
  allTeachers: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  loading: PropTypes.bool,
};

export default TimetableSlotModal;
