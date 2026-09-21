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

export const SectionAPI = {
  /** Get sections from the database that meets the specified query parameters
   */
  getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
    const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : '';
    const searchParam = search ? `&search=${search}` : '';
    const { data: response } = await api.request({
      url: `/get-sections?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token
      },
      method: "GET",
      signal: cancel ? cancelApiObject[this.getAll.name].handleRequestCancellation().signal : undefined,
    });
    return response;
  },

  /** Create section in the database
   */
  createSection: async (section, cancel = false) => {
    return await api.request({
      url: `/create-section`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "POST",
      data: section,
      signal: cancel ? cancelApiObject[this.createSection.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Update section in the database
   */
  updateSection: async (fields, cancel = false) => {
    return await api.request({
      url: `/update-section`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "PATCH",
      data: fields,
      signal: cancel ? cancelApiObject[this.updateSection.name].handleRequestCancellation().signal : undefined,
    });
  },
  getIdByName: async (name, cancel = false) => {
    const { data: response } = await api.request({
      url: `/get-section-by-name/${name}`,
      method: "GET",
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      signal: cancel ? cancelApiObject[this.getClassIds.name].handleRequestCancellation().signal : undefined,
    });
    return response;
  }
};

// defining the cancel API object for SectionAPI
const cancelApiObject = defineCancelApiObject(SectionAPI);
