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

export const NoticeBoardAPI = {
  /** Get NoticeBoard Details from the database that meets the specified query parameters
   */
  getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
    const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : '';
    const searchParam = search ? `&search=${search}` : '';
    const { data: response } = await api.request({
      url: `/get-noticeboarddetails?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token
      },
      method: "GET",
      signal: cancel && cancelApiObject.getAll ? cancelApiObject.getAll.handleRequestCancellation().signal : undefined,
    });
    return response;
  },

  /** Create noticeboard in the database
   */
  createNoticeBoard: async (noticeboard, cancel = false) => {
    return await api.request({
      url: `/create-notice`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "POST",
      data: noticeboard,
      signal: cancel && cancelApiObject.createNoticeBoard ? cancelApiObject.createNoticeBoard.handleRequestCancellation().signal : undefined,
    });
  },

  /** Update noticeboard in the database
   */
  updateNoticeBoard: async (fields, cancel = false) => {
    return await api.request({
      url: `/update-notice`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "PATCH",
      data: fields,
      signal: cancel && cancelApiObject.updateNoticeBoard ? cancelApiObject.updateNoticeBoard.handleRequestCancellation().signal : undefined,
    });
  }
};

// defining the cancel API object for NoticeBoardAPI
const cancelApiObject = defineCancelApiObject(NoticeBoardAPI);
