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

export const datagridColumns = (rolePriority = null, setOpen = null, setSelectedId = null) => {
    const { capitalizeEveryWord, formatDate } = Utility();
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        navigateTo(`/bus/update/${id}`, { state: { id: id } });
    };

    const handleActionShow = (id) => {
        if (setSelectedId) setSelectedId(id);
        if (setOpen) setOpen(true);
    };

    const columns = [
        {
            field: "registration_no",
            headerName: "Registration Number",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 140,
            renderCell: ({ row: { registration_no } }) => {
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                            {registration_no || "—"}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "route",
            headerName: "Route",
            headerAlign: "center",
            align: "center",
            flex: 1.1,
            minWidth: 140,
            renderCell: ({ row: { route } }) => (
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {capitalizeEveryWord(route) || "—"}
                </span>
            )
        },
        {
            field: "driver",
            headerName: "Driver",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            valueGetter: (value, row) => `${capitalizeEveryWord(row.driver) || ""}`,
        },
        {
            field: "driver_contact",
            headerName: "Contact",
            headerAlign: "center",
            align: "center",
            flex: 0.9,
            minWidth: 110,
            renderCell: ({ row: { driver_contact } }) => (
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                    {driver_contact || "—"}
                </span>
            )
        },
        {
            field: "capacity",
            headerName: "Capacity",
            headerAlign: "center",
            align: "center",
            flex: 0.8,
            minWidth: 95,
            renderCell: ({ row: { capacity } }) => (
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#202020] px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#303030]">
                    {capacity ? `${capacity} Seats` : "—"}
                </span>
            )
        },
        {
            field: "created_at",
            headerName: "Acquired Date",
            headerAlign: "center",
            align: "center",
            flex: 0.9,
            minWidth: 120,
            renderCell: ({ row: { created_at } }) => {
                if (!created_at) return <span className="text-slate-400 font-medium">—</span>;
                return (
                    <div className="flex justify-center items-center w-full h-full text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {formatDate(created_at)}
                    </div>
                );
            }
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 110,
            renderCell: ({ row: { status } }) => {
                const isActive = status === "active";
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-2xs ${
                            isActive
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                                : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
                        }`}>
                            {capitalizeEveryWord(status) || ''}
                        </div>
                    </div>
                );
            }
        },
        rolePriority !== 1 && {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 90,
            renderCell: ({ row: { id } }) => {
                return (
                    <div className="flex justify-center items-center gap-1.5 w-full h-full">
                        <button
                            onClick={() => handleActionShow(id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer shadow-2xs"
                            title="View Bus Dossier"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleActionEdit(id)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-2xs"
                            title="Edit Bus"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                );
            }
        }
    ].filter(Boolean);
    return columns;
};
