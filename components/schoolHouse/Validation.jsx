/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
*/

import * as yup from "yup";

const checkoutSchema = yup.object().shape({
    name: yup.string()
        .min(2, 'Name is Too Short!')
        .max(40, 'Name is Too Long!')
        .required("This Field is Required"),
    color_code: yup.string()
        .required("This Field is Required"),
    // captain: yup.number()
    //     .required("This Field is Required"),
    // vice_captain: yup.number()
    //     .required("This Field is Required"),
    teacher_incharge: yup.number()
        .required("This Field is Required"),
    strength: yup.string()
        .required("This Field is Required"),
    status: yup.string()
});

export default checkoutSchema;
