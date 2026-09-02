/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";

import { Box, Button, Typography, useTheme } from "@mui/material";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";

import API from "../../apis";

import { setAllUserRoles } from "../../redux/actions/UserRoleAction";
import { tokens } from "../../theme";
import { Utility } from "../utility";

export const datagridColumns = () => {
  const selected = useSelector((state) => state.menuItems.selected);
  const allUserRoles = useSelector((state) => state.allUserRoles);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { capitalizeEveryWord, formatDate } = Utility();

  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { findById, fetchAndSetAll } = Utility();

  const handleActionEdit = (id) => {
    navigateTo(`/${selected.toLowerCase()}/update/${id}`, {
      state: { id: id },
    });
  };

  useEffect(() => {
    if (!allUserRoles?.listData?.length) {
      fetchAndSetAll(dispatch, setAllUserRoles, API.UserRoleAPI);
    }
  }, [allUserRoles?.listData?.length]);

  const columns = [
    {
      field: "username",
      headerName: "Username",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => `${capitalizeEveryWord(params.row.username) || ""}`,

    },
    {
      field: "role",
      headerName: "Role",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
        let roleName = findById(params?.row?.role, allUserRoles?.listData)?.name;
        return (
          <div>
            {roleName ? capitalizeEveryWord(roleName) : '/'}
          </div>
        );
      }
    },
    {
      field: "contact_no",
      headerName: "Contact",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100
    },
    {
      field: "email",
      headerName: "E-mail",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 200
    },
    {
      field: "updated_at",
      headerName: "Updated",
      headerAlign: "center",
      align: "center",
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => `${ formatDate(params.value)}`
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
    {
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
      }
    }
  ];
  return columns;
};
