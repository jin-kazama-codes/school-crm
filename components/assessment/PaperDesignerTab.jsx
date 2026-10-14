import React, { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import {
  Plus,
  Save,
  Trash2,
  Edit2,
  FileText,
  Printer,
  Sparkles,
  Clock,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Eye,
  Send,
  AlertCircle,
  RotateCcw,
  Info,
  Check
} from "lucide-react";

import PaperQuestionPickerModal from "./PaperQuestionPickerModal";
import PaperPrintPreviewModal from "./PaperPrintPreviewModal";

const DEFAULT_INSTRUCTIONS = `1. All questions are compulsory unless specified otherwise.
2. Read each question carefully before attempting.
3. Write answers in neat, legible handwriting with question numbers clearly marked.
4. Marks for questions are indicated against each item.`;

const PaperDesignerTab = ({
  classId,
  sectionId,
  className = "",
  sectionName = "",
  filteredSubjects = [],
  allBankQuestions = [],
  designedPapers = [],
  loadingPapers = false,
  onSavePaper,
  onDeletePaper,
  onPublishPaper,
  schoolName = "",
}) => {
  const formRef = useRef(null);

  // Current designer state
  const [editingPaperId, setEditingPaperId] = useState(null);
  const [paperTitle, setPaperTitle] = useState("");
  const [paperCode, setPaperCode] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passingMarks, setPassingMarks] = useState(33);
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [sections, setSections] = useState([
    {
      id: "sec-1",
      title: "Section A: Multiple Choice Questions (MCQs)",
      type: "MCQ",
      instructions: "Attempt all questions. Each carries equal marks.",
      targetCount: 10,
      questions: [],
    },
    {
      id: "sec-2",
      title: "Section B: Descriptive & Short Answer Questions",
      type: "DESC",
      instructions: "Answer all questions in brief with required steps/points.",
      targetCount: 5,
      questions: [],
    },
  ]);

  // Active Picker Modal State
  const [activePickerSectionId, setActivePickerSectionId] = useState(null);

  // Active Preview Modal State
  const [previewPaperObj, setPreviewPaperObj] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Auto-generate paper code generator
  const generatePaperCode = (subId = selectedSubjectId) => {
    const year = new Date().getFullYear();
    const subCode = filteredSubjects.find((s) => String(s.id) === String(subId))?.name?.substring(0, 4)?.toUpperCase() || "SUB";
    return `PAPER-${year}-C${classId || "1"}-S${sectionId || "1"}-${subCode}`;
  };

  // Set default subject and auto-generate code
  useEffect(() => {
    if (filteredSubjects.length > 0 && !selectedSubjectId && !editingPaperId) {
      const firstId = String(filteredSubjects[0].id);
      setSelectedSubjectId(firstId);
      setPaperCode(generatePaperCode(firstId));
    }
  }, [filteredSubjects, selectedSubjectId, editingPaperId]);

  // Real-time total marks computation
  const totalCalculatedMarks = useMemo(() => {
    let sum = 0;
    sections.forEach((sec) => {
      (sec.questions || []).forEach((q) => {
        sum += parseFloat(String(q.max_marks || (q.mode === "MCQ" ? 1 : 5)));
      });
    });
    return sum;
  }, [sections]);

  const totalCalculatedQuestions = useMemo(() => {
    let count = 0;
    sections.forEach((sec) => {
      count += (sec.questions || []).length;
    });
    return count;
  }, [sections]);

  // Section Management
  const addSection = () => {
    const nextLetter = String.fromCharCode(65 + sections.length);
    const newSec = {
      id: `sec-${Date.now()}`,
      title: `Section ${nextLetter}: Descriptive Questions`,
      type: "DESC",
      instructions: "Answer all questions in this section.",
      targetCount: 5,
      questions: [],
    };
    setSections([...sections, newSec]);
  };

  const removeSection = (secId) => {
    if (sections.length <= 1) {
      alert("At least one section is required in an examination paper.");
      return;
    }
    setSections(sections.filter((s) => s.id !== secId));
  };

  const updateSectionField = (secId, field, val) => {
    setSections(
      sections.map((s) => (s.id === secId ? { ...s, [field]: val } : s))
    );
  };

  const removeQuestionFromSection = (secId, questionId) => {
    setSections(
      sections.map((sec) => {
        if (sec.id === secId) {
          return {
            ...sec,
            questions: sec.questions.filter((q) => String(q.id) !== String(questionId)),
          };
        }
        return sec;
      })
    );
  };

  // Open Question Picker
  const handleOpenPicker = (secId) => {
    setActivePickerSectionId(secId);
  };

  const activePickerSection = sections.find((s) => s.id === activePickerSectionId);

  const handleApplyQuestions = (selectedQuestions) => {
    if (!activePickerSectionId) return;
    setSections(
      sections.map((sec) => {
        if (sec.id === activePickerSectionId) {
          return {
            ...sec,
            questions: selectedQuestions,
          };
        }
        return sec;
      })
    );
    setActivePickerSectionId(null);
  };

  // Load existing paper into designer with smooth scroll and indicator
  const handleEditPaper = (paper) => {
    setEditingPaperId(paper.id);
    setPaperTitle(paper.title || "");
    setPaperCode(paper.paper_code || "");
    setSelectedSubjectId(paper.subject_id ? String(paper.subject_id) : "");
    setDurationMinutes(paper.duration_minutes || 60);
    setPassingMarks(paper.passing_marks || 33);
    setInstructions(paper.instructions || DEFAULT_INSTRUCTIONS);
    try {
      if (typeof paper.sections_json === "string") {
        setSections(JSON.parse(paper.sections_json));
      } else if (Array.isArray(paper.sections)) {
        setSections(paper.sections);
      }
    } catch (e) {
      console.warn("Could not parse sections_json:", e);
    }

    setValidationError("");

    // Scroll smoothly to top of form
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 60);
  };

  // Reset designer form to create new paper
  const handleResetForm = () => {
    setEditingPaperId(null);
    setPaperTitle("");
    const subId = filteredSubjects[0]?.id ? String(filteredSubjects[0].id) : "";
    setSelectedSubjectId(subId);
    setPaperCode(generatePaperCode(subId));
    setDurationMinutes(60);
    setPassingMarks(33);
    setInstructions(DEFAULT_INSTRUCTIONS);
    setSections([
      {
        id: "sec-1",
        title: "Section A: Multiple Choice Questions (MCQs)",
        type: "MCQ",
        instructions: "Attempt all questions. Each carries equal marks.",
        targetCount: 10,
        questions: [],
      },
      {
        id: "sec-2",
        title: "Section B: Descriptive & Short Answer Questions",
        type: "DESC",
        instructions: "Answer all questions in brief with required steps/points.",
        targetCount: 5,
        questions: [],
      },
    ]);
    setValidationError("");
  };

  // Submit Paper with Comprehensive Validation
  const handleSubmitPaper = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!paperTitle.trim()) {
      setValidationError("Please enter an Exam Paper Title (e.g. Mid-Term Examination 2026).");
      return;
    }
    if (paperTitle.trim().length < 3) {
      setValidationError("Exam Paper Title must be at least 3 characters long.");
      return;
    }
    if (!selectedSubjectId) {
      setValidationError("Please select a Subject for this examination paper.");
      return;
    }
    if (!paperCode.trim()) {
      setValidationError("Paper Code cannot be empty. Click 'Regenerate' or type a custom code.");
      return;
    }
    if (!durationMinutes || Number(durationMinutes) < 15 || Number(durationMinutes) > 360) {
      setValidationError("Duration must be between 15 and 360 minutes.");
      return;
    }
    if (passingMarks === "" || Number(passingMarks) < 1 || Number(passingMarks) > 100) {
      setValidationError("Passing marks percentage must be between 1% and 100%.");
      return;
    }
    if (!sections || sections.length === 0) {
      setValidationError("At least one examination section is required.");
      return;
    }

    // Check each section has a title and questions
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (!sec.title || !sec.title.trim()) {
        setValidationError(`Section ${i + 1} is missing a title. Please provide a title.`);
        return;
      }
      if (!sec.questions || sec.questions.length === 0) {
        setValidationError(`Section "${sec.title}" has no questions selected. Please click "Pick Questions from Bank" to add questions.`);
        return;
      }
    }

    if (totalCalculatedQuestions === 0) {
      setValidationError("Please add at least one question to your sections before saving.");
      return;
    }

    const payload = {
      id: editingPaperId || undefined,
      school_id: undefined, // Handled automatically by server
      class_id: classId ? parseInt(String(classId), 10) : null,
      section_id: sectionId ? parseInt(String(sectionId), 10) : null,
      subject_id: parseInt(String(selectedSubjectId), 10),
      title: paperTitle.trim(),
      paper_code: paperCode.trim(),
      duration_minutes: parseInt(String(durationMinutes), 10) || 60,
      max_marks: totalCalculatedMarks || 100,
      passing_marks: parseFloat(String(passingMarks)) || 33,
      instructions: instructions.trim(),
      sections_json: JSON.stringify(sections),
      status: "draft",
    };

    setSaving(true);
    await onSavePaper(payload);
    setSaving(false);
    handleResetForm();
  };

  const selectedSubjectName = filteredSubjects.find((s) => String(s.id) === String(selectedSubjectId))?.name || "";

  if (!classId || !sectionId) {
    return (
      <div className="min-h-[340px] flex flex-col items-center justify-center gap-3.5 bg-white dark:bg-[#141414] border border-dashed border-slate-300 dark:border-[#282828] rounded-3xl p-10 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Layers className="w-7 h-7" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Please Select Class & Section First
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Choose a target Class and Section from the top dropdown menu to design and configure examination papers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Paper Designer Shell Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmitPaper}
        className={`bg-white dark:bg-[#141414] border rounded-3xl p-6 shadow-sm space-y-6 transition-all duration-300 ${editingPaperId
            ? "border-amber-500/60 ring-2 ring-amber-500/20 shadow-amber-950/5"
            : "border-slate-200/80 dark:border-[#222]"
          }`}
      >
        {/* Active Editing Indicator Banner */}
        {editingPaperId && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-sm flex items-center justify-center shrink-0">
                <Edit2 className="w-4 h-4 animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-mono border border-amber-400/40">
                    {paperCode || "EDITING DRAFT"}
                  </span>
                  <span className="text-xs font-black text-amber-950 dark:text-amber-100">
                    Editing Mode Active
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  You are editing &ldquo;<strong>{paperTitle || "this examination paper"}</strong>&rdquo;. Changes will update the saved draft upon clicking Save below.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetForm}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#202020] hover:bg-amber-50 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
              title="Exit editing mode and switch to creating a brand new paper"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel &amp; Create New</span>
            </button>
          </div>
        )}

        {/* Header Title with Live Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-[#202020]">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`p-1.5 rounded-lg ${editingPaperId
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                  }`}
              >
                {editingPaperId ? <Edit2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </span>
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>{editingPaperId ? "Edit Examination Paper" : "Design New Examination Paper"}</span>
                {editingPaperId && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/20">
                    Modifying Existing
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Assemble questions into structured sections, preview printable layouts, and prepare for student examination.
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-3">
            <div
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2e2e2e] flex flex-col items-center"
              title="Total calculated marks summed from all selected section questions"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Total Marks
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {totalCalculatedMarks}
              </span>
            </div>
            <div
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2e2e2e] flex flex-col items-center"
              title="Total number of questions chosen in this paper"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Questions
              </span>
              <span className="text-sm font-black text-teal-600 dark:text-teal-400">
                {totalCalculatedQuestions}
              </span>
            </div>
            <div
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2e2e2e] flex flex-col items-center"
              title="Total sections configured in this paper"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Sections
              </span>
              <span className="text-sm font-black text-slate-800 dark:text-white">
                {sections.length}
              </span>
            </div>
          </div>
        </div>

        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* ROW 1: Paper Title, Subject, Paper Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Title */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
              Paper Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Half Yearly Examination 2026"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              required
              title="Official title of the examination (e.g. Mid-Term Assessment 2026)"
            />
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              Official title printed at the top of the question paper
            </p>
          </div>

          {/* 2. Subject */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
              Subject <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                if (!editingPaperId) {
                  setPaperCode(generatePaperCode(e.target.value));
                }
              }}
              className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
              required
              title="Select the subject for which this examination paper is being designed"
            >
              <option value="">Select Subject</option>
              {filteredSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              Questions from bank will be filtered for this subject
            </p>
          </div>

          {/* 3. Paper Code */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                Paper Code
              </label>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Click refresh to regenerate
              </span>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={paperCode}
                onChange={(e) => setPaperCode(e.target.value)}
                placeholder="e.g. PAPER-2026-C1-S1-MATH-101"
                title="Enter to modify the code"
                className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2e2e2e] rounded-xl pl-3.5 pr-9 py-2.5 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setPaperCode(generatePaperCode())}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1 cursor-pointer"
                title="Click here to regenerate code"
              >
                <RefreshCw className="w-3.5 h-3.5 hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              Unique exam identification code (hover to edit)
            </p>
          </div>
        </div>

        {/* ROW 2: Duration, Passing Marks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Duration */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
              Duration (Minutes) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="15"
                max="360"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-28 bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                title="Total exam time allowed for students in minutes"
              />
              <div className="flex items-center gap-1.5">
                {[45, 60, 90, 180].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${Number(durationMinutes) === mins
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 dark:bg-[#1f1f1f] text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-[#333] hover:bg-slate-100 dark:hover:bg-[#252525]"
                      }`}
                    title={`Quick set duration to ${mins} minutes`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              Total examination time allowed for students (15 to 360 mins)
            </p>
          </div>

          {/* Passing Marks */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
              Passing Marks (%) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={passingMarks}
              onChange={(e) => setPassingMarks(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              title="Minimum percentage score required to pass this examination"
            />
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              Minimum percentage benchmark required to pass (e.g. 33% or 40%)
            </p>
          </div>
        </div>

        {/* ROW 3: General Instructions */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
              General Instructions
            </label>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
              Appears in a dedicated instructions box at the top of the printed paper
            </span>
          </div>
          <textarea
            rows={4}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="1. All questions are compulsory unless specified otherwise...&#10;2. Read each question carefully before attempting..."
            className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2e2e2e] rounded-2xl p-3.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-y leading-relaxed font-mono"
            title="General examination instructions printed for students"
          />
        </div>

        {/* 2. Multi-Section Builder Section */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-[#202020]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Examination Paper Sections ({sections.length})</span>
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                Organize your paper into separate sections (e.g., Section A: MCQs, Section B: Short Answers).
              </p>
            </div>

            <button
              type="button"
              onClick={addSection}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#202020] hover:bg-slate-200 dark:hover:bg-[#282828] text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200/80 dark:border-[#333]"
              title="Click to add a new section to this examination paper"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Add New Section</span>
            </button>
          </div>

          {/* Section Cards */}
          <div className="space-y-5">
            {sections.map((sec, sIdx) => {
              const secMarks = (sec.questions || []).reduce(
                (sum, q) => sum + parseFloat(String(q.max_marks || (q.mode === "MCQ" ? 1 : 5))),
                0
              );

              return (
                <div
                  key={sec.id}
                  className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#191919] border border-slate-200/80 dark:border-[#282828] space-y-4"
                >
                  {/* Section Top Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => updateSectionField(sec.id, "title", e.target.value)}
                          placeholder="e.g. Section A: Objective Questions"
                          className="w-full bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#333] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          title="Section heading printed above question items"
                        />
                      </div>
                      <div>
                        <select
                          value={sec.type}
                          onChange={(e) => updateSectionField(sec.id, "type", e.target.value)}
                          className="w-full bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#333] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                          title="Type of questions in this section (MCQ or Descriptive)"
                        >
                          <option value="MCQ">MCQ (Multiple Choice Questions)</option>
                          <option value="DESC">Descriptive / Theory Questions</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-500/20"
                        title="Sum of marks for this section"
                      >
                        {secMarks} Marks
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSection(sec.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete this entire section from the paper"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Section Instructions */}
                  <div>
                    <input
                      type="text"
                      value={sec.instructions}
                      onChange={(e) => updateSectionField(sec.id, "instructions", e.target.value)}
                      placeholder="Section Instructions (e.g. Attempt all questions. Each carries equal marks.)"
                      className="w-full bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#333] rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-zinc-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      title="Specific instructions printed directly beneath the section header"
                    />
                  </div>

                  {/* Pick Questions CTA & List */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-[#2a2a2a]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Selected Questions ({sec.questions?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenPicker(sec.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Open question bank to pick questions for this section"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pick Questions from Bank</span>
                      </button>
                    </div>

                    {/* Section Question Items */}
                    {sec.questions && sec.questions.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {sec.questions.map((q, qIdx) => (
                          <div
                            key={q.id || qIdx}
                            className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#303030] flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-[#2c2c2c] text-slate-600 dark:text-zinc-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {qIdx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                  {q.question_text}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                  <span>{q.difficulty_level || "Medium"}</span>
                                  <span>•</span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {q.max_marks || (q.mode === "MCQ" ? 1 : 5)} Marks
                                  </span>
                                  {q.chapter && <span>• {q.chapter}</span>}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeQuestionFromSection(sec.id, q.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                              title="Remove this question from the section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-[#333] rounded-xl">
                        No questions added to this section yet. Click &quot;Pick Questions from Bank&quot; above.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Actions Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#202020] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Saved examination papers can be scheduled and published in Tab 3.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {editingPaperId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#333] text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#202020] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                title="Cancel editing and reset designer form to create new paper"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancel / New Paper</span>
              </button>
            )}

            {/* Live Preview Button before saving */}
            <button
              type="button"
              onClick={() => {
                const livePaper = {
                  id: editingPaperId || "preview",
                  class_id: classId,
                  section_id: sectionId,
                  subject_id: selectedSubjectId,
                  title: paperTitle.trim() || "Untitled Examination Paper",
                  paper_code: paperCode.trim() || "PAPER-DRAFT",
                  duration_minutes: parseInt(String(durationMinutes), 10) || 60,
                  max_marks: totalCalculatedMarks || 100,
                  passing_marks: parseFloat(String(passingMarks)) || 33,
                  instructions: instructions.trim(),
                  sections_json: JSON.stringify(sections),
                  sections: sections,
                  status: "draft",
                };
                setPreviewPaperObj(livePaper);
                setIsPreviewOpen(true);
              }}
              disabled={totalCalculatedQuestions === 0}
              title={
                totalCalculatedQuestions === 0
                  ? "Add questions to your sections first to preview this paper"
                  : "Preview and print the live examination paper layout before saving"
              }
              className={`px-4 sm:px-5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${totalCalculatedQuestions === 0
                  ? "border-slate-200 dark:border-[#2e2e2e] text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-60"
                  : "border-slate-200 dark:border-[#333] text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#202020] hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer shadow-xs bg-white dark:bg-[#1a1a1a]"
                }`}
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Preview &amp; Print Paper</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${editingPaperId
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-900/20"
                  : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-900/20"
                }`}
              title={editingPaperId ? "Save updates to this existing paper" : "Save and compile this new examination paper"}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Paper..." : editingPaperId ? "Update Examination Paper" : "Save Examination Paper"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 2. Designed Examination Papers Ledger */}
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#202020]">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Designed Examination Papers for {className} ({sectionName})</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              Review, edit, preview printable question papers, or proceed to Tab 3 for scheduling.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {designedPapers.length} Saved Papers
          </span>
        </div>

        {loadingPapers ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400">
            Loading designed examination papers...
          </div>
        ) : designedPapers.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              No examination papers created for {className} ({sectionName}) yet.
            </p>
            <p className="text-[11px] text-slate-400">
              Fill in the form above and click &quot;Save Examination Paper&quot; to build your first test paper.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {designedPapers.map((paper) => {
              const subObj = filteredSubjects.find((s) => String(s.id) === String(paper.subject_id));
              const isPub = paper.status === "published";
              const isCurrentlyEditing = paper.id === editingPaperId;

              return (
                <div
                  key={paper.id}
                  className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between transition-all ${isCurrentlyEditing
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-500 ring-2 ring-amber-500/30 shadow-md"
                      : "bg-slate-50/50 dark:bg-[#181818] border-slate-200/80 dark:border-[#282828]"
                    }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-[#2c2c2c] text-slate-700 dark:text-zinc-300 font-mono">
                          {paper.paper_code || "CODE-N/A"}
                        </span>
                        {isCurrentlyEditing && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-xs animate-pulse">
                            <Edit2 className="w-3 h-3" />
                            Active in Editor
                          </span>
                        )}
                      </div>

                      {isPub ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                          Draft
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                      {paper.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                      {subObj && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          {subObj.name}
                        </span>
                      )}
                      <span>•</span>
                      <span>{paper.duration_minutes || 60} Mins</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {paper.max_marks || 100} Marks
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-200/60 dark:border-[#282828] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewPaperObj(paper);
                        setIsPreviewOpen(true);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 flex items-center gap-1.5 cursor-pointer"
                      title="Open printable examination paper preview"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / Preview</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditPaper(paper)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isCurrentlyEditing
                            ? "bg-amber-500 text-white shadow-xs"
                            : "hover:bg-slate-200 dark:hover:bg-[#282828] text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                          }`}
                        title="Edit this examination paper"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePaper(paper.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete this examination paper"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Question Picker Modal */}
      {activePickerSection && (
        <PaperQuestionPickerModal
          isOpen={Boolean(activePickerSectionId)}
          onClose={() => setActivePickerSectionId(null)}
          sectionTitle={activePickerSection.title}
          sectionType={activePickerSection.type}
          subjectId={selectedSubjectId}
          subjectName={selectedSubjectName}
          allBankQuestions={allBankQuestions}
          alreadySelectedIds={(activePickerSection.questions || []).map((q) => String(q.id))}
          onConfirmSelection={handleApplyQuestions}
        />
      )}

      {/* Print Preview Modal */}
      <PaperPrintPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        paper={previewPaperObj}
        schoolName={schoolName}
        className={className}
        sectionName={sectionName}
        subjectName={selectedSubjectName}
      />
    </div>
  );
};

PaperDesignerTab.propTypes = {
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sectionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  sectionName: PropTypes.string,
  filteredSubjects: PropTypes.array,
  allBankQuestions: PropTypes.array,
  designedPapers: PropTypes.array,
  loadingPapers: PropTypes.bool,
  onSavePaper: PropTypes.func.isRequired,
  onDeletePaper: PropTypes.func.isRequired,
  onPublishPaper: PropTypes.func,
  schoolName: PropTypes.string,
};

export default PaperDesignerTab;
