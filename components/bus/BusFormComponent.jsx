/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright © 2023, School CRM Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of School CRM Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with School CRM.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { Bus, User, Phone, FileText, IdCard, MapPin, ChevronDown } from "lucide-react";

import BusValidation from "./Validation";
import config from "../config";

const initialValues = {
    registration_no: "",
    driver: "",
    driver_contact: "",
    driver_license: "",
    conductor: "",
    conductor_contact: "",
    conductor_aadhaar: "",
    route: "",
    status: "active"
};

const BusFormComponent = ({
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
        validationSchema: BusValidation,
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

    const inputClasses =
        "w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";

    const selectClasses =
        "w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#2e2e2e] rounded-xl shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4)] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none text-slate-900 dark:text-slate-100 cursor-pointer appearance-none";

    const labelClasses =
        "block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5";

    const errorClasses = "text-rose-500 text-xs mt-1 ml-0.5 font-medium";

    return (
        <form ref={refId} onSubmit={formik.handleSubmit} className="space-y-6">
            
            {/* ── CARD: Bus Details & Vehicle Information ───────────────────────── */}
            <div className="bg-white/95 dark:bg-[#161616]/90 border border-slate-200/90 dark:border-[#262626] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)] p-5 md:p-6 transition-all duration-200">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#222]">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Bus Details & Crew Information
                    </h3>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Vehicle registration, transit route, driver and conductor details
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Registration Number */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Registration Number*</label>
                        <div className="relative">
                            <Bus className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="registration_no"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.registration_no}
                                className={`${inputClasses} ${
                                    formik.touched.registration_no && formik.errors.registration_no
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="e.g., UP-32-AB-1234"
                            />
                        </div>
                        {formik.touched.registration_no && formik.errors.registration_no && (
                            <p className={errorClasses}>{formik.errors.registration_no}</p>
                        )}
                    </div>

                    {/* Route */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Route*</label>
                        <div className="relative">
                            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="route"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.route}
                                className={`${inputClasses} ${
                                    formik.touched.route && formik.errors.route
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="e.g., City Center to Campus"
                            />
                        </div>
                        {formik.touched.route && formik.errors.route && (
                            <p className={errorClasses}>{formik.errors.route}</p>
                        )}
                    </div>

                    {/* Driver Name */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Driver Name*</label>
                        <div className="relative">
                            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="driver"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.driver}
                                className={`${inputClasses} ${
                                    formik.touched.driver && formik.errors.driver
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="Driver full name"
                            />
                        </div>
                        {formik.touched.driver && formik.errors.driver && (
                            <p className={errorClasses}>{formik.errors.driver}</p>
                        )}
                    </div>

                    {/* Driver Contact */}
                    <div>
                        <label className={labelClasses}>Driver Contact*</label>
                        <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="driver_contact"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.driver_contact}
                                className={`${inputClasses} ${
                                    formik.touched.driver_contact && formik.errors.driver_contact
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="+91..."
                            />
                        </div>
                        {formik.touched.driver_contact && formik.errors.driver_contact && (
                            <p className={errorClasses}>{formik.errors.driver_contact}</p>
                        )}
                    </div>

                    {/* Driver License */}
                    <div>
                        <label className={labelClasses}>Driver License*</label>
                        <div className="relative">
                            <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="driver_license"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.driver_license}
                                className={`${inputClasses} ${
                                    formik.touched.driver_license && formik.errors.driver_license
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="License ID"
                            />
                        </div>
                        {formik.touched.driver_license && formik.errors.driver_license && (
                            <p className={errorClasses}>{formik.errors.driver_license}</p>
                        )}
                    </div>

                    {/* Conductor Name */}
                    <div className="lg:col-span-2">
                        <label className={labelClasses}>Conductor Name*</label>
                        <div className="relative">
                            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="conductor"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.conductor}
                                className={`${inputClasses} ${
                                    formik.touched.conductor && formik.errors.conductor
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="Conductor full name"
                            />
                        </div>
                        {formik.touched.conductor && formik.errors.conductor && (
                            <p className={errorClasses}>{formik.errors.conductor}</p>
                        )}
                    </div>

                    {/* Conductor Contact */}
                    <div>
                        <label className={labelClasses}>Conductor Contact*</label>
                        <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="conductor_contact"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.conductor_contact}
                                className={`${inputClasses} ${
                                    formik.touched.conductor_contact && formik.errors.conductor_contact
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="+91..."
                            />
                        </div>
                        {formik.touched.conductor_contact && formik.errors.conductor_contact && (
                            <p className={errorClasses}>{formik.errors.conductor_contact}</p>
                        )}
                    </div>

                    {/* Conductor Aadhaar */}
                    <div>
                        <label className={labelClasses}>Conductor Aadhaar*</label>
                        <div className="relative">
                            <IdCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                name="conductor_aadhaar"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.conductor_aadhaar}
                                className={`${inputClasses} ${
                                    formik.touched.conductor_aadhaar && formik.errors.conductor_aadhaar
                                        ? "border-rose-400 ring-1 ring-rose-400"
                                        : ""
                                }`}
                                placeholder="12-digit Aadhaar"
                            />
                        </div>
                        {formik.touched.conductor_aadhaar && formik.errors.conductor_aadhaar && (
                            <p className={errorClasses}>{formik.errors.conductor_aadhaar}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-4">
                        <label className={labelClasses}>Status</label>
                        <div className="relative max-w-xs">
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
                                {Object.keys(config.status).map((item) => (
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

BusFormComponent.propTypes = {
    onChange: PropTypes.func,
    refId: PropTypes.shape({
        current: PropTypes.any,
    }),
    setDirty: PropTypes.func,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    updatedValues: PropTypes.object,
};

export default BusFormComponent;
