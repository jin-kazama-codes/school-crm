/* eslint-disable react-hooks/rules-of-hooks */
import { useNavigate } from "@/lib/routerAdapter";
import { FileEdit, Shield, User, GraduationCap } from 'lucide-react';
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null) => {
    const navigateTo = useNavigate();
    const { capitalizeEveryWord } = Utility();

    const handleActionEdit = (id) => {
        navigateTo(`/school-house/update/${id}`, { state: { id: id } });
    };

    const columns = [
        {
            field: "name",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1.2,
            minWidth: 150,
            valueGetter: (value, row) => `${capitalizeEveryWord(row?.name) || ""}`,
            renderCell: ({ row }) => {
                const houseName = capitalizeEveryWord(row?.name) || "House";
                const colorCode = row?.color_code || "#6366f1";
                return (
                    <div className="flex items-center justify-center gap-2.5 w-full h-full">
                        <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0" 
                            style={{ backgroundColor: colorCode }}
                            title={colorCode}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            {houseName}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "captainName",
            headerName: "Captain",
            headerAlign: "center",
            align: "center",
            flex: 1.2,
            minWidth: 150,
            valueGetter: (value, row) => row?.captainName || row?.captain_name || (row?.captain ? `Student #${row.captain}` : "") || "",
            renderCell: ({ row }) => {
                const name = row?.captainName || row?.captain_name || (row?.captain ? `Student #${row.captain}` : null);
                if (!name) {
                    return (
                        <div className="flex justify-center items-center w-full h-full">
                            <span className="text-slate-400 text-xs">—</span>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center justify-center gap-2 w-full h-full">
                        <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Shield className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {capitalizeEveryWord(name)}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "viceCaptainNname",
            headerName: "Vice Captain",
            headerAlign: "center",
            align: "center",
            flex: 1.2,
            minWidth: 150,
            valueGetter: (value, row) => row?.viceCaptainName || row?.viceCaptainNname || row?.vice_captain_name || (row?.vice_captain ? `Student #${row.vice_captain}` : "") || "",
            renderCell: ({ row }) => {
                const name = row?.viceCaptainName || row?.viceCaptainNname || row?.vice_captain_name || (row?.vice_captain ? `Student #${row.vice_captain}` : null);
                if (!name) {
                    return (
                        <div className="flex justify-center items-center w-full h-full">
                            <span className="text-slate-400 text-xs">—</span>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center justify-center gap-2 w-full h-full">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {capitalizeEveryWord(name)}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "teacherName",
            headerName: "Teacher Incharge",
            headerAlign: "center",
            align: "center",
            flex: 1.3,
            minWidth: 160,
            valueGetter: (value, row) => row?.teacherName || row?.teacher_name || row?.teacher_incharge_name || (row?.teacher_incharge ? `Teacher #${row.teacher_incharge}` : "") || "",
            renderCell: ({ row }) => {
                const name = row?.teacherName || row?.teacher_name || row?.teacher_incharge_name || (row?.teacher_incharge ? `Teacher #${row.teacher_incharge}` : null);
                if (!name) {
                    return (
                        <div className="flex justify-center items-center w-full h-full">
                            <span className="text-slate-400 text-xs">—</span>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center justify-center gap-2 w-full h-full">
                        <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {capitalizeEveryWord(name)}
                        </span>
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
            valueGetter: (value, row) => `${capitalizeEveryWord(row?.status) || "Active"}`,
            renderCell: ({ row: { status } }) => {
                const isActive = (status || "").toLowerCase() === "active";
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                            {capitalizeEveryWord(status) || "Active"}
                        </span>
                    </div>
                );
            }
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
                        title="Edit"
                    >
                        <FileEdit className="w-4 h-4" />
                    </button>
                </div>
            )
        }] : [])
    ];
    return columns;
};

