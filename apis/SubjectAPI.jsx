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

export const SubjectAPI = {
    /** Get subjects from the database that meets the specified query parameters
     */
    getAll: async (conditionObj = false, page = 0, size = 5, search = false, authInfo, cancel = false) => {
        const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : '';
        const searchParam = search ? `&search=${search}` : '';
        const { data: response } = await api.request({
            url: `/get-subjects?page=${page}&size=${size}${queryParam}${searchParam}`,
            headers: {
                "x-access-token": getLocalStorage("auth")?.token
            },
            method: "GET",
            signal: cancel ? cancelApiObject[this.getAll.name].handleRequestCancellation().signal : undefined,
        });
        return response;
    },

    /** Create subject in the database
     */
    createSubject: async (subject, cancel = false) => {
        return await api.request({
            url: `/create-subject`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: subject,
            signal: cancel ? cancelApiObject[this.createSubject.name].handleRequestCancellation().signal : undefined,
        });
    },

    /** Update subject in the database
     */
    updateSubject: async (fields, cancel = false) => {
        return await api.request({
            url: `/update-subject`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "PATCH",
            data: fields,
            signal: cancel ? cancelApiObject[this.updateSubject.name].handleRequestCancellation().signal : undefined,
        });
    },

    /** getting  subject  by class in the database
     */
    getSubjectsByClass: async (classId, cancel = false) => {
        
        const { data: response } = await api.request({
            url: `/get-subjects-by-class/${classId}`,
            headers: {
                "x-access-token": getLocalStorage("auth")?.token
            },
            method: "GET",
            signal: cancel ? cancelApiObject[this.getSubjectsByClass.name].handleRequestCancellation().signal : undefined,
        });
        return response;
    }
};

// defining the cancel API object for SubjectAPI
const cancelApiObject = defineCancelApiObject(SubjectAPI);
