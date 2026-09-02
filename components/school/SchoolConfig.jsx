/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useNavigate } from "@/lib/routerAdapter";
import { useSelector } from "react-redux";

import { Box, Button, Typography, useTheme } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

import { tokens } from "../../theme";
import { Utility } from "../utility";


export const datagridColumns = (setOpen = null) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { capitalizeEveryWord } = Utility();

    const selected = useSelector(state => state.menuItems.selected);
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        navigateTo(`/${selected.toLowerCase()}/update/${id}`, { state: { id: id } });
    };

    const handleActionShow = (id) => {
        setOpen(true);
        navigateTo("#", { state: { id: id } });
    };

    const columns = [
        {
            field: "city",
            headerName: "City",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                let cityName = params?.row?.city;
                return (
                    <div>
                        {cityName ? cityName : '/'}
                    </div>
                );
            }
        },
        {
            field: "name",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
        },
        {
            field: "board",
            headerName: "Board",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
        },
        {

            field: "sub_type",
            headerName: "Sub Type",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            valueGetter: params => capitalizeEveryWord(params.row.sub_type) || ''


        },
        {
            field: "contact_no_1",
            headerName: "Contact Number",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            renderCell: ({ row: { status } }) => {
                return (
                    <Box
                        width="60%"
                        m="0 auto"
                        p="5px"
                        display="flex"
                        justifyContent="center"
                        backgroundColor={
                            status === "active"
                                ? colors.greenAccent[600]
                                : status === "inactive"
                                    ? colors.redAccent[700]
                                    : colors.redAccent[700]
                        }
                        borderRadius="4px"
                    >
                        <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
                            {capitalizeEveryWord(status) || ''}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            renderCell: ({ row: { id } }) => {
                return (
                    <Box width="30%"
                        m="0 auto"
                        p="5px"
                        display="flex"
                        justifyContent="center">
                        <Button color="info" variant="contained"
                            onClick={() => handleActionEdit(id)}
                            sx={{ minWidth: "50px" }}
                        >
                            <DriveFileRenameOutlineOutlinedIcon />
                        </Button>

                        <Button color="info" variant="contained"
                            onClick={() => handleActionShow(id)}
                            sx={{ minWidth: "50px" }}
                        >
                            <PreviewIcon />
                        </Button>
                    </Box>
                );
            },
        }
    ];
    return columns;
};
