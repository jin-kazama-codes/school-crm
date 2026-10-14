import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import {
  HelpCircle,
  Sparkles,
  BookOpen,
  Layers,
  Send,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  Printer,
  ChevronDown,
  Lock
} from "lucide-react";

import API from "../../apis";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setQuestions, setExamPapers } from "../../redux/actions/AssessmentAction";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { Utility } from "../utility";
import QuestionBankTab from "./QuestionBankTab";
import QuestionModal from "./QuestionModal";
import PaperDesignerTab from "./PaperDesignerTab";
import PublishTab from "./PublishTab";

const ListingComponent = ({ rolePriority = null }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMenuItem("Exams & Question Bank"));
  }, [dispatch]);
  const {
    getLocalStorage,
    fetchAndSetAll,
    fetchAndSetSchoolData,
    findMultipleById,
    appendSuffix,
    capitalizeEveryWord,
  } = Utility();

  const authInfo = getLocalStorage("auth") || {};
  const schoolInfo = getLocalStorage("schoolInfo") || {};
  const schoolName = schoolInfo?.name || schoolInfo?.school_name || authInfo?.school || "Delhi Public School";

  // Redux Data Stores
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const allClasses = useSelector((state) => state.allClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const allSections = useSelector((state) => state.allSections);
  const allSubjects = useSelector((state) => state.allSubjects);
  const questionsStore = useSelector((state) => state.allQuestions);
  const examPapersStore = useSelector((state) => state.allExamPapers);

  // Local State
  const [activeTab, setActiveTab] = useState(rolePriority === 6 ? "publish" : "bank"); // 'bank' | 'design' | 'publish'
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [classData, setClassData] = useState([]);

  // Question Bank pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingPapers, setLoadingPapers] = useState(false);

  // Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  // Notification Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // 1. Initial Load of Master Data (Classes, Sections, Subjects, School Data)
  useEffect(() => {
    if (!allClasses?.listData?.length) {
      fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
    }
    if (!allSections?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSections, API.SectionAPI);
    }
    if (!allSubjects?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
    }
    if (getLocalStorage("schoolInfo") && (!schoolClasses?.listData?.length || !classData?.length)) {
      fetchAndSetSchoolData(
        dispatch,
        setSchoolClasses,
        setSchoolSections,
        (data) => setClassData(data)
      );
    }
  }, [dispatch]);

  // Pre-populate student class and section for student portal (rolePriority === 6)
  useEffect(() => {
    if (rolePriority === 6) {
      setActiveTab("publish");
      const auth = getLocalStorage("auth");
      const sClass = auth?.student?.class;
      const sSection = auth?.student?.section;
      if (sClass && !selectedClass) {
        setSelectedClass(String(sClass));
      }
      if (sSection && !selectedSection) {
        setSelectedSection(String(sSection));
      }
    }
  }, [rolePriority]);

  // Fetch school class data mapping directly if needed
  useEffect(() => {
    if (classData.length === 0) {
      API.SchoolAPI.getSchoolClasses()
        .then((res) => {
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.rows) ? res.data.rows : []);
          if (list.length > 0) {
            setClassData(list);
          }
        })
        .catch(() => { });
    }
  }, [classData.length]);

  // Deduplicated Class List
  const classList = useMemo(() => {
    const raw = (schoolClasses?.listData?.length ? schoolClasses.listData : allClasses?.listData) || [];
    const seen = new Set();
    const list = [];
    raw.forEach((item) => {
      const id = item?.class_id ?? item?.id;
      const rawName = item?.class_name ?? item?.name ?? "";
      if (id !== undefined && id !== null && !seen.has(String(id))) {
        seen.add(String(id));
        const formattedName =
          !isNaN(Number(rawName)) && rawName !== ""
            ? `Class ${appendSuffix(rawName)}`
            : rawName.toLowerCase().startsWith("class")
              ? capitalizeEveryWord(rawName)
              : `Class ${capitalizeEveryWord(rawName)}`;
        list.push({ id: Number(id), name: formattedName || `Class ${id}` });
      }
    });
    return list;
  }, [schoolClasses?.listData, allClasses?.listData]);

  // Dynamic Section List matching class
  const sectionList = useMemo(() => {
    if (selectedClass && classData?.length) {
      const classSections = classData.filter((obj) => String(obj.class_id) === String(selectedClass));
      if (classSections.length > 0) {
        const seen = new Set();
        const list = [];
        classSections.forEach((item) => {
          const id = item?.section_id ?? item?.id;
          const rawName = item?.section_name ?? item?.name ?? "";
          if (id !== undefined && id !== null && !seen.has(String(id))) {
            seen.add(String(id));
            const formattedName = rawName
              ? rawName.toLowerCase().startsWith("sec")
                ? capitalizeEveryWord(rawName)
                : `Section ${capitalizeEveryWord(rawName)}`
              : `Section ${id}`;
            list.push({ id: Number(id), name: formattedName });
          }
        });
        if (list.length > 0) return list;
      }
    }
    const raw = (schoolSections?.listData?.length ? schoolSections.listData : allSections?.listData) || [];
    const seen = new Set();
    const list = [];
    raw.forEach((item) => {
      const id = item?.section_id ?? item?.id;
      const rawName = item?.section_name ?? item?.name ?? "";
      if (id !== undefined && id !== null && !seen.has(String(id))) {
        seen.add(String(id));
        const formattedName = rawName
          ? rawName.toLowerCase().startsWith("sec")
            ? capitalizeEveryWord(rawName)
            : `Section ${capitalizeEveryWord(rawName)}`
          : `Section ${id}`;
        list.push({ id: Number(id), name: formattedName });
      }
    });
    return list;
  }, [selectedClass, classData, schoolSections?.listData, allSections?.listData]);

  // Filtered Subjects for selected Class & Section
  const filteredSubjects = useMemo(() => {
    if (!selectedClass || !classData?.length || !allSubjects?.listData?.length) {
      return allSubjects?.listData || [];
    }
    const matchingRow = classData.find(
      (obj) =>
        String(obj.class_id) === String(selectedClass) &&
        (selectedSection ? String(obj.section_id) === String(selectedSection) : true)
    );
    if (matchingRow?.subject_ids) {
      const matched = findMultipleById(String(matchingRow.subject_ids), allSubjects.listData);
      if (matched.length > 0) return matched;
    }
    const classRows = classData.filter((obj) => String(obj.class_id) === String(selectedClass));
    const allSubjectIdSet = new Set();
    classRows.forEach((row) => {
      if (row.subject_ids) {
        String(row.subject_ids)
          .split(",")
          .forEach((idStr) => {
            const trimmed = idStr.trim();
            if (trimmed) allSubjectIdSet.add(trimmed);
          });
      }
    });
    if (allSubjectIdSet.size > 0) {
      return allSubjects.listData.filter((sub) => allSubjectIdSet.has(String(sub.id)));
    }
    return allSubjects.listData;
  }, [selectedClass, selectedSection, classData, allSubjects?.listData, findMultipleById]);

  // Reset section when class changes
  useEffect(() => {
    setSelectedSection("");
  }, [selectedClass]);

  // ─── Fetch Question Bank ──────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    if (!selectedClass) {
      dispatch(setQuestions({ listData: [], count: 0 }));
      return;
    }
    setLoadingQuestions(true);
    try {
      const conditionObj = {
        class_id: selectedClass,
      };
      if (selectedSection) conditionObj.section_id = selectedSection;
      if (selectedSubjectFilter) conditionObj.subject_id = selectedSubjectFilter;

      const res = await API.AssessmentAPI.getAllQuestions(
        conditionObj,
        page,
        pageSize,
        searchQuery
      );

      if (res?.status === "Success" || res?.status === 200 || res?.data) {
        const payload = res.data || res;
        dispatch(setQuestions(payload));
      } else {
        dispatch(setQuestions({ listData: [], count: 0 }));
      }
    } catch (e) {
      console.warn("Error fetching questions:", e);
      dispatch(setQuestions({ listData: [], count: 0 }));
    } finally {
      setLoadingQuestions(false);
    }
  }, [selectedClass, selectedSection, selectedSubjectFilter, page, pageSize, searchQuery, dispatch]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // ─── Save / Update Question Handler ───────────────────────────────────────
  const handleSaveQuestion = async (payload) => {
    setModalSaving(true);
    try {
      if (payload.id) {
        // Update
        const res = await API.AssessmentAPI.updateQuestion(payload);
        if (res?.data?.status === "Success" || res?.status === 200) {
          showToast("Question updated successfully!", "success");
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
          fetchQuestions();
        } else {
          showToast(res?.data?.msg || "Failed to update question", "error");
        }
      } else {
        // Create
        const res = await API.AssessmentAPI.createQuestion(payload);
        if (res?.data?.status === "Success" || res?.status === 200) {
          showToast("Question added to bank successfully!", "success");
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
          fetchQuestions();
        } else {
          showToast(res?.data?.msg || "Failed to add question", "error");
        }
      }
    } catch (e) {
      console.error("Save question error:", e);
      showToast("An error occurred while saving the question.", "error");
    } finally {
      setModalSaving(false);
    }
  };

  // ─── Delete Question Handler ─────────────────────────────────────────────
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await API.AssessmentAPI.deleteQuestion(id);
      if (res?.data?.status === "Success" || res?.status === 200) {
        showToast("Question deleted successfully!", "success");
        fetchQuestions();
      } else {
        showToast(res?.data?.msg || "Failed to delete question", "error");
      }
    } catch (e) {
      console.error("Delete question error:", e);
      showToast("An error occurred while deleting question.", "error");
    }
  };

  // ─── Fetch Exam Papers ───────────────────────────────────────────────────
  const fetchPapers = useCallback(async () => {
    if (!selectedClass) {
      dispatch(setExamPapers({ listData: [], count: 0 }));
      return;
    }
    setLoadingPapers(true);
    try {
      const conditionObj = {
        class_id: selectedClass,
      };
      if (selectedSection) conditionObj.section_id = selectedSection;

      const res = await API.AssessmentAPI.getAllPapers(conditionObj, 0, 50);
      if (res?.status === "Success" || res?.status === 200 || res?.data) {
        const payload = res.data || res;
        dispatch(setExamPapers(payload));
      } else {
        dispatch(setExamPapers({ listData: [], count: 0 }));
      }
    } catch (e) {
      console.warn("Error fetching exam papers:", e);
      dispatch(setExamPapers({ listData: [], count: 0 }));
    } finally {
      setLoadingPapers(false);
    }
  }, [selectedClass, selectedSection, dispatch]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // ─── Save / Update Paper Handler ──────────────────────────────────────────
  const handleSavePaper = async (payload) => {
    try {
      if (payload.id) {
        const res = await API.AssessmentAPI.updatePaper(payload);
        if (res?.data?.status === "Success" || res?.status === 200) {
          showToast("Exam paper updated successfully!", "success");
          fetchPapers();
        } else {
          showToast(res?.data?.msg || "Failed to update paper", "error");
        }
      } else {
        const res = await API.AssessmentAPI.createPaper(payload);
        if (res?.data?.status === "Success" || res?.status === 200) {
          showToast("Exam paper designed and saved successfully!", "success");
          fetchPapers();
        } else {
          showToast(res?.data?.msg || "Failed to save paper", "error");
        }
      }
    } catch (e) {
      console.error("Save paper error:", e);
      showToast("An error occurred while saving the exam paper.", "error");
    }
  };

  // ─── Delete Paper Handler ────────────────────────────────────────────────
  const handleDeletePaper = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam paper?")) return;
    try {
      const res = await API.AssessmentAPI.deletePaper(id);
      if (res?.data?.status === "Success" || res?.status === 200) {
        showToast("Exam paper deleted successfully!", "success");
        fetchPapers();
      } else {
        showToast(res?.data?.msg || "Failed to delete exam paper", "error");
      }
    } catch (e) {
      console.error("Delete paper error:", e);
      showToast("An error occurred while deleting paper.", "error");
    }
  };

  const selectedClassName = classList.find((c) => String(c.id) === String(selectedClass))?.name || `Class ${selectedClass}`;
  const selectedSectionName = sectionList.find((s) => String(s.id) === String(selectedSection))?.name || `Section ${selectedSection}`;

  const currentQuestions = questionsStore?.listData?.rows || [];
  const currentTotal = questionsStore?.listData?.count || 0;
  const currentPapers = examPapersStore?.listData?.rows || [];
  const currentPapersTotal = examPapersStore?.listData?.count || currentPapers.length;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0c0c] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 font-sans antialiased">
      {/* Toast Notification Alert */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[99999] animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-bold text-white ${toast.type === "success"
              ? "bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-500/50 shadow-emerald-950/20"
              : "bg-gradient-to-r from-rose-600 to-red-700 border-rose-500/50 shadow-rose-950/20"
              }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Banner & Context Controls */}
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* School & Module Title */}
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>• Examination System</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              Assessment & Question Bank
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Create and manage subject question banks, design multi-section test papers, and publish examinations.
            </p>
          </div>

          {/* Cascading Class & Section Pickers */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-[#1c1c1c] p-2.5 rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a]">
              {/* Class Dropdown */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs transition-all ${activeTab !== "bank"
                  ? "bg-slate-100 dark:bg-[#1f1f1f] border-slate-300/80 dark:border-[#333] opacity-85"
                  : "bg-white dark:bg-[#252525] border-slate-200 dark:border-[#333]"
                  }`}
                title={
                  activeTab !== "bank"
                    ? "Class is locked for this workflow. Switch to Tab 1 to change Class."
                    : "Select target Class"
                }
              >
                {activeTab !== "bank" ? (
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Class
                    </span>
                    {activeTab !== "bank" && (
                      <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        Locked
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedClass}
                    disabled={activeTab !== "bank"}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setPage(0);
                    }}
                    className={`bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none pr-2 ${activeTab !== "bank" ? "cursor-not-allowed opacity-90" : "cursor-pointer"
                      }`}
                  >
                    <option value="">Select Class</option>
                    {classList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section Dropdown */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs transition-all ${activeTab !== "bank"
                  ? "bg-slate-100 dark:bg-[#1f1f1f] border-slate-300/80 dark:border-[#333] opacity-85"
                  : "bg-white dark:bg-[#252525] border-slate-200 dark:border-[#333]"
                  }`}
                title={
                  activeTab !== "bank"
                    ? "Section is locked for this workflow. Switch to Tab 1 to change Section."
                    : !selectedClass
                      ? "Please select a Class first"
                      : "Select target Section"
                }
              >
                {activeTab !== "bank" ? (
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Section
                    </span>
                    {activeTab !== "bank" && (
                      <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        Locked
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedSection}
                    disabled={activeTab !== "bank" || !selectedClass}
                    onChange={(e) => {
                      setSelectedSection(e.target.value);
                      setPage(0);
                    }}
                    className={`bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none pr-2 ${activeTab !== "bank" || !selectedClass
                      ? "cursor-not-allowed opacity-90"
                      : "cursor-pointer"
                      }`}
                  >
                    <option value="">{selectedClass ? "Select Section" : "Select Class First"}</option>
                    {sectionList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick helper when locked */}
            {activeTab !== "bank" && (
              <button
                type="button"
                onClick={() => setActiveTab("bank")}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 px-2"
                title="Click to go to Tab 1 and choose a different Class/Section"
              >
                <span>Change Class/Section in Tab 1 &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Main Workflow Tabs (Modern Compact Segmented Design) */}
        <div className="flex items-center mt-6 pt-4 border-t border-slate-100 dark:border-[#202020] overflow-x-auto custom-scrollbar">
          <div className="inline-flex p-1.5 bg-slate-100/80 dark:bg-[#161616] rounded-2xl border border-slate-200/70 dark:border-[#262626] gap-1.5 max-w-full">
            {[
              ...(rolePriority !== 6 ? [
                {
                  id: "bank",
                  label: "1. Question Bank",
                  subtitle: "Create & organize question pool",
                  tooltip: "Add, edit, or filter subject MCQs and theory questions for the selected class & section",
                  icon: HelpCircle,
                  count: currentTotal,
                },
                {
                  id: "design",
                  label: "2. Question Design & Sections",
                  subtitle: "Assemble sections & print paper",
                  tooltip: "Create exam blueprints, pick questions into sections (MCQ/Theory), calculate marks & preview printable papers",
                  icon: FileText,
                  count: currentPapersTotal,
                }
              ] : []),
              {
                id: "publish",
                label: rolePriority === 6 ? "Active & Scheduled Examinations" : "3. Publish & Schedule",
                subtitle: rolePriority === 6 ? "Your upcoming & active test papers" : "Set exam dates & release to students",
                tooltip: rolePriority === 6 ? "Scheduled exam dates, time slots, instructions and test papers" : "Schedule exam dates, time slots, instructions and publish papers to student/guardian portals",
                icon: Send,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.tooltip}
                  className={`group flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer text-left shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 select-none ${isActive
                    ? "bg-white dark:bg-[#242424] text-slate-900 dark:text-white shadow-sm border border-slate-200/90 dark:border-[#333333]"
                    : "border border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-[#1e1e1e]"
                    }`}
                >
                  {/* Tab Icon Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-200/60 dark:bg-[#202020] text-slate-500 dark:text-zinc-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Title, Count & Subtitle */}
                  <div className="flex flex-col pr-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold tracking-tight ${isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-zinc-300"}`}>
                        {tab.label}
                      </span>
                      {tab.count !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                            : "bg-slate-200/70 text-slate-600 dark:bg-[#252525] dark:text-zinc-400"
                            }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10.5px] leading-tight ${isActive
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-slate-400 dark:text-zinc-500"
                        }`}
                    >
                      {tab.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab 1: Question Bank View */}
      {activeTab === "bank" && (
        <QuestionBankTab
          selectedClass={selectedClass}
          selectedSection={selectedSection}
          selectedClassName={selectedClassName}
          selectedSectionName={selectedSectionName}
          questions={currentQuestions}
          loading={loadingQuestions}
          totalCount={currentTotal}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onOpenAddModal={() => {
            setEditingQuestion(null);
            setIsQuestionModalOpen(true);
          }}
          onOpenEditModal={(q) => {
            setEditingQuestion(q);
            setIsQuestionModalOpen(true);
          }}
          onDeleteQuestion={handleDeleteQuestion}
          filteredSubjects={filteredSubjects}
          selectedSubjectId={selectedSubjectFilter}
          onSubjectFilterChange={(val) => {
            setSelectedSubjectFilter(val);
            setPage(0);
          }}
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            setPage(0);
          }}
        />
      )}

      {/* Tab 2: Question Design & Sections */}
      {activeTab === "design" && (
        <PaperDesignerTab
          classId={selectedClass}
          sectionId={selectedSection}
          className={selectedClassName}
          sectionName={selectedSectionName}
          filteredSubjects={filteredSubjects}
          allBankQuestions={currentQuestions}
          designedPapers={currentPapers}
          loadingPapers={loadingPapers}
          onSavePaper={handleSavePaper}
          onDeletePaper={handleDeletePaper}
          schoolName={schoolName}
        />
      )}

      {/* Tab 3: Publish & Schedule */}
      {activeTab === "publish" && (
        <PublishTab
          classId={selectedClass}
          sectionId={selectedSection}
          className={selectedClassName}
          sectionName={selectedSectionName}
          filteredSubjects={filteredSubjects}
          designedPapers={currentPapers}
          loadingPapers={loadingPapers}
          onSavePaper={handleSavePaper}
          onDeletePaper={handleDeletePaper}
          schoolName={schoolName}
          rolePriority={rolePriority}
        />
      )}

      {/* Question Add/Edit Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        initialData={editingQuestion}
        classId={selectedClass}
        sectionId={selectedSection}
        className={selectedClassName}
        sectionName={selectedSectionName}
        filteredSubjects={filteredSubjects}
        onSave={handleSaveQuestion}
        loading={modalSaving}
      />
    </div>
  );
};

ListingComponent.propTypes = {
  rolePriority: PropTypes.number,
};

export default ListingComponent;
