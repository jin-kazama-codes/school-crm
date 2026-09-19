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

export const datagridColumns = () => {
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        navigateTo(`/school-duration/update/${id}`, { state: { id: id } });
    };

    const columns = [
        {
            field: "period",
            headerName: "Period",
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "halves",
            headerName: "Halves",
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "recess_time",
            headerName: "Recess (mins)",
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "first_half_period_duration",
            headerName: "First Half Duration",
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "second_half_period_duration",
            headerName: "Second Half Duration",
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "opening_time",
            headerName: "Opening",
            headerAlign: "center",
            align: "center",
            flex: 1,
            valueFormatter: (value) => new Date(value).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })
        },
        {
            field: "closing_time",
            headerName: "Closing",
            headerAlign: "center",
            align: "center",
            flex: 1,
            valueFormatter: (value) => new Date(value).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })
        },
        {
            field: "employee_entry_time",
            headerName: "Emp Entry",
            headerAlign: "center",
            align: "center",
            flex: 1,
            valueFormatter: (value) => new Date(value).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })
        },
        {
            field: "employee_exit_time",
            headerName: "Emp Exit",
            headerAlign: "center",
            align: "center",
            flex: 1,
            valueFormatter: (value) => new Date(value).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })
        },
        {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
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
            },
        }
    ];
    return columns;
};
