/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { ActionTypes } from "../constants/action-types";

const initialState = {
    marksheetClassData: {},
    listData: [],
    loading: true,

};

export const setMarksheetsReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.MARKSHEET_CLASSDATA:
            return {
                ...state,
                marksheetClassData: action.payload
            };
        case ActionTypes.SET_MARKSHEETS:
            return {
                ...state,
                listData: action.payload.listData,
                loading: action.payload.loading
            };
        // case ActionTypes.MARKSHEET_STUDENTS:
        //     return {     why is this
        //         ...state,
        //         students: action.payload,
        //     };
        default:
            return state;
    }
};
