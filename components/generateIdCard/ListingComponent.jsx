/* eslint-disable react-hooks/exhaustive-deps */
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
import { Download } from "lucide-react";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';

import JSZip from "jszip";
import { saveAs } from "file-saver";

import { datagridColumns } from "./GenIdCardConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { setGenerateIdCard } from "../../redux/actions/GenerateIdCardAction";
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
  const { listData, loading } = useSelector(state => state.allGenerateIdCards);

  const dispatch = useDispatch();

  const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
  const [oldPagination, setOldPagination] = useState();

  const { getPaginatedData } = useCommon();
  const { fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage } = Utility();
  const reloadBtn = document.getElementById("reload-btn");

  const ENV = process.env;

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
    dispatch(setMenuItem("Generate ID Card"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      getPaginatedData(0, 100, setGenerateIdCard, API.GenerateIdCardAPI, classConditionObj);
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

  const downloadImages = async () => {
    const schoolName = listData.rows[0]?.school_name || "school_images";
    const folderName = schoolName.replace(/\s+/g, "_");
    const zip = new JSZip();

    for (const row of listData.rows) {
      const imageUrl = row.student_image;
      const hyphenatedStr = row.school_name.toLowerCase().split(' ').join('-');
      if (!imageUrl) {
        console.warn('Skipping row without student_image:', row);
        continue;
      }
      const imageName = imageUrl.split("/").pop();
      try {
        const response = await fetch(`${ENV.NEXT_PUBLIC_BASE_URL}/download?folder=theskolar&file=mobile/${hyphenatedStr}/student/${imageName}`);
        if (!response.ok) {
          console.error(`Failed to fetch image: ${imageUrl} - Status: ${response.status}`);
          continue;
        }
        const blob = await response.blob();
        zip.file(imageName, blob);
      } catch (error) {
        console.error(`Failed to fetch image: ${imageUrl}`, error);
      }
    }

    zip.generateAsync({ type: "blob" }).then(content => {
      saveAs(content, `${folderName}.zip`);
    });
  };

  const selectClassNames = "w-full min-w-[120px] px-4 py-2.5 bg-white/90 dark:bg-[#1a1a1a]/90 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 transition-all";

  return (
    <div 
        className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
        
    >
        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize whitespace-nowrap">
                    {selected}
                </h2>
                
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex flex-col">
                            <select
                                value={classSectionObj?.class || ""}
                                onChange={event =>
                                    setClassSectionObj({
                                        ...classSectionObj,
                                        class: event.target.value
                                    })
                                }
                                className={selectClassNames}
                            >
                                <option value="" disabled>Class</option>
                                {allClasses?.listData?.length
                                    ? allClasses.listData.map(cls => (
                                    <option value={cls.class_id} key={cls.class_id}>
                                        {cls.class_name}
                                    </option>
                                    ))
                                    : schoolClasses?.listData?.length
                                    ? schoolClasses.listData.map(cls => (
                                        <option value={cls.class_id} key={cls.class_id}>
                                        {cls.class_name}
                                        </option>
                                    ))
                                    : null}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <select
                                value={classSectionObj?.section || ""}
                                onChange={event =>
                                    setClassSectionObj({
                                        ...classSectionObj,
                                        section: event.target.value
                                    })
                                }
                                className={selectClassNames}
                            >
                                <option value="" disabled>Section</option>
                                {allSections?.listData?.length
                                    ? allSections.listData.map(section => (
                                    <option value={section.section_id} key={section.section_id}>
                                        {section.section_name}
                                    </option>
                                    ))
                                    : schoolSections?.listData?.length
                                    ? schoolSections.listData.map(section => (
                                        <option value={section.section_id} key={section.section_id}>
                                        {section.section_name}
                                        </option>
                                    ))
                                    : null}
                            </select>
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <Search
                            action={setGenerateIdCard}
                            api={API.GenerateIdCardAPI}
                            getSearchData={getPaginatedData}
                            oldPagination={oldPagination}
                            reloadBtn={reloadBtn}
                            setSearchFlag={setSearchFlag}
                        />
                    </div>

                    <button
                        onClick={downloadImages}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/30 transition-all duration-200 whitespace-nowrap"
                    >
                        <Download className="w-5 h-5" />
                        Download All Images
                    </button>
                </div>
            </div>
        </div>

        <ServerPaginationGrid
                action={setGenerateIdCard}
                api={API.GenerateIdCardAPI}
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
                checkboxSelection={true}
                hidePagination={true}
            />
    </div>
  );
};

ListingComponent.propTypes = {
  rolePriority: PropTypes.number
};

export default ListingComponent;
