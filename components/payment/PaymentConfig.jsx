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
import { Pencil, Phone } from 'lucide-react';
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null, setOpen = null) => {
    const navigateTo = useNavigate();
    const { capitalizeEveryWord } = Utility();

    const handleActionShow = (id, clss, section, firstname, lastname) => {
        setOpen(true);
        navigateTo("#", { state: { id, cls: clss, section, firstname, lastname } });
    };

    const columns = [
        {
            field: "enrollment_no",
            headerName: "Enrollment No",
            headerAlign: "center",
            align: "center",
            flex: 0.7,
            minWidth: 110,
            renderCell: ({ row }) => {
                const enrollment = row.enrollment_no ?? row.roll_no;
                if (!enrollment) return <span className="text-slate-400 font-medium">—</span>;
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            #{enrollment}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "fullname",
            headerName: "Student Name",
            headerAlign: "left",
            align: "left",
            flex: 1.2,
            minWidth: 160,
            renderCell: ({ row }) => {
                const name = `${capitalizeEveryWord(row.firstname) || ''} ${capitalizeEveryWord(row.lastname) || ''}`.trim() || '—';
                return (
                    <div className="flex items-center gap-2.5 py-1">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                            {name}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "father_name",
            headerName: "Father's Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 130,
            renderCell: ({ row }) => {
                const father = row.father_name || row.guardian_name;
                if (!father) return <span className="text-slate-400 font-medium">—</span>;
                return (
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {capitalizeEveryWord(father)}
                    </span>
                );
            }
        },
        {
            field: "contact_no",
            headerName: "Contact No",
            headerAlign: "center",
            align: "center",
            flex: 0.9,
            minWidth: 120,
            renderCell: ({ row }) => {
                const raw = row.father_contact_no || row.contact_no || row.mother_contact_no;
                if (!raw) return <span className="text-slate-400 font-medium">—</span>;
                const contact = String(raw).split('.')[0];
                return (
                    <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{contact}</span>
                    </div>
                );
            }
        },
        {
            field: "session",
            headerName: "Session",
            headerAlign: "center",
            align: "center",
            flex: 0.8,
            minWidth: 105,
            renderCell: ({ row: { session } }) => (
                <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
                    {session || '—'}
                </span>
            )
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            flex: 0.8,
            minWidth: 100,
            renderCell: ({ row: { status } }) => {
                const isActive = status === "active";
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <div
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-2xs ${isActive
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
        ...(rolePriority !== 1 ? [{
            field: "action",
            headerName: "Payment Desk",
            headerAlign: "center",
            align: "center",
            flex: 0.9,
            minWidth: 110,
            renderCell: ({ row }) => (
                <div className="flex justify-center items-center w-full h-full">
                    <button
                        onClick={() => handleActionShow(row.id, row.class, row.section, row.firstname, row.lastname)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 rounded-lg text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer shadow-2xs hover:scale-105"
                        title="Open Payment Desk"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Manage</span>
                    </button>
                </div>
            )
        }] : [])
    ];
    return columns;
};
