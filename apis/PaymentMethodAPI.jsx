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

export const PaymentMethodAPI = {
    /** Get payment methods from the database that meets the specified query parameters
     */
    getAll: async (conditionObj = false, page = 0, size = 5, search = false, authInfo, cancel = false) => {
        const queryParam = conditionObj ? `&${conditionObj.key}=${conditionObj.value}` : '';
        const searchParam = search ? `&search=${search}` : '';
        const { data: response } = await api.request({
            url: `/get-payment-methods?page=${page}&size=${size}${queryParam}${searchParam}`,
            headers: {
                "x-access-token": getLocalStorage("auth")?.token
            },
            method: "GET",
            signal: cancel ? cancelApiObject[this.getAll.name].handleRequestCancellation().signal : undefined
        });
        return response;
    },

    /** Create payment method in the database
     */
    createPaymentMethod: async (PaymentMethod, cancel = false) => {
        return await api.request({
            url: `/create-payment-method`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "POST",
            data: PaymentMethod,
            signal: cancel ? cancelApiObject[this.createPaymentMethod.name].handleRequestCancellation().signal : undefined
        });
    },

    /** Update Payment method in the database
     */
    updatePaymentMethod: async (fields, cancel = false) => {
        return await api.request({
            url: `/update-payment-method`,
            headers: {
                "x-access-token": getLocalStorage("auth").token
            },
            method: "PATCH",
            data: fields,
            signal: cancel ? cancelApiObject[this.updatePaymentMethod.name].handleRequestCancellation().signal : undefined
        });
    }
}

// defining the cancel API object for PaymentMethodAPI
const cancelApiObject = defineCancelApiObject(PaymentMethodAPI);
