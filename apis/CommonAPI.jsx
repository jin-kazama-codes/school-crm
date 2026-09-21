/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { api } from "./config/axiosConfig";
import { defineCancelApiObject } from "./config/axiosUtils";
import { Utility } from "../components/utility";

export const CommonAPI = {
    /** method like GET/POST for network request, true if header and cancel signal is false
     */
    commonConfig: (method, header, cancel = false) => {
        const { getLocalStorage } = Utility();
        const commonConfig = {
            method: method,
            signal: cancel && cancelApiObject.commonConfig ? cancelApiObject.commonConfig.handleRequestCancellation().signal : undefined,
        }
        if (header) {
            commonConfig.headers = {
                "x-access-token": getLocalStorage("auth")?.token
            }
        }
        return commonConfig;
    },

    /** Verify the authenticity of the provided token
     */
    verifyToken: async (cancel = false) => {
        const { getLocalStorage } = Utility();
        if (!getLocalStorage("auth")?.token) {
            return false;
        }
        const commonConfig = CommonAPI.commonConfig("GET", true, cancel);
        try {
            const { data: response } = await api.request({
                url: `/verify-token`,
                ...commonConfig
            });
            // Check for error conditions in the response
            if (response.status === 401) {
                throw new Error('Unauthorized: Token verification failed');
            } else if (response.status === 500) {
                throw new Error('Internal Server Error: Token verification failed');
            }
            return response;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error('Unauthorized: Token verification failed');
            } else if (error.response && error.response.status === 500) {
                console.error('Internal Server Error: Token verification failed');
            } else {
                console.error('Unexpected error in verifyToken:', error);
            }
        }
    },

    /** Get the user from the specific table
    */
    getByPk: async (id, table, cancel = false) => {
        const commonConfig = CommonAPI.commonConfig("GET", false, cancel);
        const { data: response } = await api.request({
            url: `/get-by-pk/${table}/${id}`,
            ...commonConfig
        });
        return response;
    },

    /** provide paths for multiple API calls & this function will make the request object 
     */
    multipleAPICall: async (method, paths, dataFields = [], cancel = false) => {
        const commonConfig = CommonAPI.commonConfig(method, true, cancel);
        const promises = dataFields.length ? paths.map((path, index) =>
            api.request({
                url: path,
                data: dataFields[index],
                ...commonConfig
            })) :
            paths.map(path => api.request({
                url: path,
                ...commonConfig
            }));

        return Promise.all(promises)
            .then(responses => {
                return responses;
            })
            .catch(err => {
                throw err;
            });
    },

    /** Api that connects to backend and return encrypted text and iv
     */
    encryptText: async (text, cancel = false) => {
        const commonConfig = CommonAPI.commonConfig("POST", true, cancel);
        const { data: response } = await api.request({
            url: '/encrypt-text',
            data: text,
            ...commonConfig
        });
        return response;
    },

    /** Api that connects to backend and return decrypted text
     */
    decryptText: async (fields, cancel = false) => {
        const commonConfig = CommonAPI.commonConfig("POST", true, cancel);
        const { data: response } = await api.request({
            url: '/decrypt-text',
            data: fields,
            ...commonConfig
        });
        return response;
    },
    createOrUpdate: async (fields, table, condition, cancel = false) => {
        const commonConfig = CommonAPI.commonConfig("POST", true, cancel);
        const { data: response } = await api.request({
            url: '/create-or-update',
            data: {
                ...fields,
                table: table,
                condition: condition
            },
            ...commonConfig
        });
        return response;
    },
};

// defining the cancel API object for CommonAPI
const cancelApiObject = defineCancelApiObject(CommonAPI);
