/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "@/lib/routerAdapter";
import { FileEdit, User, Calendar, BookOpen, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import dayjs from "dayjs";

export const datagridColumns = (rolePriority = null) => {
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        navigateTo(`/attendance/update/${id}`, { state: { id: id } });
    };

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "present") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Present
                </span>
            );
        }
        if (s === "absent") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Absent
                </span>
            );
        }
        if (s === "leave") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    On Leave
                </span>
            );
        }
        if (s.includes("half")) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    Half Day
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 capitalize">
                {status || "Unknown"}
            </span>
        );
    };

    const getRoleBadge = (parent) => {
        const p = (parent || "").toLowerCase();
        if (p === "student") {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 capitalize">
                    Student
                </span>
            );
        }
        if (p === "teacher") {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 capitalize">
                    Teacher
                </span>
            );
        }
        if (p === "employee") {
            return (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 capitalize">
                    Employee
                </span>
            );
        }
        return (
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 capitalize">
                {parent || "User"}
            </span>
        );
    };

    const columns = [
        {
            field: "name",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1.5,
            minWidth: 180,
            renderCell: ({ row }) => {
                const displayName = row?.name || row?.teacherName || (row?.parent_id ? `${row?.parent || 'User'} #${row?.parent_id}` : "Unknown");
                return (
                    <div className="flex items-center justify-center gap-2.5 w-full h-full">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left truncate max-w-[130px]">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                                {displayName}
                            </span>
                            {row?.parent_id && (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                    ID: #{row.parent_id}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            field: "parent",
            headerName: "Role / Type",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            renderCell: ({ row }) => (
                <div className="flex justify-center items-center w-full h-full">
                    {getRoleBadge(row?.parent)}
                </div>
            )
        },
        {
            field: "class_section",
            headerName: "Class & Section",
            headerAlign: "center",
            align: "center",
            flex: 1.2,
            minWidth: 140,
            renderCell: ({ row }) => {
                const classText = row?.class_name ? `Class ${row.class_name}` : (row?.class_id ? `Class #${row.class_id}` : null);
                const sectionText = row?.section_name ? `Sec ${row.section_name}` : (row?.section_id ? `Sec #${row.section_id}` : null);

                if (!classText && !sectionText) {
                    return (
                        <div className="flex justify-center items-center w-full h-full">
                            <span className="text-slate-400 text-xs">—</span>
                        </div>
                    );
                }

                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <span>{classText || ""}</span>
                            {classText && sectionText && <span className="text-slate-400">•</span>}
                            <span>{sectionText || ""}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            field: "date",
            headerName: "Date",
            headerAlign: "center",
            align: "center",
            flex: 1.1,
            minWidth: 130,
            renderCell: ({ row }) => {
                const formattedDate = row?.date ? dayjs(row.date).format("DD MMM YYYY") : "—";
                return (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium w-full h-full">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                    </div>
                );
            }
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            flex: 1.1,
            minWidth: 120,
            renderCell: ({ row }) => (
                <div className="flex justify-center items-center w-full h-full">
                    {getStatusBadge(row?.status || row?.subjects)}
                </div>
            )
        },
        ...(rolePriority !== 1 ? [{
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 0.8,
            minWidth: 80,
            renderCell: ({ row: { id } }) => (
                <div className="flex justify-center items-center w-full h-full">
                    <button
                        onClick={() => handleActionEdit(id)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                        title="Edit Attendance"
                    >
                        <FileEdit className="w-4 h-4" />
                    </button>
                </div>
            )
        }] : [])
    ];
    return columns;
};

