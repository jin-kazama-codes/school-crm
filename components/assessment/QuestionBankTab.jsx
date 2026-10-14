import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Plus,
  Search,
  Filter,
  Sparkles,
  FileText,
  Trash2,
  Edit2,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";

const QuestionBankTab = ({
  selectedClass = "",
  selectedSection = "",
  selectedClassName = "",
  selectedSectionName = "",
  questions = [],
  loading = false,
  totalCount = 0,
  page = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteQuestion,
  filteredSubjects = [],
  selectedSubjectId = "",
  onSubjectFilterChange,
  searchQuery = "",
  onSearchChange,
}) => {
  const [filterMode, setFilterMode] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterChapter, setFilterChapter] = useState("all");

  const isSelectionReady = Boolean(selectedClass && selectedSection);

  // Distinct chapters from loaded questions
  const distinctChapters = useMemo(() => {
    const set = new Set();
    questions.forEach((q) => {
      if (q.chapter) set.add(q.chapter);
    });
    return Array.from(set);
  }, [questions]);

  // Client-side filtering on active page items
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (filterMode !== "all" && q.mode !== filterMode) return false;
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
  }, [questions, filterMode, filterDifficulty, filterChapter, searchQuery]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Action and Filter Controls Bar */}
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isSelectionReady ? "Search questions by text or chapter name..." : "Select Class and Section above to search..."}
              disabled={!isSelectionReady}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2b2b2b] text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Add Question Button with conditional disable and tooltip */}
          <button
            type="button"
            disabled={!isSelectionReady}
            onClick={onOpenAddModal}
            title={
              !isSelectionReady
                ? "Select Class and Section 1st"
                : "Click to create and add a new question to this question bank"
            }
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
              !isSelectionReady
                ? "bg-slate-200 dark:bg-[#252525] text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-75 border border-slate-300 dark:border-[#333]"
                : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 cursor-pointer"
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-[#202020] text-xs">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2b2b2b] rounded-xl px-2.5 py-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Subject:</span>
            <select
              value={selectedSubjectId}
              disabled={!isSelectionReady}
              onChange={(e) => onSubjectFilterChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="">All Subjects</option>
              {filteredSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2b2b2b] rounded-xl px-2.5 py-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Type:</span>
            <select
              value={filterMode}
              disabled={!isSelectionReady}
              onChange={(e) => setFilterMode(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="all">All Types</option>
              <option value="MCQ">MCQ (Multiple Choice)</option>
              <option value="DESC">Descriptive / Theory</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2b2b2b] rounded-xl px-2.5 py-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Difficulty:</span>
            <select
              value={filterDifficulty}
              disabled={!isSelectionReady}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Chapter Filter */}
          {distinctChapters.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2b2b2b] rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Chapter:</span>
              <select
                value={filterChapter}
                disabled={!isSelectionReady}
                onChange={(e) => setFilterChapter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer max-w-[150px] truncate disabled:opacity-50"
              >
                <option value="all">All Chapters</option>
                {distinctChapters.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters */}
          {(filterMode !== "all" || filterDifficulty !== "all" || filterChapter !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilterMode("all");
                setFilterDifficulty("all");
                setFilterChapter("all");
                onSearchChange("");
              }}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 2. Questions Ledger Body / Empty State */}
      {!isSelectionReady ? (
        <div className="min-h-[340px] flex flex-col items-center justify-center gap-3.5 bg-white dark:bg-[#141414] border border-dashed border-slate-300 dark:border-[#282828] rounded-3xl p-10 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Please Select Class & Section First
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Choose a target Class and Section from the top dropdown menu to view the question repository, filter topics, and create questions.
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-8 shadow-sm">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Loading question bank...</span>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="min-h-[320px] flex flex-col items-center justify-center gap-3.5 bg-white dark:bg-[#141414] border border-dashed border-slate-200 dark:border-[#282828] rounded-3xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
              No questions found for {selectedClassName} ({selectedSectionName})
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mt-1">
              Start adding questions to build your question repository for test papers and exam designs.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredQuestions.map((q) => {
            const subjectObj = filteredSubjects.find((s) => String(s.id) === String(q.subject_id));
            const isMCQ = q.mode === "MCQ";

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#333] transition-all group"
              >
                {/* Card Top Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mode Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isMCQ
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-500/20"
                      }`}
                    >
                      {q.mode || "MCQ"}
                    </span>

                    {/* Difficulty Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.difficulty_level === "Easy"
                          ? "bg-emerald-100/60 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : q.difficulty_level === "Hard"
                          ? "bg-rose-100/60 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                          : "bg-amber-100/60 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {q.difficulty_level || "Medium"}
                    </span>

                    {/* Marks Badge */}
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-zinc-300">
                      {q.max_marks || 1} {q.max_marks === 1 ? "Mark" : "Marks"}
                    </span>

                    {/* Subject Name */}
                    {subjectObj && (
                      <span className="text-xs font-extrabold text-slate-700 dark:text-zinc-300 flex items-center gap-1 ml-1">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        {subjectObj.name}
                      </span>
                    )}

                    {/* Chapter Name */}
                    {q.chapter && (
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-[#282828]">
                        {q.chapter}
                      </span>
                    )}
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(q)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#222] text-slate-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-[#333]"
                      title="Edit this question"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                      title="Delete this question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <p className="mt-3 text-xs md:text-[13px] font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {q.question_text}
                </p>

                {/* MCQ Options Display */}
                {q.mode === "MCQ" && (
                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: "option_a", label: "A", val: q.option_a },
                      { key: "option_b", label: "B", val: q.option_b },
                      { key: "option_c", label: "C", val: q.option_c },
                      { key: "option_d", label: "D", val: q.option_d },
                    ]
                      .filter((o) => o.val)
                      .map((opt) => {
                        const isCorrect = q.correct_option === opt.key;
                        return (
                          <div
                            key={opt.key}
                            className={`p-2 rounded-xl flex items-center gap-2 border text-[11px] font-medium transition-colors ${
                              isCorrect
                                ? "bg-emerald-50/80 border-emerald-500 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-600 dark:text-emerald-200 font-bold"
                                : "bg-slate-50 dark:bg-[#181818] border-slate-200/60 dark:border-[#262626] text-slate-700 dark:text-zinc-300"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 dark:bg-[#2a2a2a] text-slate-600 dark:text-zinc-400"
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span className="flex-1 truncate">{opt.val}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {isSelectionReady && totalCount > 0 && (
        <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>
              Showing {Math.min(page * pageSize + 1, totalCount)} to{" "}
              {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} questions
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2e2e2e] hover:bg-slate-100 dark:hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2e2e2e] text-xs font-bold text-slate-800 dark:text-white">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2e2e2e] hover:bg-slate-100 dark:hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

QuestionBankTab.propTypes = {
  selectedClass: PropTypes.string,
  selectedSection: PropTypes.string,
  selectedClassName: PropTypes.string,
  selectedSectionName: PropTypes.string,
  questions: PropTypes.array,
  loading: PropTypes.bool,
  totalCount: PropTypes.number,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func,
  onOpenAddModal: PropTypes.func.isRequired,
  onOpenEditModal: PropTypes.func.isRequired,
  onDeleteQuestion: PropTypes.func.isRequired,
  filteredSubjects: PropTypes.array,
  selectedSubjectId: PropTypes.string,
  onSubjectFilterChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
};

export default QuestionBankTab;
