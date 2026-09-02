/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "@/lib/routerAdapter";

import { Box, Button, Typography, useTheme } from '@mui/material';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import Checkbox from '@mui/material/Checkbox';

import API from "../../apis";

import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { tokens } from "../../theme";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null) => {
    const schoolClasses = useSelector(state => state.schoolClasses);
    const allClasses = useSelector(state => state.allClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allSections = useSelector(state => state.allSections);

    const dispatch = useDispatch();
    const navigateTo = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage, capitalizeEveryWord } = Utility();

    const handleActionEdit = (id) => {
        navigateTo(`/attendance/update/${id}`, { state: { id: id } });
    };

    // useEffect(() => {
    //     if (!getLocalStorage("schoolInfo")) {
    //         if (!allClasses?.listData?.length) {
    //             fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
    //         }
    //         if (!allSections?.listData?.length) {
    //             fetchAndSetAll(dispatch, setAllSections, API.SectionAPI);
    //         }
    //     }
    //     if (getLocalStorage("schoolInfo") && (!schoolClasses?.listData?.length || !schoolSections?.listData?.length)) {
    //         fetchAndSetSchoolData(dispatch, setSchoolClasses, setSchoolSections);
    //     }
    // }, [schoolClasses?.listData?.length, schoolSections?.listData?.length, allClasses?.listData?.length, allSections?.listData?.length]);

    const columns = [
        {
            field: "teacherName",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            // this function combines the values of firstname and lastname into one string
            // valueGetter: (params) => `${capitalizeEveryWord(params.row.firstname) || ''}`
        },
        {
            field: "subjects",
            headerName: "Attendance",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
        },
        rolePriority !== 1 && {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 75,
            renderCell: ({ row: { id } }) => (
                <Box width="30%"
                    m="0 auto"
                    p="5px"
                    display="flex"
                    justifyContent="center"
                >
                    <Button color="info" variant="contained"
                        onClick={() => handleActionEdit(id)}
                        sx={{ minWidth: "50px" }}
                    >
                        <DriveFileRenameOutlineOutlinedIcon />
                    </Button>
                </Box>
            )
        }
    ];
    return columns;
};
