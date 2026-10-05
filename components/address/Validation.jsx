import * as yup from "yup";

const checkoutSchema = yup.object().shape({
    street: yup.string()
        .trim()
        .min(3, 'Street Address must be at least 3 characters')
        .max(120, 'Street Address is too long')
        .required("This Field is Required"),
    landmark: yup.string()
        .trim()
        .nullable(),
    zipcode: yup.string()
        .trim()
        .required("This Field is Required")
        .matches(/^\d{6}$/, "Postal Code must be a valid 6-digit PIN code"),
    state: yup.mixed()
        .required("This Field is Required")
        .test("valid-state", "This Field is Required", val => val !== 0 && val !== "0" && Boolean(val)),
    city: yup.mixed()
        .required("This Field is Required")
        .test("valid-city", "This Field is Required", val => val !== 0 && val !== "0" && Boolean(val))
});

export default checkoutSchema;
