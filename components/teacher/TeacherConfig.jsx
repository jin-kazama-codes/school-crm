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
import { Pencil } from 'lucide-react';

import API from "../../apis";
import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null) => {
    const schoolClasses = useSelector(state => state.schoolClasses);
    const allClasses = useSelector(state => state.allClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allSections = useSelector(state => state.allSections);

    const dispatch = useDispatch();
    const navigateTo = useNavigate();
    const { fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage, capitalizeEveryWord } = Utility();

    const handleActionEdit = (id) => {
        navigateTo(`/teacher/update/${id}`, { state: { id: id } });
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
            field: "teacherName",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
        },
        {
            field: "classes",
            headerName: "Class",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            renderCell: ({ row }) => {
                if ((row.is_class_teacher === true || row.is_class_teacher?.data?.[0] === 1) && row.classnames && row.class_section_name) {
                    const classnamesArray = row.classnames.split(',');
                    return (
                        <div className="flex flex-wrap gap-1 items-center justify-center h-full">
                            {classnamesArray.map((classname, index) => {
                                const isClassTeacher = classname === row.class_section_name;
                                return (
                                    <span key={index} className={isClassTeacher ? "text-emerald-500 font-bold" : "text-slate-700 dark:text-slate-300"}>
                                        {classname}
                                        {index !== classnamesArray.length - 1 && ', '}
                                    </span>
                                )
                            })}
                        </div>
                    );
                } else {
                    return (
                        <div className="flex items-center justify-center h-full">
                            {row.classnames
                                ? <span className="text-slate-700 dark:text-slate-300">{row.classnames}</span>
                                : <span className="text-red-500 font-medium">Add classes first</span>
                            }
                        </div>
                    )
                }
            }
        },
        {
            field: "subjects",
            headerName: "Subjects",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                const subjectsArray = params?.value?.split(',');
                return (
                    <div className="flex items-center justify-center h-full text-slate-700 dark:text-slate-300">
                        {params.value ? subjectsArray.join(", ") : "No subjects found"}
                    </div>
                )
            }
        },
        {
            field: "contact_no",
            headerName: "Contact",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
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
        ...(rolePriority !== 1 ? [{
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 75,
            renderCell: ({ row: { id } }) => (
                <div className="flex justify-center items-center w-full h-full">
                    <button
                        onClick={() => handleActionEdit(id)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>
            )
        }] : [])
    ];
    return columns;
};
