/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import {
    X,
    User,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Save,
    AlertCircle,
    FileText
} from "lucide-react";
import API from "../../apis";
import { Utility } from "../utility";

const STATUS_OPTIONS = [
    {
        value: "present",
        label: "Present",
        description: "Full day attendance marked",
        icon: CheckCircle2,
        activeClass: "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-300 ring-2 ring-emerald-500/20",
        badgeClass: "bg-emerald-500 text-white",
        dotClass: "bg-emerald-500"
    },
    {
        value: "absent",
        label: "Absent",
        description: "Marked absent for the day",
        icon: XCircle,
        activeClass: "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/40 dark:border-rose-500 dark:text-rose-300 ring-2 ring-rose-500/20",
        badgeClass: "bg-rose-500 text-white",
        dotClass: "bg-rose-500"
    },
    {
        value: "half-day",
        label: "Half Day",
        description: "Attended partial school hours",
        icon: Clock,
        activeClass: "bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-950/40 dark:border-purple-500 dark:text-purple-300 ring-2 ring-purple-500/20",
        badgeClass: "bg-purple-500 text-white",
        dotClass: "bg-purple-500"
    }
];

const AttendanceEditModal = ({ isOpen, onClose, record, onSuccess }) => {
    const [status, setStatus] = useState("present");
    const [remark, setRemark] = useState("");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const { toastAndNavigate } = Utility();

    useEffect(() => {
        if (record) {
            const rawStatus = (record.status || "present").toLowerCase();
            const normalizedStatus = rawStatus.includes("half")
                ? "half-day"
                : (rawStatus === "absent" ? "absent" : "present");

            setStatus(normalizedStatus);
            setRemark(record.remark || "");
            setDate(record.date ? dayjs(record.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"));
            setError("");
        }
    }, [record, isOpen]);

    if (!isOpen || !record) return null;

    const displayName = record.name || record.teacherName || `${record.parent || "User"} #${record.parent_id || record.id}`;
    const role = (record.parent || "student").toLowerCase();
    const classText = record.class_name ? `Class ${record.class_name}` : (record.class_id ? `Class #${record.class_id}` : null);
    const sectionText = record.section_name ? `Sec ${record.section_name}` : (record.section_id ? `Sec #${record.section_id}` : null);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                id: record.id,
                status: status,
                remark: remark || null,
                date: date ? new Date(date).toISOString() : undefined
            };

            const res = await API.AttendanceAPI.updateAttendance(payload);
            const data = res?.data || res;

            if (data?.status === "Success" || data?.data || res?.status === 200) {
                setLoading(false);
                toastAndNavigate(dispatch, true, "success", "Attendance Updated Successfully");
                if (onSuccess) {
                    onSuccess({
                        ...record,
                        status: status,
                        remark: remark,
                        date: date
                    });
                }
                onClose();
            } else {
                setLoading(false);
                setError(data?.msg || "Failed to update attendance");
            }
        } catch (err) {
            setLoading(false);
            console.error("Attendance update error:", err);
            setError(err?.response?.data?.msg || err?.message || "An error occurred while updating attendance");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-[#242424] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-[#202020] bg-slate-50/70 dark:bg-[#161616]/70">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                Update Attendance
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Modify attendance status and logs
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* User Info Card */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-100 dark:border-[#262626] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                    {displayName}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                    <span className="capitalize font-medium text-blue-600 dark:text-blue-400">
                                        {role}
                                    </span>
                                    {(classText || sectionText) && (
                                        <>
                                            <span>•</span>
                                            <span>{[classText, sectionText].filter(Boolean).join(" - ")}</span>
                                        </>
                                    )}
                                    {record.parent_id && (
                                        <>
                                            <span>•</span>
                                            <span>ID: #{record.parent_id}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 shrink-0">
                            {dayjs(date).format("DD MMM YYYY")}
                        </span>
                    </div>

                    {/* Status Selection Pills */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Attendance Status*
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {STATUS_OPTIONS.map((opt) => {
                                const IconComponent = opt.icon;
                                const isSelected = status === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setStatus(opt.value)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 cursor-pointer text-center ${
                                            isSelected
                                                ? opt.activeClass
                                                : "border-slate-200 dark:border-[#282828] bg-white dark:bg-[#161616] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1d1d1d]"
                                        }`}
                                    >
                                        <IconComponent className="w-5 h-5 mb-1.5" />
                                        <span className="text-xs font-bold leading-tight">
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date Input */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Attendance Date
                        </label>
                        <div className="relative">
                            <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-10 pr-3.5 py-2 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    {/* Remark Input */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Remark / Note (Optional)
                        </label>
                        <div className="relative">
                            <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                            <textarea
                                rows={2}
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="e.g., Medical leave approved, Arrived late due to bus delay"
                                className="w-full pl-10 pr-3.5 py-2 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-slate-100 resize-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#202020]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2c2c2c] hover:bg-slate-50 dark:hover:bg-[#222] rounded-xl transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AttendanceEditModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    record: PropTypes.object,
    onSuccess: PropTypes.func
};

export default AttendanceEditModal;
