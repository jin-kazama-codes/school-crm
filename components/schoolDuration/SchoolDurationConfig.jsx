/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { Pencil, Eye, Clock, Layers, Users, Sun, Moon, Sparkles, Timer } from 'lucide-react';
import dayjs from "dayjs";

const formatTime = (time) => {
  if (!time) return "—";
  const d = dayjs(time);
  return d.isValid() ? d.format("hh:mm A") : "—";
};

export const datagridColumns = (rolePriority = null, onView = null, onEdit = null) => {
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        if (onEdit) {
            onEdit(id);
        } else {
            navigateTo(`/school-duration/update/${id}`, { state: { id: id } });
        }
    };

    const handleActionView = (row) => {
        if (onView) {
            onView(row);
        }
    };

    const getBatchBadge = (batch) => {
        const b = (batch || "both").toLowerCase();
        if (b === "junior") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 capitalize">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Junior
                </span>
            );
        }
        if (b === "senior") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 capitalize">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Senior
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 capitalize">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Both Batches
            </span>
        );
    };

    const getShiftBadge = (shifts) => {
        const s = (shifts || "morning").toLowerCase();
        if (s === "evening") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 capitalize">
                    <Moon className="w-3 h-3 text-purple-600" />
                    Evening
                </span>
            );
        }
        if (s === "both") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 capitalize">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Dual Shift
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 capitalize">
                <Sun className="w-3 h-3 text-amber-600" />
                Morning
            </span>
        );
    };

    const columns = [
        {
            field: "batch",
            headerName: "Batch",
            headerAlign: "center",
            align: "center",
            flex: 1.1,
            minWidth: 120,
            renderCell: ({ row }) => (
                <div className="flex items-center justify-center w-full h-full">
                    {getBatchBadge(row?.batch)}
                </div>
            )
        },
        {
            field: "shifts",
            headerName: "Shift",
            headerAlign: "center",
            align: "center",
            flex: 1.1,
            minWidth: 120,
            renderCell: ({ row }) => (
                <div className="flex items-center justify-center w-full h-full">
                    {getShiftBadge(row?.shifts)}
                </div>
            )
        },
        {
            field: "period",
            headerName: "Periods / Halves",
            headerAlign: "center",
            align: "center",
            flex: 1.2,
            minWidth: 130,
            renderCell: ({ row }) => (
                <div className="flex items-center justify-center gap-1.5 w-full h-full">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span>{row?.period || 0} Periods</span>
                        <span className="text-slate-400 font-normal">({row?.halves || 2} Halves)</span>
                    </div>
                </div>
            )
        },
        {
            field: "period_duration",
            headerName: "Period Duration",
            headerAlign: "center",
            align: "center",
            flex: 1.2,
            minWidth: 130,
            renderCell: ({ row }) => {
                const first = row?.first_half_period_duration || "—";
                const second = row?.second_half_period_duration || first;
                return (
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-medium w-full h-full">
                        <Timer className="w-3.5 h-3.5 text-slate-400" />
                        <span>{first} / {second} mins</span>
                    </div>
                );
            }
        },
        {
            field: "recess_time",
            headerName: "Recess",
            headerAlign: "center",
            align: "center",
            flex: 0.9,
            minWidth: 95,
            renderCell: ({ row }) => (
                <div className="flex items-center justify-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 w-full h-full">
                    {row?.recess_time ? `${row.recess_time} mins` : "—"}
                </div>
            )
        },
        {
            field: "school_hours",
            headerName: "School Hours",
            headerAlign: "center",
            align: "center",
            flex: 1.4,
            minWidth: 155,
            renderCell: ({ row }) => {
                const open = formatTime(row?.opening_time);
                const close = formatTime(row?.closing_time);
                return (
                    <div className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200 w-full h-full">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{open} - {close}</span>
                    </div>
                );
            }
        },
        {
            field: "employee_hours",
            headerName: "Staff Hours",
            headerAlign: "center",
            align: "center",
            flex: 1.4,
            minWidth: 155,
            renderCell: ({ row }) => {
                const entry = formatTime(row?.employee_entry_time);
                const exit = formatTime(row?.employee_exit_time);
                return (
                    <div className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 w-full h-full">
                        <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{entry} - {exit}</span>
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
            minWidth: 100,
            renderCell: ({ row }) => {
                return (
                    <div className="flex justify-center items-center gap-1.5 w-full h-full">
                        {/* View Dossier Button */}
                        <button
                            onClick={() => handleActionView(row)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                            title="View Schedule Dossier"
                        >
                            <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        {rolePriority !== 1 && (
                            <button
                                onClick={() => handleActionEdit(row.id)}
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                                title="Edit School Duration"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            },
        }
    ];
    return columns;
};
