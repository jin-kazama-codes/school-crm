import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required("Email, Username or Enrollment No is required")
    .test(
      "is-valid-email-or-username",
      "Please enter a valid email or username / enrollment number",
      (value) => {
        if (!value) return false;
        if (value.includes("@")) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        return /^[a-zA-Z0-9_.\-]+$/.test(value) && value.length >= 3;
      }
    ),
  password: yup
    .string()
    .required("Password is required"),
  school_code: yup.string().trim().nullable(),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
});
