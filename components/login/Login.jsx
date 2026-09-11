/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "@/lib/routerAdapter"
import { Formik } from "formik"
import ReactCardFlip from "react-card-flip"
import { Lock, Eye, EyeOff } from "lucide-react"

import API from "../../apis"
import Toast from "../common/Toast"
import SignInLoader from "../common/SignInLoader"
import { Utility } from "../utility"
import ForgetPassword from "./ForgetPw"

import bgImg from "../assets/newbg12.jpeg";

const initialValues = {
  school_code: "",
  email: "",
  password: "",
}

const ENV = process.env

const Login = () => {
  const [formData, setFormData] = useState(initialValues)
  const [showPassword, setShowPassword] = useState(false)
  const [isFliped, setIsFliped] = useState(false)
  const [loading, setLoading] = useState(false)
  const toastInfo = useSelector(state => state.toastInfo)

  const dispatch = useDispatch()
  const formikRef = useRef(null)

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 480;
  const isTab = typeof window !== "undefined" && window.innerWidth <= 920;

  const {
    getLocalStorage,
    remLocalStorage,
    setLocalStorage,
    toastAndNavigate,
  } = Utility()

  useEffect(() => {
    if (typeof window !== "undefined" && getLocalStorage("auth")?.token) {
      window.location.href = "/";
    }
  }, []);

  const flipCard = () => {
    setIsFliped(!isFliped);
    if (formikRef.current) {
      formikRef.current.resetForm();
      setLoading(false);
    }
  }

  useEffect(() => {
    if (formData.school_code || (formData.email && formData.password)) {
      setLoading(true)
      API.UserAPI.login(formData)
        .then(({ data: response }) => {
          setLoading(false)
          if (
            response.status === "Success" &&
            (response.data === "User does not exist" ||
              response.data === "Username and Password do not match")
          ) {
            toastAndNavigate(dispatch, true, "info", response?.data)
          } else if (
            response.status === "Success" &&
            (response.data === "School Code must be specified" ||
              response.data === "School code is incorrect")
          ) {
            toastAndNavigate(dispatch, true, "info", response?.data)
          } else {
            const authInfo = {
              id: response.data.id,
              school_code: formData.school_code,
              token: response.data.token,
              role: response.data.role,
              designation: response.data.designation,
              username: response.data.username,
              school: response.data.school_name,
              school_capacity: response.data.school_capacity,
            }
            setLocalStorage("auth", authInfo);
            if (response.data?.role) {
              const numRole = Number(response.data.role);
              if (!isNaN(numRole)) {
                setLocalStorage("userRole", { name: response.data.designation || response.data.role, priority: numRole });
              }
            }
            if (response.data?.school_info) {
              setLocalStorage("schoolInfo", response.data.school_info);
            }
            const targetPath = getLocalStorage("navigatedPath") || "/";
            remLocalStorage("navigatedPath");
            window.location.href = targetPath;
          }
        })
        .catch((err) => {
          setLoading(false)
          initialValues.password = ""
          toastAndNavigate(dispatch, true, "error", err?.message)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData])

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

      {/* Main Login Card Wrapper */}
      <div className="relative z-10 w-full max-w-[420px] p-6 mx-4">
        <ReactCardFlip flipDirection="horizontal" isFlipped={isFliped}>
          {/* Front: Login Form */}
          <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-[26px] shadow-2xl overflow-hidden p-8 flex flex-col border border-white/20 dark:border-white/5">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {ENV.NEXT_PUBLIC_COMPANY_NAME || "School CRM"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Sign in to your account
              </p>
            </div>

            <Formik
              innerRef={formikRef}
              onSubmit={(values) => setFormData(values)}
              initialValues={initialValues}
            >
              {({
                values,
                errors,
                touched,
                dirty,
                handleBlur,
                handleChange,
                handleSubmit
              }) => (
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                  {/* School Code */}
                  <div className="space-y-1">
                    <input
                      name="school_code"
                      type="text"
                      placeholder="School Code"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.school_code}
                      className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-[#0f0f0f] focus:outline-none focus:ring-2 transition-all ${touched.school_code && errors.school_code
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-[#2a2a2a] focus:border-emerald-500 focus:ring-emerald-500/20"
                        }`}
                    />
                    {touched.school_code && errors.school_code && (
                      <p className="text-xs text-red-500 ml-1">{errors.school_code}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="space-y-1">
                    <input
                      required
                      name="email"
                      type="text"
                      placeholder="Username / Email"
                      autoComplete="username"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.email}
                      className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-[#0f0f0f] focus:outline-none focus:ring-2 transition-all ${touched.email && errors.email
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-[#2a2a2a] focus:border-emerald-500 focus:ring-emerald-500/20"
                        }`}
                    />
                    {touched.email && errors.email && (
                      <p className="text-xs text-red-500 ml-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        required
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        autoComplete="current-password"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.password}
                        className={`w-full px-4 py-3 pr-12 rounded-xl border bg-slate-50 dark:bg-[#0f0f0f] focus:outline-none focus:ring-2 transition-all ${touched.password && errors.password
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
                    {touched.password && errors.password && (
                      <p className="text-xs text-red-500 ml-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={flipCard}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    disabled={!dirty || loading}
                    type="submit"
                    className="w-full py-3 mt-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    {loading ? <SignInLoader /> : "Sign In"}
                  </button>
                </form>
              )}
            </Formik>
          </div>

          {/* Back: Forgot Password */}
          <div className="w-full h-full">
            <ForgetPassword
              Api={API.UserAPI}
              isFliped={isFliped}
              setIsFliped={setIsFliped}
              dispatch={dispatch}
              toastAndNavigate={toastAndNavigate}
              isMobile={isMobile}
              isTab={isTab}
            />
          </div>
        </ReactCardFlip>
      </div>
    </div>
  )
}

export default Login
