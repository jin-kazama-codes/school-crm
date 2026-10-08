/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useNavigate } from "@/lib/routerAdapter";
import { Pencil, Eye } from 'lucide-react';
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null, setOpenModal = null, setSelectedEmployeeId = null) => {
    const navigateTo = useNavigate();
    const { capitalizeEveryWord, formatDate } = Utility();

    const handleActionEdit = (id) => {
        navigateTo(`/employee/update/${id}`, { state: { id: id } });
    };

    const handleActionShow = (id) => {
        if (setSelectedEmployeeId) setSelectedEmployeeId(id);
        if (setOpenModal) setOpenModal(true);
    };

    const columns = [
        {
            field: "fullname",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            valueGetter: (value, row) => `${capitalizeEveryWord(row.firstname) || ''} ${capitalizeEveryWord(row.lastname) || ''}`
        },
        {
            field: "email",
            headerName: "E-mail",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => params.value || 'N/A',
        },
        {
            field: "contact_no",
            headerName: "Contact No",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
        },
        {
            field: "role",
            headerName: "Role",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
        },
        {
            field: "created_at",
            headerName: "Joining Date",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            valueFormatter: (value) => `${formatDate(value)}`
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
        {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 90,
            renderCell: ({ row: { id } }) => (
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
                        title="Preview Dossier"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];
    return columns;
};
