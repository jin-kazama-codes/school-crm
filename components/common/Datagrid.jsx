/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect, useState } from 'react';
import PropTypes from "prop-types";

import { Box, useTheme, Button } from "@mui/material";
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";
import PostAddIcon from '@mui/icons-material/PostAdd';
import ImportComponent from "../models/ImportModel"
import ImportTeacher from "../models/ImportTeacher";
import ImportEmployee from "../models/ImportEmployee";

import classNames from '../modules';
import EmptyOverlayGrid from "./EmptyOverlayGrid";

import { multipleSkeletons } from "./LoadingSkeleton";
import { tokens } from "../../theme";

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
        pageSize: 10 || 20 || 30
    };
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [paginationModel, setPaginationModel] = useState(initialState);
    const [openImport, setOpenImport] = useState(false);

    useEffect(() => {
        //TO BE REFACTORED
        if (!searchFlag.search && !searchFlag.searching) {
            getQuery(paginationModel.page, paginationModel.pageSize, action, api, condition);
            setOldPagination(paginationModel);
        } else if (!searchFlag.searching) {
            getQuery(searchFlag, searchFlag, action, api, condition);
            setPaginationModel({
                // page: searchFlag.oldPagination.page,
                // pageSize: searchFlag.oldPagination.pageSize
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, paginationModel.page, paginationModel.pageSize, searchFlag.searching]);

    useEffect(() => {
        setPaginationModel(initialState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    // Some API clients return undefined while loading
    // Following lines are here to prevent `rowCountState` from being undefined during the loading
    const [rowCountState, setRowCountState] = useState(count || 0);

    useEffect(() => {
        setRowCountState(() =>
            count ? count : 0,
        );
    }, [count, setRowCountState]);

    return (
        <Box
            m="30px 0 0 0"
            sx={{
                "& .MuiDataGrid-root": {
                    border: "none",
                    fontSize: "1rem"
                },
                "& .MuiDataGrid-cell": {
                    borderBottom: "none",
                    whiteSpace: "normal !important",
                    wordWrap: "break-word !important",
                },
                "& .MuiDataGrid-cellCheckbox": {
                    borderBottom: "none"
                },
                "& .MuiDataGrid-cell:focus-within": {
                    outline: `1px solid ${colors.greenAccent[600]}`
                },
                "& .MuiDataGrid-cell:hover": {
                    color: colors.greenAccent[300]
                },
                "& .name-column--cell": {
                    color: colors.greenAccent[300],

                },
                "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: colors.blueAccent[700],
                    borderBottom: "none"
                },
                "& .MuiDataGrid-columnHeader": {
                    backgroundColor: colors.blueAccent[700],
                },
                "& .MuiDataGrid-virtualScroller": {
                    minHeight: 320
                },
                "& .MuiDataGrid-footerContainer": {
                    borderTop: "none",
                    backgroundColor: colors.blueAccent[700]
                },
                "& .MuiCheckbox-root": {
                    color: `${colors.greenAccent[200]} !important`
                },
                "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                    color: `${colors.grey[100]} !important`
                },
            }}
        >
            <DataGrid
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
                        <Box display="flex" >
                            <GridToolbar />
                            <GridToolbarContainer>
                                {rolePriority > 1 && importBtn == true && (
                                    <Button sx={{ padding: "0px" }} onClick={() => setOpenImport(true)}>
                                        <PostAddIcon sx={{ marginRight: "5px" }} />Import
                                    </Button>
                                )}
                            </GridToolbarContainer>
                        </Box>
                    ),
                    LoadingOverlay: multipleSkeletons,
                    noRowsOverlay: EmptyOverlayGrid

                    // ... other components
                }}
                hideFooterPagination={hidePagination}
                ServerPaginationGrid
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={pageSizeOptions}
                checkboxSelection={checkboxSelection}
                keepNonExistentRowsSelected
            />

            {openImport && imports == "student" ? <ImportComponent openDialog={openImport} setOpenDialog={setOpenImport} /> : openImport && imports == "teacher" ? <ImportTeacher openDialog={openImport} setOpenDialog={setOpenImport} /> :  openImport && imports == "employee" ? <ImportEmployee openDialog={openImport} setOpenDialog={setOpenImport} /> : "" }
        </Box>
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
