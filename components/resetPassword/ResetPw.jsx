import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { TextField, Button, IconButton, InputAdornment, useMediaQuery } from "@mui/material"
import { useNavigate, useParams } from "@/lib/routerAdapter"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { Visibility, VisibilityOff } from "@mui/icons-material"

import API from "../../apis"
import { Utility } from "../utility"
import Toast from "../common/Toast"
import SignInLoader from "../common/SignInLoader"

import bgImg from "../assets/newbg12.jpeg";

const ResetPassword = () => {
  const toastInfo = useSelector((state) => state.toastInfo)

  const isMobile = useMediaQuery("(max-width:480px)")
  const isTab = useMediaQuery("(max-width:920px)")

  const { token } = useParams()
  const { verifyToken, toastAndNavigate, getLocalStorage } = Utility()
  const navigateTo = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    if (getLocalStorage("auth")?.token) {
      verifyToken().then((result) => {

        if (!result) {
          toastAndNavigate(dispatch, true, "info", "Not a valid token.", navigateTo, `/login`);
        }
        localStorage.clear()
      })
    }
  }, [getLocalStorage("auth")?.token])

  // setLocalStorage("reset-password-token", token);

  const validatePassword = (values) => {
    const errors = {}
    if (!values.password) {
      errors.password = "Password is required"
    } else if (!/(?=.*[A-Z])/.test(values.password)) {
      errors.password = "Password must contain at least one capital letter"
    } else if (
      !/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(values.password)
    ) {
      errors.password = "Password must contain at least one special character"
    } else if (!/(?=.*\d)/.test(values.password)) {
      errors.password = "Password must contain at least one number"
    }

      if (!values.confirmPassword) {
        errors.confirmPassword = "Please confirm your password"
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match"
      }

      return errors
    }

    const handleSubmit = (values) => {
      setLoading(true)
      API.UserAPI.resetPassword({ token, password: values.password })
        .then((res) => {
          if (res.status === "Success") {
            toastAndNavigate(
              dispatch,
              true,
              "info",
              "Password is Reset Successfully",
              navigateTo,
              `/login`
            )
          }
        })
        .catch((err) => console.log(err))
    }

    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${bgImg?.src || bgImg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        height: "99.9vh",
        width: "100vw",
        color: "#f5f5f5"
      }}>
        <div style={{ backgroundColor: "rgb(114 171 237)", padding: "50px", borderRadius: "20px", width: "60vh" }}>
          <h4 style={{ color: "white" }}>Create New Password</h4>
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validate={validatePassword}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ isSubmitting }) => (
              <Form>
                <div style={{ marginBottom: 16 }}>
                  <Field
                    as={TextField}
                    type={showPassword ? "text" : "password"}
                    label="New Password"
                    placeholder="Enter Password"
                    autoComplete="new-password"
                    fullWidth
                    variant="filled"
                    name="password"
                    sx={{ backgroundColor: "#E9F1FA", borderRadius: "30px", overflow: "hidden" }}
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    style={{ color: "red" }}
                  />
                </div> 
                <div style={{ marginBottom: 16 }}>
                  <Field
                    as={TextField}
                    type={showPassword ? "text" : "password"}
                    label="Confirm Password"
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    fullWidth
                    variant="filled"
                    name="confirmPassword"
                    sx={{ backgroundColor: "#E9F1FA", borderRadius: "30px", overflow: "hidden" }}
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    style={{ color: "red" }}
                  />
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    color: "#F6F6F2",
                    display: "block",
                    mt: "2px",
                    minWidth: isMobile
                      ? "170px"
                      : isTab
                        ? "200px"
                        : "200px",
                    backgroundColor: "#FF9A01",
                    borderRadius: 28,
                  }}
                >
                  {loading === true ? <SignInLoader /> : "Submit"}
                </Button>
              </Form>
            )}
          </Formik>
          <Toast
            alerting={toastInfo.toastAlert}
            severity={toastInfo.toastSeverity}
            message={toastInfo.toastMessage}
          />
        </div>
      </div>
    )
  }

  export default ResetPassword
