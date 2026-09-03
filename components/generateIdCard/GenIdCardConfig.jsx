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
import { Eye, FileEdit } from 'lucide-react';

import API from "../../apis";

import { setAllClasses, setSchoolClasses } from "../../redux/actions/ClassAction";
import { setAllSections, setSchoolSections } from "../../redux/actions/SectionAction";
import { Utility } from "../utility";

export const datagridColumns = (rolePriority = null, setOpen = null) => {
    const schoolClasses = useSelector(state => state.schoolClasses);
    const allClasses = useSelector(state => state.allClasses);
    const schoolSections = useSelector(state => state.schoolSections);
    const allSections = useSelector(state => state.allSections);

    const dispatch = useDispatch();
    const navigateTo = useNavigate();
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
            valueGetter: (value) => value?.split("/").pop(), // for export
            renderCell: (params) => (
                <div className="flex justify-center items-center w-full h-full p-2">
                    <img
                        src={params.row.student_image} // use params.row.student_image for the image URL
                        alt="No Image Found"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                </div>
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
            valueGetter: (value, row) => `${capitalizeEveryWord(row.firstname) || ''} ${capitalizeEveryWord(row.lastname)|| ''}`
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
            valueFormatter: (value) => transformClassSection(value),
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
            valueFormatter: (value) => `${formatDate(value)}`
        },
        {
            field: 'address',
            headerName: 'Address',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 150,
            valueGetter: formatAddress,
        }
    ];
    return columns;
};
