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

export const datagridColumns = (rolePriority = null, setOpen = null, setSelectedId = null) => {
    const schoolClasses = useSelector(state => state.schoolClasses);
    const allClasses = useSelector(state => state.allClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allSections = useSelector(state => state.allSections);

    const dispatch = useDispatch();
    const navigateTo = useNavigate();
    const { appendSuffix, findById, fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage, capitalizeEveryWord, formatDate, formatBloodGroup } = Utility();

    const handleActionEdit = (id) => {
        navigateTo(`/student/update/${id}`, { state: { id: id } });
    };

    const handleActionShow = (id) => {
        if (setOpen) setOpen(true);
        if (setSelectedId) setSelectedId(id);
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
            field: "roll_no",
            headerName: "Roll No",
            headerAlign: "center",
            align: "center",
            flex: 0.7,
            minWidth: 90,
            renderCell: ({ row }) => {
                const roll = row.roll_no ?? row.enrollment_no;
                if (!roll) return <span className="text-slate-400 font-medium">-</span>;
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            #{roll}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "fullname",
            headerName: "Student Name",
            headerAlign: "center",
            align: "center",
            flex: 1.2,
            minWidth: 150,
            valueGetter: (value, row) => `${capitalizeEveryWord(row.firstname) || ''} ${capitalizeEveryWord(row.lastname)|| ''}`.trim()
        },
        {
            field: "class",
            headerName: "Class",
            headerAlign: "center",
            align: "center",
            flex: 0.9,
            minWidth: 110,
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
                    <div className="font-semibold text-slate-700 dark:text-slate-200">
                        {className ? appendSuffix(className) : '-'} {sectionName ? `(${sectionName})` : ''}
                    </div>
                );
            }
        },
        {
            field: "admission_date",
            headerName: "Admission Date",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 130,
            renderCell: ({ row: { admission_date } }) => {
                if (!admission_date) return <span className="text-slate-400 font-medium">-</span>;
                return (
                    <div className="flex justify-center items-center w-full h-full text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {formatDate(admission_date)}
                    </div>
                );
            }
        },
        {
            field: "contact_no",
            headerName: "Contact No",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            renderCell: ({ row }) => {
                const rawContact = row.contact_no || row.father_contact_no || row.mother_contact_no;
                if (!rawContact) return <span className="text-slate-400 font-medium">-</span>;
                const contact = String(rawContact).split('.')[0];
                return (
                    <div className="flex justify-center items-center w-full h-full font-mono text-xs text-slate-600 dark:text-slate-300">
                        {contact}
                    </div>
                );
            }
        },
        {
            field: "blood_group",
            headerName: "Blood Group",
            headerAlign: "center",
            align: "center",
            flex: 0.8,
            minWidth: 100,
            renderCell: ({ row: { blood_group } }) => {
                const formatted = formatBloodGroup(blood_group);
                if (!blood_group || formatted === '-') {
                    return <span className="text-slate-400 font-medium">-</span>;
                }
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs">
                            {formatted}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            flex: 0.8,
            minWidth: 100,
            renderCell: ({ row: { status } }) => {
                const isActive = status === "active";
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <div
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-xs ${
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
            flex: 0.8,
            minWidth: 90,
            renderCell: ({ row: { id } }) => {
                return (
                    <div className="flex justify-center items-center gap-1.5 w-full h-full">
                        {rolePriority !== 1 && (
                            <button
                                onClick={() => handleActionEdit(id)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => handleActionShow(id)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:hover:bg-slate-500/20 dark:text-slate-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/50 cursor-pointer"
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
