/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { PlusCircle } from "lucide-react";

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

import listBg from "../assets/listBG.jpg";

const pageSizeOptions = [5, 10, 20];

const ListingComponent = ({ rolePriority = null }) => {
  const [classSectionObj, setClassSectionObj] = useState(null);
  const [classData, setClassData] = useState([]);
  const schoolClasses = useSelector((state) => state.schoolClasses);
  const allClasses = useSelector((state) => state.allClasses);
  const schoolSections = useSelector((state) => state.schoolSections);
  const allSections = useSelector((state) => state.allSections);
  const allSubjects = useSelector((state) => state.allSubjects);
  const selected = useSelector((state) => state.menuItems.selected);
  const { listData, loading } = useSelector((state) => state.allMarksheets);

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
  } = Utility();

  let classConditionObj = classSectionObj?.class_id
    ? {
      classId: classSectionObj.class_id,
    }
    : null;

  classConditionObj = classSectionObj?.section_id
    ? {
      ...classConditionObj,
      sectionId: classSectionObj.section_id,
    }
    : null;

  useEffect(() => {
    if (classSectionObj?.class_id && classSectionObj?.section_id) {
      getPaginatedData(
        0,
        8,
        setMarksheets,
        API.MarksheetAPI,
        classConditionObj
      );
    }
  }, [classConditionObj?.classId, classConditionObj?.sectionId]);

  useEffect(() => {
    if (!allSubjects?.listData?.length) {
      fetchAndSetAll(dispatch, setAllSubjects, API.SubjectAPI);
    }
  }, []);

  useEffect(() => {
    const getAndSetSections = () => {
      const classSections =
        classData?.filter(
          (obj) => obj.class_id === classSectionObj?.class_id
        ) || [];
      const selectedSections = classSections.map(
        ({ section_id, section_name }) => ({ section_id, section_name })
      );
      dispatch(setSchoolSections(selectedSections));
    };
    getAndSetSections();
  }, [classSectionObj?.class_id, classData?.length]);

  useEffect(() => {
    const getAndSetSubjects = () => {
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
    const selectedMenu = getLocalStorage("menu");
    if (selectedMenu?.selected) {
        dispatch(setMenuItem(selectedMenu.selected));
    }
  }, []);

  // to set default class & section id in dropdowns
  useEffect(() => {
    if (
      listData?.rows?.length &&
      !classSectionObj?.class_id &&
      !classSectionObj?.section_id
    ) {
      setClassSectionObj({
        ...classSectionObj,
        class_id: listData.rows[0].class_id,
        section_id: listData.rows[0].section_id,
      });
    }
  }, [listData?.rows?.length, classSectionObj?.section_id]);

  const selectClass = "w-full md:w-40 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_12px] bg-[right_1rem_center]";


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
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize shrink-0">
                    {selected}
                </h2>
                
                <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4 xl:px-8">
                    <div className="w-full max-w-xl">
                        <Search
                            action={setMarksheets}
                            api={API.MarksheetAPI}
                            getSearchData={getPaginatedData}
                            oldPagination={oldPagination}
                            reloadBtn={reloadBtn}
                            setSearchFlag={setSearchFlag}
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 shrink-0">
                        <select
                            value={classSectionObj?.class_id || ""}
                            onChange={(event) =>
                                setClassSectionObj({
                                ...classSectionObj,
                                class_id: event.target.value,
                                })
                            }
                            className={selectClass}
                        >
                            <option value="" disabled>Select Class</option>
                            {allClasses?.listData?.length
                                ? allClasses.listData.map((cls) => (
                                    <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                                ))
                                : schoolClasses?.listData?.length
                                ? schoolClasses.listData.map((cls) => (
                                    <option value={cls.class_id} key={cls.class_id}>{cls.class_name}</option>
                                ))
                                : null}
                        </select>

                        <select
                            value={classSectionObj?.section_id || ""}
                            onChange={(event) =>
                                setClassSectionObj({
                                ...classSectionObj,
                                section_id: event.target.value,
                                })
                            }
                            className={selectClass}
                        >
                            <option value="" disabled>Select Section</option>
                            {allSections?.listData?.length
                                ? allSections.listData.map((section) => (
                                    <option value={section.section_id} key={section.section_id}>{section.section_name}</option>
                                ))
                                : schoolSections?.listData?.length
                                ? schoolSections.listData.map((section) => (
                                    <option value={section.section_id} key={section.section_id}>{section.section_name}</option>
                                ))
                                : null}
                        </select>
                    </div>
                </div>

                {rolePriority > 1 && (
                    <button
                        onClick={() => navigateTo(`/marksheet/create`)}
                        disabled={!classSectionObj?.class_id || !classSectionObj?.section_id}
                        className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Create New {selected}
                    </button>
                )}
            </div>
        </div>

        <div className="p-4 md:p-6">
            <ServerPaginationGrid
                action={setMarksheets}
                api={API.MarksheetAPI}
                getQuery={getPaginatedData}
                columns={datagridColumns(rolePriority)}
                rows={listData.rows}
                count={listData.count}
                loading={loading}
                selected={selected}
                pageSizeOptions={pageSizeOptions}
                setOldPagination={setOldPagination}
                searchFlag={searchFlag}
                setSearchFlag={setSearchFlag}
                condition={classConditionObj}
            />
        </div>
    </div>
  );
};

ListingComponent.propTypes = {
  rolePriority: PropTypes.number,
};

export default ListingComponent;
