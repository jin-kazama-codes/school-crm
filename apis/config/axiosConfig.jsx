/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import axios from "axios";
import { Utility } from "../../components/utility";

const { getLocalStorage } = Utility();

export const api = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1` : '/api/v1',
  validateStatus: (status) => (status >= 200 && status < 300) || status == 404
});

// defining a custom error handler for all APIs
const errorHandler = (error) => {
  const statusCode = error.response?.status;

  // logging only errors that are not 401
  if (statusCode && statusCode !== 401) {
    throw error;
  }

  return Promise.reject(error);
};

// registering the custom error handler to the
// "api" axios instance
api.interceptors.response.use(undefined, (error) => {
  return errorHandler(error);
});

//ask for token and school header on every request made
api.interceptors.request.use(req => {
  req.headers['Type'] = "school-admin";
  const currentSchoolInfo = getLocalStorage("schoolInfo");
  if (currentSchoolInfo) {
    req.headers['School'] = JSON.stringify(currentSchoolInfo);
  } else {
    delete req.headers['School'];
  }

  return req;
});
