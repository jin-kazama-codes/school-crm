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

export const AmenityAPI = {
    /** Get amenities from the database that meets the specified query parameters
     */
    getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
        const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : '';
        const searchParam = search ? `&search=${search}` : '';
        const { data: response } = await api.request({
            url: `/get-amenities?page=${page}&size=${size}${queryParam}${searchParam}`,
            headers: {
                "x-access-token": getLocalStorage("auth")?.token
            },
            method: "GET",
            signal: cancel && cancelApiObject.getAll ? cancelApiObject.getAll.handleRequestCancellation().signal : undefined,
        });
        return response;
    },

    /** Create amenity in the database
     */
    createAmenity: async (amenity, cancel = false) => {
        return await api.request({
            url: `/create-amenity`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: amenity,
            signal: cancel && cancelApiObject.createAmenity ? cancelApiObject.createAmenity.handleRequestCancellation().signal : undefined,
        });
    },

    /** Update amenity in the database
     */
    updateAmenity: async (fields, cancel = false) => {
        return await api.request({
            url: `/update-amenity`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "PATCH",
            data: fields,
            signal: cancel && cancelApiObject.updateAmenity ? cancelApiObject.updateAmenity.handleRequestCancellation().signal : undefined,
        });
    }
}

// defining the cancel API object for AmenityAPI
const cancelApiObject = defineCancelApiObject(AmenityAPI);
