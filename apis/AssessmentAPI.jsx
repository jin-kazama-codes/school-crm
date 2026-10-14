/**
 * Copyright © 2026, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc.
 */

import { api } from "./config/axiosConfig";
import { defineCancelApiObject } from "./config/axiosUtils";
import { Utility } from "../components/utility";

const { getLocalStorage } = Utility();

export const AssessmentAPI = {
  // ─── Question Bank APIs ──────────────────────────────────────────────────
  getAllQuestions: async (conditionObj = false, page = 0, size = 10, search = false, cancel = false) => {
    let queryParam = "";
    if (conditionObj) {
      Object.keys(conditionObj).forEach((key) => {
        if (conditionObj[key] !== undefined && conditionObj[key] !== null && conditionObj[key] !== "") {
          queryParam += `&${key}=${encodeURIComponent(conditionObj[key])}`;
        }
      });
    }
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const { data: response } = await api.request({
      url: `/get-question-bank?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token,
      },
      method: "GET",
      signal: cancel && cancelApiObject.getAllQuestions ? cancelApiObject.getAllQuestions.handleRequestCancellation().signal : undefined,
    });
    return response;
  },

  createQuestion: async (question, cancel = false) => {
    return await api.request({
      url: `/create-question-bank`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token,
      },
      method: "POST",
      data: question,
      signal: cancel && cancelApiObject.createQuestion ? cancelApiObject.createQuestion.handleRequestCancellation().signal : undefined,
    });
  },

  updateQuestion: async (fields, cancel = false) => {
    return await api.request({
      url: `/update-question-bank`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token,
      },
      method: "PATCH",
      data: fields,
      signal: cancel && cancelApiObject.updateQuestion ? cancelApiObject.updateQuestion.handleRequestCancellation().signal : undefined,
    });
  },

  deleteQuestion: async (id, cancel = false) => {
    return await api.request({
      url: `/delete-by-pk/question-bank/${id}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token,
      },
      method: "DELETE",
      signal: cancel && cancelApiObject.deleteQuestion ? cancelApiObject.deleteQuestion.handleRequestCancellation().signal : undefined,
    });
  },

  // ─── Exam Paper APIs ─────────────────────────────────────────────────────
  getAllPapers: async (conditionObj = false, page = 0, size = 10, search = false, cancel = false) => {
    let queryParam = "";
    if (conditionObj) {
      Object.keys(conditionObj).forEach((key) => {
        if (conditionObj[key] !== undefined && conditionObj[key] !== null && conditionObj[key] !== "") {
          queryParam += `&${key}=${encodeURIComponent(conditionObj[key])}`;
        }
      });
    }
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const { data: response } = await api.request({
      url: `/get-exam-paper?page=${page}&size=${size}${queryParam}${searchParam}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token,
      },
      method: "GET",
      signal: cancel && cancelApiObject.getAllPapers ? cancelApiObject.getAllPapers.handleRequestCancellation().signal : undefined,
    });
    return response;
  },

  createPaper: async (paper, cancel = false) => {
    return await api.request({
      url: `/create-exam-paper`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token,
      },
      method: "POST",
      data: paper,
      signal: cancel && cancelApiObject.createPaper ? cancelApiObject.createPaper.handleRequestCancellation().signal : undefined,
    });
  },

  updatePaper: async (fields, cancel = false) => {
    return await api.request({
      url: `/update-exam-paper`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token,
      },
      method: "PATCH",
      data: fields,
      signal: cancel && cancelApiObject.updatePaper ? cancelApiObject.updatePaper.handleRequestCancellation().signal : undefined,
    });
  },

  deletePaper: async (id, cancel = false) => {
    return await api.request({
      url: `/delete-by-pk/exam-paper/${id}`,
      headers: {
        "x-access-token": getLocalStorage("auth")?.token,
      },
      method: "DELETE",
      signal: cancel && cancelApiObject.deletePaper ? cancelApiObject.deletePaper.handleRequestCancellation().signal : undefined,
    });
  },
};

const cancelApiObject = defineCancelApiObject(AssessmentAPI);
