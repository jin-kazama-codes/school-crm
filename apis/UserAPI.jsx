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

export const UserAPI = {
  /** Login user after verification
   */
  login: async (loginInfo, cancel = false) => {
    return await api.request({
      url: `/login`,
      method: "POST",
      data: loginInfo,
      signal: cancel
        ? cancelApiObject[this.login.name].handleRequestCancellation().signal
        : undefined,
    });
  },

  /** Get user profile from the database
   */
  profile: async (cancel = false) => {
    return await api.request({
      url: `/profile`,
      headers: {
        "x-access-token": getLocalStorage("auth").token,
      },
      method: "GET",
      signal: cancel
        ? cancelApiObject[this.profile.name].handleRequestCancellation().signal
        : undefined,
    });
  },

  /** Get users from the database that meets the specified query parameters
   */
  getAll: async (
    conditionObj = false,
    page = 0,
    size = 5,
    search = false,
    authInfo,
    cancel = false
  ) => {
    const queryParam = conditionObj
      ? `&${conditionObj.key}=${conditionObj.value}`
      : "";
    const searchParam = search ? `&search=${search}` : "";
    const { data: response } = await api.request({
      url: `/get-users?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token,
      },
      method: "GET",
      signal: cancel
        ? cancelApiObject[this.getAll.name].handleRequestCancellation().signal
        : undefined,
    });
    return response;
  },

  /** Register user in the database
   */
  register: async (user, cancel = false) => {
    return await api.request({
      url: `/register`,
      headers: {
        "x-access-token": getLocalStorage("auth").token,
      },
      method: "POST",
      data: user,
      signal: cancel
        ? cancelApiObject[this.register.name].handleRequestCancellation().signal
        : undefined,
    });
  },

  /** Update user in the database
   */
  update: async (fields, cancel = false) => {
    return await api.request({
      url: `/update-user`,
      headers: {
        "x-access-token": getLocalStorage("auth").token,
      },
      method: "PATCH",
      data: fields,
      signal: cancel
        ? cancelApiObject[this.update.name].handleRequestCancellation().signal
        : undefined,
    });
  },

  /** Change user password
   */
  changeUserPw: async (fields, cancel = false) => {
    return await api.request({
      url: `/change-password`,
      headers: {
        "x-access-token": getLocalStorage("auth").token,
      },
      method: "POST",
      data: fields,
      signal: cancel
        ? cancelApiObject[this.changeUserPw.name].handleRequestCancellation()
          .signal
        : undefined,
    });
  },

  forgotPassword: async (fields, cancel = false) => {
    const { data: response } = await api.request({
      url: `/forgot-password`,
      method: "POST",
      data: fields,
      signal: cancel
        ? cancelApiObject[this.forgotPassword.name].handleRequestCancellation()
          .signal
        : undefined,
    });
    return response;
  },

  resetPassword: async (fields, cancel = false) => {

    const { data: response } = await api.request({
      url: `/reset-password`,
      headers: {
        "x-access-token": getLocalStorage("reset-password-token"),
      },
      method: "POST",
      data: fields,
      signal: cancel
        ? cancelApiObject[this.resetPassword.name].handleRequestCancellation()
          .signal
        : undefined
    });
    
    return response;
  },
};

// defining the cancel API object for UserAPI
const cancelApiObject = defineCancelApiObject(UserAPI);
