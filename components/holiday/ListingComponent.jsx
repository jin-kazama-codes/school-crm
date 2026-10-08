import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { PlusCircle, RotateCcw } from "lucide-react";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';
import HolidayDossierModal from "./HolidayDossierModal";

import { datagridColumns } from "./HolidayConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setHolidays } from "../../redux/actions/HolidayAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
    const [openModal, setOpenModal] = useState(false);
    const [holidayDetail, setHolidayDetail] = useState(null);
    const [selectedHolidayId, setSelectedHolidayId] = useState(null);

    const selected = useSelector(state => state.menuItems.selected);
    const { listData, loading } = useSelector(state => state.allHolidays);

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

    const populateData = useCallback((id) => {
        const paths = [`/get-by-pk/holiday/${id}`];
        API.CommonAPI.multipleAPICall("GET", paths)
            .then(responses => {
                const holidayRaw = responses[0]?.data?.data || responses[0]?.data;
                const dataObj = {
                    holidayData: holidayRaw
                };
                setHolidayDetail(dataObj);
            })
            .catch(err => {
                console.error("Error populating holiday details:", err);
            });
    }, []);

    useEffect(() => {
        if (selectedHolidayId) {
            populateData(selectedHolidayId);
        }
    }, [selectedHolidayId, populateData]);

    const handleReload = () => {
        if (reloadBtn) reloadBtn.style.display = "none";
        setSearchFlag({
            search: false,
            searching: false,
            oldPagination
        });
    };

    useEffect(() => {
        dispatch(setMenuItem("Holiday"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div 
            className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
        >
            <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-800 dark:text-white tracking-tight capitalize leading-tight">Holiday Desk</h2>
                    
                    <div className="flex-1 w-full flex justify-center md:px-8 max-w-2xl">
                        <Search
                            action={setHolidays}
                            api={API.HolidayAPI}
                            getSearchData={getPaginatedData}
                            oldPagination={oldPagination}
                            reloadBtn={reloadBtn}
                            setSearchFlag={setSearchFlag}
                        />
                    </div>

                    {rolePriority > 1 && (
                        <button
                            onClick={() => navigateTo(`/holiday/create`)}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
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

            <ServerPaginationGrid
                action={setHolidays}
                api={API.HolidayAPI}
                getQuery={getPaginatedData}
                columns={datagridColumns(rolePriority, setOpenModal, setSelectedHolidayId)}
                rows={listData.rows}
                count={listData.count}
                loading={loading}
                selected={selected}
                pageSizeOptions={pageSizeOptions}
                setOldPagination={setOldPagination}
                searchFlag={searchFlag}
                setSearchFlag={setSearchFlag}
            />

            {/* Dedicated Holiday Dossier Modal */}
            <HolidayDossierModal
                open={openModal}
                setOpen={setOpenModal}
                detail={holidayDetail}
                rolePriority={rolePriority}
            />
        </div>
    );
};

ListingComponent.propTypes = {
    rolePriority: PropTypes.number
};

export default ListingComponent;
