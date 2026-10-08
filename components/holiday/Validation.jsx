/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import * as yup from "yup";

const checkoutSchema = yup.object().shape({
  title: yup
    .string()
    .min(2, "Title is too short")
    .max(100, "Title is too long")
    .required("This Field is Required"),
  startDate: yup.mixed()
    .required("This Field is Required"),
  endDate: yup.mixed()
    .required("This Field is Required"),
  type: yup.string()
    .required("This Field is Required"),
});

export default checkoutSchema;
