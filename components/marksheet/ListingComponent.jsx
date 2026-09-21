import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { PlusCircle, BookOpen, Layers, ChevronDown } from "lucide-react";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from "../common/Datagrid";

import { datagridColumns } from "./MarksheetConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setMarksheets, setMarksheetClassData } from "../../redux/actions/MarksheetAction";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
  const [classSectionObj, setClassSectionObj] = useState({
    class_id: "",
    section_id: "",
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
  const {
    getLocalStorage,
    fetchAndSetAll,
    fetchAndSetSchoolData,
    findMultipleById,
    appendSuffix,
    capitalizeEveryWord,
  } = Utility();

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
    return Object.keys(obj).length > 0 ? obj : null;
  }, [classSectionObj?.class_id, classSectionObj?.section_id]);

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
    dispatch(setMenuItem("Marksheet"));
  }, []);

  return (
    <div 
        className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
    >
        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize shrink-0">
                    {selected}
                </h2>
                
                <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-3 xl:px-6">
                    <div className="w-full max-w-md">
                        <Search
                            action={setMarksheets}
                            api={API.MarksheetAPI}
                            getSearchData={getPaginatedData}
                            oldPagination={oldPagination}
                            reloadBtn={reloadBtn}
                            setSearchFlag={setSearchFlag}
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 shrink-0">
                        {/* Class Dropdown */}
                        <div className="relative flex items-center min-w-[160px] w-full sm:w-auto">
                            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 pointer-events-none z-10" />
                            <select
                                value={classSectionObj?.class_id ?? ""}
                                onChange={(event) =>
                                    setClassSectionObj((prev) => ({
                                      ...prev,
                                      class_id: event.target.value ? Number(event.target.value) : "",
                                      section_id: "",
                                    }))
                                }
                                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs appearance-none"
                            >
                                <option value="" className="bg-white dark:bg-[#161616] text-slate-500 font-medium">Select Class</option>
                                {classList.map((cls) => (
                                    <option 
                                        value={cls.id} 
                                        key={`class-${cls.id}`}
                                        className="bg-white dark:bg-[#161616] text-slate-800 dark:text-slate-100 font-medium py-1"
                                    >
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 pointer-events-none z-10" />
                        </div>

                        {/* Section Dropdown */}
                        <div className="relative flex items-center min-w-[160px] w-full sm:w-auto">
                            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 absolute left-3.5 pointer-events-none z-10" />
                            <select
                                value={classSectionObj?.section_id ?? ""}
                                onChange={(event) =>
                                    setClassSectionObj((prev) => ({
                                      ...prev,
                                      section_id: event.target.value ? Number(event.target.value) : "",
                                    }))
                                }
                                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer shadow-2xs appearance-none"
                            >
                                <option value="" className="bg-white dark:bg-[#161616] text-slate-500 font-medium">Select Section</option>
                                {sectionList.map((sec) => (
                                    <option 
                                        value={sec.id} 
                                        key={`section-${sec.id}`}
                                        className="bg-white dark:bg-[#161616] text-slate-800 dark:text-slate-100 font-medium py-1"
                                    >
                                        {sec.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 pointer-events-none z-10" />
                        </div>
                    </div>
                </div>

                {rolePriority > 1 && (
                    <button
                        onClick={() => navigateTo(`/marksheet/create`)}
                        disabled={!classSectionObj?.class_id || !classSectionObj?.section_id}
                        className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Create New {selected}
                    </button>
                )}
            </div>
        </div>

        <ServerPaginationGrid
                action={setMarksheets}
                api={API.MarksheetAPI}
                getQuery={getPaginatedData}
                columns={datagridColumns(rolePriority)}
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
    </div>
  );
};

ListingComponent.propTypes = {
  rolePriority: PropTypes.number,
};

export default ListingComponent;
