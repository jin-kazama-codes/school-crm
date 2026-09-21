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

export const UserRoleAPI = {
    /** Get user roles from the database that meets the specified query parameters
     */
    getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
        const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : '';
        const searchParam = search ? `&search=${search}` : '';
        const { data: response } = await api.request({
            url: `/get-user-roles?page=${page}&size=${size}${queryParam}${searchParam}`,
            headers: {
                "x-access-token": getLocalStorage("auth")?.token
            },
            method: "GET",
            signal: cancel && cancelApiObject.getAll ? cancelApiObject.getAll.handleRequestCancellation().signal : undefined,
        });
        return response;
    },

    /** Create user role in the database
     */
    createUserRole: async (userRole, cancel = false) => {
        return await api.request({
            url: `/create-user-role`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: userRole,
            signal: cancel && cancelApiObject.createUserRole ? cancelApiObject.createUserRole.handleRequestCancellation().signal : undefined,
        });
    },

    /** Update user role in the database
     */
    updateUserRole: async (fields, cancel = false) => {
        return await api.request({
            url: `/update-user-role`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "PATCH",
            data: fields,
            signal: cancel && cancelApiObject.updateUserRole ? cancelApiObject.updateUserRole.handleRequestCancellation().signal : undefined,
        });
    },

    /** Get role name and priority by role id from the database
     */
    getRoleById: async (id, cancel = false) => {
        const token = getLocalStorage("auth")?.token;
        if (token) {
            const { data: response } = await api.request({
                url: `/get-role-by-id`,
                headers: {
                    "x-access-token": getLocalStorage("auth").token
                },
                method: "POST",
                data: id,
                signal: cancel && cancelApiObject.getRoleById ? cancelApiObject.getRoleById.handleRequestCancellation().signal : undefined,
            });
            return response;
        } else {
            return { status: false };
        }
    }
};

// defining the cancel API object for UserRoleAPI
const cancelApiObject = defineCancelApiObject(UserRoleAPI);
