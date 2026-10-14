/**
 * Copyright © 2026, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc.
 */

import { ActionTypes } from "../constants/action-types";

const initialQuestionsState = {
  listData: {
    count: 0,
    rows: [],
  },
  loading: false,
};

export const setQuestionsReducer = (state = initialQuestionsState, { type, payload }) => {
  switch (type) {
    case ActionTypes.SET_QUESTIONS:
      return {
        ...state,
        listData: {
          count: payload?.count || (Array.isArray(payload?.listData) ? payload.listData.length : 0),
          rows: Array.isArray(payload?.listData) ? payload.listData : (payload?.rows || []),
        },
        loading: payload?.loading ?? false,
      };
    default:
      return state;
  }
};

const initialExamPapersState = {
  listData: {
    count: 0,
    rows: [],
  },
  loading: false,
};

export const setExamPapersReducer = (state = initialExamPapersState, { type, payload }) => {
  switch (type) {
    case ActionTypes.SET_EXAM_PAPERS:
      return {
        ...state,
        listData: {
          count: payload?.count || (Array.isArray(payload?.listData) ? payload.listData.length : 0),
          rows: Array.isArray(payload?.listData) ? payload.listData : (payload?.rows || []),
        },
        loading: payload?.loading ?? false,
      };
    default:
      return state;
  }
};
