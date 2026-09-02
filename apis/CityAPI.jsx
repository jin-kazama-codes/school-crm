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

const { getLocalStorage } = Utility();

export const CityAPI = {
    /** Get cities from the database based on state_id
     */
    getCities: async (parent_id, cancel = false) => {
        const { data: response } = await api.request({
            url: `/get-cities/${parent_id}`,
            method: "GET",
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            signal: cancel ? cancelApiObject[this.getCities.name].handleRequestCancellation().signal : undefined,
        });
        return response;
    },
    getAllCities: async ( cancel = false) => {
        const { data: response } = await api.request({
            url: `/get-all-cities`,
            method: "GET",
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            signal: cancel ? cancelApiObject[this.getCities.name].handleRequestCancellation().signal : undefined,
        });
        return response;
    },

    getIdByName: async (name, cancel = false) => {
        const { data: response } = await api.request({
            url: `/get-city-by-name/${name}`,
            method: "GET",
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            signal: cancel ? cancelApiObject[this.getCityIds.name].handleRequestCancellation().signal : undefined,
        });
        return response;
    },
};

// defining the cancel API object for CityAPI
const cancelApiObject = defineCancelApiObject(CityAPI);
