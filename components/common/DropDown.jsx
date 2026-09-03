/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/
import { useDispatch, useSelector } from "react-redux";
import { useCommon } from "../hooks/common";
import { Utility } from "../utility";

//change name of dropdown to classsecdropdown
function DropDown({ marksheetClass = null, marksheetSection = null }) {
    const formClassesInRedux = useSelector(state => state.schoolClasses);
    const formSectionsInRedux = useSelector(state => state.schoolSections);

    const dispatch = useDispatch();
    const { getStudents } = useCommon();
    const { customSort, createUniqueDataArray, findById, setLocalStorage } = Utility();

    return (
        <div className="flex gap-4 mx-2">
            <div className="min-w-[120px]">
                {/* 
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <select className="w-full h-11 px-3 py-2 bg-blue-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Class</option>
                </select>
                */}
            </div>
            <div className="min-w-[120px]">
                {/*
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <select className="w-full h-11 px-3 py-2 bg-green-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select Section</option>
                </select>
                */}
            </div>
        </div>
    )
}

export default DropDown;
