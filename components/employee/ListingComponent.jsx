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
import EmployeeDossierModal from "./EmployeeDossierModal";

import { datagridColumns } from "./EmployeeConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setEmployees } from "../../redux/actions/EmployeeAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
    const [openModal, setOpenModal] = useState(false);
    const [employeeDetail, setEmployeeDetail] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [countryData, setCountryData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [cityData, setCityData] = useState([]);

    const selected = useSelector(state => state.menuItems.selected);
    const { listData, loading } = useSelector(state => state.allEmployees);

    const navigateTo = useNavigate();
    const dispatch = useDispatch();

    const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
    const [oldPagination, setOldPagination] = useState();

    const { getPaginatedData } = useCommon();
    const { getLocalStorage } = Utility();
    
    const [reloadBtn, setReloadBtn] = useState(null);
    useEffect(() => {
        setReloadBtn(document.getElementById("reload-btn"));
    }, []);

    const importBtn = true;
    const employeeImport = "employee";

    const populateData = useCallback((id) => {
        const paths = [
            `/get-by-pk/employee/${id}`,
            `/get-address/employee/${id}`
        ];
        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                const employeeRaw = responses[0]?.data?.data || responses[0]?.data;
                const addressRaw = responses[1]?.data?.data || responses[1]?.data;

                const dataObj = {
                    employeeData: employeeRaw,
                    addressData: addressRaw
                };
                setEmployeeDetail(dataObj);
            })
            .catch(err => {
                console.error("Error populating employee details:", err);
            });
    }, []);

    useEffect(() => {
        if (selectedEmployeeId) {
            populateData(selectedEmployeeId);

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
    }, [selectedEmployeeId, populateData]);

    useEffect(() => {
        dispatch(setMenuItem("Employee"));
    }, []);

    return (
        <div 
            className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
        >
            <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-800 dark:text-white tracking-tight capitalize leading-tight">Employee Desk</h2>
                    
                    <div className="flex-1 w-full flex justify-center md:px-8 max-w-2xl">
                        <Search
                            action={setEmployees}
                            api={API.EmployeeAPI}
                            getSearchData={getPaginatedData}
                            oldPagination={oldPagination}
                            reloadBtn={reloadBtn}
                            setSearchFlag={setSearchFlag}
                        />
                    </div>

                    {rolePriority > 1 && (
                        <button
                            onClick={() => navigateTo(`/employee/create`)}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Create New {selected}
                        </button>
                    )}
                </div>
            </div>

            <ServerPaginationGrid
                action={setEmployees}
                api={API.EmployeeAPI}
                getQuery={getPaginatedData}
                columns={datagridColumns(rolePriority, setOpenModal, setSelectedEmployeeId)}
                rolePriority={rolePriority}
                importBtn={importBtn}
                rows={listData?.rows || []}
                count={listData?.count || 0}
                loading={loading}
                selected={selected}
                pageSizeOptions={pageSizeOptions}
                setOldPagination={setOldPagination}
                searchFlag={searchFlag}
                setSearchFlag={setSearchFlag}
                imports={employeeImport}
            />

            <EmployeeDossierModal
                open={openModal}
                setOpen={setOpenModal}
                detail={employeeDetail}
                countryData={countryData}
                stateData={stateData}
                cityData={cityData}
                rolePriority={rolePriority}
            />
        </div>
    );
};

ListingComponent.propTypes = {
    rolePriority: PropTypes.number
};

export default ListingComponent;
