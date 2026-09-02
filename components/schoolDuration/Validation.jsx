/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import * as yup from "yup";

const checkoutSchema = yup.object().shape({
  period: yup.number().required("This Field is Required"),
  halves: yup.number().required("This Field is Required"),
  recess_time: yup.number().required("This Field is Required"),
  first_half_period_duration: yup.number().required("This Field is Required"),
  second_half_period_duration: yup.number().required("This Field is Required"),
  opening_time: yup.date().required("This Field is Required"),
  closing_time: yup.date().required("This Field is Required"),
});

export default checkoutSchema;
