/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import * as yup from "yup";

const phoneRegExp = /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
    registration_no: yup.string()
        .required("This Field is Required"),
    driver: yup.string()
        .required("This Field is Required"),
    driver_contact: yup.string()
        .matches(phoneRegExp, "Phone Number Is Not Valid")
        .required("This Field is Required"),
    driver_license: yup.string()
        .required("This Field is Required"),
    route: yup.string()
        .required("This Field is Required"),
    status: yup.string()
});

export default checkoutSchema;
