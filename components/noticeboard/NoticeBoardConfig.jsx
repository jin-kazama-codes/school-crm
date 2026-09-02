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

export const datagridColumns = (rolePriority = null) => {

    const navigateTo = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

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
            minWidth: 120
        },
        {
            field: "description",
            headerName: "Description",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
        },
        {
            field: "publish_date",
            headerName: "Pushlish Date",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
        },
        {
            field: "expiry_date",
            headerName: "Expiry Date",
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
                        {status.charAt(0).toUpperCase() + status.slice(1) || ''}
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
