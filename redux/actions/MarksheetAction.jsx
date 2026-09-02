/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { ActionTypes } from "../constants/action-types";

export const setMarksheets = (marksheets) => {
    return {
        type: ActionTypes.SET_MARKSHEETS,
        payload: {
            listData: marksheets.listData,
            loading: marksheets.loading
        }
    };
};

export const setMarksheetClassData = (classDataObj) => {
    return {
        type: ActionTypes.MARKSHEET_CLASSDATA,
        payload: classDataObj
    };
};

// why is this required?
// export const setMarksheetStudents = (students) => ({
//     type:  ActionTypes.MARKSHEET_STUDENTS,
//     payload: students,
//   });
