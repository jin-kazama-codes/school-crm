/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 */

import { useNavigate } from "@/lib/routerAdapter";
import { Pencil } from "lucide-react";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null) => {
  const { capitalizeEveryWord } = Utility();
  const navigateTo = useNavigate();

  const handleActionEdit = (id) => {
    navigateTo(`/homework/update/${id}`, { state: { id } });
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => {
        const r = row || value?.row || {};
        const title = r.title || (typeof value === "string" ? value : "");
        return capitalizeEveryWord(title) || "";
      },
    },
    {
      field: "class_id",
      headerName: "Class",
      headerAlign: "center",
      align: "center",
      flex: 0.6,
      minWidth: 80,
      valueGetter: (value, row) => {
        const r = row || value?.row || {};
        return capitalizeEveryWord(r.class_name || r.class || r.class_id || "");
      },
    },
    {
      field: "section_id",
      headerName: "Section",
      headerAlign: "center",
      align: "center",
      flex: 0.6,
      minWidth: 80,
      valueGetter: (value, row) => {
        const r = row || value?.row || {};
        return capitalizeEveryWord(r.section_name || r.section || r.section_id || "");
      },
    },
    {
      field: "subject_id",
      headerName: "Subject",
      headerAlign: "center",
      align: "center",
      flex: 0.8,
      minWidth: 100,
      valueGetter: (value, row) => {
        const r = row || value?.row || {};
        return capitalizeEveryWord(r.subject_name || r.subject || r.subject_id || "");
      },
    },
    {
      field: "status",
      headerName: "Status",
      headerAlign: "center",
      align: "center",
      flex: 0.7,
      minWidth: 90,
      renderCell: ({ row: { status } }) => {
        const isActive = status === "active";
        return (
          <div className="flex justify-center items-center w-full h-full">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border shadow-sm ${
                isActive
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                  : "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
    },
    rolePriority !== null &&
      rolePriority <= 3 && {
        field: "action",
        headerName: "Action",
        headerAlign: "center",
        align: "center",
        flex: 0.5,
        minWidth: 70,
        renderCell: ({ row: { id } }) => (
          <div className="flex justify-center items-center w-full h-full">
            <button
              onClick={() => handleActionEdit(id)}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        ),
      },
  ].filter(Boolean);

  return columns;
};
