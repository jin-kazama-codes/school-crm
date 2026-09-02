/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import * as yup from "yup";

const checkoutSchema = yup.object().shape({
    day: yup.string()
        .required("This Field is Required"),
    class: yup.number()
        .required("This Field is Required"),
    section: yup.number()
        .required("This Field is Required"),
    batch: yup.string()
        .required("This Field is Required")
});

export default checkoutSchema;
