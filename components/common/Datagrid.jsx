/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";
import { PlusCircle } from "lucide-react";

import ImportComponent from "../models/ImportModel";
import ImportTeacher from "../models/ImportTeacher";
import ImportEmployee from "../models/ImportEmployee";
import classNames from '../modules';
import EmptyOverlayGrid from "./EmptyOverlayGrid";
import { multipleSkeletons } from "./LoadingSkeleton";

const ServerPaginationGrid = ({
    action,
    api,
    getQuery,
    condition = false,
    columns,
    rolePriority,
    importBtn,
    rows,
    count,
    loading,
    selected,
    pageSizeOptions,
    searchFlag,
    setOldPagination,
    imports,
    checkboxSelection = false,
    hidePagination = false
}) => {
    const initialState = {
        page: 0,
        pageSize: 10
    };
    const [paginationModel, setPaginationModel] = useState(initialState);
    const [openImport, setOpenImport] = useState(false);

    useEffect(() => {
        if (!searchFlag.search && !searchFlag.searching) {
            getQuery(paginationModel.page, paginationModel.pageSize, action, api, condition);
            setOldPagination(paginationModel);
        } else if (!searchFlag.searching) {
            getQuery(searchFlag, searchFlag, action, api, condition);
            setPaginationModel({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, paginationModel.page, paginationModel.pageSize, searchFlag.searching]);

    useEffect(() => {
        setPaginationModel(initialState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    const [rowCountState, setRowCountState] = useState(count || 0);

    useEffect(() => {
        setRowCountState(() => count ? count : 0);
    }, [count, setRowCountState]);

    const isDark = document.documentElement.classList.contains("dark");
    const accentColor = "#10b981"; // emerald-500
    const headerBg = isDark ? "#1e293b" : "#f1f5f9"; // slate-800 / slate-100
    const rowHoverBg = isDark ? "#0f172a" : "#f8fafc"; // slate-900 / slate-50
    const borderColor = isDark ? "#334155" : "#e2e8f0"; // slate-700 / slate-200
    const textColor = isDark ? "#f8fafc" : "#0f172a"; // slate-50 / slate-900
    const textMuted = isDark ? "#94a3b8" : "#64748b"; // slate-400 / slate-500

    return (
        <div className="mt-8 bg-white dark:bg-[#1a1a1a] rounded-[26px] shadow-xl border border-slate-200 dark:border-[#2a2a2a] overflow-hidden">
            <DataGrid
                sx={{
                    border: "none",
                    color: textColor,
                    "--DataGrid-containerBackground": headerBg,
                    "& .MuiDataGrid-root": {
                        fontSize: "0.9rem",
                        fontFamily: "inherit",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${borderColor}`,
                        whiteSpace: "normal !important",
                        wordWrap: "break-word !important",
                        display: "flex",
                        alignItems: "center",
                    },
                    "& .MuiDataGrid-cellCheckbox": {
                        borderBottom: "none"
                    },
                    "& .MuiDataGrid-cell:focus-within": {
                        outline: `1px solid ${accentColor}`,
                        outlineOffset: "-1px"
                    },
                    "& .MuiDataGrid-row:hover": {
                        backgroundColor: rowHoverBg
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: headerBg,
                        borderBottom: `1px solid ${borderColor}`,
                        color: textMuted,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.05em",
                        fontWeight: "700"
                    },
                    "& .MuiDataGrid-columnHeader": {
                        backgroundColor: headerBg,
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        minHeight: 320,
                        backgroundColor: isDark ? "#1a1a1a" : "#ffffff"
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: `1px solid ${borderColor}`,
                        backgroundColor: headerBg,
                        color: textMuted
                    },
                    "& .MuiTablePagination-root": {
                        color: textColor
                    },
                    "& .MuiCheckbox-root": {
                        color: `${textMuted} !important`
                    },
                    "& .MuiCheckbox-root.Mui-checked": {
                        color: `${accentColor} !important`
                    },
                    "& .MuiDataGrid-toolbarContainer": {
                        padding: "16px",
                        backgroundColor: headerBg,
                        borderBottom: `1px solid ${borderColor}`,
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${textColor} !important`,
                        fontFamily: "inherit",
                        fontWeight: "600",
                        textTransform: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        "&:hover": {
                            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                        }
                    },
                }}
                getRowHeight={() => 'auto'}
                disableRowSelectionOnClick
                getRowId={row => selected === 'Class' ? row.class_id : (selected === 'Section' ? row.section_id : row.id)}
                rows={rows || []}
                columns={columns}
                loading={classNames.includes(selected) ? loading : loading}
                rowCount={rowCountState}
                initialState={{
                    sorting: {
                        sortModel: [{ field: 'fullname', sort: 'asc' }],
                    },
                }}
                components={{
                    Toolbar: () => (
                        <div className="flex justify-between items-center w-full">
                            <GridToolbar />
                            <GridToolbarContainer>
                                {rolePriority > 1 && importBtn == true && (
                                    <button 
                                        onClick={() => setOpenImport(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-md shadow-emerald-500/20 text-sm"
                                    >
                                        <PlusCircle className="w-4 h-4" /> Import
                                    </button>
                                )}
                            </GridToolbarContainer>
                        </div>
                    ),
                    LoadingOverlay: multipleSkeletons,
                    noRowsOverlay: EmptyOverlayGrid
                }}
                hideFooterPagination={hidePagination}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={pageSizeOptions}
                checkboxSelection={checkboxSelection}
                keepNonExistentRowsSelected
            />

            {openImport && imports === "student" ? <ImportComponent openDialog={openImport} setOpenDialog={setOpenImport} /> : 
             openImport && imports === "teacher" ? <ImportTeacher openDialog={openImport} setOpenDialog={setOpenImport} /> :  
             openImport && imports === "employee" ? <ImportEmployee openDialog={openImport} setOpenDialog={setOpenImport} /> : ""}
        </div>
    );
};

ServerPaginationGrid.propTypes = {
    action: PropTypes.func,
    api: PropTypes.object,
    getQuery: PropTypes.func,
    condition: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    columns: PropTypes.array,
    rows: PropTypes.array,
    count: PropTypes.number,
    loading: PropTypes.bool,
    selected: PropTypes.string,
    pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
    searchFlag: PropTypes.shape({
        search: PropTypes.bool,
        searching: PropTypes.bool
    }),
    setOldPagination: PropTypes.func,
};

export default ServerPaginationGrid;
