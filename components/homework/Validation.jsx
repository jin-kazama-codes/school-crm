/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 */

import * as Yup from "yup";

const homeworkValidation = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string(),
    class_id: Yup.string().required("Class is required"),
    section_id: Yup.string().required("Section is required"),
    subject_id: Yup.string().required("Subject is required"),
    status: Yup.string().required("Status is required"),
});

export default homeworkValidation;
