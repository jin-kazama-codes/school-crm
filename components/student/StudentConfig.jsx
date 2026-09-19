/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "@/lib/routerAdapter";
import { Pencil, Eye } from 'lucide-react';

import API from "../../apis";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null, setOpen = null) => {
    const schoolClasses = useSelector(state => state.schoolClasses);
    const allClasses = useSelector(state => state.allClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allSections = useSelector(state => state.allSections);

    const dispatch = useDispatch();
    const navigateTo = useNavigate();
    const { appendSuffix, findById, fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage, capitalizeEveryWord, formatDate } = Utility();

    const handleActionEdit = (id) => {
        navigateTo(`/student/update/${id}`, { state: { id: id } });
    };

    const handleActionShow = (id) => {
        if (setOpen) setOpen(true);
        navigateTo("#", { state: { id: id } });
    };

    useEffect(() => {
        if (!getLocalStorage("schoolInfo")) {
            if (!allClasses?.listData?.length) {
                fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
            }
            if (!allSections?.listData?.length) {
                fetchAndSetAll(dispatch, setAllSections, API.SectionAPI);
            }
        }
        if (getLocalStorage("schoolInfo") && (!schoolClasses?.listData?.length || !schoolSections?.listData?.length)) {
            fetchAndSetSchoolData(dispatch, setSchoolClasses, setSchoolSections);
        }
    }, [schoolClasses?.listData?.length, schoolSections?.listData?.length, allClasses?.listData?.length, allSections?.listData?.length]);

    const columns = [
        {
            field: "fullname",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            valueGetter: (value, row) => `${capitalizeEveryWord(row.firstname) || ''} ${capitalizeEveryWord(row.lastname)|| ''}`
        },
        {
            field: "class",
            headerName: "Class",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                let className;
                let sectionName;

                if (allClasses.listData.length && allSections.listData.length) {
                    className = findById(params?.row?.class, allClasses?.listData)?.class_name;
                    sectionName = findById(params?.row?.section, allSections?.listData)?.section_name;
                } else if (schoolClasses.listData.length && schoolSections.listData.length) {
                    className = findById(params?.row?.class, schoolClasses?.listData)?.class_name;
                    sectionName = findById(params?.row?.section, schoolSections?.listData)?.section_name;
                } 
                return (
                    <div>
                        {className ? appendSuffix(className) : '/'} {sectionName}
                    </div>
                );
            }
        },
        {
            field: "blood_group",
            headerName: "Blood Group",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
        },
        {
            field: "dob",
            headerName: "Date of Birth",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            valueFormatter: (value) => `${formatDate(value)}`
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            renderCell: ({ row: { status } }) => {
                const isActive = status === "active";
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <div
                            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm ${
                                isActive 
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30" 
                                    : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
                            }`}
                        >
                            {capitalizeEveryWord(status) || ''}
                        </div>
                    </div>
                );
            }
        },
        {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            renderCell: ({ row: { id } }) => {
                return (
                    <div className="flex justify-center items-center gap-2 w-full h-full">
                        {rolePriority !== 1 && (
                            <button
                                onClick={() => handleActionEdit(id)}
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => handleActionShow(id)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:hover:bg-slate-500/20 dark:text-slate-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/50 cursor-pointer"
                            title="Preview"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                );
            }
        }
    ];
    return columns;
};
