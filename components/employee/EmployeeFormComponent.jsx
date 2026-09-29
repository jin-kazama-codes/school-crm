/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useFormik } from "formik";
import dayjs from "dayjs";
import { ChevronDown } from "lucide-react";

import employeeValidation from "./Validation";
import config from '../config';

const initialValues = {
    firstname: "",
    lastname: "",
    email: "",
    contact_no: "",
    role: "",
    dob: null,
    gender: "",
    status: "active"
};

const EmployeeFormComponent = ({
    onChange,
    refId,
    setDirty,
    reset,
    setReset,
    updatedValues = null
}) => {
    const [initialState, setInitialState] = useState(initialValues);

    const formik = useFormik({
        initialValues: initialState,
        validationSchema: employeeValidation,
        enableReinitialize: true,
        onSubmit: () => watchForm()
    });

    React.useImperativeHandle(refId, () => ({
        Submit: async () => {
            await formik.submitForm();
        }
    }));

    const watchForm = () => {
        if (onChange) {
            onChange({
                values: formik.values,
                validated: Object.keys(formik.errors).length === 0,
                dirty: formik.dirty
            });
        }
    };

    useEffect(() => {
        if (reset) {
            formik.resetForm();
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        if (formik.dirty) {
            setDirty(true);
        }
    }, [formik.dirty]);

    useEffect(() => {
        if (updatedValues) {
            setInitialState(updatedValues);
        }
    }, [updatedValues]);

    const formatDateForInput = (dateValue) => {
        if (!dateValue) return "";
        return dayjs(dateValue).format('YYYY-MM-DD');
    };

    const handleDateChange = (field, e) => {
        const val = e.target.value;
        formik.setFieldValue(field, val ? dayjs(val) : null);
    };

    const inputClasses =
        "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";

    const selectClasses =
        "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all outline-none text-slate-900 dark:text-slate-100 cursor-pointer appearance-none";

    const labelClasses =
        "block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5";

    const errorClasses = "text-rose-500 text-xs mt-1 ml-0.5 font-medium";

    return (
        <form ref={refId} onSubmit={formik.handleSubmit} className="space-y-6">
            
            {/* ── CARD: Basic Information & Profile ─────────────────────────────── */}
            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Basic Information & Staff Profile
                    </h3>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Employee Identity & Role Parameters
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* First Name */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Firstname*</label>
                        <input
                            type="text"
                            name="firstname"
                            placeholder="Enter first name"
                            autoComplete="new-firstname"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.firstname}
                            className={`${inputClasses} ${
                                formik.touched.firstname && formik.errors.firstname
                                    ? "border-rose-400 ring-1 ring-rose-400"
                                    : ""
                            }`}
                        />
                        {formik.touched.firstname && formik.errors.firstname && (
                            <p className={errorClasses}>{formik.errors.firstname}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Lastname*</label>
                        <input
                            type="text"
                            name="lastname"
                            placeholder="Enter last name"
                            autoComplete="new-lastname"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.lastname}
                            className={`${inputClasses} ${
                                formik.touched.lastname && formik.errors.lastname
                                    ? "border-rose-400 ring-1 ring-rose-400"
                                    : ""
                            }`}
                        />
                        {formik.touched.lastname && formik.errors.lastname && (
                            <p className={errorClasses}>{formik.errors.lastname}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="employee@school.com"
                            autoComplete="new-email"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.email}
                            className={`${inputClasses} ${
                                formik.touched.email && formik.errors.email
                                    ? "border-rose-400 ring-1 ring-rose-400"
                                    : ""
                            }`}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className={errorClasses}>{formik.errors.email}</p>
                        )}
                    </div>

                    {/* Contact Number */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Contact Number*</label>
                        <input
                            type="text"
                            name="contact_no"
                            placeholder="10-digit mobile number"
                            autoComplete="new-contact"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.contact_no}
                            className={`${inputClasses} ${
                                formik.touched.contact_no && formik.errors.contact_no
                                    ? "border-rose-400 ring-1 ring-rose-400"
                                    : ""
                            }`}
                        />
                        {formik.touched.contact_no && formik.errors.contact_no && (
                            <p className={errorClasses}>{formik.errors.contact_no}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Role / Designation</label>
                        <input
                            type="text"
                            name="role"
                            placeholder="e.g., Accountant, Librarian, Lab Assistant"
                            autoComplete="new-role"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.role}
                            className={`${inputClasses} ${
                                formik.touched.role && formik.errors.role
                                    ? "border-rose-400 ring-1 ring-rose-400"
                                    : ""
                            }`}
                        />
                        {formik.touched.role && formik.errors.role && (
                            <p className={errorClasses}>{formik.errors.role}</p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Date Of Birth*</label>
                        <input
                            type="date"
                            name="dob"
                            onBlur={formik.handleBlur}
                            onChange={(e) => handleDateChange("dob", e)}
                            value={formatDateForInput(formik.values.dob)}
                            className={`${inputClasses} ${
                                formik.touched.dob && formik.errors.dob
                                    ? "border-rose-400 ring-1 ring-rose-400"
                                    : ""
                            }`}
                            required
                        />
                        {formik.touched.dob && formik.errors.dob && (
                            <p className={errorClasses}>{formik.errors.dob}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Gender</label>
                        <div className="relative">
                            <select
                                name="gender"
                                value={formik.values.gender}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.gender && formik.errors.gender
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                <option value="" disabled>Select Gender</option>
                                {Object.keys(config.gender).map(item => (
                                    <option key={item} value={item}>{config.gender[item]}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.gender && formik.errors.gender && (
                            <p className={errorClasses}>{formik.errors.gender}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Status</label>
                        <div className="relative">
                            <select
                                name="status"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`${selectClasses} pr-9 ${
                                    formik.touched.status && formik.errors.status
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                            >
                                {Object.keys(config.status).map(item => (
                                    <option key={item} value={item}>{config.status[item]}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {formik.touched.status && formik.errors.status && (
                            <p className={errorClasses}>{formik.errors.status}</p>
                        )}
                    </div>

                </div>
            </div>
        </form>
    );
};

EmployeeFormComponent.propTypes = {
    onChange: PropTypes.func.isRequired,
    refId: PropTypes.any.isRequired, 
    setDirty: PropTypes.func.isRequired,
    reset: PropTypes.bool.isRequired,
    setReset: PropTypes.func.isRequired,
    updatedValues: PropTypes.object  
};

export default EmployeeFormComponent;
