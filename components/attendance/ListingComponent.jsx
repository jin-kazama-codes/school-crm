import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import API from "../../apis";
import Search from "../common/Search";
import ServerPaginationGrid from '../common/Datagrid';

import { datagridColumns } from "./AttendanceConfig";
import { setMenuItem } from "../../redux/actions/NavigationAction";
import { setAttendances } from "../../redux/actions/AttendanceAction";
import { setTeachers } from "../../redux/actions/TeacherAction";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

const pageSizeOptions = [10, 20, 50];

const ListingComponent = ({ rolePriority = null }) => {
    const selected = useSelector(state => state.menuItems.selected);
    const attendanceState = useSelector(state => state.allAttendances);
    const teacherState = useSelector(state => state.allTeachers);

    // Prefer allAttendances, fallback to allTeachers
    const { listData = { count: 0, rows: [] }, loading = false } = (attendanceState && attendanceState.listData) ? attendanceState : (teacherState || { listData: { count: 0, rows: [] }, loading: false });

    const attendanceApi = API.AttendanceAPI || API.TeacherAPI;
    const attendanceAction = setAttendances || setTeachers;

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
        dispatch(setMenuItem("Attendance"));
    }, [dispatch]);

    return (
        <div 
            className="p-4 sm:p-6 lg:p-8 space-y-6 w-full animate-in fade-in duration-200"
        >
            <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm p-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-800 dark:text-white tracking-tight capitalize leading-tight">Attendance Desk</h2>
                    
                    <div className="flex-1 w-full flex justify-center md:px-8 max-w-2xl">
                        <Search
                            action={attendanceAction}
                            api={attendanceApi}
                            getSearchData={getPaginatedData}
                            oldPagination={oldPagination}
                            reloadBtn={reloadBtn}
                            setSearchFlag={setSearchFlag}
                        />
                    </div>
                </div>
            </div>

            <ServerPaginationGrid
                action={attendanceAction}
                api={attendanceApi}
                getQuery={getPaginatedData}
                columns={datagridColumns(rolePriority)}
                rows={listData?.rows || []}
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

