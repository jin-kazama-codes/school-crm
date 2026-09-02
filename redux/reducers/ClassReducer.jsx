/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { ActionTypes } from "../constants/action-types";

const initialListingState = {
    listData: [],
    loading: true
};

const initialSchoolState = {
    listData: []
};

const initialState = {
    listData: []
};

export const setListingClassesReducer = (state = initialListingState, action) => {
    switch (action.type) {
        case ActionTypes.SET_LISTING_CLASSES:
            return {
                ...state,
                listData: action.payload.listData,
                loading: action.payload.loading
            };
        default:
            return state;
    }
};

export const setSchoolClassesReducer = (state = initialSchoolState, action) => {
    switch (action.type) {
        case ActionTypes.SET_SCHOOL_CLASSES:
            return {
                ...state,
                listData: action.payload
            };
        default:
            return state;
    }
};

export const setTeacherClassesReducer = (state = initialSchoolState, action) => {
    switch (action.type) {
        case ActionTypes.SET_TEACHER_CLASSES:
            return {
                ...state,
                listData: action.payload
            };
        default:
            return state;
    }
};

export const setAllClassesReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_All_CLASSES:
            return {
                ...state,
                listData: action.payload
            };
        default:
            return state;
    }
};
