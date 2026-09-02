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
import PreviewIcon from '@mui/icons-material/Preview';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

import API from "../../apis";

import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { tokens } from "../../theme";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null, setOpen = null) => {
    const schoolClasses = useSelector(state => state.schoolClasses);
    const allClasses = useSelector(state => state.allClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allSections = useSelector(state => state.allSections);

    const dispatch = useDispatch();
    const navigateTo = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { appendSuffix, findById, fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage, capitalizeEveryWord, formatDate } = Utility();

    const handleActionEdit = (id) => {
        navigateTo(`/student/update/${id}`, { state: { id: id } });
    };

    const handleActionShow = (id) => {
        setOpen(true);
        navigateTo("#", { state: { id: id } });
    };

    useEffect(() => {
        if (!getLocalStorage("schoolInfo")) {
            if (!allClasses?.listData?.length) {
                fetchAndSetAll(dispatch, setAllClasses, API.ClassAPI);
            }
            if (!allSections?.listData?.length) {
                fetchAndSetAll(dispatch, setAllSections, API.SectionAPI);
            }
        }
        if (getLocalStorage("schoolInfo") && (!schoolClasses?.listData?.length || !schoolSections?.listData?.length)) {
            fetchAndSetSchoolData(dispatch, setSchoolClasses, setSchoolSections);
        }
    }, [schoolClasses?.listData?.length, schoolSections?.listData?.length, allClasses?.listData?.length, allSections?.listData?.length]);

    const columns = [
        {
            field: "fullname",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            // this function combines the values of firstname and lastname into one string
            valueGetter: (params) => `${capitalizeEveryWord(params.row.firstname) || ''} ${capitalizeEveryWord(params.row.lastname)|| ''}`
        },
        {
            field: "class",
            headerName: "Class",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                let className;
                let sectionName;

                if (allClasses.listData.length && allSections.listData.length) {
                    className = findById(params?.row?.class, allClasses?.listData)?.class_name;
                    sectionName = findById(params?.row?.section, allSections?.listData)?.section_name;
                } else if (schoolClasses.listData.length && schoolSections.listData.length) {
                    className = findById(params?.row?.class, schoolClasses?.listData)?.class_name;
                    sectionName = findById(params?.row?.section, schoolSections?.listData)?.section_name;
                } 
                return (
                    <div>
                        {className ? appendSuffix(className) : '/'} {sectionName}
                    </div>
                );
            }
        },
        {
            field: "blood_group",
            headerName: "Blood Group",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
        },
        {
            field: "dob",
            headerName: "Date of Birth",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            valueFormatter: (params) => `${formatDate(params.value)}`
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
            }
        },
        {
            field: "action",
            headerName: "Action",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            renderCell: ({ row: { id } }) => {
                return (
                    <Box width="85%"
                        m="0 auto"
                        p="5px"
                        display="flex"
                        justifyContent="space-around">

                        {rolePriority !== 1 &&
                            <Button color="info" variant="contained"
                                onClick={() => handleActionEdit(id)}
                                sx={{ minWidth: "50px" }}
                            >
                                <DriveFileRenameOutlineOutlinedIcon />
                            </Button>}

                        <Button color="info" variant="contained"
                            onClick={() => handleActionShow(id)}
                            sx={{ minWidth: "50px" }}
                        >
                            <PreviewIcon />
                        </Button>
                    </Box>
                );
            }
        }
    ];
    return columns;
};
