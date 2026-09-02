/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useNavigate } from "@/lib/routerAdapter";

import { Box, Button} from '@mui/material';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

export const datagridColumns = () => {
    const navigateTo = useNavigate();

    const handleActionEdit = (id) => {
        navigateTo(`/school-duration/update/${id}`, { state: { id: id } });
    };

    const columns = [
        {
            field: "period",
            headerName: "Period",
            headerAlign: "center",
            align: "center",
            flex: 1,
            // width: 120,
        },
        {
            field: "halves",
            headerName: "Halves",
            headerAlign: "center",
            align: "center",
            flex: 1,
            // minWidth: 100
        },
        {
            field: "recess_time",
            headerName: "Recess Time",
            headerAlign: "center",
            align: "center",
            flex: 1,
            // minWidth: 100
        },
        {
            field: "first_half_period_duration",
            headerName: "First Half periods Duration",
            headerAlign: "center",
            align: "center",
            flex: 1,
            // minWidth: 100
        },
        {
            field: "second_half_period_duration",
            headerName: "Second Half periods Duration",
            headerAlign: "center",
            align: "center",
            flex: 1,
            // minWidth: 100
        },
        {
            field: "opening_time",
            headerName: "Opening Time",
            headerAlign: "center",
            align: "center",
            flex: 1,
            // minWidth: 100,
            valueFormatter: params => new Date(params?.value).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })
        },
        {
            field: "closing_time",
            headerName: "Closing Time",
            headerAlign: "center",
            align: "center",
            flex: 1,
            // minWidth: 100,
            valueFormatter: params => new Date(params?.value).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })
        },
        {
            field: "employee_entry_time",
            headerName: "Employee Entry",
            headerAlign: "center",
            align: "center",
            flex: 1,
            // minWidth: 100,
            valueFormatter: params => new Date(params?.value).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })
        },
        {
            field: "employee_exit_time",
            headerName: "Employee Exit",
            headerAlign: "center",
            align: "center",
            flex: 1,
            // minWidth: 100,
            valueFormatter: params => new Date(params?.value).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })
        },
        {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            // minWidth: 75,
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
            },
        }
    ];
    return columns;
};
