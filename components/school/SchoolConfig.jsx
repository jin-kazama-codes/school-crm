/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useNavigate } from "@/lib/routerAdapter";
import { useSelector } from "react-redux";
import { Eye, FileEdit } from 'lucide-react';
import { Utility } from "../utility";

export const datagridColumns = (setOpen = null) => {

    const { capitalizeEveryWord } = Utility();
    const selected = useSelector(state => state.menuItems.selected);
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        navigateTo(`/${selected.toLowerCase()}/update/${id}`, { state: { id: id } });
    };

    const handleActionShow = (id) => {
        setOpen(true);
        navigateTo("#", { state: { id: id } });
    };

    const columns = [
        {
            field: "city",
            headerName: "City",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                let cityName = params?.row?.city;
                return (
                    <div>
                        {cityName ? cityName : '/'}
                    </div>
                );
            }
        },
        {
            field: "name",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
        },
        {
            field: "board",
            headerName: "Board",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
        },
        {
            field: "sub_type",
            headerName: "Sub Type",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            valueGetter: (value, row) => capitalizeEveryWord(row.sub_type) || ''
        },
        {
            field: "contact_no_1",
            headerName: "Contact Number",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
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
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isActive 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                        }`}>
                            {capitalizeEveryWord(status) || ''}
                        </div>
                    </div>
                );
            },
        },
        {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            renderCell: ({ row: { id } }) => {
                return (
                    <div className="flex justify-center items-center gap-2 w-full h-full">
                        <button
                            onClick={() => handleActionEdit(id)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                        >
                            <FileEdit className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => handleActionShow(id)}
                            className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        }
    ];
    return columns;
};
