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
import { Plus } from "lucide-react";
import PropTypes from "prop-types";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';
import UserDossierModal from "./UserDossierModal";

import { datagridColumns } from "./UserConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setUsers } from "../../redux/actions/UserAction";
import { setAllSchools } from "../../redux/actions/SchoolAction";
import { setAllUserRoles } from "../../redux/actions/UserRoleAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
    const navigateTo = useNavigate();
    const dispatch = useDispatch();

    const [openModal, setOpenModal] = useState(false);
    const [userDetail, setUserDetail] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [countryData, setCountryData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [cityData, setCityData] = useState([]);

    const selected = useSelector(state => state.menuItems.selected);
    const { listData, loading } = useSelector(state => state.allUsers);
    const allSchools = useSelector(state => state.allSchools);
    const allUserRoles = useSelector(state => state.allUserRoles);

    const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
    const [oldPagination, setOldPagination] = useState();
    const [reloadBtn, setReloadBtn] = useState(null);

    const { getPaginatedData } = useCommon();
    const { fetchAndSetAll, getLocalStorage } = Utility();

    useEffect(() => {
        if (!allSchools?.listData?.length) {
            fetchAndSetAll(dispatch, setAllSchools, API.SchoolAPI);
        }
        if (!allUserRoles?.listData?.length) {
            fetchAndSetAll(dispatch, setAllUserRoles, API.UserRoleAPI);
        }
    }, [allSchools?.listData?.length, allUserRoles?.listData?.length]);

    const populateData = useCallback((id) => {
        const paths = [
            `/get-by-pk/user/${id}`,
            `/get-address/user/${id}`
        ];
        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                const userRaw = responses[0]?.data?.data || responses[0]?.data;
                const addressRaw = responses[1]?.data?.data || responses[1]?.data;

                const dataObj = {
                    userData: userRaw,
                    addressData: addressRaw
                };
                setUserDetail(dataObj);
            })
            .catch(err => {
                console.error("Error populating user details:", err);
            });
    }, []);

    useEffect(() => {
        setReloadBtn(document.getElementById("reload-btn"));
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            populateData(selectedUserId);

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
    }, [selectedUserId, populateData]);

    useEffect(() => {
        dispatch(setMenuItem("User"));
    }, []);

    return (
        <div
            className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
        >
            <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-800 dark:text-white tracking-tight capitalize whitespace-nowrap leading-tight">
                        {selected} Desk
                    </h2>

                    <div className="flex-1 w-full flex justify-center md:px-8 max-w-2xl">
                        <Search
                            action={setUsers}
                            api={API.UserAPI}
                            getSearchData={getPaginatedData}
                            oldPagination={oldPagination}
                            reloadBtn={reloadBtn}
                            setSearchFlag={setSearchFlag}
                        />
                    </div>

                    <button
                        onClick={() => { navigateTo(`/${selected.toLowerCase()}/create`) }}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/30 transition-all duration-200 whitespace-nowrap cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        Create New {selected}
                    </button>
                </div>
            </div>

            <ServerPaginationGrid
                action={setUsers}
                api={API.UserAPI}
                getQuery={getPaginatedData}
                columns={datagridColumns(rolePriority, setOpenModal, setSelectedUserId)}
                rows={listData.rows}
                count={listData.count}
                loading={loading}
                selected={selected}
                pageSizeOptions={pageSizeOptions}
                setOldPagination={setOldPagination}
                searchFlag={searchFlag}
                setSearchFlag={setSearchFlag}
            />

            <UserDossierModal
                open={openModal}
                setOpen={setOpenModal}
                detail={userDetail}
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
