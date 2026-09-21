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
import { Plus } from "lucide-react";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';

import { datagridColumns } from "./SchoolHouseConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setListingSchoolHouses } from "../../redux/actions/SchoolHouseAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";


const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
    const selected = useSelector(state => state.menuItems.selected);
    const { listData, loading } = useSelector(state => state.listingSchoolHouses);

    const navigateTo = useNavigate();
    const dispatch = useDispatch();

    const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
    const [oldPagination, setOldPagination] = useState();
    const [reloadBtn, setReloadBtn] = useState(null);

    const { getPaginatedData } = useCommon();
    const { getLocalStorage } = Utility();

    useEffect(() => {
        setReloadBtn(document.getElementById("reload-btn"));
    }, []);

    useEffect(() => {
        dispatch(setMenuItem("School House"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div 
            className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
            
        >
            <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize whitespace-nowrap">
                        {selected}
                    </h2>
                    
                    <div className="flex-1 w-full flex justify-center md:px-8 max-w-2xl">
                        <Search
                            action={setListingSchoolHouses}
                            api={API.SchoolHouseAPI}
                            getSearchData={getPaginatedData}
                            oldPagination={oldPagination}
                            reloadBtn={reloadBtn}
                            setSearchFlag={setSearchFlag}
                        />
                    </div>

                    {rolePriority > 1 && (
                        <button
                            onClick={() => { navigateTo(`/school-house/create`) }}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/30 transition-all duration-200 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Create New {selected}
                        </button>
                    )}
                </div>
            </div>

            <ServerPaginationGrid
                action={setListingSchoolHouses}
                api={API.SchoolHouseAPI}
                getQuery={getPaginatedData}
                columns={datagridColumns(rolePriority)}
                rows={listData?.rows || listData?.data || []}
                count={listData?.count || 0}
                loading={loading}
                selected={selected}
                pageSizeOptions={pageSizeOptions}
                setOldPagination={setOldPagination}
                searchFlag={searchFlag}
                setSearchFlag={setSearchFlag}
            />
        </div>
    );
};

ListingComponent.propTypes = {
    rolePriority: PropTypes.number
};

export default ListingComponent;
