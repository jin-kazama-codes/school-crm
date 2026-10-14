import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import {
  FileText,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  User,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  BarChart2,
  Check,
  ChevronRight,
  Layers,
  BookOpen,
  ArrowRight,
  Loader2
} from "lucide-react";

import API from "../../apis";
import ExamStudentAttemptModal from "./ExamStudentAttemptModal";
import { Utility } from "../utility";

const ExamPapersLedgerTab = ({
  classId,
  sectionId,
  className = "",
  sectionName = "",
  classList = [],
  sectionList = [],
  onClassChange,
  onSectionChange,
  onViewReportCard,
}) => {
  const dispatch = useDispatch();
  const allSubjects = useSelector((state) => state.allSubjects);

  const [papers, setPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Evaluations state: { [studentId]: { totalScored, questionScores, studentAnswers, evaluated } }
  const [evaluations, setEvaluations] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle' | 'synced' | 'saving'

  // Attempt breakdown modal
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);
  const [selectedStudentForAttempt, setSelectedStudentForAttempt] = useState(null);

  const { capitalizeEveryWord, getLocalStorage } = Utility();
  const authInfo = getLocalStorage("auth") || {};

  // ─── 1. Fetch Exam Papers for Selected Class & Section ─────────────────────
  const fetchPapers = useCallback(async () => {
    if (!classId || !sectionId) {
      setPapers([]);
      setSelectedPaper(null);
      return;
    }
    setLoadingPapers(true);
    try {
      const response = await API.AssessmentAPI.getAllPapers(
        { classId, sectionId },
        0,
        50
      );
      const list = response?.data?.rows || response?.data || response?.listData?.rows || [];
      setPapers(list);
      // Auto-select first paper if none selected or previous no longer in list
      if (list.length > 0) {
        setSelectedPaper((prev) => {
          if (prev && list.some((p) => p.id === prev.id)) {
            return list.find((p) => p.id === prev.id);
          }
          return list[0];
        });
      } else {
        setSelectedPaper(null);
      }
    } catch (e) {
      setPapers([]);
      setSelectedPaper(null);
    } finally {
      setLoadingPapers(false);
    }
  }, [classId, sectionId]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // ─── 2. Fetch Students for Selected Class & Section ─────────────────────────
  const fetchStudents = useCallback(async () => {
    if (!classId || !sectionId) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    try {
      const response = await API.StudentAPI.getAll(
        { classId, sectionId },
        0,
        100
      );
      const list = response?.data?.rows || response?.data || response?.listData?.rows || [];
      setStudents(list);
    } catch (e) {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [classId, sectionId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ─── 3. Load Evaluations Cache from LocalStorage ───────────────────────────
  useEffect(() => {
    if (!selectedPaper?.id) {
      setEvaluations({});
      return;
    }
    try {
      const storageKey = `exam_ledger_${selectedPaper.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setEvaluations(JSON.parse(saved));
      } else {
        // Initialize defaults
        setEvaluations({});
      }
    } catch (e) {
      setEvaluations({});
    }
  }, [selectedPaper?.id]);

  // Save evaluations to localStorage whenever updated
  const persistEvaluations = (newEvals) => {
    setEvaluations(newEvals);
    if (selectedPaper?.id) {
      try {
        localStorage.setItem(`exam_ledger_${selectedPaper.id}`, JSON.stringify(newEvals));
      } catch (e) {}
    }
  };

  // ─── 4. Live Real-Time Auto-Sync to Marksheet ──────────────────────────────
  const syncStudentToMarksheet = async (studentId, score) => {
    if (!selectedPaper || !studentId) return;
    setSyncStatus("saving");
    try {
      const numScore = parseFloat(score) || 0;
      // Payload mimicking Marksheet subject mapping
      const session = selectedPaper.academic_year || "2026-2027";
      const subjectId = selectedPaper.subject_id;
      const student = students.find((s) => s.id === studentId);

      // 1. Fetch student's marksheet to find if existing
      const existingRes = await API.MarksheetAPI.getAll(
        { student: studentId, session },
        0,
        10
      ).catch(() => ({ data: { rows: [] } }));

      const existingMarksheet = existingRes?.data?.rows?.[0];

      if (existingMarksheet?.id) {
        // Update marksheet subject mapping
        await API.MarksheetAPI.insertIntoMappingTable({
          marksheet_id: existingMarksheet.id,
          subject_id: subjectId,
          marks_obtained: numScore,
          max_marks: selectedPaper.max_marks || 100,
          passing_marks: selectedPaper.passing_marks || 33,
        }).catch(() => {});
      }

      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 2500);
    } catch (e) {
      setSyncStatus("idle");
    }
  };

  // Handle score change directly from table
  const handleScoreChange = (studentId, rawValue) => {
    const maxMarks = selectedPaper?.max_marks || 100;
    let score = parseFloat(rawValue);
    if (isNaN(score)) score = 0;
    score = Math.max(0, Math.min(score, maxMarks));

    const updated = {
      ...evaluations,
      [studentId]: {
        ...(evaluations[studentId] || {}),
        totalScored: score,
        evaluated: true,
      },
    };
    persistEvaluations(updated);

    // Trigger live real-time auto-sync to Marksheet
    syncStudentToMarksheet(studentId, score);
  };

  // Handle save from Question Attempt modal
  const handleSaveAttempt = (attemptData) => {
    const { studentId, totalScored } = attemptData;
    const updated = {
      ...evaluations,
      [studentId]: attemptData,
    };
    persistEvaluations(updated);
    syncStudentToMarksheet(studentId, totalScored);
  };

  // Batch sync all evaluated students
  const handleBatchSyncAll = async () => {
    setIsSaving(true);
    setSyncStatus("saving");
    for (const student of students) {
      const evalData = evaluations[student.id];
      if (evalData && evalData.totalScored !== undefined) {
        await syncStudentToMarksheet(student.id, evalData.totalScored);
      }
    }
    setIsSaving(false);
    setSyncStatus("synced");
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter((s) => {
      const name = (s.name || s.student_name || "").toLowerCase();
      const roll = String(s.roll_no || s.enrollment_no || s.id || "");
      return name.includes(q) || roll.includes(q);
    });
  }, [students, searchQuery]);

  // Metrics
  const maxMarks = selectedPaper?.max_marks || 100;
  const passingMarks = selectedPaper?.passing_marks || 33;
  const totalStudentsCount = students.length;

  const evaluatedCount = useMemo(() => {
    return Object.values(evaluations).filter((ev) => ev?.evaluated && ev?.totalScored !== undefined).length;
  }, [evaluations]);

  const classAvgScore = useMemo(() => {
    const evaluatedScores = Object.values(evaluations)
      .map((ev) => ev?.totalScored)
      .filter((sc) => sc !== undefined && sc !== null);
    if (evaluatedScores.length === 0) return 0;
    const sum = evaluatedScores.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
    return (sum / evaluatedScores.length).toFixed(1);
  }, [evaluations]);

  const classAvgPercentage = useMemo(() => {
    if (!maxMarks || maxMarks <= 0) return 0;
    return ((classAvgScore / maxMarks) * 100).toFixed(1);
  }, [classAvgScore, maxMarks]);

  const passCount = useMemo(() => {
    return Object.values(evaluations).filter((ev) => (parseFloat(ev?.totalScored) || 0) >= passingMarks).length;
  }, [evaluations, passingMarks]);

  const passRate = evaluatedCount > 0 ? ((passCount / evaluatedCount) * 100).toFixed(0) : 0;

  const getSubjectName = (subId) => {
    return allSubjects?.listData?.find((s) => String(s.id) === String(subId))?.name || "Subject";
  };

  return (
    <div className="space-y-6">
      {!classId || !sectionId ? (
        <div className="bg-white dark:bg-[#141414] border border-dashed border-slate-200 dark:border-[#2a2a2a] rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-black text-slate-800 dark:text-white">
            Select Class & Section to Load Examination Papers
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Choose the target Class and Section from the top header above to review test blueprints, evaluate student answer sheets, and sync marks to transcripts.
          </p>
        </div>
      ) : (
        <>
          {/* ─── ACTIVE EXAMINATION PAPERS ─── */}
          <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                    Active Examination Papers ({papers.length})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Select an examination paper to load its student evaluation ledger.
                  </p>
                </div>
              </div>
            </div>

        {loadingPapers ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading examination papers...</span>
          </div>
        ) : papers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-[#2a2a2a] rounded-2xl p-6">
            No examination papers created for this class & section yet. Design a paper in{" "}
            <strong>Exams & Question Bank (Tab 2)</strong> to start evaluations.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {papers.map((p) => {
              const isSelected = selectedPaper?.id === p.id;
              const subName = getSubjectName(p.subject_id);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPaper(p)}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md ring-2 ring-emerald-500/30"
                      : "bg-slate-50/70 hover:bg-slate-100/90 dark:bg-[#181818] dark:hover:bg-[#202020] border-slate-200/80 dark:border-[#282828] text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-700"
                            : "bg-slate-200/70 dark:bg-[#252525] text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        {subName}
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] font-bold text-emerald-400 dark:text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Click to Select</span>
                      )}
                    </div>
                    <h5 className="text-xs font-black truncate">{p.title}</h5>
                    <p className="text-[10px] font-mono opacity-60">Code: {p.paper_code || "N/A"}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-black/10 text-[11px] font-medium opacity-80 w-full">
                    <span>
                      Duration: <strong>{p.duration_minutes || 60}m</strong>
                    </span>
                    <span>
                      Max: <strong>{p.max_marks || 100}</strong>
                    </span>
                    <span>
                      Pass: <strong>{p.passing_marks || 33}</strong>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── STEP 3: EVALUATED STUDENTS RESULTS & THEORY LEDGER ─── */}
      {selectedPaper && (
        <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-5 shadow-xs space-y-5">
          {/* Header & Metrics */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#202020]">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <span>Student Results & Evaluation Ledger</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {selectedPaper.title}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Enter student marks directly in the ledger, inspect question-level breakdown, and auto-sync to official Marksheets.
                </p>
              </div>
            </div>

            {/* Live Sync Status & Batch Sync Action */}
            <div className="flex items-center gap-3">
              {syncStatus === "saving" && (
                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Syncing to Marksheet...
                </span>
              )}
              {syncStatus === "synced" && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced to Marksheet!
                </span>
              )}

              <button
                type="button"
                onClick={handleBatchSyncAll}
                disabled={isSaving || students.length === 0}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Sync All to Marksheet</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#282828] space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Students</span>
              <p className="text-xl font-black text-slate-900 dark:text-white">{totalStudentsCount}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#282828] space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                Evaluated
              </span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {evaluatedCount} / {totalStudentsCount}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#282828] space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400">
                Class Average
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {classAvgScore} <span className="text-xs text-slate-400">({classAvgPercentage}%)</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#282828] space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400">
                Pass Rate
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white">{passRate}%</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#282828] rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Table */}
          {loadingStudents ? (
            <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading students...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No students found for this class and section.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-[#282828]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#181818] text-slate-500 dark:text-zinc-400 text-[10.5px] uppercase font-extrabold border-b border-slate-200/80 dark:border-[#282828]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Evaluation Status</th>
                    <th className="py-3 px-4 text-center">Marks Scored</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Result</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#252525]">
                  {filteredStudents.map((st) => {
                    const evalData = evaluations[st.id] || {};
                    const isEvaluated = evalData.evaluated && evalData.totalScored !== undefined;
                    const score = evalData.totalScored !== undefined ? evalData.totalScored : "";
                    const pct = score !== "" && maxMarks > 0 ? ((parseFloat(score) / maxMarks) * 100).toFixed(1) : 0;
                    const isPass = parseFloat(score) >= passingMarks;

                    return (
                      <tr
                        key={st.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-[#181818] transition-colors"
                      >
                        {/* Student Name & Roll */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#202020] text-slate-600 dark:text-zinc-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {(st.name || st.student_name || "S").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                                {st.name || st.student_name || `Student #${st.id}`}
                              </span>
                              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                                Roll: {st.roll_no || st.enrollment_no || `#${st.id}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {isEvaluated ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              <Check className="w-3 h-3" /> Evaluated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#202020] text-slate-500 dark:text-zinc-400">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Marks Scored Input */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max={maxMarks}
                              step="0.5"
                              value={score}
                              placeholder="0"
                              onChange={(e) => handleScoreChange(st.id, e.target.value)}
                              className="w-16 px-2.5 py-1 text-center bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#333] rounded-lg text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              title="Enter scored marks (changes auto-sync to Marksheet)"
                            />
                            <span className="text-xs font-bold text-slate-400">/ {maxMarks}</span>
                          </div>
                        </td>

                        {/* Percentage */}
                        <td className="py-3 px-4 text-center">
                          <span className="font-black text-slate-800 dark:text-zinc-200">
                            {score !== "" ? `${pct}%` : "—"}
                          </span>
                        </td>

                        {/* Result Badge */}
                        <td className="py-3 px-4 text-center">
                          {score !== "" ? (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                isPass
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-rose-50 text-rose-700 border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300"
                              }`}
                            >
                              {isPass ? "Passed" : "Needs Imp."}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentForAttempt(st);
                                setIsAttemptModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              title="View and edit question-by-question attempts"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Breakdown</span>
                            </button>

                            {onViewReportCard && (
                              <button
                                type="button"
                                onClick={() => onViewReportCard(st)}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="View cumulative report card"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </>
    )}

      {/* Attempt Breakdown Modal */}
      {isAttemptModalOpen && selectedStudentForAttempt && selectedPaper && (
        <ExamStudentAttemptModal
          isOpen={isAttemptModalOpen}
          onClose={() => {
            setIsAttemptModalOpen(false);
            setSelectedStudentForAttempt(null);
          }}
          student={selectedStudentForAttempt}
          paper={selectedPaper}
          studentAttempt={evaluations[selectedStudentForAttempt.id]}
          onSaveAttempt={handleSaveAttempt}
        />
      )}
    </div>
  );
};

ExamPapersLedgerTab.propTypes = {
  classId: PropTypes.any,
  sectionId: PropTypes.any,
  className: PropTypes.string,
  sectionName: PropTypes.string,
  classList: PropTypes.array,
  sectionList: PropTypes.array,
  onClassChange: PropTypes.func,
  onSectionChange: PropTypes.func,
  onViewReportCard: PropTypes.func,
};

export default ExamPapersLedgerTab;
