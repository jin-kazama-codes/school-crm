/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { ActionTypes } from "../constants/action-types";

const initialState = {
    toastAlert: false,
    toastSeverity: "",
    toastMessage: ""
};

export const displayToastReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.DISPLAY_TOAST:
            return {
                ...state,
                toastAlert: action.payload.toastAlert,
                toastSeverity: action.payload.toastSeverity,
                toastMessage: action.payload.toastMessage
            };
        default:
            return state;
    }
};
