/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import { ActionTypes } from "../constants/action-types";

export const setNoticeBoard = (notices) => {
    return {
        type: ActionTypes.SET_NOTICES,
        payload: notices
    };
};
