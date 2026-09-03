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
import { Pencil } from 'lucide-react';
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null) => {
  const { capitalizeEveryWord, formatDate } = Utility();
  const navigateTo = useNavigate();

  const handleActionEdit = (id) => {
    navigateTo(`/holiday/update/${id}`, { state: { id: id } });
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 120,
      valueGetter: (params) =>
        `${
          capitalizeEveryWord(params.row.title) || ""
        } `,
    },
    {
      field: "startDate",
      headerName: "Closing Date",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100,
      valueFormatter: (value) => `${formatDate(value)}`
    },
    {
      field: "endDate",
      headerName: "Opening Date",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100,
      valueFormatter: (value) => `${formatDate(value)}`
    },
    {
      field: "notes",
      headerName: "Notes",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100,
      valueFormatter :(params) => `${capitalizeEveryWord(params.value) || ""}`,
    },
    {
      field: "type",
      headerName: "Type",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 120,
      renderCell: ({ row: { type } }) => {
        const nameParts = type.split("_");
        const capitalizedParts = nameParts.map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        );
        const typeAll = capitalizedParts.join(" ");
        
        let bgColors = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30"; // default (staff_only)
        if (type === "school_closure") {
            bgColors = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30";
        } else if (type === "partial_closure") {
            bgColors = "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
        }

        return (
          <div className="flex justify-center items-center w-full h-full">
            <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm border ${bgColors}`}>
              {typeAll}
            </div>
          </div>
        );
      },
    },
    rolePriority !== 1 && {
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
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
                <Pencil className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ].filter(Boolean);
  
  return columns;
};
