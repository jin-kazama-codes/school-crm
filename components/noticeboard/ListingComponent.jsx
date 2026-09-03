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
import { PlusCircle, RotateCcw } from "lucide-react";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';

import { datagridColumns } from "./NoticeBoardConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setNoticeBoard } from "../../redux/actions/NoticeBoardAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

import listBg from "../assets/listBG.jpg";

const pageSizeOptions = [5, 10, 20];

const ListingComponent = ({ rolePriority = null }) => {
    const selected = useSelector(state => state.menuItems.selected);
    const { listData, loading } = useSelector(state => state.allNotices);

    const navigateTo = useNavigate();
    const dispatch = useDispatch();

    const [searchFlag, setSearchFlag] = useState({ search: false, searching: false });
    const [oldPagination, setOldPagination] = useState();

    const { getPaginatedData } = useCommon();
    const { getLocalStorage } = Utility();
    
    // In React 18 / Next.js, document.getElementById isn't available during SSR
    const [reloadBtn, setReloadBtn] = useState(null);
    useEffect(() => {
        setReloadBtn(document.getElementById("reload-btn"));
    }, []);

    const handleReload = () => {
        if (reloadBtn) reloadBtn.style.display = "none";
        setSearchFlag({
            search: false,
            searching: false,
            oldPagination
        });
    };

    useEffect(() => {
        const selectedMenu = getLocalStorage("menu");
        if (selectedMenu?.selected) {
            dispatch(setMenuItem(selectedMenu.selected));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize">
                        {selected}
                    </h2>
                    
                    <div className="flex-1 w-full flex justify-center md:px-8 max-w-2xl">
                        <Search
                            action={setNoticeBoard}
                            api={API.NoticeBoardAPI}
                            getSearchData={getPaginatedData}
                            oldPagination={oldPagination}
                            reloadBtn={reloadBtn}
                            setSearchFlag={setSearchFlag}
                        />
                    </div>

                    {rolePriority > 1 && (
                        <button
                            onClick={() => navigateTo(`/noticeboard/create`)}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Create New {selected}
                        </button>
                    )}
                </div>
            </div>

            <button
                id="reload-btn"
                type="button"
                onClick={handleReload}
                className="hidden absolute top-[4.5rem] md:top-24 left-1/2 -translate-x-1/2 z-10 items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-full font-medium transition-all backdrop-blur-sm border border-white/10 shadow-lg"
            >
                <RotateCcw className="w-4 h-4" />
                Back
            </button>

            <div className="p-4 md:p-6">
                <ServerPaginationGrid
                    action={setNoticeBoard}
                    api={API.NoticeBoardAPI}
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
                />
            </div>
        </div>
    );
};

ListingComponent.propTypes = {
    rolePriority: PropTypes.number
};

export default ListingComponent;
