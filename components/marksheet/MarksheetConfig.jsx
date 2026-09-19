/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useSelector } from "react-redux";
import { useNavigate } from "@/lib/routerAdapter";
import { Pencil } from 'lucide-react';
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null) => {
    const schoolClasses = useSelector(state => state.schoolClasses);
    const allClasses = useSelector(state => state.allClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allSections = useSelector(state => state.allSections);

    const navigateTo = useNavigate();
    const { appendSuffix, findById, capitalizeEveryWord} = Utility();

    const handleActionEdit = (id, student_id, term) => {
        navigateTo(`/marksheet/update/${student_id}`, { state: { id: id, student_id: student_id, term: term } });
    };

    const columns = [
        {
            field: "student_id",
            headerName: "Student Id",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
        },
        {
            field: "class_id",
            headerName: "Class",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                let className;
                let sectionName;

                if (allClasses?.listData?.length || allSections?.listData?.length) {
                    className = findById(params?.row?.class_id, allClasses?.listData)?.class_name;
                    sectionName = findById(params?.row?.section_id, allSections?.listData)?.section_name;
                } else if (schoolClasses?.listData?.length || schoolSections?.listData?.length) {
                    className = findById(params?.row?.class_id, schoolClasses?.listData)?.class_name;
                    sectionName = findById(params?.row?.section_id, schoolSections?.listData)?.section_name;
                }
                return (
                    <div className="flex items-center justify-center w-full h-full font-medium">
                        {className ? appendSuffix(className) : '/'} {sectionName}
                    </div>
                );
            }
        },
        {
            field: "term",
            headerName: "Term",
            headerAlign: "center",
            align: "center",
            flex: 2,
            minWidth: 80
        },
        {
            field: "result",
            headerName: "Result",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            valueFormatter: (value) => `${capitalizeEveryWord(value) || ""}`,
            renderCell: ({ row: { result } }) => {
                const getResultStyle = () => {
                    if (result === "pass") return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30";
                    if (result === "fail") return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
                    if (result === "Not Declared Yet") return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
                    return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30";
                };

                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border shadow-sm ${getResultStyle()}`}>
                            {capitalizeEveryWord(result) || ''}
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
            renderCell: ({ row: { id, student_id, term } }) => (
                <div className="flex justify-center items-center w-full h-full">
                    <button
                        onClick={() => handleActionEdit(id, student_id, term)}
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
