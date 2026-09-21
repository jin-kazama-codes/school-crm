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

export const ClassAPI = {
    /** Get classes from the database that meets the specified query parameters
     */
    getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
        const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : '';
        const searchParam = search ? `&search=${search}` : '';
        const { data: response } = await api.request({
            url: `/get-classes?page=${page}&size=${size}${queryParam}${searchParam}`,
            headers: {
                "x-access-token": getLocalStorage("auth")?.token
            },
            method: "GET",
            signal: cancel && cancelApiObject.getAll ? cancelApiObject.getAll.handleRequestCancellation().signal : undefined,
        });
        return response;
    },

    /** Create class in the database
     */
    createClass: async (classs, cancel = false) => {
        return await api.request({
            url: `/create-class`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: classs,
            signal: cancel && cancelApiObject.createClass ? cancelApiObject.createClass.handleRequestCancellation().signal : undefined,
        });
    },

    /** Update class in the database
     */
    updateClass: async (fields, cancel = false) => {
        return await api.request({
            url: `/update-class`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "PATCH",
            data: fields,
            signal: cancel && cancelApiObject.updateClass ? cancelApiObject.updateClass.handleRequestCancellation().signal : undefined,
        });
    },

    /** Get class and section list by joining 2 tables from the database
     */
    getClassSectionList: async (cancel = false) => {
        const { data: response } = await api.request({
            url: `/get-class-section-list`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "GET",
            signal: cancel && cancelApiObject.getClassSectionList ? cancelApiObject.getClassSectionList.handleRequestCancellation().signal : undefined,
        });
        return response;
    },

    getIdByName: async (name, cancel = false) => {
        const { data: response } = await api.request({
            url: `/get-class-by-name/${name}`,
            method: "GET",
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            signal: cancel && cancelApiObject.getIdByName ? cancelApiObject.getIdByName.handleRequestCancellation().signal : undefined,
        });
        return response;
    },
};

// defining the cancel API object for ClassAPI
const cancelApiObject = defineCancelApiObject(ClassAPI);
