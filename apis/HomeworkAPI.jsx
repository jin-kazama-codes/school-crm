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

export const HomeworkAPI = {
  /** Get Homeworks from the database that meet the specified query parameters */
  getAll: async (conditionObj = false, page = 0, size = 5, search = false, authInfo, cancel = false) => {
    const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : "";
    const searchParam = search ? `&search=${search}` : "";
    const { data: response } = await api.request({
      url: `/homework?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: { "x-access-token": getLocalStorage("auth")?.token },
      method: "GET",
      signal: cancel ? cancelApiObject[HomeworkAPI.getAll.name].handleRequestCancellation().signal : undefined,
    });
    return response;
  },

  /** Create Homework in the database */
  createHomework: async (homework, cancel = false) => {
    return await api.request({
      url: `/homework`,
      headers: { "x-access-token": getLocalStorage("auth").token },
      method: "POST",
      data: homework,
      signal: cancel ? cancelApiObject[HomeworkAPI.createHomework.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Update Homework in the database */
  updateHomework: async (fields, cancel = false) => {
    return await api.request({
      url: `/homework`,
      headers: { "x-access-token": getLocalStorage("auth").token },
      method: "PATCH",
      data: fields,
      signal: cancel ? cancelApiObject[HomeworkAPI.updateHomework.name].handleRequestCancellation().signal : undefined,
    });
  },
};

// defining the cancel API object for HomeworkAPI
const cancelApiObject = defineCancelApiObject(HomeworkAPI);
