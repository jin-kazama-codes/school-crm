import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Search,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  X,
  Info
} from "lucide-react";
import PaperPrintPreviewModal from "./PaperPrintPreviewModal";

const PublishTab = ({
  classId,
  sectionId,
  className = "",
  sectionName = "",
  filteredSubjects = [],
  designedPapers = [],
  loadingPapers = false,
  onSavePaper,
  onDeletePaper,
  schoolName = "",
  rolePriority = null,
}) => {
  const isStudentOrGuardian = rolePriority === 5 || rolePriority === 6;

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'published' | 'draft'

  // Scheduling Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPaperForSchedule, setSelectedPaperForSchedule] = useState(null);
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:30");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // Preview Modal State
  const [previewPaper, setPreviewPaper] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Filtered list of papers
  const filteredPapersList = useMemo(() => {
    return designedPapers.filter((p) => {
      // Students and guardians must only see published examination papers
      if (isStudentOrGuardian && p.status !== "published") return false;
      if (filterStatus !== "all" && (p.status || "draft") !== filterStatus) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (p.title || "").toLowerCase().includes(query);
        const codeMatch = (p.paper_code || "").toLowerCase().includes(query);
        const subMatch = filteredSubjects
          .find((s) => String(s.id) === String(p.subject_id))
          ?.name?.toLowerCase()
          .includes(query);
        if (!titleMatch && !codeMatch && !subMatch) return false;
      }
      return true;
    });
  }, [designedPapers, filterStatus, searchQuery, filteredSubjects]);

  // Status Metrics
  const totalCount = designedPapers.length;
  const publishedCount = designedPapers.filter((p) => p.status === "published").length;
  const draftCount = totalCount - publishedCount;

  // Calculate End Time given Start Time and duration in minutes
  const calculateEndTimeFromDuration = (startStr, durationMin) => {
    if (!startStr) return "";
    try {
      const parts = startStr.split(":");
      if (parts.length < 2) return "";
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (isNaN(hours) || isNaN(minutes)) return "";
      const dur = Number(durationMin) || 0;
      const totalMin = hours * 60 + minutes + dur;
      const normalizedMin = ((totalMin % 1440) + 1440) % 1440;
      const endHours = Math.floor(normalizedMin / 60);
      const endMin = normalizedMin % 60;
      return `${String(endHours).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
    } catch (e) {
      return "";
    }
  };

  // Open Schedule Modal
  const handleOpenScheduleModal = (paper) => {
    setSelectedPaperForSchedule(paper);
    let initialDate = "";
    if (paper?.exam_date) {
      try {
        const d = new Date(paper.exam_date);
        initialDate = d.toISOString().split("T")[0];
      } catch (e) {
        initialDate = "";
      }
    }
    setExamDate(initialDate || new Date().toISOString().split("T")[0]);

    const duration = Number(paper?.duration_minutes) || 60;
    const initialStart = paper?.start_time || "08:00";
    const initialEnd = paper?.end_time || calculateEndTimeFromDuration(initialStart, duration);

    setStartTime(initialStart);
    setEndTime(initialEnd);
    setAcademicYear(paper?.academic_year || "2026-2027");
    setModalError("");
    setIsScheduleModalOpen(true);
  };

  // Auto-adjust End Time when Start Time changes based on duration
  const handleStartTimeChange = (newStartTime) => {
    setStartTime(newStartTime);
    const duration = Number(selectedPaperForSchedule?.duration_minutes) || 60;
    if (newStartTime && duration > 0) {
      const calculatedEnd = calculateEndTimeFromDuration(newStartTime, duration);
      if (calculatedEnd) {
        setEndTime(calculatedEnd);
      }
    }
  };

  // Publish / Schedule Form Submit
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!examDate) {
      setModalError("Please select a valid Examination Date.");
      return;
    }
    if (!startTime || !endTime) {
      setModalError("Please provide both Start Time and End Time.");
      return;
    }

    setModalSaving(true);
    setModalError("");

    const payload = {
      id: selectedPaperForSchedule.id,
      class_id: selectedPaperForSchedule.class_id,
      section_id: selectedPaperForSchedule.section_id,
      subject_id: selectedPaperForSchedule.subject_id,
      title: selectedPaperForSchedule.title,
      paper_code: selectedPaperForSchedule.paper_code,
      duration_minutes: selectedPaperForSchedule.duration_minutes,
      max_marks: selectedPaperForSchedule.max_marks,
      passing_marks: selectedPaperForSchedule.passing_marks,
      instructions: selectedPaperForSchedule.instructions,
      sections_json: selectedPaperForSchedule.sections_json,
      status: "published",
      exam_date: new Date(examDate).toISOString(),
      start_time: startTime,
      end_time: endTime,
      academic_year: academicYear.trim() || "2026-2027",
    };

    await onSavePaper(payload);
    setModalSaving(false);
    setIsScheduleModalOpen(false);
    setSelectedPaperForSchedule(null);
  };

  // Quick Unpublish / Revert to Draft
  const handleToggleStatus = async (paper) => {
    const newStatus = paper.status === "published" ? "draft" : "published";
    if (newStatus === "draft") {
      if (!window.confirm("Are you sure you want to revert this published exam back to Draft? Students will no longer see it.")) {
        return;
      }
    }
    const payload = {
      ...paper,
      status: newStatus,
    };
    await onSavePaper(payload);
  };

  const getSubjectName = (subId) => {
    return filteredSubjects.find((s) => String(s.id) === String(subId))?.name || "Subject";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Scheduled";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const [h, m] = timeStr.split(":");
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${m} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  if (!classId || !sectionId) {
    return (
      <div className="min-h-[340px] flex flex-col items-center justify-center gap-3.5 bg-white dark:bg-[#141414] border border-dashed border-slate-300 dark:border-[#282828] rounded-3xl p-10 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
          <Calendar className="w-7 h-7" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Please Select Class & Section First
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Choose a target Class and Section from the top dropdown menu to view the examination timetable and publish scheduled exams.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Overview & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-5 shadow-xs flex items-center justify-between"
          title="Total exam papers created for this class & section"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Total Exam Papers
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {className} • {sectionName}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-zinc-300 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div
          className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-5 shadow-xs flex items-center justify-between"
          title="Exams that have been scheduled and published for students"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Published & Scheduled
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {publishedCount}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Visible to all students & staff
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div
          className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-5 shadow-xs flex items-center justify-between"
          title="Exam papers still in draft state awaiting scheduling"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Drafts (Unscheduled)
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {draftCount}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Pending examination schedule
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Filter & Controls Bar */}
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exam by title, code or subject..."
            title="Type to search through examination papers"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2e2e2e] rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: "all", label: "All Papers", count: totalCount },
            { id: "published", label: "Published", count: publishedCount },
            { id: "draft", label: "Drafts", count: draftCount },
          ].map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                title={`Filter exams by ${tab.label}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-50 dark:bg-[#1c1c1c] text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#252525]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                      : "bg-slate-200 dark:bg-[#333] text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Published & Scheduled Exams List */}
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#202020]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                Examination Schedule Ledger
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                View date, time slot, and publish status for each examination paper
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {filteredPapersList.length} of {totalCount} Papers
          </span>
        </div>

        {loadingPapers ? (
          <div className="py-16 text-center text-xs font-bold text-slate-400">
            Loading examination schedule...
          </div>
        ) : filteredPapersList.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-[#1c1c1c] text-slate-400 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              No examination papers found for the selected filter.
            </p>
            <p className="text-[11px] text-slate-400">
              Design a new paper in Tab 2 (Question Design) to schedule and publish exams.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPapersList.map((paper) => {
              const isPub = paper.status === "published";
              const subjectName = getSubjectName(paper.subject_id);

              return (
                <div
                  key={paper.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                    isPub
                      ? "bg-gradient-to-b from-emerald-50/20 to-transparent dark:from-emerald-950/10 border-emerald-500/30 dark:border-emerald-500/20 shadow-xs"
                      : "bg-slate-50/50 dark:bg-[#181818] border-slate-200/80 dark:border-[#282828]"
                  }`}
                >
                  {/* Top Subject & Status Badge */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                        {subjectName}
                      </span>

                      {isPub ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/20">
                          Draft
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                      {paper.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      Code: {paper.paper_code || "N/A"}
                    </p>
                  </div>

                  {/* Schedule Details Box */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#202020] border border-slate-200/80 dark:border-[#303030] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Exam Date
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {formatDate(paper.exam_date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold">
                        <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        Time Window
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {paper.start_time && paper.end_time
                          ? `${formatTime(paper.start_time)} - ${formatTime(paper.end_time)}`
                          : `${paper.duration_minutes || 60} mins`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-[#2c2c2c] text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>Max Marks: <strong className="text-slate-900 dark:text-white">{paper.max_marks || 100}</strong></span>
                      <span>Passing: <strong className="text-slate-900 dark:text-white">{paper.passing_marks || 33}%</strong></span>
                      <span>Year: <strong className="text-slate-900 dark:text-white">{paper.academic_year || "2026-2027"}</strong></span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#252525]">
                    {/* Preview / Print */}
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewPaper(paper);
                        setIsPreviewOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#252525] dark:hover:bg-[#303030] text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Open printable examination paper preview"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Print / Preview</span>
                    </button>

                    {!isStudentOrGuardian && (
                      <div className="flex items-center gap-2">
                        {/* Schedule / Reschedule */}
                        <button
                          type="button"
                          onClick={() => handleOpenScheduleModal(paper)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          title={isPub ? "Modify examination date and time slot" : "Schedule exam date and publish to students"}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{isPub ? "Reschedule" : "Schedule & Publish"}</span>
                        </button>

                        {/* Unpublish Toggle */}
                        {isPub && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(paper)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer"
                            title="Revert published exam back to draft (students will not see it)"
                          >
                            Unpublish
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Schedule & Publish Examination Modal */}
      {isScheduleModalOpen && selectedPaperForSchedule && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-[#202020] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Schedule & Publish Examination
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {selectedPaperForSchedule.title} • {getSubjectName(selectedPaperForSchedule.subject_id)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Target Class & Section Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-[#282828] flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span>Class & Section:</span>
                <span className="text-slate-900 dark:text-white">{className} - {sectionName}</span>
              </div>

              {/* Exam Date */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                  Examination Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2e2e2e] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  title="Date on which students will sit for this exam"
                />
              </div>

              {/* Timing Window (Start & End Time) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                    Examination Timings <span className="text-rose-500">*</span>
                  </span>
                  {selectedPaperForSchedule?.duration_minutes && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duration: {selectedPaperForSchedule.duration_minutes} mins
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                      <span>Start Time</span>
                      <span className="text-[10px] text-slate-400 font-normal">Starts 08:00 AM</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2e2e2e] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                      title="Time when examination commences"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                      <span>End Time</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Auto-calculated</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2e2e2e] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                      title="Time when examination concludes (auto-calculated from paper duration)"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Year */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                  Academic Session / Term
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2026-2027 or Mid-Term 2026"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2e2e2e] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  title="Academic session or term title"
                />
              </div>

              {/* Notice info */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Publishing this examination will make it officially visible on the Student, Guardian, and Teacher examination dashboards for {className} ({sectionName}).
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#202020]">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#333] text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
                  title="Cancel scheduling"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-extrabold shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Publish this examination schedule"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{modalSaving ? "Publishing..." : "Publish Examination"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Printable Paper Preview Modal */}
      {previewPaper && (
        <PaperPrintPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewPaper(null);
          }}
          paper={previewPaper}
          schoolName={schoolName}
          className={className}
          sectionName={sectionName}
          subjectName={getSubjectName(previewPaper.subject_id)}
        />
      )}
    </div>
  );
};

PublishTab.propTypes = {
  classId: PropTypes.string,
  sectionId: PropTypes.string,
  className: PropTypes.string,
  sectionName: PropTypes.string,
  filteredSubjects: PropTypes.array,
  designedPapers: PropTypes.array,
  loadingPapers: PropTypes.bool,
  onSavePaper: PropTypes.func.isRequired,
  onDeletePaper: PropTypes.func.isRequired,
  schoolName: PropTypes.string,
  rolePriority: PropTypes.number,
};

export default PublishTab;
