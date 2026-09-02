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
    const { fetchAndSetAll, fetchAndSetSchoolData, getLocalStorage, capitalizeEveryWord, formatDate } = Utility();

    function formatAddress(params) {
        const { street, landmark, state_name, city_name, zipcode } = params?.row || {};
        return [street, landmark, state_name, city_name, zipcode].filter(Boolean).join(", ");
    }    

    function transformClassSection(value) {
        if (typeof value !== 'string') return value;
    
        const specials = {
            "Nursery": "Nursery",
            "Pre-K": "Pre-K"
            // Add more special cases as needed
        };
    
        const parts = value.split(' ');
        if (parts.length !== 2) return value;
    
        const [number, section] = parts;
        let suffix;
    
        if (specials[number]) {
            return `${specials[number]} ${section}`;
        } else {
            switch (number) {
                case '1':
                    suffix = 'st';
                    break;
                case '2':
                    suffix = 'nd';
                    break;
                case '3':
                    suffix = 'rd';
                    break;
                default:
                    suffix = 'th';
                    break;
            }
    
            return `${number}${suffix} ${section}`;
        }
    }
    
    

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
            field: "school_name",
            headerName: "School Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
        },
        {
            field: 'student_image',
            headerName: 'Student Img',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 150,
            valueGetter: (params) => params.value?.split("/").pop(), // for export
            renderCell: (params) => (
                <img
                    src={params.row.student_image} // use params.row.student_image for the image URL
                    alt="No Image Found"
                    style={{ width: '100px', height: '100px' }}
                />
            ),
        },
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
            field: "father_name",
            headerName: "Father Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
        },
        {
            field: "mother_name",
            headerName: "Mother Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150
        },
        {
            field: "class_section",
            headerName: "Class",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 200,
            valueFormatter: (params) => transformClassSection(params.value),
        },
        {
            field: "contact_no",
            headerName: "Phone No.",
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
            field: 'address',
            headerName: 'Address',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 150,
            valueGetter: formatAddress,
        },
       
        // {
        //     field: "action",
        //     headerName: "Action",
        //     headerAlign: "center",
        //     align: "center",
        //     flex: 1,
        //     minWidth: 100,
        //     renderCell: ({ row: { id } }) => {
        //         return (
        //             <Box width="85%"
        //                 m="0 auto"
        //                 p="5px"
        //                 display="flex"
        //                 justifyContent="space-around">

        //                 {/* {rolePriority !== 1 &&
        //                     <Button color="info" variant="contained"
        //                         onClick={() => handleActionEdit(id)}
        //                         sx={{ minWidth: "50px" }}
        //                     >
        //                         <DriveFileRenameOutlineOutlinedIcon />
        //                     </Button>} */}

        //                 <Button color="info" variant="contained"
        //                     onClick={() => handleActionShow(id)}
        //                     sx={{ minWidth: "50px" }}
        //                 >
        //                     <PreviewIcon />
        //                 </Button>
        //             </Box>
        //         );
        //     }
        // }
    ];
    return columns;
};
