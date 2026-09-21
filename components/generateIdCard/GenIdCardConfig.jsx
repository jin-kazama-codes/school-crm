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
        const { street, landmark, city_name, state_name, zipcode } = params?.row || {};
        const parts = [street, landmark, city_name, state_name, zipcode].filter(Boolean);
        return parts.length ? parts.join(", ") : "—";
    }    

    function transformClassSection(value) {
        if (!value || typeof value !== 'string') return value || "—";
    
        const parts = value.trim().split(/\s+/);
        if (parts.length < 2) return value;
    
        const [cls, ...secParts] = parts;
        const section = secParts.join(' ');
        if (/^\d+$/.test(cls)) {
            const n = parseInt(cls, 10);
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            const suffix = s[(v - 20) % 10] || s[v] || s[0];
            return `${n}${suffix} ${section}`;
        }
        return `${cls} ${section}`;
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
            minWidth: 160,
            valueFormatter: (value) => value || "—",
        },
        {
            field: 'student_image',
            headerName: 'Student Img',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 120,
            valueGetter: (value) => value?.split("/").pop() || "", // for export
            renderCell: (params) => {
                const img = params?.row?.student_image;
                const initials = `${(params?.row?.firstname?.[0] || '').toUpperCase()}${(params?.row?.lastname?.[0] || '').toUpperCase()}` || 'S';
                return (
                    <div className="flex justify-center items-center w-full h-full p-1.5">
                        {img ? (
                            <img
                                src={img}
                                alt="Student"
                                className="w-10 h-10 rounded-full object-cover border border-emerald-500/30 shadow-sm"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextElementSibling) {
                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }
                                }}
                            />
                        ) : null}
                        <div
                            style={{ display: img ? 'none' : 'flex' }}
                            className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 items-center justify-center font-bold text-xs tracking-wider border border-emerald-500/30 shadow-sm select-none"
                        >
                            {initials}
                        </div>
                    </div>
                );
            },
        },
        {
            field: "fullname",
            headerName: "Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            valueGetter: (value, row) => `${capitalizeEveryWord(row.firstname) || ''} ${capitalizeEveryWord(row.lastname)|| ''}`.trim() || "—"
        },
        {
            field: "father_name",
            headerName: "Father Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            valueFormatter: (value) => value || "—",
        },
        {
            field: "mother_name",
            headerName: "Mother Name",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            valueFormatter: (value) => value || "—",
        },
        {
            field: "class_section",
            headerName: "Class",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 150,
            valueFormatter: (value) => transformClassSection(value),
        },
        {
            field: "contact_no",
            headerName: "Phone No.",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 140,
            valueFormatter: (value) => value || "—",
        },
        {
            field: "dob",
            headerName: "Date of Birth",
            headerAlign: "center",
            align: "center",
            flex: 1,
            minWidth: 140,
            valueFormatter: (value) => (value ? `${formatDate(value)}` : "—"),
        },
        {
            field: 'address',
            headerName: 'Address',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 200,
            valueGetter: formatAddress,
        }
    ];
    return columns;
};
