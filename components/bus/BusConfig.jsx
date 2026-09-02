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

import { Box, Button, Typography, useTheme } from '@mui/material';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

import { tokens } from "../../theme";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { capitalizeEveryWord } = Utility();

    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        navigateTo(`/bus/update/${id}`, { state: { id: id } });
    };

    const columns = [
        {
            field: "registration_no",
            headerName: "Registration Number",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120
        },
        {
            field: "driver",
            headerName: "Driver",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            valueGetter: (params) => `${capitalizeEveryWord(params.row.driver) || ""}`,

        },
        {
            field: "driver_contact",
            headerName: "Contact",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
        },
        {
            field: "driver_license",
            headerName: "License",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
        },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
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
            }
        },
        rolePriority !== 1 && {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 75,
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
                    </Box>
                );
            }
        }
    ];
    return columns;
};
