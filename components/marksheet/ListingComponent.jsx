import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { PlusCircle, BookOpen, Layers, ChevronDown, FileCheck, Award, Sparkles } from "lucide-react";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from "../common/Datagrid";

import { datagridColumns } from "./MarksheetConfig";
import MarksheetReportCardModal from "./MarksheetReportCardModal";
import ExamPapersLedgerTab from "./ExamPapersLedgerTab";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setMarksheets, setMarksheetClassData } from "../../redux/actions/MarksheetAction";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
  const {
    getLocalStorage,
    fetchAndSetAll,
    fetchAndSetSchoolData,
    findMultipleById,
    appendSuffix,
    capitalizeEveryWord,
  } = Utility();

  const authInfo = getLocalStorage("auth") || {};
  const isStudent = rolePriority === 6 || authInfo?.role === 6 || authInfo?.rolePriority === 6;
  const studentClass = authInfo?.student?.class ? Number(authInfo.student.class) : "";
  const studentSection = authInfo?.student?.section ? Number(authInfo.student.section) : "";
  const studentId = authInfo?.student?.id ? Number(authInfo.student.id) : null;

  const [classSectionObj, setClassSectionObj] = useState({
    class_id: isStudent ? studentClass : "",
    section_id: isStudent ? studentSection : "",
  });
  const [classData, setClassData] = useState([]);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const allClasses = useSelector((state) => state.allClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const allSections = useSelector((state) => state.allSections);
  const allSubjects = useSelector((state) => state.allSubjects);
  const selected = useSelector((state) => state.menuItems.selected);
  const { listData = { count: 0, rows: [] }, loading } = useSelector((state) => state.allMarksheets);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  const [activeView, setActiveView] = useState("reportCards"); // "reportCards" | "examLedger"
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [selectedMarksheet, setSelectedMarksheet] = useState(null);

  const [searchFlag, setSearchFlag] = useState({
    search: false,
    searching: false,
  });
  const [oldPagination, setOldPagination] = useState();

  const [reloadBtn, setReloadBtn] = useState(null);
  useEffect(() => {
    setReloadBtn(document.getElementById("reload-btn"));
  }, []);

  const { getPaginatedData } = useCommon();

  // Deduplicated class list supporting both { class_id, class_name } and { id, name }
  const classList = useMemo(() => {
    const raw = (schoolClasses?.listData?.length ? schoolClasses.listData : allClasses?.listData) || [];
    const seen = new Set();
    const list = [];
    raw.forEach((item) => {
      const id = item?.class_id ?? item?.id;
      const rawName = item?.class_name ?? item?.name ?? "";
      if (id !== undefined && id !== null && !seen.has(String(id))) {
        seen.add(String(id));
        const formattedName = !isNaN(Number(rawName)) && rawName !== "" ? `Class ${appendSuffix(rawName)}` : (rawName.toLowerCase().startsWith("class") ? capitalizeEveryWord(rawName) : `Class ${capitalizeEveryWord(rawName)}`);
        list.push({ id: Number(id), name: formattedName || `Class ${id}` });
      }
    });
    return list;
  }, [schoolClasses?.listData, allClasses?.listData]);

  // Section list supporting both { section_id, section_name } and { id, name }
  const sectionList = useMemo(() => {
    if (classSectionObj?.class_id && classData?.length) {
      const classSections = classData.filter((obj) => obj.class_id === classSectionObj.class_id);
      if (classSections.length > 0) {
        const seen = new Set();
        const list = [];
        classSections.forEach((item) => {
          const id = item?.section_id ?? item?.id;
          const rawName = item?.section_name ?? item?.name ?? "";
          if (id !== undefined && id !== null && !seen.has(String(id))) {
            seen.add(String(id));
            const formattedName = rawName ? (rawName.toLowerCase().startsWith("sec") ? capitalizeEveryWord(rawName) : `Section ${capitalizeEveryWord(rawName)}`) : `Section ${id}`;
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
        const formattedName = rawName ? (rawName.toLowerCase().startsWith("sec") ? capitalizeEveryWord(rawName) : `Section ${capitalizeEveryWord(rawName)}`) : `Section ${id}`;
        list.push({ id: Number(id), name: formattedName });
      }
    });
    return list;
  }, [classSectionObj?.class_id, classData, schoolSections?.listData, allSections?.listData]);

  const classConditionObj = useMemo(() => {
    const obj = {};
    if (classSectionObj?.class_id) obj.classId = classSectionObj.class_id;
    if (classSectionObj?.section_id) obj.sectionId = classSectionObj.section_id;
    if (isStudent && studentId) {
      obj.studentId = studentId;
      obj.student_id = studentId;
    }
    return Object.keys(obj).length > 0 ? obj : null;
  }, [classSectionObj?.class_id, classSectionObj?.section_id, isStudent, studentId]);

  useEffect(() => {
    getPaginatedData(
      0,
      10,
      setMarksheets,
      API.MarksheetAPI,
      classConditionObj
    );
  }, [classConditionObj]);

  useEffect(() => {
    if (!allSubjects?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
    }
  }, []);

  useEffect(() => {
    const getAndSetSections = () => {
      if (!classSectionObj?.class_id) return;
      const classSections =
        classData?.filter(
          (obj) => obj.class_id === classSectionObj?.class_id
        ) || [];
      const selectedSections = classSections.map(
        ({ section_id, section_name }) => ({ section_id, section_name })
      );
      if (selectedSections.length > 0) {
        dispatch(setSchoolSections(selectedSections));
      }
    };
    getAndSetSections();
  }, [classSectionObj?.class_id, classData?.length]);

  useEffect(() => {
    const getAndSetSubjects = () => {
      if (!classSectionObj?.class_id || !classSectionObj?.section_id) return;
      const sectionSubjects = classData?.filter(
        (obj) =>
          obj.class_id === classSectionObj?.class_id &&
          obj.section_id === classSectionObj?.section_id
      );
      const selectedSubjects = sectionSubjects
        ? findMultipleById(
          sectionSubjects[0]?.subject_ids,
          allSubjects?.listData
        )
        : [];
      dispatch(
        setMarksheetClassData({
          selectedSubjects: selectedSubjects,
          classDataObj: sectionSubjects[0],
        })
      );
    };
    getAndSetSubjects();
  }, [
    classSectionObj?.class_id,
    classSectionObj?.section_id,
    allSubjects?.listData?.length,
    classData.length,
  ]);

  useEffect(() => {
    if (!getLocalStorage("schoolInfo")) {
      if (!allClasses?.listData?.length) {
        fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
      }
      if (!allSections?.listData?.length) {
        fetchAndSetAll(dispatch, setAllSections, API.SectionAPI);
      }
    }
    if (
      getLocalStorage("schoolInfo") &&
      (!schoolClasses?.listData?.length || !schoolSections?.listData?.length || !classData?.length)
    ) {
      fetchAndSetSchoolData(
        dispatch,
        setSchoolClasses,
        setSchoolSections,
        setClassData
      );
    }
  }, []);

  useEffect(() => {
    dispatch(setMenuItem("Theory Results & Marksheet"));
  }, []);

  const columns = datagridColumns(rolePriority, (row) => {
    setSelectedMarksheet(row);
    setReportCardOpen(true);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200">
      {/* Top Banner & Context Controls (Matching Question Bank pattern) */}
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-[#222] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* School & Module Title */}
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>• Student Results & Evaluation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              Theory Results & Marksheet
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              View theory examination marks, evaluate student question attempts, and generate official cumulative report cards.
            </p>
          </div>

          {/* Cascading Class & Section Pickers */}
          {!isStudent && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-[#1c1c1c] p-2.5 rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a]">
                {/* Class Dropdown */}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs transition-all bg-white dark:bg-[#252525] border-slate-200 dark:border-[#333]"
                  title="Select target Class"
                >
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Class
                    </span>
                    <select
                      value={classSectionObj?.class_id ?? ""}
                      onChange={(e) =>
                        setClassSectionObj({
                          class_id: e.target.value ? Number(e.target.value) : "",
                          section_id: "",
                        })
                      }
                      className="bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none pr-2 cursor-pointer"
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs transition-all ${!classSectionObj?.class_id
                    ? "bg-slate-100 dark:bg-[#1f1f1f] border-slate-300/80 dark:border-[#333] opacity-80"
                    : "bg-white dark:bg-[#252525] border-slate-200 dark:border-[#333]"
                    }`}
                  title={!classSectionObj?.class_id ? "Please select a Class first" : "Select target Section"}
                >
                  <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Section
                    </span>
                    <select
                      value={classSectionObj?.section_id ?? ""}
                      disabled={!classSectionObj?.class_id}
                      onChange={(e) =>
                        setClassSectionObj((prev) => ({
                          ...prev,
                          section_id: e.target.value ? Number(e.target.value) : "",
                        }))
                      }
                      className={`bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none pr-2 ${!classSectionObj?.class_id ? "cursor-not-allowed opacity-90" : "cursor-pointer"
                        }`}
                    >
                      <option value="">{classSectionObj?.class_id ? "Select Section" : "Select Class First"}</option>
                      {sectionList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workflow Tabs Row */}
        <div className="flex items-center mt-6 pt-4 border-t border-slate-100 dark:border-[#202020] overflow-x-auto custom-scrollbar">
          <div className="inline-flex p-1.5 bg-slate-100/80 dark:bg-[#161616] rounded-2xl border border-slate-200/70 dark:border-[#262626] gap-1.5 max-w-full">
            {[
              {
                id: "reportCards",
                label: isStudent ? "Cumulative Report Cards" : "1. Cumulative Report Cards",
                subtitle: "Official student transcripts & grades",
                tooltip: "View student report cards, aggregate grades, and print A4 report cards",
                icon: FileCheck,
                count: listData?.count,
              },
              ...(!isStudent ? [
                {
                  id: "examLedger",
                  label: "2. Exam Papers & Theory Ledger",
                  subtitle: "Exam papers, question scoring & live sync",
                  tooltip: "Evaluate student answer sheets by exam paper with question-level breakdown and auto-sync",
                  icon: Award,
                }
              ] : []),
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  title={tab.tooltip}
                  className={`group flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer text-left shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 select-none ${isActive
                    ? "bg-white dark:bg-[#242424] text-slate-900 dark:text-white shadow-xs border border-slate-200/90 dark:border-[#333333]"
                    : "border border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-[#1e1e1e]"
                    }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-200/60 dark:bg-[#202020] text-slate-500 dark:text-zinc-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
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

      {/* ─── TAB 1: CUMULATIVE REPORT CARDS VIEW ─── */}
      {activeView === "reportCards" && (
        <>
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-xs p-4">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base">
                  Marksheet Ledger
                </span>
                {classSectionObj?.class_id && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                    Filtered
                  </span>
                )}
              </div>

              <div className="flex-1 w-full flex flex-col sm:flex-row items-center justify-end gap-3">
                <div className="w-full sm:max-w-md">
                  <Search
                    action={setMarksheets}
                    api={API.MarksheetAPI}
                    getSearchData={getPaginatedData}
                    oldPagination={oldPagination}
                    reloadBtn={reloadBtn}
                    setSearchFlag={setSearchFlag}
                  />
                </div>

                {rolePriority > 1 && rolePriority <= 4 && (
                  <button
                    onClick={() => navigateTo(`/marksheet/create`, { state: { class_id: classSectionObj?.class_id, section_id: classSectionObj?.section_id } })}
                    disabled={!classSectionObj?.class_id || !classSectionObj?.section_id}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-[#252525] disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 whitespace-nowrap cursor-pointer shrink-0"
                    title={
                      !classSectionObj?.class_id || !classSectionObj?.section_id
                        ? "Select Class and Section above to create a marksheet"
                        : "Create new student marksheet"
                    }
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create New Marksheet</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <ServerPaginationGrid
            action={setMarksheets}
            api={API.MarksheetAPI}
            getQuery={getPaginatedData}
            columns={columns}
            rows={listData?.rows || []}
            count={listData?.count || 0}
            loading={loading}
            selected={selected}
            pageSizeOptions={pageSizeOptions}
            setOldPagination={setOldPagination}
            searchFlag={searchFlag}
            setSearchFlag={setSearchFlag}
            condition={classConditionObj}
          />
        </>
      )}

      {/* ─── TAB 2: EXAM PAPERS & THEORY LEDGER VIEW ─── */}
      {activeView === "examLedger" && (
        <ExamPapersLedgerTab
          classId={classSectionObj?.class_id}
          sectionId={classSectionObj?.section_id}
          classList={classList}
          sectionList={sectionList}
          onClassChange={(cId) =>
            setClassSectionObj((prev) => ({
              ...prev,
              class_id: cId ? Number(cId) : "",
              section_id: "",
            }))
          }
          onSectionChange={(sId) =>
            setClassSectionObj((prev) => ({
              ...prev,
              section_id: sId ? Number(sId) : "",
            }))
          }
          onViewReportCard={(st) => {
            const existingRow = listData?.rows?.find((row) => row.student_id === st.id);
            if (existingRow) {
              setSelectedMarksheet(existingRow);
            } else {
              setSelectedMarksheet({
                ...st,
                student_id: st.id,
                student_name: st.name || st.student_name,
                class_id: classSectionObj?.class_id,
                section_id: classSectionObj?.section_id,
              });
            }
            setReportCardOpen(true);
          }}
        />
      )}

      <MarksheetReportCardModal
        open={reportCardOpen}
        setOpen={setReportCardOpen}
        detail={selectedMarksheet}
        allSubjects={allSubjects?.listData || []}
      />
    </div>
  );
};

ListingComponent.propTypes = {
  rolePriority: PropTypes.number,
};

export default ListingComponent;
