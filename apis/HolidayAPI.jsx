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

export const HolidayAPI = {
  /** Get Holidays from the database that meets the specified query parameters
   */
  getAll: async (conditionObj = false, page = 0, size = 5, search = false, authInfo, cancel = false) => {
    const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : '';
    const searchParam = search ? `&search=${search}` : '';
    const { data: response } = await api.request({
      url: `/get-holidays?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token
      },
      method: "GET",
      signal: cancel ? cancelApiObject[this.getAll.name].handleRequestCancellation().signal : undefined,
    });
    return response;
  },

  /** Create Holiday in the database
   */
  createHoliday: async (holiday, cancel = false) => {
    return await api.request({
      url: `/create-holiday`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "POST",
      data: holiday,
      signal: cancel ? cancelApiObject[this.createHoliday.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Update Holiday in the database
   */
  updateHoliday: async (fields, cancel = false) => {
    return await api.request({
      url: `/update-holiday`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "PATCH",
      data: fields,
      signal: cancel ? cancelApiObject[this.updateHoliday.name].handleRequestCancellation().signal : undefined,
    });
  }
};

// defining the cancel API object for HolidayAPI
const cancelApiObject = defineCancelApiObject(HolidayAPI);
