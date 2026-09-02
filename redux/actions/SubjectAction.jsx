/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { ActionTypes } from "../constants/action-types";

export const setListingSubjects = (subjects) => {
    return {
        type: ActionTypes.SET_LISTING_SUBJECTS,
        payload: subjects
    };
};

export const setSchoolSubjects = (subjects) => {
    return {
        type: ActionTypes.SET_SCHOOL_SUBJECTS,
        payload: subjects
    };
};

export const setTeacherSubjects = (subjects) => {
    return {
        type: ActionTypes.SET_TEACHER_SUBJECTS,
        payload: subjects
    };
};

export const setAllSubjects = (subjects) => {
    return {
        type: ActionTypes.SET_ALL_SUBJECTS,
        payload: subjects
    };
};
