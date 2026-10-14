import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  X,
  Search,
  Check,
  CheckCircle2,
  Sparkles,
  FileText,
  Filter,
  Plus,
  HelpCircle,
  BookOpen
} from "lucide-react";

const PaperQuestionPickerModal = ({
  isOpen,
  onClose,
  sectionTitle = "Section",
  sectionType = "MCQ", // 'MCQ' | 'DESC'
  subjectId = "",
  subjectName = "",
  allBankQuestions = [],
  alreadySelectedIds = [],
  onConfirmSelection,
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterChapter, setFilterChapter] = useState("all");

  // Initial selection syncing
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds([...alreadySelectedIds]);
      setSearchQuery("");
      setFilterDifficulty("all");
      setFilterChapter("all");
    }
  }, [isOpen, alreadySelectedIds]);

  // Questions matching section type & subject
  const eligibleQuestions = useMemo(() => {
    return allBankQuestions.filter((q) => {
      // If subject is selected, match subject
      if (subjectId && String(q.subject_id) !== String(subjectId)) return false;
      // If sectionType is MCQ, only show MCQ. If DESC, show DESC
      if (sectionType === "MCQ" && q.mode !== "MCQ") return false;
      if (sectionType === "DESC" && q.mode !== "DESC") return false;
      return true;
    });
  }, [allBankQuestions, subjectId, sectionType]);

  // Distinct chapters
  const distinctChapters = useMemo(() => {
    const set = new Set();
    eligibleQuestions.forEach((q) => {
      if (q.chapter) set.add(q.chapter);
    });
    return Array.from(set);
  }, [eligibleQuestions]);

  // Filtered list by user search and filters
  const displayQuestions = useMemo(() => {
    return eligibleQuestions.filter((q) => {
      if (filterDifficulty !== "all" && q.difficulty_level !== filterDifficulty) return false;
      if (filterChapter !== "all" && q.chapter !== filterChapter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = (q.question_text || "").toLowerCase().includes(query);
        const chapterMatch = (q.chapter || "").toLowerCase().includes(query);
        if (!textMatch && !chapterMatch) return false;
      }
      return true;
    });
  }, [eligibleQuestions, filterDifficulty, filterChapter, searchQuery]);

  if (!isOpen) return null;

  const toggleSelect = (id) => {
    const sId = String(id);
    setSelectedIds((prev) =>
      prev.includes(sId) ? prev.filter((item) => item !== sId) : [...prev, sId]
    );
  };

  const selectAll = () => {
    const allIds = displayQuestions.map((q) => String(q.id));
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      // Deselect these
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      // Add all
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const handleApply = () => {
    const chosenObjects = allBankQuestions.filter((q) =>
      selectedIds.includes(String(q.id))
    );
    onConfirmSelection(chosenObjects);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-[#202020] flex items-center justify-between bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Select Questions for {sectionTitle}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span className="font-semibold">{subjectName || "All Subjects"}</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span className="font-semibold">Type: {sectionType}</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                <span className="font-bold text-emerald-300">
                  {selectedIds.length} Selected
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 hover:bg-white/20 text-white/80 hover:text-white rounded-xl transition-colors cursor-pointer border border-white/10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50 dark:bg-[#181818] border-b border-slate-200/80 dark:border-[#262626] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by text or chapter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#2e2e2e] text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#2e2e2e] rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {distinctChapters.length > 0 && (
              <select
                value={filterChapter}
                onChange={(e) => setFilterChapter(e.target.value)}
                className="bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#2e2e2e] rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none max-w-[140px] truncate"
              >
                <option value="all">All Chapters</option>
                {distinctChapters.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={selectAll}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#2a2a2a] text-slate-700 dark:text-zinc-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-[#333] transition-all cursor-pointer"
            >
              {displayQuestions.length > 0 &&
              displayQuestions.every((q) => selectedIds.includes(String(q.id)))
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        </div>

        {/* Question List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
          {displayQuestions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">
                No matching {sectionType} questions found in this bank.
              </p>
              <p className="text-[11px] mt-1">
                Add more questions in Tab 1 (Question Bank) to pick them here.
              </p>
            </div>
          ) : (
            displayQuestions.map((q) => {
              const isSelected = selectedIds.includes(String(q.id));
              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? "bg-emerald-50/70 border-emerald-500/80 dark:bg-emerald-950/30 dark:border-emerald-600 shadow-xs"
                      : "bg-white dark:bg-[#181818] border-slate-200/80 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#383838]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 dark:border-[#3a3a3a] bg-white dark:bg-[#222]"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          q.mode === "MCQ"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                            : "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                        }`}
                      >
                        {q.mode}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-[#242424] text-slate-700 dark:text-zinc-300">
                        {q.difficulty_level || "Medium"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-[#242424] text-slate-700 dark:text-zinc-300">
                        {q.max_marks || 1} {q.max_marks === 1 ? "Mark" : "Marks"}
                      </span>
                      {q.chapter && (
                        <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                          {q.chapter}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {q.question_text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-[#202020] bg-slate-50 dark:bg-[#181818] flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
            {selectedIds.length} questions selected for this section
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2e2e2e] text-slate-600 dark:text-zinc-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#222] cursor-pointer"
              title="Close picker without saving changes"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
              title="Add selected questions to this section"
            >
              Apply Selection ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PaperQuestionPickerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  sectionTitle: PropTypes.string,
  sectionType: PropTypes.string,
  subjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subjectName: PropTypes.string,
  allBankQuestions: PropTypes.array,
  alreadySelectedIds: PropTypes.array,
  onConfirmSelection: PropTypes.func.isRequired,
};

export default PaperQuestionPickerModal;
