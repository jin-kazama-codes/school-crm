/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";
import { PlusCircle } from "lucide-react";
import PropTypes from "prop-types";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';
import TeacherDossierModal from "./TeacherDossierModal";

import { datagridColumns } from "./TeacherConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setTeachers } from "../../redux/actions/TeacherAction";
import { setAllSubjects } from "../../redux/actions/SubjectAction";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";


const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
    const [openModal, setOpenModal] = useState(false);
    const [teacherDetail, setTeacherDetail] = useState(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [countryData, setCountryData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [cityData, setCityData] = useState([]);
    const [classData, setClassData] = useState([]);

    const selected = useSelector(state => state.menuItems.selected);
    const subjectsInRedux = useSelector(state => state.allSubjects);
    const schoolClasses = useSelector(state => state.schoolClasses);
    const allClasses = useSelector(state => state.allClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allSections = useSelector(state => state.allSections);
    const { listData, loading } = useSelector(state => state.allTeachers);

    const navigateTo = useNavigate();
    const dispatch = useDispatch();

    const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
    const [oldPagination, setOldPagination] = useState();

    const { getPaginatedData } = useCommon();
    const { fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage } = Utility();
    
    const [reloadBtn, setReloadBtn] = useState(null);
    useEffect(() => {
        setReloadBtn(document.getElementById("reload-btn"));
    }, []);
    
    const importBtn = true;
    const teacherImport = "teacher";

    const populateData = useCallback(id => {
        const paths = [
            `/get-by-pk/teacher/${id}`,
            `/get-address/teacher/${id}`,
            `/get-teacher-detail/${id}`,
            `/get-image/teacher/${id}`
        ];
        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                const teacherRaw = responses[0]?.data?.data || responses[0]?.data;
                const addressRaw = responses[1]?.data?.data || responses[1]?.data;
                const teacherDetailRaw = responses[2]?.data?.data || responses[2]?.data;
                const teacherImgRaw = responses[3]?.data?.data || responses[3]?.data;

                const dataObj = {
                    teacherData: teacherRaw,
                    addressData: addressRaw,
                    selectedClass: Array.isArray(teacherDetailRaw) ? teacherDetailRaw : (teacherDetailRaw?.classes || []),
                    imageData: Array.isArray(teacherImgRaw) ? teacherImgRaw : (teacherImgRaw ? [teacherImgRaw] : [])
                };
                setTeacherDetail(dataObj);
            })
            .catch(err => {
                console.error("Error populating teacher details:", err);
            });
    }, []);

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
        if (selectedTeacherId) {
            populateData(selectedTeacherId);

            API.CountryAPI.getCountries()
                .then(countries => {
                    if (countries.status === 'Success') {
                        setCountryData(countries.data.list);
                    }
                })
                .catch(err => { console.error(err); });

            API.StateAPI.getAllStates()
                .then(states => {
                    if (states.status === 'Success') {
                        setStateData(states.data.rows);
                    }
                })
                .catch(err => { console.error(err); });

            API.CityAPI.getAllCities()
                .then(cities => {
                    if (cities.status === 'Success') {
                        setCityData(cities.data.rows);
                    }
                })
                .catch(err => { console.error(err); });
        }
    }, [selectedTeacherId]);

    useEffect(() => {
        dispatch(setMenuItem("Teacher"));
    }, []);

    return (
        <div 
            className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
        >
            <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-800 dark:text-white tracking-tight capitalize leading-tight">Teacher Desk</h2>
                    
                    <div className="flex-1 w-full flex justify-center md:px-8 max-w-2xl">
                        <Search
                            action={setTeachers}
                            api={API.TeacherAPI}
                            getSearchData={getPaginatedData}
                            oldPagination={oldPagination}
                            reloadBtn={reloadBtn}
                            setSearchFlag={setSearchFlag}
                        />
                    </div>

                    {rolePriority > 1 && (
                        <button
                            onClick={() => navigateTo(`/${selected.toLowerCase()}/create`)}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Create New {selected}
                        </button>
                    )}
                </div>
            </div>

            <ServerPaginationGrid
                action={setTeachers}
                api={API.TeacherAPI}
                getQuery={getPaginatedData}
                columns={datagridColumns(rolePriority, setOpenModal, setSelectedTeacherId)}
                rolePriority={rolePriority}
                rows={listData?.rows || []}
                importBtn={importBtn}
                count={listData?.count || 0}
                loading={loading}
                selected={selected}
                pageSizeOptions={pageSizeOptions}
                setOldPagination={setOldPagination}
                searchFlag={searchFlag}
                setSearchFlag={setSearchFlag}
                imports={teacherImport}
            />

            <TeacherDossierModal
                open={openModal}
                setOpen={setOpenModal}
                detail={teacherDetail}
                countryData={countryData}
                stateData={stateData}
                cityData={cityData}
                allClasses={schoolClasses?.listData?.length ? schoolClasses.listData : (allClasses?.listData || [])}
                allSections={schoolSections?.listData?.length ? schoolSections.listData : (allSections?.listData || [])}
                allSubjects={subjectsInRedux?.listData?.rows || subjectsInRedux?.listData || []}
                classData={classData || []}
                rolePriority={rolePriority}
            />
        </div>
    );
};

ListingComponent.propTypes = {
    rolePriority: PropTypes.number
};

export default ListingComponent;
