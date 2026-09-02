/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useNavigate } from "@/lib/routerAdapter";

import { Box, Button } from '@mui/material';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

import { Utility } from "../utility";

export const datagridColumns = (handleDialogOpen) => {
    const { formatDate } = Utility();
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        handleDialogOpen();
        navigateTo("#", { state: { id: id } });
    };

    const columns = [
        {
            field: "name",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120
        },
        {
            field: "updated_at",
            headerName: "Updated",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            valueFormatter: (params) => `${formatDate(params.value)}`
        },
        {
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
