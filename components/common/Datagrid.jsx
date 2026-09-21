/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import PropTypes from "prop-types";
import {
    Download,
    PlusCircle,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    Columns,
    Filter,
    X,
    Search,
    Upload
} from "lucide-react";

import ImportComponent from "../models/ImportModel";
import ImportTeacher from "../models/ImportTeacher";
import ImportEmployee from "../models/ImportEmployee";
import classNames from '../modules';
import EmptyOverlayGrid from "./EmptyOverlayGrid";
import { multipleSkeletons } from "./LoadingSkeleton";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCellDisplayValue(col, row) {
    let value = row[col.field];

    if (col.valueGetter) {
        try {
            value = col.valueGetter(value, row);
        } catch {
            value = col.valueGetter({ row, value });
        }
    }

    if (col.valueFormatter) {
        try {
            value = col.valueFormatter(value, row);
        } catch {
            value = col.valueFormatter({ value });
        }
    }

    return value;
}

function getCellRawText(col, row) {
    const val = getCellDisplayValue(col, row);
    if (val === null || val === undefined) return '';
    return String(val);
}

function getRowId(row, selected) {
    return selected === 'Class'
        ? row.class_id
        : selected === 'Section'
            ? row.section_id
            : row.id;
}

// ─── Column Filter Popover ────────────────────────────────────────────────────

function ColumnFilterPopover({ col, filterValue, onFilter, onClose }) {
    const [draft, setDraft] = useState(filterValue || '');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const apply = () => {
        onFilter(col.field, draft.trim());
        onClose();
    };

    const clear = () => {
        onFilter(col.field, '');
        onClose();
    };

    return (
        <div
            className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-[#141414] border border-slate-100 dark:border-[#222] rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150"
            onMouseDown={e => e.stopPropagation()}
        >
            <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Filter: {col.headerName}
            </p>
            <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') apply();
                    if (e.key === 'Escape') onClose();
                }}
                placeholder={`Search ${col.headerName}…`}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-slate-200"
            />
            <div className="flex justify-end gap-2 pt-1">
                {draft && (
                    <button
                        type="button"
                        onClick={clear}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                    >
                        Clear
                    </button>
                )}
                <button
                    type="button"
                    onClick={apply}
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}

// ─── Columns Visibility Popover ───────────────────────────────────────────────

