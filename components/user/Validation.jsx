/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import * as yup from "yup";

const phoneRegExp = /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;
const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const checkoutSchema = yup.object().shape({
    username: yup.string()
        .min(2, 'Username is Too Short!')
        .max(50, 'Username is Too Long!')
        .required("This Field is Required"),
    password: yup.string()
        .min(8, 'Password Must Be 8 Characters Long')
        // .matches(/[A-Z]/, 'Password Must Contain At Least 1 Uppercase Letter')
        .matches(/[a-z]/, 'Password Must Contain At Least 1 Lowercase Letter')
        .matches(/[0-9]/, 'Password Must Contain At Least 1 Number')
        .matches(/[^\w]/, 'Password Must Contain At Least 1 Special Character')
        .required("This Field is Required"),
    email: yup.string()
        .matches(emailRegExp, "Email Address is Not Valid"),
    contact_no: yup.string()
        .matches(phoneRegExp, "Phone Number Is Not Valid")
        .required("This Field is Required"),
    gender: yup.string(),
    status: yup.string()
});

export default checkoutSchema;
