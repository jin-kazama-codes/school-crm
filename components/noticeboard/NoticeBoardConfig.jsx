/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from "@/lib/routerAdapter";
import { Pencil, FileText, Info } from 'lucide-react';

import dayjs from "dayjs";
import { Utility } from "../utility";

const DescriptionCell = ({ title, description }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 340, placement: 'top' });
    const triggerRef = useRef(null);
    const timeoutRef = useRef(null);

    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipWidth = Math.min(380, Math.max(280, window.innerWidth - 32));
        
        // Horizontal centering clamped to viewport margins
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

        // Vertical placement: prefer top if space available, otherwise bottom
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        const placement = spaceAbove > 200 || spaceAbove >= spaceBelow ? 'top' : 'bottom';
        const top = placement === 'top' ? rect.top - 8 : rect.bottom + 8;

        setCoords({ top, left, width: tooltipWidth, placement });
    };

    const handleMouseEnter = () => {
        if (!description) return;
        clearTimeout(timeoutRef.current);
        updatePosition();
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    const handleTooltipMouseEnter = () => {
        clearTimeout(timeoutRef.current);
    };

    const handleTooltipMouseLeave = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    if (!description) {
        return <span className="text-slate-400 dark:text-zinc-500 italic">—</span>;
    }

    return (
        <div className="relative inline-flex items-center justify-center max-w-full group">
            <span
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="truncate block max-w-[220px] sm:max-w-[280px] md:max-w-[340px] text-slate-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors cursor-pointer select-none"
            >
                {description}
            </span>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    onMouseEnter={handleTooltipMouseEnter}
                    onMouseLeave={handleTooltipMouseLeave}
                    style={{
                        position: 'fixed',
                        ...(coords.placement === 'top' 
                            ? { bottom: `${window.innerHeight - coords.top}px` } 
                            : { top: `${coords.top}px` }),
                        left: `${coords.left}px`,
                        width: `${coords.width}px`,
                        zIndex: 99999,
                    }}
                    className="p-4 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md border border-slate-200/90 dark:border-zinc-700/80 rounded-2xl shadow-2xl shadow-slate-900/15 dark:shadow-black/60 text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
                >
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <FileText className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {title || 'Notice Description'}
                            </span>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex-shrink-0">
                            Full Notice
                        </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-h-56 overflow-y-auto custom-scrollbar font-normal whitespace-pre-wrap break-words">
                        {description}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export const datagridColumns = (rolePriority = null) => {
    const { capitalizeEveryWord } = Utility();
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        navigateTo(`/noticeboard/update/${id}`, { state: { id: id } });
    };

    const columns = [
        {
            field: "title",
            headerName: "Title",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 140,
            valueGetter: (value, row) => {
                const r = row || value?.row || {};
                const text = r.title || (typeof value === "string" ? value : "");
                return capitalizeEveryWord(text) || "";
            }
        },
        {
            field: "description",
            headerName: "Description",
            headerAlign: "center",
            align: "center",
            flex: 1.5,
            minWidth: 160,
            valueGetter: (value, row) => {
                const r = row || value?.row || {};
                return r.description || (typeof value === "string" ? value : "") || "";
            },
            renderCell: ({ row, value }) => {
                const r = row || {};
                const desc = r.description || (typeof value === "string" ? value : "") || "";
                const title = r.title || "";
                return <DescriptionCell title={title} description={desc} />;
            }
        },
        {
            field: "publish_date",
            headerName: "Publish Date",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 110,
            valueGetter: (value, row) => {
                const r = row || value?.row || {};
                const dateVal = r.publish_date || value;
                if (!dateVal) return "—";
                return dayjs(dateVal).isValid() ? dayjs(dateVal).format("YYYY-MM-DD") : String(dateVal);
            }
        },
        {
            field: "expiry_date",
            headerName: "Expiry Date",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 110,
            valueGetter: (value, row) => {
                const r = row || value?.row || {};
                const dateVal = r.expiry_date || value;
                if (!dateVal) return "—";
                return dayjs(dateVal).isValid() ? dayjs(dateVal).format("YYYY-MM-DD") : String(dateVal);
            }
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            renderCell: ({ row: { status } }) => {
                const isActive = status === "active";
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <div
                            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm ${
                                isActive 
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30" 
                                    : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
                            }`}
                        >
                            {status || 'Unknown'}
                        </div>
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
            minWidth: 75,
            renderCell: ({ row: { id } }) => {
                return (
                    <div className="flex justify-center items-center w-full h-full">
                        <button
                            onClick={() => handleActionEdit(id)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
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
