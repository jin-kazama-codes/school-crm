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

export const SchoolAPI = {
  /** Get schools from the database that meets the specified query parameters
   */
  getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
    const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : '';
    const searchParam = search ? `&search=${search}` : '';
    const { data: response } = await api.request({
      url: `/get-schools?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token
      },
      method: "GET",
      signal: cancel ? cancelApiObject[this.getAll.name].handleRequestCancellation().signal : undefined
    });
    return response;
  },

  /** Create school in the database
   */
  createSchool: async (school, cancel = false) => {
    return await api.request({
      url: `/create-school`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "POST",
      data: school,
      signal: cancel ? cancelApiObject[this.createSchool.name].handleRequestCancellation().signal : undefined
    });
  },

  /** Update school in the database
   */
  updateSchool: async (fields, cancel = false) => {
    return await api.request({
      url: `/update-school`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "PATCH",
      data: fields,
      signal: cancel ? cancelApiObject[this.updateSchool.name].handleRequestCancellation().signal : undefined
    });
  },

  /** Insert data into school_class_section_subject mapping table in the database
    */
  insertIntoMappingTable: async (data, cancel = false) => {
    return await api.request({
      url: `/create-school-class-mapping`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "POST",
      data: data,
      signal: cancel ? cancelApiObject[this.insertIntoMappingTable.name].handleRequestCancellation().signal : undefined
    });
  },

  /** Get school class and section detail from database
   */
  getSchoolClasses: async (school_id, cancel = false) => {
    const { data: response } = await api.request({
      url: `/get-school-classes`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "GET",
      params: getLocalStorage("auth")?.role === 1 ? { school_id: school_id } : null,    //this is included in backend req.query
      signal: cancel ? cancelApiObject[this.getSchoolClasses.name].handleRequestCancellation().signal : undefined
    });
    return response;
  },

   /** Get school class and section detail from database
   */
   getTeacherClasses: async (school_id, cancel = false) => {
    const { data: response } = await api.request({
      url: `/get-teacher-classes`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "GET",
      params: getLocalStorage("auth")?.role === 1 ? { school_id: school_id } : null,    //this is included in backend req.query
      signal: cancel ? cancelApiObject[this.getSchoolClasses.name].handleRequestCancellation().signal : undefined
    });
    return response;
  },

  /** delete values from school_class_section_subject mapping table on every update
   */
  deleteFromMappingTable: async (fields, cancel = false) => {
    return await api.request({
      url: `/delete-from-school-mapping`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "DELETE",
      data: fields,
      signal: cancel ? cancelApiObject[this.deleteFromMappingTable.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Get school details for idCard
   */
  getDetailsForICard: async (cancel = false) => {
    const { data: response } = await api.request({
      url: 'get-icard-details',
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "GET",
      signal: cancel ? cancelApiObject[this.getDetailsForICard.name].handleRequestCancellation().signal : undefined
    });
    return response;
  }
};

// defining the cancel API object for SchoolAPI
const cancelApiObject = defineCancelApiObject(SchoolAPI);
