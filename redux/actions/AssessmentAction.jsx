/**
 * Copyright © 2026, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc.
 */

import { ActionTypes } from "../constants/action-types";

export const setQuestions = (questions) => {
  return {
    type: ActionTypes.SET_QUESTIONS,
    payload: {
      listData: questions?.listData || questions?.rows || [],
      count: questions?.count || (Array.isArray(questions?.listData) ? questions.listData.length : 0),
      loading: questions?.loading ?? false,
    },
  };
};

export const setExamPapers = (papers) => {
  return {
    type: ActionTypes.SET_EXAM_PAPERS,
    payload: {
      listData: papers?.listData || papers?.rows || [],
      count: papers?.count || (Array.isArray(papers?.listData) ? papers.listData.length : 0),
      loading: papers?.loading ?? false,
    },
  };
};
