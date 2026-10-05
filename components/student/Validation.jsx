import * as yup from "yup";

export const phoneRegExp = /^[6-9]\d{9}$/;
export const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
export const aadhaarRegExp = /^\d{12}$/;

const checkoutSchema = yup.object().shape({
    session: yup.string()
        .required("This Field is Required"),
    firstname: yup.string()
        .trim()
        .min(2, 'Firstname must be at least 2 characters')
        .max(50, 'Firstname is too long')
        .required("This Field is Required"),
    lastname: yup.string()
        .trim()
        .min(2, 'Lastname must be at least 2 characters')
        .max(50, 'Lastname is too long')
        .required("This Field is Required"),
    contact_no: yup.string()
        .trim()
        .required("This Field is Required")
        .matches(phoneRegExp, "Must be a valid 10-digit mobile number starting with 6-9"),
    email: yup.string()
        .trim()
        .required("This Field is Required")
        .matches(emailRegExp, "Email Address is not valid"),
    aadhaar_no: yup.string()
        .trim()
        .required("This Field is Required")
        .matches(aadhaarRegExp, "Aadhaar number must be exactly 12 digits"),
    class: yup.mixed()
        .required("This Field is Required")
        .test("class-required", "This Field is Required", val => Boolean(val)),
    section: yup.mixed()
        .required("This Field is Required")
        .test("section-required", "This Field is Required", val => Boolean(val)),
    dob: yup.mixed()
        .required("This Field is Required")
        .test("dob-required", "This Field is Required", val => Boolean(val))
        .test("dob-min-age", "", function (value) {
            if (!value) return false;
            const date = new Date(value);
            if (isNaN(date.getTime())) return false;
            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
            return date <= tenYearsAgo;
        }),
    admission_date: yup.mixed()
        .required("This Field is Required")
        .test("adm-date-required", "This Field is Required", val => Boolean(val))
        .test("adm-date-not-future", "Admission date cannot be in the future", function (value) {
            if (!value) return true;
            const date = new Date(value);
            if (isNaN(date.getTime())) return false;
            return date <= new Date();
        }),
    admission_type: yup.string()
        .required("This Field is Required"),
    subjects: yup.array()
        .min(1, "At least one enrolled subject is required")
        .required("This Field is Required"),
    mother_name: yup.string()
        .trim()
        .min(2, "Mother's Name must be at least 2 characters")
        .max(50, "Mother's Name is too long")
        .required("This Field is Required"),
    mother_contact_no: yup.string()
        .trim()
        .required("This Field is Required")
        .matches(phoneRegExp, "Mother contact must be a valid 10-digit mobile number"),
    mother_aadhar: yup.string()
        .trim()
        .required("This Field is Required")
        .matches(aadhaarRegExp, "Mother Aadhaar must be exactly 12 digits"),
    father_name: yup.string()
        .trim()
        .min(2, "Father's Name must be at least 2 characters")
        .max(50, "Father's Name is too long")
        .required("This Field is Required"),
    father_contact_no: yup.string()
        .trim()
        .required("This Field is Required")
        .matches(phoneRegExp, "Father contact must be a valid 10-digit mobile number"),
    father_aadhar: yup.string()
        .trim()
        .required("This Field is Required")
        .matches(aadhaarRegExp, "Father Aadhaar must be exactly 12 digits"),
    guardian_contact_no: yup.string()
        .trim()
        .nullable()
        .test("guardian-phone", "Guardian contact must be a valid 10-digit mobile number", val => !val || phoneRegExp.test(val)),
    guardian_aadhar: yup.string()
        .trim()
        .nullable()
        .test("guardian-aadhar", "Guardian Aadhaar must be exactly 12 digits", val => !val || aadhaarRegExp.test(val))
});

export default checkoutSchema;
