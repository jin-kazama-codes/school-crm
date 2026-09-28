/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/
import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { BookOpen, Layers, ChevronDown } from "lucide-react";

import API from "../../apis";
import PaymentModal from "./FormInModalComponent";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';

import { datagridColumns } from "./PaymentConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { setStudents } from "../../redux/actions/StudentAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";


const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [classSectionObj, setClassSectionObj] = useState({ class: null, section: null });
    const [classData, setClassData] = useState([]);
    
    const schoolClasses = useSelector((state) => state.schoolClasses);
    const allClasses = useSelector((state) => state.allClasses);
    const schoolSections = useSelector((state) => state.schoolSections);
    const allSections = useSelector((state) => state.allSections);
    const selected = useSelector(state => state.menuItems.selected);
    const { listData = { count: 0, rows: [] }, loading } = useSelector(state => state.allStudents);

    const dispatch = useDispatch();

    const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
    const [oldPagination, setOldPagination] = useState();
    const [reloadBtn, setReloadBtn] = useState(null);

    const { getPaginatedData } = useCommon();
    const { fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage, appendSuffix, capitalizeEveryWord } = Utility();

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
        if (classSectionObj?.class && classData?.length) {
            const classSections = classData.filter((obj) => (obj.class_id ?? obj.id) == classSectionObj.class);
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
    }, [classSectionObj?.class, classData, schoolSections?.listData, allSections?.listData]);

    const classConditionObj = useMemo(() => {
        const obj = {};
        if (classSectionObj?.class) obj.classId = classSectionObj.class;
        if (classSectionObj?.section) obj.sectionId = classSectionObj.section;
        return Object.keys(obj).length > 0 ? obj : null;
    }, [classSectionObj?.class, classSectionObj?.section]);

    useEffect(() => {
        setReloadBtn(document.getElementById("reload-btn"));
    }, []);

    useEffect(() => {
        dispatch(setMenuItem("Payment"));
    }, []);

    useEffect(() => {
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
        if (classSectionObj?.class) {
            getPaginatedData(0, 10, setStudents, API.StudentAPI, classConditionObj);
        }
    }, [classSectionObj?.class, classSectionObj?.section]);

    useEffect(() => {
        const getAndSetSections = () => {
            const classSections = classData?.filter(obj => (obj.class_id ?? obj.id) == classSectionObj?.class) || [];
            const selectedSections = classSections.map(
                ({ section_id, section_name }) => ({ section_id, section_name })
            );
            if (selectedSections.length > 0) {
                dispatch(setSchoolSections(selectedSections));
            }
        };
        getAndSetSections();
    }, [classSectionObj?.class, classData?.length]);

    // to set default class & section id in dropdowns
    useEffect(() => {
        if (listData?.rows?.length && !classSectionObj?.class && !classSectionObj?.section) {
            setClassSectionObj({
                ...classSectionObj,
                class: listData.rows[0].class,
                section: listData.rows[0].section
            });
        }
    }, [listData?.rows?.length]);

    return (
        <div 
            className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
        >
            <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-800 dark:text-white tracking-tight capitalize whitespace-nowrap leading-tight">
                        {selected}
                    </h2>
                    
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            {/* Class Dropdown */}
                            <div className="relative flex items-center min-w-[160px] w-full sm:w-auto">
                                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 pointer-events-none z-10" />
                                <select
                                    value={classSectionObj?.class ?? ""}
                                    onChange={(event) =>
                                        setClassSectionObj((prev) => ({
                                          ...prev,
                                          class: event.target.value ? Number(event.target.value) : "",
                                          section: "",
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
                                    value={classSectionObj?.section ?? ""}
                                    onChange={(event) =>
                                        setClassSectionObj((prev) => ({
                                          ...prev,
                                          section: event.target.value ? Number(event.target.value) : "",
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

                        <div className="w-full md:w-auto">
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
                </div>
            </div>

            <ServerPaginationGrid
                    action={setStudents}
                    api={API.StudentAPI}
                    getQuery={getPaginatedData}
                    columns={datagridColumns(rolePriority, setOpenDialog)}
                    condition={classConditionObj}
                    rows={listData.rows}
                    count={listData.count}
                    loading={loading}
                    selected={selected}
                    pageSizeOptions={pageSizeOptions}
                    setOldPagination={setOldPagination}
                    searchFlag={searchFlag}
                    setSearchFlag={setSearchFlag}
                />

            <PaymentModal openDialog={openDialog} setOpenDialog={setOpenDialog} />
        </div>
    );
};

ListingComponent.propTypes = {
    rolePriority: PropTypes.number
};

export default ListingComponent;
