/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import * as yup from "yup";

const checkoutSchema = yup.object().shape({
    academic_year: yup.string()
        .min(2, 'Year is Too Short!')
        .max(12, 'Year is Too Long!')
        .required("This Field is Required"),
    fee: yup.string()
        .required("This Field is Required"),
    type: yup.string()
        .required("This Field is Required"),
    method: yup.string()
        .required("This Field is Required"),
    amount: yup.number()
        .required("This Field is Required")
});

export default checkoutSchema;
