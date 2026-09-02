


/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { ActionTypes } from "../constants/action-types";

export const setListingClasses = (classes) => {
    return {
        type: ActionTypes.SET_LISTING_CLASSES,
        payload: classes
    };
};

export const setSchoolClasses = (classes) => {
    return {
        type: ActionTypes.SET_SCHOOL_CLASSES,
        payload: classes
    };
};

export const setTeacherClasses = (classes) => {
    return {
        type: ActionTypes.SET_TEACHER_CLASSES,
        payload: classes
    };
};

export const setAllClasses = (classes) => {
    return {
        type: ActionTypes.SET_All_CLASSES,
        payload: classes
    };
};
