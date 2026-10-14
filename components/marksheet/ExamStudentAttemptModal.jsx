import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  User,
  Sparkles,
  Check,
  Save
} from "lucide-react";

/**
 * Question Attempt Breakdown Modal
 * Displays question-level analysis for a student (MCQ attempts, correct options, and theory marks).
 */
const ExamStudentAttemptModal = ({
  isOpen,
  onClose,
  student,
  paper,
  studentAttempt,
  onSaveAttempt,
}) => {
  // Helper to determine question weightage dynamically from DB blueprint
  const getQuestionMaxMarks = (q, sec) => {
    const raw = q.max_marks ?? q.marks ?? q.mark ?? sec?.marks_per_question;
    if (raw !== undefined && raw !== null && !isNaN(Number(raw))) {
      return Number(raw);
    }
    return q.mode === "DESC" || q.type === "desc" || q.type === "DESC" ? 5 : 1;
  };

  // 1. Flatten all questions across sections
  const allQuestions = useMemo(() => {
    if (!paper) return [];
    let sections = [];
    try {
      if (typeof paper.sections_json === "string") {
        sections = JSON.parse(paper.sections_json || "[]");
      } else if (Array.isArray(paper.sections_json)) {
        sections = paper.sections_json;
      }
    } catch (e) {
      sections = [];
    }

    const list = [];
    sections.forEach((sec, secIdx) => {
      (sec.questions || []).forEach((q) => {
        const qMaxMarks = getQuestionMaxMarks(q, sec);
        list.push({
          ...q,
          maxMarks: qMaxMarks,
          sectionTitle: sec.title || `Section ${secIdx + 1}`,
          sectionType: sec.type || "Mixed",
          globalIndex: list.length + 1,
        });
      });
    });
    return list;
  }, [paper]);

  // 2. State for question-level scores & student selected options
  const [questionScores, setQuestionScores] = useState({});
  const [studentAnswers, setStudentAnswers] = useState({});

  // Synchronize state whenever student, paper, or studentAttempt changes
  useEffect(() => {
    if (!isOpen || !student || !paper) return;

    const initialScores = {};
    const initialAnswers = {};

    allQuestions.forEach((q) => {
      if (studentAttempt?.questionScores && studentAttempt.questionScores[q.id] !== undefined) {
        initialScores[q.id] = studentAttempt.questionScores[q.id];
      } else {
        initialScores[q.id] = q.maxMarks;
      }

      if (studentAttempt?.studentAnswers && studentAttempt.studentAnswers[q.id] !== undefined) {
        initialAnswers[q.id] = studentAttempt.studentAnswers[q.id];
      } else {
        initialAnswers[q.id] = q.correct_option || "A";
      }
    });

    setQuestionScores(initialScores);
    setStudentAnswers(initialAnswers);
  }, [isOpen, student?.id, paper?.id, studentAttempt, allQuestions]);

  // Calculate total marks scored
  const totalScored = Object.values(questionScores).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
  const maxMarks = paper?.max_marks || 100;
  const percentage = maxMarks > 0 ? ((totalScored / maxMarks) * 100).toFixed(1) : 0;
  const isPass = totalScored >= (paper?.passing_marks || 33);

  const handleScoreChange = (qId, val, maxQMarks) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      setQuestionScores((prev) => ({ ...prev, [qId]: 0 }));
    } else {
      const clamped = Math.max(0, Math.min(num, maxQMarks));
      setQuestionScores((prev) => ({ ...prev, [qId]: clamped }));
    }
  };

  const handleOptionChange = (qId, optKey, correctOpt, qMarks) => {
    setStudentAnswers((prev) => ({ ...prev, [qId]: optKey }));
    // Auto-grade MCQ: if correct, full mark; else 0
    if (optKey === correctOpt) {
      setQuestionScores((prev) => ({ ...prev, [qId]: qMarks }));
    } else {
      setQuestionScores((prev) => ({ ...prev, [qId]: 0 }));
    }
  };

  const handleSave = () => {
    if (!student) return;
    onSaveAttempt({
      studentId: student.id,
      totalScored,
      questionScores,
      studentAnswers,
      evaluated: true,
    });
    onClose();
  };

  // Safe early return ONLY after all hooks have been evaluated
  if (!isOpen || !student || !paper) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#222] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-[#202020] flex items-center justify-between bg-slate-50/50 dark:bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                Question Attempt & Evaluation Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {paper.title} • {paper.paper_code || "EXAM"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Profile & Quick Summary Bar */}
        <div className="px-6 py-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-emerald-500/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              {(student.name || student.student_name || "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {student.name || student.student_name || `Student #${student.id}`}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 ml-2">
                Roll: {student.roll_no || student.enrollment_no || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-zinc-500">
                Total Score
              </span>
              <div className="text-xs font-black text-slate-900 dark:text-white">
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black">
                  {totalScored}
                </span>{" "}
                / {maxMarks} ({percentage}%)
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                isPass
                  ? "bg-emerald-100 text-emerald-800 border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-800 border-rose-500/30 dark:bg-rose-950/50 dark:text-rose-300"
              }`}
            >
              {isPass ? "Passed" : "Needs Improvement"}
            </span>
          </div>
        </div>

        {/* Questions List */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {allQuestions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No individual questions configured in this examination paper blueprint.
            </div>
          ) : (
            allQuestions.map((q, idx) => {
              const qMarks = q.maxMarks !== undefined ? q.maxMarks : (q.max_marks || q.marks || 1);
              const currentScore = questionScores[q.id] !== undefined ? questionScores[q.id] : qMarks;
              const isMCQ = q.type === "mcq" || q.mode === "MCQ" || (q.options && q.options.length > 0) || q.option_a;
              const studentOpt = studentAnswers[q.id] || "A";
              const correctOpt = q.correct_option || "A";
              const isCorrectMCQ = isMCQ ? studentOpt === correctOpt : currentScore === qMarks;

              return (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-[#282828] bg-slate-50/50 dark:bg-[#181818] space-y-3"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center justify-center shrink-0">
                        Q{idx + 1}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-[#252525] text-slate-600 dark:text-zinc-400">
                        {q.sectionTitle}
                      </span>
                      {isMCQ && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                          MCQ
                        </span>
                      )}
                    </div>

                    {/* Marks Input / Awarded */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                        Marks:
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={qMarks}
                        step="0.5"
                        value={currentScore}
                        onChange={(e) => handleScoreChange(q.id, e.target.value, qMarks)}
                        className="w-14 px-2 py-1 text-center bg-white dark:bg-[#202020] border border-slate-300 dark:border-[#333] rounded-lg text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-400 font-bold">/ {qMarks}</span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed pl-8">
                    {q.question_text || q.question || "Question prompt"}
                  </p>

                  {/* MCQ Options Display & Selection */}
                  {isMCQ && (
                    <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {["A", "B", "C", "D"].map((optKey) => {
                        const optText = q[`option_${optKey.toLowerCase()}`] || q.options?.[optKey] || `Option ${optKey}`;
                        const isSelected = studentOpt === optKey;
                        const isCorrect = correctOpt === optKey;

                        return (
                          <button
                            key={optKey}
                            type="button"
                            onClick={() => handleOptionChange(q.id, optKey, correctOpt, qMarks)}
                            className={`p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between border cursor-pointer ${
                              isSelected
                                ? isCorrect
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold"
                                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-bold"
                                : isCorrect
                                ? "bg-emerald-50/30 border-dashed border-emerald-400/50 text-slate-700 dark:text-zinc-300"
                                : "bg-white dark:bg-[#202020] border-slate-200 dark:border-[#2e2e2e] text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                            }`}
                          >
                            <span className="truncate pr-1">
                              <strong>{optKey}.</strong> {optText}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-black shrink-0 ml-1">
                                {isCorrect ? "✓ Selected (Correct)" : "✗ Selected"}
                              </span>
                            )}
                            {!isSelected && isCorrect && (
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                                (Key)
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#202020] bg-slate-50/50 dark:bg-[#181818] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            Changes will automatically update the student&apos;s score and sync to their report card.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Sync Marks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ExamStudentAttemptModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.object,
  paper: PropTypes.object,
  studentAttempt: PropTypes.object,
  onSaveAttempt: PropTypes.func.isRequired,
};

export default ExamStudentAttemptModal;
