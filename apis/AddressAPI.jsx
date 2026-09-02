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

export const AddressAPI = {
  /** Get the address from the database based on parent information
   */
  getAddress: async (parent, parent_id, cancel = false) => {
    const { data: response } = await api.request({
      url: `/get-address/${parent}/${parent_id}`,
      method: "GET",
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      signal: cancel ? cancelApiObject[this.getAddress.name].handleRequestCancellation().signal : undefined,
    });
    return response;
  },

  /** Create address in the database 
  */
  createAddress: async (address, cancel = false) => {
    return await api.request({
      url: `/create-address`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "POST",
      data: address,
      signal: cancel ? cancelApiObject[this.createAddress.name].handleRequestCancellation().signal : undefined,
    });
  },

  /** Update address in the database
   */
  updateAddress: async (fields, cancel = false) => {
    return await api.request({
      url: `/update-address`,
      headers: {
        "x-access-token": getLocalStorage("auth").token
      },
      method: "PATCH",
      data: fields,
      signal: cancel ? cancelApiObject[this.updateAddress.name].handleRequestCancellation().signal : undefined,
    });
  }
};

// defining the cancel API object for AddressAPI
const cancelApiObject = defineCancelApiObject(AddressAPI);
