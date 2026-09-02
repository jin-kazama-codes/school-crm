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
    firstname: yup.string()
        .min(2, 'Firstname is Too Short!')
        .max(20, 'Firstname is Too Long!')
        .required("This Field is Required"),
    lastname: yup.string()
        .min(2, 'Lastname is Too Short!')
        .max(20, 'Lastname is Too Long!')
        .required("This Field is Required"),
    email: yup.string()
        .matches(emailRegExp, "Email Address is Not Valid")
        .required("This Field is Required"),
    contact_no: yup.string()
        .matches(phoneRegExp, "Phone Number Is Not Valid")
        .required("This Field is Required"),
    classes: yup.array().min(1, "At least 1 Class is Required")
        .required("required"),
    sections: yup.array().min(1, "At least 1 section is Required")
        .required("required")

});

export default checkoutSchema;
