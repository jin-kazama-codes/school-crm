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

import { Box, Button, Typography, useTheme } from "@mui/material";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";

import { tokens } from "../../theme";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { capitalizeEveryWord, formatDate } = Utility();
  const navigateTo = useNavigate();

  const handleActionEdit = (id) => {
    navigateTo(`/holiday/update/${id}`, { state: { id: id } });
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 120,
      valueGetter: (params) =>
        `${
          capitalizeEveryWord(params.row.title) || ""
        } `,
    },
    {
      field: "startDate",
      headerName: "Closing Date",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => `${ formatDate(params.value)}`
    },
    {
      field: "endDate",
      headerName: "Opening Date",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => `${formatDate(params.value)}`
    },
    {
      field: "notes",
      headerName: "Notes",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100,
      valueFormatter :(params) => `${capitalizeEveryWord(params.value) || ""}`,
    },
    {
      field: "type",
      headerName: "Type",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 120,
      renderCell: ({ row: { type } }) => {
        const nameParts = type.split("_");
        const capitalizedParts = nameParts.map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        );
        const typeAll = capitalizedParts.join(" ");
        return (
          <Box
            width="70%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              type === "school_closure"
                ? colors.greenAccent[600]
                : type === "partial_closure"
                ? colors.redAccent[700]
                : type === "staff_only"
                ? colors.blueAccent[800]
                : colors.blueAccent[800]
            }
            borderRadius="4px"
          >
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {typeAll}
            </Typography>
          </Box>
        );
      },
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
          <Box
            width="30%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
          >
            <Button
              color="info"
              variant="contained"
              onClick={() => handleActionEdit(id)}
              sx={{ minWidth: "50px" }}
            >
              <DriveFileRenameOutlineOutlinedIcon />
            </Button>
          </Box>
        );
      },
    },
  ];
  return columns;
};
