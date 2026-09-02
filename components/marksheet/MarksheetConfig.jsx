/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useSelector } from "react-redux";
import { useNavigate } from "@/lib/routerAdapter";

import { Box, Button, Typography, useTheme } from '@mui/material';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

import { tokens } from "../../theme";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null) => {
    const schoolClasses = useSelector(state => state.schoolClasses);
    const allClasses = useSelector(state => state.allClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allSections = useSelector(state => state.allSections);

    const navigateTo = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { appendSuffix, findById, capitalizeEveryWord} = Utility();

    const handleActionEdit = (id, student_id, term) => {
        navigateTo(`/marksheet/update/${student_id}`, { state: { id: id, student_id: student_id, term: term } });
    };

    const columns = [
        {
            field: "student_id",
            headerName: "Student Id",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100
        },
        {
            field: "class_id",
            headerName: "Class",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                let className;
                let sectionName;

                if (allClasses?.listData?.length || allSections?.listData?.length) {
                    className = findById(params?.row?.class_id, allClasses?.listData)?.class_name;
                    sectionName = findById(params?.row?.section_id, allSections?.listData)?.section_name;
                } else if (schoolClasses?.listData?.length || schoolSections?.listData?.length) {
                    className = findById(params?.row?.class_id, schoolClasses?.listData)?.class_name;
                    sectionName = findById(params?.row?.section_id, schoolSections?.listData)?.section_name;
                }
                return (
                    <div>
                        {className ? appendSuffix(className) : '/'} {sectionName}
                    </div>
                );
            }
        },
        {
            field: "term",
            headerName: "Term",
            headerAlign: "center",
            align: "center",
            flex: 2,
            minWidth: 80
        },
        {

            field: "result",
            headerName: "Result",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 120,
            valueFormatter: (params) => `${capitalizeEveryWord(params.value) || ""}`,
            renderCell: ({ row: { result } }) => {
                return (
                    <Box
                        width="60%"
                        m="0 auto"
                        p="5px"
                        display="flex"
                        justifyContent="center"
                        backgroundColor={
                            result === "pass"
                                ? colors.greenAccent[600]
                                : result === "fail"
                                    ? colors.redAccent[700]
                                    : result === "Not Declared Yet"
                                        ? colors.greenAccent[400]
                                        : colors.redAccent[700]
                        }
                        borderRadius="4px"
                    >
                        <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
                            {capitalizeEveryWord(result) || ''}
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
            renderCell: ({ row: { id, student_id, term } }) => {
                return (
                    <Box width="30%"
                        m="0 auto"
                        p="5px"
                        display="flex"
                        justifyContent="center">
                        <Button color="info" variant="contained"
                            onClick={() => handleActionEdit(id, student_id, term)}
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
