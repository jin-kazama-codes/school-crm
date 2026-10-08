/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector } from "react-redux";
import { useNavigate } from "@/lib/routerAdapter";
import { Pencil, User, FileText, Calendar } from 'lucide-react';
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null, handleViewReportCard = null) => {
    const schoolClasses = useSelector(state => state.schoolClasses);
    const allClasses = useSelector(state => state.allClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allSections = useSelector(state => state.allSections);

    const navigateTo = useNavigate();
    const { appendSuffix, findById, capitalizeEveryWord} = Utility();

    const handleActionEdit = (id, student_id, term) => {
        navigateTo(`/marksheet/update/${student_id}`, { state: { id: id, student_id: student_id, term: term } });
    };

    const columns = [
        {
            field: "student_name",
            headerName: "Student Name",
            headerAlign: "center",
            align: "center",
            flex: 1.5,
            minWidth: 180,
            valueGetter: (value, row) => row?.student_name || row?.studentName || (row?.student_id ? `Student #${row.student_id}` : "") || "",
            renderCell: ({ row }) => {
                const name = row?.student_name || row?.studentName;
                const displayName = name ? capitalizeEveryWord(name) : (row?.student_id ? `Student #${row.student_id}` : "Unknown");
                return (
                    <div className="flex items-center justify-center gap-2.5 w-full h-full">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left truncate max-w-[140px]">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                                {displayName}
                            </span>
                            {(row?.roll_no || row?.enrollment_no || row?.student_id) && (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                    {row?.roll_no ? `Roll: ${row.roll_no}` : ''}
                                    {row?.roll_no && row?.enrollment_no ? ' • ' : ''}
                                    {row?.enrollment_no ? `Enroll: ${row.enrollment_no}` : (!row?.roll_no ? `ID: #${row.student_id}` : '')}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            field: "class_id",
            headerName: "Class & Section",
            headerAlign: "center",
            align: "center",
            flex: 1.2,
            minWidth: 140,
            renderCell: (params) => {
                const classObj = findById(params?.row?.class_id, schoolClasses?.listData) || findById(params?.row?.class_id, allClasses?.listData);
                const secObj = findById(params?.row?.section_id, schoolSections?.listData) || findById(params?.row?.section_id, allSections?.listData);
                
                const rawClassName = params?.row?.class_name || classObj?.class_name || classObj?.name;
                const formattedClass = rawClassName ? (!isNaN(Number(rawClassName)) ? appendSuffix(rawClassName) : rawClassName) : (params?.row?.class_id ? `Class ${params.row.class_id}` : '—');
                const rawSectionName = params?.row?.section_name || secObj?.section_name || secObj?.name;
                const formattedSection = rawSectionName ? (rawSectionName.toLowerCase().startsWith('sec') ? rawSectionName : `Sec ${rawSectionName}`) : (params?.row?.section_id ? `Sec ${params.row.section_id}` : '');

                return (
                    <div className="flex items-center justify-center w-full h-full font-medium text-slate-700 dark:text-slate-200 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800">
                            <span>{formattedClass}</span>
                            {formattedSection && <span className="text-slate-400">•</span>}
                            <span>{formattedSection}</span>
                        </span>
                    </div>
                );
            }
        },
        {
            field: "session",
            headerName: "Session",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            renderCell: ({ row: { session } }) => (
                <div className="flex justify-center items-center w-full h-full">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        {session || "—"}
                    </span>
                </div>
            )
        },
        {
            field: "term",
            headerName: "Term",
            headerAlign: "center",
            align: "center",
            flex: 0.9,
            minWidth: 85,
            renderCell: ({ row: { term } }) => (
                <div className="flex justify-center items-center w-full h-full">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40">
                        Term {term || "I"}
                    </span>
                </div>
            )
        },
        {
            field: "created_at",
            headerName: "Issued Date",
            headerAlign: "center",
            align: "center",
            flex: 1.1,
            minWidth: 120,
            renderCell: ({ row }) => {
                const dateStr = row?.created_at
                    ? new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : "—";
                return (
                    <div className="flex justify-center items-center gap-1.5 w-full h-full text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dateStr}</span>
                    </div>
                );
            }
        },
        {
            field: "result",
            headerName: "Result",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 110,
            valueFormatter: (value) => `${capitalizeEveryWord(value) || ""}`,
            renderCell: ({ row: { result } }) => {
                const getResultStyle = () => {
                    if (result === "pass") return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30";
                    if (result === "fail") return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
                    if (result === "Not Declared Yet") return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
                    return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30";
                };

                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border shadow-xs ${getResultStyle()}`}>
                            {capitalizeEveryWord(result) || ''}
                        </div>
                    </div>
                );
            }
        },
        ...(rolePriority !== 1 ? [{
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            renderCell: ({ row }) => (
                <div className="flex justify-center items-center gap-1.5 w-full h-full">
                    <button
                        onClick={() => handleViewReportCard && handleViewReportCard(row)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer shadow-2xs"
                        title="View Official Report Card"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleActionEdit(row.id, row.student_id, row.term)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-2xs"
                        title="Edit Marksheet"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>
            )
        }] : [])
    ];
    return columns;
};


