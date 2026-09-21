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

export const GenerateIdCardAPI = {
  /** Get students from the database that meets the specified query parameters
   */
  getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
    // Send the data that is used in where condition
    let queryParam = '';
    if (conditionObj) {
      Object.keys(conditionObj).map(key => {
        queryParam += `&${key}=${conditionObj[key]}`
      })
    }
    // Send the data that is used in listing page search
    const searchParam = search ? `&search=${search}` : '';

    const { data: response } = await api.request({
      url: `/get-students-for-idcard?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token
      },
      method: "GET",
      signal: cancel ? cancelApiObject[this.getAll.name].handleRequestCancellation().signal : undefined
    });
    return response;
  }

  
};

// defining the cancel API object for GenerateIdCardAPI
const cancelApiObject = defineCancelApiObject(GenerateIdCardAPI);
