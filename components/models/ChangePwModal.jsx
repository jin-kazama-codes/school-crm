/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Formik } from "formik";
import * as Yup from 'yup';
import { X, Key, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

import API from "../../apis";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import { Utility } from "../utility";
import formBg from "../assets/formBg.png";

const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: ""
};

const sequentialChars = ['123', '234', '345', '456', '567', '678', '789', '890', 'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz'];

const validationSchema = Yup.object({
    oldPassword: Yup.string().required('Old Password is required'),
    newPassword: Yup.string()
        .min(8, 'Password Must Be 8 Characters Long')
        .matches(/[A-Z]/, 'Password Must Contain At Least 1 Uppercase Letter')
        .matches(/[a-z]/, 'Password Must Contain At Least 1 Lowercase Letter')
        .matches(/[0-9]/, 'Password Must Contain At Least 1 Number')
        .matches(/[^\w]/, 'Password Must Contain At Least 1 Special Character')
        .test('no-sequential-chars', 'Avoid Sequential Characters In The Password', (value) => {
            for (const seq of sequentialChars) {
                if (value.includes(seq) || value.includes(seq.toUpperCase())) {
                    return false;
                }
            }
            return true;
        })
        .required("This Field is Required"),
    confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm New Password is required')
});

const ChangePwModal = ({ openDialog, setOpenDialog }) => {
    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const [loading, setLoading] = useState(false);
    const [showOldPw, setShowOldPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const oldPasswordRef = useRef(null);
    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const toastInfo = useSelector(state => state.toastInfo);
    const { toastAndNavigate } = Utility();

    const handleFormSubmit = (values, { setFieldError, setSubmitting }) => {
        if (values.oldPassword && values.newPassword && values.confirmNewPassword) {
            setLoading(true);

            API.UserAPI.changeUserPw(values)
                .then(({ data: response }) => {
                    setLoading(false);
                    if (response.status === 'Success') {
                        if (response.data === 'Old Password do not match') {
                            setFieldError('oldPassword', response.data);
                            setSubmitting(false);
                            toastAndNavigate(dispatch, true, "info", response.data);
                            if (oldPasswordRef.current) oldPasswordRef.current.focus();
                        } else if (response.data === 'User does not exist') {
                            toastAndNavigate(dispatch, true, "info", response.data);
                        } else if (response.data.includes('Updated Successfully')) {
                            toastAndNavigate(dispatch, true, "info", response.data);
                            setTimeout(() => {
                                handleDialogClose();
                                navigateTo(0);
                            }, 2000);
                        }
                    } else {
                        toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    toastAndNavigate(dispatch, true, "error", err ? err.response?.data?.msg : "An Error Occurred");
                });
        }
    };

    if (!openDialog || typeof document === "undefined") return null;

    const inputClasses = "w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#121212] border rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-2 transition-all";
    const labelClasses = "block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5";
    const errorClasses = "text-rose-500 text-xs mt-1 ml-0.5 font-medium";

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-xl bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-slate-100 dark:border-[#222] overflow-hidden animate-in zoom-in-95 duration-200 relative"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.94)), url(${formBg?.src || formBg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                }}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleDialogClose}
                    className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer z-10"
                    title="Close Dialog"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 sm:p-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200/80 dark:border-slate-800">
                        <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                Change Password
                            </h2>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                Ensure your account stays protected with a strong password
                            </p>
                        </div>
                    </div>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleFormSubmit}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            dirty,
                            isSubmitting,
                            handleBlur,
                            handleChange,
                            handleSubmit
                        }) => (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-4">
                                    {/* Old Password */}
                                    <div>
                                        <label className={labelClasses}>Current Password*</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type={showOldPw ? "text" : "password"}
                                                name="oldPassword"
                                                ref={oldPasswordRef}
                                                value={values.oldPassword}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={`${inputClasses} ${touched.oldPassword && errors.oldPassword ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                                                placeholder="Enter current password"
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOldPw(!showOldPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                                                tabIndex={-1}
                                            >
                                                {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {touched.oldPassword && errors.oldPassword && (
                                            <p className={errorClasses}>{errors.oldPassword}</p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClasses}>New Password*</label>
                                            <div className="relative">
                                                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                <input
                                                    type={showNewPw ? "text" : "password"}
                                                    name="newPassword"
                                                    value={values.newPassword}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={`${inputClasses} ${touched.newPassword && errors.newPassword ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                                                    placeholder="Enter new password"
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPw(!showNewPw)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                                                    tabIndex={-1}
                                                >
                                                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {touched.newPassword && errors.newPassword && (
                                                <p className={errorClasses}>{errors.newPassword}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClasses}>Confirm Password*</label>
                                            <div className="relative">
                                                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                <input
                                                    type={showConfirmPw ? "text" : "password"}
                                                    name="confirmNewPassword"
                                                    value={values.confirmNewPassword}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={`${inputClasses} ${touched.confirmNewPassword && errors.confirmNewPassword ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 dark:border-[#333] focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                                                    placeholder="Confirm new password"
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                                                    tabIndex={-1}
                                                >
                                                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {touched.confirmNewPassword && errors.confirmNewPassword && (
                                                <p className={errorClasses}>{errors.confirmNewPassword}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={handleDialogClose}
                                        className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-pointer shadow-2xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!dirty || isSubmitting}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <Key className="w-3.5 h-3.5" />
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </div>
            
            {loading && <Loader />}
            
            <Toast
                alerting={toastInfo.toastAlert}
                severity={toastInfo.toastSeverity}
                message={toastInfo.toastMessage}
            />
        </div>,
        document.body
    );
};

ChangePwModal.propTypes = {
    openDialog: PropTypes.bool,
    setOpenDialog: PropTypes.func
};

export default ChangePwModal;
