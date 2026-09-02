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
import EditNoteIcon from '@mui/icons-material/EditNote';

import { tokens } from "../../theme";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null, setOpen = null) => {
    const navigateTo = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { capitalizeEveryWord } = Utility();

    const handleActionShow = (id, clss, section, firstname, lastname) => {
        setOpen(true);
        navigateTo("#", { state: { id, cls: clss, section, firstname, lastname } });
    };

    const columns = [
        {
            field: "fullname",
            headerName: " Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            // this function combines the values of firstname and lastname into one string
            valueGetter: (params) => `${capitalizeEveryWord(params.row.firstname) || ''} ${capitalizeEveryWord(params.row.lastname) || ''}`
        },
        {
            field: "session",
            headerName: "Academic Year",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120
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
            renderCell: ({ row }) => {
                return (
                    <Box width="30%"
                        m="0 auto"
                        p="5px"
                        display="flex"
                        justifyContent="center">
                        <Button color="info" variant="contained"
                            onClick={() => handleActionShow(row.id, row.class, row.section, row.firstname, row.lastname)}
                            sx={{ minWidth: "50px" }}
                        >
                            <EditNoteIcon />
                        </Button>
                    </Box>
                );
            }
        }
    ];
    return columns;
};
