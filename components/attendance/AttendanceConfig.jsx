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
import { FileEdit } from 'lucide-react';

export const datagridColumns = (rolePriority = null) => {
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        navigateTo(`/attendance/update/${id}`, { state: { id: id } });
    };

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
            field: "subjects",
            headerName: "Attendance",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
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
                        title="Edit Attendance"
                    >
                        <FileEdit className="w-5 h-5" />
                    </button>
                </div>
            )
        }] : [])
    ];
    return columns;
};
