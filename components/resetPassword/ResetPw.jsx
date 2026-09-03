import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "@/lib/routerAdapter"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { Eye, EyeOff, KeyRound } from "lucide-react"

import API from "../../apis"
import { Utility } from "../utility"
import Toast from "../common/Toast"
import SignInLoader from "../common/SignInLoader"

import bgImg from "../assets/newbg12.jpeg";

const ResetPassword = () => {
  const toastInfo = useSelector((state) => state.toastInfo)

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 480;
  const isTab = typeof window !== "undefined" && window.innerWidth <= 920;

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

  const validatePassword = (values) => {
    const errors = {}
    if (!values.password) {
      errors.password = "Password is required"
    } else if (!/(?=.*[A-Z])/.test(values.password)) {
      errors.password = "Password must contain at least one capital letter"
    } else if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(values.password)) {
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
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url(${bgImg?.src || bgImg})` }}
      />
      <div className="absolute inset-0 z-0 bg-slate-900/60 backdrop-blur-[2px]" />

      <Toast
        alerting={toastInfo.toastAlert}
        severity={toastInfo.toastSeverity}
        message={toastInfo.toastMessage}
      />

      {/* Main Reset Card Wrapper */}
      <div className="relative z-10 w-full max-w-[420px] p-6 mx-4">
        <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-[26px] shadow-2xl overflow-hidden p-8 flex flex-col border border-white/20 dark:border-white/5">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Create New Password
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center">
              Please enter a strong password for your account.
            </p>
          </div>

          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validate={validatePassword}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ isSubmitting, errors, touched, handleBlur, handleChange, values }) => (
              <Form className="flex flex-col space-y-4">
                
                {/* New Password */}
                <div className="space-y-1">
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 pr-12 rounded-xl border bg-slate-50 dark:bg-[#0f0f0f] focus:outline-none focus:ring-2 transition-all ${
                        touched.password && errors.password 
                          ? "border-red-500 focus:ring-red-500/20" 
                          : "border-slate-200 dark:border-[#2a2a2a] focus:border-emerald-500 focus:ring-emerald-500/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-xs text-red-500 ml-1"
                  />
                </div> 

                {/* Confirm Password */}
                <div className="space-y-1">
                  <div className="relative">
                    <Field
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      className={`w-full px-4 py-3 pr-12 rounded-xl border bg-slate-50 dark:bg-[#0f0f0f] focus:outline-none focus:ring-2 transition-all ${
                        touched.confirmPassword && errors.confirmPassword 
                          ? "border-red-500 focus:ring-red-500/20" 
                          : "border-slate-200 dark:border-[#2a2a2a] focus:border-emerald-500 focus:ring-emerald-500/20"
                      }`}
                    />
                  </div>
                  <ErrorMessage
                    name="confirmPassword"
                    component="p"
                    className="text-xs text-red-500 ml-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full py-3 mt-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/20"
                >
                  {loading === true ? <SignInLoader /> : "Reset Password"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
