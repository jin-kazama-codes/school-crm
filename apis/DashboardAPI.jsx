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

export const DashboardAPI = {
    /** Get the user from the specific table
     */
    getDashboardCount: async (table, cancel = false) => {
        const { data: response } = await api.request({
            url: `/get-dashboard-count/${table}`,
            method: "GET",
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            signal: cancel ? cancelApiObject[this.getCountries.name].handleRequestCancellation().signal : undefined
        });
        return response;
    },
    /** Get the student graph data
     */
    getStudentGraphData: async ( cancel = false) => {
        const { data: response } = await api.request({
            url: `/get-student-graph-data`,
            method: "GET",
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            signal: cancel ? cancelApiObject[this.getStudentGraphData.name].handleRequestCancellation().signal : undefined
        });
        return response;
    }
};

// defining the cancel API object for DashboardAPI
const cancelApiObject = defineCancelApiObject(DashboardAPI);
