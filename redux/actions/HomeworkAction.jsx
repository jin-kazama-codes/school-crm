/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
*/

import { ActionTypes } from "../constants/action-types";

export const setHomeworks = (homeworks) => {
    return {
        type: ActionTypes.SET_HOMEWORKS,
        payload: homeworks
    };
};
