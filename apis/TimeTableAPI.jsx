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

export const TimeTableAPI = {
    /** Get TimeTable from the database that meets the specified query parameters
     */
    getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
        let queryParam = '';
        if (conditionObj) {
          if (conditionObj.key && conditionObj.value !== undefined) {
            queryParam += `&${conditionObj.key}=${conditionObj.value}`;
          } else {
            Object.keys(conditionObj).forEach(key => {
              if (conditionObj[key] !== undefined && conditionObj[key] !== null && conditionObj[key] !== false) {
                queryParam += `&${key}=${conditionObj[key]}`;
              }
            });
          }
        }
        const searchParam = search ? `&search=${search}` : '';
        const { data: response } = await api.request({
            url: `/get-time-tables?page=${page}&size=${size}${queryParam}${searchParam}`,
            headers: {
                "x-access-token": getLocalStorage("auth")?.token
            },
            method: "GET",
            signal: cancel && cancelApiObject.getAll ? cancelApiObject.getAll.handleRequestCancellation().signal : undefined
        });
        return response;
    },

    /** Create TimeTable in the database
     */
    createTimeTable: async (timeTable, cancel = false) => {
        return await api.request({
            url: `/create-time-table`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: timeTable,
            signal: cancel && cancelApiObject.createTimeTable ? cancelApiObject.createTimeTable.handleRequestCancellation().signal : undefined
        });
    },

    /** Update TimeTable in the database
     */
    updateTimeTable: async (fields, cancel = false) => {
        return await api.request({
            url: `/update-time-table`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "PATCH",
            data: fields,
            signal: cancel && cancelApiObject.updateTimeTable ? cancelApiObject.updateTimeTable.handleRequestCancellation().signal : undefined
        });
    }
}

// defining the cancel API object for  updateTimeTableAPI
const cancelApiObject = defineCancelApiObject(TimeTableAPI);
