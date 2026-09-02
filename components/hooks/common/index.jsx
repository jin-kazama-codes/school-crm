/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Utility } from "../../utility";

export const useCommon = () => {
    const dispatch = useDispatch();
    const selected = useSelector(state => state.menuItems.selected);
    const { getLocalStorage } = Utility();
    const authInfo = getLocalStorage("auth");

    /**
     * Fetches paginated data from an API based on the given parameters.
     *
     * @param {number} page - The page number to fetch (default is 0).
     * @param {number} size - The number of items per page.
     * @param {Function} action - The Redux action creator function to dispatch the result.
     * @param {object} api - The API object with a method named 'getAll'.
     * @param {boolean} condition - Additional condition for the API call (default is false).
     * @param {boolean} search - Flag indicating whether a search is performed (default is false).
     */
    const getPaginatedData = useCallback((page = 0, size, action, api, condition = false, search = false) => {

        api.getAll(condition, page, size, search, authInfo)
            .then(res => {
                if (res.status === 'Success') {
                    dispatch(action({ listData: res.data, loading: false }));
                } else if (res.status === 'Error') {
                    dispatch(action({ listData: [], loading: false }));
                }
            })
            .catch(err => {
                console.error("An error occurred: ", err);
                dispatch(action({ listData: [], loading: false }));
            });
    }, [selected]);



    const getStudents = useCallback((class_id, section_id, setStudents, API) => {
        if (class_id && section_id) {
            const condition = {
                classId: class_id,
                sectionId: section_id
            };
            // call api to get students
            getPaginatedData(0, 40, setStudents, API.StudentAPI, condition);
        }
    }, []);

    return {
        getPaginatedData,
        getStudents
    };
};
