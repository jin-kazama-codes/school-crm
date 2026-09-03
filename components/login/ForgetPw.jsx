/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useRef, useState } from "react";
import { Formik } from "formik";
import { Mail } from "lucide-react";
import SignInLoader from "../common/SignInLoader";

const ForgetPassword = ({ Api, isFliped, setIsFliped, dispatch, toastAndNavigate, isMobile, isTab }) => {
    const [loading, setLoading] = useState(false);
    const formikRef = useRef(null);

    const flipCard = () => {
        setIsFliped(!isFliped);
        if (formikRef.current) {
            formikRef.current.resetForm();
            setLoading(false);
        }
    };

    const handleSubmit = (values) => {
        setLoading(true);
        Api.forgotPassword(values)
            .then(res => {
                if (res.status === "Success") {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "info", "Link has been sent to the Email");
                    flipCard();
                } else if (res.status === "User does not exist") {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", "User does not exist");
                }
            })
            .catch(err => console.log('Error in Forget Password API', err));
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-[#1a1a1a] rounded-[26px]">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Forgot Password</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            <Formik
                innerRef={formikRef}
                initialValues={{ email: "" }}
                onSubmit={handleSubmit}
            >
                {({
                    values,
                    errors,
                    dirty,
                    touched,
                    handleBlur,
                    handleChange,
                    handleSubmit
                }) => (
                    <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col space-y-4">
                        <div className="space-y-1">
                            <input
                                required
                                name="email"
                                type="email"
                                placeholder="Enter Email"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.email}
                                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-[#0f0f0f] focus:outline-none focus:ring-2 transition-all ${
                                    errors.email && touched.email 
                                    ? "border-red-500 focus:ring-red-500/20" 
                                    : "border-slate-200 dark:border-[#2a2a2a] focus:border-emerald-500 focus:ring-emerald-500/20"
                                }`}
                            />
                            {errors.email && touched.email && (
                                <p className="text-xs text-red-500 ml-1">{errors.email}</p>
                            )}
                        </div>

                        <button
                            disabled={!dirty || loading}
                            type="submit"
                            className="w-full py-3 mt-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/20"
                        >
                            {loading ? <SignInLoader /> : "Send Reset Link"}
                        </button>
                    </form>
                )}
            </Formik>

            <button 
                onClick={flipCard} 
                className="mt-6 text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
            >
                Back to Login
            </button>
        </div>
    );
};

export default ForgetPassword;
