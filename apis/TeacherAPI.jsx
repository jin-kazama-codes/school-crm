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

export const TeacherAPI = {
  /** Get teachers from the database that meets the specified query parameters
   */
  getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
    const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : '';
    const searchParam = search ? `&search=${search}` : '';
    const { data: response } = await api.request({
      url: `/get-teachers?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token
      },
      method: "GET",
      signal: cancel && cancelApiObject.getAll ? cancelApiObject.getAll.handleRequestCancellation().signal : undefined,
    });
    return response;
  },

  /** Create teacher in the database
   */
  createTeacher: async (teacher, cancel = false) => {
    return await api.request({
      url: `/create-teacher`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "POST",
      data: teacher,
      signal: cancel && cancelApiObject.createTeacher ? cancelApiObject.createTeacher.handleRequestCancellation().signal : undefined,
    });
  },

  /** Update teacher in the database
   */
  updateTeacher: async (fields, cancel = false) => {
    return await api.request({
      url: `/update-teacher`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "PATCH",
      data: fields,
      signal: cancel && cancelApiObject.updateTeacher ? cancelApiObject.updateTeacher.handleRequestCancellation().signal : undefined,
    });
  },

  /** Insert data into teacher_class_subject mapping table in the database
   */
  insertIntoMappingTable: async (data, cancel = false) => {
    return await api.request({
      url: `/create-teacher-class-mapping`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "POST",
      data: data,
      signal: cancel && cancelApiObject.insertIntoMappingTable ? cancelApiObject.insertIntoMappingTable.handleRequestCancellation().signal : undefined,
    });
  },

  /** Get teacher class and section detail from database
   */
  getTeacherDetail: async (teacher_id, cancel = false) => {
    const { data: response } = await api.request({
      url: `/get-teacher-detail/${teacher_id}`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "GET",
      signal: cancel && cancelApiObject.getTeacherDetail ? cancelApiObject.getTeacherDetail.handleRequestCancellation().signal : undefined,
    });
    return response;
  },

  /** delete values from teacher_class_subject mapping table on every update
   */
  deleteFromMappingTable: async (fields, cancel = false) => {
    return await api.request({
      url: `/delete-from-teacher-mapping`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "DELETE",
      data: fields,
      signal: cancel && cancelApiObject.deleteFromMappingTable ? cancelApiObject.deleteFromMappingTable.handleRequestCancellation().signal : undefined,
    });
  }
};

// defining the cancel API object for TeacherAPI
const cancelApiObject = defineCancelApiObject(TeacherAPI);
