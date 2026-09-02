/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import * as yup from "yup";

const checkoutSchema = yup.object({
    street: yup.string()
        .min(4, 'Too Short!')
        .max(80, 'Too Long!')
        .matches(/^[a-zA-Z].*[a-zA-Z.,\-_=+\s]*$/, 'Invalid Street Name Detected')
        .required("This Field is Required"),
    landmark: yup.string()
        .min(4, 'Too Short!')
        .max(80, 'Too Long!')
        .matches(/[a-z]/, 'Invalid Landmark Detected'),
    zipcode: yup.string()
        .min(4, 'Too Short!')
        .max(20, 'Too Long!')
        .matches(/[0-9]/, 'Invalid Zipcode Detected')
        .required("This Field is Required"),
    state: yup.number()
        .required("This Field is Required"),
    city: yup.number()
        .required("This Field is Required")
});

export default checkoutSchema;
