/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";
import { Plus } from "lucide-react";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';
import ViewDetailModal from "../common/ViewDetailModal";

import { datagridColumns } from "./SchoolConfig";
import { setFormAmenities } from "../../redux/actions/AmenityAction";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setListingSchools } from "../../redux/actions/SchoolAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";


const pageSizeOptions = [5, 10, 20];

const ListingComponent = () => {

    const [openModal, setOpenModal] = useState(false);
    const [schoolDetail, setSchoolDetail] = useState([]);
    const [countryData, setCountryData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [cityData, setCityData] = useState([]);

    const selected = useSelector(state => state.menuItems.selected);
    const formAmenitiesInRedux = useSelector(state => state.allFormAmenities);
    const { listData, loading } = useSelector(state => state.listingSchools);

    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    let id = state?.id;

    const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
    const [oldPagination, setOldPagination] = useState();

    const reloadBtn = document.getElementById("reload-btn");
    const { getPaginatedData } = useCommon();
    const { findMultipleById, getLocalStorage, toastAndNavigate } = Utility();

    useEffect(() => {
        dispatch(setMenuItem("School"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const populateData = useCallback(id => {
        const paths = [`/get-by-pk/school/${id}`, `/get-address/school/${id}`, `/get-image/school/${id}`];

        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                if (responses[0]?.data?.data) {
                    responses[0].data.data.amenities = findMultipleById(responses[0].data.data?.amenities, formAmenitiesInRedux?.listData?.rows);
                }
                API.SchoolAPI.getSchoolClasses(id)
                    .then(res => {
                        const dataObj = {
                            schoolData: {
                                schoolData: responses[0].data.data,
                                selectedClass: res?.data
                            },
                            addressData: responses[1]?.data?.data,
                            imageData: responses[2]?.data?.data
                        };
                        setSchoolDetail(dataObj);
                    })
                    .catch(err => {
                        toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "Error fetching school classes", navigateTo, 0);
                    });
            })
            .catch(err => {
                toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "Error fetching school classes", navigateTo, 0);
            });
    }, [formAmenitiesInRedux?.listData?.rows]);

    useEffect(() => {
        if (!formAmenitiesInRedux?.listData?.rows?.length) {
            getPaginatedData(0, 50, setFormAmenities, API.AmenityAPI);
        }
    }, [formAmenitiesInRedux?.listData?.rows?.length]);

    useEffect(() => {
        if (id) {
            populateData(id);

            API.CountryAPI.getCountries()
                .then(countries => {
                    if (countries.status === 'Success') {
                        setCountryData(countries.data.list);
                    }
                })
                .catch(err => {
                    throw err;
                });

            API.StateAPI.getAllStates()
                .then(states => {
                    if (states.status === 'Success') {
                        setStateData(states.data.rows);
                    }
                })
                .catch(err => {
                    throw err;
                });

            API.CityAPI.getAllCities()
                .then(cities => {
                    if (cities.status === 'Success') {
                        setCityData(cities.data.rows);
                    }
                })
                .catch(err => {
                    throw err;
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const horizontalData = {
        Registration_year: schoolDetail?.schoolData?.schoolData?.registration_year,
        Registered_by: schoolDetail?.schoolData?.schoolData?.registered_by,
        Name: schoolDetail?.schoolData?.schoolData?.name,
        Board: schoolDetail?.schoolData?.schoolData?.board,
        Email: schoolDetail?.schoolData?.schoolData?.email,
        Director: schoolDetail?.schoolData?.schoolData?.director,
        School_code: schoolDetail?.schoolData?.schoolData?.school_code
    };
    const verticalData = {
        Contact_no: schoolDetail?.schoolData?.schoolData?.contact_no_1,
        Type: schoolDetail?.schoolData?.schoolData?.type,
        Sub_type: schoolDetail?.schoolData?.schoolData?.sub_type,
        Principal: schoolDetail?.schoolData?.schoolData?.principal,
    };


    return (
        <div 
            className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
            
        >
            <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-800 dark:text-white tracking-tight capitalize leading-tight">School Desk</h2>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="w-full sm:w-auto">
                            <Search
                                action={setListingSchools}
                                api={API.SchoolAPI}
                                getSearchData={getPaginatedData}
                                oldPagination={oldPagination}
                                reloadBtn={reloadBtn}
                                setSearchFlag={setSearchFlag}
                            />
                        </div>

                        <button
                            onClick={() => navigateTo(`/${selected.toLowerCase()}/create`)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all duration-200 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Create New {selected}
                        </button>
                    </div>
                </div>
            </div>

            <ServerPaginationGrid
                    action={setListingSchools}
                    api={API.SchoolAPI}
                    getQuery={getPaginatedData}
                    columns={datagridColumns(setOpenModal)}
                    rows={listData.rows}
                    count={listData.count}
                    loading={loading}
                    selected={selected}
                    pageSizeOptions={pageSizeOptions}
                    setOldPagination={setOldPagination}
                    searchFlag={searchFlag}
                    setSearchFlag={setSearchFlag}
                />
            <ViewDetailModal
                open={openModal}
                setOpen={setOpenModal}
                title='School Details'
                horizontalData={horizontalData}
                verticalData={verticalData}
                detail={schoolDetail}
                countryData={countryData}
                stateData={stateData}
                cityData={cityData}
            />
        </div>
    );
};

export default ListingComponent;
