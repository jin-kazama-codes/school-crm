/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useNavigate } from "@/lib/routerAdapter";
import { FileEdit } from 'lucide-react';
import { Utility } from "../utility";

export const datagridColumns = (handleDialogOpen) => {
    const { capitalizeEveryWord, formatDate } = Utility();
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        handleDialogOpen();
        navigateTo("#", { state: { id: id } });
    };

    const columns = [
        {
            field: "name",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            renderCell: ({ row: { status } }) => {
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            status === "active"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                        }`}>
                            {capitalizeEveryWord(status) || ''}
                        </div>
                    </div>
                );
            },
        },
        {
            field: "updated_at",
            headerName: "Updated",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            valueFormatter: (value) => `${formatDate(value)}`
        },
        {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 75,
            renderCell: ({ row: { id } }) => {
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <button
                            onClick={() => handleActionEdit(id)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                            title="Edit"
                        >
                            <FileEdit className="w-5 h-5" />
                        </button>
                    </div>
                );
            }
        }
    ];
    return columns;
};
