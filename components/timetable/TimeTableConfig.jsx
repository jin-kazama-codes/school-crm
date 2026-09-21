/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */
import { useNavigate } from "@/lib/routerAdapter";
import { Pencil, BookOpen, Clock } from "lucide-react";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null) => {
  const navigateTo = useNavigate();
  const { appendSuffix, capitalizeEveryWord } = Utility();

  const handleActionEdit = (class_id, section_id, day, batch) => {
    navigateTo(`/time-table/update/${class_id}/${section_id}`, {
      state: { class_id: class_id, section_id: section_id, day: day, batch: batch }
    });
  };

  const getDayBadge = (day) => {
    const d = (day || "").toLowerCase();
    const colors = {
      monday: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
      tuesday: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
      wednesday: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
      thursday: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30",
      friday: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
      saturday: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
      sunday: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    };
    const style = colors[d] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-xs capitalize ${style}`}>
        {capitalizeEveryWord(day) || "—"}
      </span>
    );
  };

  const columns = [
    {
      field: "class_name",
      headerName: "Class",
      headerAlign: "center",
      align: "center",
      flex: 0.9,
      minWidth: 100,
      renderCell: ({ row }) => {
        const clsName = row?.class_name || (row?.class_id ? `Class ${row.class_id}` : "—");
        const formatted = !isNaN(Number(clsName)) ? appendSuffix(clsName) : clsName;
        return (
          <div className="flex items-center justify-center font-bold text-slate-800 dark:text-zinc-200">
            {formatted}
          </div>
        );
      }
    },
    {
      field: "section_name",
      headerName: "Section",
      headerAlign: "center",
      align: "center",
      flex: 0.7,
      minWidth: 80,
      renderCell: ({ row }) => {
        const secName = row?.section_name || (row?.section_id ? `Sec ${row.section_id}` : "—");
        return (
          <div className="flex items-center justify-center">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              {secName}
            </span>
          </div>
        );
      }
    },
    {
      field: "period",
      headerName: "Period",
      headerAlign: "center",
      align: "center",
      flex: 0.8,
      minWidth: 95,
      renderCell: ({ row }) => {
        const periodNum = row?.period;
        return (
          <div className="flex items-center justify-center">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30">
              Period {periodNum ?? "—"}
            </span>
          </div>
        );
      }
    },
    {
      field: "subject_name",
      headerName: "Subject",
      headerAlign: "center",
      align: "center",
      flex: 1.1,
      minWidth: 125,
      renderCell: ({ row }) => {
        const subName = row?.subject_name || (row?.subject_id ? `Subject ${row.subject_id}` : "—");
        return (
          <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="truncate">{capitalizeEveryWord(subName)}</span>
          </div>
        );
      }
    },
    {
      field: "duration",
      headerName: "Duration",
      headerAlign: "center",
      align: "center",
      flex: 0.9,
      minWidth: 105,
      renderCell: ({ row }) => {
        const duration = row?.duration || "—";
        return (
          <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-zinc-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
            <span>{duration}</span>
          </div>
        );
      }
    },
    {
      field: "day",
      headerName: "Day",
      headerAlign: "center",
      align: "center",
      flex: 0.9,
      minWidth: 110,
      renderCell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            {getDayBadge(row?.day)}
          </div>
        );
      }
    },
    {
      field: "batch",
      headerName: "Batch",
      headerAlign: "center",
      align: "center",
      flex: 0.8,
      minWidth: 85,
      renderCell: ({ row }) => {
        const batch = row?.batch;
        return (
          <div className="flex items-center justify-center">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 capitalize">
              {batch || "—"}
            </span>
          </div>
        );
      }
    },
    (rolePriority === null || rolePriority <= 3) && {
      field: "action",
      headerName: "Action",
      headerAlign: "center",
      align: "center",
      flex: 0.6,
      minWidth: 70,
      renderCell: ({ row: { class_id, section_id, day, batch } }) => {
        return (
          <div className="flex justify-center items-center w-full h-full">
            <button
              onClick={() => handleActionEdit(class_id, section_id, day, batch)}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              title="Edit Timetable"
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

