/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { api } from "./config/axiosConfig";
import { defineCancelApiObject } from "./config/axiosUtils";
import { Utility } from "../components/utility";

const { getLocalStorage } = Utility();

export const MarksheetAPI = {
    /** Get marksheet from the database that meets the specified query parameters
     */
    getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
        let queryParam = '';
        if (conditionObj) {
            Object.keys(conditionObj).map(key => {
                queryParam += `&${key}=${conditionObj[key]}`
            })
        }
        const searchParam = search ? `&search=${search}` : '';
        const { data: response } = await api.request({
            url: `/get-marksheet?page=${page}&size=${size}${queryParam}${searchParam}`,
            headers: {
                "x-access-token": getLocalStorage("auth")?.token
            },
            method: "GET",
            signal: cancel && cancelApiObject.getAll ? cancelApiObject.getAll.handleRequestCancellation().signal : undefined,
        });
        return response;
    },

    /** Create marksheet in the database
     */
    createMarksheet: async (marksheet, cancel = false) => {
        return await api.request({
            url: `/create-marksheet`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: marksheet,
            signal: cancel && cancelApiObject.createMarksheet ? cancelApiObject.createMarksheet.handleRequestCancellation().signal : undefined,
        });
    },

    /** Update marksheet in the database
     */
    updateMarksheet: async (fields, cancel = false) => {
        return await api.request({
            url: `/update-marksheet`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "PATCH",
            data: fields,
            signal: cancel && cancelApiObject.updateMarksheet ? cancelApiObject.updateMarksheet.handleRequestCancellation().signal : undefined,
        });
    },
    /** Insert data into marksheet_data mapping table in the database
   */
    insertIntoMappingTable: async (data, cancel = false) => {
        return await api.request({
            url: `/create-marksheet-data`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: data,
            signal: cancel && cancelApiObject.insertIntoMappingTable ? cancelApiObject.insertIntoMappingTable.handleRequestCancellation().signal : undefined,
        });
    },
    /** delete values from marksheet_data mapping table on every update
   */
    deleteFromMappingTable: async (fields, cancel = false) => {
        return await api.request({
            url: `/delete-from-marksheet-mapping`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "DELETE",
            data: fields,
            signal: cancel && cancelApiObject.deleteFromMappingTable ? cancelApiObject.deleteFromMappingTable.handleRequestCancellation().signal : undefined,
        });
    },

    /** get marksheet data from marksheet data table  */
    getMarksheetData: async (marksheet_id, cancel = false) => {
        const { data: response } = await api.request({
            url: `/get-marksheet-data/${marksheet_id}`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "GET",
            signal: cancel && cancelApiObject.getMarksheetData ? cancelApiObject.getMarksheetData.handleRequestCancellation().signal : undefined,
        });
        return response;
    }
};

// defining the cancel API object for marksheetAPI
const cancelApiObject = defineCancelApiObject(MarksheetAPI);
