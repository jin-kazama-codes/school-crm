import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  X,
  BookOpen,
  HelpCircle,
  Save,
  CheckCircle2,
  Layers,
  Sparkles,
  FileText,
  Check,
  AlertCircle,
  Info
} from "lucide-react";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const QuestionModal = ({
  isOpen,
  onClose,
  initialData = null,
  classId,
  sectionId,
  className = "",
  sectionName = "",
  filteredSubjects = [],
  onSave,
  loading = false,
}) => {
  const [mode, setMode] = useState("MCQ"); // 'MCQ' | 'DESC'
  const [subjectId, setSubjectId] = useState("");
  const [chapter, setChapter] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [maxMarks, setMaxMarks] = useState(1);

  // MCQ Options
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("option_a");

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (initialData) {
      setMode(initialData.mode || "MCQ");
      setSubjectId(initialData.subject_id ? String(initialData.subject_id) : (filteredSubjects[0]?.id ? String(filteredSubjects[0].id) : ""));
      setChapter(initialData.chapter || "");
      setQuestionText(initialData.question_text || "");
      setDifficulty(initialData.difficulty_level || "Medium");
      setMaxMarks(initialData.max_marks !== undefined && initialData.max_marks !== null ? initialData.max_marks : (initialData.mode === "DESC" ? 5 : 1));
      setOptionA(initialData.option_a || "");
      setOptionB(initialData.option_b || "");
      setOptionC(initialData.option_c || "");
      setOptionD(initialData.option_d || "");
      setCorrectOption(initialData.correct_option || "option_a");
    } else {
      setMode("MCQ");
      setSubjectId(filteredSubjects[0]?.id ? String(filteredSubjects[0].id) : "");
      setChapter("");
      setQuestionText("");
      setDifficulty("Medium");
      setMaxMarks(1);
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectOption("option_a");
    }
    setValidationError("");
  }, [initialData, isOpen, filteredSubjects]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!subjectId) {
      setValidationError("Please select a subject.");
      return;
    }
    if (!questionText.trim()) {
      setValidationError("Please enter the complete question text.");
      return;
    }
    if (mode === "MCQ") {
      if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
        setValidationError("Please fill all 4 options (A, B, C, and D) for the MCQ.");
        return;
      }
      if (!correctOption) {
        setValidationError("Please select which option is the correct answer.");
        return;
      }
    } else {
      if (!maxMarks || parseFloat(String(maxMarks)) <= 0) {
        setValidationError("Please specify maximum marks for this descriptive question (minimum 1 mark).");
        return;
      }
    }

    const payload = {
      id: initialData?.id,
      class_id: classId ? parseInt(String(classId), 10) : null,
      section_id: sectionId ? parseInt(String(sectionId), 10) : null,
      subject_id: parseInt(String(subjectId), 10),
      chapter: chapter.trim() || null,
      mode: mode,
      question_text: questionText.trim(),
      difficulty_level: difficulty,
      max_marks: parseFloat(String(maxMarks)) || (mode === "MCQ" ? 1 : 5),
      option_a: mode === "MCQ" ? optionA.trim() : null,
      option_b: mode === "MCQ" ? optionB.trim() : null,
      option_c: mode === "MCQ" ? optionC.trim() : null,
      option_d: mode === "MCQ" ? optionD.trim() : null,
      correct_option: mode === "MCQ" ? correctOption : null,
      status: "active",
    };

    onSave(payload);
  };

  const isEditing = Boolean(initialData?.id);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#202020] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {isEditing ? "Edit Question" : "Add Question to Bank"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {className} • {sectionName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="font-semibold">{validationError}</span>
            </div>
          )}

          {/* 1. Question Type Switcher */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
              Question Format / Mode
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-100 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2e2e2e]">
              <button
                type="button"
                onClick={() => {
                  setMode("MCQ");
                  setMaxMarks(1);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "MCQ"
                    ? "bg-white dark:bg-[#2a2a2a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900"
                }`}
                title="Multiple Choice Question with 4 options (A, B, C, D)"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Multiple Choice (MCQ)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("DESC");
                  if (maxMarks === 1) setMaxMarks(5);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "DESC"
                    ? "bg-white dark:bg-[#2a2a2a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900"
                }`}
                title="Descriptive, short-answer or essay question"
              >
                <FileText className="w-4 h-4" />
                <span>Descriptive / Theory</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {mode === "MCQ" ? "Students choose from 4 options" : "Students write step-by-step descriptive answers"}
            </p>
          </div>

          {/* 2. Subject and Chapter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                Subject <span className="text-rose-500">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
                required
                title="Select subject for this question"
              >
                <option value="">Select Subject</option>
                {filteredSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                Chapter / Topic (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Photosynthesis, Algebra, Optics"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                title="Chapter or syllabus topic name for easy search and filtering"
              />
            </div>
          </div>

          {/* 3. Difficulty and Max Marks Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                Difficulty Level
              </label>
              <div className="flex items-center gap-2">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      difficulty === diff
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                        : "bg-slate-50 dark:bg-[#1c1c1c] text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-[#2e2e2e] hover:bg-slate-100"
                    }`}
                    title={`Mark question as ${diff}`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                Max Marks <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2e2e2e] rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                required
                title="Weightage of marks for this question"
              />
            </div>
          </div>

          {/* 4. Question Text */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
              Question Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Type your examination question here..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2e2e2e] rounded-2xl p-3.5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 leading-relaxed font-sans"
              required
              title="Full question statement"
            />
          </div>

          {/* 5. MCQ Options and Correct Selection (Only in MCQ mode) */}
          {mode === "MCQ" && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#202020]">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                  Multiple Choice Options & Correct Answer
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Select the radio button for the correct answer
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { key: "option_a", label: "Option A", val: optionA, setter: setOptionA },
                  { key: "option_b", label: "Option B", val: optionB, setter: setOptionB },
                  { key: "option_c", label: "Option C", val: optionC, setter: setOptionC },
                  { key: "option_d", label: "Option D", val: optionD, setter: setOptionD },
                ].map((opt) => {
                  const isSelected = correctOption === opt.key;
                  return (
                    <div
                      key={opt.key}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/50"
                          : "bg-slate-50 dark:bg-[#181818] border-slate-200 dark:border-[#2e2e2e]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCorrectOption(opt.key)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                            : "border-slate-300 dark:border-zinc-600 text-slate-400 hover:border-emerald-500"
                        }`}
                        title={`Click to set ${opt.label} as the correct answer`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : opt.label.slice(-1)}
                      </button>

                      <input
                        type="text"
                        placeholder={`Enter ${opt.label} text...`}
                        value={opt.val}
                        onChange={(e) => opt.setter(e.target.value)}
                        className="flex-1 bg-transparent text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                        required
                        title={`Choice text for ${opt.label}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#202020]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#333] text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
              title="Close modal without saving"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-extrabold shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Save this question to the bank"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? "Saving Question..." : isEditing ? "Update Question" : "Save Question to Bank"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

QuestionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sectionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  sectionName: PropTypes.string,
  filteredSubjects: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default QuestionModal;
