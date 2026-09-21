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

export const PaymentAPI = {
  /** Get Payments from the database that meets the specified query parameters
   */
  getAll: async (conditionObj = false, page = 0, size = 10, search = false, authInfo, cancel = false) => {
    let queryParam = '';
    if (conditionObj) {
      Object.keys(conditionObj).map(key => {
        queryParam += `&${key}=${conditionObj[key]}`
      })
    }
    const searchParam = search ? `&search=${search}` : '';
    const { data: response } = await api.request({
      url: `/get-payments?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token
      },
      method: "GET",
      signal: cancel && cancelApiObject.getAll ? cancelApiObject.getAll.handleRequestCancellation().signal : undefined,
    });
    return response;
  },

  /** Create Payment in the database
   */
  createPayment: async (payment, cancel = false) => {
    return await api.request({
      url: `/create-payment`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "POST",
      data: payment,
      signal: cancel && cancelApiObject.createPayment ? cancelApiObject.createPayment.handleRequestCancellation().signal : undefined,
    });
  },

  /** Update Payment in the database
   */
  updatePayment: async (fields, cancel = false) => {
    return await api.request({
      url: `/update-payment`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "PATCH",
      data: fields,
      signal: cancel && cancelApiObject.updatePayment ? cancelApiObject.updatePayment.handleRequestCancellation().signal : undefined,
    });
  },

  /** Get Payment data required when creating new payment
   */
  getPaymentData: async (classId, sectionId, cancel = false) => {
    return await api.request({
      url: `/get-payment-data/${classId}/${sectionId}`,
      method: "GET",
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      signal: cancel && cancelApiObject.getPaymentData ? cancelApiObject.getPaymentData.handleRequestCancellation().signal : undefined
    });
  }
};

// defining the cancel API object for PaymentAPI
const cancelApiObject = defineCancelApiObject(PaymentAPI);
