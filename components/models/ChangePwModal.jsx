/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import { useRef, useState } from "react";
import { useNavigate } from "@/lib/routerAdapter";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Formik } from "formik";
import * as Yup from 'yup';

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

    if (!openDialog) return null;

    const inputClasses = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500";
    const labelClasses = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";
    const errorClasses = "text-red-500 text-xs mt-1 ml-1 font-medium";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${formBg?.src || formBg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                }}
            >
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-8">
                        Change Password
                    </h2>

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
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Old Password*</label>
                                        <input
                                            type="password"
                                            name="oldPassword"
                                            ref={oldPasswordRef}
                                            value={values.oldPassword}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`${inputClasses} ${touched.oldPassword && errors.oldPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            placeholder="Enter old password"
                                        />
                                        {touched.oldPassword && errors.oldPassword && (
                                            <p className={errorClasses}>{errors.oldPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClasses}>New Password*</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={values.newPassword}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`${inputClasses} ${touched.newPassword && errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            placeholder="Enter new password"
                                        />
                                        {touched.newPassword && errors.newPassword && (
                                            <p className={errorClasses}>{errors.newPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Confirm New Password*</label>
                                        <input
                                            type="password"
                                            name="confirmNewPassword"
                                            value={values.confirmNewPassword}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`${inputClasses} ${touched.confirmNewPassword && errors.confirmNewPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            placeholder="Confirm new password"
                                        />
                                        {touched.confirmNewPassword && errors.confirmNewPassword && (
                                            <p className={errorClasses}>{errors.confirmNewPassword}</p>
                                        )}
                                    </div>
                                </div>

                                <hr className="border-slate-200 dark:border-slate-700/50 my-6" />

                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={handleDialogClose}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 dark:hover:text-rose-200 border border-rose-200/80 dark:border-rose-500/30 rounded-xl font-semibold shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!dirty || isSubmitting}
                                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 hover:shadow-blue-600/40"
                                    >
                                        Submit
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
        </div>
    );
};

ChangePwModal.propTypes = {
    openDialog: PropTypes.bool,
    setOpenDialog: PropTypes.func
};

export default ChangePwModal;
