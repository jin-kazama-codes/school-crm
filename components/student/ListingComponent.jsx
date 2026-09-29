/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import PropTypes from "prop-types";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";
import { PlusCircle, BookOpen, Layers, ChevronDown, GraduationCap, Users } from "lucide-react";

import API from "../../apis";
import classNames from "../modules";
import Search from "../common/Search";
import ServerPaginationGrid from "../common/Datagrid";
import ViewDetailModal from "../common/ViewDetailModal";

import { datagridColumns } from "./StudentConfig";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setStudents } from "../../redux/actions/StudentAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";


const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
  const [openModal, setOpenModal] = useState(false);
  const [studentDetail, setStudentDetail] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [countryData, setCountryData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [classData, setClassData] = useState([]);

  const selected = useSelector((state) => state.menuItems.selected);
  const subjectsInRedux = useSelector(state => state.allSubjects);
  const formSectionsInRedux = useSelector(state => state.schoolSections);
  const formClassesInRedux = useSelector(state => state.schoolClasses);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const allClasses = useSelector((state) => state.allClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const allSections = useSelector((state) => state.allSections);
  const { listData = { count: 0, rows: [] }, loading } = useSelector((state) => state.allStudents);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const URLParams = useParams();
  const { state } = useLocation();

  const [selectedClass, setSelectedClass] = useState(URLParams?.classId ? Number(URLParams.classId) : null);
  const [selectedSection, setSelectedSection] = useState(null);

  // Sync if URL param changes
  useEffect(() => {
    if (URLParams?.classId) {
      setSelectedClass(Number(URLParams.classId));
    }
  }, [URLParams?.classId]);

  // Revisit for pagination
  const [searchFlag, setSearchFlag] = useState({
    search: false,
    searching: false
  });
  const [oldPagination, setOldPagination] = useState();
  
  const { getPaginatedData } = useCommon();
  const { findMultipleById, findById, fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage, setLocalStorage, toastAndNavigate, appendSuffix, capitalizeEveryWord, formatBloodGroup } = Utility();

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
    if (selectedClass && classData?.length) {
      const classSections = classData.filter((obj) => (obj.class_id ?? obj.id) == selectedClass);
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
  }, [selectedClass, classData, schoolSections?.listData, allSections?.listData]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  const [reloadBtn, setReloadBtn] = useState(null);
  useEffect(() => {
    setReloadBtn(document.getElementById("reload-btn"));
  }, []);

  const sectionName = findById(studentDetail?.studentData?.section, formSectionsInRedux?.listData)?.section_name;
  const className = findById(studentDetail?.studentData?.class, formClassesInRedux?.listData)?.class_name;
  const importBtn = true;
  const studentImport = "student";

  const classConditionObj = useMemo(() => {
    const obj = {};
    if (selectedClass) {
      obj.classId = selectedClass;
    }
    if (selectedSection) {
      obj.sectionId = selectedSection;
    }
    if (rolePriority === 5) {
      const parentId = getLocalStorage("auth")?.id;
      if (parentId) obj.parentId = parentId;
    }
    return Object.keys(obj).length > 0 ? obj : null;
  }, [selectedClass, selectedSection, rolePriority]);

  const populateData = useCallback(id => {
    const paths = [`/get-by-pk/student/${id}`, `/get-address/student/${id}`, `/get-image/student/${id}`];
    API.CommonAPI.multipleAPICall("GET", paths)
      .then(responses => {
        if (responses[0].data.data) {
          responses[0].data.data.subjects = findMultipleById(responses[0].data.data.subjects, subjectsInRedux?.listData?.rows)
        }
        const dataObj = {
          studentData: responses[0].data.data,
          addressData: responses[1]?.data?.data,
          imageData: responses[2]?.data?.data
        };
        setStudentDetail(dataObj);
      })
      .catch(err => {
        toastAndNavigate(dispatch, true, "error", err ? err?.response?.data?.msg : "An Error Occurred");
        throw err;
      });
  }, [subjectsInRedux?.listData?.rows]);

  useEffect(() => {
    if (!subjectsInRedux?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
    }
    if (!getLocalStorage("schoolInfo")) {
      if (!allClasses?.listData?.length) {
        fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
      }
      if (!allSections?.listData?.length) {
        fetchAndSetAll(dispatch, setAllSections, API.SectionAPI);
      }
    }
    if (getLocalStorage("schoolInfo") && (!schoolClasses?.listData?.length || !schoolSections?.listData?.length || !classData?.length)) {
      fetchAndSetSchoolData(dispatch, setSchoolClasses, setSchoolSections, setClassData);
    }
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      populateData(selectedStudentId);

      API.CountryAPI.getCountries()
        .then(countries => {
          if (countries.status === 'Success') {
            setCountryData(countries.data.list);
          }
        })
        .catch(err => { throw err; });

      API.StateAPI.getAllStates()
        .then(states => {
          if (states.status === 'Success') {
            setStateData(states.data.rows);
          }
        })
        .catch(err => { throw err; });

      API.CityAPI.getAllCities()
        .then(cities => {
          if (cities.status === 'Success') {
            setCityData(cities.data.rows);
          }
        })
        .catch(err => { throw err; });
    }
  }, [selectedStudentId]);

  useEffect(() => {
    dispatch(setMenuItem("Student"));
  }, []);

  useEffect(() => {
    selectedClass ? setLocalStorage("class", selectedClass) : null;
  }, [selectedClass]);

  const horizontalData = {
    Session: studentDetail?.studentData?.session,
    Name: studentDetail?.studentData?.firstname
      ? `${studentDetail.studentData.firstname} ${studentDetail.studentData.lastname || ''}`.trim()
      : '',
    Email: studentDetail?.studentData?.email,
    Dob: formatDate(studentDetail?.studentData?.dob),
    Admission_date: formatDate(studentDetail?.studentData?.admission_date),
    Blood_group: formatBloodGroup(studentDetail?.studentData?.blood_group),
    Class: className,
    Section: sectionName
  };
  const verticalData = {
    Father_name: studentDetail?.studentData?.father_name,
    Mother_name: studentDetail?.studentData?.mother_name,
    Guardian: studentDetail?.studentData?.guardian,
    Contact_no: studentDetail?.studentData?.contact_no,
    Religion: studentDetail?.studentData?.religion,
    Caste_group: studentDetail?.studentData?.caste_group,
    Gender: studentDetail?.studentData?.gender,
  };

  return (
    <div 
        className="p-4 sm:p-6 lg:p-8 space-y-5 w-full animate-in fade-in duration-200"
    >
      {/* Top Filter & Action Header */}
      <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5 space-y-4">
        {/* Main Toolbar Row: Left (Heading), Middle (Dropdowns + Search), Right (Action) */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          {/* Left: Heading */}
          <div className="shrink-0 flex items-center">
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-800 dark:text-white tracking-tight capitalize whitespace-nowrap leading-tight">
              Student Desk
            </h2>
          </div>
          
          {/* Middle: 2 Dropdowns + Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto flex-1 xl:max-w-3xl xl:justify-center">
            {/* Class Dropdown */}
            <div className="relative flex items-center w-full sm:w-[150px] shrink-0">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 pointer-events-none z-10" />
              <select
                value={selectedClass ?? ""}
                onChange={(event) => {
                  const val = event.target.value ? Number(event.target.value) : null;
                  setSelectedClass(val);
                  setSelectedSection(null);
                }}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs appearance-none truncate"
              >
                <option value="" className="bg-white dark:bg-[#161616] text-slate-500 font-medium">All Classes</option>
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
            <div className="relative flex items-center w-full sm:w-[150px] shrink-0">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 absolute left-3.5 pointer-events-none z-10" />
              <select
                value={selectedSection ?? ""}
                onChange={(event) => {
                  const val = event.target.value ? Number(event.target.value) : null;
                  setSelectedSection(val);
                }}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer shadow-2xs appearance-none truncate"
              >
                <option value="" className="bg-white dark:bg-[#161616] text-slate-500 font-medium">All Sections</option>
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

            {/* Search Bar */}
            <div className="w-full sm:flex-1 min-w-[200px]">
              <Search
                action={setStudents}
                api={API.StudentAPI}
                getSearchData={getPaginatedData}
                oldPagination={oldPagination}
                reloadBtn={reloadBtn}
                setSearchFlag={setSearchFlag}
              />
            </div>
          </div>

          {/* Right: Admission Action Button */}
          <div className="shrink-0 flex items-center justify-end">
            {rolePriority > 1 && (
              <button
                onClick={() => navigateTo(`/student/create`, { state: null })}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 whitespace-nowrap cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                {classNames.includes(selected) ? "Admission" : `Create New ${selected}`}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Quick Class Pill Tabs */}
        {classList.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-[#1a1a1a]">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {/* All Classes Pill */}
              <button
                type="button"
                onClick={() => {
                  setSelectedClass(null);
                  setSelectedSection(null);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedClass === null
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/30"
                    : "bg-slate-50 dark:bg-[#161616] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#202020] hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/80 dark:border-[#262626]"
                }`}
              >
                <GraduationCap className={`w-3.5 h-3.5 ${selectedClass === null ? "text-white" : "text-emerald-500"}`} />
                All Classes
              </button>

              {/* Dynamic Class Pills */}
              {classList.map((cls) => {
                const isActive = selectedClass === cls.id;
                return (
                  <button
                    key={`pill-class-${cls.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedClass(isActive ? null : cls.id);
                      setSelectedSection(null);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/30"
                        : "bg-slate-50 dark:bg-[#161616] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#202020] hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/80 dark:border-[#262626]"
                    }`}
                  >
                    <BookOpen className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-emerald-500"}`} />
                    {cls.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ServerPaginationGrid
        action={setStudents}
        api={API.StudentAPI}
        getQuery={getPaginatedData}
        columns={datagridColumns(rolePriority, setOpenModal, setSelectedStudentId)}
        rolePriority={rolePriority}
        condition={classConditionObj}
        importBtn={importBtn}
        rows={listData?.rows || []}
        count={listData?.count || 0}
        loading={loading}
        selected={selected}
        pageSizeOptions={pageSizeOptions}
        setOldPagination={setOldPagination}
        searchFlag={searchFlag}
        setSearchFlag={setSearchFlag}
        imports={studentImport}
      />

      <ViewDetailModal
        open={openModal}
        setOpen={setOpenModal}
        title='Student Details'
        horizontalData={horizontalData}
        verticalData={verticalData}
        detail={studentDetail}
        countryData={countryData}
        stateData={stateData}
        cityData={cityData}
      />
    </div>
  );
};

ListingComponent.propTypes = {
  rolePriority: PropTypes.number,
};

export default ListingComponent;
