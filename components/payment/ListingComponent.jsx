/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

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

import listBg from "../assets/listBG.jpg";

const pageSizeOptions = [5, 10, 20];

const ListingComponent = ({ rolePriority = null }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [classSectionObj, setClassSectionObj] = useState(null);
    const [classData, setClassData] = useState([]);
    
    const schoolClasses = useSelector((state) => state.schoolClasses);
    const allClasses = useSelector((state) => state.allClasses);
    const schoolSections = useSelector((state) => state.schoolSections);
    const allSections = useSelector((state) => state.allSections);
    const selected = useSelector(state => state.menuItems.selected);
    const { listData, loading } = useSelector(state => state.allStudents);

    const dispatch = useDispatch();

    const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
    const [oldPagination, setOldPagination] = useState();
    const [reloadBtn, setReloadBtn] = useState(null);

    const { getPaginatedData } = useCommon();
    const { fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage } = Utility();

    let classConditionObj = classSectionObj?.class
        ? {
            classId: classSectionObj.class
        }
        : null;

    classConditionObj = classSectionObj?.section
        ? {
            ...classConditionObj,
            sectionId: classSectionObj.section
        }
        : null;

    useEffect(() => {
        setReloadBtn(document.getElementById("reload-btn"));
    }, []);

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if(selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
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
        if (classSectionObj?.class && classSectionObj?.section) {
            getPaginatedData(0, 5, setStudents, API.StudentAPI, classConditionObj);
        }
    }, [classSectionObj?.class, classSectionObj?.section]);

    useEffect(() => {
        const getAndSetSections = () => {
            const classSections = classData?.filter(obj => obj.class_id === classSectionObj?.class) || [];
            const selectedSections = classSections.map(
                ({ section_id, section_name }) => ({ section_id, section_name })
            );
            dispatch(setSchoolSections(selectedSections));
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

    const selectClass = "w-full md:w-48 px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-200 transition-all shadow-sm";

    return (
        <div 
            className="m-4 md:m-8 rounded-[26px] border border-slate-200 dark:border-[#2a2a2a] overflow-hidden shadow-2xl relative animate-in fade-in duration-300"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${listBg?.src || listBg})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover"
            }}
        >
            <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md p-4 md:p-6 border-b border-white/20 dark:border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize whitespace-nowrap">
                        {selected}
                    </h2>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto flex-1 md:justify-center">
                        <select
                            value={classSectionObj?.class || ""}
                            onChange={event => setClassSectionObj({ ...classSectionObj, class: event.target.value })}
                            className={selectClass}
                        >
                            <option value="" disabled>Select Class</option>
                            {allClasses?.listData?.length
                                ? allClasses.listData.map(cls => (
                                    <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                                ))
                                : schoolClasses?.listData?.length
                                    ? schoolClasses.listData.map(cls => (
                                        <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                                    ))
                                    : null}
                        </select>
                        
                        <select
                            value={classSectionObj?.section || ""}
                            onChange={event => setClassSectionObj({ ...classSectionObj, section: event.target.value })}
                            className={selectClass}
                        >
                            <option value="" disabled>Select Section</option>
                            {allSections?.listData?.length
                                ? allSections.listData.map(section => (
                                    <option value={section.section_id} key={section.section_id}>{section.section_name}</option>
                                ))
                                : schoolSections?.listData?.length
                                    ? schoolSections.listData.map(section => (
                                        <option value={section.section_id} key={section.section_id}>{section.section_name}</option>
                                    ))
                                    : null}
                        </select>

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

            <div className="p-4 md:p-6">
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
            </div>

            <PaymentModal openDialog={openDialog} setOpenDialog={setOpenDialog} />
        </div>
    );
};

ListingComponent.propTypes = {
    rolePriority: PropTypes.number
};

export default ListingComponent;
