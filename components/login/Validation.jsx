import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .trim()
    .required("Password is required")
    .min(8, "Password Must Be 8 Characters Long")
    .max(20, "Password cannot be more than 20 characters")
    .matches(/[A-Z]/, "Password Must Contain At Least 1 Uppercase Letter")
    .matches(/[a-z]/, "Password Must Contain At Least 1 Lowercase Letter")
    .matches(/[0-9]/, "Password Must Contain At Least 1 Number")
    .matches(/[^\w]/, "Password Must Contain At Least 1 Special Character"),
  school_code: yup.string().trim().nullable(),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
});
