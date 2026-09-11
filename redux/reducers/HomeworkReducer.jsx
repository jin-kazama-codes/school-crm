/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
*/

import { ActionTypes } from "../constants/action-types";

const initialState = {
    listData: [],
    loading: true
};

export const setHomeworksReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_HOMEWORKS:
            return {
                ...state,
                listData: action.payload.listData,
                loading: action.payload.loading
            };
        default:
            return state;
    }
};