function ColumnsVisibilityPopover({ columns, hiddenCols, toggleCol, onClose }) {
    return (
        <div
            className="absolute z-50 top-full right-0 mt-2 w-64 bg-white dark:bg-[#141414] border border-slate-100 dark:border-[#222] rounded-2xl shadow-2xl p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150"
            onMouseDown={e => e.stopPropagation()}
        >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222] pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Columns</span>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                {columns.map(col => (
                    <label key={col.field} className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] rounded-xl cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={!hiddenCols.has(col.field)}
                            onChange={() => toggleCol(col.field)}
                            className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
                        />
                        <span>{col.headerName || col.field}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

// ─── Main ServerPaginationGrid ───────────────────────────────────────────────

const ServerPaginationGrid = ({
    action,
    api,
    getQuery,
    condition = false,
    columns = [],
    rolePriority,
    importBtn,
    rows = [],
    count,
    loading,
    selected,
    pageSizeOptions = [10, 20, 50],
    searchFlag = { search: false, searching: false },
    setOldPagination,
    imports,
    checkboxSelection = false,
    hidePagination = false,
    className = ""
}) => {
    // ── Pagination State ──────────────────────────────────────────────────────
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: pageSizeOptions[0] || 10
    });

    // ── Sorting State ─────────────────────────────────────────────────────────
    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'

    // ── Per-column Filters State ─────────────────────────────────────────────
    const [columnFilters, setColumnFilters] = useState({});
    const [openFilterCol, setOpenFilterCol] = useState(null);

    // ── Quick Table Search State ─────────────────────────────────────────────
    const [tableSearch, setTableSearch] = useState('');

    // ── Column Visibility State ──────────────────────────────────────────────
    const [hiddenCols, setHiddenCols] = useState(new Set());
    const [openColsMenu, setOpenColsMenu] = useState(false);

    // ── Row Selection State ──────────────────────────────────────────────────
    const [selectedIds, setSelectedIds] = useState(new Set());

    // ── Modals ───────────────────────────────────────────────────────────────
    const [openImport, setOpenImport] = useState(false);

    // ── Close popovers on outside click ──────────────────────────────────────
    const tableRef = useRef(null);
    useEffect(() => {
        const handler = (e) => {
            if (openFilterCol && !tableRef.current?.contains(e.target)) {
                setOpenFilterCol(null);
            }
            if (openColsMenu && !tableRef.current?.contains(e.target)) {
                setOpenColsMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [openFilterCol, openColsMenu]);

    // ── Sync Pagination with Server via getQuery ─────────────────────────────
    useEffect(() => {
        if (!searchFlag?.search && !searchFlag?.searching) {
            if (typeof getQuery === 'function') {
                getQuery(paginationModel.page, paginationModel.pageSize, action, api, condition);
            }
            if (typeof setOldPagination === 'function') {
                setOldPagination(paginationModel);
            }
        } else if (!searchFlag?.searching) {
            if (typeof getQuery === 'function') {
                getQuery(searchFlag, searchFlag, action, api, condition);
            }
        }
    }, [selected, paginationModel.page, paginationModel.pageSize, searchFlag?.searching]);

    // Reset pagination when selected entity changes
    useEffect(() => {
        setPaginationModel({
            page: 0,
            pageSize: pageSizeOptions[0] || 10
        });
        setColumnFilters({});
        setSelectedIds(new Set());
        setSortField(null);
        setTableSearch('');
    }, [selected]);

    // ── Row Count Handling ───────────────────────────────────────────────────
    const rowCount = count !== undefined && count !== null ? count : (rows?.length || 0);

    // ── Visible Columns ──────────────────────────────────────────────────────
    const visibleColumns = useMemo(() => {
        return columns.filter(col => !hiddenCols.has(col.field));
    }, [columns, hiddenCols]);

    // ── Processed Rows: Filtering + Client Sort ──────────────────────────────
    const processedRows = useMemo(() => {
        let result = Array.isArray(rows) ? [...rows] : [];

        // Apply quick table search
        if (tableSearch.trim()) {
            const q = tableSearch.toLowerCase().trim();
            result = result.filter(row => {
                return visibleColumns.some(col => {
                    const text = getCellRawText(col, row);
                    return text.toLowerCase().includes(q);
                });
            });
        }

        // Apply per-column text filters
        Object.entries(columnFilters).forEach(([field, filterText]) => {
            if (!filterText) return;
            const col = columns.find(c => c.field === field);
            const lowerFilter = filterText.toLowerCase();
            result = result.filter(row => {
                const text = col ? getCellRawText(col, row) : String(row[field] || '');
                return text.toLowerCase().includes(lowerFilter);
            });
        });

        // Apply sort
        if (sortField) {
            const col = columns.find(c => c.field === sortField);
            result.sort((a, b) => {
                const valA = col ? getCellRawText(col, a) : String(a[sortField] || '');
                const valB = col ? getCellRawText(col, b) : String(b[sortField] || '');
                const numA = Number(valA);
                const numB = Number(valB);
                let cmp = 0;
                if (!isNaN(numA) && !isNaN(numB)) {
                    cmp = numA - numB;
                } else {
                    cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
                }
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }

        return result;
    }, [rows, columnFilters, sortField, sortDir, columns, visibleColumns, tableSearch]);

    // ── Sort Handler ─────────────────────────────────────────────────────────
    const handleSort = useCallback((field) => {
        if (sortField === field) {
            if (sortDir === 'asc') setSortDir('desc');
            else {
                setSortField(null);
                setSortDir('asc');
            }
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    }, [sortField, sortDir]);

    // ── Column Filter Handlers ───────────────────────────────────────────────
    const handleColumnFilter = useCallback((field, value) => {
        setColumnFilters(prev => {
            const next = { ...prev };
            if (!value) delete next[field];
            else next[field] = value;
            return next;
        });
    }, []);

    // ── Column Visibility Toggle ─────────────────────────────────────────────
    const toggleColumnVisibility = useCallback((field) => {
        setHiddenCols(prev => {
            const next = new Set(prev);
            if (next.has(field)) next.delete(field);
            else next.add(field);
            return next;
        });
    }, []);

    // ── Row Selection Handlers ───────────────────────────────────────────────
    const allPageSelected = useMemo(() => {
        if (processedRows.length === 0) return false;
        return processedRows.every(row => selectedIds.has(getRowId(row, selected)));
    }, [processedRows, selectedIds, selected]);

    const someSelected = useMemo(() => {
        return processedRows.some(row => selectedIds.has(getRowId(row, selected)));
    }, [processedRows, selectedIds, selected]);

    const toggleSelectAll = useCallback(() => {
        if (allPageSelected) {
            setSelectedIds(new Set());
        } else {
            const next = new Set(selectedIds);
            processedRows.forEach(row => next.add(getRowId(row, selected)));
            setSelectedIds(next);
        }
    }, [allPageSelected, processedRows, selectedIds, selected]);

    const toggleRowSelect = useCallback((rowId) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(rowId)) next.delete(rowId);
            else next.add(rowId);
            return next;
        });
    }, []);

    // ── CSV Export ───────────────────────────────────────────────────────────
    const handleExportCSV = useCallback(() => {
        const exportCols = visibleColumns.filter(c => c.field !== 'action');
        const headers = exportCols.map(c => `"${(c.headerName || c.field).replace(/"/g, '""')}"`);

        const rowsToExport = selectedIds.size > 0
            ? processedRows.filter(r => selectedIds.has(getRowId(r, selected)))
            : processedRows;

        const csvRows = rowsToExport.map(row => {
            return exportCols.map(col => {
                const val = getCellRawText(col, row);
                return `"${val.replace(/"/g, '""')}"`;
            }).join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${selected || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [visibleColumns, processedRows, selectedIds, selected]);

    // ── Pagination calculations ──────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(rowCount / paginationModel.pageSize));
    const currentPage = paginationModel.page;
    const startIdx = rowCount === 0 ? 0 : currentPage * paginationModel.pageSize + 1;
    const endIdx = Math.min((currentPage + 1) * paginationModel.pageSize, rowCount);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPaginationModel(prev => ({ ...prev, page: newPage }));
        }
    };

    const handlePageSizeChange = (e) => {
        const newSize = parseInt(e.target.value, 10);
        setPaginationModel({ page: 0, pageSize: newSize });
    };

    const activeFilterCount = Object.keys(columnFilters).length;

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div ref={tableRef} className={`w-full bg-white dark:bg-[#0f0f0f] rounded-2xl border border-slate-100 dark:border-[#1a1a1a] shadow-sm overflow-hidden flex flex-col ${className}`}>

            {/* ── Action Toolbar Strip (Matches SnailHRA-temp) ── */}
            <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-slate-50/50 dark:bg-[#141414] border-b border-slate-100 dark:border-[#1a1a1a] gap-3">
                {/* Left Side: Quick In-Table Search */}
                <div className="flex items-center space-x-2 min-w-0">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                            placeholder="Quick search table…"
                            className="w-44 sm:w-60 pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#222] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-all font-medium"
                        />
                        {tableSearch && (
                            <button
                                onClick={() => setTableSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Side: Columns, Filters, Export, Import */}
                <div className="flex items-center space-x-2 relative">
                    {/* Columns button */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenColsMenu(!openColsMenu)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#222] text-slate-600 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                        >
                            <Columns className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Columns</span>
                        </button>
                        {openColsMenu && (
                            <ColumnsVisibilityPopover
                                columns={columns}
                                hiddenCols={hiddenCols}
                                toggleCol={toggleColumnVisibility}
                                onClose={() => setOpenColsMenu(false)}
                            />
                        )}
                    </div>

                    {/* Filters button */}
                    <button
                        type="button"
                        onClick={() => {
                            if (visibleColumns.length > 0) {
                                setOpenFilterCol(openFilterCol ? null : visibleColumns[0]?.field);
                            }
                        }}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                            activeFilterCount > 0
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                : 'bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#222] text-slate-600 dark:text-gray-300 hover:bg-slate-50'
                        }`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
                    </button>

                    {/* Export CSV button */}
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#222] text-slate-600 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                        title="Export current table to CSV"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    {/* Import button */}
                    {importBtn && (
                        <button
                            type="button"
                            onClick={() => setOpenImport(true)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Import</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table Container ── */}
            <div className="relative w-full overflow-x-auto custom-scrollbar flex-1 min-h-[300px]">
                <table className="w-full text-left border-collapse">
                    {/* Header Row */}
                    <thead>
                        <tr className="bg-slate-50/80 dark:bg-[#141414] border-b border-slate-100 dark:border-[#1a1a1a]">
                            {checkboxSelection && (
                                <th className="w-12 px-4 py-3.5 text-center">
                                    <input
                                        type="checkbox"
                                        checked={allPageSelected}
                                        ref={el => { if (el) el.indeterminate = someSelected && !allPageSelected; }}
                                        onChange={toggleSelectAll}
                                        className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
                                    />
                                </th>
                            )}
                            {visibleColumns.map((col) => {
                                const isSorted = sortField === col.field;
                                const hasFilter = Boolean(columnFilters[col.field]);
                                const canSort = col.sortable !== false && col.field !== 'action';

                                return (
                                    <th
                                        key={col.field}
                                        style={col.width ? { width: col.width, minWidth: col.width } : col.flex ? { minWidth: col.minWidth || 120 } : {}}
                                        className={`px-4 py-3.5 text-[11px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider select-none relative ${col.headerAlign === 'center' ? 'text-center' : col.headerAlign === 'right' ? 'text-right' : 'text-left'} ${col.headerClassName || ''}`}
                                    >
                                        <div className={`inline-flex items-center gap-1.5 ${canSort ? 'cursor-pointer hover:text-slate-700 dark:hover:text-white' : ''}`} onClick={() => canSort && handleSort(col.field)}>
                                            <span>{col.headerName || col.field}</span>
                                            {canSort && (
                                                <span className="text-slate-400">
                                                    {isSorted ? (
                                                        sortDir === 'asc' ? (
                                                            <ChevronUp className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                                        ) : (
                                                            <ChevronDown className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                                        )
                                                    ) : (
                                                        <ChevronsUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        {/* Per-column filter trigger */}
                                        {col.field !== 'action' && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenFilterCol(openFilterCol === col.field ? null : col.field);
                                                }}
                                                className={`ml-1.5 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-block ${hasFilter ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'}`}
                                                title={`Filter ${col.headerName}`}
                                            >
                                                <Filter className="w-3 h-3" />
                                            </button>
                                        )}

                                        {/* Filter Popover */}
                                        {openFilterCol === col.field && (
                                            <ColumnFilterPopover
                                                col={col}
                                                filterValue={columnFilters[col.field]}
                                                onFilter={handleColumnFilter}
                                                onClose={() => setOpenFilterCol(null)}
                                            />
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-slate-50 dark:divide-[#141414]">
                        {loading ? (
                            <tr>
                                <td colSpan={visibleColumns.length + (checkboxSelection ? 1 : 0)} className="p-0">
                                    <div className="p-4">
                                        {multipleSkeletons(10, visibleColumns.length)}
                                    </div>
                                </td>
                            </tr>
                        ) : processedRows.length === 0 ? (
                            <tr>
                                <td colSpan={visibleColumns.length + (checkboxSelection ? 1 : 0)} className="py-12">
                                    <EmptyOverlayGrid selected={selected} />
                                </td>
                            </tr>
                        ) : (
                            processedRows.map((row, rowIdx) => {
                                const rowId = getRowId(row, selected) || rowIdx;
                                const isRowSelected = selectedIds.has(rowId);

                                return (
                                    <tr
                                        key={rowId}
                                        className={`h-14 transition-colors text-xs font-semibold text-slate-700 dark:text-gray-200 ${
                                            isRowSelected
                                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                                                : 'hover:bg-slate-50/60 dark:hover:bg-[#141414]/50'
                                        }`}
                                    >
                                        {checkboxSelection && (
                                            <td className="w-12 px-4 py-3.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isRowSelected}
                                                    onChange={() => toggleRowSelect(rowId)}
                                                    className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
                                                />
                                            </td>
                                        )}

                                        {visibleColumns.map((col) => {
                                            const cellVal = getCellDisplayValue(col, row);
                                            const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';
                                            const isActionCol = col.field === 'action' || col.field === 'actions' || String(col.headerName || '').toLowerCase() === 'action';
                                            const actionClass = isActionCol ? 'cursor-pointer [&_button]:cursor-pointer [&_svg]:cursor-pointer [&_a]:cursor-pointer [&_*]:cursor-pointer' : '';
                                            const customCellClass = typeof col.cellClassName === 'function' ? col.cellClassName({ row, value: cellVal, field: col.field }) : (col.cellClassName || '');

                                            return (
                                                <td
                                                    key={col.field}
                                                    className={`px-4 py-3.5 ${alignClass} ${actionClass} ${customCellClass}`}
                                                >
                                                    {col.renderCell ? (
                                                        col.renderCell({
                                                            row,
                                                            value: cellVal,
                                                            field: col.field,
                                                            id: rowId
                                                        })
                                                    ) : (
                                                        <span className="truncate block max-w-xs">
                                                            {cellVal !== null && cellVal !== undefined ? String(cellVal) : '—'}
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination Footer ── */}
            {!hidePagination && (
                <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-white dark:bg-[#0f0f0f] border-t border-slate-100 dark:border-[#1a1a1a] text-xs font-semibold text-slate-500 dark:text-gray-400 gap-3">
                    {/* Rows per page */}
                    <div className="flex items-center space-x-2">
                        <span>Rows per page:</span>
                        <select
                            value={paginationModel.pageSize}
                            onChange={handlePageSizeChange}
                            className="bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#222] rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                        >
                            {pageSizeOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Page counter & Navigation buttons */}
                    <div className="flex items-center space-x-4">
                        <span className="text-slate-600 dark:text-gray-400">
                            {rowCount === 0 ? '0 of 0' : `${startIdx}–${endIdx} of ${rowCount}`}
                        </span>

                        <div className="flex items-center space-x-1">
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0 || loading}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-[#222] hover:bg-slate-50 dark:hover:bg-[#141414] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-gray-300 cursor-pointer"
                                aria-label="Previous Page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-700 dark:text-gray-200">
                                {currentPage + 1} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1 || loading}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-[#222] hover:bg-slate-50 dark:hover:bg-[#141414] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-gray-300 cursor-pointer"
                                aria-label="Next Page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Import Modals ── */}
            {openImport && selected === "Student" && (
                <ImportComponent open={openImport} setOpen={setOpenImport} />
            )}
            {openImport && selected === "Teacher" && (
                <ImportTeacher open={openImport} setOpen={setOpenImport} />
            )}
            {openImport && selected === "Employee" && (
                <ImportEmployee open={openImport} setOpen={setOpenImport} />
            )}
        </div>
    );
};

ServerPaginationGrid.propTypes = {
    action: PropTypes.func,
    api: PropTypes.object,
    getQuery: PropTypes.func,
    condition: PropTypes.bool,
    columns: PropTypes.array,
    rolePriority: PropTypes.number,
    importBtn: PropTypes.bool,
    rows: PropTypes.array,
    count: PropTypes.number,
    loading: PropTypes.bool,
    selected: PropTypes.string,
    pageSizeOptions: PropTypes.array,
    searchFlag: PropTypes.object,
    setOldPagination: PropTypes.func,
    imports: PropTypes.bool,
    checkboxSelection: PropTypes.bool,
    hidePagination: PropTypes.bool,
    className: PropTypes.string
};

export default ServerPaginationGrid;
